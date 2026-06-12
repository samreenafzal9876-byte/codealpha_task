from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.dashboard_index, name='index'),
    path('products/', views.products_view, name='products'),
    path('products/add/', views.add_product_view, name='add_product'),
    path('products/edit/', views.edit_product_view, name='edit_product'),
    path('products/delete/', views.delete_product_view, name='delete_product'),
    path('categories/', views.categories_view, name='categories'),
    path('categories/add/', views.add_category_view, name='add_category'),
    path('categories/edit/', views.edit_category_view, name='edit_category'),
    path('categories/delete/', views.delete_category_view, name='delete_category'),
    path('orders/', views.orders_view, name='orders'),
    path('orders/update-status/', views.update_order_status_view, name='update_order_status'),
    path('orders/delete/', views.delete_order_view, name='delete_order'),
    path('orders/<int:order_id>/', views.order_details_view, name='order_details'),
    path('users/', views.users_view, name='users'),
    path('users/add/', views.add_user_view, name='add_user'),
    path('users/edit/', views.edit_user_view, name='edit_user'),
    path('users/delete/', views.delete_user_view, name='delete_user'),
    path('customers/', views.customers_view, name='customers'),
    path('customers/<int:customer_id>/', views.customer_details_view, name='customer_details'),
    path('reports/', views.reports_view, name='reports'),
    path('settings/', views.settings_view, name='settings'),
]
