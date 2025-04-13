<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="profile-image-container">
        <img src="../assets/logo.png" alt="Foto de perfil" class="profile-image">
      </div>
      <h1>{{ username }}</h1>
      <p class="bio">Aquí irá la biografía del usuario.</p>
    </div>

    <div v-if="user" class="profile-details">
      <h3>Detalles del Perfil</h3>
      <ul>
        <li>Usuario: <span id="name">{{ user.username }}</span></li>
        <li>Email: <span id="email">{{ user.email }}</span></li>
        <li>Seguidores: <span id="followers">Cargando...</span></li>
        <li>Siguiendo: <span id="following">Cargando...</span></li>
      </ul>
    </div>
    <div v-else>
      <p>Cargando información del usuario...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const user = ref(null);

async function fetchUser(username){
  let token = localStorage.getItem('token');
  try {
    const response = await fetch(`${process.env.VUE_APP_API_URL}/api/users/${username}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data)
    user.value = data.user;
  } catch (err) {
    console.error('Error al cargar los usuarios:', err);
  }
}

onMounted(async () => {
  fetchUser(route.params.username);
});

watch(
  () => route.params.username, // Observa el cambio en el parámetro 'username'
  (newUsername) => {
    // Se ejecuta cuando el parámetro 'username' cambia
    fetchUser(newUsername);
  }
);

</script>

  
  <style scoped>
  .profile-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }
  
  .profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .profile-image-container {
    width: 150px;
    height: 150px;
    border-radius: 50%; /* Redondea la imagen */
    overflow: hidden; /* Asegura que la imagen no se salga del círculo */
    margin-bottom: 10px;
  }
  
  .profile-image {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Cubre el contenedor manteniendo la proporción */
  }
  
  .profile-header h1 {
    margin-top: 10px;
    font-size: 2em;
  }
  
  .bio {
    color: #555;
    text-align: center;
    margin-top: 5px;
  }
  
  .profile-details {
    background-color: #f9f9f9;
    border: 1px solid #eee;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 600px;
  }
  
  .profile-details h3 {
    font-size: 1.5em;
    margin-bottom: 15px;
  }
  
  .profile-details ul {
    list-style: none;
    padding: 0;
  }
  
  .profile-details li {
    margin-bottom: 10px;
    font-size: 1em;
  }
  
  .profile-details li span {
    font-weight: bold;
  }
  </style>