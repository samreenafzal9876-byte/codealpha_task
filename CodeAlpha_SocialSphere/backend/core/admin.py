from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html, mark_safe
from django.utils.timesince import timesince
from django.db.models import Count
from .models import UserProfile, Post, Comment, Like, Follow


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN SITE BRANDING
# ─────────────────────────────────────────────────────────────────────────────
admin.site.site_header  = "⬡ SocialSphere Administration"
admin.site.site_title   = "SocialSphere Admin"
admin.site.index_title  = "Mission Control"


# ─────────────────────────────────────────────────────────────────────────────
# USER PROFILE INLINE (embedded inside User admin)
# ─────────────────────────────────────────────────────────────────────────────
class UserProfileInline(admin.StackedInline):
    model              = UserProfile
    can_delete         = False
    verbose_name_plural = "Profile Details"
    fk_name            = "user"
    fields             = ("profile_picture", "bio", "location", "website")
    extra              = 0


# ─────────────────────────────────────────────────────────────────────────────
# CUSTOM USER ADMIN — with inline profile + rich display
# ─────────────────────────────────────────────────────────────────────────────
class CustomUserAdmin(UserAdmin):
    inlines            = (UserProfileInline,)
    list_display       = ("avatar_tag", "username", "email", "full_name", "location_tag",
                          "posts_count", "followers_count", "is_staff", "date_joined_short")
    list_display_links = ("avatar_tag", "username")
    list_filter        = ("is_staff", "is_superuser", "is_active", "date_joined")
    search_fields      = ("username", "email", "first_name", "last_name", "profile__location")
    list_per_page      = 20
    ordering           = ("-date_joined",)
    list_select_related = ("profile",)

    def avatar_tag(self, obj):
        try:
            if obj.profile.profile_picture:
                return format_html(
                    '<img src="{}" width="36" height="36" '
                    'style="border-radius:50%; object-fit:cover; border:2px solid #6366f1;" />',
                    obj.profile.profile_picture.url
                )
        except Exception:
            pass
        return format_html(
            '<div style="width:36px;height:36px;border-radius:50%;'
            'background:linear-gradient(135deg,#6366f1,#a855f7);'
            'display:flex;align-items:center;justify-content:center;color:white;font-weight:700;'
            'font-size:0.85rem;">'
            '{}</div>',
            obj.username[0].upper()
        )
    avatar_tag.short_description = ""

    def full_name(self, obj):
        name = obj.get_full_name()
        return name if name else "—"
    full_name.short_description = "Full Name"

    def location_tag(self, obj):
        try:
            loc = obj.profile.location
            return format_html('<span style="color:#8b9dc3;">{}</span>', loc) if loc else "—"
        except Exception:
            return "—"
    location_tag.short_description = "📍 Location"

    def posts_count(self, obj):
        count = obj.posts.count()
        return format_html(
            '<span style="background:#10b981;color:white;padding:3px 10px;'
            'border-radius:9999px;font-size:0.72rem;font-weight:700;">{}</span>', count
        )
    posts_count.short_description = "📝 Posts"

    def followers_count(self, obj):
        count = obj.followers.count()
        return format_html(
            '<span style="background:linear-gradient(135deg,#6366f1,#a855f7);color:white;padding:3px 10px;'
            'border-radius:9999px;font-size:0.72rem;font-weight:700;">{}</span>', count
        )
    followers_count.short_description = "👥 Followers"

    def date_joined_short(self, obj):
        return timesince(obj.date_joined) + " ago"
    date_joined_short.short_description = "🕒 Joined"

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return []
        return super().get_inline_instances(request, obj)


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


# ─────────────────────────────────────────────────────────────────────────────
# USER PROFILE ADMIN
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display   = ("avatar_tag", "user", "location", "website_link", "created_date")
    list_display_links = ("avatar_tag", "user")
    list_filter    = ("created_date",)
    search_fields  = ("user__username", "user__email", "location", "bio")
    readonly_fields = ("created_date", "avatar_preview")
    ordering       = ("-created_date",)
    list_per_page  = 20

    fieldsets = (
        ("👤 User", {
            "fields": ("user",),
        }),
        ("🖼️ Profile Picture", {
            "fields": ("avatar_preview", "profile_picture"),
        }),
        ("📝 Bio & Details", {
            "fields": ("bio", "location", "website"),
        }),
        ("🕒 Timestamps", {
            "classes": ("collapse",),
            "fields": ("created_date",),
        }),
    )

    def avatar_tag(self, obj):
        if obj.profile_picture:
            return format_html(
                '<img src="{}" width="36" height="36" '
                'style="border-radius:50%;object-fit:cover;border:2px solid #10b981;" />',
                obj.profile_picture.url
            )
        return format_html(
            '<div style="width:36px;height:36px;border-radius:50%;'
            'background:linear-gradient(135deg,#6366f1,#a855f7);'
            'display:flex;align-items:center;justify-content:center;color:white;font-weight:700;'
            'font-size:0.85rem;">'
            '{}</div>',
            obj.user.username[0].upper()
        )
    avatar_tag.short_description = ""

    def avatar_preview(self, obj):
        if obj.profile_picture:
            return format_html(
                '<img src="{}" width="100" height="100" '
                'style="border-radius:50%;object-fit:cover;border:3px solid #6366f1;'
                'box-shadow:0 0 20px rgba(99,102,241,0.25);" />',
                obj.profile_picture.url
            )
        return "No picture uploaded"
    avatar_preview.short_description = "Current Photo"

    def website_link(self, obj):
        if obj.website:
            return format_html('<a href="{}" target="_blank" style="color:#6366f1;font-weight:500;">{}</a>',
                               obj.website, obj.website)
        return "—"
    website_link.short_description = "🔗 Website"


# ─────────────────────────────────────────────────────────────────────────────
# COMMENT INLINE (embedded inside Post admin)
# ─────────────────────────────────────────────────────────────────────────────
class CommentInline(admin.TabularInline):
    model      = Comment
    extra      = 0
    fields     = ("user", "comment_text", "created_date")
    readonly_fields = ("created_date",)
    show_change_link = True


# ─────────────────────────────────────────────────────────────────────────────
# POST ADMIN
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display   = ("image_tag", "author_tag", "caption_preview", "likes_badge",
                      "comments_badge", "has_image", "created_date")
    list_display_links = ("image_tag", "author_tag")
    list_filter    = ("created_date", "user")
    search_fields  = ("user__username", "caption")
    readonly_fields = ("created_date", "image_preview", "likes_count_display", "comments_count_display")
    ordering       = ("-created_date",)
    list_per_page  = 15
    inlines        = [CommentInline]
    date_hierarchy = "created_date"

    fieldsets = (
        ("✍️ Post Content", {
            "fields": ("user", "caption"),
        }),
        ("🖼️ Image", {
            "fields": ("image_preview", "image"),
        }),
        ("📊 Stats", {
            "fields": ("likes_count_display", "comments_count_display"),
        }),
        ("🕒 Timestamps", {
            "classes": ("collapse",),
            "fields": ("created_date",),
        }),
    )

    def image_tag(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="48" height="48" '
                'style="border-radius:10px;object-fit:cover;border:1px solid rgba(255,255,255,0.08);" />',
                obj.image.url
            )
        return mark_safe(
            '<div style="width:48px;height:48px;border-radius:10px;'
            'background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.1));'
            'display:flex;align-items:center;justify-content:center;color:#8b9dc3;font-size:1.1rem;">'
            '📝</div>'
        )
    image_tag.short_description = ""

    def author_tag(self, obj):
        return format_html(
            '<strong style="color:#6366f1;">@{}</strong>',
            obj.user.username
        )
    author_tag.short_description = "👤 Author"

    def caption_preview(self, obj):
        text = obj.caption[:80] + ("…" if len(obj.caption) > 80 else "")
        return format_html('<span style="color:#8b9dc3;">{}</span>', text)
    caption_preview.short_description = "📄 Caption"

    def likes_badge(self, obj):
        count = obj.likes.count()
        return format_html(
            '<span style="background:linear-gradient(135deg,#f43f5e,#e11d48);color:white;padding:3px 10px;'
            'border-radius:9999px;font-size:0.72rem;font-weight:700;">❤️ {}</span>', count
        )
    likes_badge.short_description = "Likes"

    def comments_badge(self, obj):
        count = obj.comments.count()
        return format_html(
            '<span style="background:linear-gradient(135deg,#0ea5e9,#0284c7);color:white;padding:3px 10px;'
            'border-radius:9999px;font-size:0.72rem;font-weight:700;">💬 {}</span>', count
        )
    comments_badge.short_description = "Comments"

    def has_image(self, obj):
        if obj.image:
            return mark_safe('<span style="color:#10b981;font-weight:700;">✔ Yes</span>')
        return mark_safe('<span style="color:#ef4444;">✘ No</span>')
    has_image.short_description = "🖼️ Image"

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width:400px;max-height:300px;'
                'border-radius:14px;border:1px solid rgba(255,255,255,0.08);'
                'box-shadow:0 4px 20px rgba(0,0,0,0.3);" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = "Image Preview"

    def likes_count_display(self, obj):
        return obj.likes.count()
    likes_count_display.short_description = "Total Likes"

    def comments_count_display(self, obj):
        return obj.comments.count()
    comments_count_display.short_description = "Total Comments"


# ─────────────────────────────────────────────────────────────────────────────
# COMMENT ADMIN
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display   = ("user_tag", "post_link", "comment_preview", "created_date")
    list_display_links = ("user_tag",)
    list_filter    = ("created_date", "user")
    search_fields  = ("user__username", "comment_text", "post__caption")
    readonly_fields = ("created_date",)
    ordering       = ("-created_date",)
    list_per_page  = 25
    date_hierarchy = "created_date"

    fieldsets = (
        ("💬 Comment", {
            "fields": ("user", "post", "comment_text"),
        }),
        ("🕒 Timestamps", {
            "classes": ("collapse",),
            "fields": ("created_date",),
        }),
    )

    def user_tag(self, obj):
        return format_html('<strong style="color:#6366f1;">@{}</strong>', obj.user.username)
    user_tag.short_description = "👤 Author"

    def post_link(self, obj):
        text = obj.post.caption[:40] + ("…" if len(obj.post.caption) > 40 else "")
        return format_html('<span style="color:#8b9dc3;">{}</span>', text)
    post_link.short_description = "📝 On Post"

    def comment_preview(self, obj):
        text = obj.comment_text[:80] + ("…" if len(obj.comment_text) > 80 else "")
        return format_html('<span style="color:#8b9dc3;">{}</span>', text)
    comment_preview.short_description = "💬 Comment"


# ─────────────────────────────────────────────────────────────────────────────
# LIKE ADMIN
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display   = ("user_tag", "post_preview", "liked_at_approx")
    list_display_links = ("user_tag",)
    list_filter    = ("user",)
    search_fields  = ("user__username", "post__caption")
    list_per_page  = 30

    def user_tag(self, obj):
        return format_html(
            '<span style="background:linear-gradient(135deg,#f43f5e,#e11d48);color:white;padding:3px 10px;'
            'border-radius:9999px;font-size:0.78rem;font-weight:600;">❤️ @{}</span>',
            obj.user.username
        )
    user_tag.short_description = "User"

    def post_preview(self, obj):
        text = obj.post.caption[:60] + ("…" if len(obj.post.caption) > 60 else "")
        return format_html('<span style="color:#8b9dc3;">{}</span>', text)
    post_preview.short_description = "Liked Post"

    def liked_at_approx(self, obj):
        return mark_safe('<span style="color:#5a6a8a;">—</span>')
    liked_at_approx.short_description = "When"


# ─────────────────────────────────────────────────────────────────────────────
# FOLLOW ADMIN
# ─────────────────────────────────────────────────────────────────────────────
@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display   = ("follower_tag", "arrow", "following_tag")
    list_display_links = ("follower_tag",)
    list_filter    = ("follower", "following")
    search_fields  = ("follower__username", "following__username")
    list_per_page  = 30

    def follower_tag(self, obj):
        return format_html(
            '<span style="background:linear-gradient(135deg,#6366f1,#a855f7);color:white;padding:3px 12px;'
            'border-radius:9999px;font-size:0.78rem;font-weight:600;">@{}</span>',
            obj.follower.username
        )
    follower_tag.short_description = "👤 Follower"

    def arrow(self, obj):
        return mark_safe('<span style="color:#10b981;font-weight:700;font-size:0.85rem;">→ follows →</span>')
    arrow.short_description = ""

    def following_tag(self, obj):
        return format_html(
            '<span style="background:linear-gradient(135deg,#10b981,#059669);color:white;padding:3px 12px;'
            'border-radius:9999px;font-size:0.78rem;font-weight:600;">@{}</span>',
            obj.following.username
        )
    following_tag.short_description = "🎯 Following"
