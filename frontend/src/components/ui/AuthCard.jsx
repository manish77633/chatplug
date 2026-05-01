import { motion } from 'framer-motion'

export default function AuthCard({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05050a] via-[#05050a] to-[#0f0f1a] flex items-center justify-center px-4 py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 -left-40 w-80 h-80 bg-[#a78bfa]/20 rounded-full mix-blend-screen blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 right-40 w-80 h-80 bg-[#8b5cf6]/20 rounded-full mix-blend-screen blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-gradient-to-b from-[#0f0f1a]/80 to-[#0f0f1a]/40 backdrop-blur-xl border border-[#1f1f35]/50 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6] rounded-xl flex items-center justify-center mb-6">
              <span className="text-white font-bold">E</span>
            </div>
            <h2 className="text-3xl font-bold text-[#f0f0f8] mb-2">{title}</h2>
            <p className="text-[#a0a0b8] text-sm">{subtitle}</p>
          </div>

          {/* Content */}
          {children}

          {/* Decorative bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a78bfa]/30 to-transparent rounded-b-2xl" />
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-[#7a7a95]">
          <span>🔒 Secure</span>
          <span>•</span>
          <span>✨ Fast</span>
          <span>•</span>
          <span>💎 Free</span>
        </div>
      </motion.div>
    </div>
  )
}
