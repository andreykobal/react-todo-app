import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { MdOutlineClose } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { addTodoApi, updateTodoApi, updateTodoAndClearOthersApi } from '../slices/todoSlice';
import styles from '../styles/modules/modal.module.scss';
import Button from './Button';

const dropIn = {
  hidden: {
    opacity: 0,
    transform: 'scale(0.9)',
  },
  visible: {
    transform: 'scale(1)',
    opacity: 1,
    transition: {
      duration: 0.1,
      type: 'spring',
      damping: 25,
      stiffness: 500,
    },
  },
  exit: {
    transform: 'scale(0.9)',
    opacity: 0,
  },
};

function TodoModal({ type, modalOpen, setModalOpen, todo }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('incomplete');
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (type === 'update' && todo) {
      setTitle(todo.title);
      setStatus(todo.status);
    } else {
      setTitle('');
      setStatus('incomplete');
    }
  }, [type, todo, modalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if user is admin
    if (!user?.isAdmin) {
      toast.error('Only admin can add or update tasks');
      setModalOpen(false);
      return;
    }
    
    if (title === '') {
      toast.error('Please enter a title');
      return;
    }
    if (title && status) {
      if (type === 'add') {
        if (status === 'complete') {
          dispatch(
            addTodoApi({
              title,
              status: 'incomplete',
            })
          )
            .unwrap()
            .then((newTodo) => {
              dispatch(updateTodoAndClearOthersApi({
                ...newTodo,
                status: 'complete',
              }))
                .then(() => {
                  toast.success('Task added successfully');
                  setModalOpen(false);
                });
            })
            .catch((error) => {
              toast.error('Failed to add task');
              console.error(error);
            });
        } else {
          dispatch(
            addTodoApi({
              title,
              status,
            })
          )
            .unwrap()
            .then(() => {
              toast.success('Task added successfully');
              setModalOpen(false);
            })
            .catch((error) => {
              toast.error('Failed to add task');
              console.error(error);
            });
        }
      }
      if (type === 'update') {
        if (todo.title !== title || todo.status !== status) {
          if (status === 'complete' && todo.status !== 'complete') {
            dispatch(updateTodoAndClearOthersApi({ ...todo, title, status }))
              .unwrap()
              .then(() => {
                toast.success('Task updated successfully');
                setModalOpen(false);
              })
              .catch((error) => {
                toast.error('Failed to update task');
                console.error(error);
              });
          } else {
            dispatch(updateTodoApi({ ...todo, title, status }))
              .unwrap()
              .then(() => {
                toast.success('Task updated successfully');
                setModalOpen(false);
              })
              .catch((error) => {
                toast.error('Failed to update task');
                console.error(error);
              });
          }
        } else {
          toast.error('No changes made');
        }
      }
    }
  };

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          className={styles.wrapper}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.container}
            variants={dropIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className={styles.closeButton}
              onKeyDown={() => setModalOpen(false)}
              onClick={() => setModalOpen(false)}
              role="button"
              tabIndex={0}
              // animation
              initial={{ top: 40, opacity: 0 }}
              animate={{ top: -10, opacity: 1 }}
              exit={{ top: 40, opacity: 0 }}
            >
              <MdOutlineClose />
            </motion.div>

            <form className={styles.form} onSubmit={(e) => handleSubmit(e)}>
              <h1 className={styles.formTitle}>
                {type === 'add' ? 'Add' : 'Update'} TODO
              </h1>
              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label htmlFor="type">
                Status
                <select
                  id="type"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="incomplete">Incomplete</option>
                  <option value="complete">Completed</option>
                </select>
              </label>
              <div className={styles.buttonContainer}>
                <Button type="submit" variant="primary">
                  {type === 'add' ? 'Add Task' : 'Update Task'}
                </Button>
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TodoModal;
