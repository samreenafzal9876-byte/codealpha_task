from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from products.models import Product, Category
from orders.models import Order, OrderItem

class OrderProcessingTests(TestCase):
    def setUp(self):
        self.client = Client()
        # Create Category and Product
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            category=self.category,
            name='Smartphone X',
            slug='smartphone-x',
            price=699.99,
            stock_quantity=10
        )
        
        # Create User
        self.username = 'testuser'
        self.password = 'testpassword'
        self.email = 'test@example.com'
        self.user = User.objects.create_user(
            username=self.username,
            password=self.password,
            email=self.email,
            first_name='John',
            last_name='Doe'
        )

    def test_checkout_redirects_for_anonymous_user(self):
        # Accessing checkout should redirect to login
        response = self.client.get(reverse('orders:order_create'))
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse('users:login'), response.url)

    def test_checkout_page_renders_for_logged_in_user_with_items(self):
        self.client.login(username=self.username, password=self.password)
        
        # Set up cart session
        session = self.client.session
        session['cart'] = {
            str(self.product.id): {
                'quantity': 2,
                'price': str(self.product.price)
            }
        }
        session.save()
        
        response = self.client.get(reverse('orders:order_create'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Smartphone X')
        self.assertContains(response, 'John')
        self.assertContains(response, 'Doe')

    def test_order_creation_and_stock_reduction(self):
        self.client.login(username=self.username, password=self.password)
        
        # Set up cart session
        session = self.client.session
        session['cart'] = {
            str(self.product.id): {
                'quantity': 2,
                'price': str(self.product.price)
            }
        }
        session.save()
        
        # Post valid shipping details
        post_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': self.email,
            'address': '456 Oak Rd',
            'postal_code': '94110',
            'city': 'San Francisco'
        }
        
        response = self.client.post(reverse('orders:order_create'), post_data)
        
        # Check order successfully created and redirected to success view
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 1)
        
        # Check stock reduced correctly (10 - 2 = 8)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 8)
        
        # Check cart cleared
        session = self.client.session
        self.assertNotIn('cart', session)

    def test_order_history_page(self):
        # Set user as staff to access dashboard
        self.user.is_staff = True
        self.user.save()
        
        self.client.login(username=self.username, password=self.password)
        
        # Create an order
        order = Order.objects.create(
            user=self.user,
            first_name='John',
            last_name='Doe',
            email=self.email,
            address='456 Oak Rd',
            postal_code='94110',
            city='San Francisco'
        )
        OrderItem.objects.create(
            order=order,
            product=self.product,
            price=self.product.price,
            quantity=1
        )
        
        response = self.client.get(reverse('dashboard:orders'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, f'#{order.id}')
        self.assertContains(response, 'John')

    def test_order_detail_page(self):
        self.client.login(username=self.username, password=self.password)
        
        # Create an order
        order = Order.objects.create(
            user=self.user,
            first_name='John',
            last_name='Doe',
            email=self.email,
            address='456 Oak Rd',
            postal_code='94110',
            city='San Francisco'
        )
        OrderItem.objects.create(
            order=order,
            product=self.product,
            price=self.product.price,
            quantity=1
        )
        
        response = self.client.get(reverse('orders:order_detail', args=[order.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, f'Order #{order.id}')
        self.assertContains(response, 'Smartphone X')
