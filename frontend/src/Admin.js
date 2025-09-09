import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import UserContext from './UserContext'; // Import the UserContext
import Header from './Header';
import AdminPage from './AdminPage';
import './Admin.css';
import Copyright from './Copyright';


function Admin() {
  const { userInfo, updateUser } = useContext(UserContext); // Get user info from UserContext
  const navigate = useNavigate(); // Get navigate function for navigation

  useEffect(() => {
    // If user is not an admin, navigate to '/'
    if (userInfo.type !== 'Admin') {
      navigate('/');
    }
  }, [userInfo.type, navigate]);

  return (
    <div>
      {/* {user && (
        <p>User Information: {JSON.stringify(user)}</p>
      )} */}
      {userInfo.type === 'Admin' ? (
        <div>
          <Header />
          <div className="admin-page-container">
            <AdminPage />
          </div>
          <Copyright />
        </div>
      ) : null}
    </div>
  );
}

export default Admin;
