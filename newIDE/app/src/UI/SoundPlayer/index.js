// @flow

import * as React from 'react';
import WavesurferPlayer from './WaveSurfer';
import { Column, Line } from '../Grid';
import PlayButton from './PlayButton';
import Text from '../Text';
import { formatDuration } from '../../Utils/Duration';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../Responsive/ResponsiveWindowMeasurer';

type Props = {|
  soundSrc: string | null,
  onSoundLoaded: () => void,
|};

export type SoundPlayerInterface = {|
  playPause: (forcePlay: boolean) => void,
|};

const SoundPlayer = React.forwardRef<Props, SoundPlayerInterface>(
  ({ soundSrc, onSoundLoaded }, ref) => {
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const { isMobile } = useResponsiveWindowSize();
    const mobileAudioRef = React.useRef<?Audio>(null);
    const waveSurferRef = React.useRef<?any>(null);
    const [duration, setDuration] = React.useState<?number>(null);
    const [time, setTime] = React.useState<?number>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);

    const onWaveSurferReady = React.useCallback(
      ws => {
        waveSurferRef.current = ws;
        setDuration(Math.round(ws.getDuration()));
        setTime(0);
        onSoundLoaded();
      },
      [onSoundLoaded]
    );
    const onAudioReady = React.useCallback(
      () => {
        if (!mobileAudioRef.current) return;
        setDuration(Math.round(mobileAudioRef.current.duration));
        setTime(0);
        onSoundLoaded();
      },
      [onSoundLoaded]
    );

    const onLoad = React.useCallback(() => {
      setIsPlaying(false);
      setTime(null);
      setDuration(null);
    }, []);

    React.useEffect(
      () => {
        if (!waveSurferRef.current && !mobileAudioRef.current) return;
        if (isPlaying) {
          if (waveSurferRef.current) waveSurferRef.current.play();
          else if (mobileAudioRef.current) mobileAudioRef.current.play();
        } else {
          if (waveSurferRef.current) waveSurferRef.current.pause();
          else if (mobileAudioRef.current) mobileAudioRef.current.pause();
        }
      },
      [isPlaying]
    );

    const onPlayPause = React.useCallback(
      (forcePlay?: boolean) => {
        if (!soundSrc) return;
        setIsPlaying(_isPlaying => forcePlay || !_isPlaying);
      },
      [soundSrc]
    );

    const onFinishPlaying = React.useCallback(() => {
      setIsPlaying(false);
    }, []);

    React.useImperativeHandle(ref, () => ({
      playPause: onPlayPause,
    }));

    const onTimeupdate = React.useCallback(() => {
      setTime(_time => {
        const playerCurrentTime = mobileAudioRef.current
          ? mobileAudioRef.current.currentTime
          : waveSurferRef.current
          ? waveSurferRef.current.getCurrentTime()
          : null;
        if (playerCurrentTime === null || _time === playerCurrentTime) {
          return _time;
        }
        return playerCurrentTime;
      });
    }, []);

    React.useEffect(
      () => {
        if (isMobile) {
          if (soundSrc) {
            const audio = new Audio(soundSrc);
            audio.addEventListener('timeupdate', onTimeupdate);
            audio.addEventListener('ended', onFinishPlaying);
            audio.addEventListener('loadstart', onLoad);
            audio.addEventListener('loadedmetadata', onAudioReady);
            mobileAudioRef.current = audio;
          }
          waveSurferRef.current = null;
        } else {
          mobileAudioRef.current = null;
        }
        onLoad();
      },
      [isMobile, soundSrc, onTimeupdate, onFinishPlaying, onLoad, onAudioReady]
    );

    return (
      <Line alignItems="center">
        <Column>
          <PlayButton
            primary
            isPlaying={isPlaying}
            onClick={() => onPlayPause()}
          />
        </Column>
        <Column expand>
          {!isMobile && (
            <WavesurferPlayer
              url={soundSrc}
              waveColor={gdevelopTheme.soundPlayer.waveColor}
              progressColor={gdevelopTheme.soundPlayer.progressColor}
              barWidth={2}
              barGap={1}
              barRadius={3}
              height={'auto'}
              normalize
              onReady={onWaveSurferReady}
              onTimeupdate={onTimeupdate}
              onLoad={onLoad}
              onFinish={onFinishPlaying}
            />
          )}
        </Column>
        <Column>
          <Line>
            <Text noMargin>
              {typeof time !== 'number' ? '..' : formatDuration(time)}
            </Text>
            &nbsp;
            <Text noMargin color="secondary">
              / {typeof duration !== 'number' ? '..' : formatDuration(duration)}
            </Text>
          </Line>
        </Column>
      </Line>
    );
  }
);

export default SoundPlayer;
