import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { v4 as uuid } from 'uuid';
import Compressor from 'compressorjs';
import useRoom from '../hooks/useRoom';
import ChatMessages from '../components/ChatMessages';
import ChatFooter from '../components/ChatFooter';
import MediaPreview from '../components/MediaPreview';
import { Avatar, IconButton, Menu, MenuItem } from '@material-ui/core';
import './Chat.css';
import {
  AddPhotoAlternate,
  ArrowBack,
  MoreVert,
  Room,
} from '@material-ui/icons';
import { database, imagesStorage, createTimestamp } from '../firebase';
import { CHATS, MESSAGES, ROOMS, USERS } from '../firebase-constants';
import useChatMessages from '../hooks/useChatMessages';

export default function Chat({ user, page }) {
  const [messageInput, setMessageInput] = useState('');
  const [image, setImage] = useState(null);
  const [src, setSrc] = useState('');
  const { roomId } = useParams();
  const history = useHistory();
  const room = useRoom(roomId, user.uid);
  const messages = useChatMessages(roomId);
  console.log(messages);
  const onMessageChange = event => {
    setMessageInput(event.target.value);
  };

  const sendMessage = async e => {
    e.preventDefault();
    if (messageInput.trim() || (messageInput === '' && image)) {
      setMessageInput('');
      if (image) {
        closePreview();
      }
      const imageName = uuid();
      const newMessage = image
        ? {
            name: user.displayName,
            message: messageInput,
            uid: user.uid,
            timestamp: createTimestamp(),
            time: new Date().toUTCString(),
            imageUrl: 'uploading',
            imageName,
          }
        : {
            name: user.displayName,
            message: messageInput,
            uid: user.uid,
            timestamp: createTimestamp(),
            time: new Date().toUTCString(),
          };
      database
        .collection(USERS)
        .doc(user.uid)
        .collection(CHATS)
        .doc(roomId)
        .set({
          name: room.name,
          photoURL: room.photoURL || null,
          timestamp: createTimestamp(),
        });

      const doc = await database
        .collection(ROOMS)
        .doc(roomId)
        .collection(MESSAGES)
        .add(newMessage);

      if (image) {
        new Compressor(image, {
          quality: 0.7,
          maxWidth: 1920,
          async success(result) {
            setSrc('');
            setImage(null);
            await imagesStorage.child(imageName).put(result);
            const url = await imagesStorage.child(imageName).getDownloadURL();
            database
              .collection(ROOMS)
              .doc(roomId)
              .collection(MESSAGES)
              .doc(doc.id)
              .update({
                imageUrl: url,
              });
          },
        });
      }
    }
  };

  const showPreview = event => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setSrc(reader.result);
      };
    }
  };

  const closePreview = () => {
    setSrc('');
    setImage(null);
  };

  return (
    <div className='chat'>
      <div style={{ height: page.height }} className='chat__background' />
      <div className='chat__header'>
        {page.isMobile && (
          <IconButton onClick={history.goBack}>
            <ArrowBack />
          </IconButton>
        )}
        <div className='avatar__container'>
          <Avatar src={room?.photoURL} />
        </div>

        <div className='chat__header--info'>
          <h3 style={{ width: page.isMobile && page.width - 165 }}>
            {room?.name}
          </h3>
        </div>
        <div className='chat__header--right'>
          <input
            id='image'
            style={{ display: 'none' }}
            accept='image/*'
            type='file'
            onChange={showPreview}
          />
          <IconButton>
            <label htmlFor='image' style={{ cursor: 'pointer', height: 24 }}>
              <AddPhotoAlternate />
            </label>
          </IconButton>
          <IconButton>
            <MoreVert />
          </IconButton>
          <Menu id='menu' keepMounted open={false}>
            <MenuItem>Delete Room</MenuItem>
          </Menu>
        </div>
      </div>
      <div className='chat__body--container'>
        <div className='chat__body' style={{ height: page.height - 68 }}>
          {messages && (
            <ChatMessages messages={messages} user={user} roomId={roomId} />
          )}
        </div>
      </div>
      <MediaPreview src={src} closePreview={closePreview} />
      <ChatFooter
        messageInput={messageInput}
        sendMessage={sendMessage}
        onMessageChange={onMessageChange}
        image={image}
        room={room}
        user={user}
        roomId={roomId}
      />
    </div>
  );
}
