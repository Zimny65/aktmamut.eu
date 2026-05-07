# Cache busting w `site/`

Ten dokument opisuje praktyczny mechanizm wersjonowania i omijania cache w części publikowanej strony.

## Co robi `update_version.py`

Skrypt:

```text
site/scripts/update_version.py
```

generuje znacznik czasu w formacie `YYYYMMDDHHMMSS`, np.:

```text
20260507211944
```

Następnie zapisuje go do:

```text
site/assets/js/app-version.js
```

w formie:

```js
window.APP_VERSION = "20260507211944";
```

Ten sam numer jest używany jako `?v=<APP_VERSION>` dla lokalnych plików CSS i JS ładowanych w wybranych plikach HTML.

## HTML-e aktualizowane przez skrypt

`update_version.py` aktualizuje lokalne linki CSS/JS w:

- `site/index.html`
- `site/expeditions/index.html`
- `site/challenges/index.html`
- `site/challenges/list.html`
- `site/challenges/manual.html`
- `site/statistics/index.html`
- `site/app/index.html`

Skrypt dotyka tylko lokalnych assetów w atrybutach:

```html
href="/...css..."
src="/...js..."
```

Jeśli link nie ma `?v=`, skrypt dopisuje wersję. Jeśli link ma stare `?v=...`, skrypt podmienia je na aktualne `APP_VERSION`.

## Czego skrypt nie rusza

`update_version.py` nie powinien ruszać:

- zewnętrznych URL-i `https://`, `http://`, `//`,
- plików JSON,
- plików GeoJSON,
- wywołań `fetch(...)`,
- danych generowanych przez skrypty Python.

JSON/GeoJSON i `fetch` są osobnym tematem. Na razie nie są objęte tym etapem cache bustingu.

## Pre-commit hook

Pre-commit hook uruchamia:

```powershell
python scripts/update_version.py
```

przed commitem w repozytorium `site/`.

Hook powinien dodać do commita pliki zmienione przez wersjonowanie, czyli przede wszystkim:

- `assets/js/app-version.js`,
- HTML-e z listy obsługiwanej przez `update_version.py`, jeśli zmieniły się w nich parametry `?v=`.

Jeśli po commicie albo po próbie commita zostają zmienione HTML-e, oznacza to zwykle, że hook zaktualizował wersje po przygotowaniu commita. Wtedy trzeba sprawdzić zmiany, dodać je do commita i ponowić commit.

## Ręczne uruchomienie

Z katalogu `site/`:

```powershell
python scripts/update_version.py
```

To zaktualizuje:

- `assets/js/app-version.js`,
- `?v=<APP_VERSION>` w lokalnych linkach CSS/JS w obsługiwanych HTML-ach.

## Sprawdzenie aktualnej wersji

Aktualna wersja znajduje się w:

```text
site/assets/js/app-version.js
```

Przykład:

```js
window.APP_VERSION = "20260507211944";
```

## Header i `APP_VERSION`

`site/assets/js/header.js` odczytuje `window.APP_VERSION` i pobiera wspólny komponent nagłówka z parametrem:

```js
/assets/components/header.html?v=<APP_VERSION>
```

Dzięki temu przeglądarka powinna pobrać świeżą wersję `header.html`, gdy zmieni się `APP_VERSION`.

Ważne: `app-version.js` musi być ładowany przed `header.js`.

## Version label

Na stronie głównej działa testowa etykieta wersji.

Używane pliki:

- `site/assets/css/version-label.css`
- `site/assets/js/version-label.js`
- `site/assets/js/app-version.js`

`version-label.js` odczytuje `window.APP_VERSION` i dodaje do strony dyskretną etykietę:

```text
v20260507211944
```

Na razie etykieta wersji jest dodana tylko do:

- `site/index.html`

Nie jest jeszcze dodana do pozostałych stron.

## Osobny przypadek `site/app/index.html`

`site/app/index.html` wcześniej używał ręcznych wersji:

```html
<link rel="stylesheet" href="/app/app.css?v=2" />
<script src="/app/app.js?v=2"></script>
```

Po rozszerzeniu `update_version.py` te lokalne linki mogą być aktualizowane do aktualnego `APP_VERSION`, tak jak pozostałe lokalne CSS/JS.

## Mechanizm `no-store` w Challenges

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

- `site/scripts/update_version.py`,
- `site/assets/js/app-version.js`,
- `site/assets/js/header.js`,
- `site/assets/js/header260329.js`,
- `site/assets/js/version-label.js`,
- `site/assets/css/version-label.css`,
- pre-commit hooka w repozytorium `site/`,
- ręcznie parametrów `?v=...` w HTML-ach, jeśli są zarządzane przez `update_version.py`.

Te pliki i wpisy są powiązane z aktualnym ładowaniem nagłówka, wersjonowaniem assetów albo testową etykietą wersji.

## Do zrobienia później

- Zdecydować, czy dodać cache busting dla `site/expeditions/expeditions.geojson` i `site/expeditions/markers.json`.
- Zdecydować, czy JSON-y Challenges mają nadal używać `cache: 'no-store'`, czy także `?v=<APP_VERSION>`.
- Dodać version label do pozostałych stron, jeśli test na `site/index.html` będzie udany.
- Sprawdzić, czy version label nie przeszkadza na mapach i w `site/app/` z dolną nawigacją.
- Zdecydować, czy `site/assets/js/header260329.js` można przenieść do archiwum.
