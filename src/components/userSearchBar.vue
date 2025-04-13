<template>
    <div class="search-container">
      <input
        type="text"
        v-model="searchText"
        @input="handleInput"
        placeholder="Buscar usuarios..."
        class="search-input"
      />
      Agregar limite de 5 desde front y back!
      <div v-if="searchResults.length > 0" class="search-results">
        <ul class="results-list">
          <li
            v-for="user in searchResults"
            :key="user._id"
            @click="selectUser(user)"
            class="result-item"
          >
            {{ user.username }} ({{ user.email }})
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  
  const props = defineProps({
    roomId: {
      type: String,
      required: true
    },
    roomName: {
      type: String,
      default: 'Chat Privado'
    }
  });
  
  const emit = defineEmits(['close']);
  
  const token = ref('');
  const searchText = ref('');
  const searchResults = ref([]);
  const debounceTimeout = ref(null);
  const router = useRouter();
  
  onMounted(() => {
    token.value = localStorage.getItem('token');
  });
  
  async function handleInput() {
    clearTimeout(debounceTimeout.value);
    debounceTimeout.value = setTimeout(async () => {
      if (searchText.value.trim() === '') {
        searchResults.value = [];
        return;
      }
      try {
        const response = await fetch(`${process.env.VUE_APP_API_URL}/api/users/search/${searchText.value}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          searchResults.value = data["users"];
    
        } else {
          console.error('Error en la respuesta de la API:', response.status, response.statusText);
          searchResults.value = [];
        }
      } catch (err) {
        console.error('Error al buscar usuarios:', err);
        searchResults.value = [];
      }
    }, 300);
  }
  
  function selectUser(user) {
    // Aquí puedes implementar la lógica para cuando se selecciona un usuario
    router.push('/profiles/' + user.username);
  }
  </script>

  
  <style scoped>
  .search-container {
    position: relative;
    width: 300px; /* Ajusta el ancho según tus necesidades */
  }
  
  .search-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }
  
  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    border: 1px solid #ccc;
    border-top: none;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
  
  .results-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .result-item {
    padding: 10px;
    cursor: pointer;
  }
  
  .result-item:hover {
    background-color: #f0f0f0;
  }
  </style>