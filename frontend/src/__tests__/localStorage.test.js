import { configureStore } from '@reduxjs/toolkit';
import { act } from 'react-dom/test-utils';
import todoReducer, { addTodo, updateTodo, deleteTodo } from '../slices/todoSlice';

// Mock the entire todoSlice module for the last test
jest.mock('../slices/todoSlice', () => {
  const actual = jest.requireActual('../slices/todoSlice');
  return {
    ...actual,
    __esModule: true,
  };
});

describe('Todo Local Storage Tests', () => {
  let store;
  let localStorageMock;
  
  beforeEach(() => {
    // Mock localStorage
    localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value;
        }),
        clear: jest.fn(() => {
          store = {};
        }),
        removeItem: jest.fn(key => {
          delete store[key];
        }),
      };
    })();
    
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Set initial localStorage state to empty array
    localStorageMock.getItem.mockReturnValue(null);
    
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        todo: todoReducer,
      },
    });
    
    // Reset mock calls after store initialization
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockClear();
  });
  
  test('Todo items should be saved to localStorage when added', () => {
    // Add a new todo
    const todoItem = {
      id: '1',
      title: 'Test Todo',
      status: 'incomplete',
      time: '12:00 PM, 01/01/2023',
    };
    
    // For the addTodo operation, simulate empty todoList
    localStorageMock.getItem.mockReturnValueOnce(null);
    
    act(() => {
      store.dispatch(addTodo(todoItem));
    });
    
    // Should have called setItem once for adding the todo
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    
    // The call should be for adding the todo
    const lastCallArgs = localStorageMock.setItem.mock.calls[0];
    expect(lastCallArgs[0]).toBe('todoList');
    
    // Verify the todo was saved correctly
    const savedTodos = JSON.parse(lastCallArgs[1]);
    expect(savedTodos).toEqual([todoItem]);
  });
  
  test('Todo items should be updated in localStorage when modified', () => {
    // Initial todo
    const todoItem = {
      id: '1',
      title: 'Test Todo',
      status: 'incomplete',
      time: '12:00 PM, 01/01/2023',
    };
    
    // Setup localStorage with one todo
    const initialTodos = [todoItem];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialTodos));
    
    // Updated todo data
    const updatedTodoItem = {
      ...todoItem,
      title: 'Updated Test Todo',
      status: 'complete',
    };
    
    // Update the todo
    store.dispatch(updateTodo(updatedTodoItem));
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalled();
    
    // Get the most recent call arguments
    const lastCallArgs = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
    expect(lastCallArgs[0]).toBe('todoList');
    
    // Verify the updated data
    const savedTodos = JSON.parse(lastCallArgs[1]);
    expect(savedTodos.length).toBe(1);
    expect(savedTodos[0].title).toBe('Updated Test Todo');
    expect(savedTodos[0].status).toBe('complete');
  });
  
  test('Todo items should be removed from localStorage when deleted', () => {
    // Initial todo
    const todoItem = {
      id: '1',
      title: 'Test Todo',
      status: 'incomplete',
      time: '12:00 PM, 01/01/2023',
    };
    
    // Setup localStorage with one todo
    const initialTodos = [todoItem];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialTodos));
    
    // Delete the todo
    store.dispatch(deleteTodo(todoItem.id));
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalled();
    
    // Get the most recent call arguments
    const lastCallArgs = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
    expect(lastCallArgs[0]).toBe('todoList');
    
    // Verify the todo was removed
    const savedTodos = JSON.parse(lastCallArgs[1]);
    expect(savedTodos).toEqual([]);
  });
});

// Separate test for page reloading to avoid interference with other tests
describe('Todo Local Storage Persistence Test', () => {
  test('Todo items should be restored when page is reloaded', () => {
    // Create test data
    const todoItems = [
      {
        id: '1',
        title: 'Test Todo 1',
        status: 'incomplete',
        time: '12:00 PM, 01/01/2023',
      },
      {
        id: '2',
        title: 'Test Todo 2',
        status: 'complete',
        time: '1:00 PM, 01/01/2023',
      },
    ];

    // Mock localStorage.getItem only for this test
    const localStorageMock = {
      getItem: jest.fn().mockImplementation((key) => {
        if (key === 'todoList') {
          return JSON.stringify(todoItems);
        }
        return null;
      }),
      setItem: jest.fn(),
    };

    // Set up the mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Force the store to read from our mocked localStorage
    jest.resetModules();
    const { configureStore } = require('@reduxjs/toolkit');
    const todoReducer = require('../slices/todoSlice').default;
    
    // Create a new store which should load the mocked data
    const store = configureStore({
      reducer: {
        todo: todoReducer,
      },
    });
    
    // Verify the state contains our test data
    const state = store.getState();
    expect(state.todo.todoList).toEqual(todoItems);
  });
}); 