import { defineStore } from 'pinia';
import { ref } from 'vue';

import exampleMusicList from '@/../public/music/music.json';
import type { PlayerState } from '@/components/playerInfo';
import { volume, mode } from '@/components/playerInfo';

export const usePlayerStateStore = defineStore('playerState', () => {
  const playerState = ref<PlayerState>({
    idx: -1,
    stop: true,
    error: false,
    progress: 0,
    bufferedProgress: 0,
    duration: 0,
    lyric: [{ time: 0, text: '欢迎使用 SPlayer' }],
    settings: {
      volume: volume.max,
      list: false,
      mode: mode.loopAll,
    },
    playList: exampleMusicList,
  });

  function toggleVolume() {
    let curVolume = playerState.value.settings.volume;
    const volumeList = Object.values(volume);
    curVolume = volumeList[(curVolume.id + 1) % volumeList.length];
    playerState.value.settings.volume = curVolume;
  }

  function toggleMode() {
    let curMode = playerState.value.settings.mode;
    const modeList = Object.values(mode);
    curMode = modeList[(curMode.id + 1) % modeList.length];
    playerState.value.settings.mode = curMode;
  }

function toggleList() {
  playerState.value.settings.list = !playerState.value.settings.list;
}

  return { playerState, toggleVolume, toggleMode, toggleList };
});
