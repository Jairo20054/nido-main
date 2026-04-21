# 💳 GUÍA: INTEGRACIÓN CON STRIPE

**Para cuando estés listo a implementar pagos reales**

---

## 📋 TABLA DE CONTENIDOS

1. [Configuración Stripe](#configuración)
2. [Frontend Setup](#frontend)
3. [Backend Setup](#backend)
4. [Reemplazar Simulación](#reemplazar)
5. [Testing](#testing)

---

## <a name="configuración"></a>🔧 CONFIGURACIÓN STRIPE

### 1. Crear Cuenta Stripe
```
1. Ir a https://stripe.com
2. Click "Sign up"
3. Completar datos
4. Verificar email
5. Completar perfil
```

### 2. Obtener API Keys
```
Dashboard > Developers > API keys

Copiar:
- STRIPE_PUBLIC_KEY (Publicable key)
- STRIPE_SECRET_KEY (Secret key)

⚠️ NUNCA compartir STRIPE_SECRET_KEY
```

### 3. Crear Variables de Entorno
```bash
# En la raíz del proyecto, crear o editar .env.local

REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxx...
```

**IMPORTANTE**: 
- REACT_APP_STRIPE_SECRET_KEY en backend SOLAMENTE
- Frontend solo necesita PUBLIC_KEY

---

## <a name="frontend"></a>⚛️ FRONTEND SETUP

### 1. Instalar Dependencias
```bash
cd c:\Users\ANDRES\OneDrive\Videos\nido-main

npm install @stripe/react-stripe-js @stripe/stripe-js
npm install axios  # Para llamadas al backend
```

### 2. Crear proveedor Stripe
```jsx
// src/providers/StripeProvider.jsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLIC_KEY
);

export const StripeProvider = ({ children }) => (
  <Elements stripe={stripePromise}>
    {children}
  </Elements>
);
```

### 3. Envolver App con StripeProvider
```jsx
// src/App.jsx
import { StripeProvider } from './providers/StripeProvider';

function App() {
  return (
    <StripeProvider>
      {/* tu app */}
    </StripeProvider>
  );
}
```

### 4. Actualizar PaymentGateway para usar Stripe

**Archivo**: `src/components/common/PaymentGateway/PaymentGateway.jsx`

```jsx
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const PaymentGateway = ({ property, checkInDate, checkOutDate, guests, onClose, onPaymentComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  // ... resto del código
  
  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // 1. Crear Payment Intent en backend
      const response = await axios.post('/api/payments/create-intent', {
        amount: total * 100, // Stripe espera centavos
        property_id: property.id,
        check_in: checkInDate,
        check_out: checkOutDate,
        guests: guests
      });

      const { clientSecret } = response.data;

      // 2. Confirmar pago con tarjeta
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: cardData.cardName
          }
        }
      });

      if (result.error) {
        setPaymentError(result.error.message);
        setIsProcessing(false);
      } else if (result.paymentIntent.status === 'succeeded') {
        setPaymentSuccess(true);
        setPaymentStep(3);
        setIsProcessing(false);
        
        // Guardar reserva en DB
        onPaymentComplete({
          property: property.id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests: guests,
          total: total,
          paymentIntentId: result.paymentIntent.id
        });
      }
    } catch (error) {
      setPaymentError(error.message);
      setIsProcessing(false);
    }
  };

  // Reemplazar inputs de tarjeta con CardElement
  return (
    // ... otros elementos ...
    <CardElement 
      options={{
        style: {
          base: {
            fontSize: '1rem',
            color: '#111827',
            '::placeholder': { color: '#d1d5db' }
          },
          invalid: { color: '#ff3b72' }
        }
      }}
    />
    // ... resto ...
  );
};

export default PaymentGateway;
```

---

## <a name="backend"></a>🖥️ BACKEND SETUP

### 1. Instalar Dependencias
```bash
cd backend

npm install stripe axios dotenv
```

### 2. Crear archivo de configuración Stripe
```javascript
// backend/config/stripe.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
```

### 3. Crear ruta para Payment Intent
```javascript
// backend/routes/paymentRoutes.js
const express = require('express');
const stripe = require('../config/stripe');
const router = express.Router();

router.post('/create-intent', async (req, res) => {
  try {
    const { amount, property_id, check_in, check_out, guests } = req.body;

    // Crear Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // en centavos
      currency: 'cop', // Pesos colombianos
      metadata: {
        property_id,
        check_in,
        check_out,
        guests,
        user_id: req.user?.id || 'anonymous'
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Webhook para confirmar pagos
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Guardar reserva en base de datos
    // db.Booking.create({
    //   user_id: paymentIntent.metadata.user_id,
    //   property_id: paymentIntent.metadata.property_id,
    //   check_in: paymentIntent.metadata.check_in,
    //   check_out: paymentIntent.metadata.check_out,
    //   guests: paymentIntent.metadata.guests,
    //   total: paymentIntent.amount_received / 100,
    //   status: 'confirmed',
    //   stripe_payment_id: paymentIntent.id
    // });
    
    console.log('Pago confirmado:', paymentIntent.id);
  }

  res.json({received: true});
});

module.exports = router;
```

### 4. Registrar rutas en Express
```javascript
// backend/server.js
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/payments', paymentRoutes);
```

### 5. Variables de entorno Backend
```bash
# backend/.env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx...
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx...
```

---

## <a name="reemplazar"></a>🔄 PASO A PASO: REEMPLAZAR SIMULACIÓN

### Antes (Simulación Actual)
```javascript
// En PaymentGateway.jsx
const handlePayment = async (e) => {
  e.preventDefault();
  setIsProcessing(true);

  // Simular espera de 2 segundos
  setTimeout(() => {
    setIsProcessing(false);
    setPaymentSuccess(true);
    setPaymentStep(3);
  }, 2000);
};
```

### Después (Con Stripe Real)
```javascript
// En PaymentGateway.jsx
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const handlePayment = async (e) => {
  e.preventDefault();
  
  if (!stripe || !elements) return;

  setIsProcessing(true);

  try {
    // 1. Crear Payment Intent
    const { data } = await axios.post('/api/payments/create-intent', {
      amount: total * 100,
      property_id: property.id,
      check_in: checkInDate,
      check_out: checkOutDate,
      guests: guests
    });

    // 2. Confirmar pago
    const result = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: cardData.cardName
        }
      }
    });

    // 3. Manejar resultado
    if (result.error) {
      setPaymentError(result.error.message);
    } else if (result.paymentIntent.status === 'succeeded') {
      setPaymentSuccess(true);
      setPaymentStep(3);
      onPaymentComplete({ ...result.paymentIntent });
    }
  } catch (error) {
    setPaymentError(error.message);
  } finally {
    setIsProcessing(false);
  }
};
```

---

## <a name="testing"></a>🧪 TESTING CON STRIPE

### Tarjetas de Prueba Stripe
```
ÉXITO:
├─ 4242 4242 4242 4242 - Visa (éxito)
└─ Fecha: Cualquiera futura, CVV: Cualquiera

FALLO:
├─ 4000 0000 0000 0002 - Visa (rechazada)
└─ 4000 0000 0000 9995 - Visa (3D Secure)
```

### Test Checkout Completo
```
1. Abre http://localhost:3000
2. Click en tarjeta de propiedad
3. Completa fechas
4. Click "Proceder al Pago"
5. STEP 1 - Review: Verifica datos
6. Click "Continuar al Pago"
7. STEP 2 - Payment:
   - Ingresa: 4242 4242 4242 4242
   - Fecha: 12/25
   - CVV: 123
   - Click "Pagar Ahora"
8. STEP 3 - Confirmation:
   - Debe mostrar éxito
   - Referencia debe ser número real de Stripe
```

### Ver en Stripe Dashboard
```
Dashboard > Payments > Transactions

Deberías ver:
✓ Pago de $9,900 COP
✓ Status: Succeeded
✓ Metadata con property_id, check_in, etc.
```

---

## 🔒 SEGURIDAD

### Variables de Entorno
```bash
# NUNCA en versión control
# Usar .env.local (ya está en .gitignore)

# Frontend (.env.local)
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...

# Backend (.env)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Validación Backend
```javascript
// Siempre validar en backend
router.post('/create-intent', async (req, res) => {
  // 1. Verificar user está autenticado
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  // 2. Verificar propiedad existe
  const property = await Property.findById(req.body.property_id);
  if (!property) return res.status(404).json({ error: 'Property not found' });

  // 3. Validar precio (usuario no puede cambiar)
  const expectedTotal = property.price * nights;
  if (req.body.amount !== expectedTotal * 100) {
    return res.status(400).json({ error: 'Amount mismatch' });
  }

  // 4. Crear intent con datos validados
  // ...
});
```

---

## 📊 FLUJO STRIPE COMPLETO

```
┌─────────────────────────────────────────────────┐
│             USUARIO FRONTEND                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. Completa datos en PaymentForm              │
│  2. Click "Pagar Ahora"                        │
│     │                                          │
│     ▼                                          │
│  3. Envía a BACKEND: /api/payments/create-intent
│     ├─ amount: $9,900 COP                      │
│     ├─ property_id: 1                          │
│     ├─ check_in: 2025-12-15                    │
│     └─ check_out: 2025-12-20                   │
│                                                 │
│     ▼                                          │
└─────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────┐
│           BACKEND (Node.js)                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  4. Valida datos (usuario, propiedad, monto)  │
│  5. Llama: stripe.paymentIntents.create()      │
│  6. Retorna: clientSecret                      │
│                                                 │
└─────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────┐
│          STRIPE SERVERS (Cloud)                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  7. Crea PaymentIntent                         │
│  8. Retorna clientSecret                       │
│                                                 │
└─────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────┐
│          USUARIO FRONTEND STEP 2                │
├─────────────────────────────────────────────────┤
│                                                 │
│  9. Stripe.js confirma pago:                   │
│     - Procesa tarjeta                          │
│     - Envía datos encriptados a Stripe         │
│     - Retorna resultado                        │
│                                                 │
│  10. ÉXITO → Step 3 Confirmation               │
│  11. ERROR → Muestra mensaje                   │
│                                                 │
└─────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────┐
│        WEBHOOK STRIPE → BACKEND                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  12. Webhook llega: payment_intent.succeeded   │
│  13. Backend guarda reserva en DB              │
│  14. Envía email de confirmación               │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] Crear cuenta Stripe
- [ ] Copiar API keys
- [ ] Crear .env con REACT_APP_STRIPE_PUBLIC_KEY
- [ ] npm install @stripe/react-stripe-js @stripe/stripe-js
- [ ] Crear StripeProvider
- [ ] Envolver App con StripeProvider
- [ ] Crear ruta backend /api/payments/create-intent
- [ ] Instalar stripe en backend
- [ ] Crear .env backend con STRIPE_SECRET_KEY
- [ ] Actualizar PaymentGateway con Stripe
- [ ] Agregar CardElement en formulario
- [ ] Testear con tarjeta 4242 4242 4242 4242
- [ ] Verificar en Stripe Dashboard
- [ ] Configurar Webhook para payment_intent.succeeded
- [ ] Guardar reserva en BD cuando pago éxito
- [ ] Enviar email confirmación

---

## 📞 RECURSOS

- [Stripe Docs](https://stripe.com/docs)
- [React Stripe](https://stripe.com/docs/stripe-js/react)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Testing Cards](https://stripe.com/docs/testing)

---

**Cuando termines de implementar Stripe, quita el timeout de 2 segundos y tendrás pagos reales ✓**

