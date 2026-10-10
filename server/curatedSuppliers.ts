export interface CuratedSupplierSeed {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  productCategories: string[];
  verified: boolean;
  verificationStatusNote: string;
  website: string;
  minOrderQuantity: string;
  priceNotes: string;
  paymentTerms: string;
  rating: number;
}

export const CURATED_SUPPLIERS: CuratedSupplierSeed[] = [
  {
    name: "AgroFresh Wholesale Grains & Flours",
    contactPerson: "Rajesh Kumar",
    phone: "+91 98201 44520",
    email: "orders@agrofreshwholesale.in",
    address: "APMC Market Yard Phase 2, Navi Mumbai, MH 400703",
    productCategories: ["Flour (Maida, Atta)", "Sugar", "Yeast", "Dry Grains", "Baking Ingredients"],
    verified: true,
    verificationStatusNote: "Verified Trade Merchant (FSSAI Lic. 11521019000342 & GSTIN Active)",
    website: "https://agrofreshwholesale.in",
    minOrderQuantity: "50 kg bag / ₹5,000 min order",
    priceNotes: "Commercial bulk tier: ₹38/kg Maida, ₹42/kg Sugar, Grade-A Yeast ₹280/kg",
    paymentTerms: "Net 15 upon 3 prior orders; Advance for initial dispatch",
    rating: 4.8,
  },
  {
    name: "Apex Dairy & Fats Distributing Corp",
    contactPerson: "Sunita Deshmukh",
    phone: "+91 98450 33219",
    email: "supply@apexdairyfats.in",
    address: "Plot 42, Peenya Industrial Area 3rd Phase, Bengaluru, KA 560058",
    productCategories: ["Butter", "Fresh Cream", "Cheese Blocks", "Milk Powder", "Dairy"],
    verified: true,
    verificationStatusNote: "Verified Cold-Chain Supplier (FSSAI Lic. 11219333000881)",
    website: "https://apexdairyfats.in",
    minOrderQuantity: "20 kg cold batch / ₹4,000",
    priceNotes: "Unsalted Butter ₹420/kg, Whipping Cream 35% ₹260/L, Mozzarella Block ₹390/kg",
    paymentTerms: "COD or Same-day UPI transfer on delivery",
    rating: 4.7,
  },
  {
    name: "ChefPro Commercial Kitchen Equipment",
    contactPerson: "Arjun Singhania",
    phone: "+91 98112 77801",
    email: "sales@chefproequip.com",
    address: "Okhla Industrial Area Phase-1, New Delhi, DL 110020",
    productCategories: ["Deck Ovens", "Spiral Mixers", "Display Chillers", "Stainless Steel Tables", "Commercial Cooktops"],
    verified: true,
    verificationStatusNote: "Verified OEM Distributor & On-site Warranty Provider (ISO 9001:2015)",
    website: "https://chefproequip.com",
    minOrderQuantity: "1 Unit",
    priceNotes: "Single Deck Gas Oven ₹48,000; 20L Spiral Mixer ₹34,500; Prep Counter ₹22,000",
    paymentTerms: "50% Advance with PO, 50% prior to dispatch; 1-yr Warranty Included",
    rating: 4.9,
  },
  {
    name: "EcoPack Sustainable Packaging Solutions",
    contactPerson: "Neha Sharma",
    phone: "+91 99304 88210",
    email: "hello@ecopacksolutions.in",
    address: "Bhiwandi Logistics Hub, Thane, MH 421302",
    productCategories: ["Cake & Pastry Boxes", "Kraft Bags", "Custom Printed Tape", "Greaseproof Paper", "Takeaway Containers"],
    verified: true,
    verificationStatusNote: "Verified Manufacturer (CPCB Biodegradable Certified & ISO 14001)",
    website: "https://ecopacksolutions.in",
    minOrderQuantity: "500 pcs per SKU",
    priceNotes: "Window Pastry Boxes ₹9.50/pc, Kraft 3-ply bags ₹4.20/pc, Printed tape roll ₹85/roll",
    paymentTerms: "100% Advance for custom print; Net 30 for standard boxes",
    rating: 4.6,
  },
  {
    name: "ThreadCraft Textiles & Garment Mills",
    contactPerson: "Vipin Patel",
    phone: "+91 98791 22340",
    email: "wholesale@threadcraftmills.com",
    address: "Ring Road Textile Market, Surat, GJ 395002",
    productCategories: ["Cotton Fabrics", "Denim Rolls", "Rayon Prints", "Garment Accessories", "Yarn"],
    verified: true,
    verificationStatusNote: "Verified Textile Export House (GSTIN Verified & OEKO-TEX Standard 100)",
    website: "https://threadcraftmills.com",
    minOrderQuantity: "100 meters / ₹10,000 order",
    priceNotes: "100% Combed Cotton ₹145/meter, Raw Denim 12oz ₹210/meter, Rayon Print ₹110/meter",
    paymentTerms: "Bank NEFT / RTGS with 30% advance on custom dye lots",
    rating: 4.7,
  },
  {
    name: "UrbanStitch Apparel Finishing & Tagging",
    contactPerson: "Ritu Kapoor",
    phone: "+91 98190 66432",
    email: "orders@urbanstitchfinishing.in",
    address: "Sector 37 Industrial Estate, Gurugram, HR 122001",
    productCategories: ["Custom Woven Labels", "Barcode Hangtags", "Eco Polybags", "Zippers & Buttons", "Branding Kits"],
    verified: true,
    verificationStatusNote: "Verified Apparel Ancillary Manufacturer",
    website: "https://urbanstitchfinishing.in",
    minOrderQuantity: "1,000 units per artwork",
    priceNotes: "High-density Woven Labels ₹2.80/pc; Cardstock Hangtags ₹3.10/pc with string",
    paymentTerms: "50% Advance with sample approval, balance on delivery",
    rating: 4.5,
  },
  {
    name: "Metro FMCG Direct Distributors",
    contactPerson: "Dinesh Agarwal",
    phone: "+91 98310 99405",
    email: "b2b@metrofmcgdist.com",
    address: "Strand Road Warehouse Complex, Kolkata, WB 700001",
    productCategories: ["Packaged Foods", "Beverages", "Snacks", "Household Cleaning", "Personal Care"],
    verified: true,
    verificationStatusNote: "Verified Super-Stockist (FSSAI Central Lic. 10018031002598)",
    website: "https://metrofmcgdist.com",
    minOrderQuantity: "₹15,000 combined order",
    priceNotes: "Wholesale Margin: 12% to 22% off MRP depending on brand category",
    paymentTerms: "Weekly billing cycle with post-dated cheques or instant UPI",
    rating: 4.6,
  },
  {
    name: "VoltMaster Industrial & Retail Displays",
    contactPerson: "Kunal Mehra",
    phone: "+91 98401 55670",
    email: "support@voltmasterdisplays.com",
    address: "Ambattur Industrial Estate, Chennai, TN 600058",
    productCategories: ["POS Cash Drawers", "Barcode Scanners", "Thermal Receipt Printers", "Retail Racks & Shelving"],
    verified: true,
    verificationStatusNote: "Verified Hardware Distributor (BIS Certified & 1-Year Swap Replacement)",
    website: "https://voltmasterdisplays.com",
    minOrderQuantity: "1 Piece",
    priceNotes: "80mm USB+LAN Thermal Printer ₹3,850; 2D QR Scanner ₹1,950; Heavy Cash Drawer ₹2,400",
    paymentTerms: "Online prepaid or Razorpay link with GST invoice",
    rating: 4.8,
  }
];
