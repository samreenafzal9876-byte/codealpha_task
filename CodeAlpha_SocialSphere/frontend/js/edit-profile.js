/* -------------------------------------------------------------
   SOCIALSPHERE EDIT PROFILE PAGE CONTROLLER
   Handles loading current profile data into form fields,
   simulated image uploads, and saving profile edits.
   ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    // ─── Pre-fill Form Fields ───────────────────────────────────
    document.getElementById("edit-displayname").value = currentUser.displayName || "";
    document.getElementById("edit-bio").value = currentUser.bio || "";
    document.getElementById("edit-location").value = currentUser.location || "";
    document.getElementById("edit-website").value = currentUser.website || "";

    // ─── Set Image Previews ─────────────────────────────────────
    document.getElementById("banner-preview-img").src = currentUser.banner || "";
    document.getElementById("avatar-preview-img").src = currentUser.avatar || "";

    // ─── Simulated Banner Change ────────────────────────────────
    const changeBannerBtn = document.getElementById("change-banner-btn");
    changeBannerBtn.addEventListener("click", () => {
        // Simulate selecting a new banner with a random Unsplash image
        const bannerOptions = [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
            "https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=800",
            "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800"
        ];
        const currentSrc = document.getElementById("banner-preview-img").src;
        // Pick a different image from the options
        let newBanner = bannerOptions[Math.floor(Math.random() * bannerOptions.length)];
        while (newBanner === currentSrc && bannerOptions.length > 1) {
            newBanner = bannerOptions[Math.floor(Math.random() * bannerOptions.length)];
        }
        document.getElementById("banner-preview-img").src = newBanner;
        showToast("Banner image updated (preview)", "success");
    });

    // ─── Simulated Avatar Change ────────────────────────────────
    const changeAvatarBtn = document.getElementById("change-avatar-btn");
    changeAvatarBtn.addEventListener("click", () => {
        // Simulate selecting a new avatar with a random Unsplash image
        const avatarOptions = [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
        ];
        const currentSrc = document.getElementById("avatar-preview-img").src;
        let newAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
        while (newAvatar === currentSrc && avatarOptions.length > 1) {
            newAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
        }
        document.getElementById("avatar-preview-img").src = newAvatar;
        showToast("Profile photo updated (preview)", "success");
    });

    // ─── Save Profile Changes ───────────────────────────────────
    const saveBtn = document.getElementById("save-profile-btn");
    saveBtn.addEventListener("click", () => {
        const displayName = document.getElementById("edit-displayname").value.trim();
        const bio = document.getElementById("edit-bio").value.trim();
        const location = document.getElementById("edit-location").value.trim();
        const website = document.getElementById("edit-website").value.trim();
        const avatarUrl = document.getElementById("avatar-preview-img").src;
        const bannerUrl = document.getElementById("banner-preview-img").src;

        // Validation: display name is required
        if (!displayName) {
            showToast("Display name cannot be empty.", "error");
            document.getElementById("edit-displayname").focus();
            return;
        }

        // Call the API to save profile edits
        const updatedUser = SocialSphereAPI.editProfile(
            displayName,
            bio,
            location,
            website,
            avatarUrl,
            bannerUrl
        );

        if (updatedUser) {
            showToast("Profile updated successfully!", "success");
            // Redirect back to profile after a brief delay
            setTimeout(() => {
                window.location.href = "profile.html";
            }, 1200);
        } else {
            showToast("Failed to update profile. Please try again.", "error");
        }
    });
});
