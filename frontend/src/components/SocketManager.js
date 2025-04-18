import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import socketService from '../services/socketService';
import { todoCreated, todoUpdated, todoDeleted } from '../slices/todoSlice';

/**
 * This component manages WebSocket connections and events.
 * It doesn't render anything but handles socket events and dispatches Redux actions.
 */
const SocketManager = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Connect to the socket
    socketService.connect();

    // Set up event listeners
    const unsubscribeCreated = socketService.onTodoCreated((todo) => {
      console.log('Todo created via socket:', todo);
      dispatch(todoCreated(todo));
    });

    const unsubscribeUpdated = socketService.onTodoUpdated((todo) => {
      console.log('Todo updated via socket:', todo);
      dispatch(todoUpdated(todo));
    });

    const unsubscribeDeleted = socketService.onTodoDeleted((todoId) => {
      console.log('Todo deleted via socket:', todoId);
      dispatch(todoDeleted(todoId));
    });

    // Clean up on component unmount
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
      socketService.disconnect();
    };
  }, [dispatch]);

  // This component doesn't render anything
  return null;
};

export default SocketManager; 