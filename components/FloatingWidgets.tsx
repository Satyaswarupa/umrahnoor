"use client";

import { useEffect, useState } from "react";
import AgentPromoWidget from "@/components/AgentPromoWidget";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";

// Owns the promo card's visible/dismissed state so WhatsAppFloatButton can
// stack itself above the card while it's showing and drop back to the
// corner once it's dismissed (or before its entrance delay finishes).
export default function FloatingWidgets() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const showId = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(showId);
  }, []);

  return (
    <>
      <AgentPromoWidget visible={visible} dismissed={dismissed} onDismiss={() => setDismissed(true)} />
      <WhatsAppFloatButton stacked={visible && !dismissed} />
    </>
  );
}
