<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- Üst Menü / Navbar -->
    <header class="main-header">
      <router-link to="/" class="logo">BoardGameTürkiye</router-link>
      <nav class="nav-links">
        <router-link to="/">Ana Sayfa</router-link>
        <router-link to="/marketplace">Pazar Yeri</router-link>
        <router-link to="/games">Oyun Kataloğu</router-link>
      </nav>
    </header>

    <!-- Sayfaların Değiştiği Alan -->
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<style>
/* Genel Sıfırlama ve Fontlar */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  background-color: #f4f6f8;
  color: #2c3e50;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  text-decoration: none;
  color: #7f8c8d;
  font-weight: 600;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #42b983;
}
</style>