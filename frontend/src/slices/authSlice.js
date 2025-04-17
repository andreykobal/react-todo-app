import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Request magic link
export const requestMagicLink = createAsyncThunk(
  'auth/requestMagicLink',
  async (email) => {
    const response = await fetch(`${API_URL}/auth/magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send magic link');
    }
    
    return response.json();
  }
);

// Verify magic link token
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (token) => {
    const response = await fetch(`${API_URL}/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to verify token');
    }
    
    return response.json();
  }
);

// Load user from local storage
const getUserFromStorage = () => {
  const storedUser = localStorage.getItem('todoUser');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('todoUser');
    }
  }
  return null;
};

const initialState = {
  user: getUserFromStorage(),
  status: 'idle',
  error: null,
  magicLinkSent: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('todoUser');
    },
    resetMagicLinkStatus: (state) => {
      state.magicLinkSent = false;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Request magic link
      .addCase(requestMagicLink.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(requestMagicLink.fulfilled, (state) => {
        state.status = 'succeeded';
        state.magicLinkSent = true;
      })
      .addCase(requestMagicLink.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // Verify token
      .addCase(verifyToken.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.magicLinkSent = false;
        
        // Save user to local storage
        localStorage.setItem('todoUser', JSON.stringify(action.payload));
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { logout, resetMagicLinkStatus } = authSlice.actions;
export default authSlice.reducer; 