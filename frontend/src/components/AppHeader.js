import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button, { SelectButton } from './Button';
import styles from '../styles/modules/app.module.scss';
import TodoModal from './TodoModal';
import LoginModal from './LoginModal';
import { updateFilterStatus, updateSortOrder } from '../slices/todoSlice';
import { logout } from '../slices/authSlice';

function AppHeader() {
  const [modalOpen, setModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const initialFilterStatus = useSelector((state) => state.todo.filterStatus);
  const initialSortOrder = useSelector((state) => state.todo.sortOrder);
  const [filterStatus, setFilterStatus] = useState(initialFilterStatus);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  // Always sort by completion count ascending for all users
  useEffect(() => {
    dispatch(updateSortOrder('asc'));
    // Set default filter to 'all' since we're removing the filter dropdown
    dispatch(updateFilterStatus('all'));
  }, [dispatch]);

  const updateSort = (e) => {
    setSortOrder(e.target.value);
    dispatch(updateSortOrder(e.target.value));
  };
  
  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className={styles.appHeader}>
      <div className={styles.appHeaderLeft}>
        {user?.isAdmin ? (
          <>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Add Task
            </Button>
            {/* Only admins can see and change sort order */}
            <SelectButton
              id="sortOrder"
              onChange={(e) => updateSort(e)}
              value={sortOrder}
            >
              <option value="asc">Sort by Count (Low to High)</option>
              <option value="desc">Sort by Count (High to Low)</option>
            </SelectButton>
          </>
        ) : null /* Regular users don't get any controls */}
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
