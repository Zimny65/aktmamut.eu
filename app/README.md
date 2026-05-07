# site/app/

`site/app/` jest eksperymentalnym app shell oraz równoległą, mobilną wersją AKT Mamut. Ten katalog może być bazą pod przyszłą aplikację mobilną, PWA albo wariant Android.

Nie jest to kopia klasycznej wersji webowej 1:1. Może mieć własny układ, własną nawigację i własne decyzje projektowe.

## Header i nawigacja

`site/app/` nie musi używać wspólnego headera webowego z `site/assets/components/header.html`.

Wariant app może mieć własne elementy:

- `app-header`,
- dolną nawigację `bottom-nav`,
- osobny układ ekranów,
- iframe'y albo inne osadzanie modułów.

Zmiany w webowym headerze nie muszą być automatycznie kopiowane do `site/app/`. Jeśli app shell ma kiedyś przejąć część wspólnych elementów, powinna to być osobna, świadoma decyzja.

## Cache busting

Cache busting dla:

- `site/app/app.css`,
- `site/app/app.js`

jest obsługiwany przez `site/scripts/update_version.py`, który aktualizuje lokalne linki CSS/JS w wybranych plikach HTML.

## Version label

Testowa etykieta wersji nie jest na razie dodana do `site/app/`.

Powód: `site/app/` ma dolną nawigację, więc etykieta w prawym dolnym rogu mogłaby kolidować z `bottom-nav`. Jeśli etykieta wersji ma się pojawić w app shellu, trzeba najpierw dobrać dla niej bezpieczne miejsce.

## Przed przyszłym PWA / Android

Przed rozwijaniem `site/app/` jako PWA albo aplikacji Android trzeba rozważyć:

- manifest aplikacji,
- service worker,
- zestaw ikon i splash screen,
- routing między widokami,
- strategię offline/cache,
- obsługę map,
- obsługę iframe'ów albo decyzję o rezygnacji z iframe'ów,
- bezpieczne linki do klasycznej webowej części strony,
- sposób aktualizowania wersji i cache bustingu,
- zachowanie na małych ekranach i urządzeniach z safe area.

## Nie ruszać bez zgody

Bez wyraźnej zgody nie należy zmieniać:

- `site/app/index.html`,
- `site/app/app.css`,
- `site/app/app.js`,
- sposobu działania dolnej nawigacji,
- sposobu osadzania istniejących modułów,
- cache bustingu dla `app.css` i `app.js`.

Ten katalog jest eksperymentalny, ale może być ważną bazą pod przyszły kierunek aplikacyjny.

## Do zrobienia później

- Zdecydować, czy `site/app/` ma zostać jako osobny app shell.
- Sprawdzić, czy iframe'y są dobrym rozwiązaniem dla PWA/Android.
- Przygotować manifest PWA.
- Zaplanować service worker i strategię cache.
- Zaprojektować bezpieczne miejsce dla etykiety wersji, jeśli ma być widoczna w app shellu.
- Ustalić, które elementy klasycznej strony webowej powinny być współdzielone z app shell.
