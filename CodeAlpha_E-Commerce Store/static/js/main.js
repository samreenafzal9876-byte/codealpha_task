document.addEventListener('DOMContentLoaded', () => {
    // 1. AJAX Add-to-Cart for product list buttons
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    const cartCountEl = document.querySelector('.cart-count');

    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Stop default form redirect submission
            
            const button = e.currentTarget;
            const form = button.closest('form');
            if (!form) return;

            const url = form.action;
            const formData = new FormData(form);
            const originalText = button.querySelector('.btn-text').textContent;

            // Send async POST request to add product to cart
            fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Update cart badge dynamically
                    if (cartCountEl) {
                        cartCountEl.textContent = data.cart_length;
                        cartCountEl.style.display = 'inline-block';
                    }

                    // Animate button success state
                    button.classList.add('added');
                    button.querySelector('.btn-text').textContent = 'Added ✓';

                    // Reset button to original text after 2 seconds
                    setTimeout(() => {
                        button.classList.remove('added');
                        button.querySelector('.btn-text').textContent = originalText;
                    }, 2000);
                }
            })
            .catch(error => {
                console.error('Error adding item to cart:', error);
                // Fallback to standard form submit on error
                form.submit();
            });
        });
    });

    // 2. Quantity Selector logic (used in cart detail and product detail pages)
    const minusBtns = document.querySelectorAll('.qty-btn.minus');
    const plusBtns = document.querySelectorAll('.qty-btn.plus');
    const qtyInputs = document.querySelectorAll('.qty-input');

    minusBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const input = qtyInputs[index];
            if (input && input.value > 1) {
                input.value = parseInt(input.value) - 1;
            }
        });
    });

    plusBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const input = qtyInputs[index];
            if (input) {
                const max = parseInt(input.getAttribute('max')) || 99;
                if (input.value < max) {
                    input.value = parseInt(input.value) + 1;
                }
            }
        });
    });
});
