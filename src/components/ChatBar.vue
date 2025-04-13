<template>
  <div class="chat-container">
    <div class="user-count">Usuarios conectados: {{ userCount }}</div>
    <div class="message-area" ref="messageArea">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message"
        :class="{ 'my-message': message.senderId === socketId }"
      >
        <span class="sender">{{ message.username }}:</span>
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
</template>

<script>
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';

export default {
  name: 'ChatView',
  setup() {
    const messages = ref([]);
    const newMessage = ref('');
    const socket = ref(null);
    const socketId = ref('');
    const userCount = ref(0);
    const messageArea = ref(null); // Referencia al elemento message-area

    onMounted(() => {
      socket.value = io('http://localhost:3001/chat');

      socket.value.on('connect', () => {
        socketId.value = socket.value.id;
      });

      socket.value.on('disconnect', () => {
      });

      socket.value.on('chat message', (data) => {
        messages.value.push(data); 
        scrollToBottom();
      });

      socket.value.on('user count', (count) => {
        userCount.value = count;
      });

      // Asegura el scroll inicial al cargar los mensajes (si los hay)
      scrollToBottom();
    });

    const sendMessage = () => {
      if (newMessage.value.trim() !== '') {
        let message_info = {
          "message": newMessage.value,
          "username": localStorage.getItem('username'),
        }
        socket.value.emit('chat message', message_info);
        newMessage.value = ''; // Limpia el input después de enviar
        // El scroll se manejará en el evento 'chat message' para asegurar que
        // el mensaje enviado también provoque el scroll en todos los clientes.
      }
    };

    const scrollToBottom = () => {
      if (messageArea.value) {
        messageArea.value.scrollTop = messageArea.value.scrollHeight;
      }
    };


    return {
      messages,
      newMessage,
      sendMessage,
      userCount,
      socketId,
      messageArea, // Exponemos la referencia para poder usarla
    };
  },
};
</script>

<style scoped>
/* ... (tus estilos CSS existentes) ... */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px; /* Altura fija para el chat */
  background-color: #f8f9fa; /* Fondo claro */
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  box-sizing: border-box;
  padding: 1rem;
}

.user-count {
  padding: 0.5rem;
  background-color: #e9ecef;
  border-bottom: 1px solid #dee2e6;
  text-align: center;
  font-size: 0.9rem;
  color: #495057;
}

.message-area {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: #fff;
  border: 1px solid #ced4da;
  word-break: break-word;
  font-size: 0.9rem;
}

.my-message {
  background-color: #007bff;
  color: white;
  align-self: flex-end;
  border-color: #007bff;
}

.sender {
  font-weight: bold;
  margin-right: 0.5rem;
  color: #343a40;
}

.text {
  color: #212529;
}

.input-area {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.input-area input {
  flex-grow: 1;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.input-area button {
  padding: 0.75rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.input-area button:hover {
  background-color: #0056b3;
}
</style>