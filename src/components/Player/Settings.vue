<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { usePlayerStateStore } from '@/store/playerState';
import { list as listPath } from '@/components/icons/index';

const store = usePlayerStateStore();
const { playerState } = storeToRefs(store);
const { toggleVolume, toggleMode, toggleList } = store;

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
</script>

<template>
  <div class="settings">
    <div class="settings-btn volume" @click="toggleVolume">
      <img :src="volumeSrc" :alt="volumeAlt" />
    </div>
    <div class="settings-btn mode" @click="toggleMode">
      <img :src="modeSrc" :alt="modeAlt" />
    </div>
    <div class="settings-btn list" @click="toggleList">
      <img :src="listPath" alt="list" />
    </div>
  </div>
</template>

<style scoped>
.settings {
  min-width: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;

  .settings-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    width: 2em;
    height: 2em;

    & > img {
      fill: var(--SPlayer-gray);
      width: 1.5em;
      height: 1.5em;
      cursor: pointer;
    }
  }
}
</style>
