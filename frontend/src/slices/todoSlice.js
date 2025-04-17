import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const response = await fetch(`${API_URL}/todos`);
  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }
  return response.json();
});

export const addTodoApi = createAsyncThunk('todos/addTodo', async (todo) => {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todo),
  });
  if (!response.ok) {
    throw new Error('Failed to add todo');
  }
  return response.json();
});

export const updateTodoApi = createAsyncThunk(
  'todos/updateTodo',
  async (todo) => {
    const response = await fetch(`${API_URL}/todos/${todo.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      throw new Error('Failed to update todo');
    }
    return response.json();
  }
);

export const deleteTodoApi = createAsyncThunk(
  'todos/deleteTodo',
  async (id) => {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
    return id;
  }
);

const initialValue = {
  filterStatus: 'all',
  todoList: [],
  status: 'idle',
  error: null,
};

export const todoSlice = createSlice({
  name: 'todo',
  initialState: initialValue,
  reducers: {
    updateFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.todoList = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addTodoApi.fulfilled, (state, action) => {
        state.todoList.push(action.payload);
      })
      .addCase(updateTodoApi.fulfilled, (state, action) => {
        const index = state.todoList.findIndex(
          (todo) => todo.id === action.payload.id
        );
        if (index !== -1) {
          state.todoList[index] = action.payload;
        }
      })
      .addCase(deleteTodoApi.fulfilled, (state, action) => {
        state.todoList = state.todoList.filter(
          (todo) => todo.id !== action.payload
        );
      });
  },
});

export const { updateFilterStatus } = todoSlice.actions;
export default todoSlice.reducer;
