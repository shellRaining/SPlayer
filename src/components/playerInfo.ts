interface Volume {
  id: number;
  src: string;
  alt: string;
}

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

interface MusicInfo {
  id: number;
  title: string;
  artist: string;
  album: string;
  cover: string;
  link: string;
  lyrics: string;
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
  lyrics: Lyrics[];
  settings: PlayerSettings;
  playList: MusicInfo[];
}

export type { PlayerState, MusicInfo, PlayerSettings, Mode, Volume };
