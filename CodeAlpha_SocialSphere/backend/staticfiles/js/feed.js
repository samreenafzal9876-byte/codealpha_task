/* -------------------------------------------------------------
   SOCIALSPHERE FEED PAGE ENGINE
   Renders post feed, inline composer, and right-sidebar
   suggestions. Supports search filtering via URL params.
   ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    // --- Composer Setup ---
    initComposer(currentUser);

    // --- Search Filtering ---
    const searchQuery = getSearchQuery();
    if (searchQuery) {
        const title = document.getElementById("feed-page-title");
        if (title) title.textContent = `Results for "${searchQuery}"`;
    }

    // --- Render Posts ---
    renderFeed(searchQuery);

    // --- Right Sidebar: Who to Follow ---
    renderWhoToFollow(currentUser);
});

/* =============================================================
   POST FEED RENDERING
   ============================================================= */

/**
 * Fetches posts from the database, optionally filters by search
 * query, and renders them into the #posts-feed-container element.
 */
function renderFeed(searchQuery) {
    const container = document.getElementById("posts-feed-container");
    if (!container) return;

    const currentUser = db.getCurrentUser();
    let posts = db.getPosts();
    const users = db.getUsers();

    // Apply search filter (case-insensitive content match)
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        posts = posts.filter(p => p.content.toLowerCase().includes(q));
    }

    // Empty state
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align:center; padding:48px 24px;">
                <i class="fa-regular fa-face-meh" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:12px;"></i>
                <p style="color:var(--text-secondary); font-size:1rem;">No posts found${searchQuery ? ' for "' + searchQuery + '"' : ''}.</p>
            </div>`;
        return;
    }

    container.innerHTML = posts.map(post => {
        const author = users.find(u => u.id === post.userId) || {};
        const liked = post.likes.includes(currentUser.id);
        const likeIcon = liked ? "fa-solid fa-heart" : "fa-regular fa-heart";
        const likeClass = liked ? "action-trigger liked" : "action-trigger";

        return `
        <div class="card post-card" id="post-${post.id}">
            <div class="post-header">
                <div class="post-author">
                    <a href="profile.html?id=${author.id}">
                        <img src="${author.avatar}" alt="${author.displayName}" class="post-author-img">
                    </a>
                    <div class="post-author-meta">
                        <a href="profile.html?id=${author.id}" class="post-author-name">${author.displayName}</a>
                        <span class="post-author-handle">@${author.username}</span>
                    </div>
                </div>
                <span class="post-time">${post.createdAt}</span>
            </div>

            <div class="post-content">${formatContent(post.content)}</div>

            ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image" loading="lazy">` : ""}

            <div class="post-actions">
                <button class="${likeClass}" data-post-id="${post.id}" onclick="handleLike(this)">
                    <i class="${likeIcon}"></i>
                    <span>${post.likes.length}</span>
                </button>
                <a href="post-details.html?id=${post.id}" class="action-trigger">
                    <i class="fa-regular fa-comment"></i>
                    <span>${post.comments.length}</span>
                </a>
                <button class="action-trigger" onclick="handleShare()">
                    <i class="fa-regular fa-share-from-square"></i>
                    <span>Share</span>
                </button>
            </div>
        </div>`;
    }).join("");
}

/* =============================================================
   INLINE COMPOSER
   ============================================================= */

/** Sets up the post composer: avatar, submit, image attachment. */
function initComposer(currentUser) {
    // Set composer avatar
    const avatarEl = document.getElementById("composer-user-avatar");
    if (avatarEl) {
        avatarEl.src = currentUser.avatar;
        avatarEl.alt = currentUser.displayName;
    }

    // Simulated image attachment state
    let attachedImageUrl = "";

    // Random Unsplash image pool for simulated attachments
    const unsplashPool = [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
        "https://images.unsplash.com/photo-1682686581580-d99b0230064e?w=800",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800"
    ];

    // Attach image button
    const attachBtn = document.getElementById("attach-image-btn");
    const previewContainer = document.getElementById("composer-media-preview-container");
    const previewImg = document.getElementById("composer-media-preview-img");
    const cancelPreviewBtn = document.getElementById("cancel-media-preview-btn");

    if (attachBtn && previewContainer && previewImg) {
        attachBtn.addEventListener("click", () => {
            // Pick a random Unsplash image
            attachedImageUrl = unsplashPool[Math.floor(Math.random() * unsplashPool.length)];
            previewImg.src = attachedImageUrl;
            previewContainer.style.display = "block";
            showToast("Image attached!", "success");
        });
    }

    // Cancel image attachment
    if (cancelPreviewBtn) {
        cancelPreviewBtn.addEventListener("click", () => {
            attachedImageUrl = "";
            previewContainer.style.display = "none";
            previewImg.src = "";
        });
    }

    // Submit post
    const submitBtn = document.getElementById("submit-post-btn");
    const textarea = document.getElementById("composer-textarea");

    if (submitBtn && textarea) {
        submitBtn.addEventListener("click", () => {
            const content = textarea.value.trim();
            if (!content) {
                showToast("Post cannot be empty!", "error");
                return;
            }

            SocialSphereAPI.createPost(content, attachedImageUrl);
            showToast("Post published! 🎉", "success");

            // Reset composer
            textarea.value = "";
            attachedImageUrl = "";
            if (previewContainer) previewContainer.style.display = "none";
            if (previewImg) previewImg.src = "";

            // Re-render feed
            renderFeed(getSearchQuery());
        });
    }
}

/* =============================================================
   WHO TO FOLLOW SIDEBAR WIDGET
   ============================================================= */

/** Renders suggested users the current user is NOT already following. */
function renderWhoToFollow(currentUser) {
    const container = document.getElementById("who-to-follow-container");
    if (!container) return;

    const allUsers = db.getUsers();
    const following = db.getFollowing(currentUser.id);

    // Filter: not current user, and not already followed
    const suggestions = allUsers.filter(
        u => u.id !== currentUser.id && !following.includes(u.id)
    );

    if (suggestions.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">You're following everyone! 🎉</p>`;
        return;
    }

    container.innerHTML = suggestions.map(user => `
        <div class="suggestion-user" id="suggestion-${user.id}">
            <div class="user-info-row">
                <a href="profile.html?id=${user.id}">
                    <img src="${user.avatar}" alt="${user.displayName}" class="user-avatar-sm">
                </a>
                <div class="user-names">
                    <a href="profile.html?id=${user.id}" class="user-displayname">${user.displayName}</a>
                    <span class="user-username">@${user.username}</span>
                </div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="handleFollow('${user.id}', this)">Follow</button>
        </div>
    `).join("");
}

/* =============================================================
   ACTION HANDLERS
   ============================================================= */

/**
 * Toggles the like state on a post and updates the UI in place.
 * Adds heartbeat animation on like.
 */
function handleLike(btn) {
    const postId = btn.getAttribute("data-post-id");
    const result = SocialSphereAPI.toggleLike(postId);
    if (!result) return;

    const icon = btn.querySelector("i");
    const countSpan = btn.querySelector("span");

    if (result.liked) {
        btn.classList.add("liked");
        icon.className = "fa-solid fa-heart";
    } else {
        btn.classList.remove("liked");
        icon.className = "fa-regular fa-heart";
    }

    countSpan.textContent = result.likesCount;
}

/** Share button handler (visual-only, copies to clipboard concept). */
function handleShare() {
    showToast("Link copied to clipboard!", "success");
}

/** Toggles follow state for sidebar suggestion and updates button. */
function handleFollow(userId, btn) {
    const result = SocialSphereAPI.toggleFollow(userId);
    if (!result) return;

    if (result.followed) {
        btn.textContent = "Following";
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-secondary");
        showToast("Followed successfully!", "success");
    } else {
        btn.textContent = "Follow";
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-primary");
        showToast("Unfollowed.", "success");
    }
}

/* =============================================================
   UTILITY HELPERS
   ============================================================= */

/**
 * Simple content formatter: converts hashtags and @mentions
 * into styled inline elements.
 */
function formatContent(text) {
    return text
        .replace(/#(\w+)/g, '<span style="color:var(--primary); font-weight:600;">#$1</span>')
        .replace(/@(\w+)/g, '<span style="color:var(--primary); font-weight:600;">@$1</span>');
}
