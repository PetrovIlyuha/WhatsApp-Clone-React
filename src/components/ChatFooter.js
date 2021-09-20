import React, { useState } from 'react';
import {
  CancelRounded,
  CheckCircleRounded,
  MicRounded,
  Send,
} from '@material-ui/icons';
import './ChatFooter.css';

export default function ChatFooter() {
  const [isRecording, setIsRecording] = useState(false);

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
        <input type='text' placeholder='Type a message' />
        {canRecord ? (
          <button type='submit' className='send__btn'>
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
        <div className='record'>
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
