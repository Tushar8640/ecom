import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@shopnest.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@shopnest.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✓ Admin user: ${admin.email} (password: admin123)`);

  // Create categories
  const categories = await Promise.all(
    ["Electronics", "Clothing", "Accessories", "Home & Kitchen", "Sports"].map(
      (name) =>
        prisma.category.upsert({
          where: { name },
          update: {},
          create: { name },
        })
    )
  );

  const [electronics, clothing, accessories, homeKitchen, sports] = categories;

  // Demo products with Unsplash images
  const products = [
    // Electronics
    {
      name: "Wireless Noise-Cancelling Headphones",
      description:
        "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Perfect for music lovers and professionals.",
      price: 249.99,
      costPrice: 120,
      brand: "SoundMax",
      model: "SM-NC700",
      sku: "ELEC-HEAD-001",
      warranty: "2 years",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
      ],
      categoryId: electronics.id,
      battery: "30 hours",
      connectivity: "Bluetooth 5.2, 3.5mm jack",
      weight: "250g",
      variants: [
        { color: "Black", stock: 50 },
        { color: "White", stock: 35 },
        { color: "Navy", stock: 20 },
      ],
    },
    {
      name: 'Ultra HD 4K Monitor 27"',
      description:
        "Stunning 27-inch 4K UHD monitor with IPS panel, 99% sRGB color accuracy, and USB-C connectivity. Ideal for creative professionals and gamers.",
      price: 449.99,
      costPrice: 250,
      brand: "ViewPro",
      model: "VP-4K27",
      sku: "ELEC-MON-002",
      warranty: "3 years",
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
        "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=800&q=80",
      ],
      categoryId: electronics.id,
      display: '27" 4K UHD (3840x2160) IPS',
      ports: "HDMI 2.1, DisplayPort 1.4, USB-C",
      weight: "4.5kg",
      dimensions: "61.3 x 45.2 x 17.5 cm",
      variants: [
        { color: "Black", stock: 25 },
        { color: "Silver", stock: 15 },
      ],
    },
    {
      name: "Mechanical Gaming Keyboard",
      description:
        "RGB mechanical keyboard with hot-swappable switches, aluminum frame, and programmable macro keys. Built for serious gamers.",
      price: 129.99,
      costPrice: 55,
      brand: "KeyForce",
      model: "KF-PRO65",
      sku: "ELEC-KEY-003",
      warranty: "2 years",
      images: [
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80",
        "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
      ],
      categoryId: electronics.id,
      connectivity: "USB-C, Bluetooth 5.0",
      weight: "850g",
      variants: [
        { color: "Black", stock: 60 },
        { color: "White", stock: 40 },
      ],
    },
    {
      name: "Portable Bluetooth Speaker",
      description:
        "Waterproof portable speaker with 360-degree sound, 20-hour battery, and rugged design. Take your music anywhere.",
      price: 79.99,
      costPrice: 35,
      brand: "SoundMax",
      model: "SM-BT20",
      sku: "ELEC-SPK-004",
      warranty: "1 year",
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
        "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80",
      ],
      categoryId: electronics.id,
      battery: "20 hours",
      connectivity: "Bluetooth 5.3",
      weight: "540g",
      variants: [
        { color: "Black", stock: 80 },
        { color: "Red", stock: 45 },
        { color: "Blue", stock: 30 },
      ],
    },
    {
      name: "Smartwatch Pro",
      description:
        "Advanced smartwatch with AMOLED display, heart rate monitor, GPS, and 7-day battery life. Your ultimate fitness companion.",
      price: 299.99,
      costPrice: 140,
      brand: "TechFit",
      model: "TF-SW5",
      sku: "ELEC-WATCH-005",
      warranty: "1 year",
      images: [
        "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800&q=80",
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80",
      ],
      categoryId: electronics.id,
      display: '1.4" AMOLED',
      battery: "7 days",
      connectivity: "Bluetooth 5.2, Wi-Fi, NFC",
      weight: "45g",
      variants: [
        { size: "40mm", color: "Black", stock: 30 },
        { size: "44mm", color: "Black", stock: 25 },
        { size: "40mm", color: "Silver", stock: 20 },
        { size: "44mm", color: "Silver", stock: 15 },
      ],
    },

    // Clothing
    {
      name: "Classic Fit Cotton T-Shirt",
      description:
        "Premium 100% organic cotton t-shirt with a classic fit. Soft, breathable, and perfect for everyday wear.",
      price: 29.99,
      costPrice: 8,
      brand: "UrbanThreads",
      model: "UT-TEE01",
      sku: "CLO-TEE-001",
      warranty: "",
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
      ],
      categoryId: clothing.id,
      material: "100% Organic Cotton",
      gender: "Unisex",
      fit: "Classic",
      variants: [
        { size: "S", color: "White", stock: 100 },
        { size: "M", color: "White", stock: 120 },
        { size: "L", color: "White", stock: 90 },
        { size: "XL", color: "White", stock: 60 },
        { size: "S", color: "Black", stock: 100 },
        { size: "M", color: "Black", stock: 120 },
        { size: "L", color: "Black", stock: 90 },
        { size: "XL", color: "Black", stock: 60 },
      ],
    },
    {
      name: "Slim Fit Denim Jeans",
      description:
        "Modern slim-fit jeans crafted from premium stretch denim. Comfortable all-day wear with a sharp silhouette.",
      price: 69.99,
      costPrice: 22,
      brand: "UrbanThreads",
      model: "UT-JN05",
      sku: "CLO-JEAN-002",
      warranty: "",
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
        "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&q=80",
      ],
      categoryId: clothing.id,
      material: "98% Cotton, 2% Elastane",
      gender: "Men",
      fit: "Slim",
      variants: [
        { size: "30", color: "Dark Blue", stock: 50 },
        { size: "32", color: "Dark Blue", stock: 70 },
        { size: "34", color: "Dark Blue", stock: 60 },
        { size: "36", color: "Dark Blue", stock: 40 },
        { size: "32", color: "Black", stock: 55 },
        { size: "34", color: "Black", stock: 45 },
      ],
    },
    {
      name: "Zip-Up Hoodie",
      description:
        "Cozy fleece-lined hoodie with a full zip, kangaroo pockets, and a relaxed fit. Essential layering piece for cooler days.",
      price: 59.99,
      costPrice: 18,
      brand: "UrbanThreads",
      model: "UT-HD03",
      sku: "CLO-HOOD-003",
      warranty: "",
      images: [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
      ],
      categoryId: clothing.id,
      material: "80% Cotton, 20% Polyester",
      gender: "Unisex",
      fit: "Relaxed",
      variants: [
        { size: "S", color: "Gray", stock: 70 },
        { size: "M", color: "Gray", stock: 85 },
        { size: "L", color: "Gray", stock: 65 },
        { size: "M", color: "Black", stock: 80 },
        { size: "L", color: "Black", stock: 60 },
      ],
    },

    // Accessories
    {
      name: "Leather Crossbody Bag",
      description:
        "Handcrafted genuine leather crossbody bag with adjustable strap, multiple compartments, and brass hardware. Timeless everyday style.",
      price: 89.99,
      costPrice: 30,
      brand: "CraftHouse",
      model: "CH-CB10",
      sku: "ACC-BAG-001",
      warranty: "1 year",
      images: [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      ],
      categoryId: accessories.id,
      material: "Genuine Leather",
      gender: "Unisex",
      weight: "380g",
      dimensions: "25 x 18 x 7 cm",
      variants: [
        { color: "Brown", stock: 40 },
        { color: "Black", stock: 50 },
        { color: "Tan", stock: 25 },
      ],
    },
    {
      name: "Polarized Aviator Sunglasses",
      description:
        "Classic aviator sunglasses with polarized UV400 lenses and a lightweight metal frame. Effortless cool for any outfit.",
      price: 49.99,
      costPrice: 12,
      brand: "ShadeVault",
      model: "SV-AV01",
      sku: "ACC-SUN-002",
      warranty: "6 months",
      images: [
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
      ],
      categoryId: accessories.id,
      material: "Metal frame, Polarized glass",
      gender: "Unisex",
      weight: "28g",
      variants: [
        { color: "Gold/Green", stock: 60 },
        { color: "Silver/Blue", stock: 45 },
        { color: "Black/Gray", stock: 55 },
      ],
    },

    // Home & Kitchen
    {
      name: "Pour-Over Coffee Maker Set",
      description:
        "Elegant borosilicate glass pour-over coffee maker with reusable stainless steel filter. Brew cafe-quality coffee at home.",
      price: 39.99,
      costPrice: 14,
      brand: "BrewCraft",
      model: "BC-PO01",
      sku: "HOME-COF-001",
      warranty: "1 year",
      images: [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
        "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800&q=80",
      ],
      categoryId: homeKitchen.id,
      material: "Borosilicate glass, Stainless steel",
      weight: "450g",
      dimensions: "15 x 13 x 22 cm",
      variants: [{ color: "Clear", stock: 90 }],
    },
    {
      name: "Scented Soy Candle Collection",
      description:
        "Set of 3 hand-poured soy candles in calming scents — Lavender, Vanilla, and Cedar. 45-hour burn time each.",
      price: 34.99,
      costPrice: 10,
      brand: "GlowNest",
      model: "GN-SC03",
      sku: "HOME-CAN-002",
      warranty: "",
      images: [
        "https://images.unsplash.com/photo-1602607117839-a3b43fbb1c1e?w=800&q=80",
        "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80",
      ],
      categoryId: homeKitchen.id,
      material: "Soy wax, Cotton wick",
      weight: "900g",
      variants: [{ color: "Assorted", stock: 120 }],
    },

    // Sports
    {
      name: "Yoga Mat Premium",
      description:
        "Extra thick 6mm non-slip yoga mat with alignment lines. Eco-friendly TPE material, perfect for yoga, pilates, and stretching.",
      price: 44.99,
      costPrice: 15,
      brand: "FlexFit",
      model: "FF-YM06",
      sku: "SPO-YOGA-001",
      warranty: "1 year",
      images: [
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
      ],
      categoryId: sports.id,
      material: "TPE (Thermoplastic Elastomer)",
      weight: "1.2kg",
      dimensions: "183 x 61 x 0.6 cm",
      variants: [
        { color: "Purple", stock: 70 },
        { color: "Blue", stock: 55 },
        { color: "Black", stock: 80 },
      ],
    },
    {
      name: "Stainless Steel Water Bottle",
      description:
        "Double-wall vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours. Leak-proof and BPA-free.",
      price: 24.99,
      costPrice: 7,
      brand: "HydroMax",
      model: "HM-750",
      sku: "SPO-BTL-002",
      warranty: "Lifetime",
      images: [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
        "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80",
      ],
      categoryId: sports.id,
      material: "18/8 Stainless Steel",
      weight: "350g",
      dimensions: "7.5 x 7.5 x 26 cm",
      variants: [
        { color: "Black", stock: 150 },
        { color: "White", stock: 100 },
        { color: "Green", stock: 60 },
        { color: "Red", stock: 45 },
      ],
    },
  ];

  for (const { variants, ...product } of products) {
    const created = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });

    // Delete existing variants and recreate
    await prisma.variant.deleteMany({ where: { productId: created.id } });
    await prisma.variant.createMany({
      data: variants.map((v) => ({ ...v, productId: created.id })),
    });

    console.log(`✓ ${created.name}`);
  }

  console.log(`\nSeeded ${products.length} products across ${categories.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
