// generate-descriptions.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://egzfowxhslazwyclxopt.supabase.co' 
const SUPABASE_KEY = 'sb_publishable_8QGwpT9OXn0g2KDwpb_YOA_SW0cYHug'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Yeni Nesil FİNAL: Jenerik Metinlerden Kurtarılan 121 - 150. Oyunlar
const targetDescriptions = {
  "Wayfarers of the South Tigris": `Wayfarers of the South Tigris, Abbasi Halifeliği döneminde Bağdat'tan yola çıkarak haritayı keşfettiğiniz, yıldızları gözlemleyip ticaret rotaları kurduğunuz muazzam bir zar ve işçi yerleştirme oyunudur. Zarlarınızı işçilerinizin yetenekleriyle birleştirerek devasa bir tablo kurar ve gökyüzü haritasında yıldız haritalarını tamamlayarak prestij kazanırsınız.\n\nGarphill Games'in imza attığı en zihin yakıcı zar optimizasyonu mekaniğine sahip bu oyun, açık dünya keşfi hissini euro mekanikleriyle buluşturan olağanüstü bir başyapıttır.`,

  "Brass: Lancashire": `Brass: Lancashire, Martin Wallace'ın efsanevi sanayi devrimi oyununun köklerine sadık kalan, İngiltere'de pamuk fabrikaları ve kömür madenleri kurarak kanal ve demiryolu ağlarıyla devasa bir ekonomi ördüğünüz acımasız bir ekonomik şaheserdir. Rakiplerinizin inşa ettiği kömür madenlerini veya limanları kullanmak onlara puan kazandırsa da sizin de ilerlemeniz için zorunludur; bu yüzden masada muazzam bir parazit ve simbiyotik ekonomik ağ oluşur.\n\nKurallarının keskinliği, sıfır şans faktörü ve iki farklı çağda oynanan ekonomik yıkım hissiyle euro oyun dünyasının mutlak zirvesidir.`,

  "Radlands": `Radlands, suyun her şeyden değerli olduğu, kıyamet sonrası neon-punk bir evrende geçen, iki kişiye özel inanılmaz gergin ve şık bir kart düellosudur. Kısıtlı su kaynaklarınızı kullanarak rakiplerinizin hayatta kalma kamplarını yok etmeye çalışırken, elinizdeki karakterleri feda ederek anlık taktiksel üstünlükler elde etmek hayati önem taşır.\n\nKurallarının basitliğine rağmen devasa bir taktiksel derinlik sunan, sanat tasarımıyla büyüleyen ve masada "Bir el daha!" dedirten kusursuz bir kedi-fare savaşıdır.`,

  "Clank!: A Deck-Building Adventure": `Clank!: A Deck-Building Adventure, destenizi güçlendirerek devasa bir zindanın derinliklerine sızdığınız ve öfkeli ejderhanın hazinelerini çalarak kaçmaya çalıştığınız inanılmaz eğlenceli bir tahta oyunudur. Zindanda koşarken çıkardığınız sesler torbaya atılır ve ejderha uyandığında torbadan sizin renginiz çıkarsa hasar alırsınız; bu da masada devasa bir risk yönetimi ve kahkaha tufanı yaratır.\n\nArkadaşlarınız çıkışa yaklaşıp sizi zindanda ejderhayla baş başa bıraktığında yaşadığınız o panik hissi, oyunun en unutulmaz tatlarından biridir.`,

  "7 Wonders (Second Edition)": `7 Wonders (Second Edition), antik dünyanın yedi harikasından birini yöneterek bilim, askeri, sivil ve ticari alanlarda geliştiğiniz, eşzamanlı kart draft mekaniğinin tartışmasız en popüler ve klasik halidir. Herkesin aynı anda kart seçip aynı anda oynaması sayesinde oyun ister 3 kişiyle ister 7 kişiyle oynansın daima aynı hızda biter ve kimsenin sırasında sıkılmasına izin vermez.\n\nGörsel olarak yenilenmiş bu ikinci edisyon, modern kutu oyunlarına giriş yapan herkesin oynaması gereken mutlak bir strateji yapıtaşıdır.`,

  "Sekigahara: The Unification of Japan": `Sekigahara: The Unification of Japan, 1600 yılında Japonya'yı birleştiren o devasa tarihi savaşı, Tokugawa ve Ishida klanları olarak zarsız bir blok savaş sistemiyle masaya taşıyan epik bir iki kişilik wargame'dir. Haritadaki bloklarınız ordularınızı temsil eder ancak savaşa girebilmeleri için elinizde o klanın sancağına uygun kartların olması zorunludur; bu yüzden ordunuz büyük görünse de komutanların sadakati olmadan askerler kılıçlarını çekmezler.\n\nGizli bilgi, blöf ve ihanetlerin savaş alanını belirlediği, tarihi gerçeklikle harmanlanmış şahane bir satranç müsabakasıdır.`,

  "Aeon's End: The New Age": `Aeon's End: The New Age, klasik Aeon's End mekaniklerini alıp üzerine harika bir kısa kampanya modu ekleyen kooperatif bir deste kurma şaheseridir. Gravehold savunucuları olarak baş kötülere karşı savaşırken, her oyun sonrası kazandığınız yeni büyüler, kalıntılar ve hazinelerle destenizi bir sonraki savaş için kalıcı olarak kişiselleştirirsiniz.\n\nKullanılan destenin asla karıştırılmaması mekaniğinin getirdiği o beyin yakan stratejik derinlik, bu kutuyla birlikte çok daha tatmin edici bir hikaye örgüsüne kavuşur.`,

  "Istanbul": `Istanbul, Kapalıçarşı'nın dar sokaklarında bir tüccar ve onun çıraklarını yöneterek pazar arabalarınızı yakutlarla doldurmaya çalıştığınız son derece akıcı ve zarif bir işçi rotası oyunudur. Tüccarınız bir dükkana girdiğinde eylem yapabilmesi için arkasında bir çırak bırakmak zorundadır; çıraklarınız bittiğinde onları toplamak için paşa paşa başladığınız yere geri dönmeniz veya onları yollardan toplamanız gerekir.\n\nHarika tasarlanmış dükkan karolarının modüler yapısı ve rakiplerinizden önce kısıtlı yakutları kapma yarışı, oyunu eğlenceli ve yüksek tempolu bir yarışa çevirir.`,

  "Altiplano": `Altiplano, And Dağları'nın yüksek yaylalarında, lama yetiştirdiğiniz, kakao ektiğiniz ve kumaş dokuduğunuz muazzam bir çanta çekme ve kaynak yönetimi oyunudur. Torbanızdan çektiğiniz kaynak pullarını oyuncu tahtanıza programlayarak üretim yapar, ardından haritada ilgili konumlara seyahat ederek ürünlerinizi daha değerli mallara dönüştürürsünüz.\n\nOrleans'ın o başarılı torba mekaniğini alıp hareket zorunluluğu ve harita yönetimiyle birleştirerek, euro oyuncuları için hata affetmeyen, uzun vadeli bir planlama şöleni sunar.`,

  "Daybreak": `Daybreak, Pandemic'in yaratıcısı Matt Leacock'tan, dünyanın en büyük küresel krizini durdurmaya çalıştığınız son derece yenilikçi ve tematik bir kooperatif strateji oyunudur. Dünya güçlerini yöneterek karbon emisyonlarını sıfırlamak için elinizdeki projelerle temiz enerji ağları kurar, ağaç diker ve yükselen sıcaklıkların yarattığı küresel felaketlere karşı omuz omuza savaşırsınız.\n\nMotor kurma mekaniğini dünyayı kurtarmak gibi devasa ve güncel bir temayla birleştiren, masada derin bir işbirliği hissi yaratan muazzam bir tasarımdır.`,

  "Santorini": `Santorini, Yunan adasının mavi çatılı beyaz evlerini 3D bloklarla inşa ettiğiniz, kuralları sadece 30 saniyede öğrenilen ama satranç kadar derin olan efsanevi bir soyut strateji oyunudur. Her oyuncu sırayla işçisini bir adım hareket ettirir ve yanındaki kareye bir bina katı inşa eder; amaç işçinizi üçüncü kata çıkaran ilk oyuncu olmaktır.\n\nKutuya eklenen Antik Yunan tanrı kartlarının asimetrik özel güçleri, bu basit bulmacayı binlerce farklı ihtimali olan devasa bir zeka savaşına dönüştürür.`,

  "Arkham Horror (Third Edition)": `Arkham Horror (Third Edition), Lovecraftian korku türünün efsanevi kutu oyununu daha derli toplu, hikaye odaklı ve senaryo tabanlı bir sistemle yenileyen harika bir kooperatif deneyimdir. Modüler altıgen sokaklarda koşturan araştırmacılar olarak, şehrin üzerine çöken kadim kötülükleri durdurmak için delil toplar ve oyunun dinamik olarak dallanıp budaklanan karanlık hikayesini ortaya çıkarırsınız.\n\nOlay kartlarının getirdiği o meşhur çaresizlik hissini ve zar patlamalarının stresini, çok daha akıcı ve sinematik bir kurguyla masaya taşır.`,

  "Hitster": `Hitster, masaya telefonunuzu ve Spotify uygulamasını koyarak, çalan şarkının hangi yıl çıktığını elinizdeki tarih çizgisine doğru sırayla yerleştirmeye çalıştığınız inanılmaz eğlenceli bir müzik ve parti oyunudur. Kartın üzerindeki QR kodu okuttuğunuz anda çalan o ikonik şarkı, masadaki herkesi dans ettirip nostalji yolculuğuna çıkarırken; sadece müzik bilgisini değil, rakibin yanlış tahminini yakalama yeteneğini de ödüllendirir.\n\nArkadaş grupları için buzları anında eriten, müziğin birleştirici gücünü kullanan ve oyun oynarken bir yandan harika bir çalma listesi sunan modern bir hit garantisidir.`,

  "The Lord of the Rings: Journeys in Middle-Earth": `The Lord of the Rings: Journeys in Middle-Earth, Orta Dünya'da kampanya bazlı devasa maceralara atıldığınız, dijital uygulama destekli harika bir kooperatif keşif oyunudur. Zar yerine kendi kurduğunuz karakter destelerinden kart çekerek savaşır ve beceri testlerini geçerken, uygulama sizin için düşmanların hareketlerini yönetir ve dallanıp budaklanan epik bir hikaye anlatır.\n\nModüler haritada gizli sislerin açılması ve karakterlerin yetenek ağaçlarının gelişmesi, Yüzüklerin Efendisi hayranlarına kutu oyununda yaşayabilecekleri en iyi RPG deneyimlerinden birini sunar.`,

  "Shogun": `Shogun, 16. yüzyıl Feodal Japonya'sında ordularınızı eyaletlere yayarak savaş ağası olmaya çalıştığınız, efsanevi Küp Kulesi mekaniğiyle tanınan bir klasik strateji oyunudur. Bir bölgede savaş çıktığında, her iki tarafın asker küpleri devasa karton kulenin içine atılır ve kulenin içindeki tuzaklara takılanlarla birlikte şans eseri alttan düşen küpler savaşın galibini belirler.\n\nGizli eylem programlaması, vergi ve pirinç isyanı yönetimiyle birleşen bu kule mekaniği, masada hem devasa bir strateji hem de kahkaha dolu bir belirsizlik yaratır.`,

  "Quacks": `Quacks, Quedlinburg kasabasının yıllık panayırında dolandırıcı şifacılar olarak sihirli iksirler kaynattığınız, Şansını zorla ve torba oluşturma mekaniklerinin en komik ve popüler halidir. Torbanızdan çektiğiniz malzeme fişlerini kazana yerleştirip puan toplarken, kazana çok fazla patlayıcı malzeme eklerseniz kazanınız gümleyerek yüzünüze patlar ve puan veya para kaybetmenize sebep olur.\n\nKendi şansınızı torbanıza eklediğiniz yeni malzemelerle modifiye ettiğiniz, herkesin kendi kazanına bakarak çığlıklar attığı inanılmaz keyifli bir parti/strateji oyunudur.`,

  "Forbidden Stars": `Forbidden Stars, Warhammer 40K evreninde geçen, Uzay Denizcileri, Orklar, Kaos ve Eldar ırklarının galaktik sektörleri ele geçirmek için kapıştığı, masaüstü oyun tarihinin en saygın asimetrik savaş oyunlarından biridir. Oyuncuların haritaya sırayla gizli emir jetonları yerleştirip bunları üst üste dizmesi ve ardından bu yığını yukarıdan aşağıya çözmesi, inanılmaz derecede stratejik bir blöf ve satranç derinliği sunar.\n\nZarların ve özel geliştirilmiş savaş kartlarının kullanıldığı o epik savaş motoru, oyunun bitmek bilmeyen gerilimiyle savaş tutkunlarının arayıp da bulamadığı kutsal kasedir.`,

  "Agricola: All Creatures Big and Small": `Agricola: All Creatures Big and Small, orijinal Agricola'nın devasa baskısını alıp, tarlaları ve aile besleme derdini tamamen bir kenara bırakarak sadece iki kişilik sevimli bir hayvan yetiştirme düellosuna dönüştürür. Çitler çekerek koyun, domuz, inek ve atlar için çiftliğinizde barınaklar oluşturur; sınırlı sayıdaki işçilerinizi rakipten önce ahşap hayvanları toplamak veya çiftliği genişletmek için kullanırsınız.\n\nKısıtlı hamle alanlarıyla iki kişilik inanılmaz sıkı bir zeka mücadelesi sunarken, ahşap animeeple'ların verdiği o dokunsal sevimlilikle kalpleri fetheder.`,

  "Saint Petersburg": `Saint Petersburg, Çar Büyük Petro döneminde aristokratlar, işçiler ve görkemli binalar satın alarak ekonominizi inşa ettiğiniz, 2004 yapımı bir kart ve motor kurma klasiğidir. Oyuncuların ellerindeki kısıtlı rubleleri kullanarak pazar alanından önce işçi alıp gelir sağlaması, sonra o gelirle bina inşa etmesi ve en sonunda soyluları saraya katarak devasa zafer puanları toplaması gerekir.\n\nMatematiksel dengesi, acımasız para kıtlığı ve hızlı akışıyla modern euro oyunlarının atalarından biri olarak kabul edilen, zihni harika şekilde eğiten bir başyapıttır.`,

  "Pandemic Legacy: Season 0": `Pandemic Legacy: Season 0, Pandemic serisinin destansı hikayesini 1962 yılına, Soğuk Savaş'ın kalbine taşıyan; hastalık yerine Sovyet Ajanlarını ve nükleer biyolojik tehditleri durdurmaya çalıştığınız harika bir casusluk macerasıdır. Sahte kimliklerle dünyayı dolaşan CIA ajanları olduğunuz bu oyunda, minibüslerle gizli takip yapar, KGB sızmalarını önler ve hikaye boyunca oyunun kalıcı kurallarını zarflardan çıkan etiketlerle değiştirirsiniz.\n\nSerinin önceki sezonlarını bile gölgede bırakan o zekice kurgulanmış casusluk mekanikleri ve sürükleyici hikayesiyle, tam anlamıyla bir Soğuk Savaş gerilim romanıdır.`,

  "Le Havre": `Le Havre, Uwe Rosenberg'in Agricola'dan sonra tasarladığı, Fransa'nın ünlü liman kentinde gemilerle hammadde topladığınız, işlediğiniz ve devasa binalar satın aldığınız ağır bir liman yönetimi oyunudur. Oyuncuların tahtada tek bir eylem pulunu hareket ettirerek binaları kullandığı bu sistemde, asıl kriz tur sonlarında gemilere işçilerinizi bindirip balık ve ekmekle beslemek zorunda oluşunuzdan doğar.\n\nMalları dönüştürerek yaratılan o muazzam üretim zinciri, ekonomi severlerin beyninde havai fişekler patlatan kusursuz bir klasiktir.`,

  "Carpe Diem": `Carpe Diem, Stefan Feld'in antik Roma'da patrisyenleri yöneterek kendi semtlerinizi inşa ettiğiniz, kare şeklindeki karolarla devasa bir mozaik bulmacası çözdüğünüz zarif bir oyunudur. Oyuncular yıldız şeklindeki ortak tahta üzerinde meeple'larını hareket ettirerek karolar alır ve bu karoları kendi tahtalarındaki çitlerle kapatıp binaları tamamladıkça anında bonuslar kazanırlar.\n\nOyun sonu puanlama kartlarının rakipler tarafından kapılması stresi ve karoların geometrik uyumuyla, dışarıdan sade görünen ama içi Feld zekasıyla kaynayan bir stratejidir.`,

  "Sherlock Holmes Consulting Detective: The Thames Murders & Other Cases": `Sherlock Holmes Consulting Detective: The Thames Murders & Other Cases, 1880'lerin sisli Londra'sına gidip, devasa Londra haritası, şehir rehberi ve gazetelerle cinayet vakalarını çözmeye çalıştığınız hikaye bazlı bir efsanedir. Zar, kart veya oyun tahtası yoktur; sadece kitabın ilgili paragrafını okur, ipuçlarını takip ederek şehrin hangi adresine gidip kiminle konuşacağınıza karar verirsiniz.\n\nMasa başında not defterleriyle kafa kafaya verip beyin fırtınası yapmanın ve edebi bir polisiye romanın başrolünde olmanın verdiği o eşsiz ve saf zihinsel tatmini sunar.`,

  "Pandemic Legacy: Season 2": `Pandemic Legacy: Season 2, ilk sezonun bıraktığı yıkımdan onlarca yıl sonra, dünyanın karanlığa ve salgınlara gömüldüğü bir gelecekte denizin ortasındaki sığınaklardan çıkarak insanlığa aşı taşıdığınız devrim niteliğinde bir devam oyunudur. Bu kez hastalık temizlemek yerine, enfeksiyonun patlamasını engellemek için şehirlere tedarik küpleri yerleştirmeniz gerekir; haritanın çoğu karartılmıştır ve siz keşifler yaptıkça oyun tahtası etiketlerle büyür.\n\nBilinmezlik korkusu, hayatta kalma mekanikleri ve haritayı sıfırdan kazıma hissiyle kooperatif legacy türüne tamamen yenilikçi bir yorum getirir.`,

  "Forest Shuffle": `Forest Shuffle, Avrupa ormanlarında en uyumlu ekosistemi yaratmak için ağaç kartlarının çevresine böcek, kuş, memeli ve mantar kartları sıkıştırarak oynadığınız, inanılmaz derecede bağımlılık yapan bir kart oyunudur. Elinizden bir kartı ormanınıza oynarken maliyetini ödemek için diğer kartları ortak boşluk alanına atmanız gerekir, bu da rakiplerinize harika fırsatlar sunmanız anlamına gelir.\n\nKart komboları aramanın yarattığı o zihinsel coşku ve doğa temasına olan mükemmel sadakatiyle, masa oyunları dünyasının en hızlı parlayan strateji hitlerinden biridir.`,

  "The Lord of the Rings: Duel for Middle-earth": `The Lord of the Rings: Duel for Middle-earth, efsanevi 7 Wonders Duel mekaniklerini alıp Orta Dünya'nın Yüzük Kardeşliği ve Sauron güçleri arasındaki savaşa uyarlayan, kusursuz dengelenmiş bir iki kişilik strateji başyapıtıdır. Haritada güç mücadelesi vermek, Yüzük taşıyıcısının Mordor'a ilerleyişini kontrol etmek veya altı farklı ırkın desteğini toplayarak diplomatik zafer kazanmak için masadaki o piramit şeklindeki kart diziliminden dikkatlice kart seçersiniz.\n\n"Bir kart alırsam altındaki kart açılıp rakibe yarayacak" şeklindeki o meşhur stresli ikilemini fantastik Orta Dünya savaşlarıyla mükemmel harmanlar.`,

  "Kanban: Driver's Edition": `Kanban: Driver's Edition, Vital Lacerda'nın tasarımı olan, bir elektrikli otomobil fabrikasında kariyer basamaklarını tırmanan hırslı mühendisleri yönettiğiniz, ağır ve inanılmaz derecede sıkı bir euro oyunudur. Tasarım, parça siparişi, montaj ve test departmanları arasında işçilerinizi yerleştirirken; sürekli fabrikanın her yerinde dolaşan ve performansınızı denetleyen acımasız fabrika müdürü Sandra'ya yakalanmamak zorundasınızdır.\n\nSanayi tipi lojistiği, mekanik karmaşası ve zaman yönetimi baskısıyla ağır siklet strateji dehalarının en çok saygı duyduğu şaheserlerden biridir.`,

  "Under Falling Skies": `Under Falling Skies, klasik Space Invaders atari oyununu andıran bir yapıda, gökyüzünden yavaş yavaş şehre doğru süzülen uzaylı gemilerini zarları akıllıca kullanarak durdurmaya çalıştığınız olağanüstü bir solo oyun deneyimidir. Üssünüzdeki odalara zar yerleştirdiğinizde, zarın değeri üssün gücünü artırır; ancak aynı zamanda zarın bulunduğu sütundaki uzaylı gemisinin de şehre o kadar hızlı inmesine neden olur!\n\nGüç ile risk arasındaki bu acımasız zar mekaniği, her tur beyninizi eriten bir bulmaca sunarak tek kişilik strateji oyunlarının zirvelerine yerleşir.`,

  "Summoner Wars (Second Edition)": `Summoner Wars (Second Edition), fantastik ırkların ordularını yönetarak liderinizi koruyup rakip lideri avlamaya çalıştığınız, kart oyunu ile satranç benzeri taktiksel grid hareketini birleştiren muazzam bir düello oyunudur. Elinizdeki kartları büyü gücüne dönüştürerek savaş alanına orklar, iskeletler veya büyücüler çağırır, zarlarla çarpışarak tahtadaki pozisyon avantajını ele geçirmeye çalışırsınız.\n\nYenilenmiş görselleri, asimetrik fraksiyonların harika dengesi ve saniyeler içinde değişen satranç benzeri pozisyonlarıyla iki kişilik rekabetin efsanelerindendir.`,

  "KLASK": `KLASK, Danimarka yapımı, masa hokeyi ile tilt oyunlarını manyetik bir tahtada harmanlayan ve masadaki herkesi çığlık çığlığa bağırtan efsanevi bir beceri oyunudur. Masanın altından mıknatısla kontrol ettiğiniz vurucu ile küçük topu rakibin kalesine sokmaya çalışırken, aynı zamanda sahanın ortasındaki küçük beyaz mıknatıslardan kaçmak ve kendi kalenize düşmemek için harika bir el-göz koordinasyonu gerekir.\n\nSaniyeler süren maçları, herkesin oynamak için sıraya girdiği turnuvaları ve saf fiziksel eğlencesiyle kutu oyunu gecelerinin tartışmasız en hareketli finalidir.`
};

async function replaceGenericDescriptionsFinalBatch() {
  console.log(`🚀 Yeni Nesil Güncelleme Başlıyor: Jenerik metinler (121-150) eziliyor...\n`);

  const { data: allGames, error } = await supabase
    .from('games')
    .select('id, title, description');

  if (error) {
    console.error('❌ Veritabanı okuma hatası:', error.message);
    return;
  }

  let updatedCount = 0;
  let missingCount = 0;

  const targetTitles = Object.keys(targetDescriptions);

  for (const game of allGames) {
    if (!targetTitles.includes(game.title)) {
      continue;
    }

    const newDescription = targetDescriptions[game.title];

    const { error: updateError } = await supabase
      .from('games')
      .update({ description: newDescription })
      .eq('id', game.id);

    if (updateError) {
      console.log(`❌ Hata (${game.title}): ${updateError.message}`);
      missingCount++;
    } else {
      console.log(`✅ JENERİK METİN SİLİNDİ -> Kaliteli Metin Eklendi: ${game.title}`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 BÖLÜM 5 VE SON FİNAL TAMAMLANDI!`);
  console.log(`📊 Başarıyla Temizlenen: ${updatedCount}`);
  console.log(`Bütün veritabanımız tertemiz ve edebiyat kokuyor!`);
}

replaceGenericDescriptionsFinalBatch();