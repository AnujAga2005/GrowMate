import { useState } from 'react';
import { motion } from 'motion/react';

/**
 * Debug Panel - Shows environment configuration
 * TEMPORARY: Remove this after fixing deployment
 */
export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  // Safely access environment variables
  const env = typeof import.meta !== 'undefined' ? import.meta.env : {};
  const apiUrl = env.VITE_API_URL || 'http://localhost:8080/api';
  const baseUrl = apiUrl.replace('/api', '');

  const testBackend = async () => {
    setTesting(true);
    try {
      const response = await fetch(`${baseUrl}/health`);
      const data = await response.json();
      setTestResult({ success: true, data });
    } catch (error: any) {
      setTestResult({ success: false, error: error.message });
    }
    setTesting(false);
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🐛 Debug Info
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-slate-900 text-white p-6 rounded-lg shadow-2xl z-50 max-w-md w-full"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg">🐛 Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <div className="text-gray-400 mb-1">Environment Variables:</div>
          <div className="bg-slate-800 p-3 rounded space-y-2 font-mono text-xs">
            <div>
              <span className="text-purple-400">VITE_API_URL:</span>{' '}
              <span className={env.VITE_API_URL ? 'text-green-400' : 'text-red-400'}>
                {env.VITE_API_URL || '❌ NOT SET (using default)'}
              </span>
            </div>
            <div>
              <span className="text-purple-400">VITE_GOOGLE_CLIENT_ID:</span>{' '}
              <span className={env.VITE_GOOGLE_CLIENT_ID ? 'text-green-400' : 'text-red-400'}>
                {env.VITE_GOOGLE_CLIENT_ID ? '✅ SET' : '❌ NOT SET'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-gray-400 mb-1">Computed API URL:</div>
          <div className="bg-slate-800 p-3 rounded font-mono text-xs break-all">
            {apiUrl}
          </div>
          {apiUrl.includes('localhost') && (
            <div className="text-red-400 text-xs mt-1">
              ⚠️ Using localhost - VITE_API_URL not set in Vercel!
            </div>
          )}
        </div>

        <div>
          <div className="text-gray-400 mb-1">Backend Health Check:</div>
          <button
            onClick={testBackend}
            disabled={testing}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded transition-colors"
          >
            {testing ? 'Testing...' : 'Test Backend Connection'}
          </button>
          {testResult && (
            <div className={`mt-2 p-3 rounded text-xs ${testResult.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
              {testResult.success ? (
                <div>
                  <div className="text-green-400 font-bold mb-1">✅ Backend is running!</div>
                  <div className="text-gray-300">
                    {testResult.data.message}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-red-400 font-bold mb-1">❌ Backend unreachable</div>
                  <div className="text-gray-300">
                    {testResult.error}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-700">
          <div className="text-gray-400 mb-2">Current Location:</div>
          <div className="bg-slate-800 p-2 rounded font-mono text-xs break-all">
            {window.location.href}
          </div>
        </div>

        {!env.VITE_API_URL && (
          <div className="bg-yellow-900/30 border border-yellow-600/50 p-3 rounded">
            <div className="text-yellow-400 font-bold mb-1">⚠️ Action Required!</div>
            <div className="text-yellow-200 text-xs">
              Set <code className="bg-black/30 px-1 rounded">VITE_API_URL</code> in Vercel:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to Vercel dashboard</li>
                <li>Settings → Environment Variables</li>
                <li>Add VITE_API_URL with your Railway URL</li>
                <li>Redeploy</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
