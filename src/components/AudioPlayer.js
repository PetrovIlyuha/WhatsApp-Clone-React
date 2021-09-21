import React, { useState, useRef, useEffect } from 'react';
import { CircularProgress } from '@material-ui/core';
import { PauseRounded, PlayArrowRounded } from '@material-ui/icons';
import './AudioPlayer.css';

export default function AudioPlayer({
  sender,
  roomId,
  id,
  audioUrl,
  audioId,
  setAudioId,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMediaLoaded, setMediaLoaded] = useState(false);
  const [isLoaded, setLoaded] = useState(false);
  const [isMetaDataLoaded, setMetaDataLoaded] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [duration, setDuration] = useState('');

  const totalDuration = useRef('');
  const audio = useRef(new Audio(audioUrl));
  const interval = useRef();
  const isUploading = useRef(audioUrl === 'uploading');

  useEffect(() => {
    if (isUploading.current && audioUrl !== 'uploading') {
      audio.current = new Audio(audioUrl);
      audio.current.load();
      setLoaded(true);
    } else if (isUploading.current === false) {
      setLoaded(true);
    }
  }, [audioUrl]);

  const getAudioDuration = media => {
    return new Promise(resolve => {
      media.onloadedmetadata = () => {
        media.currentTime = Number.MAX_SAFE_INTEGER;

        media.ontimeupdate = () => {
          media.ontimeupdate = () => {};
          media.currentTime = 0.1;
          resolve(media.duration);
        };
      };
    });
  };

  useEffect(() => {
    if (isLoaded) {
      getAudioDuration(audio.current).then(() => {
        setMetaDataLoaded(true);
      });
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isMetaDataLoaded) {
      console.log('meta loaded');
      audio.current.addEventListener('canplaythrough', () => {
        if (!totalDuration.current) {
          setMediaLoaded(true);
          const time = formatTime(audio.current.duration);
          totalDuration.current = time;
          setDuration(totalDuration.current);
        }
      });

      audio.current.addEventListener('ended', () => {
        clearInterval(interval.current);
        setDuration(totalDuration.current);
        setSliderValue(0);
        setIsPlaying(false);
      });
    }
  }, [isMetaDataLoaded]);

  function formatTime(time) {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time - minutes * 60);

    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
  }

  const playAudio = () => {
    setIsPlaying(true);
    audio.current.play();
    if (audioId !== id) {
      setAudioId(id);
    }
    interval.current = setInterval(updateSlider, 100);
  };

  const stopAudio = () => {
    audio.current.pause();
    clearInterval(interval.current);
    setIsPlaying(false);
    setDuration(totalDuration.current);
  };

  const updateSlider = () => {
    let sliderPosition = 0;
    const { currentTime, duration } = audio.current;
    if (typeof duration === 'number') {
      sliderPosition = currentTime * (100 / duration);
      setSliderValue(sliderPosition);
      const time = formatTime(currentTime);
      setDuration(time);
    }
  };

  const moveAudioSlider = e => {
    const value = e.target.value;
    const { duration } = audio.current;
    if (isMediaLoaded) {
      const moveTo = duration * (value / 100);
      audio.current.currentTime = moveTo;
      setSliderValue(value);
    }
  };

  useEffect(() => {
    if (audioId !== id) {
      audio.current.pause();
      setIsPlaying(false);
    }
  }, [audioId, id]);

  return (
    <React.Fragment>
      <div className={`audioplayer ${sender ? '' : 'audioplayer__alt'}`}>
        {!isMediaLoaded ? (
          <CircularProgress />
        ) : isPlaying ? (
          <PauseRounded onClick={stopAudio} className='pause' />
        ) : !isPlaying ? (
          <PlayArrowRounded onClick={playAudio} />
        ) : null}
        <div>
          <span
            style={{ width: `${sliderValue}%` }}
            className='audioplayer__slider--played'
          />
          <input
            type='range'
            min='1'
            max='100'
            onChange={moveAudioSlider}
            value={sliderValue}
            className='audioplayer__slider'
          />
        </div>
      </div>
      <span className='chat__timestamp audioplayer__time'>{duration}</span>
    </React.Fragment>
  );
}
