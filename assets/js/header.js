document.addEventListener('DOMContentLoaded', async () => {
    const mount = document.getElementById('headerMount');
    if (!mount) return;

    const version = window.APP_VERSION || '1';

    const res = await fetch(`/assets/components/header.html?v=${version}`);
    const html = await res.text();
    mount.innerHTML = html;

    const right = document.getElementById('headerRight');
    const brand = mount.querySelector('.brand');

    if (brand) {
        brand.setAttribute('href', '/index.html');
        brand.setAttribute('title', 'Back to homepage');
    }

    if (!right) return;

    right.innerHTML = `
        <nav class="header-nav">
            <a href="/index.html">Home</a>
            <a href="/expeditions">Expeditions</a>
            <a href="/challenges/list.html">Challenges</a>
            <a href="/statistics">Statistics</a>
        </nav>
    `;
});
