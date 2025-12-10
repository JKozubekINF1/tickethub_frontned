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

      <div class="form-group">
        <label for="confirmPassword">Potwierdź hasło</label>
        <div class="password-wrapper">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            required
          >
        </div>
      </div>

      <button type="submit" class="ph-button">Zarejestruj</button>

      <div class="switch-form">
        Masz już konto? <a href="#" @click.prevent="$emit('switch-to-login')">Zaloguj się</a>
      </div>
    </form>

    <div v-if="showMessageModal" class="modal-overlay">
      <div class="modal-card" :class="{'error-glow': isError, 'success-glow': !isError}">
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
import apiClient from '../api';

const emit = defineEmits(['success', 'switch-to-login']);
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);

const showMessageModal = ref(false);
const messageText = ref('');
const isError = ref(false);

async function handleRegister() {

  if (password.value !== confirmPassword.value) {
    isError.value = true;
    messageText.value = "Hasła nie są takie same!";
    showMessageModal.value = true;
    return;
  }

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
    emit('switch-to-login');
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
  z-index: 3000;
}

.modal-card {
  background-color: #1a1a1a;
  border: none;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 
    0 10px 30px rgba(0,0,0,0.8),
    0 0 20px rgba(255, 153, 0, 0.6);
}

.error-glow {
  box-shadow: 
    0 10px 30px rgba(0,0,0,0.8),
    0 0 20px rgba(255, 50, 50, 0.6),
    0 0 60px rgba(255, 50, 50, 0.4);
}
.success-glow {
   box-shadow: 
    0 10px 30px rgba(0,0,0,0.8),
    0 0 20px rgba(50, 255, 50, 0.6),
    0 0 60px rgba(50, 255, 50, 0.4);
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
.switch-form a { color: #ff9900; text-decoration: none; font-weight: bold; }
.switch-form a:hover { text-decoration: underline; }
</style>