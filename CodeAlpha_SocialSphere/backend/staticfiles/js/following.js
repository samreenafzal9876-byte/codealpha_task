/* -------------------------------------------------------------
   SOCIALSPHERE FOLLOWING PAGE ENGINE
   Renders users that the current user follows with unfollow
   toggle functionality.
   ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    renderFollowing();
});

/**
 * Fetches following IDs for the current user, resolves them to
 * user objects, and renders connection cards into the grid.
 */
function renderFollowing() {
    const currentUser = db.getCurrentUser();
    const followingIds = db.getFollowing(currentUser.id);
    const allUsers = db.getUsers();

    const container = document.getElementById("following-container");
    const emptyState = document.getElementById("following-empty");
    const title = document.getElementById("following-title");

    // Update title with count
    title.textContent = `Following (${followingIds.length})`;

    // Show empty state if not following anyone
    if (followingIds.length === 0) {
        container.style.display = "none";
        emptyState.style.display = "block";
        return;
    }

    container.style.display = "";
    emptyState.style.display = "none";

    // Resolve following IDs to user objects
    const followingUsers = followingIds
        .map(id => allUsers.find(u => u.id === id))
        .filter(Boolean);

    // Build HTML for each following card
    container.innerHTML = followingUsers.map(user => {
        return `
            <div class="connection-card" data-user-id="${user.id}">
                <div class="user-info-row">
                    <img src="${user.avatar}" alt="${user.displayName}" class="user-avatar-sm">
                    <div class="user-names">
                        <a href="profile.html?id=${user.id}" class="user-displayname">${user.displayName}</a>
                        <span class="user-username">@${user.username}</span>
                    </div>
                </div>
                <button class="btn btn-secondary btn-sm unfollow-btn" data-target-id="${user.id}">
                    <i class="fa-solid fa-user-minus"></i> Unfollow
                </button>
            </div>
        `;
    }).join("");

    // Bind unfollow button events
    bindUnfollowButtons();
}

/**
 * Attaches click handlers to all unfollow buttons.
 * Uses SocialSphereAPI.toggleFollow() and re-renders the entire list
 * to keep the count and state in sync.
 */
function bindUnfollowButtons() {
    const buttons = document.querySelectorAll(".unfollow-btn");

    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = btn.dataset.targetId;
            const result = SocialSphereAPI.toggleFollow(targetId);

            if (!result.followed) {
                showToast("Unfollowed successfully.", "success");
                // Re-render the entire list to update count and remove the card
                renderFollowing();
            } else {
                // Edge case: was already unfollowed, toggle re-followed
                showToast("You are now following this user!", "success");
                renderFollowing();
            }
        });
    });
}
