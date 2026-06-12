from django.test import TestCase, Client
from django.urls import reverse
from .models import Category, Product

class ProductCatalogTests(TestCase):
    def setUp(self):
        self.client = Client()
        
        # Create categories
        self.cat_electronics = Category.objects.create(name='Electronics', slug='electronics')
        self.cat_clothing = Category.objects.create(name='Clothing', slug='clothing')
        
        # Create products
        self.product_phone = Product.objects.create(
            category=self.cat_electronics,
            name='Aura Phone',
            slug='aura-phone',
            price=799.99,
            stock_quantity=5,
            description='A premium tech product.'
        )
        self.product_shirt = Product.objects.create(
            category=self.cat_clothing,
            name='Indigo Tee',
            slug='indigo-tee',
            price=29.99,
            stock_quantity=10,
            description='Comfortable classic style tee.'
        )

    def test_category_and_product_creation(self):
        self.assertEqual(self.cat_electronics.name, 'Electronics')
        self.assertEqual(self.product_phone.name, 'Aura Phone')
        self.assertEqual(self.product_phone.slug, 'aura-phone')
        self.assertEqual(self.product_phone.category, self.cat_electronics)

    def test_product_list_view_all(self):
        response = self.client.get(reverse('products:product_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Aura Phone')
        self.assertContains(response, 'Indigo Tee')

    def test_product_list_view_filtered_by_category(self):
        response = self.client.get(reverse('products:product_list'), {'category': 'electronics'})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Aura Phone')
        self.assertNotContains(response, 'Indigo Tee')

    def test_product_list_view_search(self):
        response = self.client.get(reverse('products:product_list'), {'search': 'Indigo'})
        self.assertEqual(response.status_code, 200)
        self.assertNotContains(response, 'Aura Phone')
        self.assertContains(response, 'Indigo Tee')

    def test_product_list_view_sorting_price_asc(self):
        response = self.client.get(reverse('products:product_list'), {'sort': 'price_asc'})
        self.assertEqual(response.status_code, 200)
        # Verify both products are loaded
        self.assertContains(response, 'Aura Phone')
        self.assertContains(response, 'Indigo Tee')

    def test_product_detail_view(self):
        response = self.client.get(reverse('products:product_detail', args=['aura-phone']))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Aura Phone')
        self.assertContains(response, 'A premium tech product.')
        self.assertContains(response, '$799.99')
