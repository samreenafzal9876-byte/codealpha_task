import os
import django
from django.core.files import File

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_store.settings')
django.setup()

from products.models import Product

def attach_images():
    try:
        smartphone = Product.objects.get(slug='smartphone-x')
        headphones = Product.objects.get(slug='wireless-headphones')
        tshirt = Product.objects.get(slug='cotton-t-shirt')
        
        with open(r"C:\Users\itnextro\.gemini\antigravity\brain\9c7e238b-57b2-4caa-bb24-3d6a648ee86a\smartphone_mockup_1780679264530.png", 'rb') as f:
            smartphone.image.save('smartphone.png', File(f), save=True)
            
        with open(r"C:\Users\itnextro\.gemini\antigravity\brain\9c7e238b-57b2-4caa-bb24-3d6a648ee86a\headphones_mockup_1780679277965.png", 'rb') as f:
            headphones.image.save('headphones.png', File(f), save=True)
            
        with open(r"C:\Users\itnextro\.gemini\antigravity\brain\9c7e238b-57b2-4caa-bb24-3d6a648ee86a\tshirt_mockup_1780679290530.png", 'rb') as f:
            tshirt.image.save('tshirt.png', File(f), save=True)
            
        print("Images attached successfully.")
    except Exception as e:
        print(f"Error attaching images: {e}")

if __name__ == '__main__':
    attach_images()
