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
}

interface PlayerState {
  idx: number;
  stop: boolean;
  progress: number;
  settings: PlayerSettings;
  playList: MusicInfo[];
  curMusicInfo: MusicInfo;
}

export type { PlayerState, MusicInfo, PlayerSettings, Mode, Volume };
