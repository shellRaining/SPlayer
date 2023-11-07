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
  const player = ref<HTMLAudioElement | null>();

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

  // jump to the music that idx = current idx + offset(could be negative and out of range)
  function relativeJump(offset: number, opts?: { stop?: boolean }) {
    // if (player.value == null || playerState.value.idx == -1) return;
    // TODO: need change
    if (playerState.value.idx == -1) {
      jump(0, opts);
      return;
    }

    // make sure the target idx is in range
    const curIdx = playerState.value.idx % playerState.value.playList.length;
    const curMode = playerState.value.settings.mode;

    if (curMode.id == mode.loopAll.id || curMode.id == mode.rand.id) {
      offset %= playerState.value.playList.length;
      const len = playerState.value.playList.length;
      const targetIdx = (curIdx + offset + len) % len;
      jump(targetIdx, opts);
    } else if (curMode.id == mode.loopSingle.id) {
      jump(curIdx, opts);
    } else {
      jump(-1, opts);
    }
  }

  function toggleMusic() {
    if (playerState.value.idx == -1) return;
    playerState.value.stop = !playerState.value.stop;
  }

  function jump(idx: number, opts?: { stop?: boolean }) {
    function parseLrc(lrc: string) {
      const lrcList = lrc.split('\n').filter((item) => item.trim() !== '');
      const lyric = [];
      for (const line of lrcList) {
        const pattern = /^\[(\d{2}):(\d{2}).(\d{2,3})\](.*)/;
        const result = pattern.exec(line);
        if (result == null) continue;
        const min = parseInt(result[1]);
        const sec = parseInt(result[2]);
        const msec = parseInt(result[3]);
        const time = min * 60 + sec + msec / 1000;
        const text = result[4];
        lyric.push({ time, text });
      }
      return lyric;
    }

    if (idx < 0 || idx >= playerState.value.playList.length) {
      error();
      return;
    }

    playerState.value.idx = idx;
    playerState.value.stop = opts?.stop ?? false;
    playerState.value.progress = 0;
    playerState.value.bufferedProgress = 0;
    playerState.value.error = false;
    playerState.value.lyric = parseLrc(playerState.value.playList[idx].lyric);
  }

  // user select a music in the list, we can make sure that idx is a number gretter or equal to 0
  function selectMusic(idx: number) {
    if (idx == playerState.value.idx) {
      toggleMusic();
    } else {
      jump(idx);
    }
  }

  // set the title and artist of the music to info error
  function error() {
    playerState.value.error = true;
  }

  return {
    playerState,
    player,

    toggleVolume,
    toggleMode,
    toggleMusic,
    toggleList,
    relativeJump,
    jump,
    error,
    selectMusic,
  };
});
