import { format } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTodoApi, updateTodoStatusApi, updateTodoAndClearOthersApi, setRequireLogin, setPendingTodo } from '../slices/todoSlice';
import styles from '../styles/modules/todoItem.module.scss';
import { getClasses } from '../utils/getClasses';
import CheckButton from './CheckButton';
import TodoModal from './TodoModal';
import LoginModal from './LoginModal';

const child = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

function TodoItem({ todo }) {
  const dispatch = useDispatch();
  const [checked, setChecked] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const requireLogin = useSelector((state) => state.todo.requireLogin);
  const pendingTodo = useSelector((state) => state.todo.pendingTodo);
  
  useEffect(() => {
    // If user is not logged in, always show todos as incomplete
    if (!user) {
      setChecked(false);
    } else {
      // For logged in users, show the actual completion status
      if (todo.status === 'complete' && todo.userId === user.id) {
        setChecked(true);
      } else {
        setChecked(false);
      }
    }
  }, [todo.status, todo.userId, user]);
  
  // Open login modal when authentication is required
  useEffect(() => {
    if (requireLogin && pendingTodo && pendingTodo.id === todo.id) {
      setLoginModalOpen(true);
    }
  }, [requireLogin, pendingTodo, todo.id]);

  const handleCheck = () => {
    // If user not logged in, trigger the login modal
    if (!user && !checked) {
      dispatch(setRequireLogin(true));
      dispatch(setPendingTodo(todo));
      return;
    }
    
    setChecked(!checked);
    
    // If we're checking the task (making it complete), use the updateTodoAndClearOthersApi
    // to ensure only one task can be checked at a time
    if (!checked) {
      dispatch(
        updateTodoAndClearOthersApi({ ...todo, status: 'complete' })
      )
        .unwrap()
        .then((result) => {
          if (!result.requireLogin) {
            toast.success('Task marked as complete');
          }
        })
        .catch((error) => {
          toast.error('Failed to update task status');
          setChecked(false); // Revert the UI change
          console.error(error);
        });
    } else {
      // If we're unchecking, use the updateTodoStatusApi instead of updateTodoApi
      // since regular users need to use the PATCH endpoint
      dispatch(
        updateTodoStatusApi({ id: todo.id, status: 'incomplete' })
      )
        .unwrap()
        .then(() => {
          toast.success('Task marked as incomplete');
        })
        .catch((error) => {
          toast.error('Failed to update task status');
          setChecked(true); // Revert the UI change
          console.error(error);
        });
    }
  };

  const handleDelete = () => {
    // Only admin can delete todos
    if (!user?.isAdmin) {
      toast.error('Only admin can delete tasks');
      return;
    }
    
    dispatch(deleteTodoApi(todo.id))
      .unwrap()
      .then(() => {
        toast.success('Todo deleted successfully');
      })
      .catch((error) => {
        toast.error('Failed to delete task');
        console.error(error);
      });
  };

  const handleUpdate = () => {
    // Only admin can update todos
    if (!user?.isAdmin) {
      toast.error('Only admin can update tasks');
      return;
    }
    
    setUpdateModalOpen(true);
  };

  return (
    <>
      <motion.div className={styles.item} variants={child}>
        <div className={styles.todoDetails}>
          <CheckButton checked={checked} handleCheck={handleCheck} />
          <div className={styles.texts}>
            <p
              className={getClasses([
                styles.todoText,
                checked && styles['todoText--completed'],
              ])}
            >
              {todo.title}
            </p>
            <p className={styles.time}>
              {format(new Date(todo.time), 'p, MM/dd/yyyy')}
            </p>
          </div>
        </div>
        <div className={styles.todoActions}>
          {user?.isAdmin && (
            <>
              <div
                className={styles.icon}
                onClick={() => handleDelete()}
                onKeyDown={() => handleDelete()}
                tabIndex={0}
                role="button"
              >
                <MdDelete />
              </div>
              <div
                className={styles.icon}
                onClick={() => handleUpdate()}
                onKeyDown={() => handleUpdate()}
                tabIndex={0}
                role="button"
              >
                <MdEdit />
              </div>
            </>
          )}
        </div>
      </motion.div>
      <TodoModal
        type="update"
        modalOpen={updateModalOpen}
        setModalOpen={setUpdateModalOpen}
        todo={todo}
      />
      <LoginModal 
        modalOpen={loginModalOpen} 
        setModalOpen={setLoginModalOpen} 
      />
    </>
  );
}

export default TodoItem;
