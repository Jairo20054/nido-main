import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
  const {
    items,
    totalItems,
    totalPrice,
    shippingEstimate,
    taxEstimate,
    finalTotal,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    // In a real app, this would navigate to checkout
    alert('Funcionalidad de checkout próximamente');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cart-drawer-backdrop"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="cart-drawer"
          >
            {/* Header */}
            <div className="cart-header">
              <h2 className="cart-title">
                Carrito de compras
              </h2>
              <button
                onClick={onClose}
                className="btn-close-cart"
                aria-label="Cerrar carrito"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="cart-content">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty-icon">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="cart-empty-title">Tu carrito está vacío</h3>
                  <p className="cart-empty-text">¡Agrega algunos productos para comenzar!</p>
                  <button
                    onClick={onClose}
                    className="btn-continue-shopping"
                  >
                    Continuar comprando
                  </button>
                </div>
              ) : (
                <div className="cart-items">
                  {items.map((item) => (
                    <div key={item.id} className="cart-item">
                      {/* Product Image */}
                      <div className="cart-item-image">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="cart-item-details">
                        <h4 className="cart-item-title">{item.title}</h4>
                        <p className="cart-item-price">{formatPrice(item.price)}</p>

                        {/* Quantity Controls */}
                        <div className="quantity-controls">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="btn-quantity"
                            aria-label="Disminuir cantidad"
                          >
                            -
                          </button>
                          <span className="quantity-display">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="btn-quantity"
                            aria-label="Aumentar cantidad"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="btn-remove-item"
                        aria-label="Remover del carrito"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="cart-footer">
                {/* Summary */}
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal ({totalItems} productos)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Envío</span>
                    <span>
                      {shippingEstimate === 0 ? 'Gratis' : formatPrice(shippingEstimate)}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span>Impuestos estimados</span>
                    <span>{formatPrice(taxEstimate)}</span>
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="cart-actions">
                  <button
                    onClick={handleCheckout}
                    className="btn-checkout"
                  >
                    Proceder al checkout
                  </button>
                  <button
                    onClick={clearCart}
                    className="btn-clear-cart"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
