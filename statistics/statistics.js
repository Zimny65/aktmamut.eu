document.addEventListener('DOMContentLoaded', () => {
    fetch('/expeditions/expeditions.geojson')
        .then((res) => res.json())
        .then((data) => {
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

            const dataYears = data.features
                .map((f) => {
                    const date = f.properties.date;
                    if (!date) return null;
                    const year = parseInt(date.split('-')[0], 10);
                    return Number.isFinite(year) ? year : null;
                })
                .filter((year) => year !== null);

            const minYear = dataYears.length ? Math.min(...dataYears) : new Date().getFullYear();
            const maxYear = dataYears.length ? Math.max(...dataYears) : new Date().getFullYear();

            const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

            const decadalGOT = {};
            years.forEach((y) => {
                decadalGOT[y] = Array.from({ length: 36 }, () => ({ sum: 0, records: [] }));
            });

            data.features.forEach((f) => {
                const got = parseFloat(f.properties.got || '0');
                const date = f.properties.date;
                if (!date || Number.isNaN(got)) return;

                const [yearStr, monthStr, dayStr] = date.split('-');
                const year = parseInt(yearStr, 10);
                const month = parseInt(monthStr, 10) - 1;
                const day = parseInt(dayStr, 10);

                if (!decadalGOT[year] || month < 0 || month > 11 || day < 1 || day > 31) return;

                const decade = day <= 10 ? 0 : day <= 20 ? 1 : 2;
                const index = month * 3 + decade;

                decadalGOT[year][index].sum += got;
                decadalGOT[year][index].records.push({
                    nr: f.properties.nr || '???',
                    date: date,
                    name: f.properties.name || '',
                    got: got,
                });
            });

            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth();
            const currentDay = today.getDate();
            let maxIndex = 35;

            if (years.includes(currentYear)) {
                const decade = currentDay <= 10 ? 0 : currentDay <= 20 ? 1 : 2;
                maxIndex = currentMonth * 3 + decade;
            }

            years.forEach((year) => {
                for (let i = 1; i < 36; i++) {
                    if (year === currentYear && i > maxIndex) {
                        decadalGOT[year][i].sum = null;
                    } else {
                        const prev = decadalGOT[year][i - 1];
                        const curr = decadalGOT[year][i];
                        if (prev.sum != null && curr.sum != null) {
                            curr.sum += prev.sum;
                        }
                    }
                }
            });

            const container = document.getElementById('gotTableContainer');
            container.innerHTML = '';
            container.style.setProperty('--years-count', years.length);

            const table = document.createElement('table');
            table.className = 'monotable';

            const colgroup = document.createElement('colgroup');

            const firstCol = document.createElement('col');
            firstCol.style.width = '88px';
            colgroup.appendChild(firstCol);

            years.forEach(() => {
                const col = document.createElement('col');
                col.style.width = `${100 / years.length}%`;
                colgroup.appendChild(col);
            });

            table.appendChild(colgroup);

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headerRow.appendChild(document.createElement('th'));

            years.forEach((y) => {
                const th = document.createElement('th');
                th.textContent = y;
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');

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
                const dayLabels = ['10', '20', '30'];
                const decadeLabel = dayLabels[i % 3];

                const tr = document.createElement('tr');

                const labelCell = document.createElement('td');
                labelCell.textContent = `${month} ${decadeLabel}`;
                tr.appendChild(labelCell);

                years.forEach((year) => {
                    const entry = decadalGOT[year][i];
                    const val = entry?.sum;
                    const td = document.createElement('td');

                    if (val != null && entry) {
                        const got = Math.round(val);
                        const palette = gotColorPalette.find((p) => got <= p.max);
                        td.style.backgroundColor = palette.background;
                        td.style.color = palette.color;

                        if (entry.records.length > 0) {
                            const tooltipHTML = `
  <table style="border-collapse: collapse; font-size: 0.85em;">
    <thead>
      <tr>
        <th style="padding: 4px 6px; background-color: #f0f0f0; color: black;">Nr</th>
        <th style="padding: 4px 6px; background-color: #f0f0f0; color: black;">Date</th>
        <th style="padding: 4px 6px; background-color: #f0f0f0; color: black;">Name</th>
        <th style="padding: 4px 6px; background-color: #f0f0f0; color: black; text-align: right;">GOT</th>
      </tr>
    </thead>
    <tbody>
      ${entry.records
          .map(
              (r) => `
        <tr>
          <td style="padding: 4px 6px; background-color: #f0f0f0; color: black;">${r.nr}</td>
          <td style="padding: 4px 6px; background-color: #f0f0f0; color: black;">${r.date}</td>
          <td style="padding: 4px 6px; background-color: #f0f0f0; color: black;">${r.name}</td>
          <td style="padding: 4px 6px; background-color: #f0f0f0; color: black; text-align: right;">${Number(r.got).toFixed(2)}</td>
        </tr>
      `
          )
          .join('')}
    </tbody>
  </table>
`;

                            const wrap = document.createElement('span');
                            wrap.className = 'cell-value';

                            const star = document.createElement('span');
                            star.className = 'cell-marker';
                            star.textContent = '✳';

                            const value = document.createElement('span');
                            value.textContent = got;

                            wrap.appendChild(star);
                            wrap.appendChild(value);
                            td.appendChild(wrap);

                            tippy(star, {
                                content: tooltipHTML,
                                allowHTML: true,
                                interactive: true,
                                placement: 'top',
                                theme: 'light-border',
                                maxWidth: 500,
                            });
                        } else {
                            td.textContent = got;
                        }
                    } else {
                        td.textContent = '';
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
