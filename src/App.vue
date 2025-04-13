<template>
  <div id="app">
    <nav>
      
      <template v-if="!isLoggedIn">
        <router-link to="/login">Login</router-link>
        <router-link to="/register">Register</router-link>
      </template>
      <template v-else>
        <span>{{ username }}</span>
        <router-link to="/home">Home</router-link>
        <UserSearchBar></UserSearchBar>
        <router-link to="/privateChats">Private Chats</router-link>
        <button @click="logout">Logout</button>
      </template>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import UserSearchBar from './components/userSearchBar.vue';

export default {
  name: 'App',
  components: {
    UserSearchBar,
  },
  setup() {
    const isLoggedIn = ref(false);
    const username = ref('');
    const router = useRouter();

    const checkAuth = () => {
      isLoggedIn.value = localStorage.getItem('token') !== null;
      username.value = localStorage.getItem('username') || '';
    };

    onMounted(() => {
      checkAuth();
      // Escucha los cambios en el localStorage (por si se loguea/desloguea en otra pestaña)
      window.addEventListener('storage', checkAuth);
    });

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      isLoggedIn.value = false;
      username.value = '';
      router.push('/login'); // Redirigir al login después de cerrar sesión
    };

    // Observa los cambios en la ruta para actualizar el estado de isLoggedIn
    watch(router.currentRoute, checkAuth);

    return {
      isLoggedIn,
      username,
      logout
    };
  }
};
</script>

<style scoped>
nav {
  background-color: #150605;
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  align-items: center; /* Para alinear verticalmente el nombre y el botón */
}

nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
}

nav a:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
  border-color: white;
  font-weight: bold;
}

nav span {
  color: white;
  margin-right: 1rem;
}

nav button {
  background-color: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

nav button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>