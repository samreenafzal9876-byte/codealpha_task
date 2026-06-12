from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import OrderItem, Order
from .forms import OrderCreateForm
from cart.cart import Cart

@login_required(login_url='users:login')
def order_create(request):
    cart = Cart(request)
    if len(cart) == 0:
        return redirect('cart:cart_detail')
        
    if request.method == 'POST':
        form = OrderCreateForm(request.POST)
        if form.is_valid():
            order = form.save(commit=False)
            order.user = request.user
            order.save()
            for item in cart:
                product = item['product']
                quantity = item['quantity']
                
                # Create OrderItem
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    price=item['price'],
                    quantity=quantity
                )
                
                # Reduce product stock
                if product.stock_quantity >= quantity:
                    product.stock_quantity -= quantity
                else:
                    product.stock_quantity = 0
                product.save()
                
            # Clear the cart
            cart.clear()
            
            # Store the order ID in session for success redirect
            request.session['order_id'] = order.id
            return redirect('orders:order_success')
    else:
        # Prepopulate with logged in user data
        initial_data = {
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'email': request.user.email,
        }
        form = OrderCreateForm(initial=initial_data)
        
    return render(request, 'orders/checkout.html', {'cart': cart, 'form': form})

@login_required(login_url='users:login')
def order_success(request):
    order_id = request.session.get('order_id')
    if not order_id:
        return redirect('/')
    
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    # We can clean up the session variable now
    del request.session['order_id']
    
    return render(request, 'orders/order_success.html', {'order': order})

@login_required(login_url='users:login')
def order_history(request):
    orders = Order.objects.filter(user=request.user).order_by('-created')
    return render(request, 'orders/order_history.html', {'orders': orders})

@login_required(login_url='users:login')
def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return render(request, 'orders/order_detail.html', {'order': order})
