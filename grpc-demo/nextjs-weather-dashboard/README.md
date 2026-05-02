# Interactive Weather Dashboard

A modern, interactive weather dashboard built with Next.js, TypeScript, and Tailwind CSS that connects to your gRPC weather service.

## Features

- 🌤️ Real-time weather data
- 📅 5-day forecast
- 🔍 City search functionality
- 🎨 Beautiful, responsive UI with smooth animations
- ⚡ Fast performance with React 19
- 📱 Mobile-friendly design

## Prerequisites

- Node.js 18+ 
- Your gRPC services running (weather service on port 50053)
- Flask API gateway running on port 5000

## Getting Started

1. Make sure your gRPC services are running:
   ```bash
   # In one terminal
   python server/server.py
   
   # In another terminal  
   python server/api_gateway.py
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to http://localhost:3000

## API Integration

The frontend communicates with your existing Flask API gateway:
- `/api/weather?city={city}&country={country}` - Current weather
- `/api/forecast?city={city}&country={country}&days=5` - 5-day forecast

## Customization

You can customize the appearance by modifying:
- `tailwind.config.js` - Theme and styling
- `app/globals.css` - Global styles
- Components in the `components/` directory

## Deployment

To build for production:
```bash
npm run build
npm start
```

## Architecture

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **Styling**: Tailwind CSS with custom animations
- **API Communication**: Fetch API with proxy to Flask backend
- **Components**: Modular, reusable components for weather display, forecast, search, etc.