import { useState, useMemo, useEffect } from "react";

// ─── STORAGE KEYS ───────────────────────────────────────────────────────────
const STORAGE_KEY       = "rental_reservations_v2";
const INV_STORAGE_KEY   = "rental_inventory_v1";
const CONTRACT_STORAGE_KEY = "rental_contract_v1";

const DEFAULT_CONTRACT = `RENTAL AGREEMENT & LIABILITY WAIVER

[YOUR SHOP NAME]
[Address] · [Phone] · [Email]

This Rental Agreement ("Agreement") is entered into between [YOUR SHOP NAME] ("Company") and the customer identified below ("Renter") on the date of pickup noted above.

1. RENTAL TERMS
The Renter agrees to rent the equipment listed on this agreement at the daily rate shown. Rental begins on the pickup date and ends on the return date. Late returns will be charged at the daily rate for each additional day.

2. CONDITION & CARE
The Renter acknowledges receiving the equipment in good working condition and agrees to return it in the same condition, reasonable wear excepted. The Renter is responsible for any damage, loss, or theft occurring during the rental period.

3. DAMAGE & LIABILITY
In the event of damage or loss, the Renter agrees to pay the full repair or replacement cost of the equipment. The Company is not responsible for injuries, accidents, or damages arising from the use of rental equipment.

4. ASSUMPTION OF RISK
The Renter acknowledges that the use of rental equipment involves inherent risks, including but not limited to physical injury or death. The Renter voluntarily assumes all risks associated with use of the equipment and releases [YOUR SHOP NAME], its employees, and agents from any and all liability.

5. HELMET & SAFETY EQUIPMENT
Where applicable, the Renter agrees to wear all recommended safety equipment. [YOUR SHOP NAME] recommends wearing a helmet at all times when using bicycles, e-bikes, or snow sports equipment.

6. RETURN POLICY
All equipment must be returned to [YOUR SHOP NAME] by the agreed return date and time. Equipment not returned by the due date will be considered unreturned and may result in additional charges or legal action.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the state of [YOUR STATE].

By signing below, the Renter confirms they have read, understood, and agree to all terms of this Rental Agreement.`;

// ─── DATA ───────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Bikes", "Paddleboards", "Snow Gear", "Camping"];

const CAT_COLORS = {
  Bikes:        { bg: "#1a6b3c", light: "#d4f0e0", border: "#28a745", emoji: "🚲" },
  Paddleboards: { bg: "#0d6096", light: "#cce5ff", border: "#1e90ff", emoji: "🏄" },
  "Snow Gear":  { bg: "#4a2d82", light: "#e8dff7", border: "#7c55cc", emoji: "⛷️" },
  Camping:      { bg: "#8b4513", light: "#fde9cc", border: "#cc7722", emoji: "⛺" },
};

const INVENTORY_SEED = [
  { id:"BK-001", name:"Mountain Bike (Med)",   category:"Bikes",        rate:35, qty:5,
    units:[{uid:"BK-001-A",label:"Bike A",condition:"Good",notes:""},{uid:"BK-001-B",label:"Bike B",condition:"Good",notes:""},{uid:"BK-001-C",label:"Bike C",condition:"Good",notes:""},{uid:"BK-001-D",label:"Bike D",condition:"Fair",notes:"Gear shifter sticky"},{uid:"BK-001-E",label:"Bike E",condition:"Good",notes:""}] },
  { id:"BK-002", name:"Mountain Bike (Lg)",    category:"Bikes",        rate:35, qty:3,
    units:[{uid:"BK-002-A",label:"Bike A",condition:"Good",notes:""},{uid:"BK-002-B",label:"Bike B",condition:"Good",notes:""},{uid:"BK-002-C",label:"Bike C",condition:"Excellent",notes:"New this season"}] },
  { id:"BK-003", name:'Kids Bike 20"',         category:"Bikes",        rate:20, qty:4,
    units:[{uid:"BK-003-A",label:"Bike A",condition:"Good",notes:""},{uid:"BK-003-B",label:"Bike B",condition:"Good",notes:""},{uid:"BK-003-C",label:"Bike C",condition:"Fair",notes:""},{uid:"BK-003-D",label:"Bike D",condition:"Good",notes:""}] },
  { id:"BK-004", name:"E-Bike",                category:"Bikes",        rate:55, qty:2,
    units:[{uid:"BK-004-A",label:"E-Bike A",condition:"Excellent",notes:"Charge after each use"},{uid:"BK-004-B",label:"E-Bike B",condition:"Good",notes:"Charge after each use"}] },
  { id:"PB-001", name:"SUP Board 10'",         category:"Paddleboards", rate:45, qty:4,
    units:[{uid:"PB-001-A",label:"Board #1",condition:"Good",notes:""},{uid:"PB-001-B",label:"Board #2",condition:"Good",notes:""},{uid:"PB-001-C",label:"Board #3",condition:"Fair",notes:"Minor hull scratch"},{uid:"PB-001-D",label:"Board #4",condition:"Good",notes:""}] },
  { id:"PB-002", name:"SUP Board + Paddle Kit",category:"Paddleboards", rate:55, qty:3,
    units:[{uid:"PB-002-A",label:"Kit #1",condition:"Good",notes:""},{uid:"PB-002-B",label:"Kit #2",condition:"Good",notes:""},{uid:"PB-002-C",label:"Kit #3",condition:"Good",notes:""}] },
  { id:"PB-003", name:"Kayak (Single)",        category:"Paddleboards", rate:40, qty:2,
    units:[{uid:"PB-003-A",label:"Kayak A",condition:"Good",notes:""},{uid:"PB-003-B",label:"Kayak B",condition:"Fair",notes:"Fin replaced Mar 2026"}] },
  { id:"SG-001", name:"Ski Package (S)",       category:"Snow Gear",    rate:65, qty:3, units:[{uid:"SG-001-A",label:"Package A",condition:"Good",notes:""},{uid:"SG-001-B",label:"Package B",condition:"Good",notes:""},{uid:"SG-001-C",label:"Package C",condition:"Good",notes:""}] },
  { id:"SG-002", name:"Ski Package (M)",       category:"Snow Gear",    rate:65, qty:4, units:[{uid:"SG-002-A",label:"Package A",condition:"Good",notes:""},{uid:"SG-002-B",label:"Package B",condition:"Good",notes:""},{uid:"SG-002-C",label:"Package C",condition:"Good",notes:""},{uid:"SG-002-D",label:"Package D",condition:"Fair",notes:""}] },
  { id:"SG-003", name:"Snowboard Package (M)", category:"Snow Gear",    rate:60, qty:2, units:[{uid:"SG-003-A",label:"Board A",condition:"Good",notes:""},{uid:"SG-003-B",label:"Board B",condition:"Good",notes:""}] },
  { id:"CP-001", name:"2-Person Tent",         category:"Camping",      rate:25, qty:6, units:[{uid:"CP-001-A",label:"Tent A",condition:"Good",notes:""},{uid:"CP-001-B",label:"Tent B",condition:"Good",notes:""},{uid:"CP-001-C",label:"Tent C",condition:"Good",notes:""},{uid:"CP-001-D",label:"Tent D",condition:"Fair",notes:""},{uid:"CP-001-E",label:"Tent E",condition:"Good",notes:""},{uid:"CP-001-F",label:"Tent F",condition:"Good",notes:""}] },
  { id:"CP-002", name:"4-Person Tent",         category:"Camping",      rate:40, qty:4, units:[{uid:"CP-002-A",label:"Tent A",condition:"Good",notes:""},{uid:"CP-002-B",label:"Tent B",condition:"Good",notes:""},{uid:"CP-002-C",label:"Tent C",condition:"Excellent",notes:"New"},{uid:"CP-002-D",label:"Tent D",condition:"Good",notes:""}] },
  { id:"CP-003", name:"Sleeping Bag (-10°C)",  category:"Camping",      rate:15, qty:8, units:[{uid:"CP-003-A",label:"Bag A",condition:"Good",notes:""},{uid:"CP-003-B",label:"Bag B",condition:"Good",notes:""},{uid:"CP-003-C",label:"Bag C",condition:"Good",notes:""},{uid:"CP-003-D",label:"Bag D",condition:"Good",notes:""},{uid:"CP-003-E",label:"Bag E",condition:"Fair",notes:""},{uid:"CP-003-F",label:"Bag F",condition:"Good",notes:""},{uid:"CP-003-G",label:"Bag G",condition:"Good",notes:""},{uid:"CP-003-H",label:"Bag H",condition:"Good",notes:""}] },
  { id:"CP-004", name:"Camping Stove + Fuel",  category:"Camping",      rate:12, qty:5, units:[{uid:"CP-004-A",label:"Stove A",condition:"Good",notes:""},{uid:"CP-004-B",label:"Stove B",condition:"Needs Repair",notes:"Igniter broken"},{uid:"CP-004-C",label:"Stove C",condition:"Good",notes:""},{uid:"CP-004-D",label:"Stove D",condition:"Good",notes:""},{uid:"CP-004-E",label:"Stove E",condition:"Good",notes:""}] },
  { id:"CP-005", name:"Backpack 65L",          category:"Camping",      rate:18, qty:6, units:[{uid:"CP-005-A",label:"Pack A",condition:"Good",notes:""},{uid:"CP-005-B",label:"Pack B",condition:"Good",notes:""},{uid:"CP-005-C",label:"Pack C",condition:"Good",notes:""},{uid:"CP-005-D",label:"Pack D",condition:"Fair",notes:""},{uid:"CP-005-E",label:"Pack E",condition:"Good",notes:""},{uid:"CP-005-F",label:"Pack F",condition:"Good",notes:""}] },
];

const SEED = [
  { id:"R-001", itemId:"BK-001", customer:"Sarah Johnson", phone:"555-0101", start:"2026-03-07", end:"2026-03-10" },
  { id:"R-002", itemId:"PB-002", customer:"Mike Torres",   phone:"555-0182", start:"2026-03-08", end:"2026-03-09" },
  { id:"R-003", itemId:"CP-001", customer:"Aisha Patel",   phone:"555-0234", start:"2026-03-06", end:"2026-03-14" },
  { id:"R-004", itemId:"SG-001", customer:"David Kim",     phone:"555-0315", start:"2026-03-09", end:"2026-03-12" },
  { id:"R-005", itemId:"BK-003", customer:"Emma Wallace",  phone:"555-0421", start:"2026-03-12", end:"2026-03-15" },
  { id:"R-006", itemId:"PB-001", customer:"James Okafor",  phone:"555-0567", start:"2026-03-14", end:"2026-03-16" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const toDate = s => new Date(s + "T00:00:00");
const isoDate = d => d.toISOString().slice(0, 10);
const today = isoDate(new Date());
const fmtDate = s => toDate(s).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
const fmtShort = s => toDate(s).toLocaleDateString("en-US", { month:"short", day:"numeric" });
const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / 86400000) + 1;
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOWS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Overdue = return date is strictly before today AND not marked returned
const isOverdue = r => r.end < today && r.status !== "returned";
const daysOverdue = r => isOverdue(r) ? Math.round((toDate(today) - toDate(r.end)) / 86400000) : 0;

function monthDays(year, month) {
  const days = [];
  for (let d = new Date(year, month, 1); d.getMonth() === month; d.setDate(d.getDate() + 1))
    days.push(isoDate(new Date(d)));
  return days;
}

// Count how many of a specific item are booked on a given day (excluding a reservation by id)
function countBooked(reservations, itemId, day, excludeId = null) {
  return reservations.filter(r =>
    r.itemId === itemId &&
    r.start <= day && r.end >= day &&
    r.id !== excludeId
  ).length;
}

// Check if adding a reservation for itemId from start→end would double-book on any day
function checkConflicts(reservations, inventory, itemId, start, end, excludeId = null) {
  const item = inventory.find(i => i.id === itemId);
  if (!item) return [];
  const conflicts = [];
  const s = toDate(start), e = toDate(end);
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const day = isoDate(new Date(d));
    const booked = countBooked(reservations, itemId, day, excludeId);
    if (booked >= item.qty) {
      const who = reservations.filter(r => r.itemId === itemId && r.start <= day && r.end >= day && r.id !== excludeId);
      conflicts.push({ day, booked, max: item.qty, who });
    }
  }
  return conflicts;
}

// ─── CHECKOUT PANEL (needs own state for contract toggle) ────────────────────
export default function RentalApp() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [reservations, setReservations] = useState(SEED);
  const [inventory, setInventory]       = useState(INVENTORY_SEED);
  const [contract, setContract]         = useState(DEFAULT_CONTRACT);
  const [storageReady, setStorageReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const [view, setView] = useState("calendar");
  const [tab, setTab] = useState("citruslime");
  const [calFilter, setCalFilter] = useState("All");
  const [listFilter, setListFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(2);

  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [modal, setModal] = useState(null); // + "contract" | "sign" | "viewsigned" | "contracteditor"
  const [selectedRes, setSelectedRes] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [signatureName, setSignatureName] = useState("");
  const [signatureError, setSignatureError] = useState("");
  const [editingContract, setEditingContract] = useState("");
  const [pickupPayMethod, setPickupPayMethod] = useState("manual");
  const [showContract, setShowContract] = useState(false);

  const [form, setForm] = useState({ itemId:"", unitId:"", customer:"", phone:"", start:"", end:"" });
  const [formError, setFormError] = useState("");
  const [conflictWarning, setConflictWarning] = useState([]);
  const [forceBook, setForceBook] = useState(false);

  // Inventory form state
  const BLANK_INV = { name:"", category:"Bikes", rate:"", qty:"", notes:"" };
  const [invForm, setInvForm]           = useState(BLANK_INV);
  const [invFormError, setInvFormError] = useState("");
  const [editingInvId, setEditingInvId] = useState(null);
  const [invCatFilter, setInvCatFilter] = useState("All");
  const [expandedItemId, setExpandedItemId] = useState(null); // unit panel
  const [editingUnit, setEditingUnit]   = useState(null); // {itemId, uid} or null

  const CONDITIONS = ["Excellent","Good","Fair","Needs Repair","Retired"];

  function generateUnits(itemId, qty, existingUnits = []) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return Array.from({ length: qty }, (_, i) => {
      const suffix = i < 26 ? letters[i] : `${letters[Math.floor(i/26)-1]}${letters[i%26]}`;
      const uid = `${itemId}-${suffix}`;
      const existing = existingUnits.find(u => u.uid === uid);
      return existing || { uid, label:`Unit ${suffix}`, condition:"Good", notes:"" };
    });
  }

  function updateUnit(itemId, uid, changes) {
    updateInventory(inventory.map(item =>
      item.id === itemId
        ? { ...item, units: item.units.map(u => u.uid === uid ? { ...u, ...changes } : u) }
        : item
    ));
  }

  // Get unit label for display in reservations
  const getUnitLabel = (itemId, uid) => {
    if (!uid) return null;
    const item = inventory.find(i => i.id === itemId);
    const unit = item?.units?.find(u => u.uid === uid);
    return unit ? `${unit.label} (${uid})` : uid;
  };

  // ── Persistent Storage ───────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [resResult, invResult, contractResult] = await Promise.all([
          window.storage.get(STORAGE_KEY).catch(() => null),
          window.storage.get(INV_STORAGE_KEY).catch(() => null),
          window.storage.get(CONTRACT_STORAGE_KEY).catch(() => null),
        ]);
        if (resResult?.value) {
          const parsed = JSON.parse(resResult.value);
          if (Array.isArray(parsed) && parsed.length > 0) setReservations(parsed);
        }
        if (invResult?.value) {
          const parsed = JSON.parse(invResult.value);
          if (Array.isArray(parsed) && parsed.length > 0) setInventory(parsed);
        }
        if (contractResult?.value) {
          setContract(JSON.parse(contractResult.value));
        }
      } catch {}
      setStorageReady(true);
    }
    load();
  }, []);

  async function saveToStorage(newReservations, newInventory, newContract) {
    setSaving(true);
    try {
      await Promise.all([
        window.storage.set(STORAGE_KEY, JSON.stringify(newReservations)),
        newInventory !== undefined ? window.storage.set(INV_STORAGE_KEY, JSON.stringify(newInventory)) : Promise.resolve(),
        newContract !== undefined ? window.storage.set(CONTRACT_STORAGE_KEY, JSON.stringify(newContract)) : Promise.resolve(),
      ]);
      setLastSaved(new Date().toLocaleTimeString());
    } catch {}
    setSaving(false);
  }

  function updateReservations(newRes) { setReservations(newRes); saveToStorage(newRes, undefined, undefined); }
  function updateInventory(newInv)    { setInventory(newInv);    saveToStorage(reservations, newInv, undefined); }
  function updateContract(newC)       { setContract(newC);       saveToStorage(reservations, undefined, newC); }

  // ── Derived ───────────────────────────────────────────────────────────────
  const getItem = id => inventory.find(i => i.id === id) || {};

  const categories = useMemo(() => {
    const cats = [...new Set(inventory.map(i => i.category))].sort();
    return ["All", ...cats];
  }, [inventory]);

  const filteredCal = useMemo(() => {
    let r = reservations;
    if (calFilter !== "All") r = r.filter(res => getItem(res.itemId).category === calFilter);
    if (search.trim()) r = r.filter(res => res.customer.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [reservations, calFilter, search]);

  const filteredList = useMemo(() => {
    let r = reservations;
    if (listFilter !== "All") r = r.filter(res => getItem(res.itemId).category === listFilter);
    if (search.trim()) r = r.filter(res => res.customer.toLowerCase().includes(search.toLowerCase()));
    return r.sort((a,b) => a.start.localeCompare(b.start));
  }, [reservations, listFilter, search]);

  const overdueItems = useMemo(() => reservations.filter(isOverdue).sort((a,b) => a.end.localeCompare(b.end)), [reservations]);

  const days = monthDays(calYear, calMonth);
  const firstDow = new Date(calYear, calMonth, 1).getDay();

  // ── Conflict check on form change ─────────────────────────────────────────
  useEffect(() => {
    if (form.itemId && form.start && form.end && form.end >= form.start) {
      const c = checkConflicts(reservations, inventory, form.itemId, form.start, form.end);
      setConflictWarning(c);
      if (c.length > 0) setForceBook(false);
    } else {
      setConflictWarning([]);
    }
  }, [form.itemId, form.start, form.end, reservations]);

  // ── Actions ───────────────────────────────────────────────────────────────
  function addReservation() {
    if (!form.itemId || !form.customer || !form.start || !form.end) {
      setFormError("Please fill in all required fields."); return;
    }
    if (form.end < form.start) {
      setFormError("Return date must be after pickup date."); return;
    }
    if (conflictWarning.length > 0 && !forceBook) {
      setFormError("This item is fully booked on some dates. Check the conflict warning above, or tick 'Book anyway' to override."); return;
    }
    const newId = "R-" + String(Date.now()).slice(-5);
    const newRes = [...reservations, { ...form, id: newId }];
    updateReservations(newRes);
    setForm({ itemId:"", unitId:"", customer:"", phone:"", start:"", end:"" });
    setFormError(""); setConflictWarning([]); setForceBook(false);
    setModal(null);
  }

  function signContract(id, signedName, paymentMethod) {
    const ts = new Date().toLocaleString();
    const newRes = reservations.map(r =>
      r.id === id ? {
        ...r,
        status: "pickedup",
        pickedUpAt: ts,
        paymentMethod: paymentMethod || "manual",
        paymentStatus: "paid",
        signedBy: signedName,
        signedAt: ts,
        contractText: contract,
      } : r
    );
    updateReservations(newRes);
    setSignatureName(""); setSignatureError("");
    setModal(null); setSelectedRes(null);
  }

  function markPickedUp(id, paymentMethod) {
    // Now routes through signContract — kept for compatibility
    signContract(id, "", paymentMethod);
  }

  function markReturned(id) {
    const newRes = reservations.map(r => r.id === id ? { ...r, status: "returned" } : r);
    updateReservations(newRes);
    setModal(null); setSelectedRes(null);
  }

  function deleteRes(id) {
    const newRes = reservations.filter(r => r.id !== id);
    updateReservations(newRes);
    setModal(null); setSelectedRes(null);
  }

  // ── Inventory actions ────────────────────────────────────────────────────
  function saveInvItem() {
    if (!invForm.name.trim() || !invForm.category || !invForm.rate || !invForm.qty) {
      setInvFormError("Name, category, daily rate, and quantity are required."); return;
    }
    if (isNaN(Number(invForm.rate)) || Number(invForm.rate) <= 0) {
      setInvFormError("Daily rate must be a positive number."); return;
    }
    if (isNaN(Number(invForm.qty)) || Number(invForm.qty) < 1) {
      setInvFormError("Quantity must be at least 1."); return;
    }
    const qty = Number(invForm.qty);
    if (editingInvId) {
      const existing = inventory.find(i => i.id === editingInvId);
      const units = generateUnits(editingInvId, qty, existing?.units || []);
      updateInventory(inventory.map(i => i.id === editingInvId
        ? { ...i, name:invForm.name.trim(), category:invForm.category, rate:Number(invForm.rate), qty, notes:invForm.notes, units }
        : i));
    } else {
      const prefix = invForm.category.slice(0,2).toUpperCase().replace(" ","");
      const existing = inventory.filter(i => i.category === invForm.category);
      const newId = `${prefix}-${String(existing.length + 1).padStart(3,"0")}`;
      const units = generateUnits(newId, qty, []);
      updateInventory([...inventory, { id:newId, name:invForm.name.trim(), category:invForm.category, rate:Number(invForm.rate), qty, notes:invForm.notes||"", units }]);
    }
    setInvForm(BLANK_INV); setInvFormError(""); setEditingInvId(null);
  }

  function startEditInv(item) {
    setInvForm({ name:item.name, category:item.category, rate:String(item.rate), qty:String(item.qty), notes:item.notes||"" });
    setEditingInvId(item.id); setInvFormError("");
  }

  function cancelEditInv() {
    setInvForm(BLANK_INV); setInvFormError(""); setEditingInvId(null);
  }

  function deleteInvItem(id) {
    if (reservations.some(r => r.itemId === id && r.status !== "returned")) {
      alert("This item has active reservations and cannot be deleted. Mark those reservations as returned first."); return;
    }
    updateInventory(inventory.filter(i => i.id !== id));
  }
  function prevMonth() { if (calMonth===0){setCalYear(y=>y-1);setCalMonth(11);}else setCalMonth(m=>m-1); }
  function nextMonth() { if (calMonth===11){setCalYear(y=>y+1);setCalMonth(0);}else setCalMonth(m=>m+1); }
  function goToToday() { const n=new Date(); setCalYear(n.getFullYear()); setCalMonth(n.getMonth()); }

  // ── Styles ────────────────────────────────────────────────────────────────
  const S = {
    app: { fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif", background:"#f5f0e8", minHeight:"100vh" },
    header: { background:"linear-gradient(135deg,#1a3d2b 0%,#0f2419 100%)", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 3px 16px #0005" },
    htitle: { color:"#e8dfc8", fontSize:"20px", fontWeight:"bold", letterSpacing:"0.04em", margin:0 },
    hsub: { color:"#7aab84", fontSize:"12px", marginTop:"2px", letterSpacing:"0.06em" },
    hright: { display:"flex", alignItems:"center", gap:"12px" },
    saveIndicator: (saving) => ({ fontSize:"11px", color: saving ? "#f0c060" : "#7aab84", fontStyle:"italic" }),
    toolbar: { background:"#fff", borderBottom:"2px solid #e8e0d0", padding:"10px 24px", display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" },
    tabBtn: (a) => ({ padding:"7px 16px", borderRadius:"20px", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", fontWeight: a?"bold":"normal", background: a?"#1a3d2b":"#eee8dc", color: a?"#e8dfc8":"#555", transition:"all .18s", letterSpacing:"0.02em" }),
    catBtn: (a, cat) => { const c=CAT_COLORS[cat]||{}; return { padding:"5px 13px", borderRadius:"14px", border:`2px solid ${c.bg||"#aaa"}`, cursor:"pointer", fontFamily:"inherit", fontSize:"12px", fontWeight:a?"bold":"normal", background:a?(c.bg||"#444"):"#fff", color:a?"#fff":(c.bg||"#444"), transition:"all .15s" }; },
    allBtn: (a) => ({ padding:"5px 13px", borderRadius:"14px", border:"2px solid #888", cursor:"pointer", fontFamily:"inherit", fontSize:"12px", fontWeight:a?"bold":"normal", background:a?"#444":"#fff", color:a?"#fff":"#666" }),
    addBtn: { marginLeft:"auto", padding:"8px 20px", background:"#c8732a", color:"#fff", border:"none", borderRadius:"20px", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", fontWeight:"bold", letterSpacing:"0.03em", boxShadow:"0 2px 8px #c8732a44" },
    infoBtn: { padding:"7px 16px", background:"#1a3d2b22", color:"#1a3d2b", border:"1px solid #1a3d2b44", borderRadius:"20px", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", fontWeight:"bold" },
    body: { padding:"20px 24px" },
    // Calendar
    calNav: { display:"flex", alignItems:"center", gap:"12px", marginBottom:"14px", flexWrap:"wrap" },
    calTitle: { fontSize:"22px", fontWeight:"bold", color:"#1a3d2b", minWidth:"200px", fontStyle:"italic" },
    navBtn: { background:"#fff", border:"1px solid #ccc", borderRadius:"6px", padding:"4px 12px", cursor:"pointer", fontSize:"15px", color:"#555", boxShadow:"0 1px 3px #0001" },
    todayBtn: { background:"#e8dfc8", border:"1px solid #c8b89a", borderRadius:"6px", padding:"4px 12px", cursor:"pointer", fontSize:"12px", color:"#5a3e20", fontFamily:"inherit", fontWeight:"bold" },
    legend: { display:"flex", gap:"10px", flexWrap:"wrap", marginLeft:"auto" },
    legendItem: (cat) => { const c=CAT_COLORS[cat]||{}; return { fontSize:"11px", color:"#666", display:"flex", alignItems:"center", gap:"4px" }; },
    legendDot: (cat) => { const c=CAT_COLORS[cat]||{}; return { width:"10px", height:"10px", borderRadius:"2px", background:c.bg, display:"inline-block" }; },
    calGrid: { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"3px" },
    dow: { textAlign:"center", fontWeight:"bold", fontSize:"11px", color:"#999", padding:"6px 0", letterSpacing:"0.1em", textTransform:"uppercase" },
    dayCell: (has, isT, isOtherMonth) => ({ minHeight:"86px", background: isT?"#f0f9f3": isOtherMonth?"#f8f5f0":"#fff", border: isT?"2px solid #1a6b3c":"1px solid #e5ddd0", borderRadius:"7px", padding:"5px 5px 3px", cursor:has?"pointer":"default", transition:"box-shadow .14s, transform .1s", position:"relative" }),
    dayNum: (isT, isOtherMonth) => ({ fontSize:"12px", fontWeight:isT?"bold":"normal", color: isT?"#1a6b3c": isOtherMonth?"#ccc":"#aaa", marginBottom:"3px" }),
    chip: (cat) => { const c=CAT_COLORS[cat]||{light:"#eee",bg:"#aaa"}; return { background:c.light, borderLeft:`3px solid ${c.bg}`, borderRadius:"3px", fontSize:"10px", padding:"2px 5px", marginBottom:"2px", color:"#333", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }; },
    // List
    card: (cat) => { const c=CAT_COLORS[cat]||{bg:"#aaa"}; return { background:"#fff", border:"1px solid #e5ddd0", borderLeft:`5px solid ${c.bg}`, borderRadius:"8px", padding:"14px 18px", marginBottom:"9px", cursor:"pointer", transition:"box-shadow .15s, transform .1s" }; },
    badge: (cat) => { const c=CAT_COLORS[cat]||{bg:"#aaa"}; return { display:"inline-block", background:c.bg, color:"#fff", fontSize:"11px", fontWeight:"bold", borderRadius:"10px", padding:"2px 10px", marginLeft:"8px", verticalAlign:"middle" }; },
    overdueChip: { background:"#fde8e8", borderLeft:"3px solid #c0392b", borderRadius:"3px", fontSize:"10px", padding:"2px 5px", marginBottom:"2px", color:"#c0392b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:"bold" },
    overdueCard: { background:"#fff8f8", border:"1px solid #f5c6c6", borderLeft:"5px solid #c0392b", borderRadius:"8px", padding:"14px 18px", marginBottom:"9px", cursor:"pointer", transition:"box-shadow .15s, transform .1s" },
    overdueBanner: { background:"#c0392b", color:"#fff", padding:"10px 24px", display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" },
    overdueBadge: { display:"inline-block", background:"#c0392b", color:"#fff", fontSize:"11px", fontWeight:"bold", borderRadius:"10px", padding:"2px 10px", marginLeft:"8px", verticalAlign:"middle" },
    returnedBadge: { display:"inline-block", background:"#27ae60", color:"#fff", fontSize:"11px", fontWeight:"bold", borderRadius:"10px", padding:"2px 8px", marginLeft:"8px", verticalAlign:"middle" },
    pickedUpBadge: { display:"inline-block", background:"#1a6b3c", color:"#fff", fontSize:"11px", fontWeight:"bold", borderRadius:"10px", padding:"2px 10px", marginLeft:"8px", verticalAlign:"middle" },
    paidBadge: { display:"inline-block", background:"#0d6096", color:"#fff", fontSize:"11px", fontWeight:"bold", borderRadius:"10px", padding:"2px 9px", marginLeft:"6px", verticalAlign:"middle" },
    pickupBtn: { padding:"9px 18px", background:"#1a6b3c", color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer", fontFamily:"inherit", fontSize:"14px", fontWeight:"bold" },
    markReturnBtn: { padding:"9px 18px", background:"#0d6096", color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer", fontFamily:"inherit", fontSize:"14px", fontWeight:"bold" },
    statusTrack: { display:"flex", alignItems:"center", gap:"0", marginBottom:"18px", fontSize:"12px" },
    statusStep: (active, done) => ({ flex:1, textAlign:"center", padding:"8px 4px", fontWeight: active||done ? "bold":"normal", color: done?"#fff": active?"#fff":"#bbb", background: done?"#1a6b3c": active?"#0d6096":"#f0ece4", borderRadius:"0", fontSize:"11px", letterSpacing:"0.04em" }),
    overlay: { position:"fixed", inset:0, background:"#0008", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" },
    modal: { background:"#fff", borderRadius:"14px", padding:"28px", width:"100%", maxWidth:"500px", boxShadow:"0 12px 50px #0006", fontFamily:"inherit", maxHeight:"90vh", overflowY:"auto" },
    wideModal: { background:"#fff", borderRadius:"14px", padding:"28px", width:"100%", maxWidth:"700px", boxShadow:"0 12px 50px #0006", fontFamily:"inherit", maxHeight:"90vh", overflowY:"auto" },
    mtitle: { fontSize:"18px", fontWeight:"bold", color:"#1a3d2b", marginBottom:"16px", fontStyle:"italic" },
    lbl: { display:"block", fontSize:"11px", fontWeight:"bold", color:"#888", marginBottom:"3px", marginTop:"12px", letterSpacing:"0.08em", textTransform:"uppercase" },
    inp: { width:"100%", padding:"8px 11px", borderRadius:"7px", border:"1px solid #ccc", fontFamily:"inherit", fontSize:"14px", boxSizing:"border-box", background:"#fdfaf6" },
    sel: { width:"100%", padding:"8px 11px", borderRadius:"7px", border:"1px solid #ccc", fontFamily:"inherit", fontSize:"14px", boxSizing:"border-box", background:"#fdfaf6" },
    btnRow: { display:"flex", gap:"10px", marginTop:"20px", justifyContent:"flex-end", flexWrap:"wrap" },
    saveBtn: { padding:"9px 22px", background:"#1a3d2b", color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer", fontFamily:"inherit", fontSize:"14px", fontWeight:"bold" },
    cancelBtn: { padding:"9px 22px", background:"#eee8dc", color:"#555", border:"none", borderRadius:"8px", cursor:"pointer", fontFamily:"inherit", fontSize:"14px" },
    delBtn: { padding:"9px 18px", background:"#c0392b", color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer", fontFamily:"inherit", fontSize:"14px", fontWeight:"bold" },
    // Conflict warning
    conflictBox: { background:"#fff3cd", border:"2px solid #e6a817", borderRadius:"8px", padding:"12px 16px", marginTop:"12px", fontSize:"13px", color:"#7d5200" },
    conflictTitle: { fontWeight:"bold", marginBottom:"6px", display:"flex", alignItems:"center", gap:"6px" },
    // Detail row
    dr: { display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #f0ece4", fontSize:"14px" },
    dlbl: { color:"#999", fontWeight:"bold", fontSize:"11px", letterSpacing:"0.07em", textTransform:"uppercase", paddingRight:"12px" },
    contractBox: { background:"#fdfaf6", border:"1px solid #e0d8c8", borderRadius:"8px", padding:"16px 20px", maxHeight:"320px", overflowY:"auto", fontSize:"12.5px", lineHeight:"1.8", color:"#333", whiteSpace:"pre-wrap", fontFamily:"'Georgia',serif" },
    signInput: { width:"100%", padding:"12px 14px", borderRadius:"8px", border:"2px solid #1a3d2b", fontFamily:"'Palatino Linotype',Georgia,serif", fontSize:"18px", fontStyle:"italic", boxSizing:"border-box", background:"#fdfaf6", letterSpacing:"0.04em" },
    signedBadge: { display:"inline-block", background:"#1a3d2b", color:"#fff", fontSize:"11px", fontWeight:"bold", borderRadius:"10px", padding:"2px 10px", marginLeft:"8px", verticalAlign:"middle" },
    contractEditorBox: { width:"100%", minHeight:"420px", padding:"14px", borderRadius:"8px", border:"1px solid #ccc", fontFamily:"'Georgia',serif", fontSize:"13px", lineHeight:"1.8", boxSizing:"border-box", background:"#fdfaf6", resize:"vertical" },
    invTh: { textAlign:"left", padding:"8px 12px", background:"#1a3d2b", color:"#e8dfc8", fontWeight:"bold", fontSize:"11px", letterSpacing:"0.07em", textTransform:"uppercase" },
    invTd: { padding:"9px 12px", borderBottom:"1px solid #ede8df", verticalAlign:"middle" },
    invFormBox: { background:"#f0f9f3", border:"2px solid #b8e0c8", borderRadius:"10px", padding:"18px 20px", marginBottom:"20px" },
    invEditBox: { background:"#fff8f0", border:"2px solid #f5d5a8", borderRadius:"10px", padding:"18px 20px", marginBottom:"20px" },
    invGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
    smallBtn: { padding:"5px 12px", borderRadius:"6px", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:"12px", fontWeight:"bold" },
    infoTab: (a) => ({ padding:"7px 16px", borderBottom: a?"3px solid #1a3d2b":"3px solid transparent", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", fontWeight:a?"bold":"normal", color:a?"#1a3d2b":"#888", background:"none", border:"none", borderBottom: a?"3px solid #1a3d2b":"3px solid transparent" }),
    stepBox: { background:"#f5f0e8", border:"1px solid #e0d8c8", borderRadius:"8px", padding:"14px 16px", marginBottom:"10px" },
    stepNum: { display:"inline-flex", width:"24px", height:"24px", borderRadius:"50%", background:"#1a3d2b", color:"#fff", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"bold", marginRight:"10px", flexShrink:0 },
    codeBox: { background:"#1a2e1a", color:"#7eff7e", fontFamily:"'Courier New',monospace", fontSize:"11px", padding:"12px 14px", borderRadius:"8px", overflowX:"auto", marginTop:"8px", marginBottom:"8px" },
  };

  const selectedItem = form.itemId ? getItem(form.itemId) : null;
  const totalCost = selectedItem && form.start && form.end && form.end >= form.start
    ? daysBetween(form.start, form.end) * selectedItem.rate : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      {/* OVERDUE ALERT BANNER */}
      {overdueItems.length > 0 && (
        <div style={S.overdueBanner}>
          <span style={{ fontSize:"18px" }}>🚨</span>
          <strong>{overdueItems.length} overdue rental{overdueItems.length > 1 ? "s" : ""}!</strong>
          <span style={{ fontSize:"13px", opacity: 0.9 }}>
            {overdueItems.slice(0,3).map(r => `${r.customer} (${getItem(r.itemId).name}, ${daysOverdue(r)}d late)`).join(" · ")}
            {overdueItems.length > 3 ? ` · +${overdueItems.length - 3} more` : ""}
          </span>
          <button
            onClick={() => { setView("list"); setShowOverdueOnly(true); }}
            style={{ marginLeft:"auto", background:"#fff", color:"#c0392b", border:"none", borderRadius:"16px", padding:"5px 14px", cursor:"pointer", fontFamily:"inherit", fontSize:"12px", fontWeight:"bold" }}>
            View All Overdue →
          </button>
        </div>
      )}

      {/* HEADER */}
      <div style={S.header}>
        <div>
          <div style={S.htitle}>🏕️ Rental Reservation Manager</div>
          <div style={S.hsub}>BIKES · PADDLEBOARDS · SNOW GEAR · CAMPING</div>
        </div>
        <div style={S.hright}>
          <div style={S.saveIndicator(saving)}>
            {saving ? "⏳ Saving..." : lastSaved ? `✓ Saved ${lastSaved}` : storageReady ? "✓ Ready" : "Loading..."}
          </div>
          <button style={S.infoBtn} onClick={() => setModal("info")}>🔗 Citrus-Lime</button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div style={S.toolbar}>
        <button style={S.tabBtn(view==="calendar")} onClick={() => { setView("calendar"); setShowOverdueOnly(false); }}>📅 Calendar</button>
        <button style={S.tabBtn(view==="list" && !showOverdueOnly)} onClick={() => { setView("list"); setShowOverdueOnly(false); }}>📋 List View</button>
        <button style={{ ...S.tabBtn(showOverdueOnly), background: showOverdueOnly ? "#c0392b" : "#fde8e8", color: showOverdueOnly ? "#fff" : "#c0392b", border: "2px solid #c0392b" }}
          onClick={() => { setView("list"); setShowOverdueOnly(true); }}>
          🚨 Overdue {overdueItems.length > 0 && <span style={{ background:"#fff", color:"#c0392b", borderRadius:"10px", padding:"1px 7px", marginLeft:"5px", fontSize:"11px", fontWeight:"bold" }}>{overdueItems.length}</span>}
        </button>
        <button style={S.tabBtn(view==="inventory")} onClick={() => { setView("inventory"); setShowOverdueOnly(false); }}>📦 Inventory</button>
        <button style={S.tabBtn(view==="settings")} onClick={() => { setView("settings"); setShowOverdueOnly(false); }}>⚙️ Settings</button>
        <div style={{ width:"1px", background:"#ddd", height:"22px", margin:"0 4px" }} />
        {view !== "inventory" && CATEGORIES.map(cat =>
          cat==="All"
            ? <button key="All" style={S.allBtn((view==="calendar"?calFilter:listFilter)==="All")} onClick={() => (view==="calendar"?setCalFilter:setListFilter)("All")}>All</button>
            : <button key={cat} style={S.catBtn((view==="calendar"?calFilter:listFilter)===cat, cat)} onClick={() => (view==="calendar"?setCalFilter:setListFilter)(cat)}>{CAT_COLORS[cat]?.emoji} {cat}</button>
        )}
        {view !== "inventory" && <input
          style={{ padding:"6px 12px", borderRadius:"16px", border:"1px solid #ccc", fontSize:"13px", fontFamily:"inherit", width:"170px", background:"#fdfaf6" }}
          placeholder="🔍 Search customer..."
          value={search} onChange={e => setSearch(e.target.value)}
        />}
        <button style={S.addBtn} onClick={() => { setForm({itemId:"",customer:"",phone:"",start:"",end:""}); setFormError(""); setConflictWarning([]); setForceBook(false); setModal("new"); }}>
          + New Reservation
        </button>
      </div>

      <div style={S.body}>

        {/* ── CALENDAR ── */}
        {view==="calendar" && <>
          <div style={S.calNav}>
            <button style={S.navBtn} onClick={prevMonth}>‹</button>
            <div style={S.calTitle}>{MONTH_NAMES[calMonth]} {calYear}</div>
            <button style={S.navBtn} onClick={nextMonth}>›</button>
            <button style={S.todayBtn} onClick={goToToday}>Today</button>
            <div style={S.legend}>
              {Object.entries(CAT_COLORS).map(([cat]) => (
                <span key={cat} style={S.legendItem(cat)}>
                  <span style={S.legendDot(cat)} />{cat}
                </span>
              ))}
            </div>
          </div>
          <div style={S.calGrid}>
            {DOWS.map(d => <div key={d} style={S.dow}>{d}</div>)}
            {Array.from({length:firstDow}).map((_,i) => <div key={"e"+i} />)}
            {days.map(day => {
              const items = filteredCal.filter(r => r.start<=day && r.end>=day);
              const isT = day===today;
              return (
                <div key={day} style={S.dayCell(items.length>0, isT, false)}
                  onClick={() => { if(items.length>0){ setSelectedDay({day,items}); setModal("day"); } }}
                  onMouseEnter={e => { if(items.length>0){ e.currentTarget.style.boxShadow="0 4px 14px #0002"; e.currentTarget.style.transform="translateY(-1px)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="none"; }}>
                  <div style={S.dayNum(isT, false)}>{parseInt(day.slice(8))}</div>
                  {items.slice(0,3).map(r => {
                    const item=getItem(r.itemId);
                    const over = isOverdue(r);
                    return <div key={r.id} style={over ? S.overdueChip : S.chip(item.category)}>
                      {over ? "⚠ " : ""}{calFilter==="All" ? item.name?.split(" ")[0] : r.customer.split(" ")[0]}
                    </div>;
                  })}
                  {items.length>3 && <div style={{ fontSize:"10px", color:"#aaa" }}>+{items.length-3} more</div>}
                </div>
              );
            })}
          </div>
        </>}

        {/* ── LIST / OVERDUE ── */}
        {view==="list" && <>
          {showOverdueOnly ? (
            <>
              <div style={{ marginBottom:"12px", display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ fontSize:"15px", fontWeight:"bold", color:"#c0392b" }}>🚨 Overdue Rentals</span>
                <span style={{ fontSize:"13px", color:"#999" }}>{overdueItems.length} item{overdueItems.length!==1?"s":""} not returned</span>
              </div>
              {overdueItems.length === 0 && <div style={{ color:"#27ae60", fontWeight:"bold", textAlign:"center", padding:"50px", fontSize:"16px" }}>✓ All clear — no overdue rentals!</div>}
              {overdueItems.map(r => {
                const item=getItem(r.itemId); const d=daysOverdue(r);
                return (
                  <div key={r.id} style={S.overdueCard}
                    onClick={() => { setSelectedRes(r); setModal("detail"); }}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 5px 18px #c0392b22";}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"6px" }}>
                      <div>
                        <span style={{ fontWeight:"bold", fontSize:"15px", color:"#c0392b" }}>{r.customer}</span>
                        <span style={S.overdueBadge}>⚠ {d} day{d!==1?"s":""} overdue</span>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:"bold", color:"#c0392b", fontSize:"15px" }}>${daysBetween(r.start,r.end)*item.rate}</div>
                        <div style={{ fontSize:"11px", color:"#bbb" }}>was due {fmtDate(r.end)}</div>
                      </div>
                    </div>
                    <div style={{ marginTop:"6px", fontSize:"13px", color:"#666" }}>
                      <span style={{ marginRight:"16px" }}>{CAT_COLORS[item.category]?.emoji} {item.name}</span>
                      <span>📅 Checked out {fmtShort(r.start)}, due back {fmtShort(r.end)}</span>
                    </div>
                    <div style={{ fontSize:"12px", color:"#bbb", marginTop:"3px" }}>📞 {r.phone||"—"} · {r.id}{r.unitId ? ` · Unit: ${r.unitId}` : ""}</div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <div style={{ marginBottom:"12px", fontSize:"13px", color:"#999" }}>{filteredList.length} reservation{filteredList.length!==1?"s":""}</div>
              {filteredList.length===0 && <div style={{ color:"#bbb", fontStyle:"italic", textAlign:"center", padding:"50px" }}>No reservations found.</div>}
              {filteredList.map(r => {
                const item=getItem(r.itemId);
                const d=daysBetween(r.start,r.end);
                const over=isOverdue(r);
                const isActive=r.start<=today && r.end>=today && !over;
                const isReturned=r.status==="returned";
                return (
                  <div key={r.id} style={over ? S.overdueCard : S.card(item.category)}
                    onClick={() => { setSelectedRes(r); setModal("detail"); }}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 5px 18px #0002";e.currentTarget.style.transform="translateY(-1px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"6px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap" }}>
                        <span style={{ fontWeight:"bold", fontSize:"15px", color: over?"#c0392b":"#1a3d2b" }}>{r.customer}</span>
                        {over
                          ? <span style={S.overdueBadge}>⚠ {daysOverdue(r)}d overdue</span>
                          : <span style={S.badge(item.category)}>{CAT_COLORS[item.category]?.emoji} {item.category}</span>
                        }
                        {isActive && r.status !== "pickedup" && r.status !== "returned" && <span style={{ fontSize:"11px", background:"#d4f0e0", color:"#1a6b3c", fontWeight:"bold", borderRadius:"8px", padding:"2px 8px" }}>● ACTIVE</span>}
                        {r.status === "pickedup" && <span style={S.pickedUpBadge}>✓ PICKED UP</span>}
                        {r.paymentStatus === "paid" && <span style={S.paidBadge}>💳 {r.paymentMethod === "citruslime" ? "PAID via CL" : "PAID"}</span>}
                        {r.signedBy && <span style={S.signedBadge}>✍️ SIGNED</span>}
                        {isReturned && <span style={S.returnedBadge}>✓ RETURNED</span>}
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:"bold", color: over?"#c0392b":"#8b4513", fontSize:"16px" }}>${d*item.rate}</div>
                        <div style={{ fontSize:"11px", color:"#bbb" }}>{d} day{d!==1?"s":""} × ${item.rate}</div>
                      </div>
                    </div>
                    <div style={{ marginTop:"6px", fontSize:"13px", color:"#666" }}>
                      <span style={{ marginRight:"16px" }}>{CAT_COLORS[item.category]?.emoji} {item.name}</span>
                      <span>📅 {fmtShort(r.start)} → {fmtShort(r.end)}</span>
                    </div>
                    <div style={{ fontSize:"12px", color:"#bbb", marginTop:"3px" }}>📞 {r.phone||"—"} · {r.id}{r.unitId ? ` · Unit: ${r.unitId}` : ""}</div>
                  </div>
                );
              })}
            </>
          )}
        </>}

        {/* ── INVENTORY MANAGER ── */}
        {view==="inventory" && (()=>{
          const invCats = ["All", ...Object.keys(CAT_COLORS)];
          const visibleInv = invCatFilter === "All" ? inventory : inventory.filter(i => i.category === invCatFilter);
          return (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"18px", flexWrap:"wrap" }}>
                <span style={{ fontSize:"17px", fontWeight:"bold", color:"#1a3d2b", fontStyle:"italic" }}>📦 Rental Inventory</span>
                <span style={{ fontSize:"13px", color:"#999" }}>{inventory.length} items across {[...new Set(inventory.map(i=>i.category))].length} categories</span>
                <div style={{ marginLeft:"auto", display:"flex", gap:"6px", flexWrap:"wrap" }}>
                  {invCats.map(cat =>
                    cat==="All"
                      ? <button key="All" style={S.allBtn(invCatFilter==="All")} onClick={()=>setInvCatFilter("All")}>All</button>
                      : <button key={cat} style={S.catBtn(invCatFilter===cat, cat)} onClick={()=>setInvCatFilter(cat)}>{CAT_COLORS[cat]?.emoji} {cat}</button>
                  )}
                </div>
              </div>

              {/* ADD / EDIT FORM */}
              <div style={editingInvId ? S.invEditBox : S.invFormBox}>
                <div style={{ fontWeight:"bold", color: editingInvId?"#8b4513":"#1a3d2b", fontSize:"14px", marginBottom:"12px" }}>
                  {editingInvId ? "✏️ Edit Item" : "➕ Add New Item"}
                </div>
                <div style={S.invGrid}>
                  <div>
                    <label style={S.lbl}>Item Name *</label>
                    <input style={S.inp} placeholder="e.g. Mountain Bike (Med)" value={invForm.name} onChange={e=>setInvForm({...invForm,name:e.target.value})} />
                  </div>
                  <div>
                    <label style={S.lbl}>Category *</label>
                    <select style={S.sel} value={invForm.category} onChange={e=>setInvForm({...invForm,category:e.target.value})}>
                      {Object.keys(CAT_COLORS).map(c=><option key={c} value={c}>{CAT_COLORS[c].emoji} {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.lbl}>Daily Rate ($) *</label>
                    <input style={S.inp} placeholder="e.g. 35" type="number" min="0" value={invForm.rate} onChange={e=>setInvForm({...invForm,rate:e.target.value})} />
                  </div>
                  <div>
                    <label style={S.lbl}>Quantity (# of units) *</label>
                    <input style={S.inp} placeholder="e.g. 4" type="number" min="1" value={invForm.qty} onChange={e=>setInvForm({...invForm,qty:e.target.value})} />
                  </div>
                </div>
                <div style={{ marginTop:"10px" }}>
                  <label style={S.lbl}>Notes (optional)</label>
                  <input style={S.inp} placeholder="e.g. Includes helmet, charge after each use…" value={invForm.notes} onChange={e=>setInvForm({...invForm,notes:e.target.value})} />
                </div>
                {invFormError && <div style={{ color:"#c0392b", fontSize:"12px", marginTop:"8px", background:"#fde8e8", padding:"7px 10px", borderRadius:"6px" }}>{invFormError}</div>}
                <div style={{ display:"flex", gap:"10px", marginTop:"14px" }}>
                  <button style={S.saveBtn} onClick={saveInvItem}>{editingInvId ? "💾 Save Changes" : "➕ Add to Inventory"}</button>
                  {editingInvId && <button style={S.cancelBtn} onClick={cancelEditInv}>Cancel</button>}
                </div>
              </div>

              {/* INVENTORY TABLE */}
              {visibleInv.length === 0
                ? <div style={{ color:"#bbb", fontStyle:"italic", textAlign:"center", padding:"40px" }}>No items in this category yet. Add one above!</div>
                : <table style={S.invTable}>
                    <thead>
                      <tr>
                        {["","Category","Item Name","Daily Rate","Units","Notes","Actions"].map(h=>(
                          <th key={h} style={S.invTh}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleInv.map((item, i) => {
                        const activeCount = reservations.filter(r => r.itemId===item.id && r.status!=="returned").length;
                        const needsRepair = (item.units||[]).filter(u=>u.condition==="Needs Repair").length;
                        const isEditing = editingInvId === item.id;
                        const isExpanded = expandedItemId === item.id;
                        return (
                          <>
                            <tr key={item.id} style={{ background: isEditing?"#fff8f0": i%2===0?"#fff":"#faf8f4" }}>
                              <td style={{ ...S.invTd, width:"30px" }}>
                                <button onClick={()=>setExpandedItemId(isExpanded?null:item.id)}
                                  style={{ background:"none", border:"none", cursor:"pointer", fontSize:"14px", color:"#1a3d2b" }}>
                                  {isExpanded ? "▾" : "▸"}
                                </button>
                              </td>
                              <td style={S.invTd}>
                                <span style={{ ...S.badge(item.category), marginLeft:0, fontSize:"10px" }}>{CAT_COLORS[item.category]?.emoji} {item.category}</span>
                              </td>
                              <td style={{ ...S.invTd, fontWeight:"bold", color:"#1a3d2b" }}>{item.name}</td>
                              <td style={{ ...S.invTd, color:"#8b4513", fontWeight:"bold" }}>${item.rate}/day</td>
                              <td style={S.invTd}>
                                <span style={{ fontWeight:"bold" }}>{item.qty}</span>
                                {activeCount > 0 && <span style={{ fontSize:"11px", color:"#0d6096", marginLeft:"5px" }}>({activeCount} out)</span>}
                                {needsRepair > 0 && <span style={{ fontSize:"11px", color:"#c0392b", marginLeft:"5px" }}>⚠ {needsRepair} repair</span>}
                              </td>
                              <td style={{ ...S.invTd, color:"#888", fontSize:"12px", fontStyle: item.notes?"normal":"italic" }}>{item.notes || "—"}</td>
                              <td style={S.invTd}>
                                <div style={{ display:"flex", gap:"6px" }}>
                                  <button style={{ ...S.smallBtn, background:"#e8f4fd", color:"#0d6096" }} onClick={()=>startEditInv(item)}>✏️ Edit</button>
                                  <button style={{ ...S.smallBtn, background:"#fde8e8", color:"#c0392b" }} onClick={()=>deleteInvItem(item.id)}>🗑</button>
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (item.units||[]).map(u => {
                              const condColor = {Excellent:"#1a6b3c",Good:"#2e7d32",Fair:"#e67e22","Needs Repair":"#c0392b",Retired:"#aaa"}[u.condition]||"#555";
                              const isEditU = editingUnit?.uid === u.uid;
                              const unitRes = reservations.filter(r => r.itemId===item.id && r.unitId===u.uid && r.status!=="returned");
                              return (
                                <tr key={u.uid} style={{ background:"#f5f8ff" }}>
                                  <td style={{ ...S.invTd, paddingLeft:"36px", color:"#aaa", fontSize:"10px", fontFamily:"monospace" }}>{u.uid}</td>
                                  <td colSpan={2} style={{ ...S.invTd }}>
                                    {isEditU ? (
                                      <input autoFocus style={{ ...S.inp, padding:"4px 8px", fontSize:"12px", width:"140px" }}
                                        value={editingUnit.label}
                                        onChange={e=>setEditingUnit({...editingUnit,label:e.target.value})} />
                                    ) : (
                                      <span style={{ fontSize:"13px", color:"#444" }}>{u.label}</span>
                                    )}
                                    {unitRes.length > 0 && <span style={{ fontSize:"11px", color:"#0d6096", marginLeft:"8px" }}>● Out with {unitRes[0].customer}</span>}
                                  </td>
                                  <td style={S.invTd}>
                                    {isEditU ? (
                                      <select style={{ ...S.sel, padding:"4px 8px", fontSize:"12px", width:"140px" }}
                                        value={editingUnit.condition}
                                        onChange={e=>setEditingUnit({...editingUnit,condition:e.target.value})}>
                                        {CONDITIONS.map(c=><option key={c}>{c}</option>)}
                                      </select>
                                    ) : (
                                      <span style={{ fontSize:"12px", fontWeight:"bold", color:condColor }}>{u.condition}</span>
                                    )}
                                  </td>
                                  <td colSpan={2} style={S.invTd}>
                                    {isEditU ? (
                                      <input style={{ ...S.inp, padding:"4px 8px", fontSize:"12px" }}
                                        placeholder="Notes…"
                                        value={editingUnit.notes}
                                        onChange={e=>setEditingUnit({...editingUnit,notes:e.target.value})} />
                                    ) : (
                                      <span style={{ fontSize:"12px", color:"#888", fontStyle:u.notes?"normal":"italic" }}>{u.notes||"—"}</span>
                                    )}
                                  </td>
                                  <td style={S.invTd}>
                                    {isEditU ? (
                                      <div style={{ display:"flex", gap:"5px" }}>
                                        <button style={{ ...S.smallBtn, background:"#1a3d2b", color:"#fff" }}
                                          onClick={()=>{ updateUnit(item.id, u.uid, {label:editingUnit.label,condition:editingUnit.condition,notes:editingUnit.notes}); setEditingUnit(null); }}>
                                          Save
                                        </button>
                                        <button style={{ ...S.smallBtn, background:"#eee", color:"#555" }} onClick={()=>setEditingUnit(null)}>✕</button>
                                      </div>
                                    ) : (
                                      <button style={{ ...S.smallBtn, background:"#e8f4fd", color:"#0d6096" }}
                                        onClick={()=>setEditingUnit({itemId:item.id, uid:u.uid, label:u.label, condition:u.condition, notes:u.notes||""})}>
                                        ✏️ Edit
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
              }
            </div>
          );
        })()}

        {/* ── SETTINGS ── */}
        {view==="settings" && (
          <div>
            <div style={{ fontSize:"17px", fontWeight:"bold", color:"#1a3d2b", fontStyle:"italic", marginBottom:"20px" }}>⚙️ Settings</div>

            {/* CONTRACT EDITOR */}
            <div style={{ background:"#fff", border:"1px solid #e0d8c8", borderRadius:"12px", padding:"22px 24px", marginBottom:"20px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px", flexWrap:"wrap", gap:"10px" }}>
                <div>
                  <div style={{ fontWeight:"bold", fontSize:"15px", color:"#1a3d2b" }}>📄 Rental Agreement Template</div>
                  <div style={{ fontSize:"12px", color:"#888", marginTop:"3px" }}>This contract is shown to customers at pickup for their signature. Customize it with your shop name, address, and terms.</div>
                </div>
                {editingContract
                  ? <div style={{ display:"flex", gap:"8px" }}>
                      <button style={S.saveBtn} onClick={()=>{ updateContract(editingContract); setEditingContract(""); }}>💾 Save Contract</button>
                      <button style={S.cancelBtn} onClick={()=>setEditingContract("")}>Cancel</button>
                    </div>
                  : <div style={{ display:"flex", gap:"8px" }}>
                      <button style={{ ...S.smallBtn, background:"#e8f4fd", color:"#0d6096", padding:"8px 16px", fontSize:"13px" }} onClick={()=>setEditingContract(contract)}>✏️ Edit Contract</button>
                      <button style={{ ...S.smallBtn, background:"#fde8e8", color:"#c0392b", padding:"8px 16px", fontSize:"13px" }} onClick={()=>{ if(window.confirm("Reset to default template?")) updateContract(DEFAULT_CONTRACT); }}>↺ Reset to Default</button>
                    </div>
                }
              </div>

              {editingContract ? (
                <div>
                  <div style={{ fontSize:"12px", color:"#888", marginBottom:"8px", fontStyle:"italic" }}>
                    Replace [YOUR SHOP NAME], [Address], [Phone], [Email], and [YOUR STATE] with your actual details. You can also rewrite any section.
                  </div>
                  <textarea style={S.contractEditorBox} value={editingContract} onChange={e=>setEditingContract(e.target.value)} />
                </div>
              ) : (
                <div style={S.contractBox}>{contract}</div>
              )}
            </div>

            {/* ESIG NOTE */}
            <div style={{ background:"#f0f9f3", border:"1px solid #b8e0c8", borderRadius:"10px", padding:"16px 20px" }}>
              <div style={{ fontWeight:"bold", color:"#1a3d2b", fontSize:"14px", marginBottom:"8px" }}>🔏 About Digital Signatures</div>
              <p style={{ fontSize:"13px", color:"#444", lineHeight:"1.7", margin:"0 0 10px" }}>
                This system uses a <strong>typed acknowledgment signature</strong> — the customer types their full name to confirm they have read and agree to the rental terms. The signed name, timestamp, and contract text are all saved with the reservation record.
              </p>
              <p style={{ fontSize:"13px", color:"#444", lineHeight:"1.7", margin:"0 0 10px" }}>
                For most rental shops this is a practical and commonly accepted method. If you need legally verified e-signatures (e.g. for high-value equipment or legal jurisdiction requirements), tools like <strong>DocuSign</strong> or <strong>HelloSign</strong> can be connected via API in a future integration.
              </p>
              <div style={{ fontSize:"12px", color:"#888", fontStyle:"italic" }}>Tip: Print or export signed records periodically for your own backup files.</div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: NEW RESERVATION ── */}
      {modal==="new" && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={S.mtitle}>+ New Reservation</div>

            <label style={S.lbl}>Item *</label>
            <select style={S.sel} value={form.itemId} onChange={e=>setForm({...form,itemId:e.target.value})}>
              <option value="">— Select an item —</option>
              {Object.keys(CAT_COLORS).map(cat=>(
                <optgroup key={cat} label={`${CAT_COLORS[cat]?.emoji} ${cat}`}>
                  {inventory.filter(i=>i.category===cat).map(i=>(
                    <option key={i.id} value={i.id}>{i.name} — ${i.rate}/day (qty: {i.qty})</option>
                  ))}
                </optgroup>
              ))}
            </select>

            {form.itemId && (() => {
              const selItem = getItem(form.itemId);
              const units = selItem.units || [];
              // Find which units are available (not booked on overlapping dates)
              const availableUnits = units.filter(u => {
                if (!form.start || !form.end) return true;
                const conflict = reservations.some(r =>
                  r.itemId === form.itemId && r.unitId === u.uid &&
                  r.start <= form.end && r.end >= form.start &&
                  r.status !== "returned"
                );
                return !conflict;
              });
              return units.length > 0 ? (
                <div>
                  <label style={S.lbl}>Specific Unit (optional — assign a unit ID)</label>
                  <select style={S.sel} value={form.unitId} onChange={e=>setForm({...form,unitId:e.target.value})}>
                    <option value="">— Any available unit —</option>
                    {units.map(u => {
                      const isAvail = availableUnits.some(a => a.uid === u.uid);
                      return (
                        <option key={u.uid} value={u.uid} disabled={!isAvail && u.condition!=="Needs Repair"}>
                          {u.uid} · {u.label} · {u.condition}{!isAvail ? " (unavailable)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {form.unitId && (() => {
                    const u = units.find(u=>u.uid===form.unitId);
                    return u?.notes ? <div style={{ fontSize:"12px", color:"#888", marginTop:"4px", fontStyle:"italic" }}>📝 {u.notes}</div> : null;
                  })()}
                </div>
              ) : null;
            })()}
            <input style={S.inp} placeholder="Full name" value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})} />

            <label style={S.lbl}>Phone</label>
            <input style={S.inp} placeholder="555-0000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div>
                <label style={S.lbl}>Pickup Date *</label>
                <input type="date" style={S.inp} value={form.start} onChange={e=>setForm({...form,start:e.target.value})} />
              </div>
              <div>
                <label style={S.lbl}>Return Date *</label>
                <input type="date" style={S.inp} value={form.end} onChange={e=>setForm({...form,end:e.target.value})} />
              </div>
            </div>

            {totalCost !== null && (
              <div style={{ marginTop:"12px", background:"#f0f9f3", borderRadius:"7px", padding:"10px 14px", fontSize:"13px", color:"#1a3d2b", border:"1px solid #b8e0c8" }}>
                💰 Estimated total: <strong>${totalCost}</strong> · {daysBetween(form.start,form.end)} day{daysBetween(form.start,form.end)!==1?"s":""} × ${selectedItem?.rate}/day
              </div>
            )}

            {/* CONFLICT WARNING */}
            {conflictWarning.length > 0 && (
              <div style={S.conflictBox}>
                <div style={S.conflictTitle}>⚠️ Double-Booking Conflict Detected</div>
                <div style={{ marginBottom:"8px" }}>
                  <strong>{getItem(form.itemId).name}</strong> is fully booked (all {getItem(form.itemId).qty} units out) on:
                </div>
                {conflictWarning.slice(0,5).map(c => (
                  <div key={c.day} style={{ marginBottom:"4px", fontSize:"12px" }}>
                    📅 <strong>{fmtDate(c.day)}</strong> — booked by: {c.who.map(w=>w.customer).join(", ")}
                  </div>
                ))}
                {conflictWarning.length > 5 && <div style={{ fontSize:"12px", color:"#a07020" }}>...and {conflictWarning.length-5} more days</div>}
                <label style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"10px", cursor:"pointer", fontSize:"13px", fontWeight:"bold" }}>
                  <input type="checkbox" checked={forceBook} onChange={e=>setForceBook(e.target.checked)} />
                  Book anyway (override — use only if you have extra units available)
                </label>
              </div>
            )}

            {formError && <div style={{ color:"#c0392b", fontSize:"13px", marginTop:"10px", background:"#fde8e8", padding:"8px 12px", borderRadius:"6px" }}>{formError}</div>}

            <div style={S.btnRow}>
              <button style={S.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
              <button style={S.saveBtn} onClick={addReservation}>Save Reservation</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DAY DETAIL ── */}
      {modal==="day" && selectedDay && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={S.mtitle}>
              📅 {toDate(selectedDay.day).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
            </div>
            {selectedDay.items.map(r => {
              const item=getItem(r.itemId);
              const c=CAT_COLORS[item.category]||{};
              const d=daysBetween(r.start,r.end);
              return (
                <div key={r.id} style={{ borderLeft:`4px solid ${c.bg||"#aaa"}`, background:c.light||"#f9f9f9", borderRadius:"7px", padding:"12px 16px", marginBottom:"10px" }}>
                  <div style={{ fontWeight:"bold", color:"#1a3d2b", fontSize:"14px" }}>{r.customer}</div>
                  <div style={{ fontSize:"13px", color:"#555", marginTop:"2px" }}>{c.emoji} {item.name} · {fmtShort(r.start)} – {fmtShort(r.end)}</div>
                  <div style={{ fontSize:"12px", color:"#999", marginTop:"2px" }}>{d} days · ${d*(item.rate||0)} · {r.phone||"—"}</div>
                  <div style={{ display:"flex", gap:"8px", marginTop:"8px" }}>
                    <button onClick={()=>deleteRes(r.id)} style={{ ...S.delBtn, padding:"4px 12px", fontSize:"11px" }}>Remove</button>
                  </div>
                </div>
              );
            })}
            <div style={S.btnRow}><button style={S.cancelBtn} onClick={()=>setModal(null)}>Close</button></div>
          </div>
        </div>
      )}

      {/* ── MODAL: RESERVATION DETAIL ── */}
      {modal==="detail" && selectedRes && (
        <div style={S.overlay} onClick={()=>setModal(null)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={S.mtitle}>Reservation · {selectedRes.id}</div>
            {(() => {
              const r=selectedRes; const item=getItem(r.itemId); const d=daysBetween(r.start,r.end);
              const over=isOverdue(r);
              const isPickedUp = r.status === "pickedup" || r.status === "returned";
              const isReturned = r.status === "returned";
              const isPaid = r.paymentStatus === "paid";

              // Status step: 0=reserved, 1=pickedup+paid, 2=returned
              const step = isReturned ? 2 : isPickedUp ? 1 : 0;

              return <>
                {/* STATUS TRACKER */}
                <div style={S.statusTrack}>
                  {[["📋 Reserved","0"], ["✓ Picked Up & Paid","1"], ["✓ Returned","2"]].map(([label, s], i) => (
                    <div key={i} style={{ ...S.statusStep(step===i, step>i), borderRadius: i===0?"8px 0 0 8px": i===2?"0 8px 8px 0":"0", borderRight: i<2?"1px solid #fff3":"none" }}>
                      {label}
                    </div>
                  ))}
                </div>

                {over && <div style={{ background:"#fde8e8", border:"2px solid #c0392b", borderRadius:"8px", padding:"10px 14px", marginBottom:"12px", color:"#c0392b", fontWeight:"bold", fontSize:"13px" }}>
                  🚨 Overdue by {daysOverdue(r)} day{daysOverdue(r)!==1?"s":""} — was due back {fmtDate(r.end)}
                </div>}

                <div style={S.dr}><span style={S.dlbl}>Customer</span><span>{r.customer}</span></div>
                <div style={S.dr}><span style={S.dlbl}>Phone</span><span>{r.phone||"—"}</span></div>
                <div style={S.dr}><span style={S.dlbl}>Item</span><span>{CAT_COLORS[item.category]?.emoji} {item.name}</span></div>
                {r.unitId && <div style={S.dr}><span style={S.dlbl}>Unit ID</span><span style={{ fontFamily:"monospace", fontWeight:"bold", color:"#0d6096" }}>{r.unitId} · {getUnitLabel(r.itemId, r.unitId)?.split(" (")[0]}</span></div>}
                <div style={S.dr}><span style={S.dlbl}>Pickup Date</span><span>{fmtDate(r.start)}</span></div>
                <div style={S.dr}><span style={S.dlbl}>Return Due</span><span style={{ color: over?"#c0392b":"inherit", fontWeight: over?"bold":"normal" }}>{fmtDate(r.end)}</span></div>
                <div style={S.dr}><span style={S.dlbl}>Days</span><span>{d}</span></div>
                <div style={S.dr}><span style={S.dlbl}>Total</span><span style={{ fontWeight:"bold", color:"#8b4513", fontSize:"15px" }}>${d*(item.rate||0)}</span></div>

                {/* PAYMENT STATUS ROW */}
                <div style={{ ...S.dr }}>
                  <span style={S.dlbl}>Payment</span>
                  <span>
                    {isPaid
                      ? <span style={{ color:"#0d6096", fontWeight:"bold" }}>💳 Paid {r.paymentMethod==="citruslime" ? "· via Citrus-Lime ✓" : r.paymentMethod==="manual" ? "· Recorded manually" : `· ${r.paymentMethod}`}</span>
                      : <span style={{ color:"#c0392b", fontWeight:"bold" }}>⚠ Not yet recorded</span>
                    }
                  </span>
                </div>

                {isPickedUp && (
                  <div style={{ ...S.dr, borderBottom:"none" }}>
                    <span style={S.dlbl}>Checked Out</span>
                    <span style={{ color:"#1a6b3c", fontSize:"13px" }}>{r.pickedUpAt || "—"}</span>
                  </div>
                )}

                {/* ACTION AREA */}
                <div style={{ marginTop:"16px", borderTop:"1px solid #f0ece4", paddingTop:"14px" }}>

                  {/* STEP 1: Sign contract + confirm payment */}
                  {!isPickedUp && (
                    <div style={{ background:"#f0f9f3", border:"1px solid #b8e0c8", borderRadius:"8px", padding:"14px 16px", marginBottom:"12px" }}>
                      <div style={{ fontWeight:"bold", color:"#1a3d2b", fontSize:"13px", marginBottom:"10px" }}>📄 Rental Agreement & Checkout</div>

                      <button onClick={()=>setShowContract(s=>!s)} style={{ background:"none", border:"1px solid #b8e0c8", borderRadius:"6px", padding:"5px 12px", cursor:"pointer", fontSize:"12px", color:"#1a3d2b", marginBottom:"8px", fontFamily:"inherit" }}>
                        {showContract ? "▾ Hide rental agreement" : "▸ Read rental agreement"}
                      </button>
                      {showContract && (
                        <div style={{ ...S.contractBox, maxHeight:"160px", marginBottom:"12px", fontSize:"11.5px" }}>
                          {contract}
                        </div>
                      )}

                      <label style={{ ...S.lbl, marginTop:"4px", color:"#1a3d2b" }}>Customer Signature — type full name to agree *</label>
                      <input
                        style={S.signInput}
                        placeholder="Customer types full name here…"
                        value={signatureName}
                        onChange={e=>{ setSignatureName(e.target.value); setSignatureError(""); }}
                      />
                      {signatureError && <div style={{ color:"#c0392b", fontSize:"12px", marginTop:"6px" }}>{signatureError}</div>}
                      <div style={{ fontSize:"11px", color:"#888", marginTop:"5px", marginBottom:"12px", fontStyle:"italic" }}>
                        By typing their name, the customer confirms they have read and agree to all rental terms.
                      </div>

                      <label style={S.lbl}>Payment Method</label>
                      <select style={{ ...S.sel, marginBottom:"6px" }} value={pickupPayMethod} onChange={e=>setPickupPayMethod(e.target.value)}>
                        <option value="manual">Recorded manually</option>
                        <option value="citruslime">Citrus-Lime POS</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card (other terminal)</option>
                      </select>
                      {pickupPayMethod==="citruslime" && <div style={{ fontSize:"11px", color:"#8b4513", marginBottom:"8px", fontStyle:"italic" }}>⚠ Also record this in Citrus-Lime manually. When the API is connected, this will sync automatically.</div>}

                      <button style={{ ...S.pickupBtn, marginTop:"8px", width:"100%" }} onClick={()=>{
                        if (!signatureName.trim()) { setSignatureError("Customer must type their full name to sign."); return; }
                        if (signatureName.trim().split(" ").length < 2) { setSignatureError("Please enter first and last name."); return; }
                        signContract(r.id, signatureName.trim(), pickupPayMethod);
                      }}>
                        ✍️ Sign & Confirm Pickup
                      </button>
                    </div>
                  )}

                  {/* Signed confirmation */}
                  {isPickedUp && r.signedBy && (
                    <div style={{ background:"#f0f9f3", border:"1px solid #b8e0c8", borderRadius:"8px", padding:"10px 14px", marginBottom:"12px", fontSize:"13px" }}>
                      <div style={{ fontWeight:"bold", color:"#1a3d2b", marginBottom:"4px" }}>✍️ Contract Signed</div>
                      <div style={{ color:"#444" }}>Signed by: <strong style={{ fontStyle:"italic", fontSize:"15px" }}>{r.signedBy}</strong></div>
                      <div style={{ color:"#888", fontSize:"12px", marginTop:"2px" }}>at {r.signedAt}</div>
                      <button style={{ ...S.smallBtn, background:"#e8f4fd", color:"#0d6096", marginTop:"8px", padding:"5px 14px" }}
                        onClick={()=>setModal("viewsigned")}>
                        📄 View Signed Contract
                      </button>
                    </div>
                  )}

                  {/* Picked up but no signature (legacy records) */}
                  {isPickedUp && !r.signedBy && (
                    <div style={{ background:"#fff8f0", border:"1px solid #f5d5a8", borderRadius:"8px", padding:"10px 14px", marginBottom:"12px", fontSize:"13px", color:"#8b4513" }}>
                      ⚠ Picked up without a recorded signature (older record).
                    </div>
                  )}

                  {/* STEP 2: Mark returned */}
                  {isPickedUp && !isReturned && (
                    <div style={{ background:"#f0f7ff", border:"1px solid #b8d4f0", borderRadius:"8px", padding:"12px 14px", marginBottom:"12px" }}>
                      <div style={{ fontWeight:"bold", color:"#0d6096", fontSize:"13px", marginBottom:"8px" }}>🔄 Gear Return</div>
                      <div style={{ fontSize:"12px", color:"#555", marginBottom:"10px" }}>Confirm the customer has returned all gear in acceptable condition.</div>
                      <button style={S.markReturnBtn} onClick={()=>markReturned(r.id)}>✓ Mark as Returned</button>
                    </div>
                  )}

                  {isReturned && (
                    <div style={{ background:"#d4f0e0", border:"1px solid #a0d8b8", borderRadius:"8px", padding:"10px 14px", color:"#1a6b3c", fontWeight:"bold", fontSize:"13px" }}>
                      ✓ Complete — gear returned, payment recorded.
                    </div>
                  )}
                </div>

                <div style={{ ...S.btnRow, justifyContent:"space-between", marginTop:"12px" }}>
                  <button style={S.delBtn} onClick={()=>deleteRes(r.id)}>Delete</button>
                  <button style={S.cancelBtn} onClick={()=>setModal(null)}>Close</button>
                </div>
              </>;
            })()}
          </div>
        </div>
      )}

      {/* ── MODAL: CITRUS-LIME INFO ── */}
      {modal==="info" && (
        <div style={S.overlay} onClick={()=>setModal(null)}>
          <div style={S.wideModal} onClick={e=>e.stopPropagation()}>
            <div style={S.mtitle}>🔗 Connecting to Citrus-Lime</div>
            <div style={{ display:"flex", gap:"0", borderBottom:"2px solid #e0d8c8", marginBottom:"18px" }}>
              <button style={S.infoTab(tab==="citruslime")} onClick={()=>setTab("citruslime")}>How It Works</button>
              <button style={S.infoTab(tab==="steps")} onClick={()=>setTab("steps")}>Setup Steps</button>
              <button style={S.infoTab(tab==="api")} onClick={()=>setTab("api")}>API Example</button>
            </div>

            {tab==="citruslime" && (
              <div style={{ fontSize:"14px", color:"#444", lineHeight:"1.7" }}>
                <p><strong>Good news:</strong> Citrus-Lime has a real REST API that is free to use and well-documented.</p>
                <p>Here is how this rental tracker could connect to it:</p>
                <div style={S.stepBox}>
                  <strong>💳 Payment Flow</strong><br/>
                  When a customer picks up gear, your staff creates the rental here, then opens a transaction in Citrus-Lime manually (or via API) using the reservation details — item, customer, total. Citrus-Lime handles the payment.
                </div>
                <div style={S.stepBox}>
                  <strong>📦 What Citrus-Lime's API Can Do</strong><br/>
                  Pull transaction history · Create customer orders · Look up inventory items · Post transactions · Export sales data
                </div>
                <div style={S.stepBox}>
                  <strong>⚠️ What It Cannot Do (yet)</strong><br/>
                  Citrus-Lime's API does not natively support rental reservations or date-based availability — that is exactly what this tracker fills in. The two systems work best side-by-side: this app manages <em>who has what and when</em>, Citrus-Lime manages <em>payments</em>.
                </div>
                <div style={{ background:"#f0f9f3", border:"1px solid #b8e0c8", borderRadius:"8px", padding:"12px 16px", marginTop:"8px", fontSize:"13px", color:"#1a3d2b" }}>
                  💡 <strong>Tip:</strong> This is exactly how BRM + Citrus-Lime works — BRM handles reservations, Citrus-Lime handles payments. This app is a simpler, free version of that same workflow.
                </div>
              </div>
            )}

            {tab==="steps" && (
              <div style={{ fontSize:"14px", color:"#444", lineHeight:"1.7" }}>
                <p>To connect this app to Citrus-Lime, a developer would follow these steps:</p>
                {[
                  ["Get your API key", "In Citrus-Lime, go to Settings → API. Generate a key and copy it. Keep it secret — it gives full access to your POS data."],
                  ["Find your item lookup codes", "In Citrus-Lime, each rental item you created has a lookup code. You'll use these codes when posting transactions via the API."],
                  ["Post a transaction when rental starts", "When a customer checks out gear, send a POST request to the Citrus-Lime transactions endpoint with the item code, price, and customer details."],
                  ["Pull transaction history for reconciliation", "Use the Data Export API (intelligence.citruslime.com) to pull completed transactions and match them back to reservations in this tracker."],
                  ["Optional: automate with a webhook or scheduled sync", "Set up a daily sync that marks reservations as 'paid' once a matching Citrus-Lime transaction is found."],
                ].map(([title, desc], i) => (
                  <div key={i} style={{ ...S.stepBox, display:"flex", gap:"12px", alignItems:"flex-start" }}>
                    <span style={S.stepNum}>{i+1}</span>
                    <div><strong>{title}</strong><br/><span style={{ color:"#666", fontSize:"13px" }}>{desc}</span></div>
                  </div>
                ))}
              </div>
            )}

            {tab==="api" && (
              <div style={{ fontSize:"13px", color:"#444", lineHeight:"1.7" }}>
                <p>Here is an example of what a developer would write to push a rental payment to Citrus-Lime:</p>
                <div style={S.codeBox}>{`// Post a rental transaction to Citrus-Lime
const response = await fetch(
  'https://cloudposapi.citruslime.com/api/Transaction',
  {
    method: 'POST',
    headers: {
      'Authorization': 'YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      LookupCode: 'BK-001',       // your item code in Citrus-Lime
      CustomerName: 'Sarah Johnson',
      Quantity: 1,
      UnitPrice: 105.00,          // 3 days × $35
      Notes: 'Rental R-001 · Mar 7–10'
    })
  }
);`}</div>
                <div style={S.codeBox}>{`// Pull recent transactions (Data Export API)
const txns = await fetch(
  'https://intelligence.citruslime.com/BI/Transaction.aspx',
  { headers: { 'Authorization': 'YOUR_API_KEY' } }
);`}</div>
                <p style={{ fontSize:"12px", color:"#999", fontStyle:"italic" }}>Note: exact endpoint parameters depend on your Citrus-Lime plan and API version. Full docs at cloudposapi.citruslime.com</p>
              </div>
            )}

            <div style={S.btnRow}><button style={S.cancelBtn} onClick={()=>setModal(null)}>Close</button></div>
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW SIGNED CONTRACT ── */}
      {modal==="viewsigned" && selectedRes && (
        <div style={S.overlay} onClick={()=>setModal("detail")}>
          <div style={{ ...S.wideModal, maxWidth:"620px" }} onClick={e=>e.stopPropagation()}>
            <div style={S.mtitle}>📄 Signed Rental Agreement</div>

            {/* Signature block */}
            <div style={{ background:"#f0f9f3", border:"2px solid #1a3d2b", borderRadius:"8px", padding:"14px 18px", marginBottom:"16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"8px", fontSize:"13px", color:"#444", marginBottom:"10px" }}>
                <span><strong>Reservation:</strong> {selectedRes.id}</span>
                <span><strong>Customer:</strong> {selectedRes.customer}</span>
                <span><strong>Item:</strong> {getItem(selectedRes.itemId).name}</span>
                <span><strong>Period:</strong> {fmtDate(selectedRes.start)} – {fmtDate(selectedRes.end)}</span>
                <span><strong>Total:</strong> ${daysBetween(selectedRes.start, selectedRes.end) * (getItem(selectedRes.itemId).rate||0)}</span>
                {selectedRes.unitId && <span><strong>Unit:</strong> {selectedRes.unitId}</span>}
              </div>
              <div style={{ borderTop:"1px solid #b8e0c8", paddingTop:"10px", display:"flex", alignItems:"flex-end", gap:"20px", flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontSize:"11px", color:"#888", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:"2px" }}>Customer Signature</div>
                  <div style={{ fontFamily:"'Palatino Linotype',Georgia,serif", fontSize:"22px", fontStyle:"italic", color:"#1a3d2b", borderBottom:"2px solid #1a3d2b", paddingBottom:"2px", minWidth:"200px" }}>
                    {selectedRes.signedBy}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:"11px", color:"#888", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:"2px" }}>Date & Time</div>
                  <div style={{ fontSize:"13px", color:"#444" }}>{selectedRes.signedAt}</div>
                </div>
              </div>
            </div>

            {/* Contract text */}
            <div style={{ ...S.contractBox, maxHeight:"340px" }}>
              {selectedRes.contractText || contract}
            </div>

            <div style={{ ...S.btnRow, marginTop:"16px" }}>
              <button style={{ ...S.smallBtn, background:"#e8f4fd", color:"#0d6096", padding:"8px 16px", fontSize:"13px" }}
                onClick={()=>window.print()}>🖨 Print / Save PDF</button>
              <button style={S.cancelBtn} onClick={()=>setModal("detail")}>← Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
