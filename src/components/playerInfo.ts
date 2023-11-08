import * as iconsPath from '@/components/icons/index';

interface Volume {
  id: number;
  src: string;
  alt: string;
}

const volume: Record<string, Volume> = {
  slience: {
    id: 0,
    src: iconsPath.slience,
    alt: 'slience',
  },
  low: {
    id: 1,
    src: iconsPath.low,
    alt: 'low',
  },
  mid: {
    id: 2,
    src: iconsPath.mid,
    alt: 'mid',
  },
  max: {
    id: 3,
    src: iconsPath.max,
    alt: 'max',
  },
};

interface Mode {
  id: number;
  src: string;
  alt: string;
}

interface PlayerSettings {
  volume: Volume;
  list: boolean;
  mode: Mode;
}

const mode: Record<string, Mode> = {
  loopAll: {
    id: 0,
    src: iconsPath.loopAll,
    alt: 'loop all',
  },
  loopSingle: {
    id: 1,
    src: iconsPath.loopSingle,
    alt: 'loop one',
  },
  rand: {
    id: 2,
    src: iconsPath.rand,
    alt: 'shuffle',
  },
};

interface MusicInfo {
  id: number;
  title: string;
  artist: string;
  album: string;
  cover: string;
  lyric: string;
  link: string;
}

interface Lyrics {
  time: number;
  text: string;
}

interface PlayerState {
  idx: number;
  stop: boolean;
  error: boolean;
  progress: number;
  bufferedProgress: number;
  duration: number;
  lyric: Lyrics[];
  settings: PlayerSettings;
  playList: MusicInfo[];
}

export type { PlayerState, MusicInfo, PlayerSettings, Mode, Volume };
export { volume, mode };
