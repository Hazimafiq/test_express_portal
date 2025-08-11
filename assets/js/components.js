// Component loader utility
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;

        // Initialize component-specific functionality
        initializeNavRail();
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// Navigation rail functionality
function initializeNavRail() {
    // Wait for DOM elements to be loaded
    const navRail = document.querySelector('.nav-rail');
    const sideMenuArrow = document.getElementById('sideMenuArrow');
    const arrowIcon = sideMenuArrow?.querySelector('.arrow-icon');
    
    // Set active nav item based on current path
    const currentPath = window.location.pathname;
    console.log('[NavRail] Current path:', currentPath);
    // Top-level items
    document.querySelectorAll('.rail-btn').forEach(btn => {
        if (btn.getAttribute('href') === currentPath) {
            btn.classList.add('active');
        }
    });
    // Submenu items and their parent group
    document.querySelectorAll('.nav-dropdown .menu-item, .expanded-menu .menu-item').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
            const parentExpandable = link.closest('.nav-item.expandable');
            const groupBtn = parentExpandable?.querySelector('.rail-btn');
            if (groupBtn) groupBtn.classList.add('active');
        }
    });

    try {
        const chevronIconDefault = document.querySelector('.expandable-btn .chevron-icon');
        if (chevronIconDefault) {
            chevronIconDefault.src = '/assets/images/chevron-down-arrow.svg';
            chevronIconDefault.style.transition = 'transform 150ms ease';
            chevronIconDefault.style.transformOrigin = 'center center';
            console.debug('[NavRail] Set chevron default to down and added rotation transition');
        }
    } catch {}

    // Expandable menu functionality: only toggle when chevron is clicked
    const expandableBtn = document.querySelector('.expandable-btn');
    const expandableItem = document.querySelector('.nav-item.expandable');
    if (expandableBtn && expandableItem) {
        const chevronIcon = expandableBtn.querySelector('.chevron-icon');
        if (chevronIcon) {
            // Initialize rotation based on current state
            const isExpandedInit = expandableItem.classList.contains('expanded');
            chevronIcon.style.transform = isExpandedInit ? 'rotate(180deg)' : 'rotate(0deg)';
            console.debug('[NavRail] Chevron init. expanded=', isExpandedInit, ' transform=', chevronIcon.style.transform);

            chevronIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                expandableItem.classList.toggle('expanded');
                const isExpanded = expandableItem.classList.contains('expanded');
                chevronIcon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
                console.debug('[NavRail] Chevron clicked. expanded=', isExpanded, ' transform=', chevronIcon.style.transform);
            });
        }
    }

    // Side menu arrow functionality
    if (sideMenuArrow && arrowIcon) {
        const mainContent = document.querySelector('.main-content');
        
        sideMenuArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            navRail.classList.toggle('expanded');
            // Toggle expanded class on main content
            if (mainContent) {
                mainContent.classList.toggle('expanded');
            }
            // Rotate arrow icon 180 degrees when expanded
            arrowIcon.style.transform = navRail.classList.contains('expanded') ? 'rotate(180deg)' : '';
        });

        // Close expanded menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!navRail.contains(event.target) && navRail.classList.contains('expanded')) {
                navRail.classList.remove('expanded');
                if (mainContent) {
                    mainContent.classList.remove('expanded');
                }
                arrowIcon.style.transform = '';
            }
        });
    }

    // Language menu functionality
    const languageFab = document.getElementById('languageFab');
    const languageMenu = document.getElementById('languageMenu');
    const languageText = document.querySelector('.language-text');
    const flagPlaceholder = document.querySelector('.flag-placeholder img');
    
    if (languageFab && languageMenu) {
        languageFab.addEventListener('click', (e) => {
            e.stopPropagation();
            languageMenu.style.display = languageMenu.style.display === 'none' ? 'block' : 'none';
        });
        
        document.addEventListener('click', () => { 
            languageMenu.style.display = 'none'; 
        });
        
        document.querySelectorAll('.lang-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.lang-item').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Update the language display
                if (languageText) {
                    languageText.textContent = e.currentTarget.querySelector('span').textContent;
                }
                
                // Update the flag image
                if (flagPlaceholder) {
                    flagPlaceholder.src = e.currentTarget.querySelector('img').src;
                    flagPlaceholder.alt = e.currentTarget.querySelector('span').textContent;
                }
                
                languageMenu.style.display = 'none';
            });
        });
    }

    // User menu functionality
    const userBtn = document.getElementById('userBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (userBtn && userMenu) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
        });
        
        document.addEventListener('click', () => {
            userMenu.style.display = 'none';
        });
    }

    // Handle logout click
    const logoutBtn = document.querySelector('.logout-item');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    window.location.href = '/login';
                } else {
                    alert('Failed to logout');
                }
            } catch (error) {
                alert('Network error. Please try again.');
            }
        });
    }
}
