import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper function to get headers with user ID if available
const getHeaders = (getState) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const userId = getState().auth?.user?.id;
  if (userId) {
    headers['user-id'] = userId;
  }
  
  return headers;
};

export const fetchTodos = createAsyncThunk('todos/fetchTodos', 
  async (_, { getState }) => {
    const headers = getHeaders(getState);
    const response = await fetch(`${API_URL}/todos`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    return response.json();
});

export const addTodoApi = createAsyncThunk('todos/addTodo', 
  async (todo, { getState }) => {
    const headers = getHeaders(getState);
    const response = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      throw new Error('Failed to add todo');
    }
    return response.json();
});

export const updateTodoApi = createAsyncThunk(
  'todos/updateTodo',
  async (todo, { getState }) => {
    const headers = getHeaders(getState);
    const response = await fetch(`${API_URL}/todos/${todo.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      throw new Error('Failed to update todo');
    }
    return response.json();
  }
);

export const updateTodoStatusApi = createAsyncThunk(
  'todos/updateTodoStatus',
  async ({ id, status }, { getState }) => {
    const headers = getHeaders(getState);
    const response = await fetch(`${API_URL}/todos/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update todo status');
    }
    return response.json();
  }
);

export const updateTodoAndClearOthersApi = createAsyncThunk(
  'todos/updateTodoAndClearOthers',
  async (todo, { getState, dispatch }) => {
    const headers = getHeaders(getState);
    
    // First check if the user is logged in
    const userId = getState().auth?.user?.id;
    if (!userId) {
      // User not logged in, we'll return a special response to trigger login modal
      return { requireLogin: true, originalTodo: todo };
    }
    
    // First, update the current todo
    const response = await fetch(`${API_URL}/todos/${todo.id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'complete' }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update todo');
    }
    
    const updatedTodo = await response.json();
    
    // If the todo was marked as complete, uncheck all other todos owned by this user
    if (updatedTodo.status === 'complete') {
      const state = getState();
      const otherTodos = state.todo.todoList.filter(
        item => item.id !== todo.id && item.status === 'complete' && item.userId === userId
      );
      
      // Update each completed todo to be incomplete
      for (const otherTodo of otherTodos) {
        dispatch(
          updateTodoStatusApi({ id: otherTodo.id, status: 'incomplete' })
        );
      }
    }
    
    return updatedTodo;
  }
);

export const deleteTodoApi = createAsyncThunk(
  'todos/deleteTodo',
  async (id, { getState }) => {
    const headers = getHeaders(getState);
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'DELETE',
      headers,
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
  requireLogin: false,
  pendingTodo: null,
};

export const todoSlice = createSlice({
  name: 'todo',
  initialState: initialValue,
  reducers: {
    updateFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setRequireLogin: (state, action) => {
      state.requireLogin = action.payload;
    },
    setPendingTodo: (state, action) => {
      state.pendingTodo = action.payload;
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
      .addCase(updateTodoStatusApi.fulfilled, (state, action) => {
        const index = state.todoList.findIndex(
          (todo) => todo.id === action.payload.id
        );
        if (index !== -1) {
          state.todoList[index] = action.payload;
        }
      })
      .addCase(updateTodoAndClearOthersApi.fulfilled, (state, action) => {
        // Check if we need login
        if (action.payload.requireLogin) {
          state.requireLogin = true;
          state.pendingTodo = action.payload.originalTodo;
          return;
        }
        
        // Update the current todo in the state
        const index = state.todoList.findIndex(
          (todo) => todo.id === action.payload.id
        );
        if (index !== -1) {
          state.todoList[index] = action.payload;
        }
        
        // If the todo was marked as complete, set all other todos to incomplete
        // but only for todos owned by the same user
        if (action.payload.status === 'complete' && action.payload.userId) {
          state.todoList.forEach(todo => {
            if (todo.id !== action.payload.id && 
                todo.status === 'complete' && 
                todo.userId === action.payload.userId) {
              todo.status = 'incomplete';
            }
          });
        }
      })
      .addCase(deleteTodoApi.fulfilled, (state, action) => {
        state.todoList = state.todoList.filter(
          (todo) => todo.id !== action.payload
        );
      });
  },
});

export const { updateFilterStatus, setRequireLogin, setPendingTodo } = todoSlice.actions;
export default todoSlice.reducer;
