<template>
  <div class="auth-container">
    <form @submit.prevent="handleRegister" class="auth-form">
      <h2>Zarejestruj się</h2>
      
      <div class="form-group">
        <label for="username">Nazwa użytkownika</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      
      <div class="form-group">
        <label for="password">Hasło</label>
        <div class="password-wrapper">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="password" 
            v-model="password" 
            required
          >
          <button type="button" class="toggle-password" @click="showPassword = !showPassword">
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          </button>
        </div>
      </div>

      <button type="submit" class="ph-button">Zarejestruj</button>
       <div class="switch-form">
        Masz już konto? <router-link to="/login">Zaloguj się</router-link>
      </div>
    </form>

    <div v-if="showMessageModal" class="modal-overlay">
      <div class="modal-card">
        <h3 :class="{'text-error': isError, 'text-success': !isError}">
          {{ isError ? 'Błąd' : 'Sukces' }}
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../api';

const username = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const router = useRouter();

const showMessageModal = ref(false);
const messageText = ref('');
const isError = ref(false);

async function handleRegister() {
    try {
        await apiClient.post('/Auth/register', {
            username: username.value,
            email: email.value,
            password: password.value
        });
        
        isError.value = false;
        messageText.value = "Rejestracja pomyślna! Możesz się teraz zalogować.";
        showMessageModal.value = true;
        
    } catch (err) {
        isError.value = true;
        messageText.value = err.response?.data || 'Wystąpił błąd podczas rejestracji.';
        showMessageModal.value = true;
        console.error(err);
    }
}

function closeMessageModal() {
  showMessageModal.value = false;
  if (!isError.value) {
    router.push('/login');
  }
}
</script>

<style scoped>
@import '../assets/auth-form.css';

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  width: 100%;
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #b0b0b0;
  display: flex;
  align-items: center;
  padding: 0;
}

.toggle-password:hover {
  color: #ff9900;
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
.modal-card h3 { margin-top: 0; color: #fff; }
.modal-card p { color: #ccc; font-size: 1.1em; }
.modal-actions.center { display: flex; justify-content: center; margin-top: 20px; }
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