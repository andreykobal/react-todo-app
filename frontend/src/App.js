import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppContent from './components/AppContent';
import AppHeader from './components/AppHeader';
import PageTitle from './components/PageTitle';
import LoginHandler from './components/LoginHandler';
import LoginModal from './components/LoginModal';
import SocketManager from './components/SocketManager';
import styles from './styles/modules/app.module.scss';
import { fetchTodos } from './slices/todoSlice';

function App() {
  const dispatch = useDispatch();
  const requireLogin = useSelector((state) => state.todo.requireLogin);
  const user = useSelector((state) => state.auth.user);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  
  useEffect(() => {
    // Open login modal if login is required (e.g., when trying to complete a task)
    if (requireLogin) {
      setLoginModalOpen(true);
    } else {
      setLoginModalOpen(false);
    }
  }, [requireLogin]);
  
  useEffect(() => {
    // Fetch todos when component mounts
    dispatch(fetchTodos());
  }, [dispatch]);
  
  return (
    <Router>
      {/* Socket Manager for real-time updates */}
      <SocketManager />
      
      <div className="container">
        <PageTitle>
          TODO List
          {user?.isAdmin && (
            <span style={{ color: 'red', marginLeft: '5px' }}>(admin)</span>
          )}
        </PageTitle>
        <div className={styles.app__wrapper}>
          <AppHeader />
          <AppContent />
        </div>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontSize: '1.4rem',
          },
        }}
      />
      <LoginModal 
        modalOpen={loginModalOpen} 
        setModalOpen={setLoginModalOpen} 
      />
      <Switch>
        <Route path="/login">
          <LoginHandler />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
