"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/ui-store";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function ForgotPasswordPage() {
  const { openAuthModal } = useUIStore();
  const { t } = useLocale();

  useEffect(() => {
    openAuthModal("forgot");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="section" style={{ paddingTop: 180, minHeight: "60vh", textAlign: "center" }}>
      <div className="wrap">
        <span className="eyebrow">{t.common.account}</span>
        <h1 className="serif" style={{ fontSize: "1.8rem", marginBottom: 20 }}>{t.auth.forgotPassword}</h1>
        <button className="btn btn-dark" onClick={() => openAuthModal("forgot")}>{t.auth.sendResetLink}</button>
      </div>
    </main>
  );
}
