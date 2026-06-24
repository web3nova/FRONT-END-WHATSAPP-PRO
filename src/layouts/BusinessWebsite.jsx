import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const COLORS = {
  offWhite: "#F8F4E8",
  blue: "#4166F5",
  blueDark: "#2d4fd4",
  blueLight: "#eef1fe",
  text: "#1a1a2e",
  muted: "#6b6b8a",
  border: "#ddd9c8",
  white: "#ffffff",
  success: "#22c55e",
  card: "#fffdf5",
};

const steps = ["Business Profile", "Products", "Preview"];

// Reusable UI

const Label = ({ children, required }) => (
  <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, letterSpacing: "0.04em", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
    {children}{required && <span style={{ color: COLORS.blue, marginLeft: 3 }}>*</span>}
  </label>
);

const Input = ({ style, ...props }) => (
  <input
    {...props}
    style={{
      width: "100%", padding: "10px 14px", fontSize: 15, borderRadius: 10,
      border: `1.5px solid ${COLORS.border}`, background: COLORS.white,
      color: COLORS.text, outline: "none", boxSizing: "border-box",
      fontFamily: "inherit", transition: "border 0.2s",
      ...style,
    }}
    onFocus={e => (e.target.style.border = `1.5px solid ${COLORS.blue}`)}
    onBlur={e => (e.target.style.border = `1.5px solid ${COLORS.border}`)}
  />
);

const Textarea = ({ style, ...props }) => (
  <textarea
    {...props}
    style={{
      width: "100%", padding: "10px 14px", fontSize: 15, borderRadius: 10,
      border: `1.5px solid ${COLORS.border}`, background: COLORS.white,
      color: COLORS.text, outline: "none", resize: "vertical", boxSizing: "border-box",
      fontFamily: "inherit", minHeight: 90, transition: "border 0.2s",
      ...style,
    }}
    onFocus={e => (e.target.style.border = `1.5px solid ${COLORS.blue}`)}
    onBlur={e => (e.target.style.border = `1.5px solid ${COLORS.border}`)}
  />
);

const Select = ({ children, style, ...props }) => (
  <select
    {...props}
    style={{
      width: "100%", padding: "10px 14px", fontSize: 15, borderRadius: 10,
      border: `1.5px solid ${COLORS.border}`, background: COLORS.white,
      color: COLORS.text, outline: "none", boxSizing: "border-box",
      fontFamily: "inherit", cursor: "pointer",
      ...style,
    }}
  >
    {children}
  </select>
);

const SectionCard = ({ title, children }) => (
  <div style={{ background: COLORS.card, borderRadius: 16, border: `1.5px solid ${COLORS.border}`, marginBottom: 24, overflow: "hidden" }}>
    <div style={{ padding: "14px 20px", borderBottom: `1.5px solid ${COLORS.border}`, background: COLORS.white }}>
      <span style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{title}</span>
    </div>
    <div style={{ padding: "20px" }}>{children}</div>
  </div>
);

const Field = ({ children, style }) => (
  <div style={{ marginBottom: 18, ...style }}>{children}</div>
);

const Row = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>
);

const Chip = ({ label, onRemove }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: COLORS.blueLight, color: COLORS.blue, borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 600 }}>
    {label}
    <button onClick={onRemove} style={{ background: "none", border: "none", color: COLORS.blue, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}>x</button>
  </span>
);

const ImgBox = ({ src, onRemove }) => (
  <div style={{ position: "relative", width: 90, height: 90, borderRadius: 10, overflow: "hidden", border: `1.5px solid ${COLORS.border}` }}>
    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <button onClick={onRemove} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: 22, height: 22, color: "#fff", cursor: "pointer", fontSize: 14, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
  </div>
);

const Star = ({ filled, onClick }) => (
  <span onClick={onClick} style={{ fontSize: 22, cursor: "pointer", color: filled ? "#f59e0b" : COLORS.border }}>★</span>
);

const StarRating = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(n => <Star key={n} filled={n <= value} onClick={() => onChange(n)} />)}
  </div>
);

const Btn = ({ children, onClick, variant = "primary", style, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "11px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.18s",
      background: variant === "primary" ? COLORS.blue : variant === "ghost" ? "transparent" : COLORS.border,
      color: variant === "primary" ? "#fff" : variant === "ghost" ? COLORS.blue : COLORS.text,
      border: variant === "ghost" ? `1.5px solid ${COLORS.blue}` : "none",
      opacity: disabled ? 0.5 : 1,
      ...style,
    }}
  >
    {children}
  </button>
);

const OptionCheckbox = ({ label, checked, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${checked ? COLORS.blue : COLORS.border}`, background: checked ? COLORS.blueLight : COLORS.white, cursor: "pointer", marginBottom: 8 }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: COLORS.blue, width: 16, height: 16 }} />
    <span style={{ fontSize: 14, fontWeight: 600, color: checked ? COLORS.blue : COLORS.text }}>{label}</span>
  </label>
);

// Step 1: Business Profile

const paymentOptions = [
  { key: "bank", label: "Bank Transfer" },
  { key: "card", label: "Credit / Debit Card" },
  { key: "paystack", label: "Paystack" },
  { key: "flutterwave", label: "Flutterwave" },
  { key: "cash", label: "Cash on Delivery" },
  { key: "crypto", label: "Crypto" },
];

function BusinessProfile({ data, setData }) {
  const logoRef = useRef();
  const [handleInput, setHandleInput] = useState("");
  const [reviewInput, setReviewInput] = useState({ name: "", text: "", rating: 5 });

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setData(d => ({ ...d, logoUrl: url, logoName: file.name }));
  };

  const addHandle = () => {
    if (handleInput.trim()) {
      setData(d => ({ ...d, socialHandles: [...(d.socialHandles || []), handleInput.trim()] }));
      setHandleInput("");
    }
  };

  const addReview = () => {
    if (reviewInput.name.trim() && reviewInput.text.trim()) {
      setData(d => ({ ...d, reviews: [...(d.reviews || []), { ...reviewInput, id: Date.now() }] }));
      setReviewInput({ name: "", text: "", rating: 5 });
    }
  };

  const togglePayment = (key) => {
    setData(d => {
      const current = d.payments || [];
      return { ...d, payments: current.includes(key) ? current.filter(k => k !== key) : [...current, key] };
    });
  };

  return (
    <div>
      <SectionCard title="Brand Identity">
        <Row>
          <Field>
            <Label required>Brand name</Label>
            <Input placeholder="e.g. Nova Styles" value={data.brandName || ""} onChange={e => setData(d => ({ ...d, brandName: e.target.value }))} />
          </Field>
          <Field>
            <Label>Brand logo</Label>
            <div
              onClick={() => logoRef.current.click()}
              style={{ border: `2px dashed ${COLORS.border}`, borderRadius: 10, padding: "14px", textAlign: "center", cursor: "pointer", background: COLORS.white, transition: "border 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.border = `2px dashed ${COLORS.blue}`}
              onMouseLeave={e => e.currentTarget.style.border = `2px dashed ${COLORS.border}`}
            >
              {data.logoUrl
                ? <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                    <img src={data.logoUrl} alt="logo" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                    <span style={{ fontSize: 13, color: COLORS.muted }}>{data.logoName}</span>
                  </div>
                : <span style={{ fontSize: 13, color: COLORS.muted }}>Click to upload logo</span>
              }
            </div>
            <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
          </Field>
        </Row>

        <Field>
          <Label>Social media handles</Label>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <Input placeholder="@yourbrand or full URL" value={handleInput} onChange={e => setHandleInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addHandle()} style={{ flex: 1 }} />
            <Btn onClick={addHandle} style={{ padding: "10px 18px", whiteSpace: "nowrap" }}>+ Add</Btn>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(data.socialHandles || []).map((h, i) => (
              <Chip key={i} label={h} onRemove={() => setData(d => ({ ...d, socialHandles: d.socialHandles.filter((_, j) => j !== i) }))} />
            ))}
          </div>
        </Field>
      </SectionCard>

      <SectionCard title="About Page">
        <Field>
          <Label required>Brand motto</Label>
          <Input placeholder="Your short, punchy tagline" value={data.motto || ""} onChange={e => setData(d => ({ ...d, motto: e.target.value }))} />
        </Field>
        <Field>
          <Label required>About your business <span style={{ fontWeight: 400, textTransform: "none", fontSize: 12 }}>(100 words max)</span></Label>
          <Textarea
            placeholder="Tell customers who you are, what you do, and why they should choose you..."
            value={data.about || ""}
            onChange={e => {
              const words = e.target.value.trim().split(/\s+/).filter(Boolean);
              if (words.length <= 100) setData(d => ({ ...d, about: e.target.value }));
            }}
          />
          <div style={{ fontSize: 12, color: COLORS.muted, textAlign: "right", marginTop: 4 }}>
            {(data.about || "").trim().split(/\s+/).filter(Boolean).length} / 100 words
          </div>
        </Field>
      </SectionCard>

      <SectionCard title="Customer Reviews">
        <div style={{ background: COLORS.blueLight, borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <Row>
            <Field style={{ marginBottom: 12 }}>
              <Label>Customer name</Label>
              <Input placeholder="Jane Doe" value={reviewInput.name} onChange={e => setReviewInput(r => ({ ...r, name: e.target.value }))} />
            </Field>
            <Field style={{ marginBottom: 12 }}>
              <Label>Rating</Label>
              <StarRating value={reviewInput.rating} onChange={v => setReviewInput(r => ({ ...r, rating: v }))} />
            </Field>
          </Row>
          <Field style={{ marginBottom: 12 }}>
            <Label>Review text</Label>
            <Textarea placeholder="What did they say?" value={reviewInput.text} onChange={e => setReviewInput(r => ({ ...r, text: e.target.value }))} style={{ minHeight: 60 }} />
          </Field>
          <Btn onClick={addReview}>+ Add Review</Btn>
        </div>
        {(data.reviews || []).map((rev, i) => (
          <div key={rev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 14px", background: COLORS.white, borderRadius: 10, border: `1.5px solid ${COLORS.border}`, marginBottom: 8 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{rev.name}</span>
                <span style={{ color: "#f59e0b", fontSize: 13 }}>{"★".repeat(rev.rating)}</span>
              </div>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>{rev.text}</p>
            </div>
            <button onClick={() => setData(d => ({ ...d, reviews: d.reviews.filter((_, j) => j !== i) }))}
              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}>x</button>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Payment Methods">
        <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 0, marginBottom: 14 }}>Select how customers can pay you</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {paymentOptions.map(opt => (
            <OptionCheckbox key={opt.key} label={opt.label}
              checked={(data.payments || []).includes(opt.key)}
              onChange={() => togglePayment(opt.key)} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// Step 2: Products

const categories = ["Fashion & Clothing", "Food & Beverages", "Electronics", "Beauty & Skincare", "Home & Decor", "Services", "Digital Products", "Other"];
const deliveryOptions = [
  { key: "pickup", label: "Store Pickup" },
  { key: "local", label: "Local Delivery" },
  { key: "nationwide", label: "Nationwide Shipping" },
  { key: "digital", label: "Digital / Instant" },
];

function ProductsUpload({ data, setData }) {
  const imgRef = useRef();
  const [form, setForm] = useState({ name: "", price: "", category: categories[0], description: "", images: [] });
  const [editIndex, setEditIndex] = useState(null);
  const [checkoutFields, setCheckoutFields] = useState(data.checkoutFields || { name: true, phone: true, address: true, email: false });

  const handleProductImages = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(f => ({ url: URL.createObjectURL(f), name: f.name }));
    setForm(f => ({ ...f, images: [...f.images, ...urls] }));
  };

  const saveProduct = () => {
    if (!form.name.trim() || !form.price) return;
    const product = { ...form, id: editIndex !== null ? data.products[editIndex].id : Date.now() };
    setData(d => {
      const list = [...(d.products || [])];
      if (editIndex !== null) list[editIndex] = product;
      else list.push(product);
      return { ...d, products: list };
    });
    setForm({ name: "", price: "", category: categories[0], description: "", images: [] });
    setEditIndex(null);
  };

  const editProduct = (i) => {
    setForm({ ...data.products[i] });
    setEditIndex(i);
  };

  const deleteProduct = (i) => {
    setData(d => ({ ...d, products: d.products.filter((_, j) => j !== i) }));
    if (editIndex === i) {
      setForm({ name: "", price: "", category: categories[0], description: "", images: [] });
      setEditIndex(null);
    }
  };

  const toggleDelivery = (key) => {
    setData(d => {
      const current = d.delivery || [];
      return { ...d, delivery: current.includes(key) ? current.filter(k => k !== key) : [...current, key] };
    });
  };

  const toggleCheckout = (key) => {
    const updated = { ...checkoutFields, [key]: !checkoutFields[key] };
    setCheckoutFields(updated);
    setData(d => ({ ...d, checkoutFields: updated }));
  };

  return (
    <div>
      <SectionCard title={editIndex !== null ? "Edit Product" : "Add Product"}>
        <Field>
          <Label required>Product name</Label>
          <Input placeholder="e.g. Ankara Tote Bag" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </Field>
        <Row>
          <Field>
            <Label required>Price (N)</Label>
            <Input type="number" placeholder="5000" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
          </Field>
          <Field>
            <Label>Category</Label>
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </Select>
          </Field>
        </Row>
        <Field>
          <Label>Description</Label>
          <Textarea placeholder="Describe the product, materials, sizing, care instructions..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </Field>
        <Field>
          <Label>Product images</Label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            {form.images.map((img, i) => (
              <ImgBox key={i} src={img.url} onRemove={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))} />
            ))}
            <div
              onClick={() => imgRef.current.click()}
              style={{ width: 90, height: 90, borderRadius: 10, border: `2px dashed ${COLORS.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: COLORS.white, color: COLORS.muted }}
              onMouseEnter={e => e.currentTarget.style.border = `2px dashed ${COLORS.blue}`}
              onMouseLeave={e => e.currentTarget.style.border = `2px dashed ${COLORS.border}`}
            >
              <span style={{ fontSize: 24, lineHeight: 1 }}>+</span>
              <span style={{ fontSize: 10, marginTop: 4 }}>Add photo</span>
            </div>
          </div>
          <input ref={imgRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleProductImages} />
        </Field>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={saveProduct} disabled={!form.name.trim() || !form.price}>
            {editIndex !== null ? "Update Product" : "+ Save Product"}
          </Btn>
          {editIndex !== null && (
            <Btn variant="ghost" onClick={() => { setForm({ name: "", price: "", category: categories[0], description: "", images: [] }); setEditIndex(null); }}>
              Cancel
            </Btn>
          )}
        </div>
      </SectionCard>

      {(data.products || []).length > 0 && (
        <SectionCard title={`Products (${(data.products || []).length})`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {(data.products || []).map((p, i) => (
              <div key={p.id} style={{ background: COLORS.white, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
                {p.images?.[0] && <img src={p.images[0].url} alt={p.name} style={{ width: "100%", height: 120, objectFit: "cover" }} />}
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text, marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: COLORS.blue, fontWeight: 700, marginBottom: 4 }}>N{Number(p.price).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10, background: COLORS.blueLight, display: "inline-block", padding: "2px 8px", borderRadius: 20 }}>{p.category}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => editProduct(i)} style={{ flex: 1, padding: "6px", fontSize: 12, borderRadius: 8, border: `1.5px solid ${COLORS.blue}`, background: "transparent", color: COLORS.blue, cursor: "pointer", fontWeight: 600 }}>Edit</button>
                    <button onClick={() => deleteProduct(i)} style={{ flex: 1, padding: "6px", fontSize: 12, borderRadius: 8, border: "1.5px solid #ef4444", background: "transparent", color: "#ef4444", cursor: "pointer", fontWeight: 600 }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Checkout Settings">
        <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 0, marginBottom: 14 }}>Choose which fields appear on your checkout form</p>
        {[
          { key: "name", label: "Customer Name (required)", required: true },
          { key: "phone", label: "Phone Number" },
          { key: "address", label: "Delivery Address" },
          { key: "email", label: "Email Address" },
        ].map(field => (
          <OptionCheckbox key={field.key} label={field.label}
            checked={checkoutFields[field.key]}
            onChange={() => !field.required && toggleCheckout(field.key)} />
        ))}
      </SectionCard>

      <SectionCard title="Delivery Options">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {deliveryOptions.map(opt => (
            <OptionCheckbox key={opt.key} label={opt.label}
              checked={(data.delivery || []).includes(opt.key)}
              onChange={() => toggleDelivery(opt.key)} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// Step 3: Website Preview

function StarDisplay({ count }) {
  return <span style={{ color: "#f59e0b" }}>{"★".repeat(count)}{"☆".repeat(5 - count)}</span>;
}

function WebsitePreview({ data }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);

  const addToCart = (product) => {
    setCart(c => {
      const exists = c.find(i => i.id === product.id);
      return exists ? c.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...c, { ...product, qty: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);
  const paymentLabels = { bank: "Bank Transfer", card: "Credit/Debit Card", paystack: "Paystack", flutterwave: "Flutterwave", cash: "Cash on Delivery", crypto: "Crypto" };
  const deliveryLabels = { pickup: "Store Pickup", local: "Local Delivery", nationwide: "Nationwide Shipping", digital: "Digital / Instant" };
  const cf = data.checkoutFields || {};

  const placeOrder = () => {
    setOrderPlaced(true);
    setCheckoutOpen(false);
    setCart([]);
    setTimeout(() => setOrderPlaced(false), 4000);
  };

  return (
    <div style={{ border: `2px solid ${COLORS.blue}`, borderRadius: 20, overflow: "hidden", fontFamily: "inherit" }}>
      {/* Preview label bar */}
      <div style={{ background: COLORS.blue, padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>LIVE WEBSITE PREVIEW</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ef4444", "#f59e0b", "#22c55e"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ background: COLORS.white, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1.5px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {data.logoUrl && <img src={data.logoUrl} alt="logo" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />}
          <span style={{ fontWeight: 800, fontSize: 18, color: COLORS.blue }}>{data.brandName || "Your Brand"}</span>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {["Home", "Products", "About", "Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, textDecoration: "none" }} onClick={e => e.preventDefault()}>{l}</a>
          ))}
          <button onClick={() => setCartOpen(o => !o)} style={{ background: COLORS.blue, border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Cart ({cart.length})
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.blue} 0%, #2d4fd4 100%)`, padding: "56px 32px", textAlign: "center" }}>
        {data.logoUrl && <img src={data.logoUrl} alt="logo" style={{ width: 80, height: 80, borderRadius: 16, objectFit: "cover", marginBottom: 20, border: "3px solid rgba(255,255,255,0.3)" }} />}
        <h1 style={{ color: "#fff", fontSize: 34, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.2 }}>{data.brandName || "Welcome to Our Store"}</h1>
        {data.motto && <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, margin: "0 0 28px", fontStyle: "italic" }}>"{data.motto}"</p>}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button style={{ background: COLORS.offWhite, color: COLORS.blue, border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Shop Now</button>
          <button style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.5)", borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Learn More</button>
        </div>
      </div>

      {/* Social handles */}
      {(data.socialHandles || []).length > 0 && (
        <div style={{ background: COLORS.offWhite, padding: "10px 32px", display: "flex", gap: 12, alignItems: "center", borderBottom: `1.5px solid ${COLORS.border}` }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Follow us:</span>
          {data.socialHandles.map((h, i) => <span key={i} style={{ fontSize: 13, color: COLORS.blue, fontWeight: 600 }}>{h}</span>)}
        </div>
      )}

      {/* Products */}
      {(data.products || []).length > 0 && (
        <div style={{ padding: "40px 32px", background: COLORS.offWhite }}>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: COLORS.text, marginBottom: 6 }}>Our Products</h2>
          <div style={{ width: 50, height: 4, background: COLORS.blue, borderRadius: 2, marginBottom: 28 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
            {data.products.map(p => (
              <div key={p.id} style={{ background: COLORS.white, borderRadius: 14, border: `1.5px solid ${COLORS.border}`, overflow: "hidden" }}>
                {p.images?.[0]
                  ? <img src={p.images[0].url} alt={p.name} style={{ width: "100%", height: 140, objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: 140, background: COLORS.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: COLORS.muted }}>No image</div>
                }
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text, marginBottom: 2 }}>{p.name}</div>
                  {p.description && <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 8px", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.description}</p>}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ color: COLORS.blue, fontWeight: 800, fontSize: 15 }}>N{Number(p.price).toLocaleString()}</span>
                    <button onClick={() => addToCart(p)} style={{ background: COLORS.blue, color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Add to cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About */}
      {(data.about || data.brandName) && (
        <div style={{ padding: "40px 32px", background: COLORS.white }}>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: COLORS.text, marginBottom: 6 }}>About Us</h2>
          <div style={{ width: 50, height: 4, background: COLORS.blue, borderRadius: 2, marginBottom: 20 }} />
          <p style={{ fontSize: 15, color: COLORS.muted, lineHeight: 1.8, maxWidth: 640 }}>{data.about || `Welcome to ${data.brandName}. We are committed to delivering quality products and exceptional service to every customer.`}</p>
        </div>
      )}

      {/* Reviews */}
      {(data.reviews || []).length > 0 && (
        <div style={{ padding: "40px 32px", background: COLORS.offWhite }}>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: COLORS.text, marginBottom: 6 }}>Customer Reviews</h2>
          <div style={{ width: 50, height: 4, background: COLORS.blue, borderRadius: 2, marginBottom: 28 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {data.reviews.map((rev) => (
              <div key={rev.id} style={{ background: COLORS.white, borderRadius: 14, border: `1.5px solid ${COLORS.border}`, padding: "16px 18px" }}>
                <StarDisplay count={rev.rating} />
                <p style={{ fontSize: 14, color: COLORS.muted, margin: "8px 0", lineHeight: 1.6 }}>"{rev.text}"</p>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>— {rev.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {(data.payments || []).length > 0 && (
        <div style={{ padding: "32px 32px", background: COLORS.white, borderTop: `1.5px solid ${COLORS.border}` }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, marginBottom: 14 }}>We Accept</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {data.payments.map(k => <span key={k} style={{ background: COLORS.blueLight, color: COLORS.blue, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>{paymentLabels[k]}</span>)}
          </div>
        </div>
      )}

      {/* Delivery */}
      {(data.delivery || []).length > 0 && (
        <div style={{ padding: "24px 32px", background: COLORS.offWhite, borderTop: `1.5px solid ${COLORS.border}` }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, marginBottom: 14 }}>Delivery Options</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {data.delivery.map(k => <span key={k} style={{ background: COLORS.white, border: `1.5px solid ${COLORS.blue}`, color: COLORS.blue, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>{deliveryLabels[k]}</span>)}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ background: COLORS.blue, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>© 2025 {data.brandName || "Your Brand"}. All rights reserved.</span>
        {(data.socialHandles || []).length > 0 && (
          <div style={{ display: "flex", gap: 12 }}>
            {data.socialHandles.slice(0, 3).map((h, i) => <a key={i} href="#" onClick={e => e.preventDefault()} style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, textDecoration: "none" }}>{h}</a>)}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {cartOpen && (
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 320, background: COLORS.white, boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", borderLeft: `1.5px solid ${COLORS.border}`, zIndex: 10, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1.5px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: COLORS.text }}>Cart ({cart.length})</span>
            <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: COLORS.muted }}>x</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
            {cart.length === 0
              ? <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", marginTop: 40 }}>Your cart is empty</p>
              : cart.map(item => (
                  <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                    {item.images?.[0] && <img src={item.images[0].url} alt={item.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover" }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.text }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: COLORS.blue, fontWeight: 700 }}>N{(Number(item.price) * item.qty).toLocaleString()}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => setCart(c => c.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} style={{ width: 24, height: 24, borderRadius: 6, border: `1.5px solid ${COLORS.border}`, background: "none", cursor: "pointer", fontWeight: 700 }}>-</button>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{item.qty}</span>
                      <button onClick={() => setCart(c => c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))} style={{ width: 24, height: 24, borderRadius: 6, border: `1.5px solid ${COLORS.border}`, background: "none", cursor: "pointer", fontWeight: 700 }}>+</button>
                    </div>
                  </div>
                ))
            }
          </div>
          {cart.length > 0 && (
            <div style={{ padding: "16px 20px", borderTop: `1.5px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontWeight: 700, color: COLORS.text }}>Total</span>
                <span style={{ fontWeight: 800, color: COLORS.blue, fontSize: 18 }}>N{cartTotal.toLocaleString()}</span>
              </div>
              <button onClick={() => { setCheckoutOpen(true); setCartOpen(false); }} style={{ width: "100%", background: COLORS.blue, color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Checkout</button>
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: COLORS.white, borderRadius: 20, width: 480, maxHeight: "90vh", overflowY: "auto", padding: "28px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, marginBottom: 20 }}>Complete your order</h2>
            {cf.name !== false && <Field><Label required>Full name</Label><Input placeholder="Jane Doe" value={checkoutForm.name || ""} onChange={e => setCheckoutForm(f => ({ ...f, name: e.target.value }))} /></Field>}
            {cf.phone && <Field><Label>Phone number</Label><Input placeholder="08012345678" value={checkoutForm.phone || ""} onChange={e => setCheckoutForm(f => ({ ...f, phone: e.target.value }))} /></Field>}
            {cf.email && <Field><Label>Email address</Label><Input type="email" placeholder="you@example.com" value={checkoutForm.email || ""} onChange={e => setCheckoutForm(f => ({ ...f, email: e.target.value }))} /></Field>}
            {cf.address && <Field><Label>Delivery address</Label><Textarea placeholder="Street, City, State" value={checkoutForm.address || ""} onChange={e => setCheckoutForm(f => ({ ...f, address: e.target.value }))} style={{ minHeight: 70 }} /></Field>}
            {(data.delivery || []).length > 0 && (
              <Field>
                <Label>Delivery method</Label>
                <Select value={checkoutForm.delivery || ""} onChange={e => setCheckoutForm(f => ({ ...f, delivery: e.target.value }))}>
                  <option value="">Select delivery method</option>
                  {data.delivery.map(k => <option key={k} value={k}>{deliveryLabels[k]}</option>)}
                </Select>
              </Field>
            )}
            {(data.payments || []).length > 0 && (
              <Field>
                <Label>Payment method</Label>
                <Select value={checkoutForm.payment || ""} onChange={e => setCheckoutForm(f => ({ ...f, payment: e.target.value }))}>
                  <option value="">Select payment method</option>
                  {data.payments.map(k => <option key={k} value={k}>{paymentLabels[k]}</option>)}
                </Select>
              </Field>
            )}
            <div style={{ background: COLORS.offWhite, borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>Order summary</div>
              {cart.map(i => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>{i.name} x {i.qty}</span>
                  <span style={{ fontWeight: 700 }}>N{(Number(i.price) * i.qty).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 15, marginTop: 8, paddingTop: 8, borderTop: `1.5px solid ${COLORS.border}` }}>
                <span>Total</span><span style={{ color: COLORS.blue }}>N{cartTotal.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Btn variant="ghost" onClick={() => setCheckoutOpen(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={placeOrder} style={{ flex: 2 }}>Place Order</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Order success toast */}
      {orderPlaced && (
        <div style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", background: COLORS.success, color: "#fff", padding: "14px 28px", borderRadius: 12, fontWeight: 700, fontSize: 15, zIndex: 200, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          Order placed successfully!
        </div>
      )}
    </div>
  );
}

// Main App

export default function BusinessWebsiteBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ products: [], reviews: [], socialHandles: [], payments: [], delivery: [] });

  const completeness = [
    !!data.brandName,
    (data.products || []).length > 0,
    true,
  ];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: COLORS.white, borderBottom: `1.5px solid ${COLORS.border}`, padding: "0 32px", position: "sticky", top: 0, zIndex: 0 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: COLORS.blue, borderRadius: 10 }} />
            <span style={{ fontWeight: 800, fontSize: 17, color: COLORS.text }}>BizBuilder</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => setStep(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 20,
                    border: step === i ? "none" : `1.5px solid ${COLORS.border}`,
                    background: step === i ? COLORS.blue : completeness[i] ? COLORS.blueLight : COLORS.white,
                    color: step === i ? "#fff" : completeness[i] ? COLORS.blue : COLORS.muted,
                    fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap"
                  }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: step === i ? "rgba(255,255,255,0.25)" : completeness[i] ? COLORS.blue : COLORS.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: completeness[i] || step === i ? "#fff" : COLORS.muted, fontWeight: 800 }}>
                    {completeness[i] && step !== i ? "✓" : i + 1}
                  </span>
                  {s}
                </button>
                {i < steps.length - 1 && <span style={{ color: COLORS.border, fontSize: 18, margin: "0 2px" }}>›</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 80px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: COLORS.text, margin: "0 0 4px" }}>{steps[step]}</h1>
          <p style={{ fontSize: 14, color: COLORS.muted, margin: 0 }}>
            {step === 0 && "Set up your brand identity, contact info, and payment options."}
            {step === 1 && "Upload your products, set prices, and configure checkout."}
            {step === 2 && "See your fully built website exactly as customers will see it."}
          </p>
        </div>

        {step === 0 && <BusinessProfile data={data} setData={setData} />}
        {step === 1 && <ProductsUpload data={data} setData={setData} />}
        {step === 2 && (
          <div style={{ position: "relative" }}>
            <WebsitePreview data={data} />
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          {step > 0 ? (
            <Btn variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))}>Back</Btn>
          ) : <div />}
          <div style={{ fontSize: 13, color: COLORS.muted }}>{step + 1} of {steps.length}</div>
          {step < steps.length - 1
            ? <Btn onClick={() => setStep(s => s + 1)}>Next: {steps[step + 1]}</Btn>
            : <Btn onClick={() => {
                alert("Website published successfully! Redirecting to dashboard...");
                navigate("/dashboard");
              }}>
              Publish Website
            </Btn>
          }
        </div>
      </div>
    </div>
  );
}