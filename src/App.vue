<script setup lang="ts">
import SPlayer from "./components/SPlayer.vue";
</script>

<template>
  <div class="display_zoon">
    <SPlayer class="player"/>
  </div>
</template>

<style scoped>
.display_zoon {
  display: flex;
  justify-content: center;
}

.player {
  margin-top: 5px;
}
</style>
