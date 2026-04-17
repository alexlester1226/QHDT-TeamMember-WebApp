import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext';
import AdminPage from './AdminPage';

export default function Admin() {
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo && userInfo.type !== 'Admin') {
      navigate('/');
    }
  }, [userInfo, navigate]);

  if (!userInfo || userInfo.type !== 'Admin') return null;
  return <AdminPage />;
}
