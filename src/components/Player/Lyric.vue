<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlayerStateStore } from '@/store/playerState';

const store = usePlayerStateStore();
const { playerState } = storeToRefs(store);

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
</script>

<template>
  <div class="sp-lyric">
    <span>{{ curLyric }}</span>
  </div>
</template>

<style scoped>
.sp-lyric {
  color: #666;
  text-align: center;
  overflow: hidden;
  /* TODO: transition should change */

  & > span {
    padding: 1em;
    display: block;
    overflow: hidden;
    line-height: 1em;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
