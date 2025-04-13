<template>
    <div>
      <h1>Registrarse</h1>
      <form @submit.prevent="handleSubmit">
        <div>
          <label for="username">Usuario:</label>
          <input type="text" id="username" v-model="username">
        </div>
        <div>
          <label for="username">Email:</label>
          <input type="text" id="email" v-model="email">
        </div>
        <div>
          <label for="password">Contraseña:</label>
          <input type="password" id="password" v-model="password">
        </div>
        <button type="submit">Registrarse</button>
        <p v-if="error" class="error-message">{{ error }}</p>
        
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'RegisterView',
    data() {
      return {
        username: '',
        email: '',
        password: '',
        error: null,
      };
    },
    computed: {
    },
    methods: {
      async handleSubmit() {
        this.error = null;
  
        try {
          const response = await fetch(`${process.env.VUE_APP_API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: this.username,
              email: this.email,
              password: this.password,
            }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || 'Error al registrarse');
          }
  
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.user.username);
          this.$router.push('/home'); 
        } catch (err) {
          this.error = err.message;
          throw err;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  h1 {
    color: #333;
    margin-bottom: 1.5rem;
  }
  
  form {
    display: flex;
    flex-direction: column;
    max-width: 300px;
    margin: 0 auto;
  }
  
  div {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  input[type="text"],
  input[type="password"] {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  button[type="submit"] {
    background-color: #007bff;
    color: white;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  button[type="submit"]:hover {
    background-color: #0056b3;
  }
  
  .error-message {
    color: red;
    margin-top: 0.5rem;
  }
  </style>