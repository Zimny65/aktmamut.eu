// Ustawienia Leaflet
let L_NO_TOUCH = false;
let L_DISABLE_3D = false;

window.addEventListener('DOMContentLoaded', function () {
    // 🔍 Znajdź ID mapy wygenerowanej przez Folium
    const mapId = document.querySelector('.folium-map')?.getAttribute('id');
    const map = window[mapId];
    if (!map) return;

    console.time('📥 fetch + przetwarzanie geojson');

    fetch('expeditions.geojson')
        .then((res) => res.json())
        .then((data) => {
            console.timeEnd('📥 fetch + przetwarzanie geojson');
            console.time('🔁 iteracja po trasach');

            const groupLayers = [];
            const routeLayers = [];
            const allParticipantsSet = new Set();

            data.features.forEach((feature, i) => {
                if (feature.geometry.type !== 'LineString') return;

                const props = feature.properties;
                // console.time(`🧪 trasa ${props.nr || i}`);

                const coords = feature.geometry.coordinates;
                if (props.participants) {
                    props.participants.split(',').forEach((p) => allParticipantsSet.add(p.trim()));
                }

                const trailColor = props.color || '#800000';
                const trailNr = props.nr || '';
                const trailName = props.name || '';
                const lat = parseFloat(props.lat);
                const lon = parseFloat(props.lon);

                // console.time(`🔷 geojson + tooltip ${trailNr}`);
                const line = L.geoJSON(feature, {
                    style: {
                        color: trailColor,
                        weight: 3,
                        opacity: 0.8,
                    },
                });

                line.bindTooltip(`<div style='font-family: Oswald, sans-serif; font-size: 12px;'>${trailNr} ${trailName}</div>`, { sticky: true });

                line.on({
                    mouseover: () => {
                        line.setStyle({ weight: 6, color: '#000000' });
                        line.bringToFront();
                    },
                    mouseout: () => {
                        line.setStyle({ weight: 3, color: trailColor });
                    },
                });
                // console.timeEnd(`🔷 geojson + tooltip ${trailNr}`);

                // console.time(`🟢 marker ${trailNr}`);
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

                marker.bindTooltip(`<div style='font-family: Oswald, sans-serif; font-size: 12px;'>${trailNr} ${trailName}</div>`, { sticky: true });

                marker.on('mouseover', function () {
                    line.setStyle({ weight: 6, color: '#000000' });
                    line.bringToFront();
                });
                marker.on('mouseout', function () {
                    line.setStyle({ weight: 3, color: trailColor });
                });
                // console.timeEnd(`🟢 marker ${trailNr}`);

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

                const group = L.layerGroup([line, marker, startCircle, endCircle]);
                routeLayers.push({ layer: group, participants: props.participants || '' });
                groupLayers.push({ layer: marker, participants: props.participants || '' });

                // console.timeEnd(`🧪 trasa ${props.nr || i}`);
            });

            console.timeEnd('🔁 iteracja po trasach');

            console.time('🔽 tworzenie listy uczestników');
            const select = document.getElementById('participant-filter');
            const participantCounts = {};

            data.features.forEach((feature) => {
                const props = feature.properties;
                if (props.participants) {
                    props.participants.split(',').forEach((p) => {
                        const name = p.trim();
                        participantCounts[name] = (participantCounts[name] || 0) + 1;
                    });
                }
            });

            const participantList = Object.keys(participantCounts).sort();
            participantList.forEach((p) => {
                const option = document.createElement('option');
                option.value = p;
                option.textContent = `${p} (${participantCounts[p]})`;
                select.appendChild(option);
            });
            console.timeEnd('🔽 tworzenie listy uczestników');

            console.time('🌍 applyParticipantFilter');
            function applyParticipantFilter(selected) {
                map.eachLayer((layer) => {
                    if (layer instanceof L.LayerGroup || layer instanceof L.Marker || layer instanceof L.GeoJSON) {
                        map.removeLayer(layer);
                    }
                });

                const visibleMarkers = groupLayers.filter((obj) => selected === 'ALL' || (obj.participants && obj.participants.includes(selected))).map((obj) => obj.layer);
                const visibleRoutes = routeLayers.filter((obj) => selected === 'ALL' || (obj.participants && obj.participants.includes(selected))).map((obj) => obj.layer);

                L.layerGroup(visibleMarkers).addTo(map);
                L.layerGroup(visibleRoutes).addTo(map);
            }

            applyParticipantFilter('ALL');
            console.timeEnd('🌍 applyParticipantFilter');

            const features = data.features;
            if (features.length > 0) {
                const last = features[features.length - 1];
                const date = last.properties.date;
                const versionInfo = document.getElementById('version-info');
                if (versionInfo) versionInfo.textContent = `${date}`;
            }

            document.getElementById('participant-filter').addEventListener('change', function () {
                applyParticipantFilter(this.value);
            });
        });
});

// 🌍 Inicjalizacja mapy Leaflet
var map_f15ff5f41b2dbbf273d8c3052233061a = L.map('map_f15ff5f41b2dbbf273d8c3052233061a', {
    center: [48.88524522540481, 20.563185152538292],
    crs: L.CRS.EPSG3857,
    zoom: 9,
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

// 🗺️ Warstwa: OSM.de (FOSSGIS)
var osmDeLayer = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors, tiles by <a href="https://openstreetmap.de/">openstreetmap.de</a>',
    tileSize: 256,
    crossOrigin: true,
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

// 🥾 Warstwa 6: Tracestrack Topo (bez MapTiler)
var tracestrackTopoLayer = L.tileLayer('https://tile.tracestrack.com/topo__/{z}/{x}/{y}.webp?key=98a25989268be3eb15a4369c05eda018', {
    minZoom: 0,
    maxZoom: 19,
    attribution: '&copy; <a href="https://tracestrack.com">Tracestrack</a> & OpenStreetMap contributors',
    tileSize: 256,
    crossOrigin: true,
});

// ✅ Domyślnie dodajemy OpenStreetMap
osmLayer.addTo(map_f15ff5f41b2dbbf273d8c3052233061a);

// 🎚️ Przełącznik warstw (Leaflet layers control)
var layer_control_62bf6a9bcc869e79e51c96d84cfc230a_layers = {
    base_layers: {
        '🗺️ OpenStreetMap': osmLayer,
        '🗺️ OSM DE': osmDeLayer,
        '🧭 OpenTopoMap': topoLayer,
        '🌄 MapTiler Outdoor': maptilerLayer,
        '🏔️ MapTiler Topo': maptilerTopoLayer,
        '🛰️ MapTiler Hybrid': maptilerHybridLayer,
        '🥾 Tracestrack Topo': tracestrackTopoLayer,
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
