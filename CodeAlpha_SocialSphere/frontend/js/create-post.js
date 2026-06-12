/* -------------------------------------------------------------
   SOCIALSPHERE CREATE POST PAGE ENGINE
   Handles dedicated post creation with media preview and
   redirects back to feed.html on successful submission.
   ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    // --- Set user avatar ---
    const avatarEl = document.getElementById("create-post-avatar");
    if (avatarEl) {
        avatarEl.src = currentUser.avatar;
        avatarEl.alt = currentUser.displayName;
    }

    // --- Simulated Image Attachment ---
    let attachedImageUrl = "";

    const unsplashPool = [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
        "https://images.unsplash.com/photo-1682686581580-d99b0230064e?w=800",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"
    ];

    const attachBtn = document.getElementById("create-attach-image-btn");
    const previewContainer = document.getElementById("create-media-preview");
    const previewImg = document.getElementById("create-media-preview-img");
    const cancelBtn = document.getElementById("create-cancel-media-btn");

    if (attachBtn) {
        attachBtn.addEventListener("click", () => {
            attachedImageUrl = unsplashPool[Math.floor(Math.random() * unsplashPool.length)];
            if (previewImg) previewImg.src = attachedImageUrl;
            if (previewContainer) previewContainer.style.display = "block";
            showToast("Image attached!", "success");
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            attachedImageUrl = "";
            if (previewContainer) previewContainer.style.display = "none";
            if (previewImg) previewImg.src = "";
        });
    }

    // --- Post Submission ---
    const submitBtn = document.getElementById("create-submit-btn");
    const textarea = document.getElementById("create-post-textarea");

    if (submitBtn && textarea) {
        submitBtn.addEventListener("click", () => {
            const content = textarea.value.trim();

            if (!content) {
                showToast("Please write something before posting!", "error");
                return;
            }

            // Create the post via API
            SocialSphereAPI.createPost(content, attachedImageUrl);
            showToast("Post published! 🎉 Redirecting…", "success");

            // Disable button to prevent double-submit
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.6";

            // Redirect to feed after a short delay
            setTimeout(() => {
                window.location.href = "feed.html";
            }, 1200);
        });

        // Also allow Ctrl+Enter to submit
        textarea.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                submitBtn.click();
            }
        });
    }
});
