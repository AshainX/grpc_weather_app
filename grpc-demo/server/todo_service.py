"""
gRPC Todo Service implementation with full CRUD operations
"""

import grpc
import time
import todo_pb2, todo_pb2_grpc


class TodoStore:
    """In-memory store for todos"""
    def __init__(self):
        self._todos = {}
        self._next_id = 1
    
    def create_todo(self, title: str, description: str, priority: str, tags: list) -> todo_pb2.Todo:
        todo = todo_pb2.Todo(
            id=self._next_id,
            title=title,
            description=description,
            completed=False,
            created_at=int(time.time()),
            updated_at=int(time.time()),
            priority=priority,
            tags=tags
        )
        self._todos[self._next_id] = todo
        self._next_id += 1
        return todo
    
    def get_todo(self, todo_id: int) -> todo_pb2.Todo:
        if todo_id not in self._todos:
            return None
        return self._todos[todo_id]
    
    def update_todo(self, todo_id: int, title: str, description: str, completed: bool, priority: str, tags: list) -> todo_pb2.Todo:
        if todo_id not in self._todos:
            return None
        todo = self._todos[todo_id]
        if title:
            todo.title = title
        if description:
            todo.description = description
        todo.completed = completed
        if priority:
            todo.priority = priority
        # For repeated fields, clear and extend
        del todo.tags[:]
        todo.tags.extend(tags)
        todo.updated_at = int(time.time())
        return todo
    
    def delete_todo(self, todo_id: int) -> bool:
        if todo_id not in self._todos:
            return False
        del self._todos[todo_id]
        return True
    
    def list_todos(self, show_completed_only: bool, priority_filter: str, tag_filter: str) -> list:
        result = []
        for todo in self._todos.values():
            if show_completed_only and not todo.completed:
                continue
            if priority_filter and todo.priority != priority_filter:
                continue
            if tag_filter and tag_filter not in todo.tags:
                continue
            result.append(todo)
        return result


class TodoServicer(todo_pb2_grpc.TodoServiceServicer):
    def __init__(self):
        self.store = TodoStore()
        # Add some sample todos
        self.store.create_todo("Learn gRPC", "Study gRPC concepts and protobuf", "high", ["grpc", "protobuf"])
        self.store.create_todo("Build weather app", "Create weather service with real API", "medium", ["weather", "api"])
        self.store.create_todo("Write docs", "Document the gRPC implementation", "low", ["docs"])

    def CreateTodo(self, request, context):
        """Create a new todo"""
        if not request.title or len(request.title.strip()) == 0:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "Title is required")
        
        valid_priorities = ["high", "medium", "low"]
        if request.priority and request.priority not in valid_priorities:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "Priority must be one of: high, medium, low")
        
        todo = self.store.create_todo(
            request.title,
            request.description,
            request.priority if request.priority else "medium",
            list(request.tags)
        )
        return todo_pb2.TodoActionResponse(
            success=True,
            message=f"Todo '{todo.title}' created successfully",
            todo=todo
        )

    def GetTodo(self, request, context):
        """Get a todo by ID"""
        todo = self.store.get_todo(request.id)
        if not todo:
            return todo_pb2.TodoActionResponse(
                success=False,
                message=f"Todo with ID {request.id} not found"
            )
        return todo_pb2.TodoActionResponse(
            success=True,
            message="Todo found",
            todo=todo
        )

    def UpdateTodo(self, request, context):
        """Update an existing todo"""
        if request.title and len(request.title.strip()) == 0:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "Title cannot be empty")
        
        valid_priorities = ["high", "medium", "low"]
        if request.priority and request.priority not in valid_priorities:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "Priority must be one of: high, medium, low")
        
        todo = self.store.update_todo(
            request.id,
            request.title,
            request.description,
            request.completed,
            request.priority,
            list(request.tags)
        )
        if not todo:
            return todo_pb2.TodoActionResponse(
                success=False,
                message=f"Todo with ID {request.id} not found"
            )
        return todo_pb2.TodoActionResponse(
            success=True,
            message=f"Todo {todo.id} updated successfully",
            todo=todo
        )

    def DeleteTodo(self, request, context):
        """Delete a todo"""
        success = self.store.delete_todo(request.id)
        if not success:
            return todo_pb2.TodoActionResponse(
                success=False,
                message=f"Todo with ID {request.id} not found"
            )
        return todo_pb2.TodoActionResponse(
            success=True,
            message=f"Todo {request.id} deleted successfully"
        )

    def ListTodos(self, request, context):
        """List all todos with optional filters"""
        todos = self.store.list_todos(
            request.show_completed_only,
            request.priority_filter if request.priority_filter else "",
            request.tag_filter if request.tag_filter else ""
        )
        return todo_pb2.ListTodosResponse(todos=todos)

    def ToggleTodoComplete(self, request, context):
        """Toggle todo completion status"""
        todo = self.store.get_todo(request.id)
        if not todo:
            return todo_pb2.TodoActionResponse(
                success=False,
                message=f"Todo with ID {request.id} not found"
            )
        todo.completed = not todo.completed
        todo.updated_at = int(time.time())
        return todo_pb2.TodoActionResponse(
            success=True,
            message=f"Todo {todo.id} marked as {'completed' if todo.completed else 'pending'}",
            todo=todo
        )

    def ClearCompletedTodos(self, request, context):
        """Clear all completed todos"""
        deleted_count = 0
        todo_ids_to_delete = []
        for todo in self.store.list_todos(show_completed_only=True, priority_filter="", tag_filter=""):
            todo_ids_to_delete.append(todo.id)
        
        for tid in todo_ids_to_delete:
            self.store.delete_todo(tid)
            deleted_count += 1
        
        return todo_pb2.TodoActionResponse(
            success=True,
            message=f"Cleared {deleted_count} completed todos"
        )