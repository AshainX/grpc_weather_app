# gRPC Weather & Todo Application

A demonstration of gRPC (Google Remote Procedure Call) with two services:
1. **Weather Service** - Real-time weather data using OpenWeatherMap API
2. **Todo Service** - Full CRUD operations for task management with priority and tags

## 📋 Features

### Weather Service
- Current weather for any city worldwide
- 1-5 day weather forecast
- Temperature, humidity, wind speed, pressure data
- Sunrise/sunset times

### Todo Service
- Create, Read, Update, Delete todos
- Priority levels (low, medium, high)
- Tags for categorization
- Filter by completion status, priority, or tag
- Toggle completion status
- Clear all completed todos

## 🏗️ Project Structure

```
grpc-demo/
├── protos/
│   ├── weather.proto      # Weather service definition
│   └── todo.proto        # Todo service definition
├── server/
│   ├── server.py         # Main gRPC server
│   ├── weather_service.py # Weather API implementation
│   └── todo_service.py   # Todo CRUD implementation
├── client/
│   ├── weather_client.py  # Weather service client
│   └── todo_client.py    # Todo service client
├── generated/            # Generated Python files (run protoc first)
├── requirements.txt
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd grpc-demo
pip install -r requirements.txt
```

### 2. Generate gRPC Code

```bash
# Windows (PowerShell)
python -m grpc_tools.protoc -I./protos --python_out=./generated --grpc_python_out=./generated ./protos/weather.proto ./protos/todo.proto

# Linux/Mac
python -m grpc_tools.protoc -I./protos --python_out=./generated --grpc_python_out=./generated ./protos/*.proto
```

### 3. Configure API Key

Edit `server/weather_service.py` and replace `YOUR_OPENWEATHERMAP_API_KEY` with your actual API key from [OpenWeatherMap](https://openweathermap.org/api).

### 4. Run the Server

```bash
python server/server.py
```

You should see:
```
============================================================
  gRPC Server Started
  - Weather Service: localhost:50051
  - Todo Service:    localhost:50051
============================================================
Press Ctrl+C to stop the server
```

### 5. Run the Clients

Open a new terminal and run:

```bash
# Weather client
python client/weather_client.py

# Todo client  
python client/todo_client.py
```

## 📡 gRPC Concepts Demonstrated

### Protocol Buffers (proto3)
- Message definitions for data serialization
- Service definitions for RPC methods
- Scalars, enums, nested messages, repeated fields

### Service Types
- **Unary**: Client sends single request, gets single response (GetTodo)
- **Server Streaming**: Client sends request, gets stream of responses (GetForecast)
- Note: Both services use unary calls for simplicity

### Key gRPC Features Used
- **Channel**: Connection to gRPC server
- **Stub**: Client-side proxy for calling server methods
- **Servicer**: Server-side implementation of service
- **Context**: For deadlines, cancellation, metadata

## 🔧 Customization

### Change Server Port
Edit `server/server.py` and change `add_insecure_port('[::]:50051')` to your preferred port.

### Add Weather API Key
Get a free API key from [OpenWeatherMap](https://openweathermap.org/api) and set it in `server/weather_service.py`:
```python
WeatherServicer(api_key="your_actual_api_key_here")
```

## 📚 Learning Points

1. **.proto files** define the contract between client and server
2. **grpcio-tools** generates Python code from .proto files
3. Server implements servicer classes that handle RPC calls
4. Client uses stubs to call methods as if calling local functions
5. gRPC handles serialization/deserialization automatically

## 🧹 Clean Up Completed Todos

```python
# From the client
response = stub.ClearCompletedTodos(todo_pb2.ListTodosRequest())
print(response.message)  # "Cleared X completed todos"
```

## 📝 Example Output

```
Weather Client:
📍 Current Weather for London:
  City:      London, GB
  Temp:      12.5°C
  Feels:     11.2°C
  Humidity:  75%
  Desc:      scattered clouds

Todo Client:
➕ Creating new todo...
  ✅ [4] Build a gRPC demo
      Priority: high
      Tags: grpc, demo, learning
```