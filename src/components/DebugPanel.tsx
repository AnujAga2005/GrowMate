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
  
  // Get ALL environment variables
  const allEnvVars = typeof import.meta !== 'undefined' ? import.meta.env : {};
  
  // Specific checks
  const viteApiUrl = env.VITE_API_URL;
  const apiUrl = viteApiUrl || 'http://localhost:8080/api';
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
      className="fixed bottom-4 right-4 bg-slate-900 text-white p-6 rounded-lg shadow-2xl z-50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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

      <div className="space-y-4 text-sm">
        {/* Critical Variables */}
        <div>
          <div className="text-gray-400 mb-2 font-semibold">🎯 Critical Environment Variables:</div>
          <div className="bg-slate-800 p-3 rounded space-y-2 font-mono text-xs">
            <div>
              <span className="text-purple-400">VITE_API_URL:</span>{' '}
              <span className={env.VITE_API_URL ? 'text-green-400' : 'text-red-400'}>
                {env.VITE_API_URL || '❌ NOT SET'}
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

        {/* ALL Environment Variables */}
        <div>
          <div className="text-gray-400 mb-2 font-semibold">📋 ALL Environment Variables (import.meta.env):</div>
          <div className="bg-slate-800 p-3 rounded font-mono text-xs max-h-60 overflow-y-auto">
            {Object.keys(allEnvVars).length > 0 ? (
              <pre className="whitespace-pre-wrap break-all text-green-300">
                {JSON.stringify(allEnvVars, null, 2)}
              </pre>
            ) : (
              <div className="text-red-400">❌ No environment variables found!</div>
            )}
          </div>
        </div>

        {/* Computed API URL */}
        <div>
          <div className="text-gray-400 mb-2 font-semibold">🔗 Computed API URL:</div>
          <div className="bg-slate-800 p-3 rounded font-mono text-xs break-all">
            {apiUrl}
          </div>
          {apiUrl.includes('localhost') && (
            <div className="text-red-400 text-xs mt-2 font-bold">
              ⚠️ Using localhost - VITE_API_URL not set in Vercel!
            </div>
          )}
        </div>

        {/* Backend Health Check */}
        <div>
          <div className="text-gray-400 mb-2 font-semibold">🏥 Backend Health Check:</div>
          <button
            onClick={testBackend}
            disabled={testing}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded transition-colors font-medium"
          >
            {testing ? 'Testing...' : 'Test Backend Connection'}
          </button>
          {testResult && (
            <div className={`mt-2 p-3 rounded text-xs ${testResult.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
              {testResult.success ? (
                <div>
                  <div className="text-green-400 font-bold mb-1">✅ Backend is running!</div>
                  <div className="text-gray-300">
                    <pre className="whitespace-pre-wrap break-all">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-red-400 font-bold mb-1">❌ Backend connection failed!</div>
                  <div className="text-gray-300">{testResult.error}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-900/30 border border-yellow-600/50 p-3 rounded">
          <div className="text-yellow-400 font-semibold mb-2">📝 If VITE_API_URL is NOT SET:</div>
          <div className="text-xs space-y-1 text-gray-300">
            <div>1. Go to Vercel Dashboard → Your Project</div>
            <div>2. Settings → Environment Variables</div>
            <div>3. Add: <span className="text-purple-400 font-mono">VITE_API_URL</span></div>
            <div>4. Value: Your Railway URL + /api</div>
            <div>5. Select ALL environments ✅</div>
            <div>6. Save, then Redeploy WITHOUT cache!</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
