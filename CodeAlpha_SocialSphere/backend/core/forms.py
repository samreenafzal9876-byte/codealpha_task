from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.core.exceptions import ValidationError

class UserRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(max_length=50, required=True, label="Full Name")

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('username', 'email', 'first_name')

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("A user with that email already exists.")
        return email

class UserLoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'input-field', 'placeholder': 'Enter your username'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'input-field', 'placeholder': '••••••••'}))

from .models import UserProfile

class UserUpdateForm(forms.ModelForm):
    first_name = forms.CharField(max_length=50, required=True, label="Display Name", widget=forms.TextInput(attrs={'class': 'input-field', 'placeholder': 'Your display name'}))

    class Meta:
        model = User
        fields = ('first_name',)

class UserProfileForm(forms.ModelForm):
    profile_picture = forms.ImageField(required=False, widget=forms.FileInput(attrs={'style': 'display:none;', 'id': 'profile-pic-input'}))
    bio = forms.CharField(required=False, widget=forms.Textarea(attrs={'class': 'input-field', 'placeholder': 'Tell the world about yourself...', 'maxlength': '160', 'rows': 4}))
    location = forms.CharField(required=False, widget=forms.TextInput(attrs={'class': 'input-field', 'placeholder': 'Where are you based?'}))
    website = forms.URLField(required=False, widget=forms.TextInput(attrs={'class': 'input-field', 'placeholder': 'yoursite.com'}))

    class Meta:
        model = UserProfile
        fields = ('profile_picture', 'bio', 'location', 'website')

from .models import Post

class PostForm(forms.ModelForm):
    caption = forms.CharField(widget=forms.Textarea(attrs={'class': 'input-field', 'placeholder': 'What is happening in your sphere? Share your thoughts...', 'style': 'min-height:160px; resize:vertical;'}))
    image = forms.ImageField(required=False, widget=forms.FileInput(attrs={'id': 'create-pic-input', 'style': 'display:none;'}))

    class Meta:
        model = Post
        fields = ('caption', 'image')

from .models import Comment

class CommentForm(forms.ModelForm):
    comment_text = forms.CharField(widget=forms.Textarea(attrs={'class': 'input-field', 'placeholder': 'Write a comment…', 'style': 'min-height:60px; flex:1; resize: none;'}))

    class Meta:
        model = Comment
        fields = ('comment_text',)

