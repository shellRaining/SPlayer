<script lang="ts" setup>
import { ref, computed } from 'vue';

import exampleMusicList from '@/../public/music/music.json';

const player = ref<HTMLAudioElement | null>();
const cover = ref<HTMLDivElement | null>();
const playerList = ref<HTMLUListElement | null>();

const volume = {
  slience: {
    id: 0,
    src: './icons/volume/slience.svg',
    alt: 'slience',
  },
  low: {
    id: 1,
    src: './icons/volume/low.svg',
    alt: 'low',
  },
  mid: {
    id: 2,
    src: './icons/volume/mid.svg',
    alt: 'mid',
  },
  max: {
    id: 3,
    src: './icons/volume/max.svg',
    alt: 'max',
  },
};

const mode = {
  loopAll: {
    id: 0,
    src: './icons/mode/loopAll.svg',
    alt: 'loop all',
  },
  loopSingle: {
    id: 1,
    src: './icons/mode/loopSingle.svg',
    alt: 'loop one',
  },
  rand: {
    id: 2,
    src: './icons/mode/rand.svg',
    alt: 'shuffle',
  },
};

const playerState = ref({
  settings: {
    volume: volume.max,
    list: false,
    mode: mode.loopAll,
  },
  playList: exampleMusicList,
  // TODO: need check whether it is necessary
  curMusic: {
    idx: -1, // used to identify a music, means the index of music in playList, -1 means no music playing
    stop: true,
    musicInfo: {
      title: '',
      artist: '',
      album: '',
      cover: '',
      link: '',
    },
    musicTime: '00:00',
  },
});

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

const title = computed(() => {
  const curTitle = playerState.value.curMusic.musicInfo.title;
  return curTitle == '' ? '欢迎使用 SPlayer' : curTitle;
});

const artist = computed(() => {
  const curArtist = playerState.value.curMusic.musicInfo.artist;
  return curArtist == '' ? 'shellRaining' : curArtist;
});

function playMusic() {
  if (player.value == null || playerState.value.curMusic.idx == -1) return;

  const curMusic = playerState.value.curMusic;
  curMusic.stop = false;
  player.value.play();
}

function pauseMusic() {
  if (player.value == null) return;

  const curMusic = playerState.value.curMusic;
  curMusic.stop = true;
  player.value.pause();
}

function toggleMusic() {
  playerState.value.curMusic.stop ? playMusic() : pauseMusic();
}

function prev() {
  if (player.value == null) return;

  const curMusic = playerState.value.curMusic;
  if (curMusic.idx == -1) {
    jump(0);
    return;
  }

  const curMode = playerState.value.settings.mode;
  if (curMode.id == mode.loopAll.id) {
    jump(
      (curMusic.idx - 1 + playerState.value.playList.length) % playerState.value.playList.length
    );
  } else if (curMode.id == mode.loopSingle.id) {
    jump(curMusic.idx);
  } else {
    jump(
      (curMusic.idx - 1 + playerState.value.playList.length) % playerState.value.playList.length
    );
  }
}

function next() {
  if (player.value == null) return;

  const curMusic = playerState.value.curMusic;
  if (curMusic.idx == -1) {
    jump(0);
    return;
  }

  const curMode = playerState.value.settings.mode;
  if (curMode.id == mode.loopAll.id) {
    jump((curMusic.idx + 1) % playerState.value.playList.length);
  } else if (curMode.id == mode.loopSingle.id) {
    jump(curMusic.idx);
  } else {
    jump((curMusic.idx + 1) % playerState.value.playList.length);
  }
}

function toggleVolume() {
  if (player.value == null) return;

  const curVolume = playerState.value.settings.volume;
  const volumeList = Object.values(volume);
  playerState.value.settings.volume = volumeList[(curVolume.id + 1) % volumeList.length];

  // set the volume of player
  player.value.volume = curVolume.id / (volumeList.length - 1);
}

function toggleMode() {
  const curMode = playerState.value.settings.mode;
  const modeList = Object.values(mode);
  playerState.value.settings.mode = modeList[(curMode.id + 1) % modeList.length];

  jump(-1);

  // TODO: not compare two objects directly
  if (playerState.value.settings.mode.id == mode.loopSingle.id) {
    playerState.value.playList.sort((v) => v.id);
  } else if (playerState.value.settings.mode.id == mode.rand.id) {
    for (let i = playerState.value.playList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerState.value.playList[i], playerState.value.playList[j]] = [
        playerState.value.playList[j],
        playerState.value.playList[i],
      ];
    }
  } else {
  }
}

function toggleList() {
  playerState.value.settings.list = !playerState.value.settings.list;
  playerList.value?.classList.toggle('list-show');
}

function selectMusic(idx: number) {
  if (idx == playerState.value.curMusic.idx) {
    toggleMusic();
  } else {
    jump(idx);
  }
}

function resetPlayer() {
  if (player.value == null || cover.value == null) return;

  playerState.value.curMusic.idx = -1;
  playerState.value.curMusic.stop = true;
  playerState.value.curMusic.musicInfo = {
    title: '',
    artist: '',
    album: '',
    cover: '',
    link: '',
  };
  playerState.value.curMusic.musicTime = '00:00';
  player.value.src = '';
  cover.value?.style.setProperty('background-image', 'url(/default_cover.jpeg)');
  player.value?.pause();
}

function remove(idx: number) {
  if (player.value == null) return;
  if (playerState.value.curMusic.idx == -1) {
    playerState.value.playList.splice(idx, 1);
    return;
  }
  // BUG: need fix
  if (playerState.value.curMusic.idx == idx) {
    resetPlayer();
  }
  playerState.value.playList.splice(idx, 1);
}

function jump(idx: number) {
  if (player.value == null || cover.value == null) {
    // TODO: add logic
    return;
  }
  if (idx < 0 || idx >= playerState.value.playList.length) {
    resetPlayer();
    return;
  }
  const curMusic = playerState.value.curMusic;
  curMusic.idx = idx;
  curMusic.stop = false;
  curMusic.musicTime = '00:00';
  curMusic.musicInfo = playerState.value.playList[idx];

  // change the background attr in .music-cover class
  const coverPath = new URL(curMusic.musicInfo.cover, import.meta.url).href;
  cover.value.style.backgroundImage = `url(${coverPath})`;

  const musicPath = new URL(curMusic.musicInfo.link, import.meta.url).href;
  player.value.src = musicPath;
  player.value.play();
}

function error() {
  playerState.value.curMusic.musicInfo.title = ':(';
  playerState.value.curMusic.musicInfo.artist = '播放出错';
}
</script>

<!-- TODO: use json to contain the path and info of svg -->
<template>
  <div class="container">
    <div class="sp-header">
      <div class="music-cover" ref="cover"></div>
      <div class="music-time">{{ playerState.curMusic.musicTime }}</div>
      <div class="info-container">
        <div class="music-info">
          <h2 class="title">{{ title }}</h2>
          <p class="artist">{{ artist }}</p>
        </div>
        <div class="music-control">
          <div class="control-btn prev" @click="prev">
            <img src="./icons/control/prev.svg" alt="prev" />
          </div>
          <div class="control-btn play" @click="toggleMusic">
            <img src="./icons/control/play.svg" alt="play" />
          </div>
          <div class="control-btn next" @click="next">
            <img src="./icons/control/next.svg" alt="next" />
          </div>
        </div>
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
      <div class="music-progress"></div>
    </div>
    <div class="sp-info"></div>
    <!-- :class="['sp-list', { 'list-show': playerState.settings.list }]" -->
    <div ref="playerList" class="sp-list">
      <TransitionGroup tag="ul" name="fade">
        <li
          class="item-wrapper"
          v-for="(music, i) in playerState.playList"
          :key="music.id"
          @click="selectMusic(i)"
        >
          <!-- TODO: should stop the event propagation -->
          <div class="music-item">
            <span class="item-index">{{ i }}</span>
            <span class="item-title">{{ music.title }}</span>
            <span class="item-artist">{{ music.artist }}</span>
            <img src="./icons/list/Delete.svg" alt="x" class="item-btn" @click.stop="remove(i)" />
          </div>
        </li>
      </TransitionGroup>
    </div>
    <div class="sp-lyric">
      <span>纯音乐，请欣赏</span>
    </div>
    <!-- TODO: fix passed props -->
    <audio ref="player" @ended="next" @error="error">
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

/* music control */
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

.music-control:hover {
  opacity: 1;
}

/* control button */
.control-btn {
  color: #3498db;
  cursor: pointer;
}

.control-btn > img {
  width: 2.5em;
  height: 2.5em;
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

ul {
  /* clear ul list style */
  list-style: none;
  margin: 0;
  padding: 0;
}

.sp-list {
  max-height: 0;
  overflow: auto;
  transition: 0.3s;
  border-bottom: 1px solid #eee;
}

.list-show {
  /* TODO: why 15em */
  /* max-height: 15em; */
  max-height: 50vh;
}

.item-wrapper {
  position: relative;
  width: 100%;
  height: 3em;
}

.music-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  padding: 0.75em 1em;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* TODO: how to use my own transition */
}

/* 1. 声明过渡效果 */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-move,
.fade-enter-active .music-item,
.fade-leave-active .music-item {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. 声明进入和离开的状态 */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  height: 0;
}

.fade-enter-from .music-item,
.fade-leave-to .music-item {
  opacity: 0;
  transform: scaleY(0.01) translate(3em, 0);
}

/* 3. 确保离开的项目被移除出了布局流
      以便正确地计算移动时的动画效果。 */
.fade-leave-active .music-item {
  position: absolute;
}

.item-wrapper:nth-child(odd) {
  background: rgba(0, 0, 0, 0.02);
}

.item-wrapper:nth-child(even) {
  background: #fff;
}

.item-wrapper:hover {
  background: rgba(0, 0, 0, 0.05);
}

.item-index {
  margin-right: 0.75em;
}

.item-title {
  margin: 0 0.5em;
}

.item-title:after {
  content: '-';
  margin: 0 0.25em;
}

.item-artist {
  opacity: 0.6;
  flex: 1;
}

.item-btn {
  border: none;
  width: 1em;
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
