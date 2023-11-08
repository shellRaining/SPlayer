<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlayerStateStore } from '@/store/playerState';
import { prev, play, next, pause } from '@/components/icons/index';

const store = usePlayerStateStore();
const { playerState } = storeToRefs(store);
const { relativeJump, toggleMusic } = store;

const title = computed(() => {
  if (playerState.value.idx == -1 && playerState.value.stop) return '欢迎使用 SPlayer';
  else if (playerState.value.error) return ':(';
  else return playerState.value.playList[playerState.value.idx].title;
});

const artist = computed(() => {
  if (playerState.value.idx == -1 && playerState.value.stop) return 'shellRaining';
  else if (playerState.value.error) return '发生了错误';
  else return playerState.value.playList[playerState.value.idx].artist;
});

const playIcon = computed(() => {
  if (playerState.value.stop) return pause;
  else return play;
});
</script>

<template>
  <div class="info-container">
    <div class="music-info">
      <h2 class="title">{{ title }}</h2>
      <p class="artist">{{ artist }}</p>
    </div>
    <div class="control-bar music-control">
      <div class="control-btn prev" @click="relativeJump(-1, { stop: playerState.stop })">
        <img :src="prev" alt="prev" />
      </div>
      <div class="control-btn play" @click="toggleMusic()">
        <img :src="playIcon" alt="play" />
      </div>
      <div class="control-btn next" @click="relativeJump(1, { stop: playerState.stop })">
        <img :src="next" alt="next" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-container {
  position: relative;
  flex: 1;

  .music-info {
    flex: 1;
    white-space: nowrap;
    line-height: 0.8em;
    padding: 0 2em;

    .title {
      font-size: 1em;
      font-weight: 600;
    }

    .artist {
      font-size: 0.8em;
      color: #999;
    }
  }

  .control-bar {
    &:hover {
      opacity: 1;
    }

    .control-btn {
      color: #3498db;
      cursor: pointer;

      & > img {
        width: 2.5em;
        height: 2.5em;
      }
    }
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
}
</style>
