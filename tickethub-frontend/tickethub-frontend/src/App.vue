<template>
  <div id="app-container">
    <header class="app-header">
      <router-link to="/" class="logo-link">
        <h1 class="logo">
          Ticket<span class="logo-accent">HUB</span>
        </h1>
      </router-link>

      <button class="hamburger" @click="toggleMenu" :class="{ 'is-active': isMenuOpen }">
        <span class="line"></span>
        <span class="line"></span>
        <span class="line"></span>
      </button>

      <nav :class="{ 'menu-active': isMenuOpen }">
        <router-link to="/">Przeglądaj seanse</router-link>
        
        <template v-if="userState.token">
          <router-link to="/profile">Profil ({{ userState.username }})</router-link>
          <a @click.prevent="openLogoutModal" href="#">Wyloguj</a>
        </template>
        
        <template v-else>
          <a href="#" @click.prevent="openLoginModal">Zaloguj się</a>
          <a href="#" @click.prevent="openRegisterModal">Zarejestruj się</a>
        </template>
      </nav>
    </header>
    <main class="app-main">
      <router-view/>
    </main>

    <div v-if="showLogin" class="modal-overlay" @click.self="closeModals">
      <div class="modal-card auth-modal">
        <button class="close-modal-btn" @click="closeModals">×</button>
        <LoginView 
          @success="handleLoginSuccess" 
          @switch-to-register="switchToRegister"
        />
      </div>
    </div>

    <div v-if="showRegister" class="modal-overlay" @click.self="closeModals">
      <div class="modal-card auth-modal">
        <button class="close-modal-btn" @click="closeModals">×</button>
        <RegisterView 
          @success="handleRegisterSuccess" 
          @switch-to-login="switchToLogin"
        />
      </div>
    </div>

    <div v-if="showLogoutModal" class="modal-overlay">
      <div class="modal-card">
        <h3>Wylogowywanie</h3>
        <p>Czy na pewno chcesz się wylogować?</p>
        
        <div class="modal-actions">
          <button @click="closeLogoutModal" class="btn-secondary">Anuluj</button>
          <button @click="confirmLogout" class="btn-primary">Wyloguj</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userState, useAuth } from './auth';
import LoginView from './views/LoginView.vue';
import RegisterView from './views/RegisterView.vue';

const isMenuOpen = ref(false);
const showLogoutModal = ref(false);
const { logout } = useAuth();
const router = useRouter();

const showLogin = ref(false);
const showRegister = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function openLogoutModal() {
  showLogoutModal.value = true;
  isMenuOpen.value = false;
}

function closeLogoutModal() {
  showLogoutModal.value = false;
}

function confirmLogout() {
  logout();
  showLogoutModal.value = false;
  router.push('/');
}

function openLoginModal() {
  showLogin.value = true;
  showRegister.value = false;
  isMenuOpen.value = false;
}

function openRegisterModal() {
  showRegister.value = true;
  showLogin.value = false;
  isMenuOpen.value = false;
}

function closeModals() {
  showLogin.value = false;
  showRegister.value = false;
}

function switchToRegister() {
  showLogin.value = false;
  showRegister.value = true;
}

function switchToLogin() {
  showRegister.value = false;
  showLogin.value = true;
}

function handleLoginSuccess() {
  closeModals();
}

function handleRegisterSuccess() {
  switchToLogin();
}
</script>

<style>
body { margin: 0; font-family: sans-serif; background-color: #000000; color: #ffffff; }
#app-container { max-width: 1200px; margin: 0 auto; padding: 20px; }

.app-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  background-color: #1a1a1a; 
  padding: 15px 30px; 
  border-radius: 8px; 
  border: 1px solid #333; 
  margin-bottom: 30px;
  position: relative; 
}
.logo-link { text-decoration: none; }
.logo { margin: 0; font-size: 1.8em; font-weight: bold; color: #ffffff; }
.logo-accent { background-color: #ff9900; color: #000000; padding: 2px 8px; border-radius: 5px; margin-left: 4px; }

.app-header nav { display: flex; align-items: center; }
.app-header nav a { 
  color: #b0b0b0; 
  text-decoration: none; 
  font-weight: bold; 
  margin-left: 20px; 
  transition: color 0.3s; 
  cursor: pointer;
  white-space: nowrap; 
}
.app-header nav a.router-link-exact-active, .app-header nav a:hover { color: #ff9900; }

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
}
.hamburger .line {
  width: 2rem;
  height: 0.25rem;
  background: #ff9900;
  border-radius: 10px;
  transition: all 0.3s linear;
  position: relative;
  transform-origin: 1px;
}
.hamburger.is-active .line:nth-child(1) { transform: rotate(45deg); }
.hamburger.is-active .line:nth-child(2) { opacity: 0; transform: translateX(20px); }
.hamburger.is-active .line:nth-child(3) { transform: rotate(-45deg); }

@media (max-width: 850px) {
  .app-header nav {
    display: none; 
    flex-direction: column;
    position: absolute;
    top: 100%; 
    left: 0;
    width: 100%;
    background-color: #1a1a1a;
    border-radius: 0 0 8px 8px;
    border-top: 1px solid #333;
    padding: 10px 0;
    z-index: 100;
  }
  .app-header nav.menu-active { display: flex; }
  .app-header nav a {
    margin: 0;
    padding: 15px 30px; 
    width: 100%;
    text-align: left;
    box-sizing: border-box;
  }
  .hamburger { display: flex; }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
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
    0 0 20px rgba(255, 153, 0, 0.6),
    0 0 60px rgba(255, 153, 0, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease; 
  border-top: 3px solid rgba(255, 255, 255, 0.15); 
  border-left: 3px solid rgba(255, 255, 255, 0.1);
  border-right: 3px solid rgba(255, 255, 255, 0.1);
  border-bottom: 3px solid rgba(255, 255, 255, 0.1);
}

.modal-card:hover {
   transform: translateY(-2px);
   box-shadow: 
    0 15px 35px rgba(0,0,0,0.9),
    0 0 25px rgba(255, 153, 0, 0.7),
    0 0 70px rgba(255, 153, 0, 0.5);
}

.modal-card h3 { margin-top: 0; color: #fff; }
.modal-card p { color: #ccc; font-size: 1.1em; }
.modal-actions { display: flex; justify-content: center; gap: 15px; margin-top: 20px; }

.btn-secondary {
  background-color: #333;
  color: white;
  border: 1px solid #555;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary:hover { background-color: #444; }

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

.auth-modal {
  max-width: 450px;
  width: 90%;
  position: relative;
  padding: 0;
  overflow: hidden;
}

.close-modal-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  color: #888;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  z-index: 20;
  transition: color 0.2s;
}
.close-modal-btn:hover { color: #ff9900; }

.auth-modal .auth-container {
  min-height: auto;
  padding: 40px 30px 30px;
  width: 100%;
  box-sizing: border-box;
}

.auth-modal .auth-form {
  border: none;
  box-shadow: none;
  background: transparent;
  width: 100%;
  padding: 0;
}
</style>