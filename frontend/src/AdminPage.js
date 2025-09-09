import React, { useState } from 'react';
import './AdminPage.css';

const AdminPage = () => {
  const [titleDeleteMain, setTitleDeleteMain] = useState('');
  const [titleDeleteTime, setTitleDeleteTime] = useState('');

  const [titleCreateMain, setTitleCreateMain] = useState('');
  const [titleCreateTime, setTitleCreateTime] = useState('');
  const [contentMain, setContentMain] = useState('');
  const [contentTimeLine, setContentTimeLine] = useState('');
  const [team, setTeam] = useState('');
  const [date, setDate] = useState('');

  const handleTitleChangeCreateTime = (e) => {
    setTitleCreateTime(e.target.value);
  };

  const handleTitleChangeCreateMain = (e) => {
    setTitleCreateMain(e.target.value);
  };

  const handleTitleChangeDeleteMain = (e) => {
    setTitleDeleteMain(e.target.value);
  };

  const handleTitleChangeDeleteTime = (e) => {
    setTitleDeleteTime(e.target.value);
  };

  const handleContentChangeMain = (e) => {
    setContentMain(e.target.value);
  };

  const handleContentChangeTime = (e) => {
    setContentTimeLine(e.target.value);
  };

  const handleTeamChange = (e) => {
    setTeam(e.target.value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const createPost = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/create_post/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: titleCreateMain,
          body: contentMain,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log('Post created successfully:', responseData);
        alert('Post created successfully!');

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/delete_post/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: titleDeleteMain,
        }),
      });
      if (response.ok) {
        console.log('Post deleted successfully');
        alert('Post deleted successfully!');
        // You can update state or perform other actions after successful deletion
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      // Handle error, show error message, etc.
    }
  };

  const createTimelineEntry = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/timeline/create_timeline_entry/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: titleCreateTime,
          description: contentTimeLine,
          team: team,
          date: date,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log('Timeline entry created successfully:', responseData);
        alert('Timeline entry created successfully!');

        // You can update state or perform other actions after successful creation
      } else {
        throw new Error('Failed to create timeline entry');
      }
    } catch (error) {
      console.error('Error creating timeline entry:', error);
      // Handle error, show error message, etc.
    }
  };

  const deleteTimelineEntry = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/timeline/delete_timeline_entry/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: titleDeleteTime,
        }),
      });
      if (response.ok) {
        console.log('Timeline entry deleted successfully');
        alert('Timeline entry deleted successfully!');
        // You can update state or perform other actions after successful deletion
      } else {
        throw new Error('Failed to delete timeline entry');
      }
    } catch (error) {
      console.error('Error deleting timeline entry:', error);
      // Handle error, show error message, etc.
    }
  };

  return (
    <div>
    <div className="admin-container"> {/* Parent container */}
      <div className="container">
        <h2>Create Announcements</h2>
        <div className="form-group">
          <label>Title:</label>
          <input type="text" value={titleCreateMain} onChange={handleTitleChangeCreateMain} />
        </div>
        <div className="form-group">
          <label>Content:</label>
          <textarea value={contentMain} onChange={handleContentChangeMain} />
        </div>
        <button onClick={createPost}>Add Post</button>
      </div>

      <div className="container">
        <h2>Delete Announcements</h2>
        <div className="form-group">
          <label>Title:</label>
          <input type="text" value={titleDeleteMain} onChange={handleTitleChangeDeleteMain} />
        </div>
        <button onClick={deletePost}>Delete Post</button>
      </div>
      </div>

    <div className="admin-container"> {/* Parent container */}
      <div className="container">
        <h2>Create Timeline Entry</h2>
        <div className="form-group">
          <label>Title:</label>
          <input type="text" value={titleCreateTime} onChange={handleTitleChangeCreateTime} />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea value={contentTimeLine} onChange={handleContentChangeTime} />
        </div>
        <div className="form-group">
          <label>Team:</label>
          <input type="text" value={team} onChange={handleTeamChange} />
        </div>
        <div className="form-group">
          <label>Date:</label>
          <input type="text" value={date} onChange={handleDateChange} />
        </div>
        <button onClick={createTimelineEntry}>Add Timeline Entry</button>
      </div>

      <div className="container">
        <h2>Delete Timeline Entry</h2>
        <div className="form-group">
          <label>Title:</label>
          <input type="text" value={titleDeleteTime} onChange={handleTitleChangeDeleteTime} />
        </div>
        <button onClick={deleteTimelineEntry}>Delete Timeline Entry</button>
      </div>
    </div>
    </div>

  );
};

export default AdminPage;
