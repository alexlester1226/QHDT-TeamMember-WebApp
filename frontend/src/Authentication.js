import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext';

const Authentication = () => {
  const navigate = useNavigate();
  const user = useContext(UserContext);

  useEffect(() => {
    if (!user.userInfo) {
      // Redirect to login page if user info is not available
      navigate('/login');
    }
  }, [user.userInfo, navigate]);

  return null;
};

export default Authentication;
