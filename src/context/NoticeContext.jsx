import React, { createContext, useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const NoticeContext = createContext({
  showNotice: () => {},
});

export function NoticeProvider({ children }) {
  const [notice, setNotice] = useState("");
  const timerRef = useRef(null);

  const showNotice = useCallback((message, duration = 1800) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setNotice(message);
    timerRef.current = setTimeout(() => {
      setNotice("");
    }, duration);
  }, []);

  const value = useMemo(() => ({ showNotice }), [showNotice]);

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {notice ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[90] rounded-[var(--radius-pill)] px-5 py-3 text-sm font-semibold text-[var(--color-text-on-accent)] shadow-[var(--shadow-accent)]"
            style={{ background: "var(--gradient-accent)" }}
          >
            {notice}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </NoticeContext.Provider>
  );
}
