import React, { useState, useEffect } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { requestMagicLink, resetMagicLinkStatus } from '../slices/authSlice';
import { setRequireLogin, setPendingTodo } from '../slices/todoSlice';
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

function LoginModal({ modalOpen, setModalOpen }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const { status, error, magicLinkSent } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (magicLinkSent) {
      setEmail('');
    }
  }, [magicLinkSent]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    dispatch(requestMagicLink(email));
  };
  
  const handleClose = () => {
    setModalOpen(false);
    
    // Reset states
    dispatch(resetMagicLinkStatus());
    dispatch(setRequireLogin(false));
    dispatch(setPendingTodo(null));
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
              onKeyDown={handleClose}
              onClick={handleClose}
              role="button"
              tabIndex={0}
              initial={{ top: 40, opacity: 0 }}
              animate={{ top: -10, opacity: 1 }}
              exit={{ top: 40, opacity: 0 }}
            >
              <MdOutlineClose />
            </motion.div>
            
            <form className={styles.form} onSubmit={handleSubmit}>
              <h1 className={styles.formTitle}>
                {magicLinkSent ? 'Check Your Email' : 'Log In'}
              </h1>
              
              {magicLinkSent ? (
                <div className={styles.messageContainer}>
                  <p className={styles.message}>
                    We've sent a magic link to your email address. Click the link in the email to log in.
                  </p>
                  <div className={styles.buttonContainer}>
                    <Button type="button" variant="primary" onClick={handleClose}>
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.messageContainer}>
                    <p className={styles.message}>
                      Enter your email address to receive a login link
                    </p>
                  </div>
                  
                  <label htmlFor="email">
                    Email
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </label>
                  
                  {error && <p className={styles.error}>{error}</p>}
                  
                  <div className={styles.buttonContainer}>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? 'Sending...' : 'Send Login Link'}
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoginModal; 