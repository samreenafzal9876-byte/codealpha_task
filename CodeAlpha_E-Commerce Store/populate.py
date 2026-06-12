import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_store.settings')
django.setup()

from django.contrib.auth.models import User
from products.models import Category, Product
from orders.models import Order, OrderItem

def populate():
    # 1. Create sample categories
    cat1, _ = Category.objects.get_or_create(name='Electronics', slug='electronics', description='Gadgets and devices')
    cat2, _ = Category.objects.get_or_create(name='Clothing', slug='clothing', description='Apparel and fashion')

    # 2. Create sample products
    prod1, _ = Product.objects.get_or_create(
        category=cat1,
        name='Smartphone X',
        slug='smartphone-x',
        defaults={
            'description': 'Latest smartphone with 5G capabilities',
            'price': 699.99,
            'stock_quantity': 50
        }
    )

    prod2, _ = Product.objects.get_or_create(
        category=cat1,
        name='Wireless Headphones',
        slug='wireless-headphones',
        defaults={
            'description': 'Noise-cancelling wireless headphones',
            'price': 199.99,
            'stock_quantity': 200
        }
    )

    prod3, _ = Product.objects.get_or_create(
        category=cat2,
        name='Cotton T-Shirt',
        slug='cotton-t-shirt',
        defaults={
            'description': '100% pure cotton comfortable t-shirt',
            'price': 19.99,
            'stock_quantity': 100
        }
    )

    print("Successfully populated database with sample products.")

    # 3. Create a sample User
    user, user_created = User.objects.get_or_create(username='testuser', email='test@example.com')
    if user_created:
        user.set_password('testpassword')
        user.first_name = 'Test'
        user.last_name = 'User'
        user.save()
        print("Successfully created test user 'testuser' with password 'testpassword'.")
    else:
        print("Test user 'testuser' already exists.")

    # 4. Create a sample Order for the user (only if they don't have orders yet)
    if not Order.objects.filter(user=user).exists():
        order = Order.objects.create(
            user=user,
            first_name='Test',
            last_name='User',
            email='test@example.com',
            address='123 Tech Lane',
            postal_code='94016',
            city='San Francisco',
            paid=True
        )
        
        # Add OrderItems
        OrderItem.objects.create(
            order=order,
            product=prod1,
            price=prod1.price,
            quantity=1
        )
        OrderItem.objects.create(
            order=order,
            product=prod2,
            price=prod2.price,
            quantity=2
        )
        print("Successfully created a sample order for 'testuser'.")
    else:
        print("Sample order for 'testuser' already exists.")

if __name__ == '__main__':
    populate()
