<template>
  <div class="home-container">
    <h1>¡Bienvenido a la Página de Inicio!</h1>
    <p>Este es el contenido principal de la página de inicio de tu aplicación Vue.</p>
    <template v-if="users.length > 0">
      <h2>Lista de Usuarios</h2>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
          </tr>
        </tbody>
      </table>
    </template>
    <template v-else-if="loading">
      <p>Cargando usuarios...</p>
    </template>
    <template v-else>
      <p>No se encontraron usuarios.</p>
    </template>
    <div class="chat-container-wrapper">
      <ChatBar />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import ChatBar from '@/components/ChatBar.vue'; // Asegúrate de que la ruta sea correcta

export default {
  name: 'HomeView',
  components: {
    ChatBar,
  },
  setup() {
    const users = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const token = ref();

    onMounted(async () => {
      loading.value = true;
      token.value = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3000/api/all_users', {
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        users.value = data.users;
      } catch (err) {
        error.value = err;
        console.error('Error al cargar los usuarios:', err);
      } finally {
        loading.value = false;
      }
    });

    return {
      users,
      loading,
      error,
      token,
    };
  },
};
</script>

<style scoped>
.home-container { /* Contenedor para el contenido principal y el chat */
  position: relative; /* Necesario para posicionar el chat absolutamente dentro */
  min-height: 100vh; /* Asegura que el contenedor ocupe al menos toda la altura de la pantalla */
  padding-bottom: 420px; /* Espacio para que el contenido no se superponga con el chat (considerando la altura del chat + margen) */
  box-sizing: border-box; /* Incluye el padding en el cálculo del tamaño */
  padding: 1rem; /* Un poco de padding general */
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  line-height: 1.6;
  margin-bottom: 1rem;
}

h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.chat-container-wrapper { /* Contenedor para el ChatView */
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px; /* Ancho deseado para el chat */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Sombra suave */
  border-radius: 8px;
  overflow: hidden; /* Para que el border-radius funcione correctamente con el contenido */
}
</style>