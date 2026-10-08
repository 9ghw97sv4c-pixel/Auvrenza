"use client";

import { useEffect, useRef } from "react";

/**
 * Shared accessibility behavior for modal/drawer overlays (auth modal, cart
 * drawer): Escape closes it, focus moves into the panel when it opens, and
 * Tab/Shift+Tab is trapped within the panel while it's open so keyboard users
 * can't tab into the page content sitting behind the overlay.
 *
 * Usage: const panelRef = useDialogKeyboard(isOpen, onClose);
 *        <div ref={panelRef} className="modal-panel"> ... </div>
 */
export function useDialogKeyboard(isOpen: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
    );
    // Move focus into the panel so keyboard/screen-reader users land inside it
    // instead of it opening silently around wherever focus already was.
    focusable?.[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return panelRef;
}
