"""
gRPC Server - Hosts both Weather and Todo services
"""

import grpc
from concurrent import futures
import sys
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('grpc_server')

# Add generated to path - point to the generated folder directly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'generated'))

import weather_pb2_grpc, todo_pb2_grpc
from weather_service import WeatherServicer
from todo_service import TodoServicer


def serve():
    # Initialize gRPC server
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # Register services
    weather_pb2_grpc.add_WeatherServiceServicer_to_server(
        WeatherServicer(api_key=None),  # API key is hardcoded in weather_service.py
        server
    )
    todo_pb2_grpc.add_TodoServiceServicer_to_server(
        TodoServicer(),
        server
    )
    
    # Bind to port
    server.add_insecure_port('127.0.0.1:50053')
    
    logger.info("gRPC Server Started")
    logger.info("Weather Service: localhost:50053")
    logger.info("Todo Service:    localhost:50053")
    logger.info("Press Ctrl+C to stop the server")
    
    server.start()
    
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        logger.info("Shutting down server...")
        server.stop(0)


if __name__ == '__main__':
    serve()