import React, { useState } from 'react';
import {
  Smartphone,
  Code2,
  Server,
  BookOpen,
  Download,
  UtensilsCrossed,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Layers
} from 'lucide-react';
import { PhoneSimulator } from './components/PhoneSimulator';
import { CodeExplorer, PROJECT_FILES } from './components/CodeExplorer';
import { ApiTester } from './components/ApiTester';
import { GuideModal } from './components/GuideModal';
import JSZip from 'jszip';

export default function App() {
  const [activeView, setActiveView] = useState<'simulator' | 'code' | 'api'>('simulator');
  const [showGuide, setShowGuide] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadFullZip = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      PROJECT_FILES.forEach(file => {
        zip.file(file.path, file.content);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'savoria-restaurant-app-full-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Studio Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-white">
                  Savoria Mobile Studio
                </h1>
                <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                  Expo + Express + Firebase
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Project ID: <code className="text-orange-300 font-mono">myresturent-13093</code> • Complete MVP Deliverable
              </p>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setActiveView('simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeView === 'simulator'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Android App</span>
            </button>

            <button
              onClick={() => setActiveView('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeView === 'code'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Source Files ({PROJECT_FILES.length})</span>
            </button>

            <button
              onClick={() => setActiveView('api')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeView === 'api'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>REST API</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-orange-400" />
              <span className="hidden md:inline">Run Guide &amp; EAS Build</span>
            </button>

            <button
              onClick={handleDownloadFullZip}
              disabled={isDownloading}
              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Downloading...' : 'Export .ZIP'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Highlights Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>React Native (Expo SDK 51)</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Node.js Express REST API (Port 5000)</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Firebase Auth + AsyncStorage Persistence</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Table Double-Booking Prevention</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">
              Files: <strong className="text-slate-700">/mobile-app</strong> &amp; <strong className="text-slate-700">/backend</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        {activeView === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Device Simulator */}
            <div className="lg:col-span-5 flex justify-center">
              <PhoneSimulator />
            </div>

            {/* Right: Feature Highlights & Quick Test Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Interactive Live App Preview
                    </h2>
                    <p className="text-xs text-slate-500">
                      Test all 7 core features in real-time inside the Android emulator on the left
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                    ● Live Sandbox
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-1">
                    <span className="font-extrabold text-orange-900 block flex items-center gap-1.5">
                      <span>🍕</span> 1. Menu Catalog &amp; Categories
                    </span>
                    <p className="text-slate-600">
                      Browse 18 artisan dishes with high-res photos, preparation times, calorie counts, and quick "+ Add" action.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                    <span className="font-extrabold text-amber-900 block flex items-center gap-1.5">
                      <span>🔍</span> 2. Debounced Search &amp; Filter
                    </span>
                    <p className="text-slate-600">
                      Live keyword search, sort by price (low/high) or rating, and filter by stock availability.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                    <span className="font-extrabold text-emerald-900 block flex items-center gap-1.5">
                      <span>🛒</span> 3. Cart Math &amp; Checkout
                    </span>
                    <p className="text-slate-600">
                      Quantity counters, subtotal, 8.25% restaurant tax, delivery address entry, and order placement with confetti.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                    <span className="font-extrabold text-blue-900 block flex items-center gap-1.5">
                      <span>📅</span> 4. Table Double-Booking Check
                    </span>
                    <p className="text-slate-600">
                      Date selector, time slot capacity enforcement (6 tables max), guest counts, and My Reservations cancellation.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1">
                    <span className="font-extrabold text-purple-900 block flex items-center gap-1.5">
                      <span>👤</span> 5. Auth &amp; Order Status Tracking
                    </span>
                    <p className="text-slate-600">
                      Track status cycle: Pending ➔ Preparing in Kitchen ➔ Ready for Pickup ➔ Completed.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
                    <span className="font-extrabold text-slate-800 block flex items-center gap-1.5">
                      <span>📦</span> 6. Production Ready Architecture
                    </span>
                    <p className="text-slate-600">
                      Includes complete separate <code className="font-bold">/backend</code> and <code className="font-bold">/mobile-app</code> folders ready to run on physical Android phones.
                    </p>
                  </div>
                </div>

                {/* Quick actions row */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveView('code')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Code2 className="w-4 h-4 text-orange-400" />
                    <span>Inspect Mobile &amp; Backend Code</span>
                  </button>

                  <button
                    onClick={() => setActiveView('api')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Server className="w-4 h-4 text-emerald-600" />
                    <span>Test Express REST API</span>
                  </button>

                  <button
                    onClick={() => setShowGuide(true)}
                    className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Run on Real Phone Instructions</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'code' && <CodeExplorer />}

        {activeView === 'api' && <ApiTester />}
      </main>

      {/* Guide Modal */}
      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
