from django.contrib import admin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'price', 'stock_quantity', 'is_active', 'created_date']
    list_filter = ['is_active', 'created_date', 'updated_date']
    list_editable = ['price', 'stock_quantity', 'is_active']
    search_fields = ['name', 'description', 'slug']
    prepopulated_fields = {'slug': ('name',)}
