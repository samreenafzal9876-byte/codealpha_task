from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import BuyerRegistrationForm, SellerRegistrationForm, RoleSelectionLoginForm

def register(request):
    if request.user.is_authenticated:
        if hasattr(request.user, 'profile') and request.user.profile.role == 'seller':
            return redirect('dashboard:index')
        return redirect('products:product_list')

    if request.method == 'POST':
        role = request.POST.get('role', 'buyer')
        if role == 'seller':
            form = SellerRegistrationForm(request.POST)
        else:
            form = BuyerRegistrationForm(request.POST)

        if form.is_valid():
            user = form.save()
            user.profile.role = role
            if role == 'seller':
                user.profile.store_name = form.cleaned_data.get('store_name')
                user.is_staff = True
                user.save()
            user.profile.save()
            
            messages.success(request, f'Account created successfully! Please log in as a {role.title()}.')
            return redirect(f'/users/login/?role={role}')
    else:
        buyer_form = BuyerRegistrationForm()
        seller_form = SellerRegistrationForm()
        return render(request, 'users/register.html', {
            'buyer_form': buyer_form, 
            'seller_form': seller_form,
            'active_tab': 'buyer'
        })
    
    buyer_form = form if request.POST.get('role') == 'buyer' else BuyerRegistrationForm()
    seller_form = form if request.POST.get('role') == 'seller' else SellerRegistrationForm()
    
    return render(request, 'users/register.html', {
        'buyer_form': buyer_form,
        'seller_form': seller_form,
        'active_tab': request.POST.get('role', 'buyer')
    })


def custom_login(request):
    if request.user.is_authenticated:
        if hasattr(request.user, 'profile') and request.user.profile.role == 'seller':
            return redirect('dashboard:index')
        return redirect('products:product_list')

    if request.method == 'POST':
        form = RoleSelectionLoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            role = request.POST.get('role', 'buyer')
            
            if not hasattr(user, 'profile'):
                from .models import UserProfile
                UserProfile.objects.create(user=user, role='seller' if user.is_staff else 'buyer')
            
            if user.profile.role == role or user.is_superuser:
                login(request, user)
                if role == 'seller' or user.profile.role == 'seller':
                    return redirect('dashboard:index')
                else:
                    return redirect('products:product_list')
            else:
                messages.error(request, f"Invalid role selected. You are registered as a {user.profile.role.title()}.")
    else:
        form = RoleSelectionLoginForm()

    active_tab = request.GET.get('role', 'buyer')
    return render(request, 'users/login.html', {'form': form, 'active_tab': active_tab})


@login_required(login_url='users:login')
def profile(request):
    if hasattr(request.user, 'profile') and request.user.profile.role == 'seller':
        return redirect('dashboard:index')
        
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        
        request.user.first_name = first_name
        request.user.last_name = last_name
        request.user.email = email
        request.user.save()
        
        messages.success(request, 'Your profile details have been updated successfully.')
        return redirect('users:profile')
        
    return render(request, 'users/profile.html')
