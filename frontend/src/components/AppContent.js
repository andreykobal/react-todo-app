import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import styles from '../styles/modules/app.module.scss';
import TodoItem from './TodoItem';
import { fetchTodos } from '../slices/todoSlice';

const container = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};
const child = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

function AppContent() {
  const dispatch = useDispatch();
  const todoList = useSelector((state) => state.todo.todoList);
  const filterStatus = useSelector((state) => state.todo.filterStatus);
  const status = useSelector((state) => state.todo.status);
  const error = useSelector((state) => state.todo.error);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTodos())
        .unwrap()
        .catch((error) => {
          toast.error('Failed to fetch todos');
          console.error(error);
        });
    }
  }, [status, dispatch]);

  const sortedTodoList = [...todoList];
  sortedTodoList.sort((a, b) => new Date(b.time) - new Date(a.time));

  const filteredTodoList = sortedTodoList.filter((item) => {
    if (filterStatus === 'all') {
      return true;
    }
    return item.status === filterStatus;
  });

  let content;
  if (status === 'loading') {
    content = (
      <motion.p variants={child} className={styles.emptyText}>
        Loading...
      </motion.p>
    );
  } else if (status === 'failed') {
    content = (
      <motion.p variants={child} className={styles.emptyText}>
        Error: {error}
      </motion.p>
    );
  } else if (filteredTodoList && filteredTodoList.length > 0) {
    content = filteredTodoList.map((todo) => (
      <TodoItem key={todo.id} todo={todo} />
    ));
  } else {
    content = (
      <motion.p variants={child} className={styles.emptyText}>
        No Todos
      </motion.p>
    );
  }

  return (
    <motion.div
      className={styles.content__wrapper}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>{content}</AnimatePresence>
    </motion.div>
  );
}

export default AppContent;
