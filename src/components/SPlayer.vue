<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { usePlayerStateStore } from '@/store/playerState';
import { volume, mode } from '@/components/playerInfo';

import Playlist from './Player/Playlist.vue';
import InfoContent from './Player/InfoContent.vue';
import Lyric from './Player/Lyric.vue';
import ProcessBar from './Player/progressBar.vue';
import Settings from './Player/Settings.vue';

const store = usePlayerStateStore();
const { playerState, player } = storeToRefs(store);
const { relativeJump } = store;

const progressPercent = computed(() => {
  const progress = playerState.value.progress;
  const min = Math.floor(progress / 60);
  const sec = Math.floor(progress % 60);
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
});

watch(
  () => playerState.value.settings.volume,
  (newVal) => {
    if (player.value == null) return;

    player.value.volume = newVal.id / (Object.values(volume).length - 1);
  }
);

watch(
  () => playerState.value.settings.mode,
  (curMode) => {
    if (player.value == null) return;

    // TODO: not compare two objects directly
    const curPlayList = playerState.value.playList;
    if (curMode.id == mode.loopSingle.id) {
      curPlayList.sort((v) => v.id);
    } else if (curMode.id == mode.rand.id) {
      // shuffle the play list
      for (let i = curPlayList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [curPlayList[i], curPlayList[j]] = [curPlayList[j], curPlayList[i]];
      }
    }
  }
);

// TODO: the order of execution is:
watch(
  () => playerState.value.stop,
  (stop) => {
    if (player.value == null || playerState.value.idx == -1 || player.value.src == '') return;
    stop ? player.value.pause() : player.value.play();
  }
);

watch(
  () => playerState.value.playList[playerState.value.idx],
  (curMusicInfo, oldMusicInfo) => {
    if (player.value == null) return;
    if (curMusicInfo == null) {
      player.value.src = '';
      player.value.pause();
      musicCoverBg.value.backgroundImage = `url(/default_cover.jpeg)`;
      return;
    }

    // change the background attr in .music-cover class
    const coverPath = new URL(curMusicInfo.cover, import.meta.url).href;
    musicCoverBg.value.backgroundImage = `url(${coverPath})`;

    const musicPath = new URL(curMusicInfo.link, import.meta.url).href;
    player.value.src = musicPath;

    console.log(`stop: ${playerState.value.stop}`);
    if (oldMusicInfo == null) {
      player.value.play();
    } else {
      playerState.value.stop ? player.value.pause() : player.value.play();
    }
  }
);

function progress() {
  if (player.value == null) return;
  playerState.value.bufferedProgress =
    player.value.buffered.length > 0 ? player.value.buffered.end(0) : 0;
}

function loadedData() {
  if (player.value == null) return;
  playerState.value.duration = player.value.duration;
}

const musicCoverBg = ref({
  backgroundImage: '',
});
</script>

<!-- TODO: use json to contain the path and info of svg -->
<template>
  <div class="container">
    <div class="sp-header">
      <div class="music-cover" :style="musicCoverBg"></div>
      <div class="music-time">{{ progressPercent }}</div>
      <InfoContent />
      <Settings />
      <ProcessBar />
    </div>
    <Playlist />
    <Lyric />
    <!-- TODO: fix passed props -->
    <!-- TODO: loadeddata -->
    <audio
      ref="player"
      @loadeddata="loadedData"
      @ended="relativeJump(1)"
      @error="playerState.error = true"
      @progress="progress"
    >
      <p>你的浏览器不支持 HTML5 音频，可点击<a href="viper.mp3">此链接</a>收听。</p>
    </audio>
    <pre>{{ playerState }}</pre>
  </div>
</template>

<style scoped>
.container {
  --head-height: 4em;
  --cover-size: var(--head-height);
  --SPlayer-gray: #aaa;
  --border-radius: 5px;

  width: 90%;
  font-size: 14px;
  overflow: hidden;
  user-select: none;
  border-radius: var(--border-radius);
  box-shadow:
    0 1px 5px 1px rgba(0, 0, 0, 0.1),
    0 0 5px rgba(0, 0, 0, 0.1);

  .sp-header {
    display: flex;
    height: var(--head-height);
    overflow: hidden;
    position: relative;

    .music-cover {
      min-width: var(--head-height);
      height: var(--cover-size);
      width: var(--cover-size);
      transition: background 0.3s;
      background: var(--SPlayer-gray) url(/default_cover.jpeg) center/cover;
    }

    .music-time {
      position: absolute;
      top: 0;
      left: 0;
      width: var(--head-height);
      height: var(--head-height);
      line-height: var(--head-height);
      text-align: center;
      color: #fff;
      opacity: 0; /* TODO 0 */
      background: rgba(0, 0, 0, 0.5);
      transition: opacity 0.3s;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
