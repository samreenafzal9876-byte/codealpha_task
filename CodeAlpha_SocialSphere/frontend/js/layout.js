/* -------------------------------------------------------------
   SOCIALSPHERE COMMON LAYOUT INJECTOR & ENGINE
   Dynamically injects Header, Sidebar, and Mobile Menus.
   Manages Global UI themes, search routes, and Toast system.
   ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial State Checks
    const currentUser = db.getCurrentUser();
    
    // Redirect logic for protected pages
    const publicPages = ["index.html", "login.html", "register.html"];
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    
    if (!currentUser && !publicPages.includes(currentPage)) {
        window.location.href = "login.html";
        return;
    }
    
    if (currentUser && publicPages.includes(currentPage) && currentPage !== "index.html") {
        window.location.href = "feed.html";
        return;
    }

    // 2. Load UI settings (Theme & Colors)
    applySavedThemeSettings();

    // 3. Inject Layout Elements if #app-layout is present
    const appLayout = document.getElementById("app-layout");
    if (appLayout && !appLayout.classList.contains("full-width")) {
        injectLayout(currentUser);
    }
});

// -------------------------------------------------------------
// DYNAMIC INJECTIONS
// -------------------------------------------------------------
function injectLayout(user) {
    const appLayout = document.getElementById("app-layout");
    const currentPage = window.location.pathname.split("/").pop() || "feed.html";
    
    // Get notifications count
    const unreadCount = SocialSphereAPI.getNotificationsForUser().filter(n => !n.read).length;
    const badgeHTML = unreadCount > 0 ? `<span class="badge">${unreadCount}</span>` : "";

    // A. INJECT TOP NAVBAR
    const header = document.createElement("header");
    header.className = "top-navbar";
    header.innerHTML = `
        <div class="logo-container">
            <a href="feed.html" style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-circle-nodes"></i>
                <span>SocialSphere</span>
            </a>
        </div>
        <div class="nav-search">
            <i class="fa-solid fa-magnifying-glass" style="color:var(--text-muted);"></i>
            <input type="text" id="global-search-input" placeholder="Search posts or topics..." value="${getSearchQuery()}">
        </div>
        <div class="nav-actions">
            <a href="create-post.html" class="icon-btn" title="Create Post">
                <i class="fa-solid fa-plus"></i>
            </a>
            <a href="notifications.html" class="icon-btn" title="Notifications">
                <i class="fa-regular fa-bell"></i>
                ${badgeHTML}
            </a>
            <div class="profile-trigger" id="profile-dropdown-trigger" onclick="window.location.href='profile.html'">
                <img src="${user.avatar}" alt="${user.displayName}" class="avatar">
            </div>
            <div class="mobile-toggle" id="mobile-drawer-toggle">
                <i class="fa-solid fa-bars"></i>
            </div>
        </div>
    `;
    appLayout.prepend(header);

    // B. INJECT LEFT SIDEBAR
    const sidebar = document.createElement("aside");
    sidebar.className = "sidebar-left";
    sidebar.innerHTML = `
        <ul class="sidebar-menu">
            <li>
                <a href="feed.html" class="sidebar-link ${currentPage === 'feed.html' ? 'active' : ''}">
                    <i class="fa-solid fa-house"></i>
                    <span>Feed</span>
                </a>
            </li>
            <li>
                <a href="notifications.html" class="sidebar-link ${currentPage === 'notifications.html' ? 'active' : ''}">
                    <i class="fa-solid fa-bell"></i>
                    <span>Notifications</span>
                </a>
            </li>
            <li>
                <a href="create-post.html" class="sidebar-link ${currentPage === 'create-post.html' ? 'active' : ''}">
                    <i class="fa-solid fa-square-plus"></i>
                    <span>Create Post</span>
                </a>
            </li>
            <li>
                <a href="profile.html" class="sidebar-link ${currentPage === 'profile.html' ? 'active' : ''}">
                    <i class="fa-solid fa-user"></i>
                    <span>Profile</span>
                </a>
            </li>
            <li>
                <a href="followers.html" class="sidebar-link ${currentPage === 'followers.html' ? 'active' : ''}">
                    <i class="fa-solid fa-users"></i>
                    <span>Followers</span>
                </a>
            </li>
            <li>
                <a href="following.html" class="sidebar-link ${currentPage === 'following.html' ? 'active' : ''}">
                    <i class="fa-solid fa-user-plus"></i>
                    <span>Following</span>
                </a>
            </li>
            <li>
                <a href="settings.html" class="sidebar-link ${currentPage === 'settings.html' ? 'active' : ''}">
                    <i class="fa-solid fa-gear"></i>
                    <span>Settings</span>
                </a>
            </li>
            <li style="margin-top: auto; padding-top: 40px;">
                <a href="#" id="logout-btn" class="sidebar-link">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>Logout</span>
                </a>
            </li>
        </ul>
    `;
    
    // Inject sidebar after header
    appLayout.insertBefore(sidebar, appLayout.children[1]);

    // C. INJECT MOBILE BOTTOM NAVIGATION BAR
    const bottomNav = document.createElement("nav");
    bottomNav.className = "mobile-bottom-nav";
    bottomNav.innerHTML = `
        <a href="feed.html" class="mobile-nav-link ${currentPage === 'feed.html' ? 'active' : ''}">
            <i class="fa-solid fa-house"></i>
            <span>Feed</span>
        </a>
        <a href="notifications.html" class="mobile-nav-link ${currentPage === 'notifications.html' ? 'active' : ''}">
            <i class="fa-solid fa-bell"></i>
            <span>Alerts</span>
        </a>
        <a href="create-post.html" class="mobile-nav-link ${currentPage === 'create-post.html' ? 'active' : ''}">
            <i class="fa-solid fa-plus-circle"></i>
            <span>Post</span>
        </a>
        <a href="profile.html" class="mobile-nav-link ${currentPage === 'profile.html' ? 'active' : ''}">
            <i class="fa-solid fa-user"></i>
            <span>Profile</span>
        </a>
    `;
    appLayout.appendChild(bottomNav);

    // D. CREATE MOBILE SIDEBAR OVERLAY
    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    appLayout.appendChild(overlay);

    // E. INJECT TOAST CONTAINER
    if (!document.getElementById("toast-container")) {
        const toastBox = document.createElement("div");
        toastBox.id = "toast-container";
        document.body.appendChild(toastBox);
    }

    // F. BIND RESPONSIVE BEHAVIORS AND EVENT LISTENERS
    bindLayoutEvents(sidebar, overlay);
}

// -------------------------------------------------------------
// EVENT BINDINGS
// -------------------------------------------------------------
function bindLayoutEvents(sidebar, overlay) {
    // Logout Action
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            SocialSphereAPI.logout();
            showToast("Logged out successfully!", "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
        });
    }

    // Mobile Hamburger Toggle
    const toggle = document.getElementById("mobile-drawer-toggle");
    if (toggle) {
        toggle.addEventListener("click", () => {
            sidebar.classList.add("active");
            overlay.classList.add("active");
        });
    }

    // Dismiss drawer when clicking overlay
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });

    // Global Search Submission
    const searchInput = document.getElementById("global-search-input");
    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const query = searchInput.value.trim();
                window.location.href = `feed.html?search=${encodeURIComponent(query)}`;
            }
        });
    }
}

// -------------------------------------------------------------
// THEME CONTROL UTILS
// -------------------------------------------------------------
function applySavedThemeSettings() {
    const config = JSON.parse(localStorage.getItem("sphereSettings")) || {
        theme: "dark",
        accent: "indigo"
    };

    // Apply Dark/Light theme class
    if (config.theme === "light") {
        document.body.classList.add("light-theme");
    } else {
        document.body.classList.remove("light-theme");
    }

    // Reset accent color classes
    document.body.classList.remove("theme-emerald", "theme-crimson", "theme-amber");
    if (config.accent !== "indigo") {
        document.body.classList.add(`theme-${config.accent}`);
    }
}

// Get Search query from current URL param
function getSearchQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
}

// -------------------------------------------------------------
// GLOBAL TOAST NOTIFICATIONS DISPATCHER
// -------------------------------------------------------------
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let iconClass = "fa-solid fa-circle-check";
    if (type === "error") iconClass = "fa-solid fa-triangle-exclamation";

    toast.innerHTML = `
        <i class="${iconClass}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}
