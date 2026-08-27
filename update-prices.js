import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://egzfowxhslazwyclxopt.supabase.co' 
const SUPABASE_KEY = 'sb_publishable_8QGwpT9OXn0g2KDwpb_YOA_SW0cYHug'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function updatePrices() {
  console.log('🤖 Akıllı Fiyat ve Link Güncelleme Botu Başlatıldı...');

  const { data: storeListings, error } = await supabase
    .from('store_listings')
    .select(`
      id,
      product_url,
      game_id,
      store_id,
      stores ( name ),
      games ( title )
    `);

  if (error) {
    console.error('Kayıtlar çekilirken hata:', error.message);
    return;
  }

  let browser = null;
  let page = null;

  for (const item of storeListings) {
    try {
      const gameTitle = item.games?.title || '';
      const storeName = item.stores?.name || '';
      const isGoblin = storeName.toLowerCase().includes('goblin');

      console.log(`\n----------------------------------------`);
      console.log(`🎮 Ürün/Oyun: ${gameTitle} | Mağaza: ${storeName}`);

      if (!item.product_url || !item.product_url.startsWith('http')) {
        console.log(`Geçersiz veya boş URL atlandı.`);
        continue;
      }

      let targetProductUrl = item.product_url;
      let cleanPrice = 0;
      let inStock = true;

      if (!browser) {
        browser = await chromium.launch({ 
          headless: true,
          args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
        });
        const context = await browser.newContext({
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        });
        page = await context.newPage();
      }

      console.log(`Ziyaret ediliyor: ${targetProductUrl}`);
      await page.goto(targetProductUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Goblin için Livewire / Tailwind elementinin DOM'a oturmasını sağlayan net bekleme
      if (isGoblin) {
        console.log('🛡️ Goblin fiyat elemanı bekleniyor...');
        try {
          await page.waitForSelector('span.font-bold.text-gray-900', { timeout: 7000 });
        } catch (e) {
          await page.waitForTimeout(4000); // Ek güvenlik payı
        }
      } else {
        await page.waitForTimeout(2000);
      }

      if (
        !isGoblin && (
          targetProductUrl.includes('/search') || 
          targetProductUrl.includes('?s=') || 
          targetProductUrl.includes('arama') || 
          targetProductUrl.includes('product_cat') ||
          targetProductUrl.includes('yamali-yorgan') ||
          targetProductUrl.includes('codenames-pictures')
        )
      ) {
        console.log('🔍 Doğru ürün filtreleniyor...');

        let firstProductLink = null;
        try {
          firstProductLink = await page.evaluate((searchTitle) => {
            const allLinks = Array.from(document.querySelectorAll('a'));
            const cleanTitle = searchTitle ? searchTitle.toLowerCase().trim() : '';
            
            const productLinks = allLinks.filter(a => {
              const href = a.href ? a.href.toLowerCase() : '';
              return href.includes('/urun/') || href.includes('/products/') || href.includes('/kutu-oyunu/') || href.includes('/oyun/');
            });

            if (productLinks.length === 0) return null;
            if (!cleanTitle) return productLinks[0].href;

            const exactMatch = productLinks.find(linkEl => {
              const href = linkEl.href.toLowerCase();
              const text = linkEl.innerText ? linkEl.innerText.toLowerCase() : '';
              const slugPart = cleanTitle.replace(/[^a-z0-9]+/g, '-');
              const hasExactSlug = href.includes('/urun/' + slugPart + '/') || href.includes('/products/' + slugPart + '/');
              const hasExactText = text === cleanTitle || text.includes(cleanTitle);
              const isNotVariant = !href.includes('pictures') && !href.includes('duet') && !href.includes('undercover');
              return (hasExactSlug || hasExactText) && isNotVariant;
            });

            return exactMatch ? exactMatch.href : productLinks[0].href;
          }, gameTitle);
        } catch (err) {
          console.log('Ürün seçilirken hata:', err.message);
        }

        if (firstProductLink) {
          console.log(`✨ Doğru ürün eşleştirildi: ${firstProductLink}`);
          targetProductUrl = firstProductLink;
          await supabase.from('store_listings').update({ product_url: targetProductUrl }).eq('id', item.id);
          await page.goto(targetProductUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        }
      }

      console.log(`Fiyat okunuyor: ${targetProductUrl}`);

      const productData = await page.evaluate((isGoblinStore) => {
        let priceText = '';

        // EĞER GOBLİN İSE: Ekran görüntüsündeki nokta atışı Tailwind class seçicisi
        if (isGoblinStore) {
          const goblinEl = document.querySelector('span.text-3xl.font-bold.text-gray-900, span.font-bold.text-gray-900, span.text-3xl');
          if (goblinEl && goblinEl.innerText) {
            priceText = goblinEl.innerText.trim();
          }
        }

        if (!priceText) {
          const priceSelectors = [
            '.summary .price bdi', '.price bdi', '.summary .price .amount', 
            '.price .amount', 'p.price .amount', '.product-price .amount', 
            '.current-price', 'ins .amount', '#price', '.summary .price', 
            '.special-price', '.product__price', '.woocommerce-Price-amount',
            '.price', '.entry-summary .price', '.price-amount', '.price__current', '.money'
          ];

          for (const sel of priceSelectors) {
            const el = document.querySelector(sel);
            if (el && el.innerText && el.innerText.trim().length > 0) {
              priceText = el.innerText;
              break;
            }
          }
        }

        if (!priceText) {
          const bodyText = document.body.innerText;
          const match = bodyText.match(/([\d\.,]{2,}\s*(?:TL|₺|TL\.|₺))/i);
          if (match) priceText = match[1];
        }

        const bodyHtml = document.body.innerText.toLowerCase();
        const isOutOfStock = bodyHtml.includes('tükendi') || bodyHtml.includes('stokta yok') || bodyHtml.includes('out of stock');

        return { priceText, inStock: !isOutOfStock };
      }, isGoblin);

      inStock = productData.inStock;

      if (productData.priceText) {
        let text = productData.priceText.trim();
        if (text.includes('.') && text.includes(',')) {
          if (text.indexOf('.') < text.indexOf(',')) {
            text = text.replace(/\./g, '').replace(',', '.');
          } else {
            text = text.replace(/,/g, '');
          }
        } else if (text.includes('.')) {
          const parts = text.split('.');
          if (parts.length > 1 && parts[parts.length - 1].length === 3) {
            text = text.replace(/\./g, '');
          }
        } else if (text.includes(',')) {
          text = text.replace(',', '.');
        }

        let numericStr = text.replace(/[^\d.]/g, '');
        cleanPrice = parseFloat(numericStr) || 0;
      }

      console.log(`[Güncellendi] Fiyat: ${cleanPrice} TL | Stok: ${inStock ? 'Var' : 'Yok'}`);

      await supabase
        .from('store_listings')
        .update({
          price: cleanPrice,
          in_stock: inStock,
          updated_at: new Date()
        })
        .eq('id', item.id);

    } catch (err) {
      console.error(`Hata (${item.product_url}):`, err.message);
    }
  }

  if (browser) {
    await browser.close();
  }
  console.log('\n✨ Tüm fiyat ve link güncelleme işlemleri tamamlandı!');
}

updatePrices();