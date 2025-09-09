// PersonBlock.js
import React from 'react';
import './Person.css'; // Import CSS file for styling
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


function Person({ firstName, lastName, type }) {
  return (
    <div className='person-block'>
      <div className='person-info'>
        <div className='person-icon'> 
          <AccountCircleIcon fontSize="large" />
        </div>
        <div className='person-name'>
          <p>{firstName} {lastName} - {type}</p>
        </div>
      </div>
    </div>
  );
}

export default Person;
