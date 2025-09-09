import React from 'react'
import './TeamHeader.css';

function TeamHeader({name, title}) {
  return (
    <div className='title'>
        <h1 className='team-name'>{name}</h1>
        <p className='team-description'>{title}</p>
    </div>
  )
}

export default TeamHeader

