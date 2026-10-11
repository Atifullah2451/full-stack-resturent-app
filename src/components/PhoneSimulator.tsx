import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Home,
  Search,
  ShoppingCart,
  Calendar,
  User,
  Star,
  Clock,
  Flame,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  ArrowLeft,
  SlidersHorizontal,
  CheckCircle,
  X,
  Phone,
  MapPin,
  UtensilsCrossed,
  Sparkles,
  Info
} from 'lucide-react';
import { INITIAL_MENU_ITEMS, MenuItem } from '../data/menuData';

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderRecord {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  deliveryAddress: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface BookingRecord {
  id: string;
  date: string;
  time: string;
  guests: number;
  tableNumber: number;
  status: 'confirmed' | 'cancelled';
  note?: string;
  createdAt: string;
}

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Pasta', 'Sides', 'Drinks', 'Desserts'];

const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
  '08:00 PM', '08:30 PM', '09:00 PM'
];

export const PhoneSimulator: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'cart' | 'bookings' | 'profile'>('home');
  const [selectedItemDetail, setSelectedItemDetail] = useState<MenuItem | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [bookingTab, setBookingTab] = useState<'book' | 'my-bookings'>('book');

  // Auth State
  const [user, setUser] = useState<{ name: string; email: string; phone: string; address: string } | null>({
    name: 'Sophia Laurent',
    email: 'sophia@example.com',
    phone: '+1 (555) 438-9921',
    address: '450 Sunset Blvd, Suite 3B'
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([
    { ...INITIAL_MENU_ITEMS[0], quantity: 1 },
    { ...INITIAL_MENU_ITEMS[10], quantity: 1 }
  ]);
  const [deliveryAddress, setDeliveryAddress] = useState('450 Sunset Blvd, Suite 3B');
  const [orderNotes, setOrderNotes] = useState('');

  // Orders State
  const [orders, setOrders] = useState<OrderRecord[]>([
    {
      id: 'ord-8491',
      items: [{ ...INITIAL_MENU_ITEMS[4], quantity: 1 }],
      subtotal: 16.50,
      tax: 1.36,
      total: 17.86,
      deliveryAddress: '450 Sunset Blvd, Suite 3B',
      status: 'preparing',
      createdAt: 'Today, 11:42 AM'
    }
  ]);
  const [latestOrder, setLatestOrder] = useState<OrderRecord | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [homeCategory, setHomeCategory] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating-desc'>('default');
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Table Booking State
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState(TIME_SLOTS[4]);
  const [bookingGuests, setBookingGuests] = useState(2);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookings, setBookings] = useState<BookingRecord[]>([
    {
      id: 'bk-1029',
      date: new Date().toISOString().split('T')[0],
      time: '07:30 PM',
      guests: 4,
      tableNumber: 7,
      status: 'confirmed',
      note: 'Window table please',
      createdAt: 'Yesterday'
    }
  ]);

  // Cart Calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.0825;
  const grandTotal = subtotal + tax;

  const addToCart = (item: MenuItem, qty = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += qty;
        return next;
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter(i => i.quantity > 0)
    );
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const newOrder: OrderRecord = {
      id: 'ord-' + Math.floor(1000 + Math.random() * 9000),
      items: [...cart],
      subtotal,
      tax,
      total: grandTotal,
      deliveryAddress: deliveryAddress || 'Counter Pickup',
      status: 'pending',
      createdAt: 'Just now'
    };

    setOrders([newOrder, ...orders]);
    setLatestOrder(newOrder);
    setCart([]);

    // Celebrate with confetti!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleBookTable = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Check clash: already have confirmed booking on same date and time
    const clash = bookings.find(
      b => b.date === bookingDate && b.time === bookingTime && b.status === 'confirmed'
    );
    if (clash) {
      alert(`⚠️ You already have a reservation at ${bookingTime} on ${bookingDate}!`);
      return;
    }

    const newBooking: BookingRecord = {
      id: 'bk-' + Math.floor(1000 + Math.random() * 9000),
      date: bookingDate,
      time: bookingTime,
      guests: bookingGuests,
      tableNumber: Math.floor(Math.random() * 15) + 1,
      status: 'confirmed',
      note: bookingNotes,
      createdAt: 'Just now'
    };

    setBookings([newBooking, ...bookings]);
    setBookingTab('my-bookings');
    setBookingNotes('');
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 }
    });
  };

  // Filtered menu items for Search tab
  const searchFilteredItems = useMemo(() => {
    let result = [...INITIAL_MENU_ITEMS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }

    if (filterCategory !== 'All') {
      result = result.filter(i => i.category.toLowerCase() === filterCategory.toLowerCase());
    }

    if (minRating > 0) {
      result = result.filter(i => i.rating >= minRating);
    }

    if (availableOnly) {
      result = result.filter(i => i.isAvailable);
    }

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating-desc') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [searchQuery, filterCategory, minRating, availableOnly, sortBy]);

  // Home filtered items
  const homeFilteredItems = useMemo(() => {
    if (homeCategory === 'All') return INITIAL_MENU_ITEMS;
    return INITIAL_MENU_ITEMS.filter(i => i.category.toLowerCase() === homeCategory.toLowerCase());
  }, [homeCategory]);

  return (
    <div className="flex flex-col items-center">
      {/* Device Frame */}
      <div className="relative w-[375px] h-[760px] bg-slate-900 rounded-[50px] p-3 shadow-2xl ring-1 ring-slate-800/80 shadow-orange-950/20 select-none">
        {/* Hardware details: Side buttons & antenna lines */}
        <div className="absolute -left-[3px] top-28 w-[3px] h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-[3px] top-44 w-[3px] h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -right-[3px] top-32 w-[3px] h-16 bg-slate-700 rounded-r-sm" />

        {/* Screen Bezel */}
        <div className="relative w-full h-full bg-slate-50 rounded-[40px] overflow-hidden flex flex-col font-sans">
          
          {/* Android Status Bar */}
          <div className="h-7 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between text-xs font-semibold text-slate-800 shrink-0 z-20 border-b border-slate-100">
            <span>12:30</span>
            {/* Camera Punchhole */}
            <div className="w-4 h-4 rounded-full bg-slate-900 ring-2 ring-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Active Screen Content Container */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">

            {/* TAB 1: HOME */}
            {activeTab === 'home' && (
              <div className="p-4 pb-20">
                {/* Greeting & Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Delivering to</p>
                    <div className="flex items-center gap-1 text-slate-900 font-bold text-sm">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      <span className="truncate max-w-[190px]">
                        {user ? user.address || 'Dining Room' : 'Set your location'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-orange-600"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* Hero Special Banner */}
                <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl p-4 text-white shadow-md mb-5">
                  <div className="relative z-10 max-w-[210px]">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wide mb-1">
                      Chef's Special
                    </span>
                    <h3 className="font-extrabold text-base leading-snug">Truffle Angus Burger</h3>
                    <p className="text-xs text-orange-100 mt-1">20% off with any craft side</p>
                    <button
                      onClick={() => {
                        setSelectedItemDetail(INITIAL_MENU_ITEMS[0]);
                        setDetailQuantity(1);
                      }}
                      className="mt-3 px-3 py-1.5 bg-white text-orange-700 rounded-lg text-xs font-bold shadow-xs hover:bg-orange-50 flex items-center gap-1"
                    >
                      <span>Order Now</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <img
                    src={INITIAL_MENU_ITEMS[0].image}
                    alt="Burger"
                    className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full object-cover ring-4 ring-white/20"
                  />
                </div>

                {/* Category Chips Scroll */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">Categories</h4>
                    <span className="text-xs text-slate-400">{homeFilteredItems.length} items</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setHomeCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                          homeCategory === cat
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Item Cards */}
                <div className="space-y-3">
                  {homeFilteredItems.map(item => {
                    const cartItem = cart.find(c => c.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItemDetail(item);
                          setDetailQuantity(1);
                        }}
                        className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs hover:border-orange-200 transition-all cursor-pointer flex gap-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                                {item.category}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                                <Star className="w-3 h-3 fill-amber-500" />
                                <span>{item.rating}</span>
                              </div>
                            </div>
                            <h5 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                              {item.name}
                            </h5>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-sm font-extrabold text-slate-900">
                              ${item.price.toFixed(2)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(item, 1);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                                cartItem
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-orange-600 text-white hover:bg-orange-700 shadow-xs'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                              <span>{cartItem ? `${cartItem.quantity} Added` : 'Add'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: SEARCH & FILTER */}
            {activeTab === 'search' && (
              <div className="p-4 pb-20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search pizza, pasta, burger..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setShowFilterModal(true)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                      filterCategory !== 'All' || minRating > 0 || availableOnly || sortBy !== 'default'
                        ? 'bg-orange-50 border-orange-500 text-orange-600'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick categories horizontal scroll */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                        filterCategory === cat
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                  <span>{searchFilteredItems.length} dishes found</span>
                  {(filterCategory !== 'All' || minRating > 0 || availableOnly || sortBy !== 'default') && (
                    <button
                      onClick={() => {
                        setFilterCategory('All');
                        setMinRating(0);
                        setAvailableOnly(false);
                        setSortBy('default');
                      }}
                      className="text-orange-600 font-bold"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Search Results Grid */}
                <div className="space-y-3">
                  {searchFilteredItems.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
                      <span className="text-4xl block mb-2">🍽️</span>
                      <h4 className="font-bold text-slate-800 text-sm">No dishes match</h4>
                      <p className="text-xs text-slate-500 mt-1">Try another keyword or reset your filter.</p>
                    </div>
                  ) : (
                    searchFilteredItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItemDetail(item);
                          setDetailQuantity(1);
                        }}
                        className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex gap-3 cursor-pointer"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-orange-600 uppercase">{item.category}</span>
                              <span className="font-bold text-amber-600">★ {item.rating}</span>
                            </div>
                            <h5 className="font-bold text-slate-900 text-sm leading-tight mt-0.5">
                              {item.name}
                            </h5>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 text-sm">
                              ${item.price.toFixed(2)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(item, 1);
                              }}
                              className="px-2.5 py-1 bg-orange-600 text-white rounded-lg text-xs font-bold"
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: CART */}
            {activeTab === 'cart' && (
              <div className="p-4 pb-24">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Your Cart</h3>
                    <p className="text-xs text-slate-500">{cartCount} items selected</p>
                  </div>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {latestOrder && cart.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-xs">
                    <span className="text-5xl block mb-2">🎉</span>
                    <h4 className="font-bold text-slate-900 text-base">Order Placed!</h4>
                    <p className="text-xs text-orange-600 font-bold mt-0.5">ID: {latestOrder.id}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Total: ${latestOrder.total.toFixed(2)} • Preparing in Kitchen
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setLatestOrder(null);
                          setActiveTab('profile');
                        }}
                        className="flex-1 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
                      >
                        Track Status
                      </button>
                      <button
                        onClick={() => {
                          setLatestOrder(null);
                          setActiveTab('home');
                        }}
                        className="flex-1 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                      >
                        Order More
                      </button>
                    </div>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
                    <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <h4 className="font-bold text-slate-800 text-sm">Cart is empty</h4>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Add your favorite meals to start checkout.</p>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      Explore Menu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart Items List */}
                    <div className="space-y-2.5">
                      {cart.map(item => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-slate-900 text-xs truncate">{item.name}</h5>
                            <span className="text-xs font-extrabold text-orange-600 block mt-0.5">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          {/* Stepper */}
                          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-5 h-5 rounded bg-white text-slate-700 flex items-center justify-center text-xs font-bold shadow-xs"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-slate-900 min-w-3 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-5 h-5 rounded bg-white text-slate-700 flex items-center justify-center text-xs font-bold shadow-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Details */}
                    <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Delivery Address / Table #
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Table 4 or your street address"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Tax (8.25%)</span>
                        <span className="font-semibold text-slate-800">${tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-1.5 flex justify-between font-bold text-slate-900 text-sm">
                        <span>Grand Total</span>
                        <span className="text-orange-600">${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Place Order • ${grandTotal.toFixed(2)}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: TABLE BOOKING */}
            {activeTab === 'bookings' && (
              <div className="p-4 pb-20">
                {/* Switcher */}
                <div className="flex bg-slate-200/80 p-1 rounded-xl mb-4">
                  <button
                    onClick={() => setBookingTab('book')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      bookingTab === 'book' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Reserve Table
                  </button>
                  <button
                    onClick={() => setBookingTab('my-bookings')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      bookingTab === 'my-bookings' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    My Bookings ({bookings.filter(b => b.status === 'confirmed').length})
                  </button>
                </div>

                {bookingTab === 'book' ? (
                  <div className="space-y-4">
                    {/* Hero card */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-amber-900">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-700 block">
                        Artisan Experience
                      </span>
                      <h4 className="font-extrabold text-sm mt-0.5">Host Your Special Moments</h4>
                      <p className="text-xs text-amber-800/80 mt-1">
                        Free instant booking with automatic table seating and zero reservation fees.
                      </p>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1.5">1. Select Date</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                      />
                    </div>

                    {/* Time Slots */}
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1.5">2. Select Time Slot</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {TIME_SLOTS.map(slot => {
                          const isBooked = bookings.some(
                            b => b.date === bookingDate && b.time === slot && b.status === 'confirmed'
                          );
                          const isSelected = bookingTime === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setBookingTime(slot)}
                              className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                                isSelected
                                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                                  : isBooked
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Guests */}
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1.5">3. Guests</label>
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setBookingGuests(n)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                              bookingGuests === n
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {n} {n === 1 ? 'Guest' : 'Guests'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1.5">
                        4. Special Requests (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Window view, birthday setup, high chair..."
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleBookTable}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-extrabold shadow-md"
                    >
                      Confirm Reservation ({bookingGuests} Guests)
                    </button>
                  </div>
                ) : (
                  /* My Bookings List */
                  <div className="space-y-3">
                    {bookings.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h4 className="font-bold text-slate-800 text-sm">No reservations yet</h4>
                        <p className="text-xs text-slate-500 mt-1">Book your table today!</p>
                      </div>
                    ) : (
                      bookings.map(item => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 text-xs">
                              🗓 {item.date} • {item.time}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                item.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 flex items-center justify-between">
                            <span>Table #{item.tableNumber} • {item.guests} Guests</span>
                            {item.status === 'confirmed' && (
                              <button
                                onClick={() => {
                                  if (confirm('Cancel this table reservation?')) {
                                    setBookings(prev =>
                                      prev.map(b => (b.id === item.id ? { ...b, status: 'cancelled' } : b))
                                    );
                                  }
                                }}
                                className="text-red-600 font-bold hover:underline"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                          {item.note && (
                            <p className="text-[11px] text-slate-500 italic">"{item.note}"</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: PROFILE & ORDERS */}
            {activeTab === 'profile' && (
              <div className="p-4 pb-20 space-y-4">
                {user ? (
                  <>
                    {/* User Card */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 font-black text-lg flex items-center justify-center">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">{user.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{user.phone}</p>
                      </div>
                      <button
                        onClick={() => {
                          const newName = prompt('Update Name:', user.name) || user.name;
                          const newPhone = prompt('Update Phone:', user.phone) || user.phone;
                          const newAddr = prompt('Update Address:', user.address) || user.address;
                          setUser({ ...user, name: newName, phone: newPhone, address: newAddr });
                        }}
                        className="text-xs font-bold text-orange-600 hover:underline"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Order History */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 text-sm">Order History</h4>
                        <span className="text-xs text-slate-400">{orders.length} orders</span>
                      </div>

                      <div className="space-y-2.5">
                        {orders.map(order => (
                          <div
                            key={order.id}
                            className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">Order #{order.id}</span>
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  order.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : order.status === 'preparing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'ready'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>

                            <div className="text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-1.5">
                              {order.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>{it.quantity}x {it.name}</span>
                                  <span className="font-semibold">${(it.price * it.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-slate-100 pt-1.5 flex justify-between items-center text-xs">
                              <span className="text-slate-400">{order.createdAt}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900">${order.total.toFixed(2)}</span>
                                {/* Simulator: status cycler button */}
                                <button
                                  onClick={() => {
                                    const nextStatus: Record<string, OrderRecord['status']> = {
                                      pending: 'preparing',
                                      preparing: 'ready',
                                      ready: 'completed',
                                      completed: 'pending'
                                    };
                                    setOrders(prev =>
                                      prev.map(o => (o.id === order.id ? { ...o, status: nextStatus[o.status] } : o))
                                    );
                                  }}
                                  title="Cycle order status for demo"
                                  className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono hover:bg-slate-200"
                                >
                                  ▶ Next Status
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setUser(null)}
                      className="w-full py-2.5 bg-red-50 text-red-600 font-bold rounded-xl text-xs hover:bg-red-100 border border-red-200"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                    <User className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">Sign in to Savoria</h4>
                    <p className="text-xs text-slate-500">
                      Sign in to track orders, save table bookings, and sync your profile with Firebase.
                    </p>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-orange-700"
                    >
                      Sign In / Register
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Android Bottom Navigation Tabs */}
          <div className="h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 flex items-center justify-around shrink-0 z-30">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-0.5 transition-colors ${
                activeTab === 'home' ? 'text-orange-600 font-bold' : 'text-slate-400'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`flex flex-col items-center gap-0.5 transition-colors ${
                activeTab === 'search' ? 'text-orange-600 font-bold' : 'text-slate-400'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="text-[10px]">Search</span>
            </button>

            <button
              onClick={() => setActiveTab('cart')}
              className={`flex flex-col items-center gap-0.5 relative transition-colors ${
                activeTab === 'cart' ? 'text-orange-600 font-bold' : 'text-slate-400'
              }`}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-orange-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px]">Cart</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex flex-col items-center gap-0.5 transition-colors ${
                activeTab === 'bookings' ? 'text-orange-600 font-bold' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[10px]">Bookings</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-0.5 transition-colors ${
                activeTab === 'profile' ? 'text-orange-600 font-bold' : 'text-slate-400'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px]">Profile</span>
            </button>
          </div>

          {/* Android Home Navigation Bar */}
          <div className="h-4 bg-white flex items-center justify-center shrink-0 z-30">
            <div className="w-24 h-1 bg-slate-300 rounded-full" />
          </div>

          {/* ITEM DETAIL MODAL */}
          {selectedItemDetail && (
            <div className="absolute inset-0 bg-white z-40 flex flex-col overflow-y-auto">
              <div className="relative h-60 w-full shrink-0">
                <img
                  src={selectedItemDetail.image}
                  alt={selectedItemDetail.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedItemDetail(null)}
                  className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-800 shadow-md"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{selectedItemDetail.rating}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-orange-600 tracking-wider">
                      {selectedItemDetail.category}
                    </span>
                    <span className="text-xs text-slate-400">⏱ {selectedItemDetail.preparationTime}</span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    {selectedItemDetail.name}
                  </h3>
                  <p className="text-lg font-black text-orange-600">
                    ${selectedItemDetail.price.toFixed(2)}
                  </p>

                  <div className="flex gap-2 py-2 border-y border-slate-100">
                    <div className="flex-1 bg-slate-50 p-2 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 block">Calories</span>
                      <span className="text-xs font-bold text-slate-800">{selectedItemDetail.calories} kcal</span>
                    </div>
                    <div className="flex-1 bg-slate-50 p-2 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 block">Status</span>
                      <span className="text-xs font-bold text-emerald-600">
                        {selectedItemDetail.isAvailable ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex-1 bg-slate-50 p-2 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 block">Chef Choice</span>
                      <span className="text-xs font-bold text-slate-800">Fresh Made</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1">Description</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedItemDetail.description}
                    </p>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold text-slate-800">Select Quantity</span>
                    <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}
                        className="w-7 h-7 rounded-lg bg-white text-slate-800 flex items-center justify-center font-bold text-sm shadow-xs"
                      >
                        -
                      </button>
                      <span className="text-sm font-extrabold text-slate-900 min-w-4 text-center">
                        {detailQuantity}
                      </span>
                      <button
                        onClick={() => setDetailQuantity(detailQuantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white text-slate-800 flex items-center justify-center font-bold text-sm shadow-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedItemDetail, detailQuantity);
                    setSelectedItemDetail(null);
                  }}
                  className="mt-6 w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Cart • ${(selectedItemDetail.price * detailQuantity).toFixed(2)}</span>
                </button>
              </div>
            </div>
          )}

          {/* FILTER MODAL */}
          {showFilterModal && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end">
              <div className="w-full bg-white rounded-t-3xl p-5 space-y-4 max-h-[85%] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-900 text-sm">Filter &amp; Sort</h4>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Sort Option */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Sort by</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'default', label: 'Recommended' },
                      { id: 'price-asc', label: 'Price: Low → High' },
                      { id: 'price-desc', label: 'Price: High → Low' },
                      { id: 'rating-desc', label: 'Highest Rated' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id as any)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-left truncate ${
                          sortBy === opt.id
                            ? 'bg-orange-50 border-orange-500 text-orange-700'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">Minimum Rating</label>
                  <div className="flex gap-1.5">
                    {[0, 4.0, 4.5, 4.8].map(r => (
                      <button
                        key={r}
                        onClick={() => setMinRating(r)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                          minRating === r
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {r === 0 ? 'Any' : `★ ${r}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In stock toggle */}
                <label className="flex items-center justify-between py-2 border-t border-slate-100 text-xs font-bold text-slate-800 cursor-pointer">
                  <span>Only available items</span>
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                </label>

                <button
                  onClick={() => setShowFilterModal(false)}
                  className="w-full py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold"
                >
                  Apply Filters ({searchFilteredItems.length} results)
                </button>
              </div>
            </div>
          )}

          {/* AUTH MODAL */}
          {showAuthModal && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="w-full bg-white rounded-3xl p-5 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {authMode === 'login' ? 'Sign In to Savoria' : 'Create Account'}
                  </h4>
                  <button onClick={() => setShowAuthModal(false)} className="text-slate-400">
                    ✕
                  </button>
                </div>

                {authMode === 'register' && (
                  <>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </>
                )}

                <input
                  type="email"
                  placeholder="Email Address"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />

                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />

                <button
                  onClick={() => {
                    setUser({
                      name: authName.trim() || 'Alex Morgan',
                      email: authEmail.trim() || 'alex@example.com',
                      phone: authPhone.trim() || '+1 (555) 019-2834',
                      address: '742 Evergreen Terrace'
                    });
                    setShowAuthModal(false);
                  }}
                  className="w-full py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-orange-700"
                >
                  {authMode === 'login' ? 'Sign In' : 'Sign Up'}
                </button>

                <div className="text-center text-xs text-slate-500 pt-1">
                  {authMode === 'login' ? (
                    <span>
                      Don't have an account?{' '}
                      <button
                        onClick={() => setAuthMode('register')}
                        className="text-orange-600 font-bold hover:underline"
                      >
                        Create one
                      </button>
                    </span>
                  ) : (
                    <span>
                      Already have an account?{' '}
                      <button
                        onClick={() => setAuthMode('login')}
                        className="text-orange-600 font-bold hover:underline"
                      >
                        Sign in
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
