# Bölüm 1 — Angular Uygulaması ve Karmaşıklık

## Bu bölümde ne öğreneceğiz?

- Angular uygulaması, component ve template kavramları
- Kullanıcı olayı, data binding ve state akışı
- İş gereksinimi ile teknik çözüm arasındaki fark
- Feature ve sorumluluk kavramları
- Çalışan bir component'in yeni taleplerle neden karmaşıklaştığı
- Çözüm önermeden önce mimari problem teşhisi

## Hangi şirket problemine hizmet ediyor?

Gerçek projelerde ilk sürüm çoğunlukla küçüktür. Aynı ekrana arama, filtre, seçim, düzenleme, API,
loading ve hata davranışı eklendikçe component birçok sorumluluk üstlenebilir. Bu bölüm, problemi
erken fark etmeyi öğretir.

## Başlangıç zihinsel modeli

```text
Kullanıcı
  -> template üzerinde işlem yapar
  -> component olayı karşılar
  -> state değişir
  -> template yeni state'i gösterir
```

Her terim, kodda ilk kez kullanılmadan önce tanım, çalışma modeli, basit örnek, şirket karşılığı ve
yanlış kullanım biçimleriyle açıklanacaktır.

## Uygulama görevi

OpsFlow için Project Workspace geliştirilecektir:

- proje listesi;
- proje seçimi;
- proje detayı;
- arama;
- durum filtresi.

İlk sürüm yerel örnek veriyle ve mümkün olan en sade Angular yapısıyla başlayacaktır. Backend,
Signals, RxJS ve ek mimari katmanlar henüz eklenmeyecektir.

## Tamamlanma kriteri

Öğrenci component, template, event ve state akışını kendi cümleleriyle açıklayabilir; çalışan feature
üzerindeki sorumlulukları gösterebilir ve hangi yeni taleplerin karmaşıklık oluşturacağını
gerekçelendirebilir.
