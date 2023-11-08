<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { usePlayerStateStore } from '@/store/playerState';
import { volume, mode } from '@/components/playerInfo';

import Playlist from './Player/Playlist.vue';
import Control from './Player/Control.vue';
import Lyric from './Player/Lyric.vue';
import ProcessBar from './Player/progressBar.vue';

const store = usePlayerStateStore();
const { playerState, player } = storeToRefs(store);
const { toggleVolume, toggleMode, toggleList, relativeJump, error } = store;

const cover = ref<HTMLDivElement | null>();

const volumeSrc = computed(() => {
  const path = new URL(playerState.value.settings.volume.src, import.meta.url);
  return path.href;
});

const volumeAlt = computed(() => {
  return playerState.value.settings.volume.alt;
});

const modeSrc = computed(() => {
  const path = new URL(playerState.value.settings.mode.src, import.meta.url);
  return path.href;
});

const modeAlt = computed(() => {
  return playerState.value.settings.mode.alt;
});

const progressPercent = computed(() => {
  const progress = playerState.value.progress;
  const min = Math.floor(progress / 60);
  const sec = Math.floor(progress % 60);
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
});

const title = computed(() => {
  if (playerState.value.error) return ':(';
  else if (playerState.value.idx == -1 && playerState.value.stop) return '欢迎使用 SPlayer';
  else return playerState.value.playList[playerState.value.idx].title;
});

const artist = computed(() => {
  if (playerState.value.error) return '发生了错误';
  else if (playerState.value.idx == -1 && playerState.value.stop) return 'shellRaining';
  else return playerState.value.playList[playerState.value.idx].artist;
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
  () => playerState.value.idx,
  (curIdx, oldIdx) => {
    if (player.value == null || cover.value == null) return;

    // change the background attr in .music-cover class
    const curMusicInfo = playerState.value.playList[curIdx];
    const coverPath = new URL(curMusicInfo.cover, import.meta.url).href;
    cover.value.style.backgroundImage = `url(${coverPath})`;

    const musicPath = new URL(curMusicInfo.link, import.meta.url).href;
    player.value.src = musicPath;

    if (oldIdx == -1) {
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
</script>

<!-- TODO: use json to contain the path and info of svg -->
<template>
  <div class="container">
    <div class="sp-header">
      <div class="music-cover" ref="cover"></div>
      <div class="music-time">{{ progressPercent }}</div>
      <div class="info-container">
        <div class="music-info">
          <h2 class="title">{{ title }}</h2>
          <p class="artist">{{ artist }}</p>
        </div>
        <Control class="music-control" />
      </div>
      <div class="settings">
        <div class="settings-btn volume" @click="toggleVolume">
          <img :src="volumeSrc" :alt="volumeAlt" />
        </div>
        <div class="settings-btn mode" @click="toggleMode">
          <img :src="modeSrc" :alt="modeAlt" />
        </div>
        <div class="settings-btn list" @click="toggleList">
          <img src="./icons/list/list.svg" alt="list" />
        </div>
      </div>
      <ProcessBar />
    </div>
    <div class="sp-info"></div>
    <Playlist />
    <Lyric />
    <!-- TODO: fix passed props -->
    <!-- TODO: loadeddata -->
    <audio
      ref="player"
      @loadeddata="loadedData"
      @ended="relativeJump(1)"
      @error="error"
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
}

.sp-header {
  display: flex;
  height: var(--head-height);
  overflow: hidden;
  position: relative;
}

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
}

.music-time:hover {
  opacity: 1;
}

.info-container {
  position: relative;
  flex: 1;
}

/* music info */
.music-info {
  flex: 1;
  white-space: nowrap;
  line-height: 0.8em;
  padding: 0 2em;
}

.title {
  font-size: 1em;
  font-weight: 600;
}

.artist {
  font-size: 0.8em;
  color: #999;
}

.music-control {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  padding: 0.5em;
  background-color: #fff;
  transition: 0.3s;
  display: flex;
  align-items: center;
}

.settings {
  min-width: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
}

.settings-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 2em;
  height: 2em;
}

.settings-btn > img {
  fill: var(--SPlayer-gray);
  width: 1.5em;
  height: 1.5em;
  cursor: pointer;
}
</style>
