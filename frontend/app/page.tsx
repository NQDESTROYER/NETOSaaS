'use client';
import { motion } from 'framer-motion';
import Script from 'next/script';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Holo3DIntegration } from '@/components/ui/holographic/Holo3DIntegration';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-blue-500/30">
      <header className="p-6 flex justify-between items-center backdrop-blur-md bg-black/50 border-b border-white/10 sticky top-0 z-50">
        <h1 className="text-2xl font-bold tracking-tighter">NETO</h1>
        <div className="flex gap-4">
          <Link href="/login"><Button variant="ghost">Iniciar sesión</Button></Link>
          <Link href="/register"><Button className="rounded-full bg-white text-black hover:bg-gray-200">Empezar gratis</Button></Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20">
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="pb-4"
          >
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-r from-white via-blue-200 to-indigo-400 bg-clip-text text-transparent leading-[1.1] pb-2">
              Control visual <br /> para tu negocio
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-10">
              Transforma la gestión de inventario y caja en una experiencia premium. Automatiza con IA.
            </p>
            <Link href="/register"><Button size="lg" className="rounded-full text-lg px-8">Explora NETO</Button></Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Holo3DIntegration />
          </motion.div>
        </section>

        <section className="mt-32 grid md:grid-cols-3 gap-8">
          {[
            { title: 'Gestión Visual', desc: 'Controla stock con interfaz estilo carrito.' },
            { title: 'Consultor IA', desc: 'Pregunta sobre tus finanzas en lenguaje natural.' },
            { title: 'Bot WhatsApp', desc: 'Automatiza ventas y responde preguntas 24/7.' }
          ].map((feature) => (
            <motion.div 
              key={feature.title}
              whileHover={{ y: -10 }}
              className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-colors"
            >
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>
      
      <Script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" strategy="lazyOnload" />
    </div>
  );
}
