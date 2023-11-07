<script lang="ts" setup>
import { usePlayerStateStore } from '@/store/playerState';

const store = usePlayerStateStore();
const { relativeJump, toggleMusic } = store;

const iconsPath = {
  play: new URL('../icons/control/play.svg', import.meta.url).href,
  pause: new URL('../icons/control/pause.svg', import.meta.url).href,
  prev: new URL('../icons/control/prev.svg', import.meta.url).href,
  next: new URL('../icons/control/next.svg', import.meta.url).href,
};
</script>

<template>
  <div class="control-bar">
    <div class="control-btn prev" @click="relativeJump(-1)">
      <img :src="iconsPath.prev" alt="prev" />
    </div>
    <div class="control-btn play" @click="toggleMusic()">
      <img :src="iconsPath.play" alt="play" />
    </div>
    <div class="control-btn next" @click="relativeJump(1)">
      <img :src="iconsPath.next" alt="next" />
    </div>
  </div>
</template>

<style scoped>
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
</style>
