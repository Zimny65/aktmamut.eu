# Cache busting w `site/`

Ten dokument opisuje znalezione mechanizmy wersjonowania i omijania cache w części publikowanej strony. To opis stanu obecnego, a nie decyzja o zmianach.

## Aktywny mechanizm wersjonowania nagłówka

Główny mechanizm wersjonowania wygląda tak:

1. `site/scripts/update_version.py` generuje znacznik czasu w formacie `YYYYMMDDHHMMSS`.
2. Skrypt zapisuje ten numer do `site/assets/js/app-version.js`.
3. `site/assets/js/app-version.js` ustawia globalną zmienną:

   ```js
   window.APP_VERSION = "...";
   ```

4. `site/assets/js/header.js` odczytuje `window.APP_VERSION`.
5. `header.js` pobiera komponent nagłówka z parametrem wersji:

   ```js
   /assets/components/header.html?v=<APP_VERSION>
   ```

Dzięki temu przeglądarka powinna pobrać świeżą wersję `header.html`, gdy zmieni się `APP_VERSION`.

## Strony używające `app-version.js` i `header.js`

Poniższe strony ładują mechanizm wersji aplikacji oraz wspólny nagłówek:

- `site/index.html`
- `site/expeditions/index.html`
- `site/challenges/index.html`
- `site/challenges/list.html`
- `site/challenges/manual.html`
- `site/statistics/index.html`

Ważne: `app-version.js` powinien być ładowany przed `header.js`, żeby `header.js` mógł użyć `window.APP_VERSION`.

## Osobny mechanizm w `site/app/index.html`

`site/app/index.html` używa osobnego, statycznego cache bustingu:

```html
<link rel="stylesheet" href="/app/app.css?v=2" />
<script src="/app/app.js?v=2"></script>
```

To oznacza, że `site/app/app.css` i `site/app/app.js` mają ręcznie ustawioną wersję `v=2`, niezależną od `window.APP_VERSION`.

## Mechanizm `no-store` w challenges

Challenge'e używają dodatkowo mechanizmu omijania cache przy pobieraniu danych JSON.

Występuje to w:

- `site/challenges/index.html`
- `site/challenges/list.html`

Przykładowy wzorzec:

```js
fetch(url, { cache: 'no-store' })
```

Dotyczy to przede wszystkim:

- `site/challenges/data/challenges-index.json`
- `site/challenges/data/challenges-*.json`

## Nie ruszać bez zgody

Bez wyraźnej zgody nie należy usuwać, przenosić ani zmieniać:

- `site/scripts/update_version.py`
- `site/assets/js/app-version.js`
- `site/assets/js/header.js`
- `site/assets/js/header260329.js`
- `site/app/index.html`
- `site/challenges/index.html`
- `site/challenges/list.html`

Te pliki są powiązane z aktualnym ładowaniem nagłówka, wersjonowaniem albo pobieraniem danych bez cache.

## Do wyjaśnienia

- Czy dodać cache busting dla `site/expeditions/expeditions.geojson` i `site/expeditions/markers.json`.
- Czy `site/assets/js/header260329.js` można później przenieść do archiwum.
- Czy `app.css?v=2` i `app.js?v=2` w `site/app/index.html` powinny kiedyś używać `APP_VERSION`.
