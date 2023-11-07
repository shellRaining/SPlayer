<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { usePlayerStateStore } from '@/store/playerState';
import { volume, mode } from '@/components/playerInfo';

import Playlist from './Player/Playlist.vue';
import Control from './Player/Control.vue';

const store = usePlayerStateStore();
const { playerState } = storeToRefs(store);
const { toggleVolume, toggleMode, toggleList } = store;

const player = ref<HTMLAudioElement | null>();
const cover = ref<HTMLDivElement | null>();
let interval: NodeJS.Timeout;

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

const curLyric = computed(() => {
  if (playerState.value.idx == -1 && playerState.value.stop) return '欢迎使用 SPlayer';
  if (playerState.value.error) return '发生了错误';

  const lyric = playerState.value.lyric;
  const progress = playerState.value.progress;
  const len = lyric.length;

  let idx = 0;
  for (let i = 0; i < len; i++) {
    if (progress < lyric[i].time) {
      idx = i;
      break;
    }
  }
  idx = Math.max(0, idx - 1);
  return lyric[idx].text;
});

// when the player is set correctly (src and alt...), call this function to play
function playMusic() {
  if (player.value == null || playerState.value.idx == -1) return;

  playerState.value.stop = false;
  player.value.play();
}

// same as playMusic()
function pauseMusic() {
  if (player.value == null) return;

  playerState.value.stop = true;
  player.value.pause();
}

function toggleMusic() {
  playerState.value.stop ? playMusic() : pauseMusic();
}

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

// reset the whole player, include audio
function resetPlayer() {
  if (player.value == null || cover.value == null) return;

  function resetPlayerState() {
    playerState.value.idx = -1;
    playerState.value.stop = true;
    playerState.value.error = false;
    playerState.value.progress = 0;
    playerState.value.settings.volume = volume.max;
    playerState.value.settings.list = false;
    playerState.value.settings.mode = mode.loopAll;
  }

  resetPlayerState();
  player.value.pause();
  cover.value.style.setProperty('background-image', 'url(/default_cover.jpeg)');
}

// there are four cases:
// 1. idx == curIdx, and not the end
// 2. idx == curIdx, but the end
// 3. idx < curIdx
// 4. idx > curIdx
function remove(idx: number) {
  if (player.value == null) return;

  const len = playerState.value.playList.length;
  if (len == 1) {
    resetPlayer();
  }

  playerState.value.playList.splice(idx, 1);
  if (idx == playerState.value.idx) {
    // if the music to be removed is the current music, jump to the next music
    relativeJump(0, { stop: playerState.value.stop });
  } else if (idx < playerState.value.idx) {
    playerState.value.idx -= 1;
  }
}

// user select a music in the list, we can make sure that idx is a number gretter or equal to 0
function selectMusic(idx: number) {
  if (idx == playerState.value.idx) {
    toggleMusic();
  } else {
    jump(idx);
  }
}

// jump to the music that idx = current idx + offset(could be negative and out of range)
function relativeJump(offset: number, opts?: { stop?: boolean }) {
  if (player.value == null || playerState.value.idx == -1) return;

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

  if (player.value == null || cover.value == null) return;
  if (idx < 0 || idx >= playerState.value.playList.length) {
    error();
    return;
  }

  playerState.value.idx = idx;
  playerState.value.stop = opts?.stop ?? false;
  playerState.value.progress = 0;
  playerState.value.error = false;
  playerState.value.lyric = parseLrc(playerState.value.playList[idx].lyric);

  // change the background attr in .music-cover class
  const curMusicInfo = playerState.value.playList[idx];
  const coverPath = new URL(curMusicInfo.cover, import.meta.url).href;
  cover.value.style.backgroundImage = `url(${coverPath})`;

  const musicPath = new URL(curMusicInfo.link, import.meta.url).href;
  player.value.src = musicPath;
  playerState.value.stop ? pauseMusic() : playMusic();
}

// we can make sure that when drag start, the mouse pos is in the progress bar
// just add mousemove and mouseup event to this component
function dragStart(e: MouseEvent) {
  // if (player.value == null || playerState.value.idx == -1 || playerState.value.error) return;
  if (player.value == null  || playerState.value.error) return;

  // update the playedBar width to the current pos
  const progressBar = e.currentTarget as HTMLDivElement;
  const getOffsetX = (x: number) => {
    return x - progressBar.getBoundingClientRect().left;
  };
  const barWidth = progressBar.offsetWidth;
  playedBarStyle.value.width = `${(getOffsetX(e.clientX) / barWidth) * 100}%`;

  // clear the interval to prevent change during drag
  clearInterval(interval);

  function draging(e: MouseEvent) {
    playedBarStyle.value.width = `${(getOffsetX(e.clientX) / barWidth) * 100}%`;
  }

  // should check the end pos of e, if it is out of the bar, we should set the progress to 0 or 100%
  function dragEnd(e: MouseEvent) {
    if (player.value == null) return;

    const fixedPos = Math.min(Math.max(getOffsetX(e.clientX), 0), barWidth);
    playedBarStyle.value.width = `${(fixedPos / barWidth) * 100}%`;
    player.value.currentTime = player.value.duration * (fixedPos / barWidth);
    document.removeEventListener('mousemove', draging);
    document.removeEventListener('mouseup', dragEnd);

    interval = setInterval(updateProcessBar, 200);
  }

  document.addEventListener('mousemove', draging);
  document.addEventListener('mouseup', dragEnd);
}

// set the title and artist of the music to info error
function error() {
  playerState.value.error = true;
}

function progress() {
  if (player.value == null) return;
  playerState.value.bufferedProgress =
    player.value.buffered.length > 0 ? player.value.buffered.end(0) : 0;
}

watch(
  () => playerState.value.bufferedProgress,
  (curBuffered) => {
    if (player.value == null) return;

    const duration = playerState.value.duration;
    const percentage = duration == 0 ? 0 : curBuffered / duration;
    loadedBarStyle.value.width = `${percentage * 100}%`;
  }
);

const loadedBarStyle = ref({
  'background-color': '#e5e5e5',
  width: '0%',
});

const playedBarStyle = ref({
  'background-color': '#ffc670',
  width: '0%',
});

const updateProcessBar = () => {
  if (player.value == null) return;
  playerState.value.progress = player.value.currentTime;
  const duration = player.value.duration;
  if (duration == 0) return;
  playedBarStyle.value.width = `${(playerState.value.progress / duration) * 100}%`;
};

onMounted(() => {
  interval = setInterval(updateProcessBar, 200);
});

onUnmounted(() => {
  if (player.value == null) return;
  player.value.pause();
  clearInterval(interval);
});
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
        <Control
          class="music-control"
          @relative-jump="(offset) => relativeJump(offset)"
          @toggle-music="toggleMusic"
        />
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
      <div class="progress-bar" @mousedown="dragStart">
        <div :style="loadedBarStyle"></div>
        <div :style="playedBarStyle"></div>
      </div>
    </div>
    <div class="sp-info"></div>
    <Playlist />
    <div class="sp-lyric">
      <!-- TODO: all info should be calc by state... -->
      <span>{{ curLyric }}</span>
    </div>
    <!-- TODO: fix passed props -->
    <audio ref="player" @ended="relativeJump(1)" @error="error" @progress="progress">
      <p>你的浏览器不支持 HTML5 音频，可点击<a href="viper.mp3">此链接</a>收听。</p>
    </audio>
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

.progress-bar {
  position: absolute;
  left: var(--head-height);
  bottom: 0;
  right: 0;
  height: 0.3em;
  background-color: #efefef;
  cursor: pointer;
}

.progress-bar > div {
  position: absolute;
  top: 0;
  height: 0.3em;
  max-width: 100%;
}

.sp-lyric {
  color: #666;
  text-align: center;
  overflow: hidden;
  transition: height 0.5s ease; /* 这里的0.5s是过渡时间，可以根据需要调整 */
}

.sp-lyric > span {
  padding: 1em;
  display: block;
  overflow: hidden;
  line-height: 1em;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
