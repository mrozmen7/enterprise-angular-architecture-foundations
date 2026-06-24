# Bölüm 1 — Çalışan Feature ve Karmaşıklık Değerlendirmesi

## İş gereksinimi

OpsFlow çalışanları müşteri projelerini görebilmeli, proje veya müşteri adına göre arayabilmeli,
duruma göre filtreleyebilmeli ve seçtikleri projenin ayrıntısını inceleyebilmelidir.

## Teslim edilen davranışlar

- Yerel örnek veriden proje listesi gösterilir.
- Arama, proje adı ve müşteri adı üzerinde büyük/küçük harf duyarsız çalışır.
- Kullanıcı `All`, `Active`, `Planning` veya `At Risk` durumunu seçebilir.
- Arama ve durum filtresi birlikte uygulanır.
- Sonuç bulunamadığında boş durum mesajı gösterilir.
- Kullanıcı bir proje seçip ayrıntılarını görebilir.
- Kullanıcı ayrıntıyı kapatabilir ve filtreleri sıfırlayabilir.

## Angular veri akışı

```text
Kullanıcı input, select veya button ile etkileşir
  -> template event binding ilgili component metodunu çağırır
  -> component state'i değişir
  -> Angular template'i yeniden değerlendirir
  -> @for ve @if yeni state'e uygun ekranı üretir
```

## Mevcut sorumluluk haritası

Şimdilik bütün feature bilinçli olarak tek `App` component'i içindedir:

```text
App component
  ├── örnek proje verisini saklar
  ├── arama state'ini saklar
  ├── durum filtresi state'ini saklar
  ├── seçili proje state'ini saklar
  ├── filtrelenmiş listeyi hesaplar
  ├── kullanıcı olaylarını karşılar
  └── bütün workspace görünümünü temsil eder
```

Bu yapı üç proje ve yerel veri için anlaşılırdır. Henüz ayrı servis, Signals, RxJS veya state
kütüphanesi eklemek için kanıtlanmış bir ihtiyaç yoktur.

## Gözlenen mühendislik baskısı

Yeni talepler geldikçe aynı component şu ek sorumlulukları almak zorunda kalabilir:

- API'den veri getirme;
- loading ve hata state'leri;
- proje oluşturma ve düzenleme;
- form doğrulama;
- kaydetme ve tekrar deneme;
- kullanıcı yetkileri;
- sıralama ve sayfalama;
- URL ile seçimi senkronize etme;
- eş zamanlı değişiklikleri yönetme.

Bu sorumlulukların tamamını aynı component'e eklemek, değişikliklerin birbirini etkileme riskini
artırır. Bölüm 1'in mimari sonucu hemen bir pattern seçmek değil, büyüme baskısını görünür ve
açıklanabilir hale getirmektir.

## Bilinçli sınırlar

- `Project` modeli henüz component dosyasındadır.
- Veriler henüz component içinde yereldir.
- State normal class property'leriyle tutulur.
- Filtrelenmiş liste bir getter ile hesaplanır.
- Backend, dependency injection, Signals ve RxJS kullanılmaz.

Bu sınırlar eksiklik değil, sonraki mimari kararların nedenini gözlemlemek için belirlenmiş başlangıç
noktalarıdır.

## Test kanıtı

Component testleri şu davranışları doğrular:

- ürün kimliğinin görüntülenmesi;
- başlangıçta üç projenin listelenmesi;
- proje seçimi ve ayrıntının görüntülenmesi;
- müşteri adına göre arama;
- duruma göre filtreleme;
- sonuç bulunamadığında boş durumun görüntülenmesi.
