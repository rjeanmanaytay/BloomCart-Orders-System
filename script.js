// BloomCart JavaScript

let cart = JSON.parse(localStorage.getItem("bloomCart")) || [];

function addToCart(product) {

    const existingProduct = cart.find(
        item => item.id === product.id
    );

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    localStorage.setItem(
        "bloomCart",
        JSON.stringify(cart)
    );

    alert(`${product.name} was added to your cart! 🌸`);
}

function updateCart() {

    localStorage.setItem(
        "bloomCart",
        JSON.stringify(cart)
    );
}

function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );
}

function clearCart() {

    cart = [];

    localStorage.removeItem("bloomCart");
}