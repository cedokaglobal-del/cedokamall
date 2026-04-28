# Cedokamall Production Launch Guide

## Current Status

- Product catalog: ready to run from Supabase after the SQL setup is applied.
- Admin login: ready through Supabase Auth, but you must create the admin user and `admin_users` row.
- Product images: ready through Supabase Storage after the bucket policies are applied.
- Flash deals: not production-backed right now.
- Analytics: not production-backed right now.
- Checkout: this is a WhatsApp/manual-order flow, not a fully automated payment and order-management backend.

## 1. Configure Supabase

Open the Supabase SQL Editor and run [SUPABASE_PRODUCTION_SETUP.sql](/c:/Users/Osmaxin/Documents/DecodamsWork/Cedoka/CedokaMall/MallPage/SUPABASE_PRODUCTION_SETUP.sql:1).

After the SQL runs:

1. In Supabase Auth, create the admin user with the email you want to use.
2. Insert the admin email into `public.admin_users`.

Example:

```sql
insert into public.admin_users (email) values ('cedokamall@gmail.com')
on conflict (email) do update
set active = true;
```

## 2. Required Environment Variables

Set these in Vercel for `Production`, `Preview`, and `Development` as needed:

```env
VITE_SUPABASE_URL=https://rxpyehmubnzdshncpqbw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
VITE_SUPABASE_PRODUCT_BUCKET=product-images
VITE_ADMIN_EMAILS=cedokamall@gmail.com
VITE_WHATSAPP_NUMBER=2349128817136
```

## 3. Vercel Deployment Settings

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Your existing [vercel.json](/c:/Users/Osmaxin/Documents/DecodamsWork/Cedoka/CedokaMall/MallPage/vercel.json:1) SPA rewrite is correct for React Router.

## 4. What To Add Before Calling It Fully Production Ecommerce

These are still missing if you want a complete online store, not just a live catalog plus WhatsApp ordering:

- Real `orders` table
- Real `order_items` table
- Real payments integration
- Real customer records
- Real transaction analytics
- Real flash-deals backend

## 5. Launch Recommendation

You can go live now if your goal is:

- Live product catalog
- Admin-managed products
- Supabase-backed product data
- Supabase-hosted product images
- Manual order capture through WhatsApp

You should not call it fully complete ecommerce yet if you still need:

- automated checkout
- payment verification
- order tracking
- back-office analytics from real transactions
