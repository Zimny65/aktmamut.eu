import os
import requests
import pandas as pd
import folium
from folium.features import DivIcon
from folium.plugins import MarkerCluster, Fullscreen, MiniMap

# Funkcja do pobierania danych z arkusza Google Sheets
def fetch_data_from_sheet(sheet_id, sheet_name, api_key):
    base_url = f'https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values/{sheet_name}'
    params = {
        'alt': 'json',
        'key': api_key
    }
    
    url = f"{base_url}?{requests.compat.urlencode(params)}"
    response = requests.get(url)
    data = response.json()
    
    if 'values' not in data:
        raise KeyError(f"'values' not found in the response for sheet {sheet_name}. Please check the API key and sheet ID.")
    
    # Przekształć dane na DataFrame
    columns = data['values'][0]
    rows = data['values'][1:]
    df = pd.DataFrame(rows, columns=columns)
    
    return df

# Funkcja do generowania mapy
def generate_map(df, output_directory, output_filename):
    # Stwórz obiekt mapy z domyślną warstwą OpenStreetMap
    m = folium.Map(
        location=[df['LAT'].mean(), df['LON'].mean()],
        zoom_start=6,
        width="100%"
    )

    # Dodaj OpenStreetMap jako domyślną warstwę
    folium.TileLayer(name='OpenStreetMap').add_to(m)

    # Dodaj inne warstwy kafelkowe
    # folium.TileLayer(
    #     tiles='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    #     attr='Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    #     name='OpenTopoMap'
    # ).add_to(m)

    # Dodaj kontrolkę warstw
    # folium.LayerControl().add_to(m)

    # Dodaj MarkerCluster z niestandardową konfiguracją (maxClusterRadius ustawiony na 4)
    marker_cluster = MarkerCluster(
        options={
            'maxClusterRadius': 4  # Bardzo mały promień klastrowania
        }
    ).add_to(m)

    # Dodaj markery do MarkerCluster zamiast bezpośrednio do mapy
    for index, row in df.iterrows():
        lat = float(row['LAT'])
        lon = float(row['LON'])
        trail_counter = row['Trail counter']

        # Zamień wartość kolumny Trail GPX na klikalny link
        trail_gpx = row['Trail GPX']
        if trail_gpx.startswith("http"):
            trail_gpx = f'<a href="{trail_gpx}" target="_blank">{trail_gpx}</a>'

        # Generowanie HTML do popup
        popup_html = f"""
        <div style="font-family: 'Oswald', sans-serif; font-size: 12px; color: black;">
            <table style="width: auto; border-collapse: collapse;">
        """
        for column in df.columns:
            value = row[column]
            if column == 'Trail GPX':  # Jeśli to kolumna Trail GPX, wstaw klikalny link
                value = trail_gpx
            popup_html += f"""
                <tr>
                    <td style="font-weight: bold; padding: 4px; vertical-align: top;">{column}:</td>
                    <td style="padding: 4px; vertical-align: top;">{value}</td>
                </tr>
            """
        popup_html += "</table></div>"

        # Dodaj marker do MarkerCluster
        folium.Marker(
            location=[lat, lon],
            icon=DivIcon(
                icon_size=(24, 24),
                icon_anchor=(12, 12),
                html=f'<div style="font-size: 10px; font-family: Oswald, sans-serif; '
                    f'font-weight: bold; color: white; background-color: green; '
                    f'border-radius: 50%; border: 1px solid white; width: 24px; '
                    f'height: 24px; display: flex; align-items: center; '
                    f'justify-content: center;">{trail_counter}</div>'
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

# Główny kod do generowania mapy
if __name__ == "__main__":
    # Ustawienia do pobrania danych z Google Sheets
    sheet_id = '1z3ceJOc6PpKWGqIxMi6P4Ij1i37rcXIx3P_VIWrGpN0'
    sheet_name = 'ALL'  # Nazwa arkusza, który zawiera wszystkie dane
    api_key = 'AIzaSyDtf7Svkxg-3DpCnpMw3YFPyJDx8dedWIw'  # Użyj tego samego klucza API

    # Pobierz dane z arkusza Google Sheets
    df = fetch_data_from_sheet(sheet_id, sheet_name, api_key)

    # Wypisz nazwy kolumn, aby sprawdzić ich poprawność
    print("Columns in the DataFrame:", df.columns)

    # Przypisz odpowiednie kolumny dla LAT i LON na podstawie indeksów kolumn L i M
    df['LAT'] = pd.to_numeric(df['LAT'], errors='coerce')  # Kolumna L
    df['LON'] = pd.to_numeric(df['LON'], errors='coerce')  # Kolumna M

    # Usuń wiersze z brakującymi wartościami LAT lub LON
    df = df.dropna(subset=['LAT', 'LON'])
    df = df.reset_index(drop=True)

    # Określ katalog wyjściowy
    output_directory = "C:\\github\\AKT-MAMUT\\GeneratedMaps"
    output_filename = "EXPEDITIONS.html"

    # Upewnij się, że katalog wyjściowy istnieje
    os.makedirs(output_directory, exist_ok=True)

    # Generowanie mapy
    generate_map(df, output_directory, output_filename)
