document.addEventListener('DOMContentLoaded', async () => {
    const mount = document.getElementById('headerMount');
    if (!mount) return;

    const version = window.APP_VERSION || '1';

    const res = await fetch(`/assets/components/header.html?v=${version}`);
    const html = await res.text();
    mount.innerHTML = html;

    const mode = mount.dataset.mode || 'menu';
    const right = document.getElementById('headerRight');
    const brand = mount.querySelector('.brand');

    if (brand) {
        brand.setAttribute('href', '/index.html');
        brand.setAttribute('title', 'Back to homepage');
    }

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
            <a class="header-icon-link" href="/index.html" title="Back to homepage" aria-label="Back to homepage">
                // <svg viewBox="0 0 24 24" class="header-icon" aria-hidden="true">
                //     <path d="M15 6l-6 6 6 6"
                //           fill="none"
                //           stroke="currentColor"
                //           stroke-width="1.9"
                //           stroke-linecap="round"
                //           stroke-linejoin="round"></path>
                // </svg>
                <svg viewBox="0 0 24 24" class="header-icon" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.9"
                        stroke-linecap="round"
                        stroke-linejoin="round"></path>
                    <path d="M19 6l-6 6 6 6"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.9"
                        stroke-linecap="round"
                        stroke-linejoin="round"></path>
                </svg>
            </a>
        `;
    }

    if (mode === 'back-challenges') {
        right.innerHTML = `
            <a class="header-icon-link" href="/challenges/list.html" title="Back to Challenges" aria-label="Back to Challenges">
                <svg viewBox="0 0 24 24" class="header-icon" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.9"
                          stroke-linecap="round"
                          stroke-linejoin="round"></path>
                </svg>
            </a>
        `;
    }
});
