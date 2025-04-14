<template>
    <div class="private-chats-container">
      <h1>Chats Privados</h1>
      
      <!-- Lista de rooms existentes -->
      <div v-if="availableRooms.length > 0" class="rooms-list">
        <h2>Salas disponibles</h2>
        <div v-for="room in availableRooms" :key="room.id" class="room-item">
          <div class="room-info">
            <span class="room-name">{{ room.name || `Sala ${room.id}` }}</span>
            <span class="user-count">{{ room.userCount }} usuarios</span>
          </div>
          <div class="room-actions">
              <button @click="joinRoom(room.id)" class="join-btn">Unirse</button>
              <button @click="deleteRoom(room.id)" class="delete-btn">Eliminar</button>
          </div>
        </div>
      </div>
      
      <div v-else class="no-rooms">
        <p>No hay salas de chat disponibles en este momento.</p>
      </div>
      
      <!-- Botón para crear un nuevo room -->
      <div class="create-room-section">
        <input
          v-model="newRoomName"
          type="text"
          placeholder="Nombre de la sala (opcional)"
          class="room-name-input"
        />
        <button @click="createRoom" class="create-btn">Crear nueva sala</button>
      </div>
      
      <!-- Modal para el chat privado -->
      <PrivateChatModal
        v-if="showChatModal"
        :room-id="currentRoomId"
        :room-name="currentRoomName"
        @close="closeChatModal"
      />
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { io } from 'socket.io-client';
  import PrivateChatModal from '../components/PrivateChatModal.vue';
  
  export default {
    name: 'PrivateChats',
    components: {
      PrivateChatModal
    },
    setup() {
      const socket = ref(null);
      const availableRooms = ref([]);
      const newRoomName = ref('');
      const showChatModal = ref(false);
      const currentRoomId = ref('');
      const currentRoomName = ref('');
      
      // Conectarse al namespace de privateChat
      onMounted(() => {
        const token = localStorage.getItem('token')
        
        socket.value = io('http://localhost:3001/privateChat', {
          auth: {
            token: token
          }
        });

        socket.value.on("connect_error", (error) => {
          console.error("Error de conexión al socket; ", error.message)
          if (error.message.includes('Authentication error')) {
            alert('Sesión expirada. Por favor vuelve a iniciar sesión.');
          }
        })
        
        // Solicitar la lista de salas disponibles al conectarse
        socket.value.on('connect', () => {
          socket.value.emit('get rooms');
        });
        
        // Recibir la lista de salas disponibles
        socket.value.on('rooms list', (rooms) => {
          availableRooms.value = rooms;
        });
        
        // Actualización en tiempo real de la lista de salas
        socket.value.on('room created', (room) => {
          availableRooms.value.push(room);
        });
        
        // Actualización del conteo de usuarios en una sala
        socket.value.on('room users updated', (data) => {
          const roomIndex = availableRooms.value.findIndex(r => r.id === data.roomId);
          if (roomIndex !== -1) {
            console.log(availableRooms.value[roomIndex]);
            availableRooms.value[roomIndex].userCount = data.count;
          }
        });
      });
      
      // Limpiar conexión al desmontar el componente
      onUnmounted(() => {
        if (socket.value) {
          socket.value.disconnect();
        }
      });
      
      // Unirse a una sala existente
      const joinRoom = (roomId) => {
        const room = availableRooms.value.find(r => r.id === roomId);
        currentRoomId.value = roomId;
        currentRoomName.value = room?.name || `Sala ${roomId}`;
        showChatModal.value = true;
      };

      const deleteRoom = (roomId) => {
        if(confirm('¿Estás seguro de que deseas eliminar esta sala?')) {
          socket.value.emit('delete room', roomId);
          availableRooms.value = availableRooms.value.filter(room => room.id !== roomId);
        }
      }
      
      // Crear una nueva sala
      const createRoom = () => {
        // Generar un ID único para la sala
        const roomId = 'room_' + Date.now();
        const roomName = newRoomName.value.trim() || `Sala ${roomId}`;
        
        // Enviar solicitud para crear la sala
        socket.value.emit('create room', { id: roomId, name: roomName });
        
        // Limpiar el campo de nombre
        newRoomName.value = '';
        
        // Abrir automáticamente el chat de la sala creada
        currentRoomId.value = roomId;
        currentRoomName.value = roomName;
        showChatModal.value = true;
      };
      
      // Cerrar el modal de chat
      const closeChatModal = () => {
        showChatModal.value = false;
      };
      
      return {
        availableRooms,
        newRoomName,
        showChatModal,
        currentRoomId,
        currentRoomName,
        joinRoom,
        deleteRoom,
        createRoom,
        closeChatModal
      };
    }
  };
  </script>
  
  <style scoped>
  .private-chats-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
  }
  
  h2 {
    margin-bottom: 1rem;
    color: #555;
  }
  
  .rooms-list {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  
  .room-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
  }
  
  .room-item:last-child {
    border-bottom: none;
  }
  
  .room-info {
    display: flex;
    flex-direction: column;
  }
  
  .room-name {
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 0.3rem;
  }
  
  .user-count {
    font-size: 0.9rem;
    color: #6c757d;
  }

  .room-actions {
  display: flex;
  gap: 0.5rem;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #c82333;
}
  
  .join-btn {
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  
  .join-btn:hover {
    background-color: #0056b3;
  }
  
  .no-rooms {
    text-align: center;
    padding: 2rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 2rem;
    color: #6c757d;
  }
  
  .create-room-section {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  
  .room-name-input {
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .create-btn {
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.75rem;
    cursor: pointer;
    font-weight: bold;
  }
  
  .create-btn:hover {
    background-color: #218838;
  }
  
  @media (max-width: 768px) {
    .private-chats-container {
      padding: 1rem;
    }
    
    .create-room-section {
      flex-direction: column;
    }
  }
  </style>