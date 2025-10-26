import { motion } from 'motion/react';

interface GoogleSignInButtonProps {
  isDark?: boolean;
}

export function GoogleSignInButton({ isDark = false }: GoogleSignInButtonProps) {
  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth endpoint
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <motion.button
      onClick={handleGoogleSignIn}
      className={`w-full py-3 px-4 rounded-xl flex items-center justify-center space-x-3 border transition-all duration-200 ${
        isDark
          ? 'bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50'
          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.8055 10.2292C19.8055 9.55129 19.7501 8.86766 19.6325 8.19849H10.2002V12.0492H15.6014C15.3775 13.2911 14.6571 14.3898 13.6025 15.0879V17.5866H16.8251C18.7175 15.8449 19.8055 13.2728 19.8055 10.2292Z" fill="#4285F4"/>
        <path d="M10.2002 20.0006C12.9522 20.0006 15.2716 19.1151 16.8289 17.5865L13.6063 15.0879C12.7085 15.6979 11.5469 16.0433 10.2041 16.0433C7.5449 16.0433 5.28628 14.283 4.48297 11.9165H1.16699V14.4923C2.75996 17.8403 6.3104 20.0006 10.2002 20.0006Z" fill="#34A853"/>
        <path d="M4.47908 11.9166C4.06306 10.6747 4.06306 9.33017 4.47908 8.08829V5.5125H1.16699C-0.389916 8.51644 -0.389916 12.4882 1.16699 15.4921L4.47908 11.9166Z" fill="#FBBC04"/>
        <path d="M10.2002 3.95805C11.6241 3.936 13.0009 4.47247 14.0395 5.45722L16.8936 2.60218C15.1858 0.990818 12.9364 0.0808105 10.2002 0.106492C6.3104 0.106492 2.75996 2.26681 1.16699 5.61252L4.47908 8.18827C5.27849 5.81741 7.54101 3.95805 10.2002 3.95805Z" fill="#EA4335"/>
      </svg>
      <span>Continue with Google</span>
    </motion.button>
  );
}
