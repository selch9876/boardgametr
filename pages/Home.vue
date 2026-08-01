<!-- src/pages/Home.vue -->
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="home-page">
    <!-- HERO BÖLÜMÜ -->
    <section class="hero-section">
      <div class="hero-content">
        <span class="badge">Türkiye'nin Masa Oyunu Platformu</span>
        <h1>Masa Oyunu Tutkunlarının Buluşma Noktası</h1>
        <p>
          Koleksiyonunu genişlet, oynamadığın kutu oyunlarını diğer oyuncularla buluştur 
          veya binlerce oyunluk kapsamlı kataloğu keşfet.
        </p>
        <div class="hero-buttons">
          <button @click="router.push('/marketplace')" class="primary-btn">
            🛒 Pazar Yerini Keşfet
          </button>
          <button @click="router.push('/games')" class="secondary-btn">
            📚 Oyun Kataloğuna Göz At
          </button>
        </div>
      </div>
    </section>

    <!-- ÖZELLİKLER / KARTLAR BÖLÜMÜ -->
    <section class="features-section">
      <div class="feature-card" @click="router.push('/marketplace')">
        <div class="icon">🎲</div>
        <h3>İkinci El Pazar Yeri</h3>
        <p>Temiz kullanılmış kutu oyunlarını uygun fiyatlarla bul veya kendi oyunlarını güvenle satışa çıkar.</p>
        <span class="link-text">İlanlara Git →</span>
      </div>

      <div class="feature-card" @click="router.push('/games')">
        <div class="icon">📖</div>
        <h3>Geniş Oyun Kataloğu</h3>
        <p>Yüzlerce masa oyununun detaylarına, dil bağımlılıklarına ve kurallarına tek noktadan ulaş.</p>
        <span class="link-text">Kataloğu İncele →</span>
      </div>

      <div class="feature-card community-card">
        <div class="icon">🤝</div>
        <h3>Aktif Topluluk</h3>
        <p>Türkiye'deki oyuncu ağıyla tanış, koleksiyonunu paylaş ve masa oyunu kültürünü büyüt.</p>
        <span class="link-text">Çok Yakında...</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  padding: 2rem 0;
}

/* Hero Bölümü Stilleri */
.hero-section {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 4rem 2rem;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 3rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.badge {
  background-color: rgba(66, 185, 131, 0.2);
  color: #42b983;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin: 1.5rem 0 1rem 0;
  line-height: 1.2;
}

.hero-content p {
  font-size: 1.1rem;
  color: #bdc3c7;
  max-width: 600px;
  margin: 0 auto 2rem auto;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-btn, .secondary-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  border: none;
}

.primary-btn {
  background-color: #42b983;
  color: white;
}
.primary-btn:hover {
  background-color: #369c6d;
  transform: translateY(-2px);
}

.secondary-btn {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.secondary-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Özellik Kartları Grid */
.features-section {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .features-section {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #eaeaea;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  border-color: #42b983;
}

.feature-card .icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.feature-card p {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
  flex-grow: 1;
}

.link-text {
  font-weight: bold;
  color: #42b983;
  font-size: 0.9rem;
}

.community-card {
  cursor: default;
}
.community-card:hover {
  transform: none;
  border-color: #eaeaea;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}
.community-card .link-text {
  color: #95a5a6;
}
</style>