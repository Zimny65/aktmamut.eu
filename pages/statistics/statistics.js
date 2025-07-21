document.addEventListener('DOMContentLoaded', () => {
    fetch('/pages/expeditions/expeditions.geojson')
        .then((res) => res.json())
        .then((data) => {
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const years = Array.from({ length: 11 }, (_, i) => 2015 + i); // 2015–2025

            // [rok][dekada] = suma GOT (36 kolumn: 12 mies. * 3 dekady)
            const decadalGOT = {};
            years.forEach((y) => {
                decadalGOT[y] = Array(36).fill(0);
            });

            data.features.forEach((f) => {
                const got = parseFloat(f.properties.got || '0');
                const date = f.properties.date;
                if (!date || isNaN(got)) return;

                const [yearStr, monthStr, dayStr] = date.split('-');
                const year = parseInt(yearStr);
                const month = parseInt(monthStr) - 1;
                const day = parseInt(dayStr);

                if (!decadalGOT[year] || month < 0 || month > 11 || day < 1 || day > 31) return;

                let decade = 0;
                if (day <= 10) decade = 0;
                else if (day <= 20) decade = 1;
                else decade = 2;

                const index = month * 3 + decade;
                decadalGOT[year][index] += got;
            });

            // Zamiana na wartości skumulowane
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth(); // 0-based
            const currentDay = today.getDate();

            let maxIndex = 35; // dla pełnych lat
            if (years.includes(currentYear)) {
                let decade = 0;
                if (currentDay <= 10) decade = 0;
                else if (currentDay <= 20) decade = 1;
                else decade = 2;
                maxIndex = currentMonth * 3 + decade;
            }

            years.forEach((year) => {
                for (let i = 1; i < 36; i++) {
                    if (year === currentYear && i > maxIndex) {
                        decadalGOT[year][i] = null; // nie pokazuj po dzisiejszej dacie
                    } else {
                        if (decadalGOT[year][i - 1] != null) decadalGOT[year][i] += decadalGOT[year][i - 1];
                    }
                }
            });

            // Generowanie transponowanej tabeli HTML
            const container = document.getElementById('gotTableContainer');
            container.innerHTML = '';

            const table = document.createElement('table');
            table.className = 'monotable';
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headerRow.appendChild(document.createElement('th')); // lewa kolumna: miesiąc+dekada

            years.forEach((y) => {
                const th = document.createElement('th');
                th.textContent = y;
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');

            // paleta green
            const gotColorPalette = [
                { max: 0, background: '#ffffff', color: 'black' },
                { max: 100, background: '#eef7eb', color: 'black' },
                { max: 200, background: '#d9ead3', color: 'black' },
                { max: 400, background: '#b6d7a8', color: 'black' },
                { max: 600, background: '#93c47d', color: 'black' },
                { max: 800, background: '#6aa84f', color: 'black' },
                { max: 1000, background: '#38761d', color: 'white' },
                { max: Infinity, background: '#274e13', color: 'white' },
            ];

            for (let i = 0; i < 36; i++) {
                const month = months[Math.floor(i / 3)];
                const dayLabels = ['days 01–10', 'days 11–20', 'days 21–31'];
                const decadeLabel = dayLabels[i % 3];
                const tr = document.createElement('tr');
                const labelCell = document.createElement('td');
                labelCell.textContent = `${month} ${decadeLabel}`;
                tr.appendChild(labelCell);

                years.forEach((year) => {
                    const val = decadalGOT[year][i];
                    const td = document.createElement('td');
                    td.textContent = val != null ? Math.round(val) : '';
                    if (val != null) {
                        const got = val;
                        const palette = gotColorPalette.find((p) => got <= p.max);
                        td.style.backgroundColor = palette.background;
                        td.style.color = palette.color;
                    }
                    tr.appendChild(td);
                });

                tbody.appendChild(tr);
            }

            table.appendChild(tbody);
            container.appendChild(table);
        })
        .catch((err) => {
            document.getElementById('gotTableContainer').textContent = 'Błąd wczytywania danych.';
            console.error(err);
        });
});
