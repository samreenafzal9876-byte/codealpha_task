/* -------------------------------------------------------------
   SOCIALSPHERE API & DATA LAYER (MOCK ENGINE)
   Uses localStorage to persist state, simulating a database.
   ------------------------------------------------------------- */

const MOCK_USERS = [
    {
        id: "user_1",
        username: "jane_doe",
        displayName: "Jane Doe",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
        bio: "Digital artist, designer, and photography enthusiast. Capturing life through pixels. 📸🎨",
        location: "San Francisco, CA",
        website: "janedoe.design",
        joinDate: "Joined June 2024",
        followersCount: 1420,
        followingCount: 382,
        postsCount: 12
    },
    {
        id: "user_2",
        username: "alex_smith",
        displayName: "Alex Smith",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        banner: "https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=800",
        bio: "Tech enthusiast & software engineer. Coffee lover. Building the future one semicolon at a time. 💻☕",
        location: "Austin, TX",
        website: "alexsmith.dev",
        joinDate: "Joined January 2025",
        followersCount: 894,
        followingCount: 512,
        postsCount: 8
    },
    {
        id: "user_3",
        username: "creative_chloe",
        displayName: "Chloe Carter",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        banner: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800",
        bio: "Globetrotter & storyteller. Traveling the world to find the best street food. ✈️🍜",
        location: "New York, NY",
        website: "chloetravels.com",
        joinDate: "Joined March 2024",
        followersCount: 3210,
        followingCount: 654,
        postsCount: 34
    },
    {
        id: "user_4",
        username: "nature_nate",
        displayName: "Nate Wilson",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        banner: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
        bio: "Mountain hiker, nature lover, and amateur climber. Let's get lost in the woods. 🌲🏔️",
        location: "Denver, CO",
        website: "",
        joinDate: "Joined August 2023",
        followersCount: 540,
        followingCount: 180,
        postsCount: 5
    }
];

const MOCK_POSTS = [
    {
        id: "post_1",
        userId: "user_3",
        content: "Just landed in Tokyo! The neon lights are absolutely mesmerizing. Ready to eat my weight in ramen and sushi. If you have any hidden gem recommendations, drop them below! 🇯🇵🗼🍜",
        image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800",
        createdAt: "2 hours ago",
        likes: ["user_2", "user_1"],
        comments: [
            {
                id: "c_1",
                userId: "user_1",
                text: "Have an amazing trip! You must check out the ramen alleys in Shinjuku. 🤤",
                createdAt: "1 hour ago"
            },
            {
                id: "c_2",
                userId: "user_2",
                text: "So jealous! Tokyo looks futuristic. Make sure to visit Akihabara!",
                createdAt: "30 mins ago"
            }
        ]
    },
    {
        id: "post_2",
        userId: "user_1",
        content: "Working on some brand new UI layouts today. Embracing neon gradients and dark mode cards. What do you all think of this vibe? ✨💻 #webdesign #uidesign #ux",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800",
        createdAt: "5 hours ago",
        likes: ["user_3"],
        comments: [
            {
                id: "c_3",
                userId: "user_2",
                text: "The glassmorphism feels extremely clean! Nice contrast with the neon border.",
                createdAt: "4 hours ago"
            }
        ]
    },
    {
        id: "post_3",
        userId: "user_2",
        content: "Spent the morning debugging a single race condition. It took 3 hours, 4 cups of coffee, and a lot of questioning my life choices. But it is fixed. Semicolon secured. 😎☕",
        image: "",
        createdAt: "1 day ago",
        likes: ["user_1", "user_3", "user_4"],
        comments: []
    },
    {
        id: "post_4",
        userId: "user_4",
        content: "Woke up early to catch the sunrise at the peak today. The cold mountain breeze makes you feel alive. Worth every step of the climb. ⛰️🌤️",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
        createdAt: "2 days ago",
        likes: ["user_1", "user_2"],
        comments: [
            {
                id: "c_4",
                userId: "user_3",
                text: "Absolutely stunning view! Added this hike to my bucket list.",
                createdAt: "1 day ago"
            }
        ]
    }
];

const MOCK_NOTIFICATIONS = [
    {
        id: "notif_1",
        type: "like",
        senderId: "user_2",
        postId: "post_2",
        createdAt: "1 hour ago",
        read: false
    },
    {
        id: "notif_2",
        type: "comment",
        senderId: "user_1",
        postId: "post_1",
        createdAt: "2 hours ago",
        read: false
    },
    {
        id: "notif_3",
        type: "follow",
        senderId: "user_4",
        postId: "",
        createdAt: "1 day ago",
        read: true
    }
];

// -------------------------------------------------------------
// LOCALSTORAGE INIT ENGINE
// -------------------------------------------------------------
function initializeDatabase() {
    if (!localStorage.getItem("users")) {
        localStorage.setItem("users", JSON.stringify(MOCK_USERS));
    }
    if (!localStorage.getItem("posts")) {
        localStorage.setItem("posts", JSON.stringify(MOCK_POSTS));
    }
    if (!localStorage.getItem("notifications")) {
        localStorage.setItem("notifications", JSON.stringify(MOCK_NOTIFICATIONS));
    }
    // Default logged-in user is Jane Doe (user_1)
    if (!localStorage.getItem("currentUser")) {
        localStorage.setItem("currentUser", JSON.stringify(MOCK_USERS[0]));
    }
    // Following database relationships
    if (!localStorage.getItem("followingRelation")) {
        // user_1 follows user_2, user_3
        const relations = {
            "user_1": ["user_2", "user_3"],
            "user_2": ["user_1", "user_3"],
            "user_3": ["user_1"],
            "user_4": ["user_1", "user_2", "user_3"]
        };
        localStorage.setItem("followingRelation", JSON.stringify(relations));
    }
}

initializeDatabase();

// -------------------------------------------------------------
// DATABASE UTILITIES (CRUD SIMULATIONS)
// -------------------------------------------------------------
const db = {
    getUsers: () => JSON.parse(localStorage.getItem("users")),
    saveUsers: (users) => localStorage.setItem("users", JSON.stringify(users)),
    
    getPosts: () => JSON.parse(localStorage.getItem("posts")),
    savePosts: (posts) => localStorage.setItem("posts", JSON.stringify(posts)),
    
    getNotifications: () => JSON.parse(localStorage.getItem("notifications")),
    saveNotifications: (notifs) => localStorage.setItem("notifications", JSON.stringify(notifs)),
    
    getCurrentUser: () => JSON.parse(localStorage.getItem("currentUser")),
    saveCurrentUser: (user) => {
        localStorage.setItem("currentUser", JSON.stringify(user));
        // Also update in the main users list
        const users = db.getUsers();
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users[idx] = user;
            db.saveUsers(users);
        }
    },
    
    getFollowing: (userId) => {
        const relations = JSON.parse(localStorage.getItem("followingRelation")) || {};
        return relations[userId] || [];
    },
    
    saveFollowing: (userId, followingList) => {
        const relations = JSON.parse(localStorage.getItem("followingRelation")) || {};
        relations[userId] = followingList;
        localStorage.setItem("followingRelation", JSON.stringify(relations));
        
        // Update user profile cache
        const users = db.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            user.followingCount = followingList.length;
            db.saveUsers(users);
            if (userId === db.getCurrentUser().id) {
                db.saveCurrentUser(user);
            }
        }
    },
    
    getFollowers: (userId) => {
        const relations = JSON.parse(localStorage.getItem("followingRelation")) || {};
        const followers = [];
        for (const [followerId, followingList] of Object.entries(relations)) {
            if (followingList.includes(userId)) {
                followers.push(followerId);
            }
        }
        return followers;
    }
};

// -------------------------------------------------------------
// BUSINESS LOGIC SERVICES
// -------------------------------------------------------------
const SocialSphereAPI = {
    // Authenticate user
    login: (username, password) => {
        const users = db.getUsers();
        const found = users.find(u => u.username === username.trim().toLowerCase());
        if (found) {
            db.saveCurrentUser(found);
            return { success: true, user: found };
        }
        return { success: false, message: "Invalid username or credentials (use test usernames like: jane_doe, alex_smith)" };
    },
    
    register: (displayName, username, email) => {
        const users = db.getUsers();
        const uname = username.trim().toLowerCase();
        
        if (users.some(u => u.username === uname)) {
            return { success: false, message: "Username already taken." };
        }
        
        const newUser = {
            id: "user_" + (users.length + 1),
            username: uname,
            displayName: displayName.trim(),
            avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`, // default avatar
            banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
            bio: "Hey there! I am new to SocialSphere.",
            location: "",
            website: "",
            joinDate: "Joined " + new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            followersCount: 0,
            followingCount: 0,
            postsCount: 0
        };
        
        users.push(newUser);
        db.saveUsers(users);
        db.saveCurrentUser(newUser);
        return { success: true, user: newUser };
    },
    
    logout: () => {
        localStorage.removeItem("currentUser");
    },
    
    // Posts Engine
    createPost: (content, imageFileUrl) => {
        const posts = db.getPosts();
        const user = db.getCurrentUser();
        
        const newPost = {
            id: "post_" + (posts.length + 1),
            userId: user.id,
            content: content,
            image: imageFileUrl || "",
            createdAt: "Just now",
            likes: [],
            comments: []
        };
        
        posts.unshift(newPost);
        db.savePosts(posts);
        
        // Increment post count
        user.postsCount += 1;
        db.saveCurrentUser(user);
        
        return newPost;
    },
    
    toggleLike: (postId) => {
        const posts = db.getPosts();
        const user = db.getCurrentUser();
        const post = posts.find(p => p.id === postId);
        
        if (!post) return null;
        
        const idx = post.likes.indexOf(user.id);
        let liked = false;
        if (idx === -1) {
            post.likes.push(user.id);
            liked = true;
            
            // Create notification if liked other user's post
            if (post.userId !== user.id) {
                SocialSphereAPI.createNotification("like", user.id, post.userId, post.id);
            }
        } else {
            post.likes.splice(idx, 1);
        }
        
        db.savePosts(posts);
        return { likesCount: post.likes.length, liked: liked };
    },
    
    addComment: (postId, text) => {
        const posts = db.getPosts();
        const user = db.getCurrentUser();
        const post = posts.find(p => p.id === postId);
        
        if (!post) return null;
        
        const newComment = {
            id: "c_" + (Date.now()),
            userId: user.id,
            text: text,
            createdAt: "Just now"
        };
        
        post.comments.push(newComment);
        db.savePosts(posts);
        
        // Create notification
        if (post.userId !== user.id) {
            SocialSphereAPI.createNotification("comment", user.id, post.userId, post.id);
        }
        
        return newComment;
    },
    
    // Social Follow Engine
    toggleFollow: (targetUserId) => {
        const currentUser = db.getCurrentUser();
        let following = db.getFollowing(currentUser.id);
        const idx = following.indexOf(targetUserId);
        
        let followed = false;
        if (idx === -1) {
            following.push(targetUserId);
            followed = true;
            SocialSphereAPI.createNotification("follow", currentUser.id, targetUserId, "");
        } else {
            following.splice(idx, 1);
        }
        
        db.saveFollowing(currentUser.id, following);
        
        // Recalculate target followers count
        const targetFollowers = db.getFollowers(targetUserId);
        const users = db.getUsers();
        const target = users.find(u => u.id === targetUserId);
        if (target) {
            target.followersCount = targetFollowers.length;
            db.saveUsers(users);
        }
        
        return { followed: followed, targetFollowersCount: targetFollowers.length };
    },
    
    // Profile Management
    editProfile: (displayName, bio, location, website, avatarUrl, bannerUrl) => {
        const user = db.getCurrentUser();
        user.displayName = displayName || user.displayName;
        user.bio = bio !== undefined ? bio : user.bio;
        user.location = location !== undefined ? location : user.location;
        user.website = website !== undefined ? website : user.website;
        user.avatar = avatarUrl || user.avatar;
        user.banner = bannerUrl || user.banner;
        
        db.saveCurrentUser(user);
        return user;
    },
    
    // Notifications Engine
    createNotification: (type, senderId, receiverId, postId) => {
        const notifs = db.getNotifications();
        const newNotif = {
            id: "notif_" + (Date.now()),
            type: type,
            senderId: senderId,
            postId: postId,
            createdAt: "Just now",
            read: false
        };
        
        // Mocking receiver routing - in localStorage simulation we just append to list
        // and filter by target in UI. Let's add targetId field.
        newNotif.receiverId = receiverId;
        notifs.unshift(newNotif);
        db.saveNotifications(notifs);
    },
    
    getNotificationsForUser: () => {
        const notifs = db.getNotifications();
        const user = db.getCurrentUser();
        // Since we did not have receiverId on original mocks, assume notifications are for currentUser user_1
        // unless receiverId is present
        return notifs.filter(n => !n.receiverId || n.receiverId === user.id);
    },
    
    markAllNotificationsRead: () => {
        const notifs = db.getNotifications();
        const user = db.getCurrentUser();
        notifs.forEach(n => {
            if (!n.receiverId || n.receiverId === user.id) {
                n.read = true;
            }
        });
        db.saveNotifications(notifs);
    }
};
