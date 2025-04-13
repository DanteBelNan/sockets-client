<template>
    <div class="not-found">
      <h1>404</h1>
      <p>Página no encontrada</p>
      <router-link to="/">Volver a la página principal</router-link>
    </div>
  </template>
  
  <style scoped>
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    font-family: sans-serif;
  }
  
  h1 {
    font-size: 4em;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 1.2em;
    margin-bottom: 20px;
  }
  </style>