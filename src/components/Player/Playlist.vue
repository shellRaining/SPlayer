<script lang="ts" setup>
import { storeToRefs } from 'pinia';

import { usePlayerStateStore } from '@/store/playerState';

const store = usePlayerStateStore();
const { playerState } = storeToRefs(store);
const { selectMusic, remove } = store;

const deleteIcon = new URL('@/components/icons/list/delete.svg', import.meta.url).href;
</script>

<template>
  <div :class="['sp-list', { 'list-show': playerState.settings.list }]">
    <TransitionGroup tag="ul" name="fade">
      <li
        class="item-wrapper"
        v-for="(music, i) in playerState.playList"
        :key="music.id"
        @click="selectMusic(i)"
      >
        <div class="music-item">
          <span class="item-index">{{ i }}</span>
          <span class="item-title">{{ music.title }}</span>
          <span class="item-artist">{{ music.artist }}</span>
          <img :src="deleteIcon" alt="x" class="item-btn" @click.stop="remove(i)" />
        </div>
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
ul {
  /* clear ul list style */
  list-style: none;
  margin: 0;
  padding: 0;
}

.sp-list {
  max-height: 0;
  overflow: hidden;
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
</style>
