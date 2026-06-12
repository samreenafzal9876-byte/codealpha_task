/* -------------------------------------------------------------
   SOCIALSPHERE AUTHENTICATION HANDLER
   Intercepts registration and login forms to trigger API state.
   ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    // 1. LOGIN FORM HANDLER
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById("username").value;
            
            // Execute login via mock API
            const result = SocialSphereAPI.login(usernameInput);
            
            if (result.success) {
                showToast(`Welcome back, ${result.user.displayName}!`, "success");
                setTimeout(() => {
                    window.location.href = "feed.html";
                }, 1000);
            } else {
                showToast(result.message, "error");
            }
        });
    }

    // 2. REGISTER FORM HANDLER
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById("reg-name").value;
            const usernameInput = document.getElementById("reg-username").value;
            const emailInput = document.getElementById("reg-email").value;
            const passwordInput = document.getElementById("reg-password").value;
            const termsChecked = document.getElementById("reg-terms").checked;

            if (!termsChecked) {
                showToast("You must agree to the Terms of Service.", "error");
                return;
            }

            // Execute register via mock API
            const result = SocialSphereAPI.register(nameInput, usernameInput, emailInput);

            if (result.success) {
                showToast("Account created successfully!", "success");
                setTimeout(() => {
                    window.location.href = "feed.html";
                }, 1000);
            } else {
                showToast(result.message, "error");
            }
        });
    }
});
