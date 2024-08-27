import os
import requests
import pandas as pd
import folium
from folium.features import DivIcon
from folium.plugins import MarkerCluster, Fullscreen, MiniMap

# Funkcja do pobierania danych z Google Sheets
def fetch_data(google_sheets_url):
    response = requests.get(google_sheets_url)
    data = response.json()

    # Sprawdź, czy odpowiedź zawiera klucz 'values'
    if 'values' not in data:
        raise KeyError("'values' not found in the response. Please check the Google Sheets URL and API key.")

    # Przekształć dane na DataFrame
    columns = data['values'][0]
    rows = data['values'][1:]
    df = pd.DataFrame(rows, columns=columns)

    return df

# Funkcja do generowania mapy
def generate_map(df, condition, output_directory, output_filename):
    # Zastosuj condition do filtrowania DataFrame
    filtered_df = df.query(condition)

    # Sprawdź, czy filtr zwrócił jakieś wyniki
    if filtered_df.empty:
        print(f"No data matching the condition: {condition}")
        return

    # Stwórz obiekt mapy
    m = folium.Map(
        location=[45.0, 25.0],
        zoom_start=6,
        tiles=None,  # Brak domyślnych kafelków
        width="100%"
    )

    # Dodaj mapę OpenTopoMap jako główną warstwę
    folium.TileLayer(
        tiles='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attr='Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
        name='OpenTopoMap'
    ).add_to(m)

    # Dodaj MarkerCluster z niestandardową konfiguracją (maxClusterRadius ustawiony na 4)
    marker_cluster = MarkerCluster(
        options={
            'maxClusterRadius': 4  # Bardzo mały promień klastrowania
        }
    ).add_to(m)

    # Dodaj markery do MarkerCluster zamiast bezpośrednio do mapy
    for index, row in filtered_df.iterrows():
        lat = row['LAT']
        lon = row['LON']
        peak = row['PEAK']
        region = row['REGION']
        mesoregion = row['MESOREGION']
        microregion = row['MICROREGION']
        height = row['HEIGHT']
        expedition = row['EXPEDITION']
        date = row['DATE']
        number = f"{index + 1:03d}"  # Numeracja markerów od 001, trzycyfrowa
        
        # Określ kolor na podstawie wartości CONDITION
        color = 'green' if row['CONDITION'] == 1 else 'red'

        # Stwórz dynamiczny popup z tabelką, czcionką Oswald 12px i wyrównaniem do góry
        popup_html = f"""
        <div style="font-family: 'Oswald', sans-serif; font-size: 12px; color: black;">
            <table style="width: auto; border-collapse: collapse;">
                <tr>
                    <td style="font-weight: bold; padding: 4px; vertical-align: top;">PEAK:</td>
                    <td style="padding: 4px; vertical-align: top;">{peak}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; padding: 4px; vertical-align: top;">REGION:</td>
                    <td style="padding: 4px; vertical-align: top;">{region}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; padding: 4px; vertical-align: top;">MESOREGION:</td>
                    <td style="padding: 4px; vertical-align: top;">{mesoregion}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; padding: 4px; vertical-align: top;">MICROREGION:</td>
                    <td style="padding: 4px; vertical-align: top;">{microregion}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; padding: 4px; vertical-align: top;">HEIGHT:</td>
                    <td style="padding: 4px; vertical-align: top;">{height} m</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; padding: 4px; vertical-align: top;">EXPEDITION:</td>
                    <td style="padding: 4px; vertical-align: top;">{expedition}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; padding: 4px; vertical-align: top;">DATE:</td>
                    <td style="padding: 4px; vertical-align: top;">{date}</td>
                </tr>
            </table>
        </div>
        """

        # Dodaj marker do MarkerCluster
        folium.Marker(
            location=[lat, lon],
            icon=DivIcon(
                icon_size=(24, 24),
                icon_anchor=(12, 12),
                html=f'<div style="font-size: 10px; font-family: Oswald, sans-serif; '
                    f'font-weight: bold; color: white; background-color: {color}; '
                    f'border-radius: 50%; border: 1px solid white; width: 24px; '
                    f'height: 24px; display: flex; align-items: center; '
                    f'justify-content: center;">{number}</div>'
            ),
            popup=folium.Popup(popup_html, max_width=300)
        ).add_to(marker_cluster)

    # Dodaj przycisk pełnoekranowy
    Fullscreen().add_to(m)

    # Dodaj mini mapę
    minimap = MiniMap(toggle_display=True)
    minimap.add_to(m)

    # Dodaj styl CSS i JavaScript, aby przesunąć przyciski i mini mapę
    map_style = """
        <style>
        .leaflet-container {
            width: 100vw;
            height: 100vh;
        }
        .leaflet-control-zoom {
            transform: translateY(160px); /* Większe przesunięcie kontrolki w dół */
        }
        .leaflet-control-attribution {
            display: none;
        }
        .leaflet-control-minimap {
            transform: translateY(-60px); /* Przesunięcie mini mapy w górę */
        }
        </style>
    """
    # Dodaj styl do mapy
    m.get_root().html.add_child(folium.Element(map_style))

    # Generowanie pełnej ścieżki pliku
    output_file_path = os.path.join(output_directory, output_filename)
    
    # Zapisz mapę do pliku HTML
    m.save(output_file_path)
    print(f"Map saved as {output_file_path}")

# Główny kod do generowania map
if __name__ == "__main__":
    # Ustawienia z nowym kluczem API
    google_sheets_url = (
        'https://sheets.googleapis.com/v4/spreadsheets/'
        '1SNj2bRlcneGGBdqA3_btM3rZ8-oPy-U6fcouOylQibk/'
        'values/Mountains?alt=json&key=AIzaSyDtf7Svkxg-3DpCnpMw3YFPyJDx8dedWIw'
    )

    # Pobierz dane z Google Sheets
    df = fetch_data(google_sheets_url)

    # Zakładam, że Q to 17. kolumna (indeks 16) - KORONA KARPAT PL
    df['CONDITION'] = df.iloc[:, 16].apply(lambda x: int(x) if x else None)

    # Konwertuj kolumny LAT i LON na float
    df['LAT'] = pd.to_numeric(df['LAT'], errors='coerce')
    df['LON'] = pd.to_numeric(df['LON'], errors='coerce')

    # Usuń wiersze z brakującymi wartościami LAT, LON lub CONDITION
    df = df.dropna(subset=['LAT', 'LON', 'CONDITION'])
    df = df.reset_index(drop=True)

    # Zamień znaki nowej linii na <br> oraz " - " na <br> w odpowiednich kolumnach
    df['PEAK'] = df['PEAK'].str.replace('\n', '<br>').str.replace(' - ', '<br>')
    df['REGION'] = df['REGION'].str.replace('\n', '<br>').str.replace(' - ', '<br>')
    df['MESOREGION'] = df['MESOREGION'].str.replace('\n', '<br>').str.replace(' - ', '<br>')
    df['MICROREGION'] = df['MICROREGION'].str.replace('\n', '<br>').str.replace(' - ', '<br>')
    df['HEIGHT'] = df['HEIGHT'].str.replace('\n', '<br>').str.replace(' - ', '<br>')
    df['EXPEDITION'] = df['EXPEDITION'].str.replace('\n', '<br>').str.replace(' - ', '<br>')
    df['DATE'] = df['DATE'].str.replace('\n', '<br>').str.replace(' - ', '<br>')

    # Określ katalog wyjściowy
    output_directory = "C:/github/AKT-MAMUT/GeneratedMaps"

    # Lista warunków i nazw plików wyjściowych
    conditions = [
    #    ("CONDITION == 1", "green_map.html"),
    #    ("CONDITION == 0", "red_map.html"),
        ("CONDITION == CONDITION", "PL.html")
    ]

    # Iteracja po warunkach i generowanie map
    for condition, output_file in conditions:
        generate_map(df, condition, output_directory, output_file)
