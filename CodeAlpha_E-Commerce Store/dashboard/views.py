from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.admin.views.decorators import staff_member_required
from products.models import Product, Category
from orders.models import Order, OrderItem
from django.contrib.auth.models import User
from django.db.models import Sum, F
from django.contrib import messages
from django.views.decorators.http import require_POST

@staff_member_required(login_url='users:admin_login')
def dashboard_index(request):
    total_orders = Order.objects.count()
    revenue = OrderItem.objects.filter(order__paid=True).aggregate(
        total=Sum(F('price') * F('quantity'))
    )['total']
    total_revenue = round(revenue, 2) if revenue is not None else 0.00
    total_products = Product.objects.count()
    total_customers = User.objects.filter(is_staff=False).count()
    recent_orders = Order.objects.all().order_by('-created')[:5]
    
    return render(request, 'dashboard/index.html', {
        'total_orders': total_orders,
        'total_revenue': total_revenue,
        'total_products': total_products,
        'total_customers': total_customers,
        'recent_orders': recent_orders,
        'active_menu': 'dashboard'
    })

@staff_member_required(login_url='users:admin_login')
def products_view(request):
    products = Product.objects.all()
    categories = Category.objects.all()
    return render(request, 'dashboard/products.html', {
        'products': products,
        'categories': categories,
        'active_menu': 'products'
    })

@staff_member_required(login_url='users:admin_login')
def categories_view(request):
    categories = Category.objects.all()
    return render(request, 'dashboard/categories.html', {
        'categories': categories,
        'active_menu': 'categories'
    })

@staff_member_required(login_url='users:admin_login')
def orders_view(request):
    orders = Order.objects.all().order_by('-created')
    return render(request, 'dashboard/orders.html', {
        'orders': orders,
        'active_menu': 'orders'
    })

@staff_member_required(login_url='users:admin_login')
def order_details_view(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    return render(request, 'dashboard/order_details.html', {
        'order': order,
        'active_menu': 'orders'
    })

@staff_member_required(login_url='users:admin_login')
def users_view(request):
    users = User.objects.all()
    return render(request, 'dashboard/users.html', {
        'users': users,
        'active_menu': 'users'
    })

@staff_member_required(login_url='users:admin_login')
def customers_view(request):
    customers = User.objects.filter(is_staff=False)
    return render(request, 'dashboard/customers.html', {
        'customers': customers,
        'active_menu': 'customers'
    })

@staff_member_required(login_url='users:admin_login')
def customer_details_view(request, customer_id):
    customer = get_object_or_404(User, id=customer_id)
    orders = Order.objects.filter(user=customer)
    return render(request, 'dashboard/customer_details.html', {
        'customer': customer,
        'orders': orders,
        'active_menu': 'customers'
    })

@staff_member_required(login_url='users:admin_login')
def reports_view(request):
    # Mock data for charts and tables
    sales_data = [
        {'month': 'Jan', 'sales': 45, 'revenue': 1200.00},
        {'month': 'Feb', 'sales': 60, 'revenue': 2500.00},
        {'month': 'Mar', 'sales': 85, 'revenue': 3800.00},
        {'month': 'Apr', 'sales': 120, 'revenue': 5600.00},
        {'month': 'May', 'sales': 150, 'revenue': 7200.00},
    ]
    return render(request, 'dashboard/reports.html', {
        'sales_data': sales_data,
        'active_menu': 'reports'
    })

@staff_member_required(login_url='users:admin_login')
def settings_view(request):
    return render(request, 'dashboard/settings.html', {
        'active_menu': 'settings'
    })


@staff_member_required(login_url='users:admin_login')
@require_POST
def add_user_view(request):
    username = request.POST.get('username')
    email = request.POST.get('email')
    password = request.POST.get('password')
    role = request.POST.get('role')
    
    if not username or not password:
        messages.error(request, 'Username and Password are required.')
        return redirect('dashboard:users')
        
    try:
        if User.objects.filter(username=username).exists():
            messages.error(request, f'Username "{username}" already exists.')
            return redirect('dashboard:users')
            
        user = User.objects.create_user(username=username, email=email, password=password)
        if role == 'Superuser':
            user.is_staff = True
            user.is_superuser = True
        elif role == 'Staff Admin':
            user.is_staff = True
            user.is_superuser = False
        else:
            user.is_staff = False
            user.is_superuser = False
        user.save()
        messages.success(request, f'User "{username}" created successfully.')
    except Exception as e:
        messages.error(request, f'Error creating user: {str(e)}')
        
    return redirect('dashboard:users')


@staff_member_required(login_url='users:admin_login')
@require_POST
def edit_user_view(request):
    original_username = request.POST.get('original_username')
    username = request.POST.get('username')
    email = request.POST.get('email')
    role = request.POST.get('role')
    
    if not original_username or not username:
        messages.error(request, 'Username is required.')
        return redirect('dashboard:users')
        
    try:
        user = get_object_or_404(User, username=original_username)
        
        # Check if username changed and new username already exists
        if username != original_username and User.objects.filter(username=username).exists():
            messages.error(request, f'Username "{username}" already exists.')
            return redirect('dashboard:users')
            
        # Prevent logged-in user from changing their own superuser status if they are the only superuser
        if user == request.user and role != 'Superuser' and user.is_superuser:
            other_superusers = User.objects.filter(is_superuser=True).exclude(id=user.id).exists()
            if not other_superusers:
                messages.error(request, 'Cannot revoke your own superuser status as you are the only superuser.')
                return redirect('dashboard:users')
                
        user.username = username
        user.email = email
        
        if role == 'Superuser':
            user.is_staff = True
            user.is_superuser = True
        elif role == 'Staff Admin':
            user.is_staff = True
            user.is_superuser = False
        else:
            user.is_staff = False
            user.is_superuser = False
            
        user.save()
        messages.success(request, f'User details for "{username}" updated successfully.')
    except Exception as e:
        messages.error(request, f'Error updating user: {str(e)}')
        
    return redirect('dashboard:users')


@staff_member_required(login_url='users:admin_login')
@require_POST
def delete_user_view(request):
    username = request.POST.get('username')
    
    if not username:
        messages.error(request, 'Username is required to delete a user.')
        return redirect('dashboard:users')
        
    try:
        user = get_object_or_404(User, username=username)
        
        if user == request.user:
            messages.error(request, 'You cannot delete your own account.')
            return redirect('dashboard:users')
            
        user.delete()
        messages.success(request, f'User "{username}" deleted successfully.')
    except Exception as e:
        messages.error(request, f'Error deleting user: {str(e)}')
        
    return redirect('dashboard:users')


@staff_member_required(login_url='users:admin_login')
@require_POST
def add_product_view(request):
    name = request.POST.get('name')
    slug = request.POST.get('slug')
    category_id = request.POST.get('category')
    price = request.POST.get('price')
    stock_quantity = request.POST.get('stock_quantity')
    description = request.POST.get('description', '')
    
    if not name or not slug or not category_id or not price or not stock_quantity:
        messages.error(request, 'All fields are required except description and image.')
        return redirect('dashboard:products')
        
    try:
        category = get_object_or_404(Category, id=category_id)
        if Product.objects.filter(slug=slug).exists():
            messages.error(request, f'Product with slug "{slug}" already exists.')
            return redirect('dashboard:products')
            
        product = Product(
            category=category,
            name=name,
            slug=slug,
            price=price,
            stock_quantity=stock_quantity,
            description=description
        )
        if 'image' in request.FILES:
            product.image = request.FILES['image']
        product.save()
        messages.success(request, f'Product "{name}" added successfully.')
    except Exception as e:
        messages.error(request, f'Error adding product: {str(e)}')
        
    return redirect('dashboard:products')


@staff_member_required(login_url='users:admin_login')
@require_POST
def edit_product_view(request):
    product_id = request.POST.get('product_id')
    name = request.POST.get('name')
    slug = request.POST.get('slug')
    category_id = request.POST.get('category')
    price = request.POST.get('price')
    stock_quantity = request.POST.get('stock_quantity')
    description = request.POST.get('description', '')
    
    if not product_id or not name or not slug or not category_id or not price or not stock_quantity:
        messages.error(request, 'All fields are required except description and image.')
        return redirect('dashboard:products')
        
    try:
        product = get_object_or_404(Product, id=product_id)
        category = get_object_or_404(Category, id=category_id)
        
        if slug != product.slug and Product.objects.filter(slug=slug).exists():
            messages.error(request, f'Product with slug "{slug}" already exists.')
            return redirect('dashboard:products')
            
        product.name = name
        product.slug = slug
        product.category = category
        product.price = price
        product.stock_quantity = stock_quantity
        product.description = description
        
        if 'image' in request.FILES:
            product.image = request.FILES['image']
            
        product.save()
        messages.success(request, f'Product "{name}" updated successfully.')
    except Exception as e:
        messages.error(request, f'Error updating product: {str(e)}')
        
    return redirect('dashboard:products')


@staff_member_required(login_url='users:admin_login')
@require_POST
def delete_product_view(request):
    product_id = request.POST.get('product_id')
    
    if not product_id:
        messages.error(request, 'Product ID is required.')
        return redirect('dashboard:products')
        
    try:
        product = get_object_or_404(Product, id=product_id)
        name = product.name
        product.delete()
        messages.success(request, f'Product "{name}" deleted successfully.')
    except Exception as e:
        messages.error(request, f'Error deleting product: {str(e)}')
        
    return redirect('dashboard:products')


@staff_member_required(login_url='users:admin_login')
@require_POST
def add_category_view(request):
    name = request.POST.get('name')
    slug = request.POST.get('slug')
    description = request.POST.get('description', '')
    
    if not name or not slug:
        messages.error(request, 'Name and Slug are required fields.')
        return redirect('dashboard:categories')
        
    try:
        if Category.objects.filter(slug=slug).exists():
            messages.error(request, f'Category with slug "{slug}" already exists.')
            return redirect('dashboard:categories')
            
        Category.objects.create(name=name, slug=slug, description=description)
        messages.success(request, f'Category "{name}" added successfully.')
    except Exception as e:
        messages.error(request, f'Error adding category: {str(e)}')
        
    return redirect('dashboard:categories')


@staff_member_required(login_url='users:admin_login')
@require_POST
def edit_category_view(request):
    category_id = request.POST.get('category_id')
    name = request.POST.get('name')
    slug = request.POST.get('slug')
    description = request.POST.get('description', '')
    
    if not category_id or not name or not slug:
        messages.error(request, 'Category ID, Name and Slug are required.')
        return redirect('dashboard:categories')
        
    try:
        category = get_object_or_404(Category, id=category_id)
        
        if slug != category.slug and Category.objects.filter(slug=slug).exists():
            messages.error(request, f'Category with slug "{slug}" already exists.')
            return redirect('dashboard:categories')
            
        category.name = name
        category.slug = slug
        category.description = description
        category.save()
        messages.success(request, f'Category "{name}" updated successfully.')
    except Exception as e:
        messages.error(request, f'Error updating category: {str(e)}')
        
    return redirect('dashboard:categories')


@staff_member_required(login_url='users:admin_login')
@require_POST
def delete_category_view(request):
    category_id = request.POST.get('category_id')
    
    if not category_id:
        messages.error(request, 'Category ID is required.')
        return redirect('dashboard:categories')
        
    try:
        category = get_object_or_404(Category, id=category_id)
        name = category.name
        category.delete()
        messages.success(request, f'Category "{name}" deleted successfully.')
    except Exception as e:
        messages.error(request, f'Error deleting category: {str(e)}')
        
    return redirect('dashboard:categories')


@staff_member_required(login_url='users:admin_login')
@require_POST
def update_order_status_view(request):
    order_id = request.POST.get('order_id')
    status = request.POST.get('status')
    tracking_number = request.POST.get('tracking_number', '')
    
    if not order_id or not status:
        messages.error(request, 'Order ID and Status are required.')
        referer = request.META.get('HTTP_REFERER')
        if referer and 'dashboard/orders/' in referer:
            return redirect(referer)
        return redirect('dashboard:orders')
        
    try:
        order = get_object_or_404(Order, id=order_id)
        order.status = status
        order.tracking_number = tracking_number
        if status == 'Delivered':
            order.paid = True
        order.save()
        messages.success(request, f'Order #{order_id} status updated successfully.')
    except Exception as e:
        messages.error(request, f'Error updating order: {str(e)}')
        
    referer = request.META.get('HTTP_REFERER')
    if referer and 'dashboard/orders/' in referer:
        return redirect(referer)
    return redirect('dashboard:orders')


@staff_member_required(login_url='users:admin_login')
@require_POST
def delete_order_view(request):
    order_id = request.POST.get('order_id')
    
    if not order_id:
        messages.error(request, 'Order ID is required.')
        return redirect('dashboard:orders')
        
    try:
        order = get_object_or_404(Order, id=order_id)
        order.delete()
        messages.success(request, f'Order #{order_id} deleted successfully.')
    except Exception as e:
        messages.error(request, f'Error deleting order: {str(e)}')
        
    return redirect('dashboard:orders')
