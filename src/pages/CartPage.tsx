import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, Tag, ArrowLeft, Check, Smartphone, MapPin, CreditCard, Upload, X, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCartStore } from '@/store/cartStore';
import { transactionStore } from '@/store/transactionStore';
import { useProductStore } from '@/store/productStore';
import { generateInvoicePDF } from '@/utils/invoice';
import { toast } from 'sonner';

const formatPrice = (n: number) => '₦' + n.toLocaleString();

const CartPage = () => {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTotal = useCartStore((s) => s.getTotal);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const couponCode = useCartStore((s) => s.couponCode);
  const discount = useCartStore((s) => s.discount);
  const [coupon, setCoupon] = useState('');
  const [step, setStep] = useState(0); // 0=cart, 1=delivery-method, 2=payment/address, 3=confirm, 4=done
  const [deliveryMethod, setDeliveryMethod] = useState<'walk-in' | 'delivery' | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [paymentBank, setPaymentBank] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentFileNames, setAttachmentFileNames] = useState<string[]>([]);
  const [orderSent, setOrderSent] = useState(false);

  const handleCoupon = () => {
    if (applyCoupon(coupon)) {
      toast.success('Coupon applied! You saved ' + Math.round(discount * 100) + '%');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setReceiptFile(file);
      setReceiptFileName(file.name);
      toast.success('Receipt uploaded successfully');
    }
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 5;
    
    if (files.length + attachmentFiles.length > maxFiles) {
      toast.error(`You can attach up to ${maxFiles} files. You have ${attachmentFiles.length} already.`);
      return;
    }

    const validFiles: File[] = [];
    const fileNames: string[] = [];

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large. Max size is 5MB`);
      } else {
        validFiles.push(file);
        fileNames.push(file.name);
      }
    });

    if (validFiles.length > 0) {
      setAttachmentFiles([...attachmentFiles, ...validFiles]);
      setAttachmentFileNames([...attachmentFileNames, ...fileNames]);
      toast.success(`${validFiles.length} file(s) attached successfully`);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachmentFiles(attachmentFiles.filter((_, i) => i !== index));
    setAttachmentFileNames(attachmentFileNames.filter((_, i) => i !== index));
  };

  const sendWhatsAppMessage = (message: string) => {
    const whatsappNumber = '2349128817136'; // Company WhatsApp number
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  const decrementPromises: Promise<void>[] = [];
  const handleDecrementStock = async () => {
    const productStore = useProductStore.getState();
    const decrements = items.map(item => productStore.decrementStock(item.id, item.quantity));
    await Promise.all(decrements);
  };

  const buildInvoiceData = (orderNumber: string, timestamp: string) => {
    const subtotal = getTotal();
    const deliveryFee = 0;
    const totalAmount = subtotal + deliveryFee;

    let paymentNote = '';
    if (paymentMethod === 'online') {
      paymentNote = [
        `Bank: Fidelity Bank`,
        `Account Name: CEDOKA GLOBAL LIMITED`,
        `Account Number: 5080201438`,
        `Amount Due: ₦${totalAmount.toLocaleString()}`,
        ``,
        `--- PAYMENT DETAILS FROM CUSTOMER ---`,
        `Payer's Bank: ${paymentBank || 'Not provided'}`,
        `Transaction Ref: ${paymentRef || 'Not provided'}`,
        `Amount Paid: ${paymentAmount ? `₦${Number(paymentAmount).toLocaleString()}` : 'Not provided'}`,
        `Payment Date: ${paymentDate || 'Not provided'}`,
        `Receipt: ${receiptFileName || 'Not provided'}`,
      ].join('\n');
    } else {
      paymentNote = deliveryMethod === 'delivery' ? 'Online Payment - Bank Transfer' : 'Cash Payment - Pay at pickup';
    }

    return {
      orderNumber,
      dateTime: timestamp,
      customerName,
      deliveryMethod: deliveryMethod === 'walk-in' ? 'Walk-in / Store Pickup' : 'Home Delivery',
      address,
      phone,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      })),
      subtotal,
      deliveryFee,
      discount,
      discountCode: couponCode,
      total: totalAmount,
      paymentMethod: paymentMethod === 'online' ? 'Bank Transfer' : 'Cash',
      paymentNote,
    };
  };

  const handleOrderConfirmation = () => {
    if (!customerName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (deliveryMethod === 'delivery') {
      if (!phone.trim()) {
        toast.error('Please enter your phone number');
        return;
      }
      if (!address.trim()) {
        toast.error('Please enter your delivery address');
        return;
      }
    }

    if (paymentMethod === 'online') {
      if (!receiptFile) {
        toast.error('Please upload your payment receipt');
        return;
      }
    }

    const orderNumber = 'CDK-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const timestamp = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });

    // Generate and download PDF invoice first
    const invoiceData = buildInvoiceData(orderNumber, timestamp);
    const doc = generateInvoicePDF(invoiceData);
    doc.save(`invoice-${orderNumber}.pdf`);

    // Short WhatsApp message
    const deliveryInfo = deliveryMethod === 'walk-in'
      ? 'Walk-in / Store Pickup'
      : `Delivery: ${address} | Tel: ${phone}`;

    const message = `NEW ORDER - CedokaMall
━━━━━━━━━━━━━━━━━━
Order ID: ${orderNumber}
Date: ${timestamp}
Customer: ${customerName}
Delivery: ${deliveryInfo}

    Items:
${items.map((item, i) => `  ${i + 1}. ${item.name} x${item.quantity} = ₦${(item.price * item.quantity).toLocaleString()}`).join('\n')}

Total: ₦${invoiceData.total.toLocaleString()}
Payment: ${invoiceData.paymentMethod}

📎 PDF invoice has been downloaded. Please attach it to this chat.
✅ Kindly confirm this order by replying: CONFIRMED`.trim();

    sendWhatsAppMessage(message);

    // Record transactions for analytics
    items.forEach(item => {
      void transactionStore.addTransaction({
        orderId: orderNumber,
        productId: item.id,
        productName: item.name,
        customerEmail: customerName,
        amount: item.price * item.quantity,
        quantity: item.quantity,
        status: 'completed',
        type: 'sale',
        paymentMethod: paymentMethod === 'online' ? 'Transfer' : 'Cash',
        deliveryMethod: deliveryMethod === 'walk-in' ? 'Walk-in / Store Pickup' : 'Home Delivery',
        category: item.category || 'General',
      });
    });

    // Decrement stock for each sold item
    void handleDecrementStock();

    setOrderSent(true);
    toast.success('📄 Invoice PDF downloaded! Please attach it to your WhatsApp message.', { duration: 6000 });
  };

  const downloadInvoicePDF = () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name first');
      return;
    }

    const orderNumber = 'CDK-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const timestamp = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });

    const invoiceData = buildInvoiceData(orderNumber, timestamp);
    const doc = generateInvoicePDF(invoiceData);
    doc.save(`invoice-${orderNumber}.pdf`);
    toast.success('Invoice PDF downloaded successfully');
  };

  const steps = deliveryMethod === 'walk-in' 
    ? ['Cart', 'Delivery Method', 'Payment', 'Confirm']
    : ['Cart', 'Delivery Method', 'Address & Payment', 'Confirm'];

  if (items.length === 0 && step === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-10 sm:py-20">
          <div className="mx-auto max-w-xl rounded-xl border border-gold-antique/10 bg-card p-8 text-center sm:p-12">
            <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
            <p className="mt-2 text-muted-foreground">
              Add products from any of our categories to start an order.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold transition-colors hover:bg-primary/90"
            >
              Browse electronics <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/solar" className="rounded-full border border-gold-antique/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-navy transition-colors hover:border-gold hover:text-gold">
                Renewable Energy
              </Link>
              <Link to="/farms" className="rounded-full border border-gold-antique/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-navy transition-colors hover:border-gold hover:text-gold">
                Farms
              </Link>
              <Link to="/brands" className="rounded-full border border-gold-antique/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-navy transition-colors hover:border-gold hover:text-gold">
                Brands
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-6">
        {/* Steps indicator */}
        <div className="hidden sm:flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i + 1}
              </div>
              <span className={`text-sm ${i <= step ? 'font-medium' : 'text-muted-foreground'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
        {/* Mobile steps: simple circles only */}
        <div className="flex sm:hidden items-center justify-center gap-6 mb-6">
          {steps.map((s, i) => (
            <div key={s} className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? 'bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary/30' : 'bg-muted text-muted-foreground'}`}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* STEP 0: Cart */}
        {step === 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 overflow-hidden bg-card rounded-xl border p-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 object-cover rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium">{item.name}</h3>
                    <p className="text-lg font-bold text-primary mt-1">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">Quantity: {item.quantity}</span>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-destructive hover:text-destructive/80">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-xl border p-6 h-fit space-y-4">
              <h3 className="font-display text-lg font-bold">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(getSubtotal())}</span></div>
                {discount > 0 && <div className="flex justify-between text-primary"><span>Discount ({couponCode})</span><span>-{Math.round(discount * 100)}%</span></div>}
              </div>
              
              {/* Coupon */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
                </div>
                <button onClick={handleCoupon} className="px-4 py-2 bg-muted text-sm font-medium rounded-lg hover:bg-muted-foreground/10">Apply</button>
              </div>
              
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Subtotal</span>
                <span className="text-primary">{formatPrice(getTotal())}</span>
              </div>
              <button onClick={() => setStep(1)} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-bold hover:bg-cta-orange-light transition-colors">
                Proceed to Checkout
              </button>
              <Link to="/shop" className="w-full py-3 rounded-xl border text-center font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {/* STEP 1: Choose Delivery Method */}
        {step === 1 && !deliveryMethod && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold">Choose Delivery Option</h2>
              <button onClick={() => setStep(0)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Walk-in Option */}
              <button
                onClick={() => setDeliveryMethod('walk-in')}
                className="bg-card border-2 border-transparent hover:border-primary rounded-xl p-6 text-left transition-all hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <Smartphone className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Walk-in at Store 🏪</h3>
                    <p className="text-sm text-muted-foreground mb-3">Pick up directly from our store</p>
                    <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                      <li>✓ Free (No delivery charge)</li>
                      <li>✓ 35 Ailegun Road, Ejigbo, Lagos</li>
                      <li>✓ Available 9 AM - 6 PM</li>
                      <li>✓ Pay upon pickup</li>
                    </ul>
                    <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="text-base">⚠️</span>
                      Note: Payments must be confirmed at least 48hrs prior to pickup
                    </div>
                  </div>
                </div>
              </button>

              {/* Delivery Option */}
              <button
                onClick={() => setDeliveryMethod('delivery')}
                className="bg-card border-2 border-transparent hover:border-primary rounded-xl p-6 text-left transition-all hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <MapPin className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Home Delivery 📦</h3>
                    <p className="text-sm text-muted-foreground mb-3">Get items delivered to your address</p>
                    <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                      <li>✓ 24-72 hours delivery</li>
                      <li>✓ Nationwide coverage</li>
                    </ul>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Payment & Address */}
        {step === 1 && deliveryMethod === 'walk-in' && (
          <div className="max-w-lg mx-auto bg-card rounded-xl border p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Order Details</h2>
              <button onClick={() => { setDeliveryMethod(null); }} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Change
              </button>
            </div>

            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <p className="text-sm font-medium mb-2">📍 Pickup Location</p>
              <p className="text-sm">35 Ailegun Road, Ejigbo, Lagos</p>
              <p className="text-sm text-muted-foreground mt-1">Available 9 AM - 6 PM daily</p>
              <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
                <span className="text-base">⚠️</span>
                Note: Payments must be confirmed at least 48hrs prior to pickup
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-medium mb-2">💳 Company Account Details (For Online Transfer)</p>
              <div className="text-sm space-y-1 font-mono">
                <p><span className="font-semibold">Account Name:</span> CEDOKA GLOBAL LIMITED</p>
                <p><span className="font-semibold">Account Number:</span> 5080201438</p>
                <p><span className="font-semibold">Bank:</span> Fidelity Bank</p>
              </div>
            </div>

            {/* Walk-in Receipt Upload & Payment Details */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-4">
              <p className="text-sm font-medium mb-2">📸 Upload Payment Receipt <span className="text-red-500">*</span></p>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleReceiptUpload}
                  className="hidden"
                  id="walkin-receipt-upload"
                />
                <label htmlFor="walkin-receipt-upload" className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors bg-white">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Click to upload receipt (PDF, JPG, PNG, DOC)</span>
                </label>
                {receiptFileName && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-white rounded border border-green-300">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 break-words flex-1">{receiptFileName}</span>
                    <button 
                      onClick={() => { setReceiptFile(null); setReceiptFileName(''); }}
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-blue-200 pt-3">
                <p className="text-sm font-medium mb-1">💳 Enter Your Payment Details (Optional)</p>
                <p className="text-xs text-blue-600 mb-3">For better tracking and easy resolution, please fill these in</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Bank Name You Paid From</label>
                    <input
                      type="text"
                      placeholder="e.g. GTBank, Access Bank, UBA"
                      value={paymentBank}
                      onChange={(e) => setPaymentBank(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Transaction / Reference ID</label>
                    <input
                      type="text"
                      placeholder="e.g. TXN1234567890"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Amount Paid (₦)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Date of Payment</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Order Summary</p>
              <div className="text-sm space-y-2 mb-4">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(getTotal())}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span className="text-green-600">FREE</span></div>
                {discount > 0 && <div className="flex justify-between text-primary"><span>Discount ({couponCode})</span><span>-{Math.round(discount * 100)}%</span></div>}
                <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>{formatPrice(getTotal())}</span></div>
              </div>
            </div>

            {/* Promo Code - Optional, coming soon */}
            <div className="pt-2">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="text"
                  placeholder="Promo code (coming soon)"
                  disabled
                  className="w-full pl-9 pr-3 py-2.5 border border-dashed rounded-lg text-sm bg-muted/30 text-muted-foreground/60 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-muted-foreground/50 mt-1">Promo discount codes will be available soon</p>
            </div>

            <button onClick={() => setStep(2)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
              Proceed to Confirm Order
            </button>
          </div>
        )}

        {step === 1 && deliveryMethod === 'delivery' && (
          <div className="max-w-lg mx-auto bg-card rounded-xl border p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Delivery Address</h2>
              <button onClick={() => { setDeliveryMethod(null); }} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Change
              </button>
            </div>

            <input 
              type="text" 
              placeholder="Full Name" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg" 
            />
            <input 
              type="tel" 
              placeholder="Phone Number (e.g., +234 801 234 5678)" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg" 
            />
            <textarea 
              placeholder="Street Address, Apartment, Landmark, etc." 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg min-h-24"
            />

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm font-medium mb-3">💬 Payment Options</p>
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="radio" 
                  checked={paymentMethod === 'online'} 
                  onChange={() => setPaymentMethod('online')} 
                  className="accent-primary"
                />
                Online Payment (Bank Transfer)
              </label>
            </div>

            {paymentMethod === 'online' && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">🏦 Company Bank Account Details</p>
                  <div className="bg-white rounded p-3 space-y-1 text-sm font-mono">
                    <p><span className="font-semibold">Bank:</span> Fidelity Bank</p>
                    <p><span className="font-semibold">Account Name:</span> CEDOKA GLOBAL LIMITED</p>
                    <p><span className="font-semibold">Account Number:</span> 5080201438</p>
                    <p><span className="font-semibold">Amount:</span> ₦{getTotal().toLocaleString()}</p>
                  </div>
                </div>

                {/* Receipt Upload */}
                <div>
                  <p className="text-sm font-medium mb-2">📸 Upload Payment Receipt <span className="text-red-500">*</span></p>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleReceiptUpload}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label htmlFor="receipt-upload" className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors bg-white">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Click to upload receipt (PDF, JPG, PNG, DOC)</span>
                    </label>
                    {receiptFileName && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-white rounded border border-green-300">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 break-words flex-1">{receiptFileName}</span>
                        <button 
                          onClick={() => { setReceiptFile(null); setReceiptFileName(''); }}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="border-t border-blue-200 pt-3">
                  <p className="text-sm font-medium mb-1">💳 Enter Your Payment Details (Optional)</p>
                  <p className="text-xs text-blue-600 mb-3">For better tracking and easy resolution, please fill these in</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Bank Name You Paid From</label>
                      <input
                        type="text"
                        placeholder="e.g. GTBank, Access Bank, UBA"
                        value={paymentBank}
                        onChange={(e) => setPaymentBank(e.target.value)}
                        className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Transaction / Reference ID</label>
                      <input
                        type="text"
                        placeholder="e.g. TXN1234567890"
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Amount Paid (₦)</label>
                      <input
                        type="number"
                        placeholder="e.g. 50000"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Date of Payment</label>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Order Summary</p>
              <div className="text-sm space-y-2 mb-4">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(getTotal())}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>₦2,500</span></div>
                {discount > 0 && <div className="flex justify-between text-primary"><span>Discount ({couponCode})</span><span>-{Math.round(discount * 100)}%</span></div>}
                <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>{formatPrice(getTotal())}</span></div>
              </div>
            </div>

            {/* Promo Code - Optional, coming soon */}
            <div className="pt-2">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="text"
                  placeholder="Promo code (coming soon)"
                  disabled
                  className="w-full pl-9 pr-3 py-2.5 border border-dashed rounded-lg text-sm bg-muted/30 text-muted-foreground/60 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-muted-foreground/50 mt-1">Promo discount codes will be available soon</p>
            </div>

            <button onClick={() => setStep(2)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
              Proceed to Confirm Order
            </button>
          </div>
        )}

        {/* STEP 3: Confirm Order */}
        {step === 2 && (
          <div className="max-w-lg mx-auto bg-card rounded-xl border p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Confirm Order</h2>
              <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-medium mb-2">📝 Please Enter Your Name</p>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />
              <p className="text-xs text-muted-foreground mt-2">This will be included in your WhatsApp confirmation message</p>
            </div>

            {paymentMethod === 'online' && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-sm font-medium mb-2">🏦 Payment Details Summary</p>
                <div className="text-sm font-mono space-y-1 mb-2">
                  <p><span className="font-semibold">Bank:</span> Fidelity Bank</p>
                  <p><span className="font-semibold">Account:</span> 5080201438</p>
                  <p><span className="font-semibold">Name:</span> CEDOKA GLOBAL LIMITED</p>
                </div>
                {receiptFileName && (
                  <div className="flex items-center gap-2 p-2 bg-white rounded border border-green-300">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium truncate flex-1">{receiptFileName}</span>
                  </div>
                )}
                {(paymentBank || paymentRef || paymentAmount || paymentDate) && (
                  <div className="mt-3 bg-white rounded p-3 space-y-1.5 text-sm border border-amber-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Payment Info</p>
                    {paymentBank && <p><span className="font-semibold">Bank:</span> {paymentBank}</p>}
                    {paymentRef && <p><span className="font-semibold">Ref:</span> {paymentRef}</p>}
                    {paymentAmount && <p><span className="font-semibold">Amount:</span> ₦{Number(paymentAmount).toLocaleString()}</p>}
                    {paymentDate && <p><span className="font-semibold">Date:</span> {paymentDate}</p>}
                  </div>
                )}
              </div>
            )}

            {/* File Attachment for WhatsApp */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-medium mb-3">📎 Attach Files (Optional)</p>
              <p className="text-xs text-muted-foreground mb-3">
                Attach payment receipts, documents, or proof of payment to send with your WhatsApp message. 
                You can attach up to 5 files (max 5MB each).
              </p>
              
              <div className="relative">
                <input 
                  type="file" 
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileAttachment}
                  className="hidden"
                  id="file-attachment-upload"
                />
                <label htmlFor="file-attachment-upload" className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors bg-white">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Click to attach files</span>
                </label>
              </div>

              {/* Attached Files List */}
              {attachmentFileNames.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600">Attached Files ({attachmentFileNames.length}):</p>
                  {attachmentFileNames.map((fileName, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border border-blue-200">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-700 flex-1 truncate">{fileName}</span>
                      <button 
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-blue-600 mt-3 font-medium">
                💡 After clicking "Send to WhatsApp", you can attach additional files directly in the WhatsApp chat by clicking the attachment button.
              </p>
            </div>

            {/* Promo Code - Optional, coming soon */}
            <div className="pt-2">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="text"
                  placeholder="Promo code (coming soon)"
                  disabled
                  className="w-full pl-9 pr-3 py-2.5 border border-dashed rounded-lg text-sm bg-muted/30 text-muted-foreground/60 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-muted-foreground/50 mt-1">Promo discount codes will be available soon</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-sm">Order Summary:</h3>
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b">
                  <span>{item.name} x{item.quantity}</span>
                  <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal</span>
                  <span>{formatPrice(getTotal())}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm mb-2 text-primary">
                    <span>Discount ({couponCode})</span>
                    <span>-{Math.round(discount * 100)}%</span>
                  </div>
                )}
                {deliveryMethod === 'walk-in' && (
                  <div className="flex justify-between text-sm mb-2">
                    <span>Delivery</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(getTotal())}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 text-sm">
              <p className="font-medium mb-2">✅ Next Step:</p>
              <p className="text-sm">Click "Send to WhatsApp" to send your complete order details. You'll receive confirmation via WhatsApp.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleOrderConfirmation} 
                disabled={
                  !customerName.trim() || 
                  (deliveryMethod === 'delivery' && (!phone.trim() || !address.trim())) ||
                  (paymentMethod === 'online' && !receiptFile)
                }
                className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-bold hover:bg-cta-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {orderSent ? (
                  <>
                    <Check className="w-5 h-5" /> Message Sent!
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5" /> Send to WhatsApp 💬
                  </>
                )}
              </button>
              <button
                onClick={downloadInvoicePDF}
                disabled={!customerName.trim() || (paymentMethod === 'online' && !receiptFile)}
                className="py-3 px-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" /> Invoice PDF
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              A WhatsApp message with your order details will be sent to 09128817136
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
