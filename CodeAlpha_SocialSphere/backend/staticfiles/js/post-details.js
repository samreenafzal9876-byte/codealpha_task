/* -------------------------------------------------------------
   SOCIALSPHERE POST DETAILS PAGE ENGINE
   Renders a single post with its comment thread.
   Supports liking the post and adding new comments.
   ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    // --- Get Post ID from URL ---
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("id");

    if (!postId) {
        showPostError("No post ID provided.");
        return;
    }

    // --- Set comment avatar ---
    const commentAvatar = document.getElementById("comment-user-avatar");
    if (commentAvatar) {
        commentAvatar.src = currentUser.avatar;
        commentAvatar.alt = currentUser.displayName;
    }

    // --- Load and render the post ---
    renderPostDetail(postId, currentUser);

    // --- Load comments ---
    renderComments(postId);

    // --- Comment submission ---
    initCommentForm(postId);
});

/* =============================================================
   POST DETAIL CARD
   ============================================================= */

function renderPostDetail(postId, currentUser) {
    const container = document.getElementById("post-detail-card");
    if (!container) return;

    const posts = db.getPosts();
    const post = posts.find(p => p.id === postId);

    if (!post) {
        showPostError("Post not found.");
        return;
    }

    const users = db.getUsers();
    const author = users.find(u => u.id === post.userId) || {};
    const liked = post.likes.includes(currentUser.id);
    const likeIcon = liked ? "fa-solid fa-heart" : "fa-regular fa-heart";
    const likeClass = liked ? "action-trigger liked" : "action-trigger";

    container.innerHTML = `
        <div class="card post-card">
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

            <div class="post-content">${formatPostContent(post.content)}</div>

            ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image" loading="lazy">` : ""}

            <div class="post-actions">
                <button class="${likeClass}" id="detail-like-btn" data-post-id="${post.id}">
                    <i class="${likeIcon}"></i>
                    <span>${post.likes.length}</span>
                </button>
                <span class="action-trigger" style="cursor:default;">
                    <i class="fa-regular fa-comment"></i>
                    <span id="detail-comment-count">${post.comments.length}</span>
                </span>
                <button class="action-trigger" id="detail-share-btn">
                    <i class="fa-regular fa-share-from-square"></i>
                    <span>Share</span>
                </button>
            </div>
        </div>
    `;

    // --- Bind Like Button ---
    const likeBtn = document.getElementById("detail-like-btn");
    if (likeBtn) {
        likeBtn.addEventListener("click", () => {
            const result = SocialSphereAPI.toggleLike(postId);
            if (!result) return;

            const icon = likeBtn.querySelector("i");
            const countSpan = likeBtn.querySelector("span");

            if (result.liked) {
                likeBtn.classList.add("liked");
                icon.className = "fa-solid fa-heart";
            } else {
                likeBtn.classList.remove("liked");
                icon.className = "fa-regular fa-heart";
            }

            countSpan.textContent = result.likesCount;
        });
    }

    // --- Bind Share Button ---
    const shareBtn = document.getElementById("detail-share-btn");
    if (shareBtn) {
        shareBtn.addEventListener("click", () => {
            showToast("Link copied to clipboard!", "success");
        });
    }
}

/* =============================================================
   COMMENTS RENDERING
   ============================================================= */

function renderComments(postId) {
    const container = document.getElementById("comments-list-container");
    const titleEl = document.getElementById("comments-section-title");
    if (!container) return;

    const posts = db.getPosts();
    const post = posts.find(p => p.id === postId);

    if (!post) return;

    const users = db.getUsers();
    const comments = post.comments;

    // Update section title with count
    if (titleEl) {
        titleEl.innerHTML = `
            <i class="fa-regular fa-comments" style="margin-right:8px; color:var(--comment);"></i>
            Comments (${comments.length})
        `;
    }

    // Update comment count in post actions
    const countEl = document.getElementById("detail-comment-count");
    if (countEl) countEl.textContent = comments.length;

    if (comments.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:32px 16px; color:var(--text-muted);">
                <i class="fa-regular fa-comment-dots" style="font-size:2rem; margin-bottom:8px; display:block;"></i>
                <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = comments.map(comment => {
        const commenter = users.find(u => u.id === comment.userId) || {};
        return `
            <div class="comment-card">
                <a href="profile.html?id=${commenter.id}">
                    <img src="${commenter.avatar}" alt="${commenter.displayName}" class="user-avatar-sm">
                </a>
                <div class="comment-body">
                    <div class="comment-header">
                        <a href="profile.html?id=${commenter.id}" class="comment-author">${commenter.displayName}</a>
                        <span class="comment-time">${comment.createdAt}</span>
                    </div>
                    <p class="comment-text">${comment.text}</p>
                </div>
            </div>
        `;
    }).join("");
}

/* =============================================================
   COMMENT SUBMISSION
   ============================================================= */

function initCommentForm(postId) {
    const submitBtn = document.getElementById("submit-comment-btn");
    const textarea = document.getElementById("comment-textarea");

    if (!submitBtn || !textarea) return;

    submitBtn.addEventListener("click", () => {
        const text = textarea.value.trim();

        if (!text) {
            showToast("Comment cannot be empty!", "error");
            return;
        }

        const result = SocialSphereAPI.addComment(postId, text);
        if (!result) {
            showToast("Failed to add comment.", "error");
            return;
        }

        showToast("Comment added! 💬", "success");
        textarea.value = "";

        // Re-render the comments list
        renderComments(postId);
    });

    // Ctrl+Enter shortcut
    textarea.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            submitBtn.click();
        }
    });
}

/* =============================================================
   UTILITY HELPERS
   ============================================================= */

/** Displays an error state in the post detail area. */
function showPostError(message) {
    const container = document.getElementById("post-detail-card");
    if (container) {
        container.innerHTML = `
            <div class="card" style="text-align:center; padding:48px 24px;">
                <i class="fa-solid fa-circle-exclamation" style="font-size:2.5rem; color:var(--error); margin-bottom:12px;"></i>
                <p style="color:var(--text-secondary); font-size:1rem;">${message}</p>
                <a href="feed.html" class="btn btn-primary" style="margin-top:16px;">
                    <i class="fa-solid fa-arrow-left"></i> Return to Feed
                </a>
            </div>
        `;
    }

    // Hide comments section on error
    const commentsTitle = document.getElementById("comments-section-title");
    const commentInput = document.querySelector(".comment-input-row");
    const commentsList = document.getElementById("comments-list-container");
    if (commentsTitle) commentsTitle.style.display = "none";
    if (commentInput) commentInput.style.display = "none";
    if (commentsList) commentsList.style.display = "none";
}

/** Formats post content with highlighted hashtags and mentions. */
function formatPostContent(text) {
    return text
        .replace(/#(\w+)/g, '<span style="color:var(--primary); font-weight:600;">#$1</span>')
        .replace(/@(\w+)/g, '<span style="color:var(--primary); font-weight:600;">@$1</span>');
}
