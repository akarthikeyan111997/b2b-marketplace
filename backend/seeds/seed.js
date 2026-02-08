require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected for seeding');
};

const categories = [
  { name: 'Industrial Machinery', description: 'Heavy machinery and industrial equipment', icon: '⚙️', sortOrder: 1 },
  { name: 'Electronics & Electrical', description: 'Electronic components, devices, and electrical supplies', icon: '💡', sortOrder: 2 },
  { name: 'Chemicals & Solvents', description: 'Industrial chemicals, solvents, and raw materials', icon: '🧪', sortOrder: 3 },
  { name: 'Textiles & Apparel', description: 'Fabrics, garments, and textile raw materials', icon: '👔', sortOrder: 4 },
  { name: 'Building & Construction', description: 'Construction materials, tools, and supplies', icon: '🏗️', sortOrder: 5 },
  { name: 'Food & Beverages', description: 'Bulk food products, ingredients, and beverages', icon: '🍎', sortOrder: 6 },
  { name: 'Packaging & Supplies', description: 'Packaging materials, boxes, and shipping supplies', icon: '📦', sortOrder: 7 },
  { name: 'Auto Parts & Accessories', description: 'Vehicle parts, accessories, and automotive supplies', icon: '🚗', sortOrder: 8 },
  { name: 'Medical & Pharma', description: 'Medical equipment, pharmaceutical supplies', icon: '💊', sortOrder: 9 },
  { name: 'Agriculture & Farming', description: 'Agricultural equipment, seeds, and farming supplies', icon: '🌾', sortOrder: 10 }
];

const users = [
  // Admin
  {
    name: 'Platform Admin',
    email: 'admin@b2bmarket.com',
    password: 'admin123',
    role: 'admin',
    phone: '+91-9000000001',
    isApproved: true,
    isActive: true
  },
  // Sellers
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@steelworks.com',
    password: 'seller123',
    role: 'seller',
    phone: '+91-9000000002',
    isApproved: true,
    isActive: true,
    companyName: 'Kumar Steel Works Pvt Ltd',
    companyDescription: 'Leading manufacturer of industrial steel products with over 20 years of experience. We supply high-quality steel components to major industries across the country.',
    companyAddress: { street: '45 Industrial Area Phase II', city: 'Ludhiana', state: 'Punjab', country: 'India', pincode: '141003' },
    gstNumber: '03AABCK1234F1Z5',
    website: 'www.kumarsteelworks.com',
    establishedYear: 2003,
    employeeCount: '51-200',
    annualTurnover: '₹10-25 Crore'
  },
  {
    name: 'Priya Sharma',
    email: 'priya@techcomp.com',
    password: 'seller123',
    role: 'seller',
    phone: '+91-9000000003',
    isApproved: true,
    isActive: true,
    companyName: 'TechComp Electronics',
    companyDescription: 'Wholesale distributor of electronic components, circuit boards, and IoT devices. Serving businesses since 2010 with reliable supply chains.',
    companyAddress: { street: '12 Electronics City', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560100' },
    gstNumber: '29AABCT5678G1Z3',
    website: 'www.techcompelectronics.in',
    establishedYear: 2010,
    employeeCount: '11-50',
    annualTurnover: '₹5-10 Crore'
  },
  {
    name: 'Amit Patel',
    email: 'amit@chemtrade.com',
    password: 'seller123',
    role: 'seller',
    phone: '+91-9000000004',
    isApproved: true,
    isActive: true,
    companyName: 'ChemTrade Industries',
    companyDescription: 'Manufacturer and supplier of industrial chemicals, solvents, and specialty compounds for various industries including pharma, textiles, and manufacturing.',
    companyAddress: { street: '78 GIDC Estate', city: 'Ahmedabad', state: 'Gujarat', country: 'India', pincode: '382445' },
    gstNumber: '24AABCC9012H1Z1',
    website: 'www.chemtradeindustries.com',
    establishedYear: 2008,
    employeeCount: '51-200',
    annualTurnover: '₹25-50 Crore'
  },
  {
    name: 'Sunita Reddy',
    email: 'sunita@fabricworld.com',
    password: 'seller123',
    role: 'seller',
    phone: '+91-9000000005',
    isApproved: true,
    isActive: true,
    companyName: 'FabricWorld Textiles',
    companyDescription: 'Premium textile manufacturer specializing in cotton, silk, and synthetic fabrics. We cater to garment manufacturers, fashion houses, and export markets.',
    companyAddress: { street: '23 Textile Park', city: 'Surat', state: 'Gujarat', country: 'India', pincode: '395010' },
    gstNumber: '24AABCF3456I1Z9',
    website: 'www.fabricworldtextiles.com',
    establishedYear: 2005,
    employeeCount: '201-500',
    annualTurnover: '₹50-100 Crore'
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@buildpro.com',
    password: 'seller123',
    role: 'seller',
    phone: '+91-9000000006',
    isApproved: false, // Pending approval
    isActive: true,
    companyName: 'BuildPro Materials',
    companyDescription: 'Supplier of construction materials including cement, steel, tiles, and plumbing supplies.',
    companyAddress: { street: '56 Construction Hub', city: 'Jaipur', state: 'Rajasthan', country: 'India', pincode: '302017' },
    establishedYear: 2018,
    employeeCount: '11-50'
  },
  // Buyers
  {
    name: 'Meera Nair',
    email: 'meera@buyer.com',
    password: 'buyer123',
    role: 'buyer',
    phone: '+91-9000000007',
    isApproved: true,
    isActive: true
  },
  {
    name: 'Arjun Mehta',
    email: 'arjun@buyer.com',
    password: 'buyer123',
    role: 'buyer',
    phone: '+91-9000000008',
    isApproved: true,
    isActive: true
  },
  {
    name: 'Deepa Gupta',
    email: 'deepa@buyer.com',
    password: 'buyer123',
    role: 'buyer',
    phone: '+91-9000000009',
    isApproved: true,
    isActive: true
  }
];

const getProducts = (sellerIds, categoryIds) => [
  // Kumar Steel Works products
  {
    name: 'Heavy Duty CNC Lathe Machine',
    description: 'Professional-grade CNC lathe machine suitable for precision metal cutting and shaping. Features automatic tool changer, digital readout, and programmable controls. Ideal for manufacturing workshops and production lines.',
    shortDescription: 'Professional CNC lathe with automatic tool changer and digital controls',
    category: categoryIds[0], // Industrial Machinery
    seller: sellerIds[0],
    images: [],
    priceMin: 450000,
    priceMax: 750000,
    priceUnit: 'per piece',
    moq: 1,
    moqUnit: 'pieces',
    specifications: [
      { key: 'Swing Over Bed', value: '400mm' },
      { key: 'Spindle Speed', value: '50-3000 RPM' },
      { key: 'Motor Power', value: '7.5 kW' },
      { key: 'Weight', value: '2500 kg' }
    ],
    tags: ['cnc', 'lathe', 'machinery', 'metal cutting', 'manufacturing'],
    isActive: true, isApproved: true, isFeatured: true
  },
  {
    name: 'Stainless Steel Pipes SS304 Grade',
    description: 'High-quality stainless steel pipes in SS304 grade. Available in various diameters and wall thicknesses. Suitable for industrial piping, food processing, and chemical plants. Corrosion resistant and durable.',
    shortDescription: 'SS304 grade stainless steel pipes for industrial applications',
    category: categoryIds[0],
    seller: sellerIds[0],
    images: [],
    priceMin: 180,
    priceMax: 450,
    priceUnit: 'per kg',
    moq: 500,
    moqUnit: 'kg',
    specifications: [
      { key: 'Grade', value: 'SS304' },
      { key: 'Diameter Range', value: '15mm - 300mm' },
      { key: 'Wall Thickness', value: '1mm - 10mm' },
      { key: 'Length', value: '6 meters standard' }
    ],
    tags: ['stainless steel', 'pipes', 'ss304', 'industrial piping'],
    isActive: true, isApproved: true, isFeatured: false
  },
  {
    name: 'Industrial Hydraulic Press 100 Ton',
    description: 'Robust hydraulic press machine with 100-ton capacity. Designed for metal forming, stamping, and compression molding operations. Features safety guards, pressure gauge, and adjustable stroke length.',
    shortDescription: '100-ton hydraulic press for metal forming and stamping',
    category: categoryIds[0],
    seller: sellerIds[0],
    images: [],
    priceMin: 280000,
    priceMax: 350000,
    priceUnit: 'per piece',
    moq: 1,
    moqUnit: 'pieces',
    specifications: [
      { key: 'Capacity', value: '100 Ton' },
      { key: 'Stroke', value: '300mm' },
      { key: 'Table Size', value: '600x600mm' },
      { key: 'Motor', value: '15 HP' }
    ],
    tags: ['hydraulic press', 'metal forming', 'stamping', 'industrial'],
    isActive: true, isApproved: true, isFeatured: true
  },
  // TechComp Electronics products
  {
    name: 'Arduino Mega 2560 Development Board',
    description: 'Original Arduino Mega 2560 microcontroller board based on ATmega2560. Features 54 digital I/O pins, 16 analog inputs, 4 UARTs. Perfect for complex IoT projects and prototyping.',
    shortDescription: 'Arduino Mega 2560 with 54 digital I/O pins for IoT projects',
    category: categoryIds[1], // Electronics
    seller: sellerIds[1],
    images: [],
    priceMin: 850,
    priceMax: 1200,
    priceUnit: 'per piece',
    moq: 10,
    moqUnit: 'pieces',
    specifications: [
      { key: 'Microcontroller', value: 'ATmega2560' },
      { key: 'Digital I/O Pins', value: '54' },
      { key: 'Analog Input Pins', value: '16' },
      { key: 'Flash Memory', value: '256 KB' }
    ],
    tags: ['arduino', 'microcontroller', 'iot', 'development board', 'electronics'],
    isActive: true, isApproved: true, isFeatured: true
  },
  {
    name: 'Industrial LED Panel Light 40W',
    description: 'Energy-efficient 40W LED panel light for commercial and industrial spaces. Provides uniform illumination with no flickering. IP44 rated for dust protection. Available in warm white and cool white.',
    shortDescription: 'Energy-efficient 40W LED panel for commercial spaces',
    category: categoryIds[1],
    seller: sellerIds[1],
    images: [],
    priceMin: 650,
    priceMax: 900,
    priceUnit: 'per piece',
    moq: 50,
    moqUnit: 'pieces',
    specifications: [
      { key: 'Wattage', value: '40W' },
      { key: 'Lumens', value: '4000 lm' },
      { key: 'Color Temperature', value: '4000K / 6500K' },
      { key: 'IP Rating', value: 'IP44' }
    ],
    tags: ['led', 'panel light', 'industrial lighting', 'energy efficient'],
    isActive: true, isApproved: true, isFeatured: false
  },
  {
    name: 'Copper Wire 2.5mm Electrical Grade',
    description: 'Premium quality copper wire for electrical wiring applications. 2.5mm cross-section, PVC insulated, flame retardant. Meets IS 694 standards. Available in 90m and 180m coils.',
    shortDescription: 'PVC insulated copper wire 2.5mm for electrical wiring',
    category: categoryIds[1],
    seller: sellerIds[1],
    images: [],
    priceMin: 2800,
    priceMax: 3200,
    priceUnit: 'per piece',
    moq: 20,
    moqUnit: 'pieces',
    specifications: [
      { key: 'Cross Section', value: '2.5 sq mm' },
      { key: 'Insulation', value: 'PVC' },
      { key: 'Standard', value: 'IS 694' },
      { key: 'Coil Length', value: '90m / 180m' }
    ],
    tags: ['copper wire', 'electrical wire', 'wiring', 'pvc insulated'],
    isActive: true, isApproved: true, isFeatured: false
  },
  // ChemTrade Industries products
  {
    name: 'Isopropyl Alcohol 99.5% Pure',
    description: 'High-purity isopropyl alcohol (IPA) at 99.5% concentration. Suitable for pharmaceutical, electronics cleaning, and industrial solvent applications. Available in 25L and 200L drums.',
    shortDescription: 'High-purity IPA 99.5% for pharma and industrial use',
    category: categoryIds[2], // Chemicals
    seller: sellerIds[2],
    images: [],
    priceMin: 120,
    priceMax: 160,
    priceUnit: 'per liter',
    moq: 200,
    moqUnit: 'liters',
    specifications: [
      { key: 'Purity', value: '99.5%' },
      { key: 'CAS Number', value: '67-63-0' },
      { key: 'Packaging', value: '25L / 200L drums' },
      { key: 'Grade', value: 'Pharmaceutical / Electronic' }
    ],
    tags: ['isopropyl alcohol', 'ipa', 'solvent', 'chemical', 'pharmaceutical'],
    isActive: true, isApproved: true, isFeatured: true
  },
  {
    name: 'Sodium Hydroxide Flakes Industrial Grade',
    description: 'Industrial grade sodium hydroxide (caustic soda) flakes with 98% purity. Used in soap manufacturing, water treatment, paper production, and chemical processing. Packed in 50kg HDPE bags.',
    shortDescription: 'Caustic soda flakes 98% purity for industrial applications',
    category: categoryIds[2],
    seller: sellerIds[2],
    images: [],
    priceMin: 45,
    priceMax: 55,
    priceUnit: 'per kg',
    moq: 1000,
    moqUnit: 'kg',
    specifications: [
      { key: 'Purity', value: '98%' },
      { key: 'Form', value: 'Flakes' },
      { key: 'Packaging', value: '50kg HDPE bags' },
      { key: 'CAS Number', value: '1310-73-2' }
    ],
    tags: ['sodium hydroxide', 'caustic soda', 'chemical', 'industrial'],
    isActive: true, isApproved: true, isFeatured: false
  },
  // FabricWorld Textiles products
  {
    name: 'Premium Cotton Fabric 60s Count',
    description: 'High-quality 60s count cotton fabric suitable for premium garment manufacturing. Available in plain, twill, and satin weaves. Multiple color options available. Width: 58 inches.',
    shortDescription: 'Premium 60s count cotton fabric for garment manufacturing',
    category: categoryIds[3], // Textiles
    seller: sellerIds[3],
    images: [],
    priceMin: 180,
    priceMax: 320,
    priceUnit: 'per meter',
    moq: 500,
    moqUnit: 'meters',
    specifications: [
      { key: 'Count', value: '60s' },
      { key: 'Width', value: '58 inches' },
      { key: 'Weave', value: 'Plain / Twill / Satin' },
      { key: 'GSM', value: '120-180' }
    ],
    tags: ['cotton', 'fabric', 'textile', 'garment', 'premium'],
    isActive: true, isApproved: true, isFeatured: true
  },
  {
    name: 'Polyester Blend Suiting Fabric',
    description: 'Professional-grade polyester-viscose blend suiting fabric. Wrinkle-resistant, comfortable, and durable. Ideal for formal wear manufacturing. Available in solid colors and patterns.',
    shortDescription: 'Poly-viscose blend suiting fabric for formal wear',
    category: categoryIds[3],
    seller: sellerIds[3],
    images: [],
    priceMin: 250,
    priceMax: 450,
    priceUnit: 'per meter',
    moq: 300,
    moqUnit: 'meters',
    specifications: [
      { key: 'Composition', value: '65% Polyester, 35% Viscose' },
      { key: 'Width', value: '58 inches' },
      { key: 'GSM', value: '200-250' },
      { key: 'Finish', value: 'Wrinkle-resistant' }
    ],
    tags: ['polyester', 'suiting', 'fabric', 'formal wear', 'textile'],
    isActive: true, isApproved: true, isFeatured: false
  },
  {
    name: 'Raw Silk Fabric Mulberry Grade A',
    description: 'Premium mulberry raw silk fabric, Grade A quality. Lustrous finish with natural sheen. Perfect for luxury garments, sarees, and high-end fashion. Handloom and powerloom options available.',
    shortDescription: 'Grade A mulberry raw silk for luxury garments',
    category: categoryIds[3],
    seller: sellerIds[3],
    images: [],
    priceMin: 800,
    priceMax: 1500,
    priceUnit: 'per meter',
    moq: 100,
    moqUnit: 'meters',
    specifications: [
      { key: 'Type', value: 'Mulberry Silk' },
      { key: 'Grade', value: 'A' },
      { key: 'Width', value: '45 inches' },
      { key: 'Weight', value: '80-120 GSM' }
    ],
    tags: ['silk', 'mulberry', 'luxury', 'fabric', 'handloom'],
    isActive: true, isApproved: true, isFeatured: true
  },
  // Pending product (not approved)
  {
    name: 'Portland Cement OPC 53 Grade',
    description: 'Ordinary Portland Cement 53 Grade conforming to IS 12269. High early strength development. Suitable for RCC structures, pre-stressed concrete, and high-rise buildings.',
    shortDescription: 'OPC 53 Grade cement for construction',
    category: categoryIds[4], // Building & Construction
    seller: sellerIds[4], // Pending seller
    images: [],
    priceMin: 350,
    priceMax: 380,
    priceUnit: 'per piece',
    moq: 100,
    moqUnit: 'pieces',
    specifications: [
      { key: 'Grade', value: 'OPC 53' },
      { key: 'Standard', value: 'IS 12269' },
      { key: 'Bag Weight', value: '50 kg' }
    ],
    tags: ['cement', 'opc', 'construction', 'building material'],
    isActive: true, isApproved: false, isFeatured: false
  }
];

const getInquiries = (buyerIds, sellerIds, productIds) => [
  {
    buyer: buyerIds[0],
    seller: sellerIds[0],
    product: productIds[0],
    subject: 'Inquiry about CNC Lathe Machine',
    message: 'We are looking to purchase 2 CNC lathe machines for our new manufacturing unit. Could you please share the detailed specifications, warranty terms, and installation support details? We need delivery to Chennai.',
    quantity: 2,
    quantityUnit: 'pieces',
    buyerPhone: '+91-9000000007',
    buyerCompany: 'Nair Manufacturing Co.',
    deliveryLocation: 'Chennai, Tamil Nadu',
    status: 'responded',
    sellerResponse: 'Thank you for your interest! We can offer the CNC Lathe Model XL-400 at ₹6,50,000 per unit with 2-year warranty. Installation and training included. Delivery to Chennai within 3 weeks. Shall I send a detailed quotation?',
    respondedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    buyer: buyerIds[1],
    seller: sellerIds[1],
    product: productIds[3],
    subject: 'Bulk order for Arduino boards',
    message: 'We need 500 Arduino Mega 2560 boards for our educational institute. Can you offer a bulk discount? Also, do you provide warranty on these boards?',
    quantity: 500,
    quantityUnit: 'pieces',
    buyerPhone: '+91-9000000008',
    buyerCompany: 'TechEdu Solutions',
    deliveryLocation: 'Mumbai, Maharashtra',
    status: 'read'
  },
  {
    buyer: buyerIds[2],
    seller: sellerIds[2],
    product: productIds[6],
    subject: 'IPA requirement for pharma unit',
    message: 'We require regular supply of IPA 99.5% for our pharmaceutical manufacturing unit. Monthly requirement is approximately 2000 liters. Please share your best price and supply terms.',
    quantity: 2000,
    quantityUnit: 'liters',
    buyerPhone: '+91-9000000009',
    buyerCompany: 'Gupta Pharma Ltd',
    deliveryLocation: 'Hyderabad, Telangana',
    status: 'pending'
  },
  {
    buyer: buyerIds[0],
    seller: sellerIds[3],
    product: productIds[8],
    subject: 'Cotton fabric for garment production',
    message: 'We are interested in your 60s count cotton fabric for our garment production line. Need samples in white and navy blue. Monthly requirement would be around 2000 meters.',
    quantity: 2000,
    quantityUnit: 'meters',
    buyerPhone: '+91-9000000007',
    buyerCompany: 'Nair Fashion House',
    deliveryLocation: 'Kochi, Kerala',
    status: 'pending'
  }
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Inquiry.deleteMany({})
    ]);

    // Create categories (one by one to trigger slug generation via pre-save hook)
    console.log('Creating categories...');
    const createdCategories = [];
    for (const catData of categories) {
      const cat = await Category.create(catData);
      createdCategories.push(cat);
    }
    const categoryIds = createdCategories.map(c => c._id);

    // Create users (one by one to trigger password hashing)
    console.log('Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }

    const sellerIds = createdUsers.filter(u => u.role === 'seller').map(u => u._id);
    const buyerIds = createdUsers.filter(u => u.role === 'buyer').map(u => u._id);

    // Create products
    console.log('Creating products...');
    const productData = getProducts(sellerIds, categoryIds);
    const createdProducts = [];
    for (const prod of productData) {
      const product = await Product.create(prod);
      createdProducts.push(product);
    }
    const productIds = createdProducts.map(p => p._id);

    // Create inquiries
    console.log('Creating inquiries...');
    const inquiryData = getInquiries(buyerIds, sellerIds, productIds);
    for (const inq of inquiryData) {
      await Inquiry.create(inq);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`   📁 Categories: ${createdCategories.length}`);
    console.log(`   👤 Users: ${createdUsers.length} (1 admin, ${sellerIds.length} sellers, ${buyerIds.length} buyers)`);
    console.log(`   📦 Products: ${createdProducts.length}`);
    console.log(`   📩 Inquiries: ${inquiryData.length}`);
    console.log('\n📋 Login Credentials:');
    console.log('   Admin:  admin@b2bmarket.com / admin123');
    console.log('   Seller: rajesh@steelworks.com / seller123');
    console.log('   Seller: priya@techcomp.com / seller123');
    console.log('   Seller: amit@chemtrade.com / seller123');
    console.log('   Seller: sunita@fabricworld.com / seller123');
    console.log('   Buyer:  meera@buyer.com / buyer123');
    console.log('   Buyer:  arjun@buyer.com / buyer123');
    console.log('   Buyer:  deepa@buyer.com / buyer123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
