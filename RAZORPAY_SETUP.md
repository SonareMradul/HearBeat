# HearBeat — Razorpay Setup

## Pricing

- Weekly: ₹29 / 7 days
- Monthly: ₹99 / 30 days
- Yearly: ₹499 / 365 days

The backend is the source of truth for these prices. Do not trust an amount sent by the browser.

## 1. Razorpay keys

Create `Server/.env` from `Server/.env.example` and add:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Never put `RAZORPAY_KEY_SECRET` in the React `.env` or commit it to Git.

## 2. Start the server

```bash
cd Server
npm install
npm run dev
```

## 3. Start the client

```bash
cd Client
npm install
npm run dev
```

If the frontend and backend are not on the default local ports, set:

```env
# Client/.env
VITE_API_URL=http://localhost:5000/api
VITE_MEDIA_URL=http://localhost:5000
```

## 4. Razorpay Dashboard

Use the test keys first. Configure a webhook pointing to:

`https://YOUR_BACKEND_DOMAIN/api/payments/webhook`

Send at least `payment.captured` (and optionally `order.paid`) events and use the same value as `RAZORPAY_WEBHOOK_SECRET`.

The checkout callback is verified server-side with the Razorpay API signature. The webhook provides a second server-side path for captured payments if the browser closes or loses the callback.

## Important behavior

These plans are implemented as **fixed-duration purchases**, not automatically recurring Razorpay Subscriptions. A successful ₹29/₹99/₹499 payment activates access for 7/30/365 days.

If you want automatic recurring renewals, Razorpay Subscription plans/plan IDs need to be configured in the Razorpay Dashboard and the backend flow should be switched to the Subscriptions API.
