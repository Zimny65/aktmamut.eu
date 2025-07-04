// Ustawienia Leaflet
let L_NO_TOUCH = false;
let L_DISABLE_3D = false;

window.addEventListener('DOMContentLoaded', function () {
    // 🔍 Znajdź ID mapy wygenerowanej przez Folium
    const mapId = document.querySelector('.folium-map')?.getAttribute('id');
    const map = window[mapId];
    if (!map) return;

    // 📥 Pobranie danych tras w formacie GeoJSON
    fetch('expeditions.geojson')
        .then((res) => res.json())
        .then((data) => {
            const groupLayers = []; // wszystkie trasy i markery
            const routeLayers = []; // tylko trasy i ich elementy

            // 🔁 Przejdź przez wszystkie trasy w pliku
            data.features.forEach((feature) => {
                // ➤ Obsługujemy tylko linie (trasy)
                if (feature.geometry.type !== 'LineString') return;

                const coords = feature.geometry.coordinates;
                const props = feature.properties;

                // 🔧 Wydobycie atrybutów
                // const trailColor = props.color || '#654321'; // chocolate
                // const trailColor = props.color || '#FF00FF'; // magenta
                // const trailColor = props.color || '#0000FF'; // blue
                // const trailColor = props.color || '#FF0000'; // red
                const trailColor = props.color || '#800000'; // maroon
                const trailNr = props.nr || '';
                // const trailCounter = props.trail_counter || '';
                const trailName = props.name || '';
                const lat = parseFloat(props.lat);
                const lon = parseFloat(props.lon);

                // ➤ Utwórz warstwę z liniami (trasami)
                const line = L.geoJSON(feature, {
                    style: {
                        color: trailColor,
                        weight: 3,
                        opacity: 0.8,
                    },
                });

                // 🏷️ Wyświetlenie nazwy trasy po najechaniu kursorem
                line.bindTooltip(
                    `<div style='font-family: Oswald, sans-serif; font-size: 12px;'>
                        ${trailNr} ${trailName}
                    </div>`,
                    { sticky: true }
                );

                // ✨ Efekt podświetlenia trasy przy najechaniu
                line.on({
                    mouseover: () => {
                        line.setStyle({ weight: 6, color: '#000000' });
                        line.bringToFront();
                    },
                    mouseout: () => {
                        line.setStyle({ weight: 3, color: trailColor });
                    },
                });

                // 🟢 Utworzenie markera z numerem trasy
                const iconHtml = `
                <div style="
                    font-size: 10px;
                    font-family: Oswald, sans-serif;
                    color: white;
                    background-color: ${trailColor};
                    border-radius: 50%;
                    border: 1px solid white;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;">
                    ${trailNr}
                </div>`;

                const marker = L.marker([lat, lon], {
                    icon: L.divIcon({
                        className: '',
                        html: iconHtml,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                    }),
                });

                // 🏷️ Tooltip dla markera
                marker.bindTooltip(
                    `<div style='font-family: Oswald, sans-serif; font-size: 12px;'>
                        ${trailNr} ${trailName}
                    </div>`,
                    { sticky: true }
                );

                // 🔁 Podświetlenie linii po najechaniu na marker
                marker.on('mouseover', function () {
                    line.setStyle({ weight: 6, color: '#000000' });
                    line.bringToFront();
                });
                marker.on('mouseout', function () {
                    line.setStyle({ weight: 3, color: trailColor });
                });

                // 📋 Szczegółowy popup z informacjami o trasie
                const popupHtml = `
                <div style="font-family: 'Oswald', sans-serif; font-size: 12px;">
                    <table style="border-collapse: collapse;">
                        <tr><th style="text-align: left;">Trail nr:</th><td>${props.nr || ''}</td></tr>
                        <tr><th style="text-align: left;">Date:</th><td>${props.date || ''}</td></tr>
                        <tr><th style="text-align: left;">Trail name:</th><td>${trailName}</td></tr>
                        <tr><th style="text-align: left;">Mountains:</th><td>${props.mountains || ''}</td></tr>
                        <tr><th style="text-align: left;">Country:</th><td>${props.country || ''}</td></tr>
                        <tr><th style="text-align: left;">Distance:</th><td>${props.distance_km || ''} km</td></tr>
                        <tr><th style="text-align: left;">Up:</th><td>${props.ascent_m || ''} m</td></tr>
                        <tr><th style="text-align: left;">Time:</th><td>${props.duration_h || ''} h</td></tr>
                        <tr><th style="text-align: left;">GOT:</th><td>${props.got || ''}</td></tr>
                        <tr><th style="text-align: left;">Participants:</th><td>${props.participants || ''}</td></tr>
                        <tr><th style="text-align: left;">GPX:</th><td><a href="${props.gpx_url || '#'}" target="_blank">Wikiloc Link</a></td></tr>
                    </table>
                </div>
                `;
                marker.bindPopup(popupHtml);

                // 🔴 Początek i koniec trasy jako małe kółka
                const startCircle = L.circleMarker([coords[0][1], coords[0][0]], {
                    radius: 3,
                    color: trailColor,
                    fillColor: trailColor,
                    fillOpacity: 1,
                });

                const endCoords = coords[coords.length - 1];
                const endCircle = L.circleMarker([endCoords[1], endCoords[0]], {
                    radius: 3,
                    color: trailColor,
                    fillColor: trailColor,
                    fillOpacity: 1,
                });

                // 🧩 Zgrupowanie wszystkich elementów jednej trasy
                const group = L.layerGroup([line, marker, startCircle, endCircle]);
                routeLayers.push(group);
                groupLayers.push(marker); // Tylko marker do załadowania od razu
            });

            // 🌍 Dodaj markery i trasy od razu bez zoomowania
            const markerLayer = L.layerGroup(groupLayers);
            markerLayer.addTo(map);

            const routeLayer = L.layerGroup(routeLayers);
            routeLayer.addTo(map);

            // // 🌍 Dodaj tylko markery na start
            // const initialLayer = L.layerGroup(groupLayers);
            // initialLayer.addTo(map);

            // // 🔍 Przybliżenie mapy powoduje załadowanie tras
            // let added = false;
            // map.on('zoomend', () => {
            //     if (map.getZoom() >= 10 && !added) {
            //         const lines = L.layerGroup(routeLayers);
            //         lines.addTo(map);
            //         added = true;
            //     }
            // });
        });
});

// 🌍 Inicjalizacja mapy Leaflet
var map_f15ff5f41b2dbbf273d8c3052233061a = L.map('map_f15ff5f41b2dbbf273d8c3052233061a', {
    center: [48.88524522540481, 20.563185152538292],
    crs: L.CRS.EPSG3857,
    zoom: 7,
    zoomControl: true,
    preferCanvas: false,
    fullscreenControl: true,
});

// 🗺️ Warstwa 1: OpenStreetMap Standard
var osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    opacity: 1,
});

// 🗺️ Warstwa 2: OpenTopoMap (mapa turystyczna)
var topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 17,
    attribution: 'Map data: © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, SRTM | Map style: © <a href="https://opentopomap.org/">OpenTopoMap</a> (CC-BY-SA)',
    subdomains: ['a', 'b', 'c'],
    opacity: 1,
});

// 🗺️ Warstwa 3: MapTiler Outdoor (wymaga klucza API)
var maptilerLayer = L.tileLayer('https://api.maptiler.com/maps/outdoor/{z}/{x}/{y}.png?key=bMbOwauRVWZIi3aajhra', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> & OpenStreetMap contributors',
    tileSize: 512,
    zoomOffset: -1,
    crossOrigin: true,
});

// 🏔️ Warstwa 4: MapTiler Topo
var maptilerTopoLayer = L.tileLayer('https://api.maptiler.com/maps/topo/{z}/{x}/{y}.png?key=bMbOwauRVWZIi3aajhra', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> & OpenStreetMap contributors',
    tileSize: 512,
    zoomOffset: -1,
    crossOrigin: true,
});

// 🛰️ Warstwa 5: MapTiler Hybrid (satelita + ulice)
var maptilerHybridLayer = L.tileLayer('https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=bMbOwauRVWZIi3aajhra', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> & OpenStreetMap contributors',
    tileSize: 512,
    zoomOffset: -1,
    crossOrigin: true,
});

// ✅ Domyślnie dodajemy OpenStreetMap
osmLayer.addTo(map_f15ff5f41b2dbbf273d8c3052233061a);

// 🎚️ Przełącznik warstw (Leaflet layers control)
var layer_control_62bf6a9bcc869e79e51c96d84cfc230a_layers = {
    base_layers: {
        '🗺️ OpenStreetMap': osmLayer,
        '🧭 OpenTopoMap': topoLayer,
        '🌄 MapTiler Outdoor': maptilerLayer,
        '🏔️ MapTiler Topo': maptilerTopoLayer,
        '🛰️ MapTiler Hybrid': maptilerHybridLayer,
    },
    overlays: {},
};

// 🎚️ Dodanie panelu warstw (przełącznik stylów mapy - bazowe + nakładki)
L.control
    .layers(layer_control_62bf6a9bcc869e79e51c96d84cfc230a_layers.base_layers, layer_control_62bf6a9bcc869e79e51c96d84cfc230a_layers.overlays, {
        position: 'topright',
        collapsed: true,
        autoZIndex: true,
    })
    .addTo(map_f15ff5f41b2dbbf273d8c3052233061a);

// 📏 Dodanie klasycznego paska skali w lewym dolnym rogu
L.control
    .scale({
        position: 'bottomleft',
        imperial: false, // tylko metry
    })
    .addTo(map_f15ff5f41b2dbbf273d8c3052233061a);
