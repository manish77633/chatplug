import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, Shield, Globe, Code2, ArrowRight, Bot, Sparkles, CheckCircle2 } from 'lucide-react'
import Navbar from '../components/ui/Navbar'
import Button from '../components/ui/Button'

const features = [
  { icon: Bot,    title: 'Multi-Chatbot',    desc: 'Create unlimited knowledge bases for different use cases.' },
  { icon: Zap,    title: 'RAG Pipeline',     desc: 'Vector search with Pinecone for accurate, context-aware answers.' },
  { icon: Shield, title: 'Secure & Private', desc: 'JWT auth, rate limiting, and domain restrictions built-in.' },
  { icon: Globe,  title: 'Easy Embed',       desc: 'One <script> tag. Works on any website or framework.' },
  { icon: Code2,  title: 'PDF & URL Import', desc: 'Train on documents, web pages, or plain text instantly.' },
  { icon: Sparkles, title: 'AI Powered',     desc: 'Built with GPT-4 for intelligent, context-aware responses.' },
]

const testimonials = [
  { name: 'Sarah Chen', role: 'Product Manager', text: 'ChatPlug saved us 40 hours of development time.' },
  { name: 'James Wilson', role: 'CTO', text: 'The RAG pipeline accuracy is impressive. Highly recommended.' },
  { name: 'Emily Rodriguez', role: 'Founder', text: 'Best decision for our customer support automation.' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white bg-grid relative selection:bg-acid/10 selection:text-acid">
      <Navbar isAuthenticated={false} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Glowing Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-acid/5 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute top-[10%] right-[-10%] w-[30%] h-[30%] bg-violet/5 rounded-full blur-[100px] animate-pulse-slow" />
        </div>

        <div className="container-md relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center space-y-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-sm text-sm font-medium text-muted">
                <Sparkles size={14} className="text-acid" /> 
                <span className="bg-gradient-to-r from-acid to-violet bg-clip-text text-transparent">Now with RAG 2.0 Engine</span>
              </span>
            </motion.div>

            {/* Main heading */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-text leading-[1.1]">
                Train AI on your <br />
                <span className="text-gradient">own content</span>
              </h1>
              <p className="text-xl md:text-2xl text-dim max-w-2xl mx-auto leading-relaxed">
                Build and embed a context-aware chatbot in minutes. 
                Experience premium AI integration for your business.
              </p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              className="flex items-center justify-center gap-4 flex-wrap pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link to="/register">
                <Button variant="primary" size="lg" className="h-14 px-10 text-lg shadow-xl shadow-acid/20">
                  Start Building <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/docs">
                <Button variant="secondary" size="lg" className="h-14 px-10 text-lg">
                  Documentation
                </Button>
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              className="flex items-center justify-center gap-8 flex-wrap text-sm font-medium text-dim/60 pt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <span className="flex items-center gap-2">✓ No card required</span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span className="flex items-center gap-2">✓ Free forever tier</span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span className="flex items-center gap-2">✓ Developer-first</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing relative bg-surface/50 border-y border-border/50">
        <div className="container-md">
          <motion.div
            className="text-center mb-20 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-text tracking-tight">Powerful Capabilities</h2>
            <p className="text-xl text-dim max-w-2xl mx-auto">Everything you need for enterprise-grade AI chatbots</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="card card-hover p-10 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                  <f.icon size={120} />
                </div>
                <div className="w-14 h-14 bg-white border border-border rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md group-hover:border-acid/20 transition-all">
                  <f.icon className="text-acid" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-text mb-4 group-hover:text-acid transition-colors">{f.title}</h3>
                <p className="text-dim text-lg leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section-spacing">
        <div className="container-md">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-text tracking-tight mb-4">How It Works</h2>
            <p className="text-xl text-dim max-w-2xl mx-auto">Zero to production in under 5 minutes</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Connect Data', desc: 'Sync PDFs, websites, or Notion pages instantly.' },
              { step: '02', title: 'Fine-tune', desc: 'Adjust tone, behavior, and appearance settings.' },
              { step: '03', title: 'Go Live', desc: 'Paste the embed code and start chatting.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="relative group text-center md:text-left"
              >
                <div className="text-7xl font-black text-border/40 group-hover:text-acid/10 transition-colors mb-4">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-text mb-4">{item.title}</h3>
                <p className="text-dim text-lg leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden lg:block absolute top-10 -right-4 w-8 h-px bg-border group-hover:bg-acid/20 transition-colors" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-spacing bg-surface/30">
        <div className="container-md">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-text tracking-tight mb-4">Loved by Teams</h2>
            <p className="text-xl text-dim">Trusted by modern startups and developers</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="card p-10 bg-white shadow-xl shadow-slate-200/50"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-acid text-xl">★</span>
                  ))}
                </div>
                <p className="text-text/80 mb-8 text-lg leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-acid to-violet flex items-center justify-center text-white font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-text text-lg">{t.name}</p>
                    <p className="text-sm text-dim">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing overflow-hidden relative">
        <div className="absolute inset-0 bg-acid/5 -skew-y-3 origin-right" />
        <div className="container-sm relative z-10 text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-5xl md:text-7xl font-black text-text leading-tight tracking-tight">
              Ready to <br /> <span className="text-gradient">automate support?</span>
            </h2>
            <p className="text-xl md:text-2xl text-dim max-w-xl mx-auto leading-relaxed">
              Join 500+ businesses using EmbedIQ to power their customer intelligence.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap pt-6">
              <Link to="/register">
                <Button variant="primary" size="lg" className="h-14 px-12 text-lg shadow-2xl shadow-acid/30">
                  Join Now <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/docs">
                <Button variant="secondary" size="lg" className="h-14 px-12 text-lg">
                  View Setup
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-12 px-4 bg-white">
        <div className="container-md flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-acid rounded-lg" />
            <span className="text-2xl font-bold text-text tracking-tight">EmbedIQ</span>
          </div>
          <p className="text-dim font-medium">© 2024 EmbedIQ. Built for the modern web.</p>
          <div className="flex gap-8 text-muted font-medium">
            <a href="#" className="hover:text-acid transition-colors">Privacy</a>
            <a href="#" className="hover:text-acid transition-colors">Terms</a>
            <a href="#" className="hover:text-acid transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
