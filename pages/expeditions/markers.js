// markers.js

window.addEventListener('DOMContentLoaded', function () {
    const mapId = document.querySelector('.folium-map')?.getAttribute('id');
    const map = window[mapId];
    if (!map) return;

    console.time('📍 fetch markers.json');

    fetch('markers.json')
        .then((res) => res.json())
        .then((markers) => {
            console.timeEnd('📍 fetch markers.json');
            console.time('📍 render markers');

            const markersGroup = L.layerGroup();

            markers.forEach((m) => {
                const iconHtml = `
                    <div style="
                        font-size: 10px;
                        font-family: Oswald, sans-serif;
                        color: white;
                        background-color: #800000;
                        border-radius: 50%;
                        border: 1px solid white;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;">
                        ${m.nr}
                    </div>`;

                const marker = L.marker([m.lat, m.lon], {
                    icon: L.divIcon({
                        className: '',
                        html: iconHtml,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                    }),
                });

                marker.bindTooltip(`<div style='font-family: Oswald, sans-serif; font-size: 12px;'>${m.nr} ${m.name}</div>`, {
                    sticky: true,
                });

                markersGroup.addLayer(marker);
            });

            markersGroup.addTo(map);
            console.timeEnd('📍 render markers');
        });
});
