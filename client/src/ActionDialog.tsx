import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
export function ActionDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus=useRef(document.activeElement as HTMLElement|null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLInputElement>("input,select,textarea")?.focus();
    return () => {dialog?.close();if(returnFocus.current?.isConnected)returnFocus.current.focus({preventScroll:true});};
  }, []);
  return (
    <dialog
      ref={ref}
      className="care-action-dialog"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="paper action-form"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        {children}
      </motion.div>
    </dialog>
  );
}
