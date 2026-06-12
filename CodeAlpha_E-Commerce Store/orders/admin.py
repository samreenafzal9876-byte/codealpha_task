from django.contrib import admin
from django.db.models import Sum, F
from .models import Order, OrderItem
from products.models import Product
from django.contrib.auth.models import User

# Configure default admin headers
admin.site.site_header = 'Aura Store Admin Portal'
admin.site.site_title = 'Aura Store Admin'
admin.site.index_title = 'Welcome to the Aura Store Management Dashboard'

# Subclass OrderItem as inline so they can be modified inside the Order details editor
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product']
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'first_name', 'last_name', 'email', 
        'address', 'postal_code', 'city', 'paid', 'created', 'updated'
    ]
    list_filter = ['paid', 'created', 'updated', 'city']
    list_editable = ['paid']
    search_fields = ['id', 'first_name', 'last_name', 'email', 'address', 'city']
    inlines = [OrderItemInline]
    date_hierarchy = 'created'

# Inject custom dashboard stats into the Admin Index view context
original_index = admin.site.index

def custom_admin_index(request, extra_context=None):
    extra_context = extra_context or {}
    
    # 1. Total Orders count
    extra_context['total_orders'] = Order.objects.count()
    
    # 2. Total Revenue from Paid Orders
    revenue = OrderItem.objects.filter(order__paid=True).aggregate(
        total=Sum(F('price') * F('quantity'))
    )['total']
    extra_context['total_revenue'] = round(revenue, 2) if revenue is not None else 0.00
    
    # 3. Total Active Products count
    extra_context['total_products'] = Product.objects.count()
    
    # 4. Total Registered Customers count (non-staff users)
    extra_context['total_customers'] = User.objects.filter(is_staff=False).count()
    
    return original_index(request, extra_context)

admin.site.index = custom_admin_index
