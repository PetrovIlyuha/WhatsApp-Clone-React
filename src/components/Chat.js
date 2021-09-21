import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { v4 as uuid } from 'uuid';
import Compressor from 'compressorjs';
import useRoom from '../hooks/useRoom';
import ChatMessages from '../components/ChatMessages';
import ChatFooter from '../components/ChatFooter';
import MediaPreview from '../components/MediaPreview';
import {
  Avatar,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
} from '@material-ui/core';
import './Chat.css';
import { AddPhotoAlternate, ArrowBack, MoreVert } from '@material-ui/icons';
import {
  database,
  imagesStorage,
  createTimestamp,
  audioStorage,
} from '../firebase';
import { CHATS, MESSAGES, ROOMS, USERS } from '../firebase-constants';
import useChatMessages from '../hooks/useChatMessages';

export default function Chat({ user, page }) {
  const [messageInput, setMessageInput] = useState('');
  const [image, setImage] = useState(null);
  const [src, setSrc] = useState('');
  const [audioId, setAudioId] = useState('');
  const [openMenu, setOpenMenu] = useState(false);
  const [isDeletingRoom, setDeletingRoom] = useState(false);
  const { roomId } = useParams();
  const history = useHistory();
  const room = useRoom(roomId, user.uid);
  const messages = useChatMessages(roomId);
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

  const deleteRoom = async () => {
    setOpenMenu(false);
    setDeletingRoom(true);

    try {
      const roomReference = database.collection(ROOMS).doc(roomId);
      const roomMessages = await roomReference.collection(MESSAGES).get();
      const roomAudioFiles = [];
      const roomImages = [];
      roomMessages.docs.forEach(doc => {
        if (doc.data().audioName) {
          roomAudioFiles.push(doc.data().audioName);
        } else if (doc.data().imageName) {
          roomImages.push(doc.data().imageName);
        }
      });
      await Promise.all([
        ...roomMessages.docs.map(doc => doc.ref.delete()),
        ...roomImages.map(image => imagesStorage.child(image).delete()),
        ...roomAudioFiles.map(audioFile =>
          audioStorage.child(audioFile).delete(),
        ),
        database
          .collection(USERS)
          .doc(user.uid)
          .collection(CHATS)
          .doc(roomId)
          .delete(),
        roomReference.delete(),
      ]);
    } catch (error) {
      console.error('error deleting room', error.message);
    } finally {
      setDeletingRoom(false);
      page.isMobile ? history.goBack() : history.replace('/chats');
    }
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
          <IconButton onClick={e => setOpenMenu(e.currentTarget)}>
            <MoreVert />
          </IconButton>
          <Menu
            id='menu'
            anchorEl={openMenu}
            keepMounted
            open={Boolean(openMenu)}
            onClose={() => setOpenMenu(null)}>
            <MenuItem onClick={deleteRoom}>Delete Room</MenuItem>
          </Menu>
        </div>
      </div>
      <div className='chat__body--container'>
        <div className='chat__body' style={{ height: page.height - 68 }}>
          {messages && (
            <ChatMessages
              messages={messages}
              user={user}
              roomId={roomId}
              audioId={audioId}
              setAudioId={setAudioId}
            />
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
        setAudioId={setAudioId}
      />

      {isDeletingRoom && (
        <div className='chat__deleting'>
          <CircularProgress />
        </div>
      )}
    </div>
  );
}
