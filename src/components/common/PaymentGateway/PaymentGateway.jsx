import React, { useState } from 'react';
import './PaymentGateway.css';

const PaymentGateway = ({ property, checkInDate, checkOutDate, guests, onPaymentComplete, onClose }) => {
  const [paymentStep, setPaymentStep] = useState(1); // 1: Review, 2: Payment, 3: Confirmation
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Calcular número de noches
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(nights, 1);
  };

  const nights = calculateNights();
  const nightly_price = property.price || 1800000;
  const service_fee = Math.round(nightly_price * nights * 0.1); // 10% service fee
  const total = nightly_price * nights + service_fee;

  // Manejar cambios en los campos de tarjeta
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').slice(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
      }
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Procesar pago
  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simular procesamiento de pago
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setPaymentStep(3);
    }, 2000);
  };

  // Confirmar reserva
  const handleConfirmBooking = () => {
    if (onPaymentComplete) {
      onPaymentComplete({
        property: property.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guests,
        total: total,
        nights: nights,
        cardLast4: cardData.cardNumber.slice(-4)
      });
    }
    onClose();
  };

  return (
    <div className="payment-gateway-overlay" onClick={onClose}>
      <div className="payment-gateway-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="payment-header">
          <h2>Confirmar Reserva</h2>
          <button className="payment-close-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="payment-content">
          {paymentStep === 1 && (
            <div className="payment-review">
              <div className="review-property">
                <img src={property.images?.[0]} alt={property.title} className="review-property-img" />
                <div className="review-property-info">
                  <h3>{property.title}</h3>
                  <p className="review-location">📍 {property.location}</p>
                  <p className="review-rating">⭐ {property.rating} ({property.reviewCount} reseñas)</p>
                </div>
              </div>

              <div className="review-details">
                <div className="review-item">
                  <span className="review-label">Check-in:</span>
                  <span className="review-value">{checkInDate}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Check-out:</span>
                  <span className="review-value">{checkOutDate}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Huéspedes:</span>
                  <span className="review-value">{guests}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Noches:</span>
                  <span className="review-value">{nights}</span>
                </div>
              </div>

              <div className="payment-summary">
                <div className="summary-item">
                  <span>$ {nightly_price.toLocaleString('es-CO')} × {nights} noches</span>
                  <span>$ {(nightly_price * nights).toLocaleString('es-CO')}</span>
                </div>
                <div className="summary-item">
                  <span>Tarifa de servicio (10%)</span>
                  <span>$ {service_fee.toLocaleString('es-CO')}</span>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <span>$ {total.toLocaleString('es-CO')}</span>
                </div>
              </div>

              <button className="btn-proceed" onClick={() => setPaymentStep(2)}>
                Continuar al Pago
              </button>
            </div>
          )}

          {paymentStep === 2 && (
            <form className="payment-form" onSubmit={handlePayment}>
              <div className="payment-form-section">
                <label htmlFor="cardName">Nombre en la tarjeta</label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  placeholder="Juan Pérez"
                  value={cardData.cardName}
                  onChange={handleCardChange}
                  required
                  disabled={isProcessing}
                />
              </div>

              <div className="payment-form-section">
                <label htmlFor="cardNumber">Número de tarjeta</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={handleCardChange}
                  required
                  disabled={isProcessing}
                  maxLength="19"
                />
              </div>

              <div className="payment-form-row">
                <div className="payment-form-section">
                  <label htmlFor="expiryDate">Fecha de vencimiento</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={handleCardChange}
                    required
                    disabled={isProcessing}
                    maxLength="5"
                  />
                </div>

                <div className="payment-form-section">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={handleCardChange}
                    required
                    disabled={isProcessing}
                    maxLength="3"
                  />
                </div>
              </div>

              <div className="payment-total-display">
                <span>Total a pagar:</span>
                <span className="payment-total-amount">$ {total.toLocaleString('es-CO')}</span>
              </div>

              <button
                type="submit"
                className="btn-pay"
                disabled={isProcessing || !cardData.cardName || !cardData.cardNumber || !cardData.expiryDate || !cardData.cvv}
              >
                {isProcessing ? 'Procesando...' : 'Pagar Ahora'}
              </button>

              <button
                type="button"
                className="btn-back"
                onClick={() => setPaymentStep(1)}
                disabled={isProcessing}
              >
                Volver
              </button>
            </form>
          )}

          {paymentStep === 3 && (
            <div className="payment-confirmation">
              <div className="confirmation-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <h3>¡Reserva Confirmada!</h3>
              <p className="confirmation-text">
                Tu reserva en <strong>{property.title}</strong> ha sido confirmada exitosamente.
              </p>
              <div className="confirmation-details">
                <div className="confirmation-item">
                  <span>Referencia:</span>
                  <span>#{Math.random().toString(36).substring(7).toUpperCase()}</span>
                </div>
                <div className="confirmation-item">
                  <span>Total pagado:</span>
                  <span>$ {total.toLocaleString('es-CO')}</span>
                </div>
                <div className="confirmation-item">
                  <span>Fecha check-in:</span>
                  <span>{checkInDate}</span>
                </div>
              </div>
              <p className="confirmation-email">
                Se ha enviado un email de confirmación a tu correo electrónico.
              </p>
              <button className="btn-done" onClick={handleConfirmBooking}>
                Listo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
