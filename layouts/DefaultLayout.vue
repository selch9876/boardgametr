<!-- src/layouts/DefaultLayout.vue -->
<script setup>
// Layout'un kendine has bir mantığı varsa buraya yazılır. Şimdilik boş.
</script>

<template>
  <div class="layout-wrapper">
    <!-- Sabit Header -->
    <header class="header">
      <div class="container nav-container">
        <h1 class="logo">BoardGameTR</h1>
        <nav class="navigation">
          <!-- a etiketi yerine router-link kullanıyoruz ki sayfa yenilenmesin -->
          <router-link to="/">Ana Sayfa</router-link>
          <router-link to="/pazar">İkinci El Pazar</router-link>
        </nav>
      </div>
    </header>

    <!-- Dinamik Sayfa İçeriği -->
    <main class="main-content container">
      <!-- "slot", sayfaların içeriğinin yerleştirileceği boşluktur -->
      <slot />
    </main>

    <!-- Sabit Footer -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2026 BoardGameTR - Türkiye Masa Oyunu Topluluğu</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Basit iskelet stilleri - İleride Tailwind veya global CSS ile ezilebilir */
.layout-wrapper { display: flex; flex-direction: column; min-height: 100vh; font-family: sans-serif; }
.header { background-color: #2c3e50; color: white; padding: 1rem 0; }
.nav-container { display: flex; justify-content: space-between; align-items: center; }
.navigation { display: flex; gap: 1.5rem; }
.navigation a { color: white; text-decoration: none; font-weight: bold; }
.navigation a:hover { color: #42b983; }
.main-content { flex: 1; padding: 2rem 0; }
.footer { background-color: #f8f9fa; text-align: center; padding: 1.5rem; border-top: 1px solid #ddd; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
</style>