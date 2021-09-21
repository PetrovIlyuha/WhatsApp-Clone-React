import React, { useState, useRef, useEffect } from 'react';
import {
  CancelRounded,
  CheckCircleRounded,
  MicRounded,
  Send,
} from '@material-ui/icons';
import recordAudio from './recordAudio';
import { audioStorage, createTimestamp, database } from '../firebase';
import { v4 as uuid } from 'uuid';
import './ChatFooter.css';
import { CHATS, MESSAGES, ROOMS, USERS } from '../firebase-constants';

export default function ChatFooter({
  messageInput,
  sendMessage,
  onMessageChange,
  image,
  room,
  user,
  roomId,
  setAudioId,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState('00:00');

  const recordingElement = useRef();
  const timerIntervalRef = useRef();
  const record = useRef();
  const audioInputRef = useRef();

  const startRecording = async e => {
    e.preventDefault();
    record.current = await recordAudio();
    audioInputRef.current.focus();
    audioInputRef.current.style.width = `calc(100% - 56px)`;
    setIsRecording(true);
    setAudioId('');
  };

  useEffect(() => {
    if (isRecording) {
      recordingElement.current.style.opacity = 1;
      startRecordingTimer();
      record.current.start();
    }
    function startRecordingTimer() {
      const startedAt = Date.now();
      timerIntervalRef.current = setInterval(setTime, 100);

      function setTime() {
        const timeElapsed = Date.now() - startedAt;
        const totalSeconds = Math.floor(timeElapsed / 1000);
        const minutes = padValueWithLeadingZero(parseInt(totalSeconds / 60));
        const seconds = padValueWithLeadingZero(parseInt(totalSeconds % 60));
        const duration = `${minutes}:${seconds}`;
        setDuration(duration);
      }
    }
  }, [isRecording]);

  const padValueWithLeadingZero = value => {
    return String(value).length < 2 ? `0${value}` : value;
  };

  const stopRecording = () => {
    audioInputRef.current.focus();
    clearInterval(timerIntervalRef.current);
    const audio = record.current.stop();
    recordingElement.current.style.opacity = 0;
    setIsRecording(false);
    audioInputRef.current.style.width = `calc(100% - 112px)`;
    setDuration('00:00');
    return audio;
  };

  const finishRecordingSession = async () => {
    const audio = await stopRecording();
    const { audioFile, audioName } = await audio;
    sendAudio(audioFile, audioName);
  };

  const sendAudio = async (audioFile, audioName) => {
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
      .add({
        name: user.displayName,
        uid: user.uid,
        timestamp: createTimestamp(),
        time: new Date().toUTCString(),
        audioUrl: 'uploading',
        audioName,
      });

    await audioStorage.child(audioName).put(audioFile);
    const url = await audioStorage.child(audioName).getDownloadURL();
    database
      .collection(ROOMS)
      .doc(roomId)
      .collection(MESSAGES)
      .doc(doc.id)
      .update({ audioUrl: url });
  };

  const buttonIcons = (
    <>
      <Send style={{ width: 20, height: 20, color: 'white' }} />
      <MicRounded style={{ width: 24, height: 24, color: 'white' }} />
    </>
  );

  const audioInputChange = e => {
    const audioFile = e.target.files[0];
    if (audioFile) {
      setAudioId('');
      sendAudio(audioFile, uuid());
    }
  };

  const canRecord = navigator.mediaDevices.getUserMedia && window.MediaRecorder;

  return (
    <div className='chat__footer'>
      <form>
        <input
          type='text'
          ref={audioInputRef}
          placeholder='Type a message'
          value={messageInput}
          onChange={!isRecording ? onMessageChange : null}
        />
        {canRecord ? (
          <button
            onClick={
              messageInput.trim() || (messageInput === '' && image)
                ? sendMessage
                : startRecording
            }
            type='submit'
            className='send__btn'>
            {buttonIcons}
          </button>
        ) : (
          <>
            <label htmlFor='capture' className='send__btn'>
              {buttonIcons}
              <input
                type='file'
                style={{ display: 'none' }}
                onChange={audioInputChange}
                id='capture'
                accept='audio/*'
                capture
              />
            </label>
          </>
        )}
      </form>

      {isRecording && (
        <div className='record' ref={recordingElement}>
          <CancelRounded
            onClick={stopRecording}
            style={{ width: 30, height: 30, color: '#f20519' }}
          />
          <div>
            <div className='record__redcircle' />
            <div className='record__duration'>{duration}</div>
          </div>
          <CheckCircleRounded
            onClick={finishRecordingSession}
            style={{ width: 30, height: 30, color: '#41bf49' }}
          />
        </div>
      )}
    </div>
  );
}
