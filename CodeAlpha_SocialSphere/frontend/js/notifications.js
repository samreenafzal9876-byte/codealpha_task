/* -------------------------------------------------------------
   SOCIALSPHERE NOTIFICATIONS PAGE ENGINE
   Renders notifications for the current user with type-specific
   icons, sender details, and mark-all-read functionality.
   ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    renderNotifications();
    bindMarkAllRead();
});

/**
 * Fetches notifications for the current user, resolves sender
 * details, and renders notification items into the container.
 */
function renderNotifications() {
    const notifications = SocialSphereAPI.getNotificationsForUser();
    const allUsers = db.getUsers();

    const container = document.getElementById("notifications-container");
    const emptyState = document.getElementById("notifications-empty");

    // Show empty state if no notifications
    if (notifications.length === 0) {
        container.style.display = "none";
        emptyState.style.display = "block";
        return;
    }

    container.style.display = "";
    emptyState.style.display = "none";

    // Build HTML for each notification
    container.innerHTML = notifications.map(notif => {
        const sender = allUsers.find(u => u.id === notif.senderId);
        if (!sender) return "";

        // Determine icon and text based on notification type
        const { iconClass, iconType, text, link } = getNotificationDisplay(notif, sender);

        const unreadClass = notif.read ? "" : " unread";

        return `
            <div class="notification-item${unreadClass}" data-notif-id="${notif.id}">
                <div class="notification-icon ${iconType}">
                    <i class="${iconClass}"></i>
                </div>
                <img src="${sender.avatar}" alt="${sender.displayName}" class="user-avatar-sm" style="width:40px; height:40px; border-radius:var(--radius-full); object-fit:cover;">
                <div class="notification-body">
                    <p class="notification-text">
                        ${link ? `<a href="${link}" style="color:inherit;">` : ""}
                        <strong>${sender.displayName}</strong> ${text}
                        ${link ? "</a>" : ""}
                    </p>
                    <span class="notification-meta">${notif.createdAt}</span>
                </div>
            </div>
        `;
    }).join("");
}

/**
 * Returns display properties (icon, text, link) based on
 * the notification type (like, comment, follow).
 */
function getNotificationDisplay(notif, sender) {
    switch (notif.type) {
        case "like":
            return {
                iconClass: "fa-solid fa-heart",
                iconType: "like",
                text: "liked your post.",
                link: notif.postId ? `post-details.html?id=${notif.postId}` : ""
            };
        case "comment":
            return {
                iconClass: "fa-solid fa-comment",
                iconType: "comment",
                text: "commented on your post.",
                link: notif.postId ? `post-details.html?id=${notif.postId}` : ""
            };
        case "follow":
            return {
                iconClass: "fa-solid fa-user-plus",
                iconType: "follow",
                text: "started following you.",
                link: ""
            };
        default:
            return {
                iconClass: "fa-solid fa-bell",
                iconType: "",
                text: "sent you a notification.",
                link: ""
            };
    }
}

/**
 * Binds the "Mark all as read" button to clear unread states.
 */
function bindMarkAllRead() {
    const btn = document.getElementById("mark-all-read-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        SocialSphereAPI.markAllNotificationsRead();

        // Remove unread styling from all notification items
        const unreadItems = document.querySelectorAll(".notification-item.unread");
        unreadItems.forEach(item => {
            item.classList.remove("unread");
        });

        showToast("All notifications marked as read.", "success");
    });
}
