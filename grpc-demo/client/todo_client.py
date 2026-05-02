"""
gRPC Todo Client - Test the Todo service
"""

import grpc
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'generated'))

import todo_pb2, todo_pb2_grpc


def print_todo(response):
    """Helper to print todo action response"""
    if response.success:
        todo = response.todo
        status = "✅" if todo.completed else "⬜"
        print(f"  {status} [{todo.id}] {todo.title}")
        print(f"      Priority: {todo.priority}")
        print(f"      Tags: {', '.join(todo.tags) if todo.tags else 'none'}")
        if todo.description:
            print(f"      Desc: {todo.description}")
    else:
        print(f"  ❌ {response.message}")


def run_todo_client():
    channel = grpc.insecure_channel('localhost:50053')
    stub = todo_pb2_grpc.TodoServiceStub(channel)
    
    print("\n" + "=" * 60)
    print("  gRPC Todo Client")
    print("=" * 60)
    
    # List initial todos
    print("\n📋 Initial Todos:")
    print("-" * 40)
    response = stub.ListTodos(todo_pb2.ListTodosRequest())
    for todo in response.todos:
        status = "✅" if todo.completed else "⬜"
        print(f"  {status} [{todo.id}] {todo.title} ({todo.priority})")
    
    # Create a new todo
    print("\n➕ Creating new todo...")
    print("-" * 40)
    response = stub.CreateTodo(todo_pb2.CreateTodoRequest(
        title="Build a gRPC demo",
        description="Create a complete gRPC example with Weather and Todo services",
        priority="high",
        tags=["grpc", "demo", "learning"]
    ))
    print_todo(response)
    
    # Create another todo
    print("\n➕ Creating another todo...")
    print("-" * 40)
    response = stub.CreateTodo(todo_pb2.CreateTodoRequest(
        title="Explore OpenWeatherMap API",
        description="Test the weather API integration",
        priority="medium",
        tags=["weather", "api"]
    ))
    print_todo(response)
    
    # Get a specific todo
    print("\n🔍 Getting todo ID 1:")
    print("-" * 40)
    response = stub.GetTodo(todo_pb2.GetTodoRequest(id=1))
    print_todo(response)
    
    # Update a todo
    print("\n✏️ Updating todo ID 1:")
    print("-" * 40)
    response = stub.UpdateTodo(todo_pb2.UpdateTodoRequest(
        id=1,
        title="Learn gRPC - Updated",
        completed=True,
        priority="high",
        tags=["grpc", "protobuf", "updated"]
    ))
    print_todo(response)
    
    # Toggle todo completion
    print("\n🔄 Toggling todo ID 2:")
    print("-" * 40)
    response = stub.ToggleTodoComplete(todo_pb2.GetTodoRequest(id=2))
    print_todo(response)
    
    # List all todos
    print("\n📋 All Todos (after updates):")
    print("-" * 40)
    response = stub.ListTodos(todo_pb2.ListTodosRequest())
    for todo in response.todos:
        status = "✅" if todo.completed else "⬜"
        print(f"  {status} [{todo.id}] {todo.title} ({todo.priority})")
    
    # List only completed
    print("\n✅ Completed Todos only:")
    print("-" * 40)
    response = stub.ListTodos(todo_pb2.ListTodosRequest(show_completed_only=True))
    for todo in response.todos:
        print(f"  [{todo.id}] {todo.title}")
    
    # Filter by priority
    print("\n🎯 High Priority Todos:")
    print("-" * 40)
    response = stub.ListTodos(todo_pb2.ListTodosRequest(priority_filter="high"))
    for todo in response.todos:
        print(f"  [{todo.id}] {todo.title}")
    
    # Filter by tag
    print("\n🏷️ Todos with 'grpc' tag:")
    print("-" * 40)
    response = stub.ListTodos(todo_pb2.ListTodosRequest(tag_filter="grpc"))
    for todo in response.todos:
        print(f"  [{todo.id}] {todo.title} - tags: {', '.join(todo.tags)}")
    
    # Delete a todo
    print("\n🗑️ Deleting todo ID 3:")
    print("-" * 40)
    response = stub.DeleteTodo(todo_pb2.DeleteTodoRequest(id=3))
    print(f"  {'✅' if response.success else '❌'} {response.message}")
    
    # Final list
    print("\n📋 Final Todos:")
    print("-" * 40)
    response = stub.ListTodos(todo_pb2.ListTodosRequest())
    for todo in response.todos:
        status = "✅" if todo.completed else "⬜"
        print(f"  {status} [{todo.id}] {todo.title} ({todo.priority})")
    
    channel.close()
    print("\n" + "=" * 60)


if __name__ == '__main__':
    run_todo_client()