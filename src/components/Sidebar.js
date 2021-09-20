import React, { useState } from 'react';
import { Avatar, IconButton } from '@material-ui/core';
import { NavLink, Route, Switch } from 'react-router-dom';
import {
  Add,
  ExitToApp,
  Home,
  Message,
  PeopleAlt,
  SearchOutlined,
} from '@material-ui/icons';
import { auth, createTimestamp, database } from '../firebase';
import SidebarList from './SidebarList';
import './Sidebar.css';
import { ROOMS } from '../firebase-constants';
import useRooms from '../hooks/useRooms';
import useUsers from '../hooks/useUsers';

export default function Sidebar({ user, page }) {
  const rooms = useRooms();
  const users = useUsers(user);
  // console.log({ rooms });
  const [menu, setMenu] = useState(1);

  const signOut = () => {
    auth.signOut();
  };

  const addRoom = () => {
    const roomName = prompt('Give your room a name.');
    if (roomName.trim()) {
      database.collection(ROOMS).add({
        name: roomName,
        timestamp: createTimestamp(),
      });
    }
  };

  let Nav;

  if (page.isMobile) {
    Nav = NavLink;
  } else {
    Nav = ({ activeClass, onClick, children }) => (
      <div
        className={`${activeClass ? 'sidebar__menu--selected' : ''}`}
        onClick={onClick}>
        {children}
      </div>
    );
  }

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
      <div className='sidebar__search'>
        <form className='sidebar__search--container'>
          <SearchOutlined />
          <input
            type='text'
            id='search'
            placeholder='Search for users or chats'
          />
        </form>
      </div>

      <div className='sidebar__menu'>
        <Nav
          to='/chats'
          onClick={() => setMenu(1)}
          activeClass={menu === 1}
          activeClassName='sidebar__menu--selected'>
          <div className='sidebar__menu--home'>
            <Home
              style={{
                backgroundColor: menu === 1 ? 'white' : '',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
              }}
            />
            <div className='sidebar__menu--line' />
          </div>
        </Nav>
        <Nav
          to='/rooms'
          onClick={() => setMenu(2)}
          activeClass={menu === 2}
          activeClassName='sidebar__menu--selected'>
          <div className='sidebar__menu--rooms'>
            <Message
              style={{
                backgroundColor: menu === 2 ? 'white' : '',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
              }}
            />
            <div className='sidebar__menu--line' />
          </div>
        </Nav>
        <Nav
          to='/users'
          onClick={() => setMenu(3)}
          activeClass={menu === 3}
          activeClassName='sidebar__menu--selected'>
          <div className='sidebar__menu--users'>
            <PeopleAlt
              style={{
                backgroundColor: menu === 3 ? 'white' : '',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                padding: '2px',
              }}
            />
            <div className='sidebar__menu--line' />
          </div>
        </Nav>
      </div>

      {page.isMobile ? (
        <Switch>
          <Route path='/chats'>
            <SidebarList title='Chats' data={[]} />
          </Route>
          <Route path='/rooms'>
            <SidebarList title='Rooms' data={rooms} />
          </Route>
          <Route path='/users'>
            <SidebarList title='Users' data={[]} />
          </Route>
          <Route path='/search'>
            <SidebarList title='Search Results' data={[]} />
          </Route>
        </Switch>
      ) : menu === 1 ? (
        <SidebarList title='Chats' data={[]} />
      ) : menu === 2 ? (
        <SidebarList title='Rooms' data={rooms} />
      ) : menu === 3 ? (
        <SidebarList title='Users' data={users} />
      ) : menu === 4 ? (
        <SidebarList title='Search Results' data={[]} />
      ) : null}

      <div className='sidebar__chat--addRoom'>
        <IconButton className='addRoomButton' onClick={addRoom}>
          <Add style={{ fontSize: '30px', fontWeight: '900' }} />
        </IconButton>
      </div>
    </div>
  );
}
