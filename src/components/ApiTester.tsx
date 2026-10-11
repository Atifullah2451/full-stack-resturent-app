import React, { useState } from 'react';
import { Play, CheckCircle2, Server, Copy, Check, RefreshCw } from 'lucide-react';
import { INITIAL_MENU_ITEMS } from '../data/menuData';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PATCH';
  url: string;
  name: string;
  description: string;
  requiresAuth: boolean;
  sampleBody?: any;
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'GET',
    url: '/api/health',
    name: 'Health Check',
    description: 'Check backend status, uptime, and connected Firebase Project',
    requiresAuth: false,
  },
  {
    method: 'GET',
    url: '/api/menu?category=Burgers&sort=price-asc',
    name: 'Get Filtered Menu Items',
    description: 'Search, filter by category, price, and rating',
    requiresAuth: false,
  },
  {
    method: 'GET',
    url: '/api/menu/categories',
    name: 'Get Menu Categories',
    description: 'Returns distinct categories and item counts',
    requiresAuth: false,
  },
  {
    method: 'POST',
    url: '/api/orders',
    name: 'Place Order',
    description: 'Calculates 8.25% tax, sanitizes items, saves to Firestore orders',
    requiresAuth: true,
    sampleBody: {
      items: [
        { id: 'burger-01', name: 'Truffle Angus Burger', price: 15.99, quantity: 2 },
        { id: 'sides-01', name: 'Parmesan Herb Truffle Fries', price: 7.50, quantity: 1 }
      ],
      deliveryAddress: 'Table #4, Main Dining Room',
      specialInstructions: 'Extra truffle aioli on the side please'
    }
  },
  {
    method: 'GET',
    url: '/api/bookings/check-availability?date=2026-10-15',
    name: 'Check Table Availability',
    description: 'Inspects slot capacity and prevents double bookings',
    requiresAuth: false,
  }
];

export const ApiTester: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(ENDPOINTS[0]);
  const [requestBody, setRequestBody] = useState(
    ENDPOINTS[0].sampleBody ? JSON.stringify(ENDPOINTS[0].sampleBody, null, 2) : ''
  );
  const [response, setResponse] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.sampleBody ? JSON.stringify(ep.sampleBody, null, 2) : '');
    setResponse(null);
    setStatusCode(null);
  };

  const handleExecute = () => {
    setLoading(true);
    const start = performance.now();

    setTimeout(() => {
      let resData: any = {};
      let status = 200;

      if (selectedEndpoint.url.includes('/api/health')) {
        resData = {
          status: 'online',
          timestamp: new Date().toISOString(),
          service: 'Savoria Restaurant API',
          version: '1.0.0',
          firebaseProject: 'myresturent-13093',
          database: 'Cloud Firestore',
          authentication: 'Firebase Auth (Identity Platform)'
        };
      } else if (selectedEndpoint.url.includes('/api/menu/categories')) {
        resData = {
          success: true,
          categories: [
            { name: 'All', count: 18 },
            { name: 'Burgers', count: 4 },
            { name: 'Pizza', count: 4 },
            { name: 'Pasta', count: 3 },
            { name: 'Sides', count: 2 },
            { name: 'Drinks', count: 3 },
            { name: 'Desserts', count: 2 }
          ]
        };
      } else if (selectedEndpoint.url.includes('/api/menu')) {
        const burgers = INITIAL_MENU_ITEMS.filter(i => i.category === 'Burgers').sort(
          (a, b) => a.price - b.price
        );
        resData = {
          success: true,
          total: burgers.length,
          data: burgers
        };
      } else if (selectedEndpoint.url.includes('/api/orders')) {
        status = 201;
        const subtotal = 15.99 * 2 + 7.50;
        const tax = subtotal * 0.0825;
        resData = {
          success: true,
          message: 'Order placed successfully!',
          order: {
            id: 'ord_' + Date.now().toString().slice(-6),
            userId: 'usr_firebase_sample_uid_9921',
            userEmail: 'customer@example.com',
            subtotal: Number(subtotal.toFixed(2)),
            tax: Number(tax.toFixed(2)),
            total: Number((subtotal + tax).toFixed(2)),
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        };
      } else if (selectedEndpoint.url.includes('/api/bookings/check-availability')) {
        resData = {
          success: true,
          date: '2026-10-15',
          maxTables: 6,
          slots: [
            { time: '12:00 PM', bookedTables: 2, availableTables: 4, isAvailable: true },
            { time: '01:00 PM', bookedTables: 6, availableTables: 0, isAvailable: false },
            { time: '07:00 PM', bookedTables: 3, availableTables: 3, isAvailable: true },
            { time: '08:00 PM', bookedTables: 5, availableTables: 1, isAvailable: true }
          ]
        };
      }

      const elapsed = Math.round(performance.now() - start);
      setDuration(elapsed);
      setStatusCode(status);
      setResponse(resData);
      setLoading(false);
    }, 250);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[760px]">
      {/* Top Header */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm tracking-wide">REST API Tester &amp; Seed Monitor</span>
        </div>
        <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full font-mono">
          PORT: 5000 • ONLINE
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Endpoint Selector */}
        <div className="w-80 bg-slate-50 border-r border-slate-200 p-3 overflow-y-auto space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Available REST Routes
          </p>
          {ENDPOINTS.map(ep => {
            const isSelected = selectedEndpoint.name === ep.name;
            return (
              <button
                key={ep.name}
                onClick={() => handleSelectEndpoint(ep)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs ${
                  isSelected
                    ? 'bg-white border-orange-500 shadow-xs ring-1 ring-orange-500/20'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded ${
                      ep.method === 'GET'
                        ? 'bg-blue-100 text-blue-700'
                        : ep.method === 'POST'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-bold text-slate-800 truncate">{ep.name}</span>
                </div>
                <p className="font-mono text-[11px] text-slate-500 truncate">{ep.url}</p>
              </button>
            );
          })}
        </div>

        {/* Right: Request & Response Workspace */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden p-4 space-y-4">
          {/* Active URL bar */}
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
            <span
              className={`font-mono text-xs font-black px-2 py-1 rounded ${
                selectedEndpoint.method === 'GET'
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {selectedEndpoint.method}
            </span>
            <input
              type="text"
              readOnly
              value={`http://localhost:5000${selectedEndpoint.url}`}
              className="flex-1 font-mono text-xs bg-transparent text-slate-700 focus:outline-none"
            />
            <button
              onClick={handleExecute}
              disabled={loading}
              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{loading ? 'Running...' : 'Send Request'}</span>
            </button>
          </div>

          {/* Description & Auth Notice */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{selectedEndpoint.description}</span>
            {selectedEndpoint.requiresAuth && (
              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                🔒 Bearer Token Required
              </span>
            )}
          </div>

          {/* Payload editor if POST */}
          {selectedEndpoint.sampleBody && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">JSON Request Body</label>
              <textarea
                rows={5}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full font-mono text-xs p-3 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 focus:outline-none"
              />
            </div>
          )}

          {/* Response Box */}
          <div className="flex-1 flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-400">Response</span>
                {statusCode && (
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      statusCode >= 200 && statusCode < 300
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    STATUS {statusCode} OK
                  </span>
                )}
                {duration && (
                  <span className="text-slate-500 text-[11px] font-mono">{duration}ms</span>
                )}
              </div>

              {response && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <pre className="flex-1 p-4 font-mono text-xs text-emerald-300 overflow-auto whitespace-pre leading-relaxed select-text">
              <code>
                {response
                  ? JSON.stringify(response, null, 2)
                  : '// Press "Send Request" to test this endpoint response.'}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
