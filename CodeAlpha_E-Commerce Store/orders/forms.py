from django import forms
from .models import Order

class OrderCreateForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['first_name', 'last_name', 'email', 'address', 'postal_code', 'city']
        widgets = {
            'first_name': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'John'
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'Doe'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-input',
                'placeholder': 'john.doe@example.com'
            }),
            'address': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': '123 Main St, Apt 4B'
            }),
            'postal_code': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': '10001'
            }),
            'city': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'New York'
            }),
        }
