import React from 'react';
import { Avatar, IconButton } from '@material-ui/core';
import './Sidebar.css';
import { ExitToApp } from '@material-ui/icons';
import { auth } from '../firebase';

export default function Sidebar({ user, page }) {
  const signOut = () => {
    auth.signOut();
  };
  return (
    <div
      className='sidebar'
      style={{
        minHeight: page.isMobile ? page.height : 'auto',
      }}>
      <div className='sidebar__header'>
        <div className='sidebar__header--left'>
          <Avatar src={user?.photoURL} />
          <h4 style={{ color: 'white' }}>{user?.displayName}</h4>
        </div>
        <div className='sidebar__header--right'>
          <IconButton onClick={signOut} color='default'>
            <ExitToApp color='action' />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
