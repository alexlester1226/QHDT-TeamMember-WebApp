import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Copyright from './Copyright';
import UserContext from './UserContext'; // Import the UserContext
import './Main.css';

const Main = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const user = useContext(UserContext); // Get user info from UserContext

  useEffect(() => {
    console.log('sign-in');
    async function fetchData() {
      console.log(process.env.REACT_APP_API_URL);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/posts`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log(result);
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Redirect to login page if there's an error fetching data and user is not logged in
        if (!user.userInfo) {
          console.log('sign-in');
          navigate('/sign-in');
        }
      }
    }

    fetchData();
  }, [navigate, user.userInfo]);

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
      {/* Display user information */}
  
      <div className='announcements'>
        <h1>Announcements</h1>
        {data.slice().reverse().map((announcement, index) => (
          <div className="announcement" key={index}>
            <h2>{announcement.title}</h2>
            <span className="date">{formatDate(announcement.created_at)}</span>
            <p>{announcement.body}</p>
          </div>
        ))}
      </div>
      <Copyright />
    </div>
  );
};

export default Main;
