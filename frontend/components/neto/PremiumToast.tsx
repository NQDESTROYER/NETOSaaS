import { motion, AnimatePresence } from 'framer-motion';

export const PremiumToast = ({ message, isVisible, onClose }: { message: string, isVisible: boolean, onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-6 right-6 z-[100] bg-neutral-900/80 backdrop-blur-md border border-emerald-500/50 p-4 rounded-[16px] shadow-2xl flex items-center gap-3 text-white"
        >
          <span className="text-2xl">📈</span>
          <p className="text-[14px] font-medium">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
