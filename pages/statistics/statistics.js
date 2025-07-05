document.addEventListener('DOMContentLoaded', () => {
    fetch('/pages/expeditions/expeditions.geojson')
        .then((res) => res.json())
        .then((data) => {
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const years = Array.from({ length: 11 }, (_, i) => 2015 + i); // 2015–2025

            // [rok][miesiąc] = suma GOT
            const monthlyGOT = {};
            years.forEach((y) => {
                monthlyGOT[y] = Array(12).fill(0);
            });

            data.features.forEach((f) => {
                const got = parseFloat(f.properties.got || '0');
                const date = f.properties.date;
                if (!date || isNaN(got)) return;

                const [yearStr, monthStr] = date.split('-');
                const year = parseInt(yearStr);
                const month = parseInt(monthStr) - 1;

                if (monthlyGOT[year]) {
                    monthlyGOT[year][month] += got;
                }
            });

            // Oblicz narastające wartości
            const cumulativeGOT = {};
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth(); // 0-based: 0=Jan, 11=Dec

            years.forEach((y) => {
                let sum = 0;
                cumulativeGOT[y] = monthlyGOT[y].map((val, monthIdx) => {
                    sum += val;
                    if (y === currentYear && monthIdx > currentMonth) {
                        return null; // przyszłość → pusto
                    }
                    return sum || null;
                });
            });

            // Generowanie tabeli HTML
            const container = document.getElementById('gotTableContainer');
            container.innerHTML = '';

            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headerRow.appendChild(document.createElement('th')); // lewa kolumna: rok

            months.forEach((m) => {
                const th = document.createElement('th');
                th.textContent = m;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            years.forEach((year) => {
                const tr = document.createElement('tr');
                const yearCell = document.createElement('td');
                yearCell.textContent = year;
                tr.appendChild(yearCell);

                // paleta maroon
                // const gotColorPalette = [
                //     { max: 100, background: '#ffffff', color: 'black' },
                //     { max: 200, background: '#f5cccc', color: 'black' },
                //     { max: 400, background: '#ea9999', color: 'black' },
                //     { max: 600, background: '#e06666', color: 'white' },
                //     { max: 800, background: '#cc0000', color: 'white' },
                //     { max: 1000, background: '#990000', color: 'white' },
                //     { max: Infinity, background: '#800000', color: 'white' },
                // ];

                // paleta blue
                // const gotColorPalette = [
                //     { max: 100, background: '#ffffff', color: 'black' },
                //     { max: 200, background: '#c9daf8', color: 'black' },
                //     { max: 400, background: '#a4c2f4', color: 'black' },
                //     { max: 600, background: '#6d9eeb', color: 'white' },
                //     { max: 800, background: '#3c78d8', color: 'white' },
                //     { max: 1000, background: '#1155cc', color: 'white' },
                //     { max: Infinity, background: '#1c4587', color: 'white' },
                // ];

                // paleta green
                const gotColorPalette = [
                    { max: 100, background: '#ffffff', color: 'black' },
                    { max: 200, background: '#d9ead3', color: 'black' },
                    { max: 400, background: '#b6d7a8', color: 'black' },
                    { max: 600, background: '#93c47d', color: 'black' },
                    { max: 800, background: '#6aa84f', color: 'white' },
                    { max: 1000, background: '#38761d', color: 'white' },
                    { max: Infinity, background: '#274e13', color: 'white' },
                ];

                cumulativeGOT[year].forEach((val) => {
                    const td = document.createElement('td');
                    td.textContent = val != null ? val.toFixed(2) : '';
                    if (val != null) {
                        const got = val;
                        const palette = gotColorPalette.find((p) => got <= p.max);
                        td.style.backgroundColor = palette.background;
                        td.style.color = palette.color;
                    }

                    tr.appendChild(td);
                });

                tbody.appendChild(tr);
            });

            table.appendChild(tbody);
            table.style.fontFamily = "'Oswald', sans-serif";
            container.appendChild(table);
        })
        .catch((err) => {
            document.getElementById('gotTableContainer').textContent = 'Błąd wczytywania danych.';
            console.error(err);
        });
});
