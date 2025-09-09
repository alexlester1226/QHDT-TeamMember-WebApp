import React, { createContext, useEffect, useState } from 'react';

const UserContext = createContext();

// export const AuthUser = ({children}) = > {
// };

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    // Get user info from localStorage if available
    const storedUserInfo = localStorage.getItem('userInfo');
    return storedUserInfo ? JSON.parse(storedUserInfo) : null;
  });

  useEffect(() => {
    // Save user info to localStorage
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, [userInfo]);

  const updateUser = (data) => {
    setUserInfo(data);
  };

  return (
    <UserContext.Provider value={{ userInfo, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
