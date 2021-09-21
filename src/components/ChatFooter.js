import React, { useState, useRef, useEffect } from 'react';
import {
  CancelRounded,
  CheckCircleRounded,
  MicRounded,
  Send,
} from '@material-ui/icons';
import recordAudio from './recordAudio';
import './ChatFooter.css';

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

  const recordingElement = useRef();

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
      record.current.start();
    }
  }, [isRecording]);

  const buttonIcons = (
    <>
      <Send style={{ width: 20, height: 20, color: 'white' }} />
      <MicRounded style={{ width: 24, height: 24, color: 'white' }} />
    </>
  );

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
              <input type='file' id='capture' accept='audio/*' capture />
            </label>
          </>
        )}
      </form>

      {isRecording && (
        <div className='record' ref={recordingElement}>
          <CancelRounded style={{ width: 30, height: 30, color: '#f20519' }} />
          <div>
            <div className='record__redcircle' />
            <div className='record__duration' />
          </div>
          <CheckCircleRounded
            style={{ width: 30, height: 30, color: '#41bf49' }}
          />
        </div>
      )}
    </div>
  );
}
