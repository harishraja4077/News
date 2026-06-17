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
                triggerSectionReveal(targetSection);
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
            e.stopPropagation();
            const card = e.currentTarget.closest('.user-bookmark-card');
            if (card) {
                card.style.transition = 'all 0.3s ease';
                card.style.transform = 'scale(0.9)';
                card.style.opacity = '0';
                setTimeout(() => {
                    card.remove();
                    showToast('Bookmark removed.', 'info');
                }, 300);
            }
        });
    });

    // 5. Toast Notification System
    const showToast = (message, type = 'success') => {
        let container = document.querySelector('.dash-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'dash-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `dash-toast ${type}`;

        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';
        if (type === 'error') icon = 'fa-exclamation-circle';

        toast.innerHTML = `
            <i class="fas ${icon} dash-toast-icon"></i>
            <div class="dash-toast-content">${message}</div>
        `;

        container.appendChild(toast);

        // Force reflow
        toast.offsetHeight;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    };

    // Expose showToast globally
    window.showToast = showToast;

    // 6. Stats Count-up & Stagger Animations Reveal Engine
    const animateStats = (container = document) => {
        const stats = container.querySelectorAll('.dash-stat-info h3, .css-donut-chart-label, .dash-analytics-highlight, .welcome-counter');
        stats.forEach(stat => {
            const text = stat.textContent.trim();
            // Match numbers (including commas, decimals, $, etc.)
            const match = text.match(/[\d,.]+/);
            if (!match) return;
            const originalVal = match[0];
            const cleanVal = parseFloat(originalVal.replace(/,/g, ''));
            if (isNaN(cleanVal)) return;

            const isInt = !originalVal.includes('.');
            const prefix = text.substring(0, text.indexOf(originalVal));
            const suffix = text.substring(text.indexOf(originalVal) + originalVal.length);

            let start = 0;
            const duration = 1000; // ms
            const startTime = performance.now();

            const updateNumber = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out quad
                const ease = progress * (2 - progress);
                const current = ease * cleanVal;

                if (isInt) {
                    stat.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
                } else {
                    stat.textContent = prefix + current.toFixed(1) + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    stat.textContent = text; // exact final value
                }
            };
            requestAnimationFrame(updateNumber);
        });
    };

    const triggerSectionReveal = (section) => {
        if (!section) return;

        // Reset and trigger stagger entrance
        const cards = section.querySelectorAll('.dash-stat-card, .dash-user-card, .dash-analytics-card, .dash-settings-card, .user-rec-card, .user-bookmark-card, .user-history-entry, .live-feed-panel, .dash-table-wrap');
        cards.forEach((card, index) => {
            card.style.animation = 'none';
            card.offsetHeight; // reflow
            card.style.animation = '';
            card.style.animationDelay = `${index * 0.05}s`;
        });

        // Run number counters
        animateStats(section);

        // Re-trigger progress bar width animation
        const fills = section.querySelectorAll('.dash-breakdown-fill');
        fills.forEach(fill => {
            const width = fill.getAttribute('data-width') || fill.style.width;
            if (!fill.getAttribute('data-width')) {
                fill.setAttribute('data-width', width);
            }
            fill.style.transition = 'none';
            fill.style.width = '0';
            fill.offsetHeight; // reflow
            setTimeout(() => {
                fill.style.transition = 'width 1s cubic-bezier(0.16, 1, 0.3, 1)';
                fill.style.width = width;
            }, 50);
        });
    };

    // Run initial on page load
    const initialActive = document.querySelector('.dash-section.active');
    if (initialActive) {
        triggerSectionReveal(initialActive);
    }

    // 7. Glassmorphic Modal Management
    const initModals = () => {
        const openBtns = document.querySelectorAll('[data-modal-target]');
        const closeBtns = document.querySelectorAll('.dash-modal-close, [data-modal-close]');
        const overlays = document.querySelectorAll('.dash-modal-overlay');

        openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSelector = btn.getAttribute('data-modal-target');
                const modal = document.querySelector(targetSelector);
                if (modal) {
                    modal.classList.add('open');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        const closeModal = (modal) => {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        };

        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = btn.closest('.dash-modal-overlay');
                if (modal) closeModal(modal);
            });
        });

        overlays.forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal(overlay);
            });
        });
    };
    initModals();

    // 8. Simulation Form Submissions with Toasts
    const newArticleForm = document.getElementById('form-new-article');
    if (newArticleForm) {
        newArticleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = newArticleForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';

            setTimeout(() => {
                const modal = newArticleForm.closest('.dash-modal-overlay');
                if (modal) {
                    modal.classList.remove('open');
                    document.body.style.overflow = '';
                }

                showToast('Article published successfully!', 'success');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                newArticleForm.reset();
            }, 1200);
        });
    }

    const editUserForm = document.getElementById('form-edit-user');
    if (editUserForm) {
        editUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = editUserForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            setTimeout(() => {
                const modal = editUserForm.closest('.dash-modal-overlay');
                if (modal) {
                    modal.classList.remove('open');
                    document.body.style.overflow = '';
                }

                showToast('User profile updated successfully!', 'success');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }, 1000);
        });
    }

    // 9. Follow Toggle for Authors
    const followBtns = document.querySelectorAll('.dash-user-card button');
    followBtns.forEach(btn => {
        if (btn.textContent.includes('Following') || btn.textContent.includes('Follow')) {
            btn.addEventListener('click', (e) => {
                const isFollowing = btn.classList.contains('following-active') || btn.textContent.includes('Following');
                if (isFollowing) {
                    btn.classList.remove('following-active');
                    btn.style.color = 'var(--primary)';
                    btn.style.borderColor = 'var(--primary)';
                    btn.innerHTML = '<i class="fas fa-plus"></i> Follow';
                    showToast('Unfollowed author.', 'info');
                } else {
                    btn.classList.add('following-active');
                    btn.style.color = '';
                    btn.style.borderColor = '';
                    btn.innerHTML = '<i class="fas fa-check"></i> Following';
                    showToast('You are now following this author!', 'success');
                }
            });
        }
    });

    // 10. Subscription Plan Toggle
    const planToggleWrap = document.querySelector('.sub-plan-toggle-wrap');
    if (planToggleWrap) {
        const toggleBtns = planToggleWrap.querySelectorAll('.sub-plan-toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const isAnnual = btn.getAttribute('data-plan') === 'annual';
                const billingDetail = document.querySelector('.user-sub-details');
                
                if (isAnnual) {
                    planToggleWrap.classList.add('annual-active');
                    showToast('Annual plan selected (20% Savings applied!)', 'info');
                    if (billingDetail) {
                        const items = billingDetail.querySelectorAll('.user-sub-detail-item strong');
                        if (items.length >= 3) {
                            items[1].innerHTML = '$86/year <span style="font-size:0.75rem; color:#10b981;">(Save 20%)</span>';
                            items[2].textContent = 'June 17, 2027';
                        }
                    }
                } else {
                    planToggleWrap.classList.remove('annual-active');
                    showToast('Monthly plan selected.', 'info');
                    if (billingDetail) {
                        const items = billingDetail.querySelectorAll('.user-sub-detail-item strong');
                        if (items.length >= 3) {
                            items[1].textContent = '$9/month';
                            items[2].textContent = 'July 14, 2026';
                        }
                    }
                }
            });
        });
    }

    // 11. Bookmarks Pills Category Filtering
    const filterPills = document.querySelectorAll('#section-bookmarks .filter-pill');
    const bookmarkCards = document.querySelectorAll('.user-bookmark-card');
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const category = pill.textContent.trim().toLowerCase();
            bookmarkCards.forEach(card => {
                const tag = card.querySelector('.category-tag');
                const tagText = tag ? tag.textContent.trim().toLowerCase() : '';

                if (category === 'all topics' || tagText === category) {
                    card.style.display = 'block';
                    card.style.animation = 'none';
                    card.offsetHeight; // reflow
                    card.style.animation = 'fadeInUp 0.4s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
            showToast(`Filtered by ${pill.textContent.trim()}`, 'info');
        });
    });

    // 12. Toast hooks for various simulated actions
    const saveSettingsBtns = document.querySelectorAll('.dash-settings-card button');
    saveSettingsBtns.forEach(btn => {
        if (!btn.getAttribute('onclick')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showToast('Settings saved successfully!', 'success');
            });
        }
    });

    const modActions = document.querySelectorAll('.dash-table-actions button');
    modActions.forEach(btn => {
        btn.addEventListener('click', () => {
            const tooltip = btn.getAttribute('data-tooltip') || 'Action';
            if (tooltip === 'Approve') showToast('Comment approved and restored.', 'success');
            if (tooltip === 'Delete') showToast('Comment flagged as deleted.', 'warning');
            if (tooltip === 'Ban User') showToast('User account successfully suspended.', 'error');
        });
    });

    // 13. Dynamic Live Activity Feed Generation for Admin Dashboard
    const feedList = document.querySelector('.live-feed-list');
    if (feedList) {
        const activities = [
            { text: "<strong>Elena Vance</strong> drafted a new article in Technology", time: "Just now", icon: "fa-pencil" },
            { text: "<strong>@john_reader</strong> subscribed to Premium Plan", time: "2 mins ago", icon: "fa-gem" },
            { text: "Comment flagged on 'Global Energy Shift' by <strong>@angry_reader</strong>", time: "5 mins ago", icon: "fa-flag" },
            { text: "<strong>Marcus Aurelius</strong> published a new Column in Politics", time: "12 mins ago", icon: "fa-globe" },
            { text: "Traffic spike detected on 'Rise of Artificial Intelligence'", time: "24 mins ago", icon: "fa-bolt" },
            { text: "New registration: <strong>@anna_chen</strong> (Subscriber)", time: "1 hour ago", icon: "fa-user-plus" }
        ];

        const createFeedItem = (act) => {
            const item = document.createElement('div');
            item.className = 'feed-item';
            item.innerHTML = `
                <div class="feed-item-icon"><i class="fas ${act.icon}"></i></div>
                <div class="feed-item-content">
                    <div>${act.text}</div>
                    <div class="feed-item-time">${act.time}</div>
                </div>
            `;
            return item;
        };

        // Populate initially
        activities.forEach(act => feedList.appendChild(createFeedItem(act)));

        // Periodically inject new activities
        const fakeUsers = ['@alex_dev', '@sarah_k', '@crypto_guru', '@opinionated_soul', '@nature_lover'];
        const fakeActions = [
            { text: "bookmarked 'Markets Experience Volatility'", icon: "fa-bookmark" },
            { text: "shared 'Sustainable Architecture' to Twitter", icon: "fa-share-nodes" },
            { text: "liked 'AI Soccer Game: Future of Sports'", icon: "fa-thumbs-up" },
            { text: "updated reading font preferences", icon: "fa-font" }
        ];

        setInterval(() => {
            if (document.getElementById('section-overview').classList.contains('active')) {
                const user = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
                const action = fakeActions[Math.floor(Math.random() * fakeActions.length)];
                const newAct = {
                    text: `<strong>${user}</strong> ${action.text}`,
                    time: "Just now",
                    icon: action.icon
                };

                const firstItem = feedList.firstElementChild;
                const newItem = createFeedItem(newAct);
                
                feedList.insertBefore(newItem, firstItem);
                if (feedList.children.length > 8) {
                    feedList.lastElementChild.remove();
                }
            }
        }, 12000);
    }
});

