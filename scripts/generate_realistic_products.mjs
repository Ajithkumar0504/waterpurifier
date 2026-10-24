import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const purifiers = [
  {
    name: "Califnco Aqua Premier 10L RO+UV+UF Purifier",
    price: 13999, wholesale: 10499,
    img: "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?w=600&auto=format&fit=crop",
    desc: "10-stage advanced purification with active copper and mineral retention technology. Suitable for borewell and municipal water."
  },
  {
    name: "Califnco Copper Alkaline 8L RO Purifier",
    price: 15499, wholesale: 11999,
    img: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=600&auto=format&fit=crop",
    desc: "Infuses 99.8% pure copper and balances pH to alkaline 8.5+. Includes intelligent digital display."
  },
  {
    name: "Califnco Slimline Under-Sink RO Purifier",
    price: 18999, wholesale: 14499,
    img: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop",
    desc: "Compact under-the-counter space-saving design with stainless steel dedicated faucet and 12L hydrostatic tank."
  },
  {
    name: "Califnco Crystal Clean UV+UF Water Purifier",
    price: 8499, wholesale: 6499,
    img: "https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=600&auto=format&fit=crop",
    desc: "High-intensity 11W Philips UV disinfection chamber with ultrafiltration for low TDS municipal tap water."
  },
  {
    name: "Califnco SmartTouch IoT RO Purifier",
    price: 21999, wholesale: 16999,
    img: "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?w=600&auto=format&fit=crop",
    desc: "WiFi connected smart purifier with real-time TDS monitoring, filter life alert, and mobile app sync."
  },
  {
    name: "Califnco Natura Non-Electric Gravity Purifier 18L",
    price: 3499, wholesale: 2599,
    img: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop",
    desc: "Zero-electricity dual-chamber gravity filter with ceramic micro-pore candle and activated carbon block."
  },
  {
    name: "Califnco EcoRO 7-Stage Water Purifier",
    price: 11499, wholesale: 8999,
    img: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=600&auto=format&fit=crop",
    desc: "Water saving technology recovers up to 60% water while removing heavy metals, arsenic, and pesticides."
  },
  {
    name: "Califnco Royal Stainless Steel Body RO Purifier",
    price: 19999, wholesale: 15499,
    img: "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?w=600&auto=format&fit=crop",
    desc: "Durable food-grade 304 stainless steel storage tank and outer body for lifetime durability."
  },
  {
    name: "Califnco Commercial 25 LPH RO Water Purifier",
    price: 26999, wholesale: 20999,
    img: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop",
    desc: "Heavy-duty 25 liters-per-hour purification system for small offices, cafes, clinics, and schools."
  },
  {
    name: "Califnco Commercial 50 LPH Dual Membrane RO System",
    price: 38999, wholesale: 30999,
    img: "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?w=600&auto=format&fit=crop",
    desc: "High capacity commercial purifier with dual 100 GPD membranes and continuous cooling support."
  }
];

const dispensers = [
  {
    name: "Califnco 3-Tap Hot, Cold & Normal Water Dispenser",
    price: 12499, wholesale: 9499,
    img: "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?w=600&auto=format&fit=crop",
    desc: "Floor standing dispenser with 3 temperature settings, rapid compressor cooling, and heating element."
  },
  {
    name: "Califnco Bottom-Loading Premium Water Dispenser",
    price: 15999, wholesale: 12499,
    img: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop",
    desc: "Concealed bottom-load bottle cabinet — no heavy bottle lifting required. Child-safety lock on hot water."
  },
  {
    name: "Califnco Compact Tabletop Water Dispenser",
    price: 6999, wholesale: 5299,
    img: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop",
    desc: "Space saving countertop dispenser ideal for kitchens and office work desks with instant heating & cooling."
  },
  {
    name: "Califnco Direct-Piped RO Water Dispenser",
    price: 22999, wholesale: 17999,
    img: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=600&auto=format&fit=crop",
    desc: "Bottle-free bottleless dispenser connected directly to water line with built-in 4-stage RO filtration."
  },
  {
    name: "Califnco Cold & Ambient Dual Tap Water Cooler",
    price: 10999, wholesale: 8499,
    img: "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?w=600&auto=format&fit=crop",
    desc: "Energy-efficient CFC-free refrigerant compressor with 4 liter/hr high cold water output."
  },
  {
    name: "Califnco Stainless Steel Industrial Water Cooler 40L",
    price: 29999, wholesale: 23999,
    img: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop",
    desc: "All SS-304 heavy-duty water cooler with dual faucets designed for factories and educational campuses."
  },
  {
    name: "Califnco Electric Instant Hot Water Dispenser 5L",
    price: 4999, wholesale: 3799,
    img: "https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=600&auto=format&fit=crop",
    desc: "Boils water in under 5 seconds with adjustable temperature dials (45°C to 100°C) for teas and baby formula."
  },
  {
    name: "Califnco Rechargeable Automatic Water Bottle Pump",
    price: 999, wholesale: 699,
    img: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop",
    desc: "USB-C rechargeable electric dispenser fits standard 20L water cans for instant one-touch dispensing."
  },
  {
    name: "Califnco Smart Touchless Sensor Water Dispenser",
    price: 17499, wholesale: 13499,
    img: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=600&auto=format&fit=crop",
    desc: "Infrared sensor touchless hygienic dispensing — prevents cross-contamination in clinics and public areas."
  },
  {
    name: "Califnco Mini Fridge + Water Dispenser Hybrid",
    price: 18499, wholesale: 14299,
    img: "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?w=600&auto=format&fit=crop",
    desc: "Floor dispenser equipped with an integrated 14L refrigerator compartment for beverages and fruits."
  }
];

const pumps = [
  {
    name: "Califnco 100 GPD Heavy-Duty RO Booster Pump (24V)",
    price: 2499, wholesale: 1799,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop",
    desc: "High pressure 125 PSI diaphragm booster pump with pure copper winding and low-vibration rubber base."
  },
  {
    name: "Califnco 75 GPD Domestic RO Booster Pump",
    price: 1999, wholesale: 1449,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop",
    desc: "Silent operation 24V DC booster pump designed for all standard 5 to 7 stage home RO purifiers."
  },
  {
    name: "Califnco 150 GPD High-Flow RO Booster Pump (36V)",
    price: 3299, wholesale: 2499,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop",
    desc: "High-flow diaphragm pump engineered for 25 LPH commercial purifiers and high TDS water inputs."
  },
  {
    name: "Califnco 300 GPD Commercial Diaphragm RO Pump (48V)",
    price: 5499, wholesale: 4199,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop",
    desc: "High pressure commercial booster pump supporting multiple 100 GPD membranes simultaneously."
  },
  {
    name: "Califnco Self-Priming Low-Pressure RO Pump",
    price: 2799, wholesale: 2099,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop",
    desc: "Self-priming capability draws water directly from underground storage tanks without needing overhead pressure."
  },
  {
    name: "Califnco 24V 2.5A Constant Voltage SMPS Power Supply",
    price: 899, wholesale: 599,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop",
    desc: "Short-circuit & surge protected SMPS adapter customized for 75 & 100 GPD RO booster pumps."
  },
  {
    name: "Califnco 36V 3.0A Heavy-Duty SMPS Adapter",
    price: 1199, wholesale: 849,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop",
    desc: "Robust power adapter with thermal cut-off for 150 GPD commercial booster pumps."
  },
  {
    name: "Califnco 12V DC Inline Miniature Delivery Pump",
    price: 1499, wholesale: 1099,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop",
    desc: "Ultra-quiet inline pump ideal for under-sink water chiller and ice-maker hookups."
  },
  {
    name: "Califnco 0.5 HP Automatic Domestic Water Pressure Pump",
    price: 6499, wholesale: 4899,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop",
    desc: "Boosts tap water pressure throughout the kitchen to ensure optimal RO purifier functioning."
  },
  {
    name: "Califnco RO Pump Replacement Head & Cam Bearing Kit",
    price: 749, wholesale: 499,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop",
    desc: "Universal pump repair kit with high-wear EPDM diaphragm and heavy duty steel bearings."
  }
];

const filters = [
  {
    name: "Califnco 75 GPD Thin-Film Composite RO Membrane",
    price: 1899, wholesale: 1349,
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop",
    desc: "0.0001 micron filtration pore size eliminates 99% of dissolved solids, fluoride, lead, and microplastics."
  },
  {
    name: "Califnco 100 GPD High-TDS RO Membrane Sheet",
    price: 2299, wholesale: 1699,
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop",
    desc: "High rejection membrane engineered specifically for high TDS water up to 2500 ppm."
  },
  {
    name: "Califnco Spun Polypropylene Sediment Filter 5 Micron (Set of 3)",
    price: 599, wholesale: 379,
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop",
    desc: "Traps sand, rust, dirt, and suspended silt particles before water enters main purification stage."
  },
  {
    name: "Califnco 100% Coconut Shell Granular Activated Carbon (GAC)",
    price: 699, wholesale: 449,
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop",
    desc: "High iodine value 1100 mg/g activated carbon adsorbs chlorine, unpleasant smells, and organic chemicals."
  },
  {
    name: "Califnco Extruded Carbon Block (CTO) Filter Cartridge",
    price: 649, wholesale: 429,
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop",
    desc: "Fine micron carbon block eliminates volatile organic compounds (VOCs) and improves natural water taste."
  },
  {
    name: "Califnco Bio+ Alkaline Mineraliser Cartridge",
    price: 999, wholesale: 699,
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop",
    desc: "Adds vital minerals (Calcium, Magnesium, Potassium) and delivers antioxidant negative ORP water."
  },
  {
    name: "Califnco Active Copper-Zinc Infusion Filter",
    price: 1199, wholesale: 849,
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop",
    desc: "Formulated with 99.9% pure copper and zinc granules to boost immunity and promote wellness."
  },
  {
    name: "Califnco Hollow Fiber Ultrafiltration (UF) Membrane 0.01 Micron",
    price: 899, wholesale: 599,
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop",
    desc: "Physically strains bacteria and colloidal cyst matter without altering essential natural minerals."
  },
  {
    name: "Califnco Complete 1-Year Annual Replacement Filter Kit",
    price: 2999, wholesale: 2199,
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop",
    desc: "Includes 1x 75 GPD RO Membrane, 2x Sediment, 1x Carbon, 1x Post-Carbon, and 1x Alkaline cartridge."
  },
  {
    name: "Califnco Heavy-Duty 10-Inch Transparent Pre-Filter Housing Bowl",
    price: 899, wholesale: 599,
    img: "https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=600&auto=format&fit=crop",
    desc: "Reinforced food-grade poly-carbonate transparent bowl with double O-ring leakproof seal and pressure release."
  }
];

const spares = [
  {
    name: "Califnco Food-Grade 1/4\" Push-Fit Solenoid Valve (24V)",
    price: 499, wholesale: 329,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop",
    desc: "Instant magnetic shut-off valve prevents tank overflow and halts wastewater when machine is off."
  },
  {
    name: "Califnco 11W UV Quartz Glass Sleeve & Germicidal Lamp Kit",
    price: 999, wholesale: 699,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop",
    desc: "High transmission fused quartz sleeve with 254nm germicidal ultraviolet lamp and electronic ballast."
  },
  {
    name: "Califnco Auto-Flush Flow Restrictor (FR 450)",
    price: 249, wholesale: 159,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop",
    desc: "Maintains optimal back-pressure on RO membrane for maximum pure water output and extended membrane life."
  },
  {
    name: "Califnco Luxury Gooseneck Stainless Steel RO Faucet",
    price: 1299, wholesale: 899,
    img: "https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=600&auto=format&fit=crop",
    desc: "360-degree swivel brushed nickel deck-mount faucet with durable quarter-turn ceramic disc valve."
  },
  {
    name: "Califnco Low Pressure Switch (LPS) Sensor",
    price: 299, wholesale: 189,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop",
    desc: "Protects booster pump from running dry when overhead water supply is low or interrupted."
  },
  {
    name: "Califnco High Pressure Switch (HPS) Tank Sensor",
    price: 299, wholesale: 189,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop",
    desc: "Automatically cuts off machine power when storage tank reaches full water capacity."
  },
  {
    name: "Califnco Pure Copper Manual TDS Controller Valve",
    price: 349, wholesale: 229,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop",
    desc: "Precision needle regulator allows exact calibration of drinking water minerals and taste."
  },
  {
    name: "Califnco 1/4-Inch Blue LLDPE Food-Grade Tubing (15 Meters Roll)",
    price: 499, wholesale: 329,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop",
    desc: "NSF-58 certified odorless BPA-free piping tested up to 230 PSI bursting pressure."
  },
  {
    name: "Califnco Push-Fit Quick Connectors Assortment (Pack of 12)",
    price: 449, wholesale: 279,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop",
    desc: "Includes 4x Elbow, 4x Tee, 2x Straight Union, and 2x Bulkhead fittings with blue locking clips."
  },
  {
    name: "Califnco Universal Membrane & Pre-Filter Spanner Wrench",
    price: 199, wholesale: 119,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop",
    desc: "Reinforced ABS plastic wrench designed to easily open and service tight filter bowls and membrane housings."
  }
];

const allProducts = [];
let idx = 1;

for (const p of purifiers) {
  allProducts.push({
    name: p.name,
    category: "Purifiers",
    price: p.price,
    wholesalePrice: p.wholesale,
    description: p.desc,
    imageUrl: p.img,
    stock: 20 + (idx % 15),
    active: true
  });
  idx++;
}

for (const p of dispensers) {
  allProducts.push({
    name: p.name,
    category: "Dispensers",
    price: p.price,
    wholesalePrice: p.wholesale,
    description: p.desc,
    imageUrl: p.img,
    stock: 15 + (idx % 12),
    active: true
  });
  idx++;
}

for (const p of pumps) {
  allProducts.push({
    name: p.name,
    category: "Pumps",
    price: p.price,
    wholesalePrice: p.wholesale,
    description: p.desc,
    imageUrl: p.img,
    stock: 25 + (idx % 10),
    active: true
  });
  idx++;
}

for (const p of filters) {
  allProducts.push({
    name: p.name,
    category: "Filters",
    price: p.price,
    wholesalePrice: p.wholesale,
    description: p.desc,
    imageUrl: p.img,
    stock: 35 + (idx % 20),
    active: true
  });
  idx++;
}

for (const p of spares) {
  allProducts.push({
    name: p.name,
    category: "Spares",
    price: p.price,
    wholesalePrice: p.wholesale,
    description: p.desc,
    imageUrl: p.img,
    stock: 40 + (idx % 25),
    active: true
  });
  idx++;
}

console.log(`Generated ${allProducts.length} realistic products across 5 categories.`);

// Save to sample_products.json in root
const rootSamplePath = path.resolve(__dirname, '../sample_products.json');
fs.writeFileSync(rootSamplePath, JSON.stringify(allProducts, null, 2), 'utf8');

// Save to admin-panel/lib/sample_products.json
const adminSamplePath = path.resolve(__dirname, '../admin-panel/lib/sample_products.json');
fs.writeFileSync(adminSamplePath, JSON.stringify(allProducts, null, 2), 'utf8');

console.log('Saved realistic products to root and admin-panel successfully!');
