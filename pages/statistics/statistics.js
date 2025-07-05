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

                cumulativeGOT[year].forEach((val) => {
                    const td = document.createElement('td');
                    td.textContent = val != null ? val.toFixed(2) : '';
                    if (val != null) {
                        const got = val;
                        if (got <= 100) {
                            td.style.backgroundColor = '#ffffff';
                        } else if (got <= 200) {
                            td.style.backgroundColor = '#f5cccc';
                        } else if (got <= 400) {
                            td.style.backgroundColor = '#ea9999';
                        } else if (got <= 600) {
                            td.style.backgroundColor = '#e06666';
                        } else if (got <= 800) {
                            td.style.backgroundColor = '#cc0000';
                            td.style.color = 'white'; // dla kontrastu
                        } else if (got <= 1000) {
                            td.style.backgroundColor = '#990000';
                            td.style.color = 'white'; // dla kontrastu
                        } else {
                            td.style.backgroundColor = '#800000';
                            td.style.color = 'white'; // dla kontrastu
                        }
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
