# Admin Dashboard - Quick Reference Guide

## 🔐 Admin Login

**URL:** `http://localhost:8080/admin/login`

**Credentials:**

- **Email:** cedokamall@gmail.com
- **Password:** ckd12\_#cedoka

---

## 📍 Navigation Map

### Main Dashboard (`/admin`)

**Purpose:** Central hub with overview of all key metrics

**What You See:**

- Revenue, orders, customers, flash deals (top 4 stats)
- Low stock alerts
- Quick action buttons
- Top selling product & category
- Recent transactions (last 8)

**Quick Actions:**

- Add Product
- Manage Products
- View Flash Deals
- View Analytics

---

### Products Management (`/admin/products`)

**Purpose:** Complete product catalog management

**Available Actions:**
✅ Add new products
✏️ Edit product details & prices
🗑️ Delete products
🔍 Search by name/description
📂 Filter by category
💰 Filter by price range
📦 Filter by stock status

**Key Information Captured:**

- Product name, category, price
- Stock quantity
- Seller information
- Product description & images
- SKU, warranty details

---

### Flash Deals (`/admin/flash-deals`)

**Purpose:** Time-limited promotional offers

**Available Actions:**
✨ Create flash deals
⏰ Set deal duration
💸 Set discount percentage
📊 Track deal performance

---

### Analytics (`/admin/analytics`)

**Purpose:** Business intelligence & performance tracking

**Dashboard Components:**
📊 Revenue trends (line chart)
📈 Orders trends (bar chart)
🏆 Top categories (horizontal bar)
🥧 Sales distribution (pie chart)
💹 Key metrics with trends
📋 Transaction history

**Export:**

- Download analytics as JSON
- Includes all metrics & transaction data

**Time Ranges:**

- Last 7 days
- Last 14 days
- Last 30 days (default)
- Last 60 days
- Last 90 days

---

## 🎯 Common Tasks

### Add a Product

1. Click **Products** in sidebar
2. Click **"Add Product"** button
3. Fill in details:
   - Name (required)
   - Category (required)
   - Price ₦ (required)
   - Stock quantity (required)
   - Seller name (required)
   - Description (required)
   - Image URL (required)
4. Click **"Add Product"**

### Update Product Price

1. Go to **Products**
2. Find product in table
3. Click the **Edit** button (✏️)
4. Change price field
5. Click **"Update Product"**

### Check Low Stock

1. **Dashboard** shows alert if any items < 10 units
2. Or go to **Products** → Filter "In Stock Only" OFF
3. Sort by stock column to see low items

### View Sales by Category

1. Go to **Analytics**
2. Look at "Revenue by Category" bar chart
3. Or see "Sales Distribution" pie chart
4. Or scroll down to "Category Metrics" section

### See Today's Transactions

1. Go to **Analytics**
2. Look at "Recent Transactions" table
3. Transactions sorted by newest first
4. Click **View All** link from Dashboard

### Export Sales Data

1. Go to **Analytics**
2. Select desired date range
3. Click **"Export"** button
4. JSON file downloads to your computer

---

## 📊 Dashboard Statistics Explained

### Revenue Metrics

- **Total Revenue**: Sum of all completed orders (last 30 days)
- **Revenue Trend**: Comparison to previous 30-day period
- **Avg Order Value**: Average amount per transaction

### Order Metrics

- **Total Orders**: Count of all transactions (last 30 days)
- **Order Trend**: Comparison to previous period
- **Conversion Rate**: % of visitors who purchase

### Inventory

- **Total Products**: Total items in catalog
- **Low Stock Items**: Products with < 10 units

### Best Performers

- **Top Product**: Most popular item by quantity sold
- **Top Category**: Category with highest revenue

---

## 🎨 Status Indicators

### Product Stock Status

| Status       | Color     | Meaning    |
| ------------ | --------- | ---------- |
| In Stock     | 🟢 Green  | 10+ units  |
| Low Stock    | 🟡 Yellow | < 10 units |
| Out of Stock | 🔴 Red    | 0 units    |

### Transaction Status

| Status    | Icon | Meaning               |
| --------- | ---- | --------------------- |
| Completed | ✅   | Successful payment    |
| Pending   | ⏳   | Awaiting confirmation |
| Failed    | ❌   | Payment unsuccessful  |
| Refunded  | 🔄   | Money returned        |

### Performance Indicators

| Indicator | Meaning               |
| --------- | --------------------- |
| ↑ Green   | Improving performance |
| ↓ Red     | Declining performance |

---

## 💡 Pro Tips

### Product Management

1. **Use categories wisely** - Easier to filter and analyze sales
2. **Set original prices** - Enables automatic discount % calculation
3. **Keep SKUs unique** - Helps with inventory tracking
4. **Add clear descriptions** - Improves customer experience
5. **Use high-quality images** - Better product presentation

### Analytics

1. **Monitor weekly** - Stay on top of trends early
2. **Compare periods** - Look at % changes, not just numbers
3. **Track top categories** - Helps plan inventory
4. **Export regularly** - Keep backup of sales data
5. **Set alerts** - Check dashboard alerts daily

### Inventory

1. **Review low stock weekly** - Don't run out unexpectedly
2. **Plan promotions** - Use flash deals on excess inventory
3. **Monitor seasonality** - Stock up before peak seasons
4. **Track SKUs** - Helps reorder efficiently

---

## ⚙️ Settings & Configuration

### Current Configuration

- **Session Timeout:** 1 hour
- **Date Format:** DD-MMM-YYYY
- **Currency:** Nigerian Naira (₦)
- **Language:** English (en-NG)

### Environment Variables

Located in `.env.local`:

```
VITE_API_URL=http://localhost:3000
VITE_ADMIN_EMAIL=cedokamall@gmail.com
VITE_ADMIN_PASSWORD=ckd12_#cedoka
```

---

## 🐛 Troubleshooting

### Can't Login?

- Check email is exactly: `cedokamall@gmail.com`
- Check password is exactly: `ckd12_#cedoka`
- Clear browser cookies & try again

### Products Not Saving?

- Check internet connection
- Refresh page after saving
- Check browser console for errors

### Charts Not Loading?

- Wait for page to fully load
- Try different time range
- Refresh the page

### Data Disappeared?

- Browser cache was cleared
- Try logging out and back in
- Check browser console for errors

---

## 📱 Mobile Usage

The dashboard is fully responsive:

- **Sidebar collapses** on mobile
- **Click hamburger menu** (☰) to open
- **Tap to interact** with charts
- **Scroll tables** horizontally on small screens

---

## 🔒 Security Notes

### Current (Development)

- Credentials hardcoded (demo only)
- No encryption (localStorage)
- No audit logs

### For Production

- Use backend authentication API
- Implement JWT tokens
- Add SSL/HTTPS
- Enable two-factor authentication
- Log all admin actions
- Use secure session management

---

## 📞 Need Help?

### Check:

1. **This guide** - Most common answers
2. **Admin Dashboard Enhancement Guide** - Detailed documentation
3. **Browser Console** - F12 to see any errors
4. **Network Tab** - Check API calls (when connected)

### Common Questions:

**Q: How do I restore deleted products?**
A: Currently, deleted products cannot be restored. Be careful when deleting. Consider using "out of stock" status instead.

**Q: Can multiple admins access simultaneously?**
A: Yes, each admin logs in independently. Data is shared (currently in browser cache).

**Q: How often should I export data?**
A: Recommend daily or after major sales days.

**Q: Why are my filter changes slow?**
A: Filters apply instantly. Ensure you have enough system memory.

---

## 🚀 Next Steps

1. ✅ Explore the Dashboard
2. ✅ Add a test product
3. ✅ Review Analytics
4. ✅ Check recent transactions
5. ✅ Set up a flash deal
6. 📅 Schedule daily analytics reviews

---

**Remember:** Regular monitoring helps you make better business decisions! 📊

**Last Updated:** April 2026 | **Version:** 1.0.0
