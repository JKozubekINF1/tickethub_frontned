<template>
  <div class="popup-overlay" @click.self="emit('close')">
    <div class="popup-container">
      <button class="close-btn" @click="emit('close')" title="Zamknij">×</button>
      
      <div class="header">
        <h2>Wybierz swoje miejsca</h2>
        <div class="screen">EKRAN</div>
      </div>

      <div v-if="loading" class="message-box">Ładowanie informacji o miejscach...</div>
      <div v-if="error" class="message-box error">{{ error }}</div>

      <div v-if="!loading && !error" class="seating-grid">
        <div v-for="(row, rowIndex) in seats" :key="`row-${rowIndex}`" class="seat-row">
          <div class="row-label">{{ String.fromCharCode(65 + rowIndex) }}</div>
          
          <template v-if="row[0] && row[0].type === 'single'">
            <div v-for="seat in row.slice(0, 2)" :key="seat.id" class="seat" :class="{ occupied: seat.isOccupied, selected: seat.isSelected }" @click="toggleSeatSelection(seat)"></div>
            <div class="aisle"></div>
            <div v-for="seat in row.slice(2, 8)" :key="seat.id" class="seat" :class="{ occupied: seat.isOccupied, selected: seat.isSelected }" @click="toggleSeatSelection(seat)"></div>
            <div class="aisle"></div>
            <div v-for="seat in row.slice(8, 10)" :key="seat.id" class="seat" :class="{ occupied: seat.isOccupied, selected: seat.isSelected }" @click="toggleSeatSelection(seat)"></div>
          </template>

          <template v-if="row[0] && row[0].type === 'sofa'">
            <div v-for="sofa in row" :key="sofa.id" class="seat sofa" :class="{ occupied: sofa.isOccupied, selected: sofa.isSelected }" @click="toggleSeatSelection(sofa)"></div>
          </template>
        </div>
      </div>
      
      <div class="legend">
        <div class="legend-item"><div class="seat-indicator available"></div>Wolne</div>
        <div class="legend-item"><div class="seat-indicator sofa-indicator"></div>Kanapa</div>
        <div class="legend-item"><div class="seat-indicator selected"></div>Wybrane</div>
        <div class="legend-item"><div class="seat-indicator occupied"></div>Zajęte</div>
      </div>

      <div class="footer" v-if="selectedSeats.length > 0">
        <div class="summary">
          <span>Wybrano: <strong>{{ selectedSeats.length }}</strong></span>
        </div>
        <button class="continue-btn" @click="handleReservation">Zarezerwuj</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '../api';

const props = defineProps({ seansId: { type: Number, required: true } });
const emit = defineEmits(['close', 'success']);
const seats = ref([]);
const loading = ref(true);
const error = ref(null);


const seatIdToNumber = (id) => {
  const row = id.charCodeAt(0) - 65; 
  const number = parseInt(id.substring(1), 10);
  if (row < 8) { 
    return row * 10 + number;
  } else { 
    const sofaIndex = Math.floor((number - 1) / 2); 
    return 80 + (row - 8) * 10 + sofaIndex * 2 + (number % 2 === 0 ? 2 : 1);
  }
};

const generateSeats = (occupiedSeatNumbers) => {
  const hall = [];
  for (let i = 0; i < 8; i++) {
    const rowLabel = String.fromCharCode(65 + i);
    const row = [];
    for (let j = 0; j < 10; j++) {
      const number = j + 1;
      const seatId = `${rowLabel}${number}`;
      const seatNumber = seatIdToNumber(seatId);
      row.push({
        type: 'single', id: seatId, row: rowLabel, number,
        isOccupied: occupiedSeatNumbers.includes(seatNumber),
        isSelected: false,
      });
    }
    hall.push(row);
  }
  for (let i = 8; i < 10; i++) {
    const rowLabel = String.fromCharCode(65 + i);
    const row = [];
    for (let j = 0; j < 5; j++) {
      const seat1Num = j * 2 + 1;
      const seat2Num = j * 2 + 2;
      const seat1Id = `${rowLabel}${seat1Num}`;
      const seat2Id = `${rowLabel}${seat2Num}`;
      const seat1ApiNum = seatIdToNumber(seat1Id);
      const seat2ApiNum = seatIdToNumber(seat2Id);
      row.push({
        type: 'sofa', id: `${seat1Id}-${seat2Id}`, row: rowLabel,
        seats: [
          { id: seat1Id, number: seat1Num, row: rowLabel, apiNumber: seat1ApiNum },
          { id: seat2Id, number: seat2Num, row: rowLabel, apiNumber: seat2ApiNum },
        ],
        isOccupied: occupiedSeatNumbers.includes(seat1ApiNum) || occupiedSeatNumbers.includes(seat2ApiNum),
        isSelected: false,
      });
    }
    hall.push(row);
  }
  return hall;
};

onMounted(async () => {
  try {
    const response = await apiClient.get(`/Bilety/dostepne/${props.seansId}`);
    const totalSeats = 100;
    const allSeatNumbers = Array.from({ length: totalSeats }, (_, i) => i + 1);
    const occupiedSeatNumbers = allSeatNumbers.filter(num => !response.data.wolneMiejsca.includes(num));
    
    seats.value = generateSeats(occupiedSeatNumbers);
  } catch (err) {
    error.value = "Nie udało się pobrać informacji o miejscach. Spróbuj ponownie.";
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const selectedSeats = computed(() => {
  return seats.value.flat()
    .filter(item => item.isSelected)
    .flatMap(item => (item.type === 'sofa' ? item.seats : { ...item, apiNumber: seatIdToNumber(item.id) }));
});

const toggleSeatSelection = (item) => {
  if (!item.isOccupied) {
    item.isSelected = !item.isSelected;
  }
};

const handleReservation = async () => {
  if (selectedSeats.value.length === 0) return;
  
  try {
    const reservationPromises = selectedSeats.value.map(seat => 
      apiClient.post(`/Bilety/kup?seansId=${props.seansId}&numerMiejsca=${seat.apiNumber}`)
    );
    
    await Promise.all(reservationPromises);
    
    emit('success', `Pomyślnie zarezerwowano ${selectedSeats.value.length} miejsc!`);
    emit('close');
    
  } catch (err) {
    alert("Błąd podczas rezerwacji. Możliwe, że ktoś Cię ubiegł. Odśwież stronę i spróbuj ponownie.");
    console.error(err);
    emit('close');
  }
};
</script>

<style scoped>
.popup-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px); }
.popup-container { background-color: #2c2c2c; color: #f0f0f0; padding: 2rem; border-radius: 16px; width: auto; min-width: 600px; max-width: 95vw; font-family: 'Segoe UI', sans-serif; border: 1px solid #444; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 1.5rem; }
.close-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; color: #888; font-size: 2rem; cursor: pointer; transition: color 0.2s; }
.close-btn:hover { color: #fff; }
.header h2 { text-align: center; font-weight: 400; font-size: 1.5rem; margin: 0 0 1rem 0; }
.screen { background-color: #1a1a1a; color: #777; padding: 5px 0; margin: 0 auto; width: 70%; border-radius: 3px; text-align: center; font-size: 0.8rem; letter-spacing: 2px; border-bottom: 3px solid #ff9900; }
.seating-grid { display: flex; flex-direction: column; gap: 8px; align-items: center; }
.seat-row { display: flex; align-items: center; gap: 8px; }
.aisle { width: 20px; }
.row-label { width: 25px; text-align: center; color: #888; font-weight: 600; }
.seat { width: 28px; height: 28px; border-radius: 6px; background-color: #4a90e2; cursor: pointer; transition: all 0.2s ease; border: 1px solid rgba(0,0,0,0.2); }
.seat:not(.occupied):hover { transform: scale(1.15); background-color: #5aa1f2; }
.seat.selected { background-color: #4CAF50;}
.seat.occupied { background-color: #e74c3c; cursor: not-allowed; }
.seat.sofa { width: calc(28px * 2 + 8px); background-color: #9b59b6; }
.seat.sofa:not(.occupied):hover { background-color: #8e44ad; }
.seat.sofa.selected { background-color: #4CAF50; }
.seat.sofa.occupied { background-color: #e74c3c !important;}
.legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem; padding-top: 1rem; border-top: 1px solid #444; }
.legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
.seat-indicator { width: 18px; height: 18px; border-radius: 4px; }
.seat-indicator.available { background-color: #4a90e2; }
.seat-indicator.sofa-indicator { background-color: #9b59b6; }
.seat-indicator.selected { background-color: #4CAF50; }
.seat-indicator.occupied { background-color: #e74c3c; }
.footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid #444; }
.summary { display: flex; gap: 1.5rem; font-size: 1rem; }
.summary strong { color: #4CAF50; }
.continue-btn { padding: 10px 25px; font-size: 1rem; font-weight: 600; color: white; background-color: #e67e22; border: none; border-radius: 8px; cursor: pointer; transition: background-color 0.2s; }
.continue-btn:hover { background-color: #d35400; }
.message-box { text-align: center; padding: 40px; font-size: 1.2em; background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px; }
.message-box.error { color: #ff9900; border-color: #ff9900; }
</style>