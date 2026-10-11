import React, { useState } from 'react';
import {
  Terminal,
  Smartphone,
  Server,
  Key,
  Package,
  Layers,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const GuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'backend' | 'mobile' | 'eas' | 'firebase'>('backend');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="font-bold text-sm leading-tight">Run &amp; Deployment Guides</h3>
              <p className="text-[11px] text-slate-400">
                Step-by-step instructions for Backend, Expo Mobile App &amp; Standalone Android APK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('backend')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'backend'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>1. Backend &amp; Seed</span>
          </button>

          <button
            onClick={() => setActiveTab('mobile')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'mobile'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>2. Run Expo Mobile App</span>
          </button>

          <button
            onClick={() => setActiveTab('eas')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'eas'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>3. Build Standalone APK (EAS)</span>
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'firebase'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>4. Firebase Credentials</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-slate-700">
          {activeTab === 'backend' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-orange-900 text-xs">
                <span className="font-bold block mb-1">Backend Specs:</span>
                Node.js + Express REST API running on port 5000 with Firebase Admin SDK, CORS, and Express Validator.
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Step 1: Install backend dependencies &amp; seed database
                </h4>
                <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 font-mono text-xs flex justify-between items-center">
                  <span>cd backend && npm install && npm run seed</span>
                  <button
                    onClick={() => copyCode('cd backend && npm install && npm run seed', 1)}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedIndex === 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Step 2: Start Express REST server
                </h4>
                <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 font-mono text-xs flex justify-between items-center">
                  <span>npm run dev</span>
                  <button
                    onClick={() => copyCode('npm run dev', 2)}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedIndex === 2 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">Server URL reference:</p>
                <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px]">
                  <li>Local Machine: http://localhost:5000</li>
                  <li>Android Studio Emulator: http://10.0.2.2:5000</li>
                  <li>Physical Phone / LAN: http://192.168.1.XX:5000 (shown in console startup)</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'mobile' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-900 text-xs">
                <span className="font-bold block mb-1">React Native + Expo Setup:</span>
                Built with Expo SDK 51, React Navigation (Native Stack + Bottom Tabs), and persistent Firebase Auth with AsyncStorage.
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Step 1: Install mobile dependencies
                </h4>
                <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 font-mono text-xs flex justify-between items-center">
                  <span>cd mobile-app && npm install</span>
                  <button
                    onClick={() => copyCode('cd mobile-app && npm install', 3)}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedIndex === 3 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Step 2: Start Expo bundler
                </h4>
                <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 font-mono text-xs flex justify-between items-center">
                  <span>npx expo start</span>
                  <button
                    onClick={() => copyCode('npx expo start', 4)}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedIndex === 4 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <h5 className="font-bold text-slate-900 mb-1">On Android Emulator:</h5>
                  <p className="text-slate-600">
                    Press <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">a</code> in the terminal. The app automatically connects to <code className="font-mono">10.0.2.2:5000</code>.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <h5 className="font-bold text-slate-900 mb-1">On Real Android Phone:</h5>
                  <p className="text-slate-600">
                    Scan the QR code with <strong>Expo Go</strong>. In the Profile tab, tap <strong>Backend API Server IP</strong> and enter your local Wi-Fi IP (e.g. <code className="font-mono">192.168.1.50:5000</code>).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eas' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-xs">
                <span className="font-bold block mb-1">Standalone Android APK:</span>
                Expo Application Services (EAS) compiles the Android project in the cloud and provides a direct <code className="font-mono font-bold">.apk</code> download link.
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Step 1: Install EAS CLI and login
                </h4>
                <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 font-mono text-xs flex justify-between items-center">
                  <span>npm install -g eas-cli && eas login</span>
                  <button
                    onClick={() => copyCode('npm install -g eas-cli && eas login', 5)}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedIndex === 5 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Step 2: Trigger APK build
                </h4>
                <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 font-mono text-xs flex justify-between items-center">
                  <span>cd mobile-app && eas build -p android --profile preview</span>
                  <button
                    onClick={() => copyCode('cd mobile-app && eas build -p android --profile preview', 6)}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedIndex === 6 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">
                  Once the build completes on EAS servers:
                </p>
                <p>
                  You will receive a download URL and a QR code in the terminal. Open the link on any Android phone to install the APK directly!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className="space-y-3 text-xs">
                <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">Enable Email/Password Auth:</h5>
                    <p className="text-slate-600 mt-0.5">
                      In Firebase Console for project <strong>myresturent-13093</strong>, navigate to <strong>Authentication &gt; Sign-in method</strong> and toggle <strong>Email/Password</strong> to Enabled.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">Publish Firestore Security Rules:</h5>
                    <p className="text-slate-600 mt-0.5">
                      Go to <strong>Firestore Database &gt; Rules</strong>. Copy the rules from <code className="font-mono">firestore.rules</code> and click <strong>Publish</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">Generate Service Account Key for Backend:</h5>
                    <p className="text-slate-600 mt-0.5">
                      Go to <strong>Project Settings (gear icon) &gt; Service accounts</strong>. Click <strong>Generate new private key</strong>. Save the file as <code className="font-mono">backend/serviceAccountKey.json</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
