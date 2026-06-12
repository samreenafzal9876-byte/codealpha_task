/* -------------------------------------------------------------
   SOCIALSPHERE FOLLOWERS PAGE ENGINE
   Renders users who follow the current user with follow-back
   toggle functionality.
   ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    renderFollowers();
});

/**
 * Fetches follower IDs for the current user, resolves them to
 * user objects, and renders connection cards into the grid.
 */
function renderFollowers() {
    const currentUser = db.getCurrentUser();
    const followerIds = db.getFollowers(currentUser.id);
    const allUsers = db.getUsers();
    const following = db.getFollowing(currentUser.id);

    const container = document.getElementById("followers-container");
    const emptyState = document.getElementById("followers-empty");
    const title = document.getElementById("followers-title");

    // Update title with count
    title.textContent = `Followers (${followerIds.length})`;

    // Show empty state if no followers
    if (followerIds.length === 0) {
        container.style.display = "none";
        emptyState.style.display = "block";
        return;
    }

    container.style.display = "";
    emptyState.style.display = "none";

    // Resolve follower IDs to user objects
    const followers = followerIds
        .map(id => allUsers.find(u => u.id === id))
        .filter(Boolean);

    // Build HTML for each follower card
    container.innerHTML = followers.map(user => {
        const isFollowingBack = following.includes(user.id);
        const btnClass = isFollowingBack ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm";
        const btnText = isFollowingBack
            ? '<i class="fa-solid fa-check"></i> Following'
            : '<i class="fa-solid fa-user-plus"></i> Follow Back';

        return `
            <div class="connection-card" data-user-id="${user.id}">
                <div class="user-info-row">
                    <img src="${user.avatar}" alt="${user.displayName}" class="user-avatar-sm">
                    <div class="user-names">
                        <a href="profile.html?id=${user.id}" class="user-displayname">${user.displayName}</a>
                        <span class="user-username">@${user.username}</span>
                    </div>
                </div>
                <button class="${btnClass} follow-toggle-btn" data-target-id="${user.id}">
                    ${btnText}
                </button>
            </div>
        `;
    }).join("");

    // Bind follow toggle events
    bindFollowButtons();
}

/**
 * Attaches click handlers to all follow toggle buttons.
 * Uses SocialSphereAPI.toggleFollow() and re-renders the card state.
 */
function bindFollowButtons() {
    const buttons = document.querySelectorAll(".follow-toggle-btn");

    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = btn.dataset.targetId;
            const result = SocialSphereAPI.toggleFollow(targetId);

            if (result.followed) {
                btn.className = "btn btn-secondary btn-sm follow-toggle-btn";
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Following';
                showToast("You are now following this user!", "success");
            } else {
                btn.className = "btn btn-primary btn-sm follow-toggle-btn";
                btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Follow Back';
                showToast("Unfollowed successfully.", "success");
            }
        });
    });
}
