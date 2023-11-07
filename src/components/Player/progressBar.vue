<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';

import { usePlayerStateStore } from '@/store/playerState';

const store = usePlayerStateStore();
const { playerState, player } = storeToRefs(store);

watch(
  () => playerState.value.bufferedProgress,
  (curBuffered) => {
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

let begin = ref(false);
let end = ref(false);
let x: number = 0;
let w: number = 0;

// we can make sure that when mouseDown start, the mouse pos is in the progress bar
// just add mousemove and mouseup event to this component
function dragStart(e: MouseEvent) {
  if (playerState.value.idx == -1 || playerState.value.error) return;

  begin.value = true;
  end.value = false;

  const progressBar = e.currentTarget as HTMLDivElement;
  const barWidth = progressBar.offsetWidth;
  x = progressBar.getBoundingClientRect().left;
  w = barWidth;
  const fixedPos = Math.min(Math.max(e.clientX - x, 0), w);
  playerState.value.progress = playerState.value.duration * (fixedPos / w);
}

function draging(e: MouseEvent) {
  if (!begin.value || end.value) return;

  const fixedPos = Math.min(Math.max(e.clientX - x, 0), w);
  playerState.value.progress = playerState.value.duration * (fixedPos / w);
}

function dragEnd(e: MouseEvent) {
  if (!begin.value || end.value) return;
  begin.value = false;
  end.value = true;
  const fixedPos = Math.min(Math.max(e.clientX - x, 0), w);
  playerState.value.progress = playerState.value.duration * (fixedPos / w);
}

document.addEventListener('mousemove', draging);
document.addEventListener('mouseup', dragEnd);

watch(end, (cur) => {
  if (cur && player.value) {
    end.value = false;
    player.value.currentTime = playerState.value.progress;
  }
});

watch(
  () => playerState.value.progress,
  (curProgress) => {
    const duration = playerState.value.duration;
    const percentage = duration == 0 ? 0 : curProgress / duration;
    playedBarStyle.value.width = `${percentage * 100}%`;
  }
);

let interval: NodeJS.Timeout;

const updateProcessBar = () => {
  if (player.value == null || (begin.value && !end.value)) return;
  playerState.value.progress = player.value.currentTime;
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

<template>
  <div class="progress-bar" @mousedown="dragStart">
    <!-- <div :style="loadedBarStyle"></div> -->
    <div :style="playedBarStyle"></div>
  </div>
</template>

<style scoped>
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
</style>
