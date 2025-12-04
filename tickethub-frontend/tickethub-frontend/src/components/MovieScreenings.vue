<template>
  <div class="movie-group">
    <div class="movie-header">
      <h3 class="movie-title">{{ title }}</h3>
      <div class="movie-details">
        <span>{{ screenings[0].gatunek }}</span>
        <span>|</span>
        <span>Wiek: {{ screenings[0].wiekMin }}+</span>
      </div>
    </div>
    <div class="times-grid">
      <div v-for="seans in screenings" :key="seans.id" class="time-slot">
        <span class="seans-type">{{ seans.typSeansu }}</span>
        <button class="ph-button" @click="emit('wybierz-miejsca', seans.id)">
          {{ seans.godzina }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['wybierz-miejsca']);

defineProps({
  title: { type: String, required: true },
  screenings: { type: Array, required: true }
});
</script>

<style scoped>
.movie-group { background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px; margin-bottom: 25px; overflow: hidden; }
.movie-header { padding: 20px; background-color: #000; }
.movie-title { margin: 0 0 10px 0; font-size: 1.6em; color: #ff9900; }
.movie-details { display: flex; gap: 10px; color: #b0b0b0; font-size: 0.9em; }
.times-grid { display: flex; flex-wrap: wrap; gap: 15px; padding: 20px; }
.time-slot { display: flex; flex-direction: column; align-items: center; }
.seans-type { font-size: 0.8em; color: #b0b0b0; margin-bottom: 5px; }
.ph-button { background-color: #2c2c2c; color: #ffffff; border: 1px solid #444; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; transition: all 0.3s; min-width: 80px; }
.ph-button:hover { background-color: #ff9900; color: #000; border-color: #ff9900; }
</style>