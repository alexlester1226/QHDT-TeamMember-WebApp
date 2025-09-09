import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from './Main';
import SignIn from './SignIn';
import NotFound from './NotFound';
import Team from './Team.js';
import Timeline from './Timeline.js';
import Admin from './Admin.js';
import UserContext, { UserProvider } from './UserContext'; // Import UserContext as default export and UserProvider as named export

function App() {
  const [error, setError] = useState('');
  const [teamInfo, setTeam] = useState('');
  const { userInfo } = useContext(UserContext); // Get user info from UserContext
  console.log("userInfo:", userInfo);

  useEffect(() => {
    async function fetchData() {
      const requestBody = {
        team: userInfo !== null && userInfo.team !== null ? userInfo.team : ""
      };

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}search_team/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const result = await response.json();
        const usersWithInfo = await getUser(result.users); // Call getUser asynchronously
        result.users = usersWithInfo;

        const memosWithInfo = await getMemo(result.memos);
        result.memos = memosWithInfo;
  
        setTeam(result);
        console.log(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

  
    async function getUser(users) {
      try {
        const array = [];
        for (let i = 0; i < users.length; i++) {
          const response = await fetch(`${process.env.REACT_APP_API_URL}get_user/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: users[i],
            }),
          });
  
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
  
          const result = await response.json();
          array.push(result); // Use array.push to append result
          // console.log(result);
        }
        return array;
      } catch (error) {
        console.error('Error fetching data:', error);
        return []; // Return an empty array in case of error
      }
    }

    async function getMemo(memos) {
      try {
        const array = [];
        for (let i = 0; i < memos.length; i++) {
          const response = await fetch(`${process.env.REACT_APP_API_URL}get_memo/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: memos[i],
            }),
          });
  
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
  
          const result = await response.json();
          array.push(result); // Use array.push to append result
          // console.log(result);
        }
        return array;
      } catch (error) {
        console.error('Error fetching data:', error);
        return []; // Return an empty array in case of error
      }
    }
  
    fetchData();
  }, [userInfo]);
  
  
  
  return (
    <Router>
      <div className="App">
        <UserProvider> 
          <Routes>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/" element={<Main />} />
            {userInfo && userInfo.team && teamInfo && teamInfo.name && teamInfo.title && teamInfo.users && teamInfo.memos && (
              <Route path={`/team/${userInfo.team}`} element={
                <Team
                name={teamInfo.name}
                title={teamInfo.title}
                users={teamInfo.users}
                memos={teamInfo.memos}
                bio={teamInfo.bio}
              />} />
            )}
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </UserProvider>
      </div>
    </Router>
  );
}

export default App;
