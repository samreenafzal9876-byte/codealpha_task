from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import Post, Comment, Like, Follow
from .forms import UserRegistrationForm, UserLoginForm, UserUpdateForm, UserProfileForm, PostForm, CommentForm

def landing_view(request):
    if request.user.is_authenticated:
        return redirect('feed')
    return render(request, 'core/index.html')

def register_view(request):
    if request.user.is_authenticated:
        return redirect('feed')
    
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Welcome to SocialSphere, {user.first_name}!")
            return redirect('feed')
    else:
        form = UserRegistrationForm()
        
    return render(request, 'core/register.html', {'form': form})

def login_view(request):
    if request.user.is_authenticated:
        return redirect('feed')

    if request.method == 'POST':
        form = UserLoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f"Welcome back, {user.username}!")
            return redirect('feed')
    else:
        form = UserLoginForm()
        
    return render(request, 'core/login.html', {'form': form})

def logout_view(request):
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('login')

@login_required(login_url='login')
def feed_view(request):
    posts = Post.objects.all().order_by('-created_date')
    form = PostForm()
    # Check what posts are liked by the current user
    liked_posts_ids = Like.objects.filter(user=request.user).values_list('post_id', flat=True)
    return render(request, 'core/feed.html', {
        'posts': posts,
        'form': form,
        'liked_posts_ids': liked_posts_ids
    })

@login_required(login_url='login')
def profile_view(request, username):
    profile_user = get_object_or_404(User, username=username)
    # Ensure profile exists
    if not hasattr(profile_user, 'profile'):
        from .models import UserProfile
        UserProfile.objects.create(user=profile_user)
    posts = profile_user.posts.all().order_by('-created_date')
    
    # Check if request.user is following profile_user
    is_following = Follow.objects.filter(follower=request.user, following=profile_user).exists()
    
    # Check what posts are liked by current user
    liked_posts_ids = Like.objects.filter(user=request.user).values_list('post_id', flat=True)

    context = {
        'profile_user': profile_user,
        'profile': profile_user.profile,
        'posts': posts,
        'is_following': is_following,
        'liked_posts_ids': liked_posts_ids
    }
    return render(request, 'core/profile.html', context)

@login_required(login_url='login')
def edit_profile_view(request):
    # Ensure profile exists
    if not hasattr(request.user, 'profile'):
        from .models import UserProfile
        UserProfile.objects.create(user=request.user)

    if request.method == 'POST':
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = UserProfileForm(request.POST, request.FILES, instance=request.user.profile)
        if u_form.is_valid() and p_form.is_valid():
            u_form.save()
            p_form.save()
            messages.success(request, "Your profile has been updated!")
            return redirect('profile', username=request.user.username)
    else:
        u_form = UserUpdateForm(instance=request.user)
        p_form = UserProfileForm(instance=request.user.profile)

    context = {
        'u_form': u_form,
        'p_form': p_form
    }
    return render(request, 'core/edit_profile.html', context)

@login_required(login_url='login')
def create_post_view(request):
    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            post = form.save(commit=False)
            post.user = request.user
            post.save()
            messages.success(request, "Post published! 🎉")
            return redirect('feed')
    else:
        form = PostForm()
    return render(request, 'core/create_post.html', {'form': form})

@login_required(login_url='login')
def edit_post_view(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if post.user != request.user:
        messages.error(request, "You are not authorized to edit this post.")
        return redirect('feed')
    
    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES, instance=post)
        if form.is_valid():
            form.save()
            messages.success(request, "Post updated successfully!")
            return redirect('post_detail', pk=post.pk)
    else:
        form = PostForm(instance=post)
    return render(request, 'core/edit_post.html', {'form': form, 'post': post})

@login_required(login_url='login')
def delete_post_view(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if post.user != request.user:
        messages.error(request, "You are not authorized to delete this post.")
        return redirect('feed')
    
    if request.method == 'POST':
        post.delete()
        messages.success(request, "Post deleted successfully.")
        return redirect('feed')
    return render(request, 'core/delete_post.html', {'post': post})

@login_required(login_url='login')
def post_detail_view(request, pk):
    post = get_object_or_404(Post, pk=pk)
    comments = post.comments.all().order_by('-created_date')
    liked = Like.objects.filter(user=request.user, post=post).exists()
    
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.user = request.user
            comment.post = post
            comment.save()
            messages.success(request, "Comment added!")
            return redirect('post_detail', pk=post.pk)
    else:
        form = CommentForm()
        
    return render(request, 'core/post_details.html', {
        'post': post,
        'comments': comments,
        'form': form,
        'liked': liked
    })

@login_required(login_url='login')
def delete_comment_view(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    if comment.user != request.user:
        messages.error(request, "You are not authorized to delete this comment.")
        return redirect('post_detail', pk=comment.post.pk)
    
    post_pk = comment.post.pk
    comment.delete()
    messages.success(request, "Comment deleted successfully.")
    return redirect('post_detail', pk=post_pk)

@csrf_exempt
@login_required(login_url='login')
def toggle_like_view(request, pk):
    post = get_object_or_404(Post, pk=pk)
    like_qs = Like.objects.filter(user=request.user, post=post)
    if like_qs.exists():
        like_qs.delete()
        liked = False
    else:
        Like.objects.create(user=request.user, post=post)
        liked = True
    return JsonResponse({
        'liked': liked,
        'likes_count': post.likes.count()
    })

@login_required(login_url='login')
def toggle_follow_view(request, username):
    target_user = get_object_or_404(User, username=username)
    if target_user == request.user:
        messages.error(request, "You cannot follow yourself.")
        return redirect('profile', username=username)
        
    follow_qs = Follow.objects.filter(follower=request.user, following=target_user)
    if follow_qs.exists():
        follow_qs.delete()
        messages.success(request, f"Unfollowed @{target_user.username}")
    else:
        Follow.objects.create(follower=request.user, following=target_user)
        messages.success(request, f"Following @{target_user.username}")
    return redirect('profile', username=username)

@login_required(login_url='login')
def followers_list_view(request, username):
    profile_user = get_object_or_404(User, username=username)
    followers = profile_user.followers.all()
    followers_users = [f.follower for f in followers]
    return render(request, 'core/followers.html', {
        'profile_user': profile_user,
        'followers': followers_users
    })

@login_required(login_url='login')
def following_list_view(request, username):
    profile_user = get_object_or_404(User, username=username)
    following = profile_user.following.all()
    following_users = [f.following for f in following]
    return render(request, 'core/following.html', {
        'profile_user': profile_user,
        'following': following_users
    })


@login_required(login_url='login')
def notifications_view(request):
    return render(request, 'core/notifications.html')

@login_required(login_url='login')
def settings_view(request):
    return render(request, 'core/settings.html')
