export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  inStock: number;
  seller: string;
  specs?: Record<string, string>;
  warranty?: string;
}

export interface Category {
  name: string;
  icon: string;
  count: number;
  slug: string;
  subcategory?: string;
}

export const categories = [
  // Electronics & Gadgets
  { name: 'Smartphones', icon: '📱', count: 1240, slug: 'smartphones', subcategory: 'Electronics' },
  { name: 'Laptops', icon: '💻', count: 3420, slug: 'laptops', subcategory: 'Electronics' },
  { name: 'Tablets', icon: '📲', count: 2890, slug: 'tablets', subcategory: 'Electronics' },
  { name: 'Audio & Sound', icon: '🎧', count: 1870, slug: 'audio-sound', subcategory: 'Electronics' },
  { name: 'Cameras', icon: '📷', count: 2100, slug: 'cameras', subcategory: 'Electronics' },
  { name: 'Gaming', icon: '🎮', count: 980, slug: 'gaming', subcategory: 'Electronics' },
  { name: 'Accessories', icon: '⚙️', count: 4200, slug: 'accessories', subcategory: 'Electronics' },
  
  // Home Appliances
  { name: 'TV', icon: '📺', count: 450, slug: 'tv', subcategory: 'Home Appliances' },
  { name: 'Refrigerators', icon: '🧊', count: 320, slug: 'refrigerators', subcategory: 'Home Appliances' },
  { name: 'Washing Machines', icon: '🧺', count: 280, slug: 'washing-machines', subcategory: 'Home Appliances' },
  { name: 'Air Conditioners', icon: '❄️', count: 420, slug: 'ac', subcategory: 'Home Appliances' },
  { name: 'Fans', icon: '💨', count: 350, slug: 'fans', subcategory: 'Home Appliances' },
  { name: 'Generators', icon: '⚡', count: 180, slug: 'generators', subcategory: 'Home Appliances' },
  { name: 'Freezers', icon: '🧊', count: 150, slug: 'freezers', subcategory: 'Home Appliances' },
  { name: 'Sound Systems', icon: '🔊', count: 220, slug: 'sound-systems', subcategory: 'Home Appliances' },
  
  // Smart Home & Others
  { name: 'Smart Home', icon: '🏠', count: 1560, slug: 'smart-home', subcategory: 'Smart Living' },
];

import { productStore } from '@/store/productStore';

export const initialProducts: Product[] = [
  // Smartphones
  { id: 'e1', name: 'Samsung Galaxy S25 Ultra 256GB', price: 1250000, originalPrice: 1450000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', category: 'smartphones', rating: 4.8, reviews: 342, badge: 'Best Seller', description: 'Experience the future with Samsung\'s flagship smartphone. 200MP camera, S Pen included, titanium frame.', inStock: 24, seller: 'TechHub Lagos', specs: { processor: 'Snapdragon 8 Elite', ram: '16GB', storage: '256GB' }, warranty: '2 Years' },
  { id: 'p1', name: 'iPhone 16 Pro Max 512GB', price: 1950000, originalPrice: 2200000, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', category: 'smartphones', rating: 4.9, reviews: 89, badge: 'New Arrival', description: 'Apple\'s most powerful iPhone ever. A18 Pro chip, 48MP camera system.', inStock: 6, seller: 'Apple Authorized NG', specs: { processor: 'A18 Pro', ram: '12GB', storage: '512GB' }, warranty: '2 Years' },
  { id: 'p2', name: 'Tecno Camon 30 Premier', price: 185000, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', category: 'smartphones', rating: 4.4, reviews: 456, description: 'Best camera phone under ₦200k. 50MP Sony sensor, 5000mAh battery.', inStock: 55, seller: 'TechHub Lagos', specs: { processor: 'MediaTek Helio G95', ram: '8GB', storage: '256GB' }, warranty: '1 Year' },
  { id: 'p3', name: 'Samsung Galaxy A55 5G', price: 280000, originalPrice: 320000, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400', category: 'smartphones', rating: 4.5, reviews: 334, description: 'Premium mid-range 5G phone with stunning AMOLED display.', inStock: 28, seller: 'TechHub Lagos', specs: { processor: 'Exynos 1280', ram: '8GB', storage: '128GB' }, warranty: '2 Years' },
  
  // Laptops
  { id: 'e2', name: 'Apple MacBook Air M3 15"', price: 1850000, originalPrice: 2100000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', category: 'laptops', rating: 4.9, reviews: 128, badge: 'Premium', description: 'Stunningly thin design with the blazing-fast M3 chip. 15-hour battery life.', inStock: 12, seller: 'Apple Authorized NG', specs: { processor: 'Apple M3', ram: '16GB', storage: '512GB' }, warranty: '1 Year' },
  { id: 'e6', name: 'iPad Pro 12.9" M2 Chip', price: 1100000, originalPrice: 1300000, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', category: 'laptops', rating: 4.8, reviews: 156, description: 'The ultimate iPad experience with M2 chip and Liquid Retina XDR display.', inStock: 15, seller: 'Apple Authorized NG', specs: { processor: 'Apple M2', ram: '8GB', storage: '256GB' }, warranty: '1 Year' },
  
  // Tablets
  { id: 'tab1', name: 'Samsung Galaxy Tab S10 Pro', price: 950000, originalPrice: 1100000, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', category: 'tablets', rating: 4.7, reviews: 234, badge: 'Best Seller', description: 'Stunning 14.6" display with 120Hz refresh rate. Perfect for productivity and entertainment.', inStock: 18, seller: 'TechHub Lagos', specs: { processor: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '512GB' }, warranty: '2 Years' },
  
  // Audio & Sound
  { id: 'e3', name: 'Sony WH-1000XM5 Headphones', price: 285000, originalPrice: 350000, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', category: 'audio-sound', rating: 4.7, reviews: 567, description: 'Industry-leading noise cancellation with exceptional sound quality.', inStock: 45, seller: 'SoundWave NG', specs: { driver: '40mm', batteryLife: '30 hours', connectivity: 'Bluetooth 5.3' }, warranty: '2 Years' },
  { id: 'e5', name: 'JBL Charge 5 Bluetooth Speaker', price: 95000, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', category: 'audio-sound', rating: 4.5, reviews: 234, description: 'Powerful JBL Original Pro Sound with deep bass. IP67 waterproof.', inStock: 67, seller: 'SoundWave NG', specs: { power: '30W', batteryLife: '20 hours', waterproof: 'IP67' }, warranty: '1 Year' },
  { id: 'as1', name: 'Bose QuietComfort Earbuds II', price: 165000, originalPrice: 195000, image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400', category: 'audio-sound', rating: 4.8, reviews: 412, description: 'Premium wireless earbuds with top-tier noise cancellation.', inStock: 30, seller: 'SoundWave NG', specs: { driver: '5.5mm', batteryLife: '6 hours', connectivity: 'Bluetooth 5.3' }, warranty: '2 Years' },
  
  // Cameras
  { id: 'cam1', name: 'Canon EOS R5 Mirrorless Camera', price: 2500000, originalPrice: 2800000, image: 'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=400', category: 'cameras', rating: 4.9, reviews: 178, badge: 'Premium', description: '45MP full-frame sensor with 8K video capability. Perfect for professionals.', inStock: 8, seller: 'Photography Hub', specs: { sensor: '45MP Full-Frame', videoCapture: '8K', autofocus: 'Dual Pixel CMOS AF' }, warranty: '2 Years' },
  { id: 'cam2', name: 'Sony Alpha A6700 Camera', price: 1800000, originalPrice: 2000000, image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400', category: 'cameras', rating: 4.7, reviews: 125, description: 'Compact APS-C mirrorless with excellent autofocus and video features.', inStock: 12, seller: 'Photography Hub', specs: { sensor: '26MP APS-C', videoCapture: '4K 120fps', autofocus: 'AI-Powered' }, warranty: '2 Years' },
  
  // Gaming
  { id: 'gam1', name: 'PlayStation 5 Pro 2TB', price: 850000, originalPrice: 950000, image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400', category: 'gaming', rating: 4.8, reviews: 289, badge: 'Best Seller', description: '4K gaming at 120fps. Exclusive games and next-gen experience.', inStock: 14, seller: 'Gaming Central', specs: { storage: '2TB SSD', gpu: 'RDNA 2', cpu: 'Zen 2' }, warranty: '1 Year' },
  { id: 'gam2', name: 'Xbox Series X', price: 780000, image: 'https://images.unsplash.com/photo-1535688194375-f3456efaf6d7?w=400', category: 'gaming', rating: 4.6, reviews: 203, description: '12 TFLOPS of processing power. Play over 100 games with Game Pass.', inStock: 16, seller: 'Gaming Central', specs: { storage: '1TB SSD', gpu: 'RDNA 2', cpu: 'Zen 2' }, warranty: '1 Year' },
  { id: 'gam3', name: 'Nvidia RTX 4090 Graphics Card', price: 3500000, originalPrice: 3900000, image: 'https://images.unsplash.com/photo-1587829191301-6cbab1f9c61f?w=400', category: 'gaming', rating: 4.9, reviews: 567, badge: 'Performance Beast', description: 'Ultimate gaming graphics card. 24GB GDDR6X memory for 4K gaming.', inStock: 6, seller: 'TechHub Lagos', specs: { memory: '24GB GDDR6X', bandwidth: '1008 GB/s', tdp: '575W' }, warranty: '3 Years' },
  
  // Accessories
  { id: 'acc1', name: 'Anker PowerCore 65W PD Charger', price: 28000, originalPrice: 35000, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', category: 'accessories', rating: 4.7, reviews: 412, badge: 'Best Seller', description: 'Fast charging for laptops and phones. USB-C PD, compact design.', inStock: 80, seller: 'TechHub Lagos', specs: { power: '65W', ports: '2x USB-C', compatibility: 'Universal' }, warranty: '1 Year' },
  { id: 'acc2', name: 'USB-C 3.2 Hub 7-in-1', price: 42000, image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400', category: 'accessories', rating: 4.6, reviews: 267, description: 'HDMI, USB 3.0, SD card reader, all in one compact hub.', inStock: 45, seller: 'TechHub Lagos', specs: { ports: '7', connectivity: 'USB-C 3.2', videoOutput: '4K@60Hz' }, warranty: '1 Year' },
  { id: 'acc3', name: 'Tech Armor Tempered Glass Screen Protector 2-Pack', price: 15000, image: 'https://images.unsplash.com/photo-1608447394696-e7b92f85fd20?w=400', category: 'accessories', rating: 4.8, reviews: 890, description: 'Premium screen protection for smartphones. Crystal clear visibility.', inStock: 120, seller: 'TechHub Lagos', specs: { material: 'Tempered Glass', thickness: '0.33mm', hardness: '9H' }, warranty: '6 Months' },
  { id: 'acc4', name: 'Logitech MX Master 3S Wireless Mouse', price: 95000, originalPrice: 120000, image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400', category: 'accessories', rating: 4.9, reviews: 534, badge: 'Premium', description: 'Advanced wireless mouse for productivity. 8K DPI sensor.', inStock: 35, seller: 'TechHub Lagos', specs: { dpi: '8000', connectivity: 'Bluetooth/USB', batteryLife: '70 days' }, warranty: '2 Years' },
  
  // Smart Home
  { id: 'sh1', name: 'Google Nest Hub Max', price: 185000, originalPrice: 215000, image: 'https://images.unsplash.com/photo-1518635017498-74e7b5265980?w=400', category: 'smart-home', rating: 4.7, reviews: 178, badge: 'Best Seller', description: '10" touchscreen smart display with video calling and AI assistant.', inStock: 22, seller: 'Smart Home Solutions', specs: { display: '10" HD Touch', processor: 'Google Tensor', speakers: 'Dual' }, warranty: '1 Year' },
  { id: 'sh2', name: 'Philips Hue Smart Lighting Starter Kit', price: 95000, image: 'https://images.unsplash.com/photo-1565182999555-2142541466c1?w=400', category: 'smart-home', rating: 4.6, reviews: 312, description: '16 million colors, voice control compatible with Alexa and Google Home.', inStock: 28, seller: 'Smart Home Solutions', specs: { colors: '16M', connectivity: 'Zigbee', voiceControl: 'Yes' }, warranty: '2 Years' },
  { id: 'sh3', name: 'Ring Video Doorbell Pro 2', price: 125000, originalPrice: 145000, image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400', category: 'smart-home', rating: 4.8, reviews: 445, badge: 'New Arrival', description: '3D motion detection with 24/7 video surveillance for your home security.', inStock: 15, seller: 'Smart Home Solutions', specs: { videoQuality: '1080p', nightVision: 'Yes', connectivity: 'WiFi' }, warranty: '2 Years' },

  // TVs
  { id: 'tv1', name: 'Samsung 65" QLED 4K Smart TV', price: 580000, originalPrice: 680000, image: 'https://images.unsplash.com/photo-1522869635100-ce306400e29d?w=400', category: 'tv', rating: 4.8, reviews: 245, badge: 'Best Seller', description: 'Stunning QLED display with quantum dot technology, built-in apps, and 120Hz refresh rate.', inStock: 18, seller: 'TechHub Lagos', specs: { screenSize: '65"', resolution: '4K UHD', refreshRate: '120Hz', hdr: 'Yes' }, warranty: '2 Years' },
  { id: 'tv2', name: 'LG 55" OLED evo C3 Smart TV', price: 450000, originalPrice: 550000, image: 'https://images.unsplash.com/photo-1522869635100-ce306400e29d?w=400', category: 'tv', rating: 4.9, reviews: 189, badge: 'Premium', description: 'Perfect blacks and infinite contrast with OLED technology. Smooth gaming performance.', inStock: 12, seller: 'SoundWave NG', specs: { screenSize: '55"', resolution: '4K OLED', refreshRate: '120Hz', hdr: 'Dolby Vision' }, warranty: '3 Years' },
  { id: 'tv3', name: 'TCL 43" Smart TV HD', price: 125000, image: 'https://images.unsplash.com/photo-1522869635100-ce306400e29d?w=400', category: 'tv', rating: 4.4, reviews: 156, description: 'Affordable HD smart TV with built-in apps and great sound.', inStock: 35, seller: 'TechHub Lagos', specs: { screenSize: '43"', resolution: 'HD', smartTV: 'Yes', connectivity: 'WiFi/HDMI' }, warranty: '1 Year' },
  
  // Refrigerators
  { id: 'fridge1', name: 'LG 600L French Door Refrigerator', price: 850000, originalPrice: 950000, image: 'https://images.unsplash.com/photo-1584568694244-14fbbc50bd94?w=400', category: 'refrigerators', rating: 4.7, reviews: 134, badge: 'Best Seller', description: 'Energy-efficient with Linear Inverter Compressor. Spacious and modern design.', inStock: 8, seller: 'Home Appliances NG', specs: { capacity: '600L', doors: 'French Door', energyClass: 'A++', noFrost: 'Yes' }, warranty: '5 Years' },
  { id: 'fridge2', name: 'Samsung 500L Single Door Refrigerator', price: 380000, image: 'https://images.unsplash.com/photo-1584568694244-14fbbc50bd94?w=400', category: 'refrigerators', rating: 4.6, reviews: 98, description: 'Reliable cooling with digital temperature control. Perfect for Nigerian homes.', inStock: 15, seller: 'Home Appliances NG', specs: { capacity: '500L', doors: 'Single Door', energyClass: 'A+', noFrost: 'Yes' }, warranty: '3 Years' },
  { id: 'fridge3', name: 'Indomie 250L Mini Fridge', price: 95000, image: 'https://images.unsplash.com/photo-1584568694244-14fbbc50bd94?w=400', category: 'refrigerators', rating: 4.5, reviews: 212, description: 'Compact size perfect for offices and small spaces. Quiet operation.', inStock: 42, seller: 'Home Appliances NG', specs: { capacity: '250L', doors: 'Single Door', energyClass: 'A', compressor: 'Rotary' }, warranty: '1 Year' },
  
  // Washing Machines
  { id: 'wash1', name: 'LG 10kg Automatic Washing Machine', price: 650000, originalPrice: 750000, image: 'https://images.unsplash.com/photo-1626741885322-36e6e75ca4d0?w=400', category: 'washing-machines', rating: 4.8, reviews: 167, badge: 'Best Seller', description: 'AI DD technology for perfect fabric care. Inverter Direct Drive for efficiency.', inStock: 10, seller: 'Home Appliances NG', specs: { capacity: '10kg', type: 'Front Load', programs: '14', speed: '1400rpm' }, warranty: '5 Years' },
  { id: 'wash2', name: 'Samsung 8kg Top Load Automatic Washer', price: 420000, image: 'https://images.unsplash.com/photo-1626741885322-36e6e75ca4d0?w=400', category: 'washing-machines', rating: 4.6, reviews: 123, description: 'Powerful cleaning with gentle care for clothes. Water-efficient.', inStock: 18, seller: 'Home Appliances NG', specs: { capacity: '8kg', type: 'Top Load', programs: '12', speed: '1200rpm' }, warranty: '3 Years' },
  { id: 'wash3', name: 'Indomie 6kg Semi-Automatic Washing Machine', price: 125000, image: 'https://images.unsplash.com/photo-1626741885322-36e6e75ca4d0?w=400', category: 'washing-machines', rating: 4.4, reviews: 298, description: 'Affordable and reliable. Perfect for power-conscious households.', inStock: 30, seller: 'Home Appliances NG', specs: { capacity: '6kg', type: 'Semi-Auto', wash: 'Mechanical', dryingMethod: 'Centrifugal' }, warranty: '1 Year' },
  
  // Air Conditioners
  { id: 'ac1', name: 'LG 2HP Split Air Conditioner', price: 380000, originalPrice: 420000, image: 'https://images.unsplash.com/photo-1585790387154-5e1f7be82fcf?w=400', category: 'ac', rating: 4.8, reviews: 189, badge: 'Best Seller', description: 'Energy-efficient cooling with WiFi control. Whisper-quiet operation.', inStock: 14, seller: 'Home Appliances NG', specs: { capacity: '2HP', type: 'Split', energyRating: 'A++', coolingArea: '200-250 sqft' }, warranty: '3 Years' },
  { id: 'ac2', name: 'Samsung 1.5HP Split AC Inverter', price: 280000, image: 'https://images.unsplash.com/photo-1585790387154-5e1f7be82fcf?w=400', category: 'ac', rating: 4.7, reviews: 145, description: 'Advanced inverter technology for superior cooling and power savings.', inStock: 22, seller: 'Home Appliances NG', specs: { capacity: '1.5HP', type: 'Split', energyRating: 'A+', coolingArea: '150-180 sqft' }, warranty: '2 Years' },
  { id: 'ac3', name: 'Indomie 1HP Window AC Unit', price: 95000, image: 'https://images.unsplash.com/photo-1585790387154-5e1f7be82fcf?w=400', category: 'ac', rating: 4.5, reviews: 276, description: 'Compact window unit. Perfect for small bedrooms and offices.', inStock: 50, seller: 'Home Appliances NG', specs: { capacity: '1HP', type: 'Window', energyRating: 'B', coolingArea: '100-120 sqft' }, warranty: '1 Year' },
  
  // Fans
  { id: 'fan1', name: 'Qasa 18" Standing Fan 3-Blade', price: 32000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'fans', rating: 4.6, reviews: 412, badge: 'Best Seller', description: 'Powerful motor with oscillation feature. Energy-efficient and durable.', inStock: 85, seller: 'Home Appliances NG', specs: { size: '18"', blades: '3', speeds: '3', oscillation: 'Yes' }, warranty: '1 Year' },
  { id: 'fan2', name: 'Binatone 16" Rechargeable Fan', price: 45000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'fans', rating: 4.7, reviews: 234, description: 'Portable with long battery life. Perfect for load-shedding periods.', inStock: 40, seller: 'Home Appliances NG', specs: { size: '16"', blades: '3', batteryLife: '8 hours', charging: 'USB' }, warranty: '2 Years' },
  { id: 'fan3', name: 'Dyson AM11 Bladeless Fan', price: 180000, originalPrice: 220000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'fans', rating: 4.9, reviews: 156, badge: 'Premium', description: 'Innovative bladeless design with air purification capability.', inStock: 12, seller: 'Home Appliances NG', specs: { size: 'Compact', blades: 'Bladeless', airflow: 'Unobstructed', purification: 'HEPA Filter' }, warranty: '3 Years' },
  
  // Generators
  { id: 'gen1', name: 'Loncin 3KVA Petrol Generator', price: 185000, image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400', category: 'generators', rating: 4.7, reviews: 123, badge: 'Best Seller', description: 'Reliable backup power for home and office. Fuel-efficient engine.', inStock: 18, seller: 'Home Appliances NG', specs: { capacity: '3KVA', fuelType: 'Petrol', runtime: '8-10 hours', noise: '75dB' }, warranty: '2 Years' },
  { id: 'gen2', name: 'Elepaq 5.5KVA Automatic Generator', price: 450000, originalPrice: 520000, image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400', category: 'generators', rating: 4.8, reviews: 98, badge: 'Premium', description: 'Heavy-duty generator with automatic voltage regulator and eco mode.', inStock: 8, seller: 'Home Appliances NG', specs: { capacity: '5.5KVA', fuelType: 'Petrol', runtime: '12 hours', ecoMode: 'Yes' }, warranty: '3 Years' },
  { id: 'gen3', name: 'Sumec 10KVA Diesel Generator', price: 950000, originalPrice: 1100000, image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400', category: 'generators', rating: 4.9, reviews: 67, description: 'Heavy-duty industrial generator for continuous power backup.', inStock: 4, seller: 'Home Appliances NG', specs: { capacity: '10KVA', fuelType: 'Diesel', runtime: '16 hours', transferSwitch: 'Optional' }, warranty: '3 Years' },
  
  // Freezers
  { id: 'freeze1', name: 'Nasco 500L Chest Freezer', price: 285000, originalPrice: 320000, image: 'https://images.unsplash.com/photo-1584568694244-14fbbc50bd94?w=400', category: 'freezers', rating: 4.7, reviews: 89, badge: 'Best Seller', description: 'Large storage capacity with energy-efficient cooling. Ideal for bulk storage.', inStock: 12, seller: 'Home Appliances NG', specs: { capacity: '500L', type: 'Chest', energyClass: 'A+', temperature: '-18°C to 0°C' }, warranty: '2 Years' },
  { id: 'freeze2', name: 'LG 300L Upright Freezer', price: 420000, originalPrice: 480000, image: 'https://images.unsplash.com/photo-1584568694244-14fbbc50bd94?w=400', category: 'freezers', rating: 4.8, reviews: 76, description: 'Convenient upright design with multiple shelves for easy organization.', inStock: 8, seller: 'Home Appliances NG', specs: { capacity: '300L', type: 'Upright', energyClass: 'A', noFrost: 'Yes' }, warranty: '3 Years' },
  
  // Sound Systems
  { id: 'sound1', name: 'Technics SC-UX100 HiFi System', price: 950000, originalPrice: 1100000, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', category: 'sound-systems', rating: 4.9, reviews: 145, badge: 'Premium', description: 'Professional-grade sound system with wireless connectivity and premium speakers.', inStock: 6, seller: 'SoundWave NG', specs: { power: '100W RMS', frequency: '20Hz-20kHz', connectivity: 'Bluetooth/AUX/USB', speakers: 'Dual 2-Way' }, warranty: '3 Years' },
  { id: 'sound2', name: 'Sony MHC-V13 HiFi System', price: 650000, originalPrice: 750000, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', category: 'sound-systems', rating: 4.8, reviews: 123, description: 'Powerful bass and crystal-clear sound. Great for parties and events.', inStock: 10, seller: 'SoundWave NG', specs: { power: '200W RMS', frequency: '20Hz-20kHz', connectivity: 'Bluetooth/NFC/USB', lighting: 'LED' }, warranty: '2 Years' },
  { id: 'sound3', name: 'Bose SoundLink Color II', price: 185000, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', category: 'sound-systems', rating: 4.7, reviews: 234, badge: 'Best Seller', description: 'Portable waterproof speaker with rich sound and long battery life.', inStock: 28, seller: 'SoundWave NG', specs: { power: '20W', batteryLife: '8 hours', waterproof: 'IPX4', connectivity: 'Bluetooth' }, warranty: '1 Year' },
];

export const getProducts = () => productStore ? productStore.products : initialProducts;
export const products = new Proxy(initialProducts, {
  get(target, prop) {
    if (!productStore) return target[prop as keyof typeof target];
    return productStore.products[prop as any];
  },
  getOwnPropertyDescriptor(target, prop) {
    if (!productStore) return Object.getOwnPropertyDescriptor(target, prop);
    return Object.getOwnPropertyDescriptor(productStore.products, prop);
  },
  ownKeys(target) {
    if (!productStore) return Reflect.ownKeys(target);
    return Reflect.ownKeys(productStore.products);
  }
});

export const getProductById = (id: string) => getProducts().find(p => p.id === id);
export const getProductsByCategory = (cat: string) => getProducts().filter(p => p.category === cat);
export const getFlashDeals = () => getProducts().filter(p => p.originalPrice);
export const getBestSellers = () => getProducts().filter(p => p.badge === 'Best Seller');
export const getTrending = () => getProducts().filter(p => p.badge === 'Trending' || p.reviews > 200);

