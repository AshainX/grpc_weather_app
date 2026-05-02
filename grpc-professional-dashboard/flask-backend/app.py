from flask import Flask, Response, request, jsonify, stream_with_context
from flask_cors import CORS
import requests
import os
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

API_KEY = os.environ.get('OPENWEATHERMAP_API_KEY', '')


def get_weather(city: str, country: str = '') -> dict:
    """Fetch current weather from OpenWeatherMap."""
    if not API_KEY:
        return {'error': 'API key not configured'}
    
    query = f"{city},{country}" if country else city
    url = f"https://api.openweathermap.org/data/2.5/weather"
    params = {'q': query, 'appid': API_KEY, 'units': 'metric'}
    
    try:
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code != 200:
            return {'error': resp.json().get('message', 'Failed to fetch weather')}
        
        data = resp.json()
        return {
            'city': data['name'],
            'country': data['sys']['country'],
            'temp': data['main']['temp'],
            'feels_like': data['main']['feels_like'],
            'humidity': data['main']['humidity'],
            'wind': data['wind']['speed'],
            'description': data['weather'][0]['description'],
            'icon': data['weather'][0]['icon'],
            'pressure': data['main']['pressure'],
            'sunrise': data['sys']['sunrise'],
            'sunset': data['sys']['sunset'],
        }
    except Exception as e:
        logger.error(f"Weather API error: {e}")
        return {'error': str(e)}


def get_forecast(city: str, country: str = '', days: int = 5) -> list:
    """Fetch forecast from OpenWeatherMap."""
    if not API_KEY:
        return [{'error': 'API key not configured'}]
    
    query = f"{city},{country}" if country else city
    url = f"https://api.openweathermap.org/data/2.5/forecast"
    params = {'q': query, 'appid': API_KEY, 'units': 'metric', 'cnt': days * 8}
    
    try:
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code != 200:
            return [{'error': resp.json().get('message', 'Failed to fetch forecast')}]
        
        data = resp.json()
        daily = {}
        for item in data['list']:
            date = item['dt_txt'].split()[0]
            if date not in daily:
                daily[date] = {'temps': [], 'weather': None}
            daily[date]['temps'].append(item['main']['temp'])
            if '12:00' in item['dt_txt']:
                daily[date]['weather'] = item['weather'][0]
        
        forecast = []
        for date, info in list(daily.items())[:days]:
            temps = info['temps']
            weather = info['weather'] or data['list'][0]['weather'][0]
            forecast.append({
                'date': date,
                'temp_min': min(temps),
                'temp_max': max(temps),
                'temp_avg': sum(temps) / len(temps),
                'description': weather['description'],
                'icon': weather['icon'],
            })
        return forecast
    except Exception as e:
        logger.error(f"Forecast API error: {e}")
        return [{'error': str(e)}]


@app.route('/api/weather')
def weather():
    """Current weather endpoint."""
    city = request.args.get('city')
    country = request.args.get('country', '')
    
    if not city:
        return jsonify({'error': 'City is required'}), 400
    
    result = get_weather(city, country)
    if 'error' in result:
        return jsonify(result), 500
    
    return jsonify(result)


@app.route('/api/forecast')
def forecast():
    """SSE forecast endpoint."""
    city = request.args.get('city')
    country = request.args.get('country', '')
    days = int(request.args.get('days', 5))
    
    if not city:
        return jsonify({'error': 'City is required'}), 400
    
    def generate():
        try:
            for day in get_forecast(city, country, days):
                yield f"data: {json.dumps(day)}\n\n"
            yield "event: done\ndata: {}\n\n"
        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
    
    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive',
        }
    )


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)