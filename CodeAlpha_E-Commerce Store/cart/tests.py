from django.test import TestCase, Client
from django.urls import reverse
from products.models import Product, Category
from cart.cart import Cart

class ShoppingCartTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product1 = Product.objects.create(
            category=self.category,
            name='Gadget A',
            slug='gadget-a',
            price=100.00,
            stock_quantity=5
        )
        self.product2 = Product.objects.create(
            category=self.category,
            name='Gadget B',
            slug='gadget-b',
            price=150.00,
            stock_quantity=3
        )

    def test_cart_add_item_view(self):
        # Post to add product1 with quantity=2
        response = self.client.post(reverse('cart:cart_add', args=[self.product1.id]), {'quantity': 2})
        self.assertEqual(response.status_code, 302) # Redirects to cart_detail
        
        # Check session contains the item
        session = self.client.session
        self.assertIn('cart', session)
        self.assertIn(str(self.product1.id), session['cart'])
        self.assertEqual(session['cart'][str(self.product1.id)]['quantity'], 2)

    def test_cart_override_quantity(self):
        # Initial add
        self.client.post(reverse('cart:cart_add', args=[self.product1.id]), {'quantity': 1})
        # Override to 4
        self.client.post(reverse('cart:cart_add', args=[self.product1.id]), {'quantity': 4, 'override': 'True'})
        
        session = self.client.session
        self.assertEqual(session['cart'][str(self.product1.id)]['quantity'], 4)

    def test_cart_remove_item_view(self):
        # Add item first
        self.client.post(reverse('cart:cart_add', args=[self.product1.id]), {'quantity': 2})
        
        # Remove item
        response = self.client.post(reverse('cart:cart_remove', args=[self.product1.id]))
        self.assertEqual(response.status_code, 302)
        
        # Check session item is removed
        session = self.client.session
        self.assertNotIn(str(self.product1.id), session['cart'])

    def test_cart_total_calculations_on_detail_page(self):
        # Add product1 (qty 2 * 100.00) and product2 (qty 1 * 150.00)
        self.client.post(reverse('cart:cart_add', args=[self.product1.id]), {'quantity': 2})
        self.client.post(reverse('cart:cart_add', args=[self.product2.id]), {'quantity': 1})
        
        response = self.client.get(reverse('cart:cart_detail'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Gadget A')
        self.assertContains(response, 'Gadget B')
        self.assertContains(response, '$350.00') # Subtotal / Total price (200 + 150)
