# Cedokamall Dashboard Access - Admin User Guide

## 👨‍💼 For Admin Users

This guide explains how to access and use the Cedokamall Admin Dashboard.

---

## 🔑 Getting Started

### 1. Open Admin Login Page

Open your browser and go to:

```
https://cedokamall.com/admin/login
```

### 2. Log In

Enter your admin credentials:

- **Email**: Your admin email address
- **Password**: Your admin password

Click **"Sign In"**

### 3. Access Dashboard

You'll be automatically taken to the admin dashboard.

---

## 📊 Dashboard Features

### Main Dashboard (`/admin`)

**URL:** `https://cedokamall.com/admin`

#### Key Metrics

```
┌─────────────────────────────────────────────────────┐
│  Active Flash Deals    Total Customers              │
│  ⚡ 3                  👥 1.2M                       │
├─────────────────────────────────────────────────────┤
│  Monthly Revenue       Orders Today                 │
│  💰 ₦24.5M             📦 284                       │
└─────────────────────────────────────────────────────┘
```

#### Quick Actions

- 📝 **Create Flash Deal** - Add a new flash sale
- 📦 **Manage Products** - Edit product details
- 📊 **View Analytics** - See performance metrics

#### Recent Activity

- Displays latest admin actions
- Shows timestamp and action details

---

### Flash Deals Management (`/admin/flash-deals`)

**URL:** `https://cedokamall.com/admin/flash-deals`

#### Create a Flash Deal

1. Click **"Create New Deal"** button
2. Fill in the form:
   - **Product**: Select product to put on sale
   - **Discount %**: Enter discount (1-100%)
   - **Start Time**: When sale begins
   - **End Time**: When sale ends
   - **Max Quantity**: How many can be sold
3. Click **"Create"**
4. Deal appears in the table below

#### Edit a Flash Deal

1. Find the deal in the table
2. Click **"Edit"** button
3. Update the details
4. Click **"Update"**

#### Delete a Flash Deal

1. Find the deal in the table
2. Click **"Delete"** button
3. Confirm deletion
4. Deal is removed

#### View All Deals

The table shows:
| Column | Details |
|--------|---------|
| Product ID | Which product |
| Discount | Discount percentage |
| Start Time | When it starts |
| End Time | When it ends |
| Max Qty | Available quantity |
| Actions | Edit / Delete buttons |

---

## 🚀 Step-by-Step Examples

### Example 1: Create a Flash Deal

**Scenario:** You want to have a 30% off sale on Samsung Galaxy S23 for 24 hours.

**Steps:**

1. Go to `/admin/flash-deals`
2. Click **"Create New Deal"**
3. Select **"Samsung Galaxy S23"** from products
4. Set discount to **30%**
5. Set start time to **today 12:00 PM**
6. Set end time to **tomorrow 12:00 PM**
7. Set max quantity to **100 units**
8. Click **"Create"**
9. ✅ Deal is now live!

### Example 2: Adjust an Active Deal

**Scenario:** Your flash deal is ending soon and you want to increase the discount.

**Steps:**

1. Go to `/admin/flash-deals`
2. Find your deal in the table
3. Click **"Edit"** button
4. Change discount from 30% to **40%**
5. Extend end time by 6 hours
6. Click **"Update"**
7. ✅ Changes saved immediately!

### Example 3: End a Flash Deal

**Scenario:** Your sale is underperforming and you want to stop it.

**Steps:**

1. Go to `/admin/flash-deals`
2. Find your deal in the table
3. Click **"Delete"** button
4. Confirm deletion
5. ✅ Deal is removed from the system!

---

## 📱 Mobile Access

The dashboard works on mobile devices, but it's optimized for desktop.

### Mobile Features

- ✅ Login works
- ✅ Dashboard view responsive
- ✅ Flash deals CRUD works
- ⚠️ Smaller screen = less comfortable
- **Recommended:** Use desktop for best experience

### Mobile Navigation

- Menu button (☰) appears on mobile
- Tap to open/close sidebar
- All features still accessible

---

## 🔒 Security & Privacy

### Your Session

- Your login session is stored locally in your browser
- You'll stay logged in even if you refresh the page
- **Logout:** Click **"Logout"** in the sidebar
- Closing browser also ends your session

### Password Security

- Never share your password
- Use a strong, unique password
- Password minimum: 6 characters
- **Production:** Passwords are encrypted and hashed

### Admin Only

- Admin dashboard is only for admins
- Public cannot access `/admin` pages
- Unauthorized users are redirected to login

---

## ⏱️ Time Zones

All times are shown in your browser's time zone.

### Setting Flash Deal Times

**Important:** Specify times carefully!

```
If you set:
Start Time: 2026-04-17 12:00 PM (your time)
End Time:   2026-04-18 12:00 PM (your time)

The sale runs for exactly 24 hours
in your local time zone.
```

---

## 💰 Price & Discount Rules

### Valid Discounts

- Minimum: 1%
- Maximum: 100%
- Must be whole number

### Examples

```
Original Price: ₦100,000
Discount: 30%
Sale Price: ₦70,000 (30% off)

Original Price: ₦50,000
Discount: 50%
Sale Price: ₦25,000 (50% off)
```

---

## 📦 Inventory Management

### Quantity Limits

**Max Quantity** = Maximum number of units available during the flash sale

```
Example:
Product: iPhone 15
Normal Stock: 500 units
Flash Deal Max: 50 units
→ Only 50 units can be sold at the flash price
```

### Current Quantity

Tracks how many units have been sold:

- Starts at 0
- Increases as customers buy
- When it reaches Max Quantity, sale ends
- Or time expires (whichever comes first)

---

## 🆘 Troubleshooting

### Can't Log In?

1. Check email is spelled correctly
2. Check password (case-sensitive)
3. Verify caps lock is off
4. Wait 1 minute and try again
5. Contact IT support

### Dashboard Not Loading?

1. Refresh page (Ctrl+R or Cmd+R)
2. Clear browser cache
   - Firefox: Ctrl+Shift+Delete
   - Chrome: Ctrl+Shift+Delete
   - Safari: Cmd+Shift+Delete
3. Try different browser
4. Check internet connection
5. Contact IT support

### Can't Create Flash Deal?

1. Verify you're on correct page (`/admin/flash-deals`)
2. Fill in all required fields
3. Check discount is 1-100%
4. Verify end time is after start time
5. Try again

### Session Expired?

1. You'll be redirected to login page
2. Log in again
3. (In production, session expires after 1 hour of inactivity)

---

## 🎯 Best Practices

### Planning Flash Deals

1. **Choose Popular Products**
   - Best sellers
   - Seasonal items
   - New arrivals

2. **Set Realistic Discounts**
   - Too high (>50%): Lose profits
   - Too low (<10%): No excitement
   - Sweet spot: 20-40%

3. **Timing**
   - Weekend peak times
   - Holiday seasons
   - End of season clearance

4. **Quantities**
   - Limited stock = more urgency
   - Tie to actual inventory
   - Create scarcity

### Promotion Strategy

1. **Announce in Advance**
   - Email subscribers
   - Social media
   - In-app notifications

2. **Create Urgency**
   - Limited time
   - Limited quantity
   - Special discount

3. **Bundle Deals**
   - Pair with complementary products
   - Increase average order value
   - Cross-sell opportunities

---

## 📊 Analytics (Coming Soon)

In the future, you'll be able to:

- [ ] View flash deal performance
- [ ] Track conversion rates
- [ ] Analyze customer behavior
- [ ] Revenue reports
- [ ] Compare deals

---

## 🔗 Quick Links

| Section      | URL                                      |
| ------------ | ---------------------------------------- |
| Main Website | https://cedokamall.com                   |
| Public Shop  | https://cedokamall.com/shop              |
| Admin Login  | https://cedokamall.com/admin/login       |
| Dashboard    | https://cedokamall.com/admin             |
| Flash Deals  | https://cedokamall.com/admin/flash-deals |

---

## 📞 Support

### Getting Help

- **Email**: support@cedokamall.com
- **Phone**: +234 XXX XXXX XXXX
- **Live Chat**: Available 9 AM - 5 PM (EST)
- **Tickets**: https://support.cedokamall.com

### Common Questions

**Q: How long do flash deals last?**
A: You set the duration when creating the deal (minimum 1 hour, maximum 30 days).

**Q: Can I have multiple flash deals?**
A: Yes, you can create as many deals as you want simultaneously.

**Q: What happens when a flash deal ends?**
A: The deal is archived and products return to regular pricing.

**Q: Can I edit a live deal?**
A: Yes, you can edit discount % and quantity anytime.

**Q: What if I need to stop a deal?**
A: Delete it. It will be removed immediately.

---

## 📖 Related Documentation

- [Developer Guide](./IMPLEMENTATION_GUIDE.md)
- [Security Guide](./SECURITY_AND_PERFORMANCE.md)
- [Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md)

---

**Version:** 1.0.0  
**Last Updated:** April 17, 2026  
**Status:** Ready for Production
