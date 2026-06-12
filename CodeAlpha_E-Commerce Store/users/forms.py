from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.core.exceptions import ValidationError

class BaseRegistrationForm(UserCreationForm):
    full_name = forms.CharField(max_length=150, required=True, label="Full Name")
    email = forms.EmailField(required=True, label="Email Address")

    class Meta:
        model = User
        fields = ['full_name', 'email']

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email__iexact=email).exists():
            raise ValidationError("A user with that email already exists.")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.username = self.cleaned_data['email']
        
        full_name = self.cleaned_data['full_name'].split(' ', 1)
        user.first_name = full_name[0]
        if len(full_name) > 1:
            user.last_name = full_name[1]

        if commit:
            user.save()
        return user

class BuyerRegistrationForm(BaseRegistrationForm):
    pass

class SellerRegistrationForm(BaseRegistrationForm):
    store_name = forms.CharField(max_length=255, required=True, label="Store Name / Business Name")

class RoleSelectionLoginForm(AuthenticationForm):
    role = forms.ChoiceField(choices=[('buyer', 'Buyer'), ('seller', 'Seller')], widget=forms.HiddenInput(), required=False)
    username = forms.CharField(label="Email", widget=forms.TextInput(attrs={'autofocus': True}))
