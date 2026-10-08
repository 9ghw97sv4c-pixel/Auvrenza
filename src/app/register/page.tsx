"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUIStore } from "@/lib/ui-store";
import { useUser } from "@/lib/auth";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function RegisterPage() {
  const { openAuthModal } = useUIStore();
  const { user, isLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();

  useEffect(() => {
    openAuthModal("register");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      router.push(searchParams.get("redirect") ?? "/");
    }
  }, [isLoading, user, router, searchParams]);

  return (
    <main className="section" style={{ paddingTop: 180, minHeight: "60vh", textAlign: "center" }}>
      <div className="wrap">
        <span className="eyebrow">{t.common.account}</span>
        <h1 className="serif" style={{ fontSize: "1.8rem", marginBottom: 20 }}>{t.auth.register}</h1>
        <button className="btn btn-dark" onClick={() => openAuthModal("register")}>{t.auth.register}</button>
      </div>
    </main>
  );
}
