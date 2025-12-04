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
          <router-link to="/login">Zaloguj się</router-link>
          <router-link to="/register">Zarejestruj się</router-link>
        </template>
      </nav>
    </header>
    <main class="app-main">
      <router-view/>
    </main>

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

const isMenuOpen = ref(false);
const showLogoutModal = ref(false);
const { logout } = useAuth();
const router = useRouter();

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
  router.push('/login');
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
</style>