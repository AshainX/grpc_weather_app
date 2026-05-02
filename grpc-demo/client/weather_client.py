"""
gRPC Weather Client - Test the Weather service
"""

import grpc
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'generated'))

import weather_pb2, weather_pb2_grpc


def run_weather_client():
    channel = grpc.insecure_channel('localhost:50053')
    stub = weather_pb2_grpc.WeatherServiceStub(channel)

    print("\n" + "=" * 60)
    print("  gRPC Weather Client")
    print("=" * 60)

    # Test current weather
    print("\nCurrent Weather for London:")
    print("-" * 40)
    try:
        response = stub.GetCurrentWeather(weather_pb2.WeatherRequest(
            city="London",
            country_code="GB"
        ))
        print(f"  City:      {response.city}, {response.country}")
        print(f"  Temp:      {response.temperature:.1f}°C")
        print(f"  Feels:     {response.feels_like:.1f}°C")
        print(f"  Humidity:  {response.humidity}%")
        print(f"  Desc:      {response.description}")
        print(f"  Wind:      {response.wind_speed} m/s")
        print(f"  Pressure:  {response.pressure} hPa")
    except grpc.RpcError as e:
        print(f"  Error: {e.code()}: {e.details()}")

    # Test forecast — server streaming
    print("\n5-Day Forecast for Tokyo (streaming):")
    print("-" * 40)
    try:
        # stub.GetForecast is now an iterator — one ForecastDay per yield on the server
        for day in stub.GetForecast(weather_pb2.ForecastRequest(
            city="Tokyo",
            country_code="JP",
            days=5
        )):
            print(f"  {day.date}  {day.temp_min:.1f}° / {day.temp_max:.1f}°  ({day.description})")
    except grpc.RpcError as e:
        print(f"  Error: {e.code()}: {e.details()}")

    channel.close()
    print("\n" + "=" * 60)


if __name__ == '__main__':
    run_weather_client()
