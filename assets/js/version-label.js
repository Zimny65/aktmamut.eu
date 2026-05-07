document.addEventListener('DOMContentLoaded', () => {
    const version = window.APP_VERSION;
    if (!version) return;

    const label = document.createElement('div');
    label.className = 'version-label';
    label.textContent = `v${version}`;

    document.body.appendChild(label);
});
