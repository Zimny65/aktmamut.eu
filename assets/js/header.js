document.addEventListener('DOMContentLoaded', async () => {
    const mount = document.getElementById('headerMount');
    if (!mount) return;

    // wczytaj HTML headera
    const res = await fetch('/assets/components/header.html');
    const html = await res.text();
    mount.innerHTML = html;

    // ustaw prawa strona (menu lub back)
    const mode = mount.dataset.mode || 'menu';
    const right = document.getElementById('headerRight');

    if (!right) return;

    if (mode === 'menu') {
        right.innerHTML = `
        <nav class="header-nav">
            <a href="/expeditions">Expeditions</a>
            <a href="/challenges/list.html">Challenges</a>
            <a href="/statistics">Statistics</a>
        </nav>
    `;
    }

    if (mode === 'back-home') {
        right.innerHTML = `
            <a class="header-back" href="/index.html">← Back to homepage</a>
        `;
    }

    if (mode === 'back-challenges') {
        right.innerHTML = `
            <a class="header-back" href="/challenges/list.html">← Back to Challenges</a>
        `;
    }
});
