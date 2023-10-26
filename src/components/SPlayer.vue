<script lang="ts" setup>
import { ref, computed } from "vue";

import exampleMusicList from "@/../public/music/music.json";

const player = ref<HTMLAudioElement | null>();
const cover = ref<HTMLDivElement | null>();

const volume = {
  slience: {
    id: 0,
    src: "./icons/volume/slience.svg",
    alt: "slience",
  },
  low: {
    id: 1,
    src: "./icons/volume/low.svg",
    alt: "low",
  },
  mid: {
    id: 2,
    src: "./icons/volume/mid.svg",
    alt: "mid",
  },
  max: {
    id: 3,
    src: "./icons/volume/max.svg",
    alt: "max",
  },
};

const mode = {
  loopAll: {
    id: 0,
    src: "./icons/mode/loopAll.svg",
    alt: "loop all",
  },
  loopSingle: {
    id: 1,
    src: "./icons/mode/loopSingle.svg",
    alt: "loop one",
  },
  rand: {
    id: 2,
    src: "./icons/mode/rand.svg",
    alt: "shuffle",
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
      title: "",
      artist: "",
      album: "",
      cover: "",
      link: "",
    },
    musicTime: "00:00",
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
  return curTitle == "" ? "欢迎使用 SPlayer" : curTitle;
});

const artist = computed(() => {
  const curArtist = playerState.value.curMusic.musicInfo.artist;
  return curArtist == "" ? "shellRaining" : curArtist;
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

function toggleVolume() {
  if (player.value == null) return;

  const curVolume = playerState.value.settings.volume;
  const volumeList = Object.values(volume);
  playerState.value.settings.volume =
    volumeList[(curVolume.id + 1) % volumeList.length];

  // set the volume of player
  player.value.volume = curVolume.id / (volumeList.length - 1);
}

function toggleMode() {
  // TODO: add logic
  const curMode = playerState.value.settings.mode;
  const modeList = Object.values(mode);
  playerState.value.settings.mode =
    modeList[(curMode.id + 1) % modeList.length];
}

function selectMusic(idx: number) {
  console.log(idx);
  if (idx == playerState.value.curMusic.idx) {
    toggleMusic();
  } else {
    jump(idx);
  }
}

function jump(idx: number) {
  if (player.value == null || cover.value == null) {
    // TODO: add logic
    return;
  }
  const curMusic = playerState.value.curMusic;
  curMusic.idx = idx;
  curMusic.stop = false;
  curMusic.musicTime = "00:00";
  curMusic.musicInfo = playerState.value.playList[idx];

  // change the background attr in .music-cover class
  const coverPath = new URL(curMusic.musicInfo.cover, import.meta.url).href;
  cover.value.style.backgroundImage = `url(${coverPath})`;

  const musicPath = new URL(curMusic.musicInfo.link, import.meta.url).href;
  player.value.src = musicPath;
  player.value.play();
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
          <div class="control-btn prev">
            <img src="./icons/control/prev.svg" alt="prev" />
          </div>
          <div class="control-btn play" @click="toggleMusic">
            <img src="./icons/control/play.svg" alt="play" />
          </div>
          <div class="control-btn next">
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
        <div
          class="settings-btn list"
          @click="playerState.settings.list = !playerState.settings.list"
        >
          <img src="./icons/list/list.svg" alt="list" />
        </div>
      </div>
      <div class="music-progress"></div>
    </div>
    <div class="sp-info"></div>
    <ul :class="['sp-list', { 'sp-list-show': playerState.settings.list }]">
      <li
        class="music-items"
        v-for="(music, i) in playerState.playList"
        @click="selectMusic(i)"
      >
        <span class="item-index">{{ i }}</span>
        <span class="item-title">{{ music.title }}</span>
        <span class="item-artist">{{ music.artist }}</span>
      </li>
    </ul>
    <div class="sp-lyric">
      <span>纯音乐，请欣赏</span>
    </div>
    <!-- TODO: fix passed props -->
    <audio ref="player">
      <p>
        你的浏览器不支持 HTML5 音频，可点击<a href="viper.mp3">此链接</a>收听。
      </p>
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
  /* position: absolute; */
  /* right: 0; */
  /* top: 0; */
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

.sp-list {
  max-height: 0;
  overflow: auto;
  list-style: none;
  margin: 0;
  padding: 0;
  transition: max-height 0.3s;
  border-bottom: 1px solid #eee;
}

.sp-list-show {
  /* TODO: why 15em */
  /* max-height: 15em; */
  max-height: 50vh;
}

.music-items {
  display: flex;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  padding: 0.75em 1em;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition:
    background 0.3s,
    padding 0.3s;
}

.music-items:nth-child(odd) {
  background: rgba(0, 0, 0, 0.02);
}

.music-items:nth-child(even) {
  background: #fff;
}

.music-items:hover {
  background: rgba(0, 0, 0, 0.05);
}

.item-index {
  margin-right: 0.75em;
}

.item-title {
  margin: 0 0.5em;
}

.item-title:after {
  content: "-";
  margin: 0 0.25em;
}

.item-artist {
  opacity: 0.6;
}

.sp-lyric {
  color: #666;
  text-align: center;
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