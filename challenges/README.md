# Challenges

System Challenges generuje dane i widoki dla list wyzwań górskich publikowanych na stronie AKT Mamut. Jego celem jest utrzymywanie list szczytów w Google Sheets, a następnie generowanie plików JSON używanych przez frontend w `site/challenges/`.

Ten dokument porządkuje wiedzę przeniesioną z głównego pliku `read.me`. Tamten plik wygląda na starsze źródło dokumentacji. Po weryfikacji tej wersji można go później usunąć albo przenieść do archiwum.

## Google Sheets i `CONFIG`

Dane Challenges są oparte o Google Sheets.

Zakładka `CONFIG` opisuje dostępne challenge'e. Zgodnie ze starym opisem dokumentacji zawiera kolumny:

- `key` - identyfikator challenge'a używany w nazwach plików i adresach URL,
- `sheet` - nazwa zakładki z danymi danego challenge'a,
- `name` - nazwa wyświetlana na stronie,
- `icon` - emoji albo ścieżka do obrazka,
- `active` - informacja, czy challenge jest aktywny,
- `order` - kolejność wyświetlania.

Każdy challenge ma osobną zakładkę w Google Sheets. Typowe kolumny danych to:

- `NR`
- `PEAK`
- `REGION`
- `SUBREGION`
- `HEIGHT`
- `EXPEDITION`
- `DATE`
- `LAT`
- `LON`

Status punktu jest wyliczany automatycznie: jeśli `DATE` jest uzupełnione, rekord ma status `done`; jeśli `DATE` jest puste, rekord ma status `todo`.

## Generator

Za generowanie danych odpowiada:

```text
data/generate_challenges.py
```

Skrypt prawdopodobnie:

1. pobiera konfigurację z zakładki `CONFIG`,
2. pobiera dane aktywnych challenge'y z odpowiednich zakładek Google Sheets,
3. generuje pliki JSON dla poszczególnych challenge'y,
4. generuje indeks aktywnych challenge'y,
5. aktualizuje menu w `site/index.html`.

## Generowane pliki

Pliki danych są generowane do:

```text
site/challenges/data/
```

Najważniejsze typy plików:

- `challenges-index.json` - indeks aktywnych challenge'y używany przez stronę listy,
- `challenges-<key>.json` - dane konkretnego challenge'a, np. `challenges-ro.json`, `challenges-sk.json`, `challenges-cz.json`.

## Aktualizacja menu w `site/index.html`

Generator aktualizuje menu Challenges w głównej stronie:

```text
site/index.html
```

Zmiana odbywa się między markerami:

```html
<!-- CHALLENGES_MENU_START -->
<!-- CHALLENGES_MENU_END -->
```

Dzięki temu dodanie albo zmiana aktywnego challenge'a w `CONFIG` może automatycznie odświeżyć menu na stronie głównej.

## Strony Challenges

Aktualna struktura katalogu `site/challenges/` zawiera:

- `index.html` - strona pojedynczego challenge'a, otwierana z parametrem `region`, np. `/challenges/index.html?region=ro`,
- `list.html` - strona z listą/kafelkami challenge'y,
- `manual.html` - dokumentacja/manual systemu Challenges,
- `data/` - katalog z wygenerowanymi plikami JSON,
- `read.me` - starszy plik opisowy w katalogu Challenges.

Uwaga: główny stary `read.me` wspominał o `home.html`, ale w obecnej strukturze widoczny jest plik `list.html`, dlatego w tej dokumentacji używana jest aktualna nazwa `list.html`.

## Dodanie nowego challenge

Typowy proces dodania nowego challenge'a:

1. dodać nowy wiersz w zakładce `CONFIG`,
2. utworzyć zakładkę Google Sheets z danymi danego challenge'a,
3. upewnić się, że kolumny w zakładce są zgodne z oczekiwanym formatem,
4. uruchomić `data/generate_challenges.py`,
5. sprawdzić wygenerowane pliki w `site/challenges/data/`,
6. sprawdzić stronę listy `site/challenges/list.html` oraz stronę pojedynczego challenge'a.

Przykład: dla challenge'a o kluczu `tatry` generator powinien utworzyć plik podobny do:

```text
site/challenges/data/challenges-tatry.json
```

To tylko przykład nazwy. Rzeczywisty `key`, nazwa zakładki, nazwa challenge'a, ikona i kolejność powinny wynikać z aktualnej zakładki `CONFIG`.

## Ikony

Pole `icon` w zakładce `CONFIG` może być emoji albo ścieżką do obrazka, np. do pliku w `assets`.

Przykłady ze starej dokumentacji:

- emoji, np. `🌲`, `🌄`, `⛰`,
- obrazek, np. `/assets/img/ro.svg`, `/assets/img/sk.svg`, `/assets/img/SWK.webp`.

Przed zmianą ikon warto sprawdzić aktualny frontend, bo sposób renderowania ikon zależy od kodu strony oraz generatora.

## Co liczy strona listy

Strona listy challenge'y (`site/challenges/list.html`) pokazuje albo może pokazywać podstawowe statystyki dla każdego challenge'a:

- `total peaks` - liczba wszystkich szczytów,
- `done peaks` - liczba ukończonych szczytów,
- `progress %` - procent ukończenia.

Wartości są liczone na podstawie plików `challenges-<key>.json` generowanych do `site/challenges/data/`.

## Workflow aktualizacji

Typowy przepływ pracy wygląda następująco:

1. edycja danych w Google Sheets,
2. uruchomienie `data/generate_challenges.py`,
3. sprawdzenie wygenerowanych plików w `site/challenges/data/`,
4. sprawdzenie, czy menu w `site/index.html` jest poprawne,
5. ręczne sprawdzenie strony lokalnie,
6. commit i synchronizacja z GitHub,
7. publikacja przez Netlify.

Generatora nie należy uruchamiać automatycznie bez świadomej decyzji, bo może zmienić pliki danych oraz menu strony.

## Do wyjaśnienia

- Czy główny plik `read.me` można usunąć albo przenieść do archiwum po potwierdzeniu tej dokumentacji.
- Czy `site/challenges/read.me` jest nadal potrzebny, czy powinien zostać zastąpiony przez ten `README.md`.
- Czy lista kolumn w Google Sheets jest kompletna i aktualna.
- Czy wszystkie klucze `key` w `CONFIG` odpowiadają aktualnym plikom `challenges-<key>.json`.
- Czy proces aktualizacji powinien obejmować także uruchomienie mechanizmu cache bustingu strony.
