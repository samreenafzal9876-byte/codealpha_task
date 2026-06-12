from django.shortcuts import render, get_object_or_404
from .models import Product, Category
from django.db.models import Q

def home(request):
    featured_products = Product.objects.filter(is_active=True)[:3]
    categories = Category.objects.all()
    return render(request, 'products/home.html', {
        'featured_products': featured_products,
        'categories': categories
    })

def product_list(request):
    products = Product.objects.filter(is_active=True)
    categories = Category.objects.all()
    
    # 1. Search filter
    search_query = request.GET.get('search', '')
    if search_query:
        products = products.filter(
            Q(name__icontains=search_query) | Q(description__icontains=search_query)
        )
        
    # 2. Category filter
    category_slug = request.GET.get('category', '')
    selected_category = None
    if category_slug:
        selected_category = get_object_or_404(Category, slug=category_slug)
        products = products.filter(category=selected_category)
        
    # 3. Sorting options
    sort_option = request.GET.get('sort', '')
    if sort_option == 'price_asc':
        products = products.order_by('price')
    elif sort_option == 'price_desc':
        products = products.order_by('-price')
    elif sort_option == 'newest':
        products = products.order_by('-created_date')
        
    return render(request, 'products/product_list.html', {
        'products': products,
        'categories': categories,
        'selected_category': selected_category,
        'search_query': search_query,
        'sort_option': sort_option
    })

def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug, is_active=True)
    
    # Generate mock image gallery for UI demonstration
    mock_gallery = []
    if product.image:
        mock_gallery = [
            product.image.url,
            product.image.url,  # Duplicate for demo gallery thumbnails
            product.image.url
        ]
    
    return render(request, 'products/product_detail.html', {
        'product': product,
        'mock_gallery': mock_gallery
    })

def about_us(request):
    return render(request, 'products/about_us.html')

def contact_us(request):
    return render(request, 'products/contact_us.html')
