#  SocialSphere

SocialSphere is a modern, responsive, and visually stunning social media platform designed to connect creators, developers, and thinkers in a sleek, glassmorphic digital space. Built on the robust **Django** framework on the backend and styled using highly polished, vanilla **HTML, CSS, and JavaScript** on the frontend, SocialSphere offers a complete suite of social interactions including post creation, comments, likes, and followers within a beautiful dark-indigo system.

---

##  Features

SocialSphere comes fully equipped with the following core features:

*   **User Registration:** Secure account creation utilizing standard security practices.
*   **User Login/Logout:** Session-based authentication with user-friendly redirect logic.
*   **User Profiles:** Individualized spaces displaying user bios, avatars, location, website link, statistics (posts count, followers/following counts), and personal feeds.
*   **Edit Profile:** Clean forms allowing users to modify display names, update profile pictures, add/modify bios, websites, and locations.
*   **Create Posts:** Rich composer interface allowing users to write captions and upload images with media preview capability.
*   **Delete Posts:** Built-in deletion confirmation steps to prevent accidental removal of user content.
*   **Comments System:** Interactive post detail sections permitting authenticated users to comment and moderate their commentary.
*   **Like System:** Responsive toggle liking mechanism with live counter updates.
*   **Follow/Unfollow System:** User-to-user following relationships enabling feed personalization.
*   **Followers & Following Lists:** Dedicated list pages showing who follows a user and who a user is following.
*   **Admin Dashboard:** Highly customized, premium dashboard interface powered by **Django Jazzmin**, containing custom action links, icons, search models, and inline object styling.

---

##  Technologies Used

### Frontend
*   **HTML5:** Structured semantic markup.
*   **Vanilla CSS3:** Custom styles utilizing HSL variables, fluid glassmorphism, responsive grids, and clean CSS micro-animations.
*   **Vanilla JavaScript (ES6+):** Responsive drawer animations, DOM manipulation, media upload previews, and interactive features.
*   **Font Awesome 6.4:** Premium vector iconography.
*   **Google Fonts:** Modern typography styling using *Plus Jakarta Sans*.

### Backend & Database
*   **Django 6.0+:** Robust Python web framework handling routing, security, templating, and administration.
*   **Django Jazzmin:** Custom themes and styling for the administrative dashboard.
*   **Pillow:** Python imaging library for post and avatar media upload processing.
*   **SQLite:** Zero-configuration lightweight database engine for fast local development.

---

##  Folder Structure

The project separates the static, client-side UI mockup prototype from the functional Django server backend:

```
SocialSphere/
├── backend/
│   ├── core/                     # Main Django application logic
│   │   ├── migrations/           # Database schema migration files
│   │   ├── static/               # Core application static assets
│   │   ├── templates/core/       # Django template views (feed, profiles, auth, etc.)
│   │   ├── admin.py              # Customized admin config, search filters, and widgets
│   │   ├── apps.py               # Django app settings and signal registries
│   │   ├── forms.py              # UserRegistration, Login, Update, and Post forms
│   │   ├── models.py             # Database definitions (Post, Comment, Like, Follow, Profile)
│   │   ├── signals.py            # Signals to automatically instantiate UserProfiles on registration
│   │   ├── urls.py               # Routing mappings for backend pages
│   │   └── views.py              # View controller logic and request handling
│   ├── socialsphere/             # Main project config directory
│   │   ├── settings.py           # Core Django settings & Jazzmin themes
│   │   ├── urls.py               # Root URL configuration (admin + core app routing)
│   │   ├── asgi.py               # ASGI server configuration
│   │   └── wsgi.py               # WSGI server configuration
│   ├── manage.py                 # Django CLI management executable
│   └── db.sqlite3                # SQLite database file
│
└── frontend/                     # Pure static client prototype (mockups and assets)
    ├── css/                      # Global theme styling (styles.css)
    ├── js/                       # Mockup client APIs (api.js, settings.js, layout.js)
    └── *.html                    # Static UI template files
```

---

##  Installation & Setup

Follow these steps to run SocialSphere on your local machine:

### 1. Prerequisites
Ensure you have Python 3.10+ installed on your computer.

### 2. Clone the Repository
```bash
git clone <repository-url>
cd SocialSphere
```

### 3. Initialize Python Virtual Environment
Navigate to the backend directory and set up a virtual environment:
```bash
cd backend
python -m venv venv
```

Activate the virtual environment:
*   **Windows (PowerShell):** `venv\Scripts\Activate.ps1`
*   **Windows (Command Prompt):** `venv\Scripts\activate.bat`
*   **macOS/Linux:** `source venv/bin/activate`

### 4. Install Dependencies
Install Django, Jazzmin, and Pillow for image processing:
```bash
pip install Django django-jazzmin Pillow
```

### 5. Database Setup & Migrations
Create the SQLite database tables and apply model structures:
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Admin Superuser
To access the premium admin panel, configure a superuser account:
```bash
python manage.py createsuperuser
```
*(Follow the terminal prompts to set up username, email, and password)*

### 7. Run the Project
Start the Django local development server:
```bash
python manage.py run server
```
Once initialized, open your browser and navigate to: `http://127.0.0.1:8000/`

### 8. Demo Credentials
To quickly test the application, you can use the following default credentials (if demo data is loaded):

**Admin Dashboard:**
*   **Username:** `admin`
*   **Password:** `admin123`

**Regular User:**
*   **Username:** `demo_user`
*   **Password:** `demo123`

---

##  User Workflow

1.  **Landing & Onboarding:** An unauthenticated visitor lands on the index page, where they can view statistics and preview post cards. They can click **Sign Up** to create an account or **Sign In** if already registered.
2.  **Registration:** The user registers by filling in the username, email, full name, and passwords. Upon submission, a `UserProfile` is automatically generated for them via Django signals, and they are automatically logged in and redirected to the feed.
3.  **Explore the Feed:** The feed displays posts from all creators. Users can like/unlike posts (via responsive AJAX calls) or click comments to view post details.
4.  **Creating a Post:** Utilizing the composer card in the feed, a user can write text and click the image icon to upload a photo (with instant visual preview). Clicking "Post" publishes it immediately.
5.  **Viewing Profiles:** Users can click on handles/avatars to view other users' profiles, where they can see posts count, followers, following, location, bio, and website.
6.  **Following System:** Users can click **Follow/Unfollow** on other creators' profiles. Followers/Following links allow users to inspect network connections.
7.  **Commenting:** Users can navigate to a post's detail page, write feedback in the comment box, and post comments. If they authored a comment, they can click "Delete" to remove it.
8.  **Settings & Personalization:** In Settings, users can access Edit Profile to change their profile photo, location, bio, or display names, and securely log out.

---

##  Admin Workflow

1.  **Login:** The administrator accesses the admin portal at `http://127.0.0.1:8000/admin/` using the superuser credentials.
2.  **Mission Control Dashboard:** The admin is presented with a customized dark-mode dashboard configured with navigation links, search capabilities, and model analytics.
3.  **User Management:** The admin can view list registers of all users, displaying their avatars, emails, locations, post counts, date joined, and staff statuses. Inlines allow editing user profiles directly inside the user page.
4.  **Content Moderation:** 
    *   **Posts:** View uploaded post images, captions, and statistics (likes/comments count). The admin can edit captions, remove images, or delete violating posts.
    *   **Comments:** Moderate comment threads. Comments can be inspected, searched, and deleted in bulk.
5.  **Relationship Inspection:** 
    *   **Likes:** Audit liked post indexes to track trending content.
    *   **Follows:** Inspect user connection directions (Follower $\rightarrow$ Following).

---

##  Database Tables

SocialSphere operates on a relational SQLite schema mapped using Django models:

### 1. `auth_user` (Django Default Model)
Represents registered credentials and system permissions.
*   `id` (Big Auto Key, Primary Key)
*   `username` (Varchar, Unique)
*   `email` (Varchar)
*   `first_name` (Varchar - Used as display name)
*   `password` (Varchar - Encrypted hash)
*   `is_staff` (Boolean)
*   `date_joined` (Datetime)

### 2. `UserProfile` (Extends User via One-to-One)
Stores customizable visual and text metadata for a user.
*   `id` (Big Auto Key, Primary Key)
*   `user` (One-to-One key referencing `auth_user.id`, CASCADE delete)
*   `profile_picture` (Image path, Nullable)
*   `bio` (Text, max 500 chars)
*   `location` (Varchar, max 100)
*   `website` (URL, blankable)
*   `created_date` (Datetime)

### 3. `Post`
Contains content published by users.
*   `id` (Big Auto Key, Primary Key)
*   `user` (Foreign Key referencing `auth_user.id`, CASCADE delete)
*   `caption` (Text, max 2000 chars)
*   `image` (Image path, Nullable)
*   `created_date` (Datetime)

### 4. `Comment`
Represents conversations under posts.
*   `id` (Big Auto Key, Primary Key)
*   `user` (Foreign Key referencing `auth_user.id`, CASCADE delete)
*   `post` (Foreign Key referencing `Post.id`, CASCADE delete)
*   `comment_text` (Text, max 1000 chars)
*   `created_date` (Datetime)

### 5. `Like`
Stores liking instances (Unique combination of User & Post).
*   `id` (Big Auto Key, Primary Key)
*   `user` (Foreign Key referencing `auth_user.id`, CASCADE delete)
*   `post` (Foreign Key referencing `Post.id`, CASCADE delete)
*   *Constraint:* `unique_together('user', 'post')`

### 6. `Follow`
Tracks user networking graphs.
*   `id` (Big Auto Key, Primary Key)
*   `follower` (Foreign Key referencing `auth_user.id`, CASCADE delete)
*   `following` (Foreign Key referencing `auth_user.id`, CASCADE delete)
*   *Constraint:* `unique_together('follower', 'following')`

---

##  Security Features

SocialSphere utilizes multiple layers of security protections built directly into Django:

*   **CSRF (Cross-Site Request Forgery) Tokens:** All state-modifying requests (forms) are validated using cryptographic token matches (`{% csrf_token %}`).
*   **SQL Injection Prevention:** Django's object-relational mapping (ORM) natively sanitizes database queries, eliminating raw query exposures.
*   **XSS (Cross-Site Scripting) Escaping:** HTML templates automatically sanitize tags to prevent malicious scripts from running in profile details or caption posts.
*   **Password Hashing:** Django stores user passwords using standard PBKDF2 hashing algorithms with SHA-256 signatures.
*   **Clickjacking Protection:** X-Frame-Options middleware prevents the site from being wrapped in click-jacking iframe contexts.

---

##  Future Improvements

Proposed features for future versions of SocialSphere:

1.  **Notification Triggers:** Add a database notification system to alert users when another creator likes their post, leaves a comment, or follows them.
2.  **Active Search:** Implement a search query interface on the backend to filter posts, trending tags, and users.
3.  **Feed Pagination:** Introduce server-side pagination to limit query overhead and load posts incrementally.
4.  **Database Indexing:** Add indices on sorting datetime columns (`created_date`) to optimize querying speeds on large datasets.
5.  **Dynamic Appearance Persistence:** Allow users to persist custom themes (Light/Dark) and accents directly to their database profiles rather than client-side `localStorage`.

---

##  Conclusion

SocialSphere is a modern social platform combining an engaging interface with robust backend controls. Using Django's templating and administrative engines, it offers an extensible base to expand into a production-grade social network.
