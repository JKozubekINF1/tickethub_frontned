<template>
  <div class="auth-container">
    <form @submit.prevent="handleLogin" class="auth-form">
      <h2>Zaloguj się</h2>
      
      <div class="form-group">
        <label for="username">Nazwa użytkownika</label>
        <input type="text" id="username" v-model="username" required>
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

      <div class="forgot-password-link">
        <a href="#" @click.prevent="openForgotPassword">Zapomniałeś hasła?</a>
      </div>

      <button type="submit" class="ph-button">Zaloguj</button>
      <div class="switch-form">
        Nie masz konta? <a href="#" @click.prevent="$emit('switch-to-register')">Zarejestruj się</a>
      </div>
    </form>

    <div v-if="showErrorModal" class="modal-overlay">
      <div class="modal-card">
        <h3 class="text-error">Błąd logowania</h3>
        <p>{{ errorMessage }}</p>
        <div class="modal-actions center">
          <button @click="closeErrorModal" class="btn-primary">OK</button>
        </div>
      </div>
    </div>

    <div v-if="showForgotPasswordModal" class="modal-overlay higher-z-index">
      <div class="modal-card auth-modal">
        <button class="close-inner-btn" @click="closeForgotPassword">×</button>
        <h3>Resetowanie hasła</h3>
        
        <div v-if="resetStep === 1">
          <p>Podaj swój adres email, a wyślemy Ci kod resetujący.</p>
          <form @submit.prevent="handleSendCode" class="inner-form">
            <div class="form-group">
              <label for="resetEmail">Email</label>
              <input type="email" id="resetEmail" v-model="resetEmail" required placeholder="np. jan@kowalski.pl">
            </div>
            <div class="modal-actions center">
              <button type="submit" class="btn-primary" :disabled="isProcessing">
                {{ isProcessing ? 'Wysyłanie...' : 'Wyślij kod' }}
              </button>
            </div>
          </form>
          <p v-if="resetError" class="text-error small-text">{{ resetError }}</p>
        </div>

        <div v-else-if="resetStep === 2">
          <h4 class="text-success" style="margin-top:0;">Email wysłany!</h4>
          <p>Sprawdź swoją skrzynkę odbiorczą. Wysłaliśmy kod resetujący.</p>
          <div class="modal-actions center">
            <button @click="goToStep3" class="btn-primary">Mam kod, wpisz go</button>
          </div>
        </div>

        <div v-else-if="resetStep === 3">
          <p>Wpisz kod z maila i ustaw nowe hasło.</p>
          <form @submit.prevent="handleResetPassword" class="inner-form">
            
            <div class="form-group">
              <label for="resetToken">Kod z maila</label>
              <input type="text" id="resetToken" v-model="resetToken" required placeholder="np. A1B2C3..." autocomplete="off">
            </div>

            <div class="form-group">
              <label for="newPassword">Nowe hasło</label>
              <div class="password-wrapper">
                <input :type="showResetPassword ? 'text' : 'password'" id="newPassword" v-model="newPassword" required>
                <button type="button" class="toggle-password" @click="showResetPassword = !showResetPassword">
                  <svg v-if="!showResetPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmNewPassword">Powtórz hasło</label>
              <input type="password" id="confirmNewPassword" v-model="confirmNewPassword" required>
            </div>

            <div class="modal-actions center">
              <button type="submit" class="btn-primary" :disabled="isProcessing">
                {{ isProcessing ? 'Zmienianie...' : 'Zmień hasło' }}
              </button>
            </div>
          </form>
          <p v-if="resetError" class="text-error small-text">{{ resetError }}</p>
        </div>

        <div v-else-if="resetStep === 4">
          <h4 class="text-success">Gotowe!</h4>
          <p>Hasło zostało zmienione. Możesz się teraz zalogować.</p>
          <div class="modal-actions center">
            <button @click="closeForgotPassword" class="btn-primary">Przejdź do logowania</button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import apiClient from '../api';
import { useAuth } from '../auth';

const emit = defineEmits(['success', 'switch-to-register']);
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const { login } = useAuth();

const showErrorModal = ref(false);
const errorMessage = ref('');
const showForgotPasswordModal = ref(false);
const resetStep = ref(1); 
const isProcessing = ref(false);
const resetError = ref('');

const resetEmail = ref('');
const resetToken = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const showResetPassword = ref(false);

async function handleLogin() {
  try {
    const response = await apiClient.post('/Auth/login', {
      username: username.value,
      password: password.value
    });
    login(response.data.token, response.data.username);
    emit('success');
  } catch (err) {
    errorMessage.value = 'Nieprawidłowa nazwa użytkownika lub hasło.';
    showErrorModal.value = true;
  }
}

function closeErrorModal() {
  showErrorModal.value = false;
}


function openForgotPassword() {
  showForgotPasswordModal.value = true;
  resetStep.value = 1; 
  resetEmail.value = '';
  resetToken.value = '';
  newPassword.value = '';
  confirmNewPassword.value = '';
  resetError.value = '';
}

function closeForgotPassword() {
  showForgotPasswordModal.value = false;
}

async function handleSendCode() {
  isProcessing.value = true;
  resetError.value = '';

  try {
    await apiClient.post('/Auth/forgot-password', {
      email: resetEmail.value
    });
    resetStep.value = 2; 
  } catch (err) {
    console.error(err);
    resetError.value = err.response?.data || "Wystąpił błąd. Sprawdź email.";
  } finally {
    isProcessing.value = false;
  }
}

function goToStep3() {
  resetStep.value = 3;
  resetError.value = '';
}

async function handleResetPassword() {
  if (newPassword.value !== confirmNewPassword.value) {
    resetError.value = "Hasła nie są identyczne.";
    return;
  }

  isProcessing.value = true;
  resetError.value = '';

  try {
    await apiClient.post('/Auth/reset-password', {
      token: resetToken.value,
      newPassword: newPassword.value,
      confirmPassword: confirmNewPassword.value
    });
    resetStep.value = 4; 
  } catch (err) {
    console.error(err);
    resetError.value = err.response?.data || "Błędny kod lub hasło.";
  } finally {
    isProcessing.value = false;
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

.forgot-password-link {
  text-align: right;
  margin-top: -10px;
  margin-bottom: 20px;
}
.forgot-password-link a {
  color: #b0b0b0;
  font-size: 0.9em;
  text-decoration: none;
}
.forgot-password-link a:hover {
  color: #ff9900;
  text-decoration: underline;
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

.higher-z-index {
  z-index: 4000; 
  background-color: rgba(0, 0, 0, 0.9);
}

.modal-card {
  background-color: #1a1a1a;
  border: none;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  position: relative;
  box-shadow: 
    0 10px 30px rgba(0,0,0,0.8),
    0 0 20px rgba(255, 153, 0, 0.6),
    0 0 60px rgba(255, 153, 0, 0.4);
}
.modal-card h3 { margin-top: 0; color: #fff; margin-bottom: 15px;}
.modal-card p { color: #ccc; font-size: 1.1em; margin-bottom: 20px;}
.modal-actions.center { display: flex; justify-content: center; margin-top: 20px; }

.inner-form {
  text-align: left;
}
.inner-form .form-group {
  margin-bottom: 15px;
}
.inner-form label {
  display: block;
  margin-bottom: 5px;
  color: #b0b0b0;
  font-size: 0.9em;
}
.inner-form input {
  width: 100%;
  padding: 10px;
  background-color: #000;
  border: 1px solid #333;
  color: #fff;
  border-radius: 4px;
  box-sizing: border-box;
}
.inner-form input:focus {
  border-color: #ff9900;
  outline: none;
}

.close-inner-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  color: #666;
  font-size: 1.5rem;
  cursor: pointer;
}
.close-inner-btn:hover { color: #fff; }

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
.btn-primary:disabled { background-color: #555; cursor: not-allowed; }

.text-error { color: #d32f2f; }
.text-success { color: #4caf50; }
.small-text { font-size: 0.9em; margin-top: 10px; }

.switch-form a { color: #ff9900; text-decoration: none; font-weight: bold; }
.switch-form a:hover { text-decoration: underline; }
</style>