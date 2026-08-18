<!-- src/pages/Home.vue -->
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="home-page">
    <!-- HERO BÖLÜMÜ (Canlı Renkler ve Şeffaf Silik Arka Plan Dokusu) -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <span class="badge">🎲 TÜRKİYE'NİN KUTU OYUN BULUŞMA NOKTASI</span>
        <h1>Masaya Oturmaya Hazır Mısın?</h1>
        <p>
          Koleksiyonunu genişlet, oynamadığın strateji oyunlarını diğer maceracılarla buluştur 
          veya yüzlerce oyunluk dev kataloğu keşfet.
        </p>
        <div class="hero-buttons">
          <button @click="router.push('/marketplace')" class="primary-btn">
            🛒 Pazar Yerine Göz At
          </button>
          <button @click="router.push('/games')" class="secondary-btn">
            📚 Oyun Kataloğu
          </button>
        </div>
      </div>
    </section>

    <!-- ÖZELLİKLER / KARTLAR BÖLÜMÜ -->
    <section class="features-section">
      <div class="feature-card" @click="router.push('/marketplace')">
        <div class="card-image-bg market-bg"></div>
        <div class="card-content">
          <div class="icon market-icon">📦</div>
          <h3>İkinci El Pazar Yeri</h3>
          <p>Temiz kullanılmış kutu oyunlarını uygun fiyatlarla bul, yeni oyunlara yer aç.</p>
          <span class="link-text">İlanları İncele →</span>
        </div>
      </div>

      <div class="feature-card" @click="router.push('/games')">
        <div class="card-image-bg catalog-bg"></div>
        <div class="card-content">
          <div class="icon catalog-icon">🗺️</div>
          <h3>Dev Oyun Veritabanı</h3>
          <p>Oyunların dil bağımlılıklarını, türlerini ve detaylı kurallarını tek yerde gör.</p>
          <span class="link-text">Kataloğa Git →</span>
        </div>
      </div>

      <div class="feature-card community-card">
        <div class="card-image-bg community-bg"></div>
        <div class="card-content">
          <div class="icon community-icon">☕</div>
          <h3>Masa Başı Sohbetleri</h3>
          <p>Türkiye'deki oyuncu ağıyla tanış, en iyi stratejileri ve masa buluşmalarını kaçırma.</p>
          <span class="link-text coming-soon">Çok Yakında...</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  padding: 1rem 0 3rem 0;
}

/* HERO BÖLÜMÜ - Canlı Renk Geçişleri ve Renkli Masa Oyunu Dokusu */
.hero-section {
  position: relative;
  /* Arka planda rengarenk zarlar ve oyun bileşenlerinin olduğu dinamik bir görsel */
  background: url('https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat;
  color: white;
  padding: 5.5rem 2rem;
  border-radius: 20px;
  text-align: center;
  margin-bottom: 3rem;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(66, 185, 131, 0.15);
}

/* Üzerine turuncu, mor ve yeşil tonlarında canlı, yarı saydam renkli bir gradyan katman ekliyoruz */
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.78) 50%, rgba(66, 185, 131, 0.35) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
  margin: 0 auto;
}

.badge {
  background-color: rgba(66, 185, 131, 0.3);
  color: #51e8a2;
  padding: 0.5rem 1.2rem;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  border: 1px solid rgba(66, 185, 131, 0.5);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.hero-content h1 {
  font-size: 3.2rem;
  margin: 1.5rem 0 1rem 0;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.hero-content p {
  font-size: 1.2rem;
  color: #e2e8f0;
  margin: 0 auto 2.5rem auto;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-btn, .secondary-btn {
  padding: 0.95rem 2rem;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  border: none;
}

.primary-btn {
  background-color: #42b983;
  color: white;
  box-shadow: 0 4px 20px rgba(66, 185, 131, 0.5);
}
.primary-btn:hover {
  background-color: #369c6d;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(66, 185, 131, 0.7);
}

.secondary-btn {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(8px);
}
.secondary-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
}

/* ÖZELLİK KARTLARI */
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
  position: relative;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 15px rgba(0,0,0,0.04);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  display: flex;
  flex-direction: column;
  min-height: 290px;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 35px rgba(66, 185, 131, 0.12);
  border-color: #42b983;
}

/* Kartların üst kısmındaki silik renkli arka plan görselleri */
.card-image-bg {
  height: 100px;
  width: 100%;
  opacity: 0.2;
  transition: opacity 0.3s, transform 0.3s;
}
.feature-card:hover .card-image-bg {
  opacity: 0.35;
  transform: scale(1.05);
}

.market-bg { background: url('https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80') center/cover; }
.catalog-bg { background: url('https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80') center/cover; }
.community-bg { background: url('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80') center/cover; }

.card-content {
  padding: 1.5rem 2rem 2rem 2rem;
  margin-top: -35px;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.feature-card .icon {
  font-size: 2.2rem;
  margin-bottom: 0.85rem;
  background: white;
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.08);
  border: 1px solid #f1f5f9;
}

.feature-card h3 {
  margin: 0 0 0.5rem 0;
  color: #0f172a;
  font-size: 1.3rem;
  font-weight: 700;
}

.feature-card p {
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.55;
  margin: 0 0 1.5rem 0;
  flex-grow: 1;
}

.link-text {
  font-weight: 700;
  color: #42b983;
  font-size: 0.92rem;
}

.community-card {
  cursor: default;
}
.community-card:hover {
  transform: none;
  border-color: #e2e8f0;
  box-shadow: 0 6px 15px rgba(0,0,0,0.04);
}
.coming-soon {
  color: #94a3b8;
}

/* --- MOBİL UYUMLU HERO DÜZENLEMELERİ --- */
@media (max-width: 600px) {
  .hero-section {
    padding: 3rem 1.5rem; /* Mobilde kenar boşluklarını daralt */
  }

  .badge {
    font-size: 0.75rem; /* Fontu küçült */
    padding: 0.4rem 0.8rem;
    white-space: normal; /* Metnin alt satıra geçmesine izin ver */
    display: inline-block; /* Taşmayı önlemek için */
    line-height: 1.2;
    margin-bottom: 1rem;
  }

  .hero-content h1 {
    font-size: 2.2rem; /* Başlığı mobilde küçült */
    margin: 0.5rem 0;
  }

  .hero-content p {
    font-size: 1rem; /* Metni mobilde küçült */
    margin-bottom: 1.5rem;
  }

  .hero-buttons {
    flex-direction: column; /* Butonları alt alta al */
    gap: 0.8rem;
  }
  
  .primary-btn, .secondary-btn {
    width: 100%; /* Butonları tam genişlik yap */
  }
}
</style>