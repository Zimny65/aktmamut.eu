const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.view;

        // views
        views.forEach((v) => v.classList.remove('active'));
        document.getElementById(`view-${target}`).classList.add('active');

        // nav
        navItems.forEach((n) => n.classList.remove('active'));
        btn.classList.add('active');
    });
});
