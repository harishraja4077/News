document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Guard & Logout
    const authData = JSON.parse(localStorage.getItem('stacklyAuth') || 'null');
    if (!authData || !authData.loggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Set User Name dynamically based on auth
    const sidebarUserName = document.getElementById('sidebar-user-name');
    const welcomeName = document.getElementById('user-welcome-name');
    
    if (sidebarUserName && authData.email) {
        sidebarUserName.textContent = authData.email.split('@')[0];
    }
    if (welcomeName && authData.email) {
        welcomeName.textContent = authData.email.split('@')[0];
    }

    const adminLogout = document.getElementById('admin-logout');
    const userLogout = document.getElementById('user-logout');

    const handleLogout = () => {
        localStorage.removeItem('stacklyAuth');
        window.location.href = 'login.html';
    };

    if (adminLogout) adminLogout.addEventListener('click', handleLogout);
    if (userLogout) userLogout.addEventListener('click', handleLogout);

    // 2. Sidebar Navigation Switching
    const navItems = document.querySelectorAll('.dash-nav-item');
    const sections = document.querySelectorAll('.dash-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = 'section-' + item.getAttribute('data-section');

            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            // Add active class to clicked nav and corresponding section
            item.classList.add('active');
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // On mobile, close sidebar after clicking
            if (window.innerWidth < 992) {
                const sidebar = document.getElementById('dash-sidebar');
                if (sidebar) sidebar.classList.remove('open');
            }
        });
    });

    // 3. Mobile Sidebar Toggle
    const menuToggleBtn = document.getElementById('dash-menu-toggle');
    const sidebar = document.getElementById('dash-sidebar');

    if (menuToggleBtn && sidebar) {
        menuToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // 4. Interactive Bookmarks (Simulated)
    const removeBookmarkBtns = document.querySelectorAll('.bookmark-remove-btn');
    removeBookmarkBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.currentTarget.closest('.user-bookmark-card');
            if (card) {
                card.style.transform = 'scale(0.9)';
                card.style.opacity = '0';
                setTimeout(() => {
                    card.remove();
                }, 300);
            }
        });
    });

    // 5. Analytics Bar Animation
    const breakdownFills = document.querySelectorAll('.dash-breakdown-fill');
    breakdownFills.forEach(fill => {
        const width = fill.style.width;
        fill.style.width = '0';
        setTimeout(() => {
            fill.style.transition = 'width 1s ease-out';
            fill.style.width = width;
        }, 500);
    });
});
