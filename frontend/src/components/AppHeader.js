import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button, { SelectButton } from './Button';
import styles from '../styles/modules/app.module.scss';
import TodoModal from './TodoModal';
import LoginModal from './LoginModal';
import { updateFilterStatus } from '../slices/todoSlice';
import { logout } from '../slices/authSlice';

function AppHeader() {
  const [modalOpen, setModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const initialFilterStatus = useSelector((state) => state.todo.filterStatus);
  const [filterStatus, setFilterStatus] = useState(initialFilterStatus);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const updateFilter = (e) => {
    setFilterStatus(e.target.value);
    dispatch(updateFilterStatus(e.target.value));
  };
  
  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className={styles.appHeader}>
      <div className={styles.appHeaderLeft}>
        {user?.isAdmin ? (
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Add Task
          </Button>
        ) : null}
        <SelectButton
          id="status"
          onChange={(e) => updateFilter(e)}
          value={filterStatus}
        >
          <option value="all">All</option>
          <option value="incomplete">Incomplete</option>
          <option value="complete">Completed</option>
        </SelectButton>
      </div>
      
      <div className={styles.appHeaderRight}>
        {user ? (
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{user.email}</span>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setLoginModalOpen(true)}>
            Login
          </Button>
        )}
      </div>
      
      <TodoModal type="add" modalOpen={modalOpen} setModalOpen={setModalOpen} />
      <LoginModal modalOpen={loginModalOpen} setModalOpen={setLoginModalOpen} />
    </div>
  );
}

export default AppHeader;
