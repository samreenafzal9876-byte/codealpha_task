/* -------------------------------------------------------------
   SOCIALSPHERE SETTINGS PAGE ENGINE
   Handles theme switching, color presets, toggle switches,
   and account actions. Persists settings to localStorage.
   ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    initializeSettings();
    bindThemeToggle();
    bindColorPresets();
    bindToggleSwitches();
    bindAccountActions();
});

/**
 * Loads saved settings from localStorage and applies the
 * correct active states to theme cards and color dots.
 */
function initializeSettings() {
    const config = getSavedSettings();

    // Set active theme card
    const activeThemeCard = document.querySelector(`.theme-card[data-theme="${config.theme}"]`);
    if (activeThemeCard) {
        activeThemeCard.classList.add("active");
    }

    // Set active color dot
    const activeColorDot = document.querySelector(`.color-dot[data-accent="${config.accent}"]`);
    if (activeColorDot) {
        activeColorDot.classList.add("active");
        // Show checkmark on active dot
        activeColorDot.innerHTML = '<i class="fa-solid fa-check" style="font-size:0.8rem;"></i>';
    }
}

/**
 * Returns the current settings object from localStorage,
 * falling back to sensible defaults.
 */
function getSavedSettings() {
    return JSON.parse(localStorage.getItem("sphereSettings")) || {
        theme: "dark",
        accent: "indigo"
    };
}

/**
 * Persists the given settings object to localStorage.
 */
function saveSettings(config) {
    localStorage.setItem("sphereSettings", JSON.stringify(config));
}

// -------------------------------------------------------------
// THEME SWITCHING (Dark / Light)
// -------------------------------------------------------------
function bindThemeToggle() {
    const themeCards = document.querySelectorAll(".theme-card");

    themeCards.forEach(card => {
        card.addEventListener("click", () => {
            const selectedTheme = card.dataset.theme;
            const config = getSavedSettings();

            // Skip if already selected
            if (config.theme === selectedTheme) return;

            // Update active visual state
            themeCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            // Apply theme class to body immediately
            if (selectedTheme === "light") {
                document.body.classList.add("light-theme");
            } else {
                document.body.classList.remove("light-theme");
            }

            // Save to localStorage
            config.theme = selectedTheme;
            saveSettings(config);

            showToast(`Switched to ${selectedTheme} mode.`, "success");
        });
    });
}

// -------------------------------------------------------------
// COLOR PRESET SWITCHING
// -------------------------------------------------------------
function bindColorPresets() {
    const colorDots = document.querySelectorAll(".color-dot");

    colorDots.forEach(dot => {
        dot.addEventListener("click", () => {
            const selectedAccent = dot.dataset.accent;
            const config = getSavedSettings();

            // Skip if already selected
            if (config.accent === selectedAccent) return;

            // Update active visual state
            colorDots.forEach(d => {
                d.classList.remove("active");
                d.innerHTML = "";
            });
            dot.classList.add("active");
            dot.innerHTML = '<i class="fa-solid fa-check" style="font-size:0.8rem;"></i>';

            // Remove all accent classes, then apply the new one
            document.body.classList.remove("theme-emerald", "theme-crimson", "theme-amber");
            if (selectedAccent !== "indigo") {
                document.body.classList.add(`theme-${selectedAccent}`);
            }

            // Save to localStorage
            config.accent = selectedAccent;
            saveSettings(config);

            showToast(`Accent color changed to ${selectedAccent}.`, "success");
        });
    });
}

// -------------------------------------------------------------
// TOGGLE SWITCHES
// -------------------------------------------------------------
function bindToggleSwitches() {
    const togglePrivate = document.getElementById("toggle-private");
    const toggleEmail = document.getElementById("toggle-email");
    const togglePush = document.getElementById("toggle-push");

    if (togglePrivate) {
        togglePrivate.addEventListener("change", () => {
            const state = togglePrivate.checked ? "enabled" : "disabled";
            showToast(`Private account ${state}.`, "success");
        });
    }

    if (toggleEmail) {
        toggleEmail.addEventListener("change", () => {
            const state = toggleEmail.checked ? "enabled" : "disabled";
            showToast(`Email notifications ${state}.`, "success");
        });
    }

    if (togglePush) {
        togglePush.addEventListener("change", () => {
            const state = togglePush.checked ? "enabled" : "disabled";
            showToast(`Push notifications ${state}.`, "success");
        });
    }
}

// -------------------------------------------------------------
// ACCOUNT ACTIONS (Logout, Delete, Change Password)
// -------------------------------------------------------------
function bindAccountActions() {
    // Change Password (Simulated)
    const changePassBtn = document.getElementById("change-password-btn");
    if (changePassBtn) {
        changePassBtn.addEventListener("click", () => {
            showToast("Password change is simulated in this demo.", "success");
        });
    }

    // Logout
    const logoutBtn = document.getElementById("logout-settings-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            SocialSphereAPI.logout();
            showToast("Logged out successfully!", "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
        });
    }

    // Delete Account (Simulated)
    const deleteBtn = document.getElementById("delete-account-btn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            const confirmed = confirm("Are you sure you want to delete your account? This action cannot be undone.");
            if (confirmed) {
                showToast("Account deletion is simulated in this demo.", "error");
            }
        });
    }
}
