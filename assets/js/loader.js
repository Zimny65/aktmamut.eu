(function () {
    const version = window.APP_VERSION || '1';

    console.log('App version:', version);

    // ===== CSS =====
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;

        // tylko nasze lokalne CSS
        if (href.startsWith('/assets/css/') && !href.includes('?v=')) {
            link.href = `${href}?v=${version}`;
        }
    });

    // ===== JS =====
    document.querySelectorAll('script[src]').forEach((script) => {
        const src = script.getAttribute('src');
        if (!src) return;

        // pomijamy:
        // - app-version.js (bo to źródło version)
        // - loader.js (bo właśnie się wykonuje)

        if (
            src.startsWith('/') &&
            !src.includes('app-version.js') &&
            !src.includes('loader.js') &&
            !src.includes('://') && // wyklucza CDN
            !src.includes('?v=')
        ) {
            const newScript = document.createElement('script');
            newScript.src = `${src}?v=${version}`;
            newScript.defer = true;

            // zastępujemy oryginalny script
            script.parentNode.replaceChild(newScript, script);
        }
    });
})();
