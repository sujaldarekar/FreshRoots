import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, selectUser, selectAuthLoading, selectAuthError } from '../redux/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const logoutUser = () => {
    dispatch(logout());
    navigate('/');
  };

  const isFarmer = user?.role === 'farmer';
  const isCustomer = user?.role === 'customer';
  const isAuthenticated = !!user;

  return { user, isLoading, error, logoutUser, isFarmer, isCustomer, isAuthenticated };
};

export default useAuth;
