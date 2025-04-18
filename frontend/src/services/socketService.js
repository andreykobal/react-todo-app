import { io } from 'socket.io-client';

// Get the server URL from environment variables or use the default
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect() {
    if (this.socket) return;
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    // Set up event listeners
    this._setupListeners();
    
    return this.socket;
  }
  
  _setupListeners() {
    // Clear any existing listeners
    if (this.socket) {
      this.socket.off('todo-created');
      this.socket.off('todo-updated');
      this.socket.off('todo-deleted');
    }
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  onTodoCreated(callback) {
    if (!this.socket) this.connect();
    this.socket.on('todo-created', callback);
    return () => this.socket.off('todo-created', callback);
  }
  
  onTodoUpdated(callback) {
    if (!this.socket) this.connect();
    this.socket.on('todo-updated', callback);
    return () => this.socket.off('todo-updated', callback);
  }
  
  onTodoDeleted(callback) {
    if (!this.socket) this.connect();
    this.socket.on('todo-deleted', callback);
    return () => this.socket.off('todo-deleted', callback);
  }
}

// Create and export a singleton instance
const socketService = new SocketService();
export default socketService; 