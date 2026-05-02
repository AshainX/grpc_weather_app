"""
gRPC Weather Service implementation using OpenWeatherMap API
"""

import grpc
import requests
import time
from datetime import datetime
import weather_pb2, weather_pb2_grpc
import os


class WeatherServicer(weather_pb2_grpc.WeatherServiceServicer):
    def __init__(self, api_key: str):
        # Priority: 1. Constructor arg, 2. Environment variable
        self.api_key = api_key or os.environ.get('OPENWEATHERMAP_API_KEY')
        if not self.api_key:
            raise ValueError("OpenWeatherMap API key not provided. Set OPENWEATHERMAP_API_KEY environment variable.")
        self.base_url = "https://api.openweathermap.org/data/2.5"

    def _make_request(self, endpoint: str, params: dict) -> dict:
        """Make request to OpenWeatherMap API"""
        params["appid"] = self.api_key
        params["units"] = "metric"  # Use Celsius
        try:
            response = requests.get(f"{self.base_url}/{endpoint}", params=params, timeout=10)
            data = response.json()
            # /weather returns cod as int, /forecast returns it as string — normalize
            cod = str(data.get('cod', ''))
            if response.status_code == 401 or cod == '401':
                raise grpc.RpcError("Invalid API key. Please set your OpenWeatherMap API key in weather_service.py or OPENWEATHERMAP_API_KEY environment variable.")
            if cod != '200':
                raise grpc.RpcError(f"API error: {data.get('message', 'Unknown error')}")
            return data
        except grpc.RpcError:
            raise
        except requests.exceptions.RequestException as e:
            raise grpc.RpcError(f"API request failed: {str(e)}")

    def GetCurrentWeather(self, request, context):
        """Get current weather for a city"""
        # Try with country code first if provided
        try:
            if request.country_code:
                params = {"q": f"{request.city},{request.country_code}"}
                data = self._make_request("weather", params)
            else:
                data = self._make_request("weather", {"q": request.city})
        except Exception:
            # Try without country code as fallback
            try:
                data = self._make_request("weather", {"q": request.city})
            except Exception:
                context.abort(grpc.StatusCode.NOT_FOUND, f"City not found: {request.city}")

        return weather_pb2.WeatherResponse(
            city=data["name"],
            country=data["sys"]["country"],
            temperature=data["main"]["temp"],
            feels_like=data["main"]["feels_like"],
            humidity=data["main"]["humidity"],
            description=data["weather"][0]["description"],
            icon=data["weather"][0]["icon"],
            wind_speed=data["wind"]["speed"],
            pressure=data["main"]["pressure"],
            sunrise=data["sys"]["sunrise"],
            sunset=data["sys"]["sunset"],
            timezone=str(data["timezone"])
        )

    def GetForecast(self, request, context):
        """Server-streaming: yields one ForecastDay at a time so the client can render progressively."""
        if not request.city or len(request.city.strip()) == 0:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "City is required")
        
        if request.days < 1 or request.days > 5:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "Days must be between 1 and 5")

        # OWM's `cnt` counts 3-hour timestamps, not days. Let it return the default 40
        # and rely on the day-grouping below.
        params = {"q": f"{request.city},{request.country_code}"} if request.country_code else {"q": request.city}

        try:
            data = self._make_request("forecast", params)
        except Exception:
            try:
                data = self._make_request("forecast", {"q": request.city})
            except Exception:
                context.abort(grpc.StatusCode.NOT_FOUND, f"City not found: {request.city}")

        # OpenWeatherMap /forecast returns 3-hour intervals. Group by day.
        daily_data = {}
        for item in data["list"]:
            dt = datetime.fromtimestamp(item["dt"])
            date_key = dt.strftime("%Y-%m-%d")
            daily_data.setdefault(date_key, []).append(item)

        for date, entries in list(daily_data.items())[:request.days]:
            temps = [e["main"]["temp"] for e in entries]
            midday_entry = entries[len(entries) // 2]

            yield weather_pb2.ForecastDay(
                date=date,
                temp_min=min(temps),
                temp_max=max(temps),
                temp_avg=sum(temps) / len(temps),
                description=midday_entry["weather"][0]["description"],
                icon=midday_entry["weather"][0]["icon"]
            )
            # Visible streaming pacing — makes the server-streaming RPC observable in the UI.
            time.sleep(0.35)
