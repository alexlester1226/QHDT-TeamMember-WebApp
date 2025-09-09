import React, { useContext } from 'react';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext'; // Import the UserContext

export default function AccountMenu() {
    const { userInfo, updateUser } = useContext(UserContext); // Get user info from UserContext
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate(); // useNavigate should be called directly inside functional component

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
    
    const handleNavigation = (path) => {
        navigate(path);
        localStorage.removeItem('userInfo');
        handleClose(); // Close the drawer after navigation
    };
  
    return (
      <React.Fragment>
        <Tooltip title="Account settings">
          <div className='header_profile' onClick={handleClick}>
          <div className='profile_info'>
            {userInfo && userInfo.first_name !== null && userInfo.last_name !== null && (
              <div className='profile_name'>{userInfo.first_name} {userInfo.last_name}</div>
            )}
            {userInfo && userInfo.type && (
              <div className='profile_role'>{userInfo.type}</div>
            )}
          </div>
            <div className='profile_icon'>
              <AccountCircleIcon fontSize="large" />
            </div>
          </div>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              width: 200, // Set the width here
              maxHeight: 200, // Set the maxHeight here
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => handleNavigation('/sign-in')}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </React.Fragment>
    );
}
