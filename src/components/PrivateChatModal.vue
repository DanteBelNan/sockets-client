<template>
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ roomName }} </h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div v-if="sendMessageStatus" class="alert alert-info">
          {{ sendMessageStatus }}
        </div>
        <div class="chat-container">
          <div class="user-count">Usuarios en sala: {{ userCount }}</div>
          <div class="message-area" ref="messageArea">
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="message"
              :class="{ 'my-message': message.username === username }"
            >
              <span class="sender">{{ message.username || 'Usuario' }}:</span>
              <span class="text">{{ message.message }}</span>
            </div>
          </div>
          
          <div class="input-area">
            <input
              type="text"
              v-model="newMessage"
              placeholder="Escribe un mensaje..."
              @keyup.enter="sendMessage"
            />
            <button @click="sendMessage">Enviar</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { io } from 'socket.io-client';
  
  export default {
    name: 'PrivateChatModal',
    props: {
      roomId: {
        type: String,
        required: true
      },
      roomName: {
        type: String,
        default: 'Chat Privado'
      }
    },
    emits: ['close'],
    setup(props, { emit }) {
      const socket = ref(null);
      const socketId = ref('');
      const messages = ref([]);
      const newMessage = ref('');
      const userCount = ref(0);
      const messageArea = ref(null);
      const sendMessageStatus = ref('');
      const token = ref();
      const username = ref();
      
      // Conexión al socket y unirse a la sala
      onMounted(async () => {

        try{
            token.value = localStorage.getItem('token');
            username.value = localStorage.getItem('username');
            const response = await fetch(`${process.env.VUE_APP_API_URL}/api/messages/${props.roomId}`, {
                method: 'GET',
                headers: {
                'Authorization': `Bearer ${token.value}`,
                'Content-Type': 'application/json',
                }
            });
            if(response.ok){
                const data = await response.json();
                messages.value = data["messages"];
            }
          }catch(err){
            console.error('Error al enviar el mensaje:', err);
            sendMessageStatus.value = 'Error al enviar el mensaje';
          }
        socket.value = io('http://localhost:3001/privateChat');
        
        socket.value.on('connect', () => {
          socketId.value = socket.value.id;
          
          // Unirse a la sala especificada
          socket.value.emit('join room', props.roomId);
        });
        
        // Escuchar mensajes de la sala
        socket.value.on('chat message', (data) => {
          messages.value.push(data);
          scrollToBottom();
        });
        
        // Actualización del conteo de usuarios
        socket.value.on('room users updated', (data) => {
          if (data.roomId === props.roomId) {
            userCount.value = data.count;
          }
        });
        
        // Asegurarse de que el scroll está al final al montar
        scrollToBottom();
      });
      
      // Limpieza al desmontar el componente
      onUnmounted(() => {
        if (socket.value) {
          socket.value.disconnect();
        }
      });
      
      // Observar cambios en los mensajes para mantener el scroll abajo
      watch(messages, () => {
        scrollToBottom();
      });
      
      // Enviar un mensaje a la sala
      const sendMessage = async () => {
        if (newMessage.value.trim() !== '') {
            sendMessageStatus.value = '';
          const messageData = {
            roomId: props.roomId,
            message: newMessage.value,
            username: localStorage.getItem('username') || 'Usuario'
          };
          socket.value.emit('chat message', messageData);
          try{
            const response = await fetch(`${process.env.VUE_APP_API_URL}/api/messages`, {
                method: 'POST',
                headers: {
                'Authorization': `Bearer ${token.value}`,
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });
            if(response.ok){
                sendMessageStatus.value = 'Mensaje enviado correctamente';
            }
          }catch(err){
            console.error('Error al enviar el mensaje:', err);
            sendMessageStatus.value = 'Error al enviar el mensaje';
          }
          
          newMessage.value = '';
        }
      };
      
      // Mantener el scroll en la parte inferior
      const scrollToBottom = () => {
        if (messageArea.value) {
          setTimeout(() => {
            messageArea.value.scrollTop = messageArea.value.scrollHeight;
          }, 50);
        }
      };
      
      // Cerrar el modal
      const closeModal = () => {
        if (socket.value) {
          socket.value.emit('leave room', props.roomId);
          socket.value.disconnect();
        }
        emit('close');
      };
      
      return {
        socketId,
        messages,
        newMessage,
        userCount,
        messageArea,
        sendMessage,
        closeModal,
        scrollToBottom,
        username,
        token
      };
    }
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 700px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: #343a40;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
  }
  
  .close-btn:hover {
    color: #343a40;
  }
  
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 70vh;
    overflow: hidden;
  }
  
  .user-count {
    padding: 0.5rem;
    background-color: #e9ecef;
    text-align: center;
    font-size: 0.9rem;
    color: #495057;
  }
  
  .message-area {
    flex-grow: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .message {
    padding: 0.75rem;
    border-radius: 0.5rem;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    max-width: 80%;
    word-break: break-word;
  }
  
  .my-message {
    background-color: #007bff;
    color: white;
    align-self: flex-end;
    border-color: #007bff;
  }
  
  .my-message .sender {
    color: #e9ecef;
  }
  
  .sender {
    font-weight: bold;
    margin-right: 0.5rem;
  }
  
  .input-area {
    display: flex;
    padding: 1rem;
    gap: 0.5rem;
    border-top: 1px solid #dee2e6;
  }
  
  .input-area input {
    flex-grow: 1;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }
  
  .input-area button {
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .input-area button:hover {
    background-color: #0056b3;
  }
  
  @media (max-width: 768px) {
    .modal-content {
      width: 95%;
      height: 80vh;
    }
    
    .chat-container {
      height: calc(80vh - 60px);
    }
  }
  </style>