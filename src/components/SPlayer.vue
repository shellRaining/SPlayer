<script lang="ts" setup>
let icons = {
  left: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="currentColor"><path d="M13,10c1.1,0,2,1.35,2,3v3.7l10.495-5.772C27.423,9.867,29,10.8,29,13v14c0,2.2-1.577,3.133-3.505,2.072L15,23.3V27c0,1.65-0.9,3-2,3s-2-1.35-2-3V13C11,11.35,11.9,10,13,10z"/></svg>',
  right:
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="currentColor"><path d="M27,10c-1.1,0-2,1.35-2,3v3.7l-10.495-5.772C12.577,9.867,11,10.8,11,13v14c0,2.2,1.577,3.133,3.505,2.072L25,23.3V27c0,1.65,0.9,3,2,3s2-1.35,2-3V13C29,11.35,28.1,10,27,10z"/></svg>',
  play: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="currentColor"><path d="M20,0C8.954,0,0,8.954,0,20c0,11.046,8.954,20,20,20s20-8.954,20-20C40,8.954,31.046,0,20,0z M28.495,21.928l-12.99,7.145C13.577,30.133,12,29.2,12,27V13c0-2.2,1.577-3.133,3.505-2.072l12.99,7.145C30.423,19.133,30.423,20.867,28.495,21.928z"/></svg>',
  pause:
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="currentColor"><path d="M20,0C8.954,0,0,8.954,0,20c0,11.046,8.954,20,20,20s20-8.954,20-20C40,8.954,31.046,0,20,0z M17,27c0,1.65-0.9,3-2,3s-2-1.35-2-3V13c0-1.65,0.9-3,2-3s2,1.35,2,3V27z M27,27c0,1.65-0.9,3-2,3s-2-1.35-2-3V13c0-1.65,0.9-3,2-3s2,1.35,2,3V27z"/></svg>',
};
</script>

<template>
  <div class="container">
    <div class="sp-header">
      <div class="music-cover"></div>
      <div class="music-time"></div>
      <div class="music-info">
        <h2 class="title">欢迎使用 ShellRaining Player</h2>
        <p class="artist">ShellRaining</p>
      </div>
      <div class="music-control"></div>
      <div class="settings">
        <div class="music-control-btn mode">
          <img src="./icons/none.svg" alt="slience" />
        </div>
        <div class="music-control-btn list">
          <img src="./icons/list.svg" alt="list" />
        </div>
        <div class="music-control-btn volume">
          <img src="./icons/loop_all.svg" alt="volume" />
        </div>
      </div>
      <div class="music-progress"></div>
    </div>
    <div class="sp-info"></div>
    <div class="sp-list"></div>
    <div class="sp-lyric"></div>
  </div>
</template>

<style scoped>
.container {
  --head-height: 60px;
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
}

.music-cover {
  min-width: var(--head-height);
  height: var(--cover-size);
  width: var(--cover-size);
  transition: background 0.3s;
  background: var(--SPlayer-gray)
    url(data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QMqaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjUtYzAyMSA3OS4xNTQ5MTEsIDIwMTMvMTAvMjktMTE6NDc6MTYgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTNERjEzRjQzMDQzMTFFOEI5NkQ5NTkwMTU2NDBFMzUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTNERjEzRjUzMDQzMTFFOEI5NkQ5NTkwMTU2NDBFMzUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1M0RGMTNGMjMwNDMxMUU4Qjk2RDk1OTAxNTY0MEUzNSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1M0RGMTNGMzMwNDMxMUU4Qjk2RDk1OTAxNTY0MEUzNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uACZBZG9iZQBkwAAAAAEDABUEAwYKDQAABu4AAAdjAAAJgAAAC1D/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)
    center/cover;
}

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

.settings {
  min-width: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
}

.music-control-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 2em;
  height: 2em;
}

.music-control-btn > img {
  fill: var(--SPlayer-gray);
  width: 1.5em;
  height: 1.5em;
}
</style>
