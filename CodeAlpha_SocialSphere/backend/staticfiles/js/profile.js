/* -------------------------------------------------------------
   SOCIALSPHERE PROFILE PAGE CONTROLLER
   Handles profile rendering, tab switching, post display,
   follow/unfollow actions, and right sidebar widgets.
   ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    // Determine which profile to display via ?user=USERNAME param
    const params = new URLSearchParams(window.location.search);
    const usernameParam = params.get("user");
    const allUsers = db.getUsers();

    let profileUser = currentUser;
    if (usernameParam && usernameParam !== currentUser.username) {
        const found = allUsers.find(u => u.username === usernameParam);
        if (found) {
            profileUser = found;
        }
    }

    const isOwnProfile = profileUser.id === currentUser.id;

    // Update page title
    document.title = `${profileUser.displayName} (@${profileUser.username}) - SocialSphere`;

    // ─── Render Profile Header ──────────────────────────────────
    renderProfileHeader(profileUser, isOwnProfile, currentUser);

    // ─── Render Tabs & Content ──────────────────────────────────
    renderPostsTab(profileUser);
    renderLikesTab(profileUser);
    bindTabSwitching();

    // ─── Render Right Sidebar Suggestions ───────────────────────
    renderSuggestions(currentUser, allUsers);
});

// -------------------------------------------------------------
// PROFILE HEADER RENDERER
// -------------------------------------------------------------
function renderProfileHeader(user, isOwn, currentUser) {
    // Banner
    const bannerEl = document.getElementById("profile-banner");
    if (user.banner) {
        bannerEl.innerHTML = `<img src="${user.banner}" alt="Banner">`;
    }

    // Avatar
    const avatarEl = document.getElementById("profile-avatar");
    avatarEl.src = user.avatar;
    avatarEl.alt = user.displayName;

    // Name & Handle
    document.getElementById("profile-name").textContent = user.displayName;
    document.getElementById("profile-handle").textContent = `@${user.username}`;

    // Bio
    document.getElementById("profile-bio").textContent = user.bio || "";

    // Details: Location, Website, Join Date
    const detailsEl = document.getElementById("profile-details");
    let detailsHTML = "";
    if (user.location) {
        detailsHTML += `<span><i class="fa-solid fa-location-dot"></i> ${user.location}</span>`;
    }
    if (user.website) {
        detailsHTML += `<span><i class="fa-solid fa-link"></i> <a href="https://${user.website}" target="_blank" style="color:var(--primary)">${user.website}</a></span>`;
    }
    if (user.joinDate) {
        detailsHTML += `<span><i class="fa-regular fa-calendar"></i> ${user.joinDate}</span>`;
    }
    detailsEl.innerHTML = detailsHTML;

    // Stats: Following & Followers (clickable)
    const statsEl = document.getElementById("profile-stats");
    const followingCount = db.getFollowing(user.id).length;
    const followersCount = db.getFollowers(user.id).length;
    statsEl.innerHTML = `
        <a href="following.html?user=${user.username}" class="profile-stat" style="cursor:pointer;">
            <strong>${followingCount}</strong> Following
        </a>
        <a href="followers.html?user=${user.username}" class="profile-stat" style="cursor:pointer;">
            <strong>${followersCount}</strong> Followers
        </a>
    `;

    // Action Button: Edit Profile vs Follow/Unfollow
    const actionEl = document.getElementById("profile-action-btn");
    if (isOwn) {
        actionEl.innerHTML = `
            <a href="edit-profile.html" class="btn btn-secondary">
                <i class="fa-solid fa-pen-to-square"></i> Edit Profile
            </a>
        `;
    } else {
        const isFollowing = db.getFollowing(currentUser.id).includes(user.id);
        actionEl.innerHTML = `
            <button class="btn ${isFollowing ? "btn-secondary" : "btn-primary"}" id="follow-toggle-btn" data-userid="${user.id}">
                <i class="fa-solid ${isFollowing ? "fa-user-check" : "fa-user-plus"}"></i>
                ${isFollowing ? "Following" : "Follow"}
            </button>
        `;
        bindFollowButton(user);
    }
}

// -------------------------------------------------------------
// FOLLOW / UNFOLLOW HANDLER
// -------------------------------------------------------------
function bindFollowButton(profileUser) {
    const btn = document.getElementById("follow-toggle-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const result = SocialSphereAPI.toggleFollow(profileUser.id);

        // Update button UI
        if (result.followed) {
            btn.className = "btn btn-secondary";
            btn.innerHTML = `<i class="fa-solid fa-user-check"></i> Following`;
            showToast(`You are now following ${profileUser.displayName}`, "success");
        } else {
            btn.className = "btn btn-primary";
            btn.innerHTML = `<i class="fa-solid fa-user-plus"></i> Follow`;
            showToast(`You unfollowed ${profileUser.displayName}`, "success");
        }

        // Update followers count in stats
        const statsEl = document.getElementById("profile-stats");
        const followingCount = db.getFollowing(profileUser.id).length;
        const followersCount = db.getFollowers(profileUser.id).length;
        statsEl.innerHTML = `
            <a href="following.html?user=${profileUser.username}" class="profile-stat" style="cursor:pointer;">
                <strong>${followingCount}</strong> Following
            </a>
            <a href="followers.html?user=${profileUser.username}" class="profile-stat" style="cursor:pointer;">
                <strong>${followersCount}</strong> Followers
            </a>
        `;
    });
}

// -------------------------------------------------------------
// TAB SWITCHING
// -------------------------------------------------------------
function bindTabSwitching() {
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active from all tabs
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const target = tab.getAttribute("data-tab");

            // Hide all tab content
            document.getElementById("tab-posts").style.display = target === "posts" ? "block" : "none";
            document.getElementById("tab-likes").style.display = target === "likes" ? "block" : "none";
        });
    });
}

// -------------------------------------------------------------
// POSTS TAB: Render user's own posts
// -------------------------------------------------------------
function renderPostsTab(profileUser) {
    const container = document.getElementById("tab-posts");
    const allPosts = db.getPosts();
    const currentUser = db.getCurrentUser();
    const userPosts = allPosts.filter(p => p.userId === profileUser.id);

    if (userPosts.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align:center; padding:40px;">
                <i class="fa-regular fa-newspaper" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:16px;"></i>
                <p style="color:var(--text-secondary);">No posts yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = userPosts.map(post => renderPostCard(post, currentUser)).join("");
    bindPostActions(container);
}

// -------------------------------------------------------------
// LIKES TAB: Render posts the user has liked
// -------------------------------------------------------------
function renderLikesTab(profileUser) {
    const container = document.getElementById("tab-likes");
    const allPosts = db.getPosts();
    const currentUser = db.getCurrentUser();
    const likedPosts = allPosts.filter(p => p.likes.includes(profileUser.id));

    if (likedPosts.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align:center; padding:40px;">
                <i class="fa-regular fa-heart" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:16px;"></i>
                <p style="color:var(--text-secondary);">No liked posts yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = likedPosts.map(post => renderPostCard(post, currentUser)).join("");
    bindPostActions(container);
}

// -------------------------------------------------------------
// POST CARD RENDERER (reusable)
// -------------------------------------------------------------
function renderPostCard(post, currentUser) {
    const allUsers = db.getUsers();
    const author = allUsers.find(u => u.id === post.userId);
    if (!author) return "";

    const isLiked = post.likes.includes(currentUser.id);
    const imageHTML = post.image
        ? `<img src="${post.image}" alt="Post image" class="post-image">`
        : "";

    return `
        <div class="card post-card" data-postid="${post.id}">
            <div class="post-header">
                <div class="post-author">
                    <a href="profile.html?user=${author.username}">
                        <img src="${author.avatar}" alt="${author.displayName}" class="post-author-img">
                    </a>
                    <div class="post-author-meta">
                        <a href="profile.html?user=${author.username}" class="post-author-name">${author.displayName}</a>
                        <span class="post-author-handle">@${author.username}</span>
                    </div>
                </div>
                <span class="post-time">${post.createdAt}</span>
            </div>
            <p class="post-content">${post.content}</p>
            ${imageHTML}
            <div class="post-actions">
                <button class="action-trigger like-btn ${isLiked ? "liked" : ""}" data-postid="${post.id}">
                    <i class="fa-${isLiked ? "solid" : "regular"} fa-heart"></i>
                    <span class="like-count">${post.likes.length}</span>
                </button>
                <a href="post-detail.html?id=${post.id}" class="action-trigger">
                    <i class="fa-regular fa-comment"></i>
                    <span>${post.comments.length}</span>
                </a>
                <button class="action-trigger">
                    <i class="fa-solid fa-share-nodes"></i>
                    <span>Share</span>
                </button>
            </div>
        </div>
    `;
}

// -------------------------------------------------------------
// POST INTERACTIONS: Like toggle
// -------------------------------------------------------------
function bindPostActions(container) {
    const likeBtns = container.querySelectorAll(".like-btn");
    likeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const postId = btn.getAttribute("data-postid");
            const result = SocialSphereAPI.toggleLike(postId);
            if (!result) return;

            // Update UI
            const icon = btn.querySelector("i");
            const countEl = btn.querySelector(".like-count");

            if (result.liked) {
                btn.classList.add("liked");
                icon.className = "fa-solid fa-heart";
            } else {
                btn.classList.remove("liked");
                icon.className = "fa-regular fa-heart";
            }
            countEl.textContent = result.likesCount;
        });
    });
}

// -------------------------------------------------------------
// RIGHT SIDEBAR: Who to Follow suggestions
// -------------------------------------------------------------
function renderSuggestions(currentUser, allUsers) {
    const container = document.getElementById("who-to-follow-container");
    if (!container) return;

    const following = db.getFollowing(currentUser.id);
    const suggestions = allUsers.filter(u => u.id !== currentUser.id && !following.includes(u.id));

    if (suggestions.length === 0) {
        container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No suggestions available.</p>`;
        return;
    }

    container.innerHTML = suggestions.map(user => `
        <div class="suggestion-user">
            <a href="profile.html?user=${user.username}" class="user-info-row">
                <img src="${user.avatar}" alt="${user.displayName}" class="user-avatar-sm">
                <div class="user-names">
                    <span class="user-displayname">${user.displayName}</span>
                    <span class="user-username">@${user.username}</span>
                </div>
            </a>
            <button class="btn btn-sm btn-primary sidebar-follow-btn" data-userid="${user.id}" data-name="${user.displayName}">Follow</button>
        </div>
    `).join("");

    // Bind follow buttons in suggestions
    container.querySelectorAll(".sidebar-follow-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-userid");
            const targetName = btn.getAttribute("data-name");
            const result = SocialSphereAPI.toggleFollow(targetId);

            if (result.followed) {
                btn.textContent = "Following";
                btn.className = "btn btn-sm btn-secondary sidebar-follow-btn";
                showToast(`You are now following ${targetName}`, "success");
            } else {
                btn.textContent = "Follow";
                btn.className = "btn btn-sm btn-primary sidebar-follow-btn";
                showToast(`You unfollowed ${targetName}`, "success");
            }
        });
    });
}
