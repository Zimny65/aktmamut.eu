function parseCSV(text) {
    // oczekujemy:
    // hour,temp_mean
    // 2026-01-01 00:00:00,-3.26
    const lines = text.trim().split(/\r?\n/);
    const out = [];
    for (let i = 1; i < lines.length; i++) {
        const [hourStr, tempStr] = lines[i].split(',');
        if (!hourStr || !tempStr) continue;

        // "YYYY-MM-DD HH:MM:SS" -> Date (lokalna)
        const iso = hourStr.replace(' ', 'T');
        const dt = new Date(iso);
        const temp = Number(tempStr);
        if (Number.isFinite(dt.getTime()) && Number.isFinite(temp)) {
            out.push({ dt, temp });
        }
    }
    return out;
}

function drawChart(canvas, data, title) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width,
        H = canvas.height;

    // margins
    const m = { l: 60, r: 20, t: 30, b: 45 };
    const pw = W - m.l - m.r;
    const ph = H - m.t - m.b;

    ctx.clearRect(0, 0, W, H);

    if (!data.length) {
        ctx.fillText('Brak danych', 20, 30);
        return;
    }

    const temps = data.map((d) => d.temp);
    const tMin = Math.min(...temps);
    const tMax = Math.max(...temps);

    const x0 = data[0].dt.getTime();
    const x1 = data[data.length - 1].dt.getTime();
    const span = Math.max(1, x1 - x0);

    const x = (dt) => m.l + ((dt.getTime() - x0) / span) * pw;
    const y = (temp) => {
        const denom = tMax - tMin || 1;
        return m.t + (1 - (temp - tMin) / denom) * ph;
    };

    // axes
    ctx.strokeStyle = '#999';
    ctx.beginPath();
    ctx.moveTo(m.l, m.t);
    ctx.lineTo(m.l, m.t + ph);
    ctx.lineTo(m.l + pw, m.t + ph);
    ctx.stroke();

    // y ticks
    ctx.fillStyle = '#333';
    ctx.font = '12px system-ui, Arial';
    const ticks = 6;
    for (let i = 0; i <= ticks; i++) {
        const tt = tMin + (i / ticks) * (tMax - tMin);
        const yy = y(tt);
        ctx.strokeStyle = '#eee';
        ctx.beginPath();
        ctx.moveTo(m.l, yy);
        ctx.lineTo(m.l + pw, yy);
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.fillText(tt.toFixed(1) + '°C', 8, yy + 4);
    }

    // line
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x(data[0].dt), y(data[0].temp));
    for (let i = 1; i < data.length; i++) {
        ctx.lineTo(x(data[i].dt), y(data[i].temp));
    }
    ctx.stroke();

    // title
    ctx.fillStyle = '#000';
    ctx.font = '16px system-ui, Arial';
    ctx.fillText(title, m.l, 20);

    // x labels (start/end)
    ctx.fillStyle = '#333';
    ctx.font = '12px system-ui, Arial';
    const fmt = (d) => {
        const yy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yy}-${mm}-${dd}`;
    };
    ctx.fillText(fmt(data[0].dt), m.l, H - 15);
    const endLabel = fmt(data[data.length - 1].dt);
    const wEnd = ctx.measureText(endLabel).width;
    ctx.fillText(endLabel, W - m.r - wEnd, H - 15);
}

async function loadAndDraw() {
    const station = document.getElementById('station').value.trim();
    const month = document.getElementById('month').value.trim(); // YYYY-MM
    const status = document.getElementById('status');
    const canvas = document.getElementById('chart');

    const url = `data/hourly_${station}_${month}.csv`;

    status.textContent = `Wczytuję: ${url} ...`;

    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const txt = await res.text();
        const data = parseCSV(txt);

        status.textContent = `OK: ${data.length} punktów (godzin).`;
        drawChart(canvas, data, `Stacja ${station} – ${month} – średnia godzinowa`);
    } catch (e) {
        status.textContent = `Błąd: ${String(e)} (czy plik istnieje: ${url} ?)`;
        drawChart(canvas, [], '');
    }
}

document.getElementById('load').addEventListener('click', loadAndDraw);
loadAndDraw();
