import React, { useEffect, useState, useContext } from 'react';
import UserContext from './UserContext'; // Import the UserContext
import Header from './Header'
import TeamHeader from './TeamHeader';
import Divider from '@mui/material/Divider';
import Copyright from './Copyright';
import './Team.css';
import { IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Person from './Person';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { styled } from '@mui/material/styles';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));




function Team({ name, title, users = [], memos =[], bio}) { 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogDelOpen, setIsDialogDelOpen] = useState(false);

  const [titleCreateMain, setTitleCreateMain] = useState('');
  const [titleDelMain, setTitleDelMain] = useState('');

  const [contentMain, setContentMain] = useState('');

  const handleTitleChangeCreateMain = (e) => {
    setTitleCreateMain(e.target.value);
  };

  const handleTitleChangeDelMain = (e) => {
    setTitleDelMain(e.target.value);
  };

  const handleContentChangeMain = (e) => {
    setContentMain(e.target.value);
  };

  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  const handleDelClick = () => {
    setIsDialogDelOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIsDialogDelOpen(false);
    allFalse();
  };

  const allFalse = () => {
    setTitleCreateMain("");
    setContentMain("");
    setTitleDelMain("");
   
  };

  const createMemo = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/memos/create_memo/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: titleCreateMain,
          body: contentMain,
          team: bio,
          
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log('Post created successfully:', responseData);
        alert('Post created successfully!');
        window.location.reload();
        // You can update state or perform other actions after successful creation
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      // Handle error, show error message, etc.
    }
  };

  const deletePost = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/memos/delete_memo/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: titleDelMain,
        }),
      });
      if (response.ok) {
        console.log('Post deleted successfully');
        alert('Post deleted successfully!');
        window.location.reload();
        // You can update state or perform other actions after successful deletion
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      // Handle error, show error message, etc.
    }
  };


  const formatDate = (dateString) => {
    const dateObject = new Date(dateString);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const formattedDate = dateObject.toLocaleDateString('en-US', options);

    const day = dateObject.getDate();
    const daySuffix = (day) => {
      if (day >= 11 && day <= 13) {
        return 'th';
      }
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    const formattedDay = `${day}${daySuffix(day)}`;
    return formattedDate.replace(/\d+/, formattedDay);
  };

  return (
    <div>
      <Header />
      <TeamHeader 
       name={name}
       title={title}
      />
      <Divider />
      <div className='col'>
        <div className='team-announcements'>
          <div className='team-header'>
            <h1>Announcements</h1>
            <AddCircleOutlineIcon className="icon" fontSize="large" onClick={handleAddClick}/>
            <BootstrapDialog
            onClose={handleDialogClose}
            aria-labelledby="customized-dialog-title"
            open={isDialogOpen}
        >
            <div style={{ padding: '16px' }}>
                <h2>Create Announcements</h2>
                <div className="form-group">
                    <label>Title:</label>
                    <input type="text" value={titleCreateMain} onChange={handleTitleChangeCreateMain} />
                </div>
                <div className="form-group">
                    <label>Content:</label>
                    <textarea value={contentMain} onChange={handleContentChangeMain} />
                </div>
                <button onClick={createMemo}>Add Post</button>
            </div>
        </BootstrapDialog>
            <HighlightOffIcon className="icon" fontSize="large"  onClick={handleDelClick}/>
            <BootstrapDialog
            onClose={handleDialogClose}
            aria-labelledby="customized-dialog-title"
            open={isDialogDelOpen}
        >
            <div style={{ padding: '16px' }}>
                <h2>Delete Announcements</h2>
                <div className="form-group">
                    <label>Title:</label>
                    <input type="text" value={titleDelMain} onChange={handleTitleChangeDelMain} />
                </div>
                <button onClick={deletePost}>Delete Post</button>
            </div>
        </BootstrapDialog>
          </div>
          {memos.slice().reverse().map(memo => (
             <div className="team-announcement">
             <h2>{memo.title}</h2>
             <span className="date">{formatDate(memo.created_at)}</span>
             <p>{memo.body}</p>
           </div>
          ))}
        </div>
        <div className='team-members'>
          <h2>Team Members</h2>
          {users.map(user => (
            <Person
              key={user.id}
              firstName={user.first_name}
              lastName={user.last_name}
              type={user.type}
            />
          ))}
        </div>
      </div>
      <Copyright />
    </div>
  )
}

export default Team

