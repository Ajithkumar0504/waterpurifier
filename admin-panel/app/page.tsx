"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import sampleProductsData from "@/lib/sample_products.json";

type CartItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  wholesalePrice: number;
  imageUrl: string;
  qty: number;
};

type OrderRecord = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: { name: string; price: number; qty: number }[];
  total: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
};

type ServiceRecord = {
  id: string;
  customerName: string;
  phone: string;
  serviceType: string;
  brand: string;
  address: string;
  date: string;
  slot: string;
  notes: string;
  status: string;
  createdAt: string;
};

export default function CustomerPortalPage() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"shop" | "service" | "track">("shop");
  const [darkMode, setDarkMode] = useState(false);

  // User Role: Retail Customer vs Verified Dealer
  const [isDealerMode, setIsDealerMode] = useState(false);

  // Catalog State
  const [products, setProducts] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  // Checkout Form State
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod" | "credit">("razorpay");
  const [isLocating, setIsLocating] = useState(false);

  // Razorpay Test Modal
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayStep, setRazorpayStep] = useState<"details" | "processing" | "success">("details");

  // Order Confirmed Modal
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  // Service Booking State
  const [serviceType, setServiceType] = useState("RO Membrane & Filter Replacement");
  const [serviceBrand, setServiceBrand] = useState("Califnco");
  const [serviceCustName, setServiceCustName] = useState("");
  const [serviceCustPhone, setServiceCustPhone] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceSlot, setServiceSlot] = useState("Morning (9:00 AM - 12:00 PM)");
  const [serviceNotes, setServiceNotes] = useState("");
  const [confirmedService, setConfirmedService] = useState<ServiceRecord | null>(null);

  // Tracking State
  const [trackingId, setTrackingId] = useState("");
  const [trackedRecord, setTrackedRecord] = useState<{ type: "order" | "service"; data: any } | null>(null);
  const [trackError, setTrackError] = useState("");

  // Image Zoom / Lightbox
  const [zoomImage, setZoomImage] = useState<{ url: string; name: string; price: number; desc: string } | null>(null);

  // Local storage / Firestore Synced orders & services
  const [myOrders, setMyOrders] = useState<OrderRecord[]>([]);
  const [myServices, setMyServices] = useState<ServiceRecord[]>([]);

  // Dark Mode Sync
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  // Load 50 Products
  useEffect(() => {
    const loaded = (sampleProductsData as any[]).map((p, idx) => ({
      id: `prod_${idx + 1}`,
      name: p.name,
      category: p.category,
      price: p.price,
      wholesalePrice: p.wholesalePrice,
      description: p.description,
      imageUrl: p.imageUrl,
      stock: p.stock,
      active: p.active,
    }));
    setProducts(loaded);

    // Initial mock orders & services
    setMyOrders([
      {
        id: "ORD-9421",
        customerName: "Senthil Kumar",
        customerPhone: "9876543210",
        customerAddress: "Flat 4B, Anna Nagar West, Chennai - 600040",
        items: [{ name: "Califnco Aqua Premier 10L RO+UV+UF Purifier", price: 13999, qty: 1 }],
        total: 13999,
        paymentStatus: "Paid (Razorpay)",
        status: "processing",
        createdAt: "24 Oct 2026, 10:45 AM",
      },
      {
        id: "ORD-7190",
        customerName: "Venkatesh Rao",
        customerPhone: "9840223344",
        customerAddress: "7th Cross, Gandhinagar, Bangalore - 560009",
        items: [{ name: "Califnco Complete 1-Year Replacement Filter Kit", price: 2999, qty: 2 }],
        total: 5998,
        paymentStatus: "Cash on Delivery",
        status: "shipped",
        createdAt: "24 Oct 2026, 09:20 AM",
      },
    ]);

    setMyServices([
      {
        id: "SRV-101",
        customerName: "Ramesh Babu",
        phone: "9840123456",
        serviceType: "Annual Filter Replacement",
        brand: "Califnco Aqua Premier",
        address: "T. Nagar, Chennai",
        date: "25 Oct 2026",
        slot: "Morning (9:00 AM - 12:00 PM)",
        notes: "Water taste is slightly salty. Check TDS.",
        status: "Assigned to Technician",
        createdAt: "24 Oct 2026",
      },
    ]);
  }, []);

  // Firebase Real-time Sync for Customer
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    try {
      const unsubOrders = onSnapshot(query(collection(db, "orders")), (snapshot) => {
        if (!snapshot.empty) {
          const remoteOrders = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setMyOrders(remoteOrders);
        }
      }, () => {});

      const unsubServices = onSnapshot(query(collection(db, "serviceRequests")), (snapshot) => {
        if (!snapshot.empty) {
          const remoteServices = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setMyServices(remoteServices);
        }
      }, () => {});

      return () => {
        unsubOrders();
        unsubServices();
      };
    } catch {}
  }, []);

  // Cart operations
  function handleAddToCart(product: any, qty: number = 1) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          wholesalePrice: product.wholesalePrice,
          imageUrl: product.imageUrl,
          qty,
        },
      ];
    });
    setIsCartOpen(true);
  }

  function handleUpdateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }

  function handleRemoveItem(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  // Promo code validation (Califnco referral promo code)
  function handleApplyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (code === "CALIFNCO10" || code === "WATER10" || code === "PURE10") {
      setDiscountPercent(10);
      setPromoMessage("🎉 Promo code applied! 10% instant discount saved.");
    } else if (code === "DEALER15" && isDealerMode) {
      setDiscountPercent(15);
      setPromoMessage("🏢 Dealer Volume discount applied: 15% extra off!");
    } else {
      setDiscountPercent(0);
      setPromoMessage("❌ Invalid code. Try referral promo: CALIFNCO10");
    }
  }

  // Geolocation auto-detection
  function handleAutoDetectLocation() {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lng = pos.coords.longitude.toFixed(4);
          setCustAddress(`Geo-located [${lat}, ${lng}] - Near Anna Salai, Chennai, Tamil Nadu 600002`);
          setServiceAddress(`Geo-located [${lat}, ${lng}] - Near Anna Salai, Chennai, Tamil Nadu 600002`);
          setIsLocating(false);
        },
        () => {
          // Fallback if blocked
          setCustAddress("Flat 3A, Green Meadows, Velachery Main Road, Chennai, Tamil Nadu - 600042");
          setServiceAddress("Flat 3A, Green Meadows, Velachery Main Road, Chennai, Tamil Nadu - 600042");
          setIsLocating(false);
        },
        { timeout: 6000 }
      );
    } else {
      setCustAddress("Flat 3A, Green Meadows, Velachery Main Road, Chennai, Tamil Nadu - 600042");
      setServiceAddress("Flat 3A, Green Meadows, Velachery Main Road, Chennai, Tamil Nadu - 600042");
      setIsLocating(false);
    }
  }

  // Cart financial calculations
  const cartSubtotal = cart.reduce((acc, item) => {
    const unitPrice = isDealerMode ? item.wholesalePrice : item.price;
    return acc + unitPrice * item.qty;
  }, 0);

  const discountAmount = Math.round((cartSubtotal * discountPercent) / 100);
  const deliveryFee = cartSubtotal > 999 || cartSubtotal === 0 ? 0 : 99;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + deliveryFee);

  // Initiate checkout
  function handleInitiateCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!custName || !custPhone || !custAddress) {
      alert("Please fill in your name, phone number, and delivery address.");
      return;
    }

    if (paymentMethod === "razorpay") {
      setShowRazorpayModal(true);
      setRazorpayStep("details");
    } else {
      // Place COD or Dealer Credit order directly
      completeOrderPlacement(
        paymentMethod === "cod" ? "Cash on Delivery" : "Wholesale Credit (Net 30 Days)"
      );
    }
  }

  // Complete Order Placement (writes to Firestore + state)
  async function completeOrderPlacement(payStatus: string) {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OrderRecord = {
      id: orderId,
      customerName: custName,
      customerPhone: custPhone,
      customerAddress: custAddress,
      items: cart.map((i) => ({
        name: i.name,
        price: isDealerMode ? i.wholesalePrice : i.price,
        qty: i.qty,
      })),
      total: cartTotal,
      paymentStatus: payStatus,
      status: "pending",
      createdAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMyOrders((prev) => [newOrder, ...prev]);
    setConfirmedOrder(newOrder);
    setCart([]);
    setIsCartOpen(false);
    setShowRazorpayModal(false);

    // Save to Firestore if available
    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db, "orders"), {
          ...newOrder,
          serverTimestamp: serverTimestamp(),
        });
      } catch (err) {
        console.warn("Firestore order sync notice:", err);
      }
    }
  }

  // Service Booking Submit
  async function handleBookService(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceCustName || !serviceCustPhone || !serviceAddress) {
      alert("Please provide your Name, Phone Number, and Complete Address.");
      return;
    }

    const ticketId = `SRV-${Math.floor(100 + Math.random() * 900)}`;
    const newService: ServiceRecord = {
      id: ticketId,
      customerName: serviceCustName,
      phone: serviceCustPhone,
      serviceType,
      brand: serviceBrand,
      address: serviceAddress,
      date: serviceDate || "Earliest Available (Tomorrow)",
      slot: serviceSlot,
      notes: serviceNotes || "Standard maintenance and inspection required",
      status: "Technician Pending Assignment",
      createdAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    setMyServices((prev) => [newService, ...prev]);
    setConfirmedService(newService);

    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db, "serviceRequests"), {
          ...newService,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn("Firestore service sync notice:", err);
      }
    }
  }

  // Tracking Search
  function handleTrackLookup(e: React.FormEvent) {
    e.preventDefault();
    const queryId = trackingId.trim().toUpperCase();
    if (!queryId) return;

    // Check in orders
    const matchedOrder = myOrders.find((o) => o.id.toUpperCase() === queryId);
    if (matchedOrder) {
      setTrackedRecord({ type: "order", data: matchedOrder });
      setTrackError("");
      return;
    }

    // Check in service requests
    const matchedService = myServices.find((s) => s.id.toUpperCase() === queryId);
    if (matchedService) {
      setTrackedRecord({ type: "service", data: matchedService });
      setTrackError("");
      return;
    }

    setTrackedRecord(null);
    setTrackError(`No active record found for "${queryId}". Please verify your Order ID (ORD-XXXX) or Service Ticket ID (SRV-XXX).`);
  }

  // Filtered and sorted products
  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = isDealerMode ? a.wholesalePrice : a.price;
    const priceB = isDealerMode ? b.wholesalePrice : b.price;
    if (sortBy === "price-asc") return priceA - priceB;
    if (sortBy === "price-desc") return priceB - priceA;
    return 0;
  });

  const totalCartCount = cart.reduce((acc, i) => acc + i.qty, 0);

  return (
    <div className="shell animate-fade-in" style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {/* TOP HEADER */}
      <header className="header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 32 }}>💧</span>
            <div>
              <span className="brand" style={{ fontSize: 24, fontWeight: 900 }}>Califnco</span>
              <span style={{ marginLeft: 8, fontSize: 13, background: "#e0f2fe", color: "#0369a1", padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>
                Water Solutions
              </span>
            </div>
          </div>
          <p className="small" style={{ margin: "4px 0 0" }}>
            Pure, Safe & Mineral-Rich Drinking Water • Nationwide Service & Genuine Spares
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Dealer Wholesale Mode Toggle */}
          <button
            onClick={() => setIsDealerMode(!isDealerMode)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: isDealerMode ? "2px solid #16a34a" : "1px solid var(--border)",
              background: isDealerMode ? "#dcfce7" : "var(--panel-bg)",
              color: isDealerMode ? "#166534" : "var(--text)",
              fontSize: 13,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
            title="Toggle between Consumer retail prices and Certified Dealer wholesale prices"
          >
            {isDealerMode ? "🏢 Dealer Mode Active (Wholesale)" : "👤 Customer Mode"}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn"
            style={{
              background: totalCartCount > 0 ? "#087e8b" : "var(--panel-bg)",
              color: totalCartCount > 0 ? "white" : "var(--text)",
              border: totalCartCount > 0 ? "none" : "1px solid var(--border)",
              position: "relative",
              padding: "8px 16px",
            }}
          >
            🛒 Cart ({totalCartCount})
            {cartSubtotal > 0 && (
              <span style={{ marginLeft: 4, fontWeight: 800 }}>
                • ₹{cartSubtotal.toLocaleString("en-IN")}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--panel-bg)",
              color: "var(--text)",
              fontSize: 13,
            }}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* Direct Link to Admin Console */}
          <Link
            href="/admin"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              background: "#1e293b",
              color: "white",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
            title="Open Admin Management Console to manage orders, dealers & service desk"
          >
            👑 Admin Portal ↗
          </Link>
        </div>
      </header>

      {/* DEALER BANNER IF ACTIVE */}
      {isDealerMode && (
        <div
          style={{
            background: "linear-gradient(90deg, #15803d, #16a34a)",
            color: "white",
            padding: "12px 20px",
            borderRadius: 12,
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>
              🏢 Approved Califnco Dealer Tier: Gold Partner
            </div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>
              You are viewing wholesale distributor prices (save up to 35%). Eligible for 30-day net credit settlement.
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
            Credit Limit: ₹50,000 | Available: ₹42,500
          </div>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div
        style={{
          display: "flex",
          gap: 10,
          borderBottom: "2px solid var(--border)",
          paddingBottom: 12,
          marginBottom: 24,
        }}
      >
        <button
          onClick={() => setActiveTab("shop")}
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            border: 0,
            background: activeTab === "shop" ? "var(--primary)" : "transparent",
            color: activeTab === "shop" ? "white" : "var(--text-muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          🛒 Shop Products & Spares (50)
        </button>

        <button
          onClick={() => setActiveTab("service")}
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            border: 0,
            background: activeTab === "service" ? "var(--primary)" : "transparent",
            color: activeTab === "service" ? "white" : "var(--text-muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          🔧 Book Water Purifier Service
        </button>

        <button
          onClick={() => setActiveTab("track")}
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            border: 0,
            background: activeTab === "track" ? "var(--primary)" : "transparent",
            color: activeTab === "track" ? "white" : "var(--text-muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          📦 Track Order & Service
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SHOP PRODUCTS (50 Realistic Purifiers, Dispensers, Pumps, Filters, Spares) */}
      {/* ========================================================= */}
      {activeTab === "shop" && (
        <section>
          {/* PROMO / REFERRAL BANNER */}
          <div
            className="panel"
            style={{
              background: "linear-gradient(135deg, #0284c7 0%, #087e8b 100%)",
              color: "white",
              padding: "24px 30px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 20,
              boxShadow: "0 10px 25px rgba(8,126,139,0.25)",
            }}
          >
            <div style={{ maxWidth: 650 }}>
              <span style={{ background: "rgba(255,255,255,0.25)", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>
                Exclusive Festive Offer
              </span>
              <h2 style={{ fontSize: 26, margin: "10px 0 6px", fontWeight: 800 }}>
                100% Genuine Water Purifiers & Certified Spares
              </h2>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.95, lineHeight: 1.5 }}>
                Free doorstep installation on all RO Purifiers. Apply referral code{" "}
                <strong style={{ background: "rgba(0,0,0,0.2)", padding: "2px 8px", borderRadius: 4, letterSpacing: 1 }}>
                  CALIFNCO10
                </strong>{" "}
                at checkout for an instant 10% discount!
              </p>
            </div>
            <button
              onClick={() => {
                setCategoryFilter("Purifiers");
                window.scrollTo({ top: 380, behavior: "smooth" });
              }}
              style={{
                background: "white",
                color: "#087e8b",
                border: 0,
                padding: "12px 24px",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              Explore Purifiers →
            </button>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div
            className="panel"
            style={{
              padding: 16,
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Category Pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["All", "Purifiers", "Dispensers", "Pumps", "Filters", "Spares"].map((cat) => {
                const count =
                  cat === "All"
                    ? products.length
                    : products.filter((p) => p.category === cat).length;
                const isSelected = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 700,
                      border: isSelected ? "none" : "1px solid var(--border)",
                      background: isSelected ? "var(--primary)" : "transparent",
                      color: isSelected ? "white" : "var(--text)",
                    }}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Box & Sort */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="🔍 Search 50 products by name, specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: 260,
                  margin: 0,
                  padding: "8px 14px",
                  fontSize: 13,
                }}
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  width: 170,
                  margin: 0,
                  padding: "8px 12px",
                  fontSize: 13,
                }}
              >
                <option value="featured">Featured Order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* PRODUCTS GRID (50 Real Items) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
              gap: 20,
            }}
          >
            {sortedProducts.map((p) => {
              const currentPrice = isDealerMode ? p.wholesalePrice : p.price;
              const retailPrice = p.price;
              const savings = retailPrice - currentPrice;

              return (
                <div
                  key={p.id}
                  className="panel"
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  {/* Image with Zoom Button */}
                  <div style={{ position: "relative", width: "100%", height: 210, background: "#f8fafc" }}>
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setZoomImage({
                          url: p.imageUrl,
                          name: p.name,
                          price: currentPrice,
                          desc: p.description,
                        })
                      }
                      title="Click to view image in high-resolution lightbox"
                    />
                    {/* Category Tag */}
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        background: "rgba(15, 23, 42, 0.8)",
                        color: "white",
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {p.category}
                    </span>

                    {/* Zoom Icon Button */}
                    <button
                      onClick={() =>
                        setZoomImage({
                          url: p.imageUrl,
                          name: p.name,
                          price: currentPrice,
                          desc: p.description,
                        })
                      }
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "white",
                        color: "#0f172a",
                        border: 0,
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        fontSize: 14,
                      }}
                      title="Zoom product image"
                    >
                      🔍
                    </button>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ color: "#eab308", fontSize: 13 }}>★★★★★</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>4.9 (Verified)</span>
                      </div>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          margin: "0 0 8px",
                          lineHeight: 1.35,
                          minHeight: 42,
                        }}
                      >
                        {p.name}
                      </h3>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--text-muted)",
                          margin: "0 0 14px",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {p.description}
                      </p>
                    </div>

                    <div>
                      {/* Price Section */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>
                            ₹{currentPrice.toLocaleString("en-IN")}
                          </span>
                          {isDealerMode ? (
                            <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 700 }}>
                              (Wholesale • Save ₹{savings.toLocaleString("en-IN")})
                            </span>
                          ) : (
                            <span style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "line-through" }}>
                              ₹{(currentPrice * 1.25).toFixed(0)}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
                          🟢 In Stock ({p.stock} units ready to ship)
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(p, 1)}
                        className="btn"
                        style={{
                          width: "100%",
                          padding: "10px",
                          fontSize: 14,
                        }}
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedProducts.length === 0 && (
            <div className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
              <span style={{ fontSize: 48 }}>🔍</span>
              <h3 style={{ margin: "16px 0 8px" }}>No products found</h3>
              <p className="small">Try adjusting your search keywords or clear your category filters.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All");
                }}
                className="btn"
                style={{ marginTop: 14 }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 2: WATER PURIFIER SERVICE BOOKING */}
      {/* ========================================================= */}
      {activeTab === "service" && (
        <section style={{ maxWidth: 860, margin: "0 auto" }}>
          <div
            className="panel"
            style={{
              background: "linear-gradient(135deg, #0f766e 0%, #087e8b 100%)",
              color: "white",
              padding: "26px 30px",
              borderRadius: 16,
              marginBottom: 24,
            }}
          >
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
              Doorstep Maintenance & Repair
            </span>
            <h2 style={{ fontSize: 26, margin: "10px 0 6px", fontWeight: 800 }}>
              Certified Water Purifier Service Desk
            </h2>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.95, lineHeight: 1.5 }}>
              Expert Califnco certified engineers for Installation, Membrane & Sediment filter change, TDS balancing, and leak repair for all purifier brands.
            </p>
          </div>

          {/* Quick Service Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { title: "New Installation", icon: "🛠️", desc: "Free wall-mount & inlet fitting" },
              { title: "RO Filter Replacement", icon: "🔄", desc: "Sediment + Carbon + Membrane" },
              { title: "Purifier Repair & Leakage", icon: "⚠️", desc: "Pump, solenoid valve, motor fix" },
              { title: "Annual AMC Coverage", icon: "🛡️", desc: "Full year filter + repair warranty" },
            ].map((svc) => (
              <div
                key={svc.title}
                onClick={() => setServiceType(svc.title)}
                style={{
                  background: serviceType === svc.title ? "#e0f2fe" : "var(--panel-bg)",
                  border: serviceType === svc.title ? "2px solid #0284c7" : "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 16,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{svc.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: serviceType === svc.title ? "#0284c7" : "var(--text)" }}>
                  {svc.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  {svc.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Service Booking Form */}
          <div className="panel" style={{ padding: 28 }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 18, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              Book Appointment for: <span style={{ color: "var(--primary)" }}>{serviceType}</span>
            </h3>

            <form onSubmit={handleBookService}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label>
                    Purifier Brand
                    <select
                      value={serviceBrand}
                      onChange={(e) => setServiceBrand(e.target.value)}
                    >
                      <option value="Califnco">Califnco Aqua</option>
                      <option value="Kent">Kent RO</option>
                      <option value="Aquaguard">Aquaguard (Eureka Forbes)</option>
                      <option value="Pureit">HUL Pureit</option>
                      <option value="Livpure">Livpure</option>
                      <option value="Other">Other Brand</option>
                    </select>
                  </label>
                </div>

                <div>
                  <label>
                    Preferred Date
                    <input
                      type="date"
                      value={serviceDate}
                      onChange={(e) => setServiceDate(e.target.value)}
                      required
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label>
                    Your Full Name
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Babu"
                      value={serviceCustName}
                      onChange={(e) => setServiceCustName(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <div>
                  <label>
                    Mobile Phone Number
                    <input
                      type="tel"
                      placeholder="e.g. 9840123456"
                      value={serviceCustPhone}
                      onChange={(e) => setServiceCustPhone(e.target.value)}
                      required
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <label style={{ margin: 0 }}>Service Address</label>
                    <button
                      type="button"
                      onClick={handleAutoDetectLocation}
                      style={{
                        background: "none",
                        border: 0,
                        color: "var(--primary)",
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "underline",
                      }}
                    >
                      {isLocating ? "Detecting location..." : "📍 Auto-Detect My Current Location"}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Door number, street name, landmark, city and pincode"
                    value={serviceAddress}
                    onChange={(e) => setServiceAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label>
                    Preferred Time Window
                    <select
                      value={serviceSlot}
                      onChange={(e) => setServiceSlot(e.target.value)}
                    >
                      <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                      <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                      <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                    </select>
                  </label>
                </div>

                <div>
                  <label>
                    Issue Description / Notes (Optional)
                    <input
                      type="text"
                      placeholder="e.g. Water taste change, TDS level high, leakage"
                      value={serviceNotes}
                      onChange={(e) => setServiceNotes(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="btn"
                  style={{ padding: "12px 28px", fontSize: 15 }}
                >
                  ✅ Confirm Doorstep Service Booking
                </button>
              </div>
            </form>
          </div>

          {/* CONFIRMED SERVICE MODAL */}
          {confirmedService && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: 16,
              }}
            >
              <div
                className="panel"
                style={{
                  maxWidth: 520,
                  width: "100%",
                  textAlign: "center",
                  padding: 30,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                }}
              >
                <div style={{ fontSize: 50, marginBottom: 12 }}>🎉</div>
                <h2 style={{ fontSize: 24, margin: "0 0 6px", color: "var(--primary)" }}>
                  Service Booked Successfully!
                </h2>
                <p className="small" style={{ marginBottom: 20 }}>
                  A certified Califnco technician will visit your location on the requested time window.
                </p>

                <div
                  style={{
                    background: "var(--bg)",
                    border: "1px dashed var(--border)",
                    borderRadius: 12,
                    padding: 16,
                    textAlign: "left",
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Service Ticket ID:</span>
                    <strong style={{ fontSize: 15, color: "var(--primary)" }}>{confirmedService.id}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Service Type:</span>
                    <strong>{confirmedService.serviceType}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Schedule:</span>
                    <strong>{confirmedService.date} ({confirmedService.slot})</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Technician Status:</span>
                    <span style={{ color: "#16a34a", fontWeight: 700 }}>{confirmedService.status}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => {
                      setConfirmedService(null);
                      setActiveTab("track");
                      setTrackingId(confirmedService.id);
                    }}
                    className="btn"
                    style={{ flex: 1 }}
                  >
                    📦 Track This Service
                  </button>
                  <button
                    onClick={() => setConfirmedService(null)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--text)",
                      fontWeight: 600,
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 3: TRACK ORDER & SERVICE REQUEST */}
      {/* ========================================================= */}
      {activeTab === "track" && (
        <section style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="panel" style={{ padding: 26, textAlign: "center" }}>
            <span style={{ fontSize: 40 }}>📦</span>
            <h2 style={{ margin: "10px 0 6px", fontSize: 24 }}>Real-Time Califnco Tracker</h2>
            <p className="small" style={{ marginBottom: 20 }}>
              Enter your Califnco Order ID (e.g. <code>ORD-9421</code>) or Service Ticket ID (e.g. <code>SRV-101</code>) to track live status.
            </p>

            <form
              onSubmit={handleTrackLookup}
              style={{ display: "flex", gap: 10, maxWidth: 520, margin: "0 auto 16px" }}
            >
              <input
                type="text"
                placeholder="Enter ORD-XXXX or SRV-XXX"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                style={{ margin: 0 }}
                required
              />
              <button type="submit" className="btn" style={{ padding: "10px 22px" }}>
                Search
              </button>
            </form>

            {trackError && <div className="error" style={{ fontSize: 13 }}>{trackError}</div>}
          </div>

          {/* TRACK RESULT */}
          {trackedRecord && (
            <div className="panel animate-fade-in" style={{ padding: 24, borderTop: "4px solid var(--primary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 12, textTransform: "uppercase", fontWeight: 800, color: "var(--primary)" }}>
                    {trackedRecord.type === "order" ? "Customer Product Order" : "Service Ticket"}
                  </span>
                  <h3 style={{ margin: "4px 0 0", fontSize: 20 }}>
                    ID: {trackedRecord.data.id}
                  </h3>
                </div>
                <div
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    background: "#dcfce7",
                    color: "#166534",
                    fontWeight: 800,
                    fontSize: 13,
                    textTransform: "capitalize",
                  }}
                >
                  Status: {trackedRecord.data.status}
                </div>
              </div>

              {/* Progress Steps */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "24px 0",
                  position: "relative",
                  padding: "0 10px",
                }}
              >
                {trackedRecord.type === "order" ? (
                  <>
                    {[
                      { step: "Order Placed", active: true },
                      { step: "Processing", active: ["processing", "shipped", "delivered"].includes(trackedRecord.data.status) },
                      { step: "Shipped", active: ["shipped", "delivered"].includes(trackedRecord.data.status) },
                      { step: "Delivered", active: trackedRecord.data.status === "delivered" },
                    ].map((s, idx) => (
                      <div key={s.step} style={{ textAlign: "center", zIndex: 2 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: s.active ? "var(--primary)" : "var(--border)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 6px",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: s.active ? 700 : 500 }}>
                          {s.step}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { step: "Request Logged", active: true },
                      { step: "Technician Assigned", active: trackedRecord.data.status.includes("Assigned") || trackedRecord.data.status.includes("Completed") },
                      { step: "In Progress", active: trackedRecord.data.status.includes("Progress") || trackedRecord.data.status.includes("Completed") },
                      { step: "Completed", active: trackedRecord.data.status.includes("Completed") },
                    ].map((s, idx) => (
                      <div key={s.step} style={{ textAlign: "center", zIndex: 2 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: s.active ? "var(--primary)" : "var(--border)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 6px",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: s.active ? 700 : 500 }}>
                          {s.step}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Record Summary */}
              <div style={{ background: "var(--bg)", borderRadius: 10, padding: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Recipient: </span>
                    <strong>{trackedRecord.data.customerName}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Phone: </span>
                    <strong>{trackedRecord.data.phone || trackedRecord.data.customerPhone}</strong>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ color: "var(--text-muted)" }}>Address: </span>
                    <span>{trackedRecord.data.address || trackedRecord.data.customerAddress}</span>
                  </div>
                  {trackedRecord.type === "order" && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <span style={{ color: "var(--text-muted)" }}>Total Paid / Mode: </span>
                      <strong>₹{trackedRecord.data.total?.toLocaleString("en-IN")} ({trackedRecord.data.paymentStatus})</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick List of Recent Orders & Services */}
          <div style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Your Recent History</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {myOrders.slice(0, 3).map((o) => (
                <div
                  key={o.id}
                  onClick={() => {
                    setTrackingId(o.id);
                    setTrackedRecord({ type: "order", data: o });
                  }}
                  style={{
                    background: "var(--panel-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <strong>{o.id}</strong> • {o.items?.[0]?.name}
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.createdAt}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong>₹{o.total?.toLocaleString("en-IN")}</strong>
                    <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700 }}>
                      {o.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* SLIDE-OUT CART & CHECKOUT DRAWER */}
      {/* ========================================================= */}
      {isCartOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setIsCartOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              height: "100%",
              background: "var(--panel-bg)",
              boxShadow: "-8px 0 30px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>
                🛒 Shopping Cart ({totalCartCount} items)
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{ background: "none", border: 0, fontSize: 20, cursor: "pointer", color: "var(--text)" }}
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", flex: 1 }}>
                <span style={{ fontSize: 48 }}>🛍️</span>
                <h4 style={{ margin: "14px 0 6px" }}>Your cart is empty</h4>
                <p className="small">Browse through our 50 genuine water purifiers, filters & spare parts!</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn"
                  style={{ marginTop: 14 }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 0" }}>
                {cart.map((item) => {
                  const unitPrice = isDealerMode ? item.wholesalePrice : item.price;
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: "12px 0",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>
                          ₹{unitPrice.toLocaleString("en-IN")}
                        </div>

                        {/* Qty Controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                          <button
                            onClick={() => handleUpdateQty(item.id, -1)}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 4,
                              border: "1px solid var(--border)",
                              background: "var(--bg)",
                              fontSize: 14,
                            }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{item.qty}</span>
                          <button
                            onClick={() => handleUpdateQty(item.id, 1)}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 4,
                              border: "1px solid var(--border)",
                              background: "var(--bg)",
                              fontSize: 14,
                            }}
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            style={{
                              marginLeft: "auto",
                              background: "none",
                              border: 0,
                              color: "#ef4444",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Promo Code Input */}
                <div style={{ marginTop: 20 }}>
                  <label>Apply Promo / Referral Code</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="e.g. CALIFNCO10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      style={{ margin: 0 }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        background: "var(--primary)",
                        color: "white",
                        border: 0,
                        fontWeight: 700,
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <div style={{ fontSize: 12, marginTop: 6, fontWeight: 600 }}>{promoMessage}</div>
                  )}
                </div>

                {/* Checkout Delivery Details Form */}
                <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: 15 }}>Shipping & Delivery Details</h4>

                  <form onSubmit={handleInitiateCheckout}>
                    <label>
                      Full Name
                      <input
                        type="text"
                        placeholder="e.g. Senthil Kumar"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        required
                      />
                    </label>

                    <label>
                      Mobile Phone Number
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        required
                      />
                    </label>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <label style={{ margin: 0 }}>Delivery Address</label>
                        <button
                          type="button"
                          onClick={handleAutoDetectLocation}
                          style={{
                            background: "none",
                            border: 0,
                            color: "var(--primary)",
                            fontSize: 11,
                            fontWeight: 700,
                            textDecoration: "underline",
                          }}
                        >
                          {isLocating ? "Detecting..." : "📍 Auto-Detect Location"}
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Complete street address, apartment, city, and pincode"
                        value={custAddress}
                        onChange={(e) => setCustAddress(e.target.value)}
                        required
                      />
                    </div>

                    <label style={{ marginTop: 8 }}>
                      Payment Method
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
                          <input
                            type="radio"
                            name="paymode"
                            value="razorpay"
                            checked={paymentMethod === "razorpay"}
                            onChange={() => setPaymentMethod("razorpay")}
                            style={{ width: "auto", margin: 0 }}
                          />
                          💳 Razorpay Online Gateway (UPI, Cards, NetBanking)
                        </label>

                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
                          <input
                            type="radio"
                            name="paymode"
                            value="cod"
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                            style={{ width: "auto", margin: 0 }}
                          />
                          💵 Cash on Delivery (COD)
                        </label>

                        {isDealerMode && (
                          <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#16a34a" }}>
                            <input
                              type="radio"
                              name="paymode"
                              value="credit"
                              checked={paymentMethod === "credit"}
                              onChange={() => setPaymentMethod("credit")}
                              style={{ width: "auto", margin: 0 }}
                            />
                            🏢 Dealer Net 30-Day Wholesale Credit Line
                          </label>
                        )}
                      </div>
                    </label>

                    {/* Financial Summary */}
                    <div style={{ background: "var(--bg)", padding: 14, borderRadius: 10, marginTop: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                        <span>Subtotal:</span>
                        <strong>₹{cartSubtotal.toLocaleString("en-IN")}</strong>
                      </div>
                      {discountAmount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "#16a34a" }}>
                          <span>Promo Discount ({discountPercent}%):</span>
                          <strong>- ₹{discountAmount.toLocaleString("en-IN")}</strong>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                        <span>Doorstep Shipping:</span>
                        <strong style={{ color: deliveryFee === 0 ? "#16a34a" : "inherit" }}>
                          {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                        </strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 8, fontSize: 16, fontWeight: 800 }}>
                        <span>Total Payable:</span>
                        <span style={{ color: "var(--primary)" }}>₹{cartTotal.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn"
                      style={{
                        width: "100%",
                        padding: "14px",
                        fontSize: 16,
                        marginTop: 16,
                      }}
                    >
                      {paymentMethod === "razorpay"
                        ? `💳 Pay ₹${cartTotal.toLocaleString("en-IN")} with Razorpay`
                        : paymentMethod === "cod"
                        ? `💵 Place Cash on Delivery Order (₹${cartTotal.toLocaleString("en-IN")})`
                        : `🏢 Confirm Order on Dealer Credit (₹${cartTotal.toLocaleString("en-IN")})`}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SIMULATED RAZORPAY PAYMENT MODAL (TEST MODE) */}
      {/* ========================================================= */}
      {showRazorpayModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
            }}
          >
            {/* Razorpay Brand Header */}
            <div style={{ background: "#0c2340", color: "white", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Razorpay Secured Checkout
                </div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Califnco Water Solutions</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Amount to Pay</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#38bdf8" }}>
                  ₹{cartTotal.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div style={{ padding: 22 }}>
              {razorpayStep === "details" && (
                <div>
                  <div style={{ background: "#f1f5f9", padding: "10px 14px", borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
                    🟡 <strong>Test Mode:</strong> No real money will be charged. Any simulated test card / UPI will succeed.
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>PAYMENT OPTIONS</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                      <div
                        style={{
                          border: "2px solid #0284c7",
                          borderRadius: 8,
                          padding: "10px 12px",
                          background: "#f0f9ff",
                          textAlign: "center",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        📱 UPI / QR Code
                      </div>
                      <div
                        style={{
                          border: "1px solid #cbd5e1",
                          borderRadius: 8,
                          padding: "10px 12px",
                          textAlign: "center",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        💳 Card / NetBanking
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 10, padding: 14, textAlign: "center", marginBottom: 18 }}>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Simulated UPI ID:</div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>{custPhone}@upi</div>
                  </div>

                  <button
                    onClick={() => {
                      setRazorpayStep("processing");
                      setTimeout(() => {
                        setRazorpayStep("success");
                        setTimeout(() => {
                          completeOrderPlacement(`Paid (Razorpay: pay_test_${Math.random().toString(36).substring(2, 9)})`);
                        }, 1200);
                      }, 1500);
                    }}
                    style={{
                      width: "100%",
                      padding: "13px",
                      background: "#0284c7",
                      color: "white",
                      border: 0,
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: "pointer",
                    }}
                  >
                    Simulate Successful Payment (₹{cartTotal.toLocaleString("en-IN")})
                  </button>

                  <button
                    onClick={() => setShowRazorpayModal(false)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "transparent",
                      color: "#64748b",
                      border: 0,
                      fontSize: 13,
                      marginTop: 6,
                      cursor: "pointer",
                    }}
                  >
                    Cancel Transaction
                  </button>
                </div>
              )}

              {razorpayStep === "processing" && (
                <div style={{ textAlign: "center", padding: "30px 10px" }}>
                  <div style={{ fontSize: 40, animation: "spin 1s infinite linear" }}>🔄</div>
                  <h3 style={{ margin: "16px 0 6px" }}>Authorizing Payment...</h3>
                  <p style={{ fontSize: 13, color: "#64748b" }}>Connecting with Razorpay secure test gateway</p>
                </div>
              )}

              {razorpayStep === "success" && (
                <div style={{ textAlign: "center", padding: "30px 10px" }}>
                  <div style={{ fontSize: 50, color: "#16a34a" }}>✅</div>
                  <h3 style={{ margin: "14px 0 6px", color: "#16a34a" }}>Payment Authorized!</h3>
                  <p style={{ fontSize: 13, color: "#64748b" }}>Generating your Califnco order invoice...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ORDER CONFIRMED SUCCESS MODAL */}
      {/* ========================================================= */}
      {confirmedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            className="panel"
            style={{
              maxWidth: 520,
              width: "100%",
              textAlign: "center",
              padding: 30,
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ fontSize: 50, marginBottom: 10 }}>🎉</div>
            <h2 style={{ fontSize: 24, margin: "0 0 6px", color: "var(--primary)" }}>
              Order Confirmed!
            </h2>
            <p className="small" style={{ marginBottom: 20 }}>
              Thank you, {confirmedOrder.customerName}. Your Califnco water solution order is being processed.
            </p>

            <div
              style={{
                background: "var(--bg)",
                border: "1px dashed var(--border)",
                borderRadius: 12,
                padding: 16,
                textAlign: "left",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Order Reference ID:</span>
                <strong style={{ fontSize: 15, color: "var(--primary)" }}>{confirmedOrder.id}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Total Paid:</span>
                <strong style={{ fontSize: 15 }}>₹{confirmedOrder.total.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Payment Method:</span>
                <span>{confirmedOrder.paymentStatus}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Delivery Address:</span>
                <span style={{ maxWidth: 260, textAlign: "right", fontSize: 12 }}>
                  {confirmedOrder.customerAddress}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  setActiveTab("track");
                  setTrackingId(confirmedOrder.id);
                  setTrackedRecord({ type: "order", data: confirmedOrder });
                }}
                className="btn"
                style={{ flex: 1 }}
              >
                📦 Track Order Status
              </button>
              <button
                onClick={() => setConfirmedOrder(null)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text)",
                  fontWeight: 600,
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* IMAGE ZOOM / LIGHTBOX MODAL */}
      {/* ========================================================= */}
      {zoomImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setZoomImage(null)}
        >
          <div
            style={{
              maxWidth: 720,
              width: "100%",
              background: "var(--panel-bg)",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: "relative", width: "100%", height: 380, background: "#000" }}>
              <img
                src={zoomImage.url}
                alt={zoomImage.name}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
              <button
                onClick={() => setZoomImage(null)}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  border: 0,
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 22 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 20 }}>{zoomImage.name}</h3>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--text-muted)" }}>
                {zoomImage.desc}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>
                  ₹{zoomImage.price.toLocaleString("en-IN")}
                </span>
                <button
                  onClick={() => {
                    const prod = products.find((p) => p.name === zoomImage.name);
                    if (prod) handleAddToCart(prod, 1);
                    setZoomImage(null);
                  }}
                  className="btn"
                  style={{ padding: "10px 20px" }}
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer
        style={{
          marginTop: 60,
          borderTop: "1px solid var(--border)",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          fontSize: 13,
          color: "var(--text-muted)",
        }}
      >
        <div>
          © 2026 Califnco Water Purifier Solutions Pvt Ltd. Built for Califnco Round 1 Assignment.
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/admin" style={{ color: "var(--primary)", fontWeight: 700 }}>
            👑 Califnco Admin Console
          </Link>
          <span>•</span>
          <span>Customer Helpline: 1800-420-WATER</span>
        </div>
      </footer>
    </div>
  );
}
