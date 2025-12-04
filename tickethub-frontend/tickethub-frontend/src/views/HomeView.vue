<template>
  <div class="home-view">
    <h2 v-if="!selectedLocality">Wybierz miejscowość</h2>
    <h2 v-else>Aktualne seanse</h2>

    <div v-if="loading" class="message-box"><p>Ładowanie...</p></div>
    <div v-if="error" class="message-box error"><p>{{ error }}</p></div>

    <div v-if="!selectedLocality && !loading && !error" class="locality-selection">
      <button 
        v-for="locality in localities" 
        :key="locality" 
        @click="selectLocality(locality)" 
        class="locality-btn">
        {{ locality }}
      </button>
    </div>

    <div v-if="selectedLocality && !loading && !error">
      <div class="header-with-back">
        <h3>Seanse w: {{ selectedLocality }}</h3>
        <button @click="resetSelection" class="back-btn">&laquo; Zmień miejscowość</button>
      </div>

      <div class="date-picker">
        <button 
          v-for="date in availableDates" 
          :key="date.iso" 
          @click="selectDate(date.iso)"
          :class="{ active: selectedDate === date.iso }"
          class="date-btn">
          <span class="day-name">{{ date.dayName }}</span>
          <span class="day-number">{{ date.dayNumber }}</span>
        </button>
      </div>
      
      <div v-if="Object.keys(groupedScreenings).length > 0">
        <MovieScreenings 
          v-for="(movieScreenings, title) in groupedScreenings"
          :key="title"
          :title="title"
          :screenings="movieScreenings"
          @wybierz-miejsca="openSeatSelector"
        />
      </div>
      <div v-else class="message-box">
        <p>Brak dostępnych seansów w wybranym dniu.</p>
      </div>
    </div>
  </div>

  <CinemaHall 
    v-if="selectedSeansForPopup"
    :seans-id="selectedSeansForPopup"
    @close="closeSeatSelector"
    @success="handleReservationSuccess"
  />

  <div v-if="showSuccessModal" class="modal-overlay">
    <div class="modal-card">
      <h3 class="text-success">Sukces!</h3>
      <p>{{ successMessageText }}</p>
      <div class="modal-actions center">
        <button @click="closeSuccessModal" class="btn-primary">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api';
import MovieScreenings from '@/components/MovieScreenings.vue';
import CinemaHall from '@/components/CinemaHall.vue';

const localities = ref([]);
const selectedLocality = ref(null);
const groupedScreenings = ref({});
const loading = ref(true);
const error = ref(null);
const availableDates = ref([]);
const selectedDate = ref(null);
const allScreeningsForLocality = ref([]);
const selectedSeansForPopup = ref(null);

const showSuccessModal = ref(false);
const successMessageText = ref('');

function filterAndGroupScreenings() {
  if (!selectedDate.value) return;

  const filtered = allScreeningsForLocality.value.filter(seans => {
    return seans.data.startsWith(selectedDate.value);
  });

  const groups = {};
  filtered.forEach(seans => {
    if (!groups[seans.tytul]) {
      groups[seans.tytul] = [];
    }
    groups[seans.tytul].push(seans);
  });

  for (const title in groups) {
    groups[title].sort((a, b) => a.godzina.localeCompare(b.godzina));
  }
  
  groupedScreenings.value = groups;
}

onMounted(async () => {
  try {
    const response = await apiClient.get('/Seanse');
    const uniqueLocalities = [...new Set(response.data.map(s => s.miejscowosc))];
    localities.value = uniqueLocalities.sort();
  } catch (err) {
    error.value = 'Nie udało się pobrać listy miejscowości.';
  } finally {
    loading.value = false;
  }
});

async function selectLocality(locality) {
  selectedLocality.value = locality;
  loading.value = true;
  error.value = null;
  closeSeatSelector(); 

  try {
    const response = await apiClient.get(`/Seanse/search?miejscowosc=${locality}`);
    allScreeningsForLocality.value = response.data;

    const uniqueDateStrings = [...new Set(response.data.map(s => s.data.split('T')[0]))];
    uniqueDateStrings.sort();

    if (uniqueDateStrings.length > 0) {
      const options = { weekday: 'short' };
      availableDates.value = uniqueDateStrings.map(isoDate => {
        const date = new Date(isoDate);
        return {
          dayName: new Intl.DateTimeFormat('pl-PL', options).format(date),
          dayNumber: date.getDate(),
          iso: isoDate
        };
      });
      selectedDate.value = availableDates.value[0].iso;
      filterAndGroupScreenings();
    } else {
      availableDates.value = [];
      selectedDate.value = null;
      groupedScreenings.value = {};
    }

  } catch (err) {
    error.value = 'Nie udało się pobrać danych dla wybranej miejscowości.';
  } finally {
    loading.value = false;
  }
}

function selectDate(date) {
  selectedDate.value = date;
  filterAndGroupScreenings();
}

function resetSelection() {
  selectedLocality.value = null;
  selectedDate.value = null;
  groupedScreenings.value = {};
  availableDates.value = [];
  allScreeningsForLocality.value = [];
  error.value = null;
}

function openSeatSelector(seansId) {
  selectedSeansForPopup.value = seansId;
}

function closeSeatSelector() {
  selectedSeansForPopup.value = null;
}

function handleReservationSuccess(message) {
  successMessageText.value = message;
  showSuccessModal.value = true;
  
  selectLocality(selectedLocality.value); 
}

function closeSuccessModal() {
  showSuccessModal.value = false;
}
</script>

<style scoped>
.home-view h2 { 
  font-size: 2em; 
  border-bottom: 2px solid #ff9900; 
  padding-bottom: 10px; 
  margin-bottom: 30px; 
  color: #ffffff;
}

.locality-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}
.locality-btn {
  background-color: #1a1a1a;
  border: 1px solid #444;
  color: #ffffff;
  padding: 15px 30px;
  font-size: 1.2em;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}
.locality-btn:hover {
  background-color: #ff9900;
  color: #000000;
  border-color: #ff9900;
}

.header-with-back {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header-with-back h3 {
  margin: 0;
  font-size: 1.5em;
  color: #ff9900;
}
.back-btn {
  background: none;
  border: 1px solid #444;
  color: #b0b0b0;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}
.back-btn:hover {
  background-color: #1a1a1a;
  color: #ff9900;
  border-color: #ff9900;
}

.message-box { 
  text-align: center; 
  padding: 40px; 
  font-size: 1.2em; 
  background-color: #1a1a1a; 
  border: 1px solid #333;
  border-radius: 8px; 
}
.message-box.error { 
  color: #ff9900; 
  border-color: #ff9900;
}

.date-picker {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  overflow-x: auto;
}
.date-picker::-webkit-scrollbar {
  display: none;
}
.date-picker {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.date-btn {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1a1a1a;
  border: 1px solid #444;
  color: #ffffff;
  min-width: 60px;
  height: 60px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}
.date-btn:hover {
  border-color: #ff9900;
  color: #ff9900;
}
.date-btn.active {
  background-color: #ff9900;
  border-color: #ff9900;
  color: #000000;
}
.date-btn .day-name {
  font-size: 0.8em;
  text-transform: capitalize;
}
.date-btn .day-number {
  font-size: 1.4em;
  font-weight: bold;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal-card {
  background-color: #1a1a1a;
  border: 1px solid #ff9900;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 0 20px rgba(255, 153, 0, 0.2);
  text-align: center;
}
.modal-card h3 { margin-top: 0; color: #fff; }
.modal-card p { color: #ccc; font-size: 1.1em; }
.modal-actions.center { justify-content: center; display: flex; margin-top: 20px; }

.btn-primary {
  background-color: #ff9900;
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.btn-primary:hover { background-color: #e68a00; }
.text-success { color: #4caf50; }
</style>