document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. STICKY HEADER & ACTIVE LINK HANDLING
    // ==========================================
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a, nav a');

    // Auth Check for Navigation
    const authData = JSON.parse(localStorage.getItem('stacklyAuth') || 'null');
    const isLoggedIn = authData && authData.loggedIn;

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }

        // Change "Log In" to "Dashboard"
        if (href === 'login.html' && isLoggedIn) {
            link.textContent = 'Dashboard';
            link.setAttribute('href', authData.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html');
        }
    });

    // ==========================================
    // 2. THEME SWITCHER (DARK / LIGHT MODE)
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeIcon) {
            themeIcon.className = 'fas fa-moon';
        }
    } else {
        document.body.classList.remove('light-mode');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');

            if (themeIcon) {
                // Spin transition
                themeIcon.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    themeIcon.style.transform = 'none';
                }, 300);

                themeIcon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
            }

            // Dispatch custom event for secondary charts/elements if needed
            window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: isLight ? 'light' : 'dark' } }));
        });
    }

    // ==========================================
    // 3. MOBILE MENU TOGGLE
    // ==========================================
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('nav');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ==========================================
    // 4. SEARCH OVERLAY
    // ==========================================
    const openSearchBtn = document.getElementById('open-search');
    const closeSearchBtn = document.getElementById('close-search');
    const searchOverlay = document.getElementById('search-overlay');
    const searchOverlayInput = searchOverlay ? searchOverlay.querySelector('input') : null;

    if (openSearchBtn && searchOverlay) {
        openSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            searchOverlay.classList.add('active');
            if (searchOverlayInput) {
                setTimeout(() => searchOverlayInput.focus(), 100);
            }
        });
    }

    if (closeSearchBtn && searchOverlay) {
        closeSearchBtn.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });

        // Close on Esc key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
            }
        });
    }

    // ==========================================
    // 5. TICKER DUPLICATION FOR SMOOTH LOOPING
    // ==========================================
    const ticker = document.querySelector('.ticker');
    if (ticker) {
        const items = ticker.innerHTML;
        // Repeat it twice to ensure infinite scroll is smooth
        ticker.innerHTML = items + items + items;
    }

    // ==========================================
    // 6. BLOG FILTERING & SEARCH & DETAIL MODAL
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const blogCards = document.querySelectorAll('.blog-feed .article-card');
    const searchInput = document.getElementById('blog-search');

    let currentCategory = 'all';
    let searchQuery = '';

    function filterArticles() {
        blogCards.forEach(card => {
            const category = card.getAttribute('data-category') || '';
            const title = card.querySelector('.article-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.article-text').textContent.toLowerCase();

            const categoryMatch = (currentCategory === 'all' || category === currentCategory);
            const searchMatch = (title.includes(searchQuery) || excerpt.includes(searchQuery));

            if (categoryMatch && searchMatch) {
                card.style.display = 'flex';
                // Add minor fade/scale transition
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
            }
        });
    }

    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.getAttribute('data-filter') || 'all';
                filterArticles();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            filterArticles();
        });
    }

    // ==========================================
    // 7. ARTICLE DETAIL DRAWER/MODAL SYSTEM
    // ==========================================
    const articleModal = document.getElementById('article-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');

    // Elements inside modal
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');
    const modalContent = document.getElementById('modal-content');

    // Sample article database (content simulation)
    const articlesData = {
        1: {
            title: "The Rise of Artificial Intelligence in Modern Journalism",
            category: "Technology",
            date: "June 14, 2026",
            author: "Elena Vance",
            img: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=1000",
            body: `<p>In recent years, artificial intelligence has ceased to be a futuristic concept and has become an integral part of newsrooms worldwide. From automated earnings reports to algorithmic transcription and translation, AI is changing how journalists collect and distribute stories.</p>
                   <p>However, the integration of generative models raises vital questions regarding editorial oversight. Editors argue that while AI tools dramatically cut down draft drafting times, they lack the nuanced ethical understanding required to handle sensitive geopolitical developments.</p>
                   <p>Looking ahead, we can expect hybrid newsrooms where human reporters collaborate with dedicated machine intelligence layers to produce deep, data-driven investigative pieces faster than ever.</p>`
        },
        2: {
            title: "Markets Experience Volatility Amid Geopolitical Shifts",
            category: "Business",
            date: "June 13, 2026",
            author: "Marcus Aurelius",
            img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000",
            body: `<p>Global markets faced high volatility this week following the announcement of newly revised trade regulations. Technology and manufacturing stocks experienced sharp corrections, while green energy indices rallied to record highs.</p>
                   <p>Market analysts recommend diversification as central banks signal shifting interest rates. "We are transitioning into a high-volatility regime driven by supply chain rewiring and automation tailwinds," explained one prominent asset strategist.</p>
                   <p>Investors are advised to track emerging industrial hubs closely. Commodity prices are also expected to see fluctuations, adding pressure on manufacturing chains globally.</p>`
        },
        3: {
            title: "Championship Finals: Underdog Claims the Historic Victory",
            category: "Sports",
            date: "June 12, 2026",
            author: "Sarah Jenkins",
            img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1000",
            body: `<p>In one of the most thrilling matches in tournament history, the underdogs secured a 3-2 victory in the dying minutes of extra time. Fans across the stadium erupted as the winning goal curved beautifully past the keeper.</p>
                   <p>The champion's coach attributed the success to rigorous team cohesion and a tactical shift executed during the second half. "No one believed we could survive the qualifiers, let alone raise this trophy. This victory belongs to the fans who stayed by us," they remarked.</p>
                   <p>The team is set to hold a celebratory parade tomorrow morning in the city center, expecting thousands of local supporters to join.</p>`
        },
        4: {
            title: "Next-Gen Quantum Computing: Reaching the Milestones",
            category: "Technology",
            date: "June 11, 2026",
            author: "Elena Vance",
            img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000",
            body: `<p>Quantum computation is breaking boundaries as scientists achieve room-temperature coherence for extended durations. This breakthrough could accelerate data processing in fields ranging from molecular simulation to heavy cryptography.</p>
                   <p>Commercial application firms are already bidding for early architecture access. While large-scale deployment is still a few years out, these milestones solidify quantum's trajectory as the next era of industrial calculation.</p>`
        },
        5: {
            title: "Sustainable Architecture: Redefining Metropolitan Skyscrapers",
            category: "Lifestyle",
            date: "June 10, 2026",
            author: "David Stone",
            img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000",
            body: `<p>Urban planners are championing carbon-neutral skyscraper concepts. These structures feature vertically integrated solar panels, rainwater harvesting channels, and forest terraces that help absorb city carbon loads.</p>
                   <p>By blending flora with cutting-edge engineering, these sustainable designs reduce local temperature islands and boost air quality for tenants. Major cities are currently debating tax credits for developers implementing these biophilic standards.</p>`
        },
        6: {
            title: "The Shift in Global Energy: Transitioning to Clean Power Grid",
            category: "Politics",
            date: "June 09, 2026",
            author: "Marcus Aurelius",
            img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1000",
            body: `<p>Governments have committed to accelerating clean grid upgrades under a newly signed global pact. Major investments will target offshore wind clusters and regional battery storage hubs.</p>
                   <p>Critics highlight the enormous funding required for transmission line expansions, but proponents maintain that avoiding environmental degradation far outweighs infrastructure costs.</p>`
        }
    };

    function openArticle(articleId) {
        const article = articlesData[articleId];
        if (!article) return;

        if (modalImg) modalImg.src = article.img;
        if (modalTitle) modalTitle.textContent = article.title;
        if (modalMeta) modalMeta.innerHTML = `<i class="far fa-user"></i> By ${article.author} &nbsp;&nbsp;&bull;&nbsp;&nbsp; <i class="far fa-calendar"></i> ${article.date} &nbsp;&nbsp;&bull;&nbsp;&nbsp; <i class="far fa-folder"></i> ${article.category}`;
        if (modalContent) modalContent.innerHTML = article.body;

        if (articleModal) articleModal.classList.add('active');
        if (modalOverlay) modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent main page scrolling
    }

    function closeArticleModal() {
        if (articleModal) articleModal.classList.remove('active');
        if (modalOverlay) modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Bind card click event to trigger modal (both in index.html and blog.html)
    const cardsToBind = document.querySelectorAll('.article-card[data-id], .sidebar-card[data-id]');
    cardsToBind.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Prevent if clicked an internal link like author or category tags specifically
            if (e.target.tagName === 'A' || e.target.classList.contains('category-tag')) {
                return;
            }
            const articleId = card.getAttribute('data-id');
            openArticle(articleId);
        });
    });

    if (modalClose) modalClose.addEventListener('click', closeArticleModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeArticleModal);

    // ==========================================
    // 8. PRICING TOGGLE (MONTHLY VS YEARLY)
    // ==========================================
    const pricingCheckbox = document.getElementById('billing-toggle');
    const freePriceSpan = document.getElementById('free-price');
    const premiumPriceSpan = document.getElementById('premium-price');
    const enterprisePriceSpan = document.getElementById('enterprise-price');

    if (pricingCheckbox) {
        pricingCheckbox.addEventListener('change', () => {
            const isYearly = pricingCheckbox.checked;

            if (isYearly) {
                if (premiumPriceSpan) {
                    animatePriceChange(premiumPriceSpan, 99);
                    const period = premiumPriceSpan.closest('.tier-price').querySelector('p');
                    if (period) period.textContent = 'billed annually ($8.25/mo)';
                }
                if (enterprisePriceSpan) {
                    animatePriceChange(enterprisePriceSpan, 299);
                    const period = enterprisePriceSpan.closest('.tier-price').querySelector('p');
                    if (period) period.textContent = 'billed annually ($24.91/mo)';
                }
            } else {
                if (premiumPriceSpan) {
                    animatePriceChange(premiumPriceSpan, 9);
                    const period = premiumPriceSpan.closest('.tier-price').querySelector('p');
                    if (period) period.textContent = 'per month';
                }
                if (enterprisePriceSpan) {
                    animatePriceChange(enterprisePriceSpan, 29);
                    const period = enterprisePriceSpan.closest('.tier-price').querySelector('p');
                    if (period) period.textContent = 'per month';
                }
            }
        });
    }

    function animatePriceChange(element, targetPrice) {
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0.5';
        setTimeout(() => {
            element.textContent = targetPrice;
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        }, 150);
    }

    // ==========================================
    // 9. FAQ ACCORDION
    // ==========================================
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const body = item.querySelector('.accordion-body');
            const isActive = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.accordion-body').style.maxHeight = null;
            });

            // If it wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
                body.style.maxHeight = body.scrollHeight + "px";
            }
        });
    });

    // ==========================================
    // 10. LOGIN, SIGNUP & ROLE TOGGLE LOGIC
    // ==========================================
    const registerToggle = document.getElementById('toggle-to-register');
    const loginToggle = document.getElementById('toggle-to-login');
    const authContainer = document.getElementById('auth-container');

    if (registerToggle && authContainer) {
        registerToggle.addEventListener('click', (e) => {
            e.preventDefault();
            authContainer.classList.add('flip');
        });
    }

    if (loginToggle && authContainer) {
        loginToggle.addEventListener('click', (e) => {
            e.preventDefault();
            authContainer.classList.remove('flip');
        });
    }

    // Role Toggles
    const roleToggleWraps = document.querySelectorAll('.role-toggle-wrap');
    roleToggleWraps.forEach(wrap => {
        const btns = wrap.querySelectorAll('.role-toggle-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    });

    // Toggle Password Visibility
    const togglePassBtn = document.getElementById('toggle-pass-visibility');
    const loginPass = document.getElementById('login-pass');
    if (togglePassBtn && loginPass) {
        togglePassBtn.addEventListener('click', () => {
            const type = loginPass.getAttribute('type') === 'password' ? 'text' : 'password';
            loginPass.setAttribute('type', type);
            togglePassBtn.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    }

    // Login Submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const pass = document.getElementById('login-pass').value.trim();
            const errorDiv = document.getElementById('login-error');
            const submitBtn = document.getElementById('login-submit-btn');
            
            // Get selected role
            const frontSide = loginForm.closest('.auth-side-front');
            const activeRoleBtn = frontSide.querySelector('.role-toggle-btn.active');
            const role = activeRoleBtn ? activeRoleBtn.getAttribute('data-role') : 'user';

            if (errorDiv) errorDiv.style.display = 'none';
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
                submitBtn.disabled = true;
            }

            setTimeout(() => {
                // Hardcoded demo credentials validation
                let valid = false;
                if (role === 'admin' && email === 'admin@gmail.com' && pass === 'admin123') {
                    valid = true;
                } else if (role === 'user' && email === 'user@gmail.com' && pass === 'user123') {
                    valid = true;
                }

                if (valid) {
                    localStorage.setItem('stacklyAuth', JSON.stringify({
                        loggedIn: true,
                        role: role,
                        email: email
                    }));
                    window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
                } else {
                    if (errorDiv) errorDiv.style.display = 'flex';
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                        submitBtn.disabled = false;
                    }
                }
            }, 800);
        });
    }

    // ==========================================
    // 11. FORM VALIDATION & TOAST ALERT SYSTEM
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    function showToast(message, iconClass = 'fas fa-check-circle') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
        toastContainer.appendChild(toast);

        // Force a reflow to trigger animation
        toast.offsetHeight;
        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Basic fields check
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const msg = document.getElementById('form-message').value.trim();

            if (!name || !email || !msg) {
                showToast('Please fill out all required fields.', 'fas fa-exclamation-circle');
                return;
            }

            // Simulate server request
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            setTimeout(() => {
                showToast('Thank you! Your message has been sent successfully.', 'fas fa-check-circle');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }, 1200);
        });
    }

    // Newsletter footer form submit
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            if (emailInput && emailInput.value.trim()) {
                showToast('Successfully subscribed to Stackly Weekly!', 'fas fa-envelope-open-text');
                emailInput.value = '';
            } else {
                showToast('Please enter a valid email address.', 'fas fa-exclamation-circle');
            }
        });
    });

    // ==========================================
    // 12. DYNAMIC MILESTONE/COUNTER EFFECT
    // ==========================================
    // Run simple animations for count stats on load
    const statCounters = document.querySelectorAll('.tier-price span');

    // ==========================================
    // 13. INTERACTIVE POLL FUNCTIONALITY
    // ==========================================
    const pollButtons = document.querySelectorAll('.poll-option-btn');

    pollButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const container = btn.closest('.poll-options');
            if (!container) return;

            const buttons = container.querySelectorAll('.poll-option-btn');

            buttons.forEach(b => {
                b.classList.add('voted');
                const percent = b.getAttribute('data-percent');
                const fill = b.querySelector('.poll-bg-fill');
                if (fill) {
                    fill.style.width = percent + '%';
                }
            });

            // Show toast for thank you
            if (typeof showToast === 'function') {
                showToast('Thank you for voting! Your opinion has been registered.', 'fas fa-vote-yea');
            }
        });
    });
});

