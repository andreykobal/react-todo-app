import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import { verifyToken } from '../slices/authSlice';

function LoginHandler() {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // Extract token from URL query parameters
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    if (token) {
      // Verify the token
      dispatch(verifyToken(token))
        .unwrap()
        .then(() => {
          toast.success('Login successful');
          
          // Remove token from URL by redirecting to home
          history.replace('/');
        })
        .catch((err) => {
          console.error('Login failed:', err);
          toast.error(error || 'Login failed. Please try again.');
          
          // Remove invalid token from URL
          history.replace('/');
        });
    }
  }, [dispatch, location.search, history, error]);

  return null; // This component doesn't render anything visible
}

export default LoginHandler; 