import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
      const isNeoTroy = storeName.toLowerCase().includes('neotroy');
      const isDaVinci = storeName.toLowerCase().includes('davinci') || storeName.toLowerCase().includes('kutu oyunları');

      console.log(`\n----------------------------------------`);
      console.log(`🎮 Ürün: ${gameTitle} | Mağaza: ${storeName}`);

      let targetProductUrl = item.product_url || '';
      const urlLower = targetProductUrl.toLowerCase();

      // Hatalı, sleeve, ek paket veya genel arama URL'lerini tespit edip sıfırla ve arama moduna geç
      const isBadUrl = !targetProductUrl.startsWith('http') || 
                       urlLower.includes('yamali-yorgan') || 
                       urlLower.includes('/search') || 
                       urlLower.includes('?s=') || 
                       urlLower.includes('arama') ||
                       urlLower.includes('sleeve') || 
                       urlLower.includes('kilif') || 
                       urlLower.includes('expansion') || 
                       urlLower.includes('ek-paketi') ||
                       urlLower.includes('koruyucu');

      if (isBadUrl) {
        console.log(`⚠️ Kayıtlı URL hatalı/aksesuar (${targetProductUrl}), arama sayfasına yönlendiriliyor...`);
        if (isNeoTroy) {
          targetProductUrl = `https://neotroygames.com/arama?q=${encodeURIComponent(gameTitle)}`;
        } else if (isGoblin) {
          targetProductUrl = `https://goblin-store.com/search?q=${encodeURIComponent(gameTitle)}`;
        } else {
          targetProductUrl = `https://kutuoyunual.com/search?q=${encodeURIComponent(gameTitle)}`;
        }
      }

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

      if (isGoblin) {
        try {
          await page.waitForSelector('span.text-3xl.font-bold.text-gray-900', { timeout: 7000 });
        } catch (e) {
          await page.waitForTimeout(4000);
        }
      } else {
        await page.waitForTimeout(2000);
      }

      // Eğer hala arama sayfasındaysak, doğru ana oyun linkini bul ve veritabanına zorla yaz
      if (page.url().includes('search') || page.url().includes('arama') || page.url().includes('?s=')) {
        console.log('🔍 Arama sonuçlarından doğru ana oyun filtreleniyor...');

        let foundLink = await page.evaluate(({ searchTitle }) => {
          const links = Array.from(document.querySelectorAll('a'));
          const cleanTitle = searchTitle ? searchTitle.toLowerCase().trim() : '';
          const slugPart = cleanTitle.replace(/[^a-z0-9]+/g, '-');

          const productLinks = links.filter(a => {
            const href = a.href ? a.href.toLowerCase() : '';
            if (href.includes('yamali-yorgan') || href.includes('/arama')) return false;
            return href.includes('/urun/') || href.includes('/products/') || href.includes('/kutu-oyunu/') || href.includes('/oyun/');
          });

          // Sleeve, eklenti ve aksesuarları ele
          const validLinks = productLinks.filter(link => {
            const href = link.href.toLowerCase();
            const text = link.innerText ? link.innerText.toLowerCase() : '';
            
            const isAccessory = href.includes('sleeve') || href.includes('kilif') || href.includes('koruyucu') || text.includes('sleeve') || text.includes('kılıf');
            const isExpansion = href.includes('expansion') || href.includes('ek-paketi') || href.includes('eklenti') || href.includes('promo');

            return !isAccessory && !isExpansion;
          });

          if (validLinks.length === 0) return productLinks.length > 0 ? productLinks[0].href : null;

          // Slug veya isim eşleşmesi arayan en iyi eşi bul
          let matched = validLinks.find(link => link.href.toLowerCase().includes(slugPart));
          return matched ? matched.href : validLinks[0].href;
        }, { searchTitle: gameTitle });

        if (foundLink) {
          targetProductUrl = foundLink;
          console.log(`✨ Doğru ana oyun URL'si yakalandı ve veritabanına işleniyor: ${targetProductUrl}`);
          
          await supabase
            .from('store_listings')
            .update({ product_url: targetProductUrl })
            .eq('id', item.id);

          await page.goto(targetProductUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        }
      }

      // Fiyat ve stok oku
      const productData = await page.evaluate((isGoblinStore) => {
        const bodyHtml = document.body.innerText.toLowerCase();
        const isOutOfStock = bodyHtml.includes('tükendi') || bodyHtml.includes('stokta yok') || bodyHtml.includes('out of stock');

        let priceText = '';

        if (!isOutOfStock) {
          if (isGoblinStore) {
            const goblinEl = document.querySelector('span.text-3xl.font-bold.text-gray-900, span.font-bold.text-gray-900, span.text-3xl');
            if (goblinEl && goblinEl.innerText) priceText = goblinEl.innerText.trim();
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
              if (el && el.innerText.trim().length > 0) {
                priceText = el.innerText;
                break;
              }
            }
          }

          if (!priceText) {
            const match = document.body.innerText.match(/([\d\.,]{2,}\s*(?:TL|₺))/i);
            if (match) priceText = match[1];
          }
        }

        return { priceText, inStock: !isOutOfStock };
      }, isGoblin);

      let cleanPrice = 0;
      let inStock = productData.inStock;

      if (productData.priceText && inStock) {
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

      // Kesin olarak veritabanına yaz
      await supabase
        .from('store_listings')
        .update({
          product_url: targetProductUrl,
          price: cleanPrice,
          in_stock: inStock,
          updated_at: new Date()
        })
        .eq('id', item.id);

    } catch (err) {
      console.error(`Hata (${item.product_url}):`, err.message);
    }
  }

  if (browser) await browser.close();
  console.log('\n✨ Tüm işlemler tamamlandı!');
}

updatePrices();