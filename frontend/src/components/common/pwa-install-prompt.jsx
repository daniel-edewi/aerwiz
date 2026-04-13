import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check iOS
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const safari = /safari/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(ios && safari);

    // Show iOS prompt after 30 seconds if not dismissed
    if (ios && safari) {
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      const lastDismissed = dismissed ? new Date(dismissed) : null;
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (!lastDismissed || lastDismissed < oneDayAgo) {
        setTimeout(() => setShowPrompt(true), 30000);
      }
      return;
    }

    // Android/Desktop — listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      const lastDismissed = dismissed ? new Date(dismissed) : null;
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (!lastDismissed || lastDismissed < oneDayAgo) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">Install Aerwiz App</span>
          </div>
          <button onClick={handleDismiss} className="text-white/70 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-600 text-sm mb-3 leading-relaxed">
            Add Aerwiz to your home screen for faster access to flight search and your bookings.
          </p>
          {isIOS ? (
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 space-y-1">
              <p className="font-semibold">To install on iPhone/iPad:</p>
              <p>1. Tap the <strong>Share</strong> button at the bottom of Safari</p>
              <p>2. Scroll down and tap <strong>"Add to Home Screen"</strong></p>
              <p>3. Tap <strong>Add</strong></p>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Add to Home Screen</span>
            </button>
          )}
          <button onClick={handleDismiss} className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
