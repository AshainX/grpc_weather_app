from flask import Flask, Response, request, jsonify, stream_with_context
from flask_cors import CORS
import grpc
import json
import sys
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('api_gateway')

# Add generated to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'generated'))
import weather_pb2, weather_pb2_grpc

app = Flask(__name__)
CORS(app)

# gRPC Client Setup
def get_weather_stub():
    channel = grpc.insecure_channel('localhost:50053')
    return weather_pb2_grpc.WeatherServiceStub(channel)

@app.route('/api/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city')
    country = request.args.get('country', '')

    if not city:
        logger.warning("City parameter missing in /api/weather request")
        return jsonify({"error": "City is required"}), 400

    try:
        stub = get_weather_stub()
        response = stub.GetCurrentWeather(weather_pb2.WeatherRequest(
            city=city,
            country_code=country
        ))
        return jsonify({
            "city": response.city,
            "country": response.country,
            "temp": response.temperature,
            "feels_like": response.feels_like,
            "humidity": response.humidity,
            "description": response.description,
            "wind": response.wind_speed,
            "pressure": response.pressure,
            "icon": response.icon,
            "sunrise": response.sunrise,
            "sunset": response.sunset,
        })
    except grpc.RpcError as e:
        logger.error(f"gRPC error in /api/weather: {e.details()}")
        return jsonify({"error": e.details()}), 500
    except Exception as e:
        logger.error(f"Unexpected error in /api/weather: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    """Server-Sent Events endpoint. Bridges the gRPC server-streaming RPC to the browser.
    Each ForecastDay arrives as its own SSE `data:` frame; a final `event: done` closes the stream."""
    city = request.args.get('city')
    country = request.args.get('country', '')
    days = int(request.args.get('days', 5))

    if not city:
        logger.warning("City parameter missing in /api/forecast request")
        return jsonify({"error": "City is required"}), 400

    def generate():
        try:
            stub = get_weather_stub()
            req = weather_pb2.ForecastRequest(city=city, country_code=country, days=days)
            for day in stub.GetForecast(req):
                payload = json.dumps({
                    "date": day.date,
                    "temp_min": day.temp_min,
                    "temp_max": day.temp_max,
                    "temp_avg": day.temp_avg,
                    "description": day.description,
                    "icon": day.icon,
                })
                yield f"data: {payload}\n\n"
            yield "event: done\ndata: {}\n\n"
        except grpc.RpcError as e:
            details = e.details() if hasattr(e, 'details') else str(e)
            yield f"event: error\ndata: {json.dumps({'error': details})}\n\n"
        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',  # prevent nginx/proxy buffering
            'Connection': 'keep-alive',
        }
    )

if __name__ == '__main__':
    logger.info("Starting Flask gateway on port 5000...")
    logger.info("Testing gRPC connection to localhost:50053...")
    try:
        stub = get_weather_stub()
        stub.GetCurrentWeather(weather_pb2.WeatherRequest(city="London", country_code="GB"))
        logger.info("gRPC connection test successful")
    except Exception as e:
        logger.error(f"gRPC connection test failed: {str(e)}")
    
    # threaded=True so SSE connections don't block other requests
    app.run(port=5000, debug=True, threaded=True)
