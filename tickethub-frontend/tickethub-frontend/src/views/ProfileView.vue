<template>
  <div class="profile-container">
    
    <div class="profile-details-card">
      <h2>Twój profil</h2>
      <div v-if="loadingProfile" class="message-box">Ładowanie...</div>
      <div v-if="errorProfile" class="message-box error">{{ errorProfile }}</div>
      <div v-if="profile" class="profile-details">
        <p><strong>Nazwa użytkownika:</strong> {{ profile.username }}</p>
        <p><strong>Email:</strong> {{ profile.email }}</p>
      </div>
    </div>

    <div class="tickets-section">
      <h2>Moje Bilety</h2>
      <div v-if="loadingTickets" class="message-box">Ładowanie biletów...</div>
      <div v-if="errorTickets" class="message-box error">{{ errorTickets }}</div>
      
      <div v-if="!loadingTickets && !errorTickets">
        <div v-if="tickets.length > 0" class="tickets-list">
          
          <div v-for="ticket in tickets" :key="ticket.id" class="ticket-card">
            <div class="ticket-header">{{ ticket.seansTytul }}</div>
            <div class="ticket-body">
              <p class="ticket-code-row">
                <strong>KOD BILETU:</strong> 
                <span class="code-highlight">{{ ticket.kodBiletu }}</span>
              </p>
              <p><strong>Data:</strong> {{ formatDate(ticket.seansData) }}</p>
              <p><strong>Godzina:</strong> {{ ticket.seansGodzina }}</p>
              <p><strong>Miejsce:</strong> {{ ticket.numerMiejsca }}</p>
              <p><strong>Sala:</strong> {{ ticket.sala || 'Brak info' }}</p>
            </div>
            <div class="ticket-footer">
              <button 
                @click="openConfirmModal(ticket.id)" 
                class="cancel-btn"
                :disabled="isCancelling"
              >
                Anuluj bilet
              </button>
            </div>
          </div>

        </div>
        <div v-else class="message-box">
          <p>Nie masz jeszcze żadnych biletów.</p>
        </div>
      </div>
    </div>

    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal-card">
        <h3>Potwierdzenie</h3>
        
        <p>Czy na pewno chcesz anulować ten bilet?</p>

        <div v-if="partnerTicket" class="sofa-warning">
          <p class="warning-header">⚠️ Anulujesz bilet z kanapy!</p>
          <p>Wraz z anulowaniem tego biletu anuluje się również:</p>
          <div class="partner-info">
            <p>Miejsce nr: <strong>{{ partnerTicket.numerMiejsca }}</strong></p>
          </div>
        </div>

        <p class="warning-text">Tej operacji nie można cofnąć.</p>
        
        <div class="modal-actions">
          <button @click="closeModal" class="btn-secondary">Nie, wróć</button>
          <button @click="confirmCancellation" class="btn-danger">
            {{ isCancelling ? 'Usuwanie...' : 'Tak, anuluj' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showMessageModal" class="modal-overlay">
      <div class="modal-card">
        <h3 :class="{'text-error': isError, 'text-success': !isError}">
          {{ isError ? 'Wystąpił błąd' : 'Sukces' }}
        </h3>
        <p>{{ messageText }}</p>
        <div class="modal-actions center">
          <button @click="closeMessageModal" class="btn-primary">OK</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api';

const profile = ref(null);
const loadingProfile = ref(true);
const errorProfile = ref(null);
const tickets = ref([]);
const loadingTickets = ref(true);
const errorTickets = ref(null);

const showConfirmModal = ref(false);
const showMessageModal = ref(false);
const ticketIdToDelete = ref(null);
const partnerTicket = ref(null); 
const isCancelling = ref(false);
const messageText = ref('');
const isError = ref(false);

onMounted(async () => {
  try {
    const profileResponse = await apiClient.get('/Auth/profile');
    profile.value = profileResponse.data;
  } catch (err) {
    errorProfile.value = 'Nie udało się załadować profilu.';
  } finally {
    loadingProfile.value = false;
  }

  try {
    const ticketsResponse = await apiClient.get('/Bilety/moje');
    tickets.value = ticketsResponse.data;
  } catch (err) {
    errorTickets.value = "Nie udało się pobrać biletów.";
  } finally {
    loadingTickets.value = false;
  }
});

const openConfirmModal = (id) => {
  ticketIdToDelete.value = id;
  partnerTicket.value = null; 

  const currentTicket = tickets.value.find(t => t.id === id);
  if (currentTicket && currentTicket.numerMiejsca > 80) {
      const seatNum = currentTicket.numerMiejsca;
      const partnerSeatNum = seatNum % 2 !== 0 ? seatNum + 1 : seatNum - 1;
      
      const foundPartner = tickets.value.find(t => 
        t.seansId === currentTicket.seansId && 
        t.numerMiejsca === partnerSeatNum
      );

      if (foundPartner) {
        partnerTicket.value = foundPartner;
      }
  }

  showConfirmModal.value = true;
};

const confirmCancellation = async () => {
  if (!ticketIdToDelete.value) return;

  isCancelling.value = true;

  const partnerIdToDelete = partnerTicket.value ? partnerTicket.value.id : null;

  try {
    await apiClient.delete(`/Bilety/anuluj/${ticketIdToDelete.value}`);

    let idsToRemove = [ticketIdToDelete.value];

    if (partnerIdToDelete) {
        idsToRemove.push(partnerIdToDelete);
    }

    tickets.value = tickets.value.filter(t => !idsToRemove.includes(t.id));
    
    showConfirmModal.value = false;
  } catch (err) {
    showConfirmModal.value = false;
    const msg = err.response?.data || "Nie udało się anulować biletu.";
    showMessage(typeof msg === 'string' ? msg : JSON.stringify(msg), true);
  } finally {
    isCancelling.value = false;
    ticketIdToDelete.value = null;
    partnerTicket.value = null;
  }
};

const closeModal = () => {
  showConfirmModal.value = false;
  ticketIdToDelete.value = null;
  partnerTicket.value = null;
};

const showMessage = (text, error = false) => {
  messageText.value = text;
  isError.value = error;
  showMessageModal.value = true;
};

const closeMessageModal = () => {
  showMessageModal.value = false;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('pl-PL');
};
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.profile-details-card {
  background-color: #1a1a1a;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #333;
}
.profile-details-card h2 {
  border-bottom: 2px solid #ff9900;
  padding-bottom: 10px;
  margin: 0 0 20px 0;
}
.profile-details p { font-size: 1.2em; color: #b0b0b0; }
.profile-details strong { color: #fff; }

.tickets-section h2 { 
  font-size: 2em; 
  border-bottom: 2px solid #ff9900; 
  padding-bottom: 10px; 
  margin-bottom: 30px; 
}
.tickets-list { display: grid; gap: 20px; }
.ticket-card { 
  background-color: #1a1a1a; 
  border: 1px solid #333; 
  border-radius: 8px; 
  overflow: hidden; 
}
.ticket-header { 
  background-color: #000; 
  padding: 15px; 
  font-size: 1.2em; 
  font-weight: bold; 
  color: #ff9900; 
  border-bottom: 1px solid #333; 
}
.ticket-body { padding: 15px; }
.ticket-body p { margin: 0 0 10px; color: #b0b0b0; }
.ticket-body strong { color: #fff; }

.ticket-code-row {
  margin-bottom: 15px !important;
  font-size: 1.1em;
  border-bottom: 1px dashed #333;
  padding-bottom: 10px;
}
.code-highlight {
  color: #ff9900;
  font-family: monospace;
  font-size: 1.4em;
  font-weight: bold;
  letter-spacing: 2px;
  margin-left: 10px;
}

.ticket-footer {
  padding: 15px;
  background-color: #121212;
  border-top: 1px solid #333;
  display: flex;
  justify-content: flex-end;
}
.cancel-btn {
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.cancel-btn:hover { background-color: #b71c1c; }
.message-box { 
  text-align: center; 
  padding: 40px 20px; 
  font-size: 1.2em; 
  background-color: #1a1a1a; 
  border-radius: 8px; 
}
.message-box.error { color: #ff9900; }

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
  z-index: 1000;
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

.modal-card h3 {
  margin-top: 0;
  color: #fff;
}

.modal-card p {
  color: #ccc;
  font-size: 1.1em;
}

.warning-text {
  color: #ff9900 !important;
  font-size: 0.9em !important;
  margin-bottom: 20px;
}

.sofa-warning {
  background-color: rgba(255, 153, 0, 0.1);
  border: 1px solid #ff9900;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
  text-align: left;
}
.sofa-warning .warning-header {
  color: #ff9900;
  font-weight: bold;
  margin-top: 0;
}
.sofa-warning .partner-info {
  margin-top: 10px;
  padding-left: 10px;
  border-left: 3px solid #ff9900;
}
.sofa-warning .partner-info p {
  margin: 0;
  color: #fff;
  font-size: 1em;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions.center {
  justify-content: center;
}

.btn-secondary {
  background-color: #333;
  color: white;
  border: 1px solid #555;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary:hover { background-color: #444; }

.btn-danger {
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.btn-danger:hover { background-color: #b71c1c; }

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

.text-error { color: #d32f2f; }
.text-success { color: #4caf50; }
</style>