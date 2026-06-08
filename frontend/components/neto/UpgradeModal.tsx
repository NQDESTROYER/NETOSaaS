import { motion, AnimatePresence } from 'framer-motion';

export const UpgradeModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="bg-neutral-900 border border-emerald-500/30 p-8 rounded-[24px] w-[400px] shadow-2xl relative"
      >
        <h2 className="text-2xl font-bold text-white mb-4">¡Pásate a Pro! 🚀</h2>
        <ul className="text-[#888] space-y-2 mb-8">
            <li>✅ NEIA Consultas Ilimitadas</li>
            <li>✅ Bot de WhatsApp Integrado</li>
            <li>✅ Reportes Financieros Avanzados</li>
        </ul>
        <a 
          href="https://mpago.la/1tphbWQ" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block text-center w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 rounded-[12px] hover:scale-[1.02] transition-all"
        >
            Activar Plan Pro por $9.990/mes
        </a>
        <p className="text-[12px] text-gray-400 text-center mt-4">
          🔒 Pago seguro a través de MercadoPago. Una vez completado, tu cuenta Pro se activará en breves minutos.
        </p>
        <a 
          href="https://wa.me/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block text-[12px] text-gray-500 text-center mt-2 hover:text-emerald-400 underline"
        >
          ¿Prefieres pagar por transferencia directa? Contáctanos
        </a>
      </motion.div>
    </div>
  );
};
