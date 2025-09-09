import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import './Header.css';
import AccountMenu from './AccountMenu'; // Import the AccountMenu component
import UserContext from './UserContext';

function Header() {
  const { userInfo, updateUser } = useContext(UserContext); // Get user info from UserContext
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate(); // useNavigate should be called directly inside functional component

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleMenuClick = () => {
    setIsDrawerOpen(true);
  };

  // Function to handle navigation when clicking on an icon
  const handleNavigation = (path) => {
    navigate(path);
    window.location.reload();
    handleDrawerClose(); // Close the drawer after navigation
  };

  useEffect(() => {
    console.log(userInfo);
    if (userInfo === null) {
      navigate('/sign-in');
    }
  }, [userInfo, navigate]);

  return (
    <div className='header'>
      <div className='header_menu'>
        <IconButton onClick={handleMenuClick}>
          <MenuIcon />
        </IconButton>
        <Drawer anchor="left" open={isDrawerOpen} onClose={handleDrawerClose}>
          <List className="drawer">
            <ListItem className="drawer-list" onClick={() => handleNavigation('/')}>
              <ListItemIcon className="drawer-item">
                <HomeIcon />
                <p>Home</p>
              </ListItemIcon>
            </ListItem>
            {userInfo && userInfo.team &&  (
              <ListItem className="drawer-list" onClick={() => handleNavigation(`/team/${userInfo.team}`)}>
              <ListItemIcon className="drawer-item">
                <GroupsIcon />
                <p>Team</p>
              </ListItemIcon>
            </ListItem>
            )}
            <ListItem className="drawer-list" onClick={() => handleNavigation('/timeline')}>
              <ListItemIcon className="drawer-item">
                <CalendarMonthIcon />
                <p>Timeline</p>
              </ListItemIcon>
            </ListItem>
            {userInfo && userInfo.type === 'Admin' && (
              <ListItem className="drawer-list" onClick={() => handleNavigation('/admin')}>
                <ListItemIcon className="drawer-item">
                  <LocalPoliceIcon />
                  <p>Admin</p>
                </ListItemIcon>
              </ListItem>
            )}
          </List>
        </Drawer>
      </div>
      <div className='header_title'>QHDT Member Management System</div>
      <div>
        <AccountMenu />
      </div>
    </div>
  );
}

export default Header;
