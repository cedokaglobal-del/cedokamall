import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, Tag, ArrowLeft, Check, Smartphone, MapPin, CreditCard, Upload, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

const formatPrice = (n: number) => '₦' + n.toLocaleString();

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getSubtotal, getTotal, applyCoupon, couponCode, discount } = useCartStore();
  const [coupon, setCoupon] = useState('');
  const [step, setStep] = useState(0); // 0=cart, 1=delivery-method, 2=payment/address, 3=confirm, 4=done
  const [deliveryMethod, setDeliveryMethod] = useState<'walk-in' | 'delivery' | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
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

  const handleOrderConfirmation = () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (deliveryMethod === 'delivery' && paymentMethod === 'online' && !receiptFile) {
      toast.error('Please upload payment receipt for online payment');
      return;
    }

    // Format order details
    const orderNumber = 'CDK-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const timestamp = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });
    const itemsList = items.map(item => `  • ${item.name}\n    Qty: ${item.quantity} × ₦${item.price.toLocaleString()} = ₦${(item.price * item.quantity).toLocaleString()}`).join('\n');
    const subtotal = getTotal();
    const deliveryFee = deliveryMethod === 'delivery' ? 2500 : 0;
    const totalAmount = subtotal + deliveryFee;

    let paymentSection = '';
    if (deliveryMethod === 'delivery' && paymentMethod === 'online') {
      paymentSection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 PAYMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bank: Fidelity Bank
Account Name: CEDOKA GLOBAL LIMITED
Account Number: 5080201438
Amount: ₦${totalAmount.toLocaleString()}

📎 Payment Receipt: ${receiptFileName}`;
    } else if (deliveryMethod === 'walk-in' && paymentMethod === 'online') {
      paymentSection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 PAYMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bank: Fidelity Bank
Account Name: CEDOKA GLOBAL LIMITED
Account Number: 5080201438
Amount: ₦${totalAmount.toLocaleString()}

📎 Payment Receipt: ${receiptFileName}

⏰ Please ensure payment is completed before pickup`;
    } else {
      paymentSection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 PAYMENT METHOD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${deliveryMethod === 'delivery' ? 'Cash on Delivery - Pay upon arrival' : 'Cash Payment - Pay at pickup'}`;
    }

    const message = `
╔════════════════════════════════╗
║  📦 NEW ORDER - CEDOKA MAL  📦  ║
║      Electronics & Gadgets      ║
╚════════════════════════════════╝

📋 ORDER ID: ${orderNumber}
📅 Date & Time: ${timestamp}
👤 Customer: ${customerName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 DELIVERY INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${deliveryMethod === 'walk-in' 
  ? `Type: 🏪 Walk-in / Store Pickup
Location: Nationwide (Delivery Across Nigeria)
Hours: 9 AM - 6 PM Daily`
  : `Type: 📦 Online Delivery
Address: ${address}
Phone: ${phone}
⏱️ Estimated Delivery: 24-72 hours Nationwide`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛍️ ITEMS ORDERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 PAYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal ........... ₦${subtotal.toLocaleString()}
${deliveryMethod === 'delivery' ? `Delivery Fee ........ ₦${deliveryFee.toLocaleString()}` : `Delivery ........... FREE ✓`}
${discount > 0 ? `Discount (${couponCode}) .. -${Math.round(discount * 100)}%` : ''}
────────────────────────────────
TOTAL AMOUNT ....... ₦${totalAmount.toLocaleString()}
${paymentSection}

╔════════════════════════════════╗
║  ✅ Please confirm this order  ║
║   by replying with: CONFIRMED  ║
╚════════════════════════════════╝

Thank you for shopping with Cedoka! 
We appreciate your business! 🙏
    `.trim();

    sendWhatsAppMessage(message);
    setOrderSent(true);
    toast.success('WhatsApp message sent! Please confirm on WhatsApp');
  };

  const steps = deliveryMethod === 'walk-in' 
    ? ['Cart', 'Delivery Method', 'Payment', 'Confirm']
    : ['Cart', 'Delivery Method', 'Address & Payment', 'Confirm'];

  if (items.length === 0 && step === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-6xl mb-4">🛒</p>
          <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Discover amazing electronics and gadgets</p>
          <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
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
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i <= step ? 'font-medium' : 'text-muted-foreground'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* STEP 0: Cart */}
        {step === 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-card rounded-xl border p-4">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-lg font-bold text-primary mt-1">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded border flex items-center justify-center hover:bg-muted">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded border flex items-center justify-center hover:bg-muted">
                        <Plus className="w-3 h-3" />
                      </button>
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
                      <li>✓ 2 Mukaila Okunade Street, By Okeafo Bus Stop, Lagos</li>
                      <li>✓ Available 9 AM - 6 PM</li>
                      <li>✓ Pay upon pickup</li>
                    </ul>
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
                      <li>✓ ₦2,500 delivery fee</li>
                      <li>✓ 24-72 hours delivery</li>
                      <li>✓ Nationwide coverage</li>
                      <li>✓ WhatsApp & Cash on Delivery</li>
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
              <p className="text-sm">2 Mukaila Okunade Street, By Okeafo Bus Stop, Lagos</p>
              <p className="text-sm text-muted-foreground mt-1">Available 9 AM - 6 PM daily</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-medium mb-2">💳 Company Account Details (For Online Transfer)</p>
              <div className="text-sm space-y-1 font-mono">
                <p><span className="font-semibold">Account Name:</span> CEDOKA GLOBAL LIMITED</p>
                <p><span className="font-semibold">Account Number:</span> 5080201438</p>
                <p><span className="font-semibold">Bank:</span> Fidelity Bank</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Order Summary</p>
              <div className="text-sm space-y-2 mb-4">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(getTotal())}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span className="text-green-600">FREE</span></div>
                <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>{formatPrice(getTotal())}</span></div>
              </div>
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
              <label className="flex items-center gap-2 text-sm mb-3">
                <input 
                  type="radio" 
                  checked={paymentMethod === 'cash-on-delivery'} 
                  onChange={() => setPaymentMethod('cash-on-delivery')} 
                  className="accent-primary"
                />
                Cash on Delivery (Pay when item arrives)
              </label>
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
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">🏦 Company Bank Account Details</p>
                  <div className="bg-white rounded p-3 space-y-1 text-sm font-mono">
                    <p><span className="font-semibold">Bank:</span> Fidelity Bank</p>
                    <p><span className="font-semibold">Account Name:</span> CEDOKA GLOBAL LIMITED</p>
                    <p><span className="font-semibold">Account Number:</span> 5080201438</p>
                    <p><span className="font-semibold">Amount:</span> ₦{(getTotal() + 2500).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">📸 Upload Payment Receipt</p>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={handleReceiptUpload}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label htmlFor="receipt-upload" className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Click to upload receipt (PDF, JPG, PNG)</span>
                    </label>
                    {receiptFileName && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-white rounded border border-green-300">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">{receiptFileName}</span>
                        <button 
                          onClick={() => { setReceiptFile(null); setReceiptFileName(''); }}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Order Summary</p>
              <div className="text-sm space-y-2 mb-4">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(getTotal())}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>₦2,500</span></div>
                <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>{formatPrice(getTotal() + 2500)}</span></div>
              </div>
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
                    <span className="text-sm text-green-700 font-medium">{receiptFileName}</span>
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
                {deliveryMethod === 'delivery' && (
                  <div className="flex justify-between text-sm mb-2">
                    <span>Delivery</span>
                    <span>₦2,500</span>
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
                  <span className="text-primary">{formatPrice(getTotal() + (deliveryMethod === 'delivery' ? 2500 : 0))}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 text-sm">
              <p className="font-medium mb-2">✅ Next Step:</p>
              <p className="text-sm">Click "Send to WhatsApp" to send your complete order details. You'll receive confirmation via WhatsApp.</p>
            </div>

            <button 
              onClick={handleOrderConfirmation} 
              disabled={!customerName.trim() || (deliveryMethod === 'delivery' && paymentMethod === 'online' && !receiptFile)}
              className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-bold hover:bg-cta-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
