<script lang="ts" setup>
import { ref, computed } from "vue";

import type { MusicInfo } from "./musicInfo";

const exampleMusicList: MusicInfo[] = [
  {
    title: "Born Free",
    artist: "The Rassle",
    album: "Introducing",
    cover: "sample/cover/1.jpg",
    link: "sample/music/1.mp3",
  },
  {
    title: "hello world",
    artist: "ShellRaining",
    album: "none",
    cover: "sample/cover/1.jpg",
    link: "sample/music/1.mp3",
  },
  {
    title: "hello world",
    artist: "ShellRaining",
    album: "none",
    cover: "sample/cover/1.jpg",
    link: "sample/music/1.mp3",
  },
  {
    title: "hello world",
    artist: "ShellRaining",
    album: "none",
    cover: "sample/cover/1.jpg",
    link: "sample/music/1.mp3",
  },
];

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
    volume: volume.slience,
    list: false,
    mode: mode.loopAll,
  },
  playList: exampleMusicList,
  // TODO: need check whether it is necessary
  curMusicInfo: {
    musicInfo: {},
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

function toggleVolume() {
  const curVolume = playerState.value.settings.volume;
  const volumeList = Object.values(volume);
  playerState.value.settings.volume =
    volumeList[(curVolume.id + 1) % volumeList.length];
}

function toggleMode() {
  const curMode = playerState.value.settings.mode;
  const modeList = Object.values(mode);
  playerState.value.settings.mode =
    modeList[(curMode.id + 1) % modeList.length];
}
</script>

<template>
  <div class="container">
    <div class="sp-header">
      <div class="music-cover"></div>
      <div class="music-time">{{ playerState.curMusicInfo.musicTime }}</div>
      <div class="music-info">
        <h2 class="title">欢迎使用 ShellRaining Player</h2>
        <p class="artist">ShellRaining</p>
      </div>
      <div class="music-control">
        <div class="control-btn prev">
          <img src="./icons/control/prev.svg" alt="prev" />
        </div>
        <div class="control-btn play">
          <img src="./icons/control/play.svg" alt="play" />
        </div>
        <div class="control-btn next">
          <img src="./icons/control/next.svg" alt="next" />
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
      <li class="music-items" v-for="(music, i) in playerState.playList">
        <span class="item-index">{{ i }}</span>
        <span class="item-title">{{ music.title }}</span>
        <span class="item-artist">{{ music.artist }}</span>
      </li>
    </ul>
    <div class="sp-lyric">
      <span>纯音乐，请欣赏</span>
    </div>
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
  left: var(--head-height);
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
