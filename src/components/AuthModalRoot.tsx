"use client";

import { useState } from "react";
import { useUIStore } from "@/lib/ui-store";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { signUp, signIn, sendPasswordReset, signInWithOAuth } from "@/lib/auth";
import { useDialogKeyboard } from "@/lib/useDialogKeyboard";

export default function AuthModalRoot() {
  const { authModalOpen, authTab, setAuthTab, closeAuthModal } = useUIStore();
  const { t } = useLocale();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const panelRef = useDialogKeyboard(authModalOpen, closeAuthModal);

  if (!authModalOpen) return null;

  function reset() {
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      if (authTab === "login") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        closeAuthModal();
      } else if (authTab === "register") {
        const { data, error } = await signUp(email, password, fullName);
        if (error) throw error;
        if (data.session) {
          // Project has email confirmation disabled — signUp already returned an
          // active session, so the person is logged in immediately.
          closeAuthModal();
        } else {
          setSuccess("Account created — check your email to confirm, then log in.");
          setAuthTab("login");
        }
      } else if (authTab === "forgot") {
        const { error } = await sendPasswordReset(email);
        if (error) throw error;
        setSuccess(t.auth.resetLinkSent);
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    reset();
    const { error } = await signInWithOAuth(provider);
    if (error) setError(error.message);
  }

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-panel" ref={panelRef} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeAuthModal} aria-label="Close">×</button>

        {authTab !== "forgot" && (
          <div className="modal-tabs">
            <button className={`modal-tab ${authTab === "login" ? "active" : ""}`} onClick={() => { setAuthTab("login"); reset(); }}>
              {t.auth.login}
            </button>
            <button className={`modal-tab ${authTab === "register" ? "active" : ""}`} onClick={() => { setAuthTab("register"); reset(); }}>
              {t.auth.register}
            </button>
          </div>
        )}

        {authTab === "forgot" && <h2 className="serif" style={{ fontSize: "1.4rem", marginBottom: 24 }}>{t.auth.forgotPassword}</h2>}

        {authTab !== "forgot" && (
          <>
            <div className="oauth-row">
              <button className="oauth-btn" onClick={() => handleOAuth("google")} type="button">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.85z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z"/></svg>
                {t.auth.continueWithGoogle}
              </button>
              <button className="oauth-btn" onClick={() => handleOAuth("apple")} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 1.43c0 1.14-.47 2.24-1.19 3.06-.79.9-2.06 1.6-3.11 1.51-.14-1.1.44-2.26 1.16-3.03.8-.86 2.2-1.55 3.14-1.54zM20.6 17.24c-.53 1.22-.79 1.77-1.47 2.85-.96 1.51-2.31 3.39-3.98 3.4-1.48.02-1.86-.96-3.87-.95-2 .01-2.42.97-3.9.95-1.67-.02-2.95-1.72-3.91-3.23C1.06 16.9.4 12.62 2.1 9.66c1.1-1.92 2.98-3.14 5.05-3.17 1.6-.03 3.11 1.08 4.09 1.08.97 0 2.79-1.33 4.71-1.14.8.03 3.06.32 4.51 2.44-.12.07-2.69 1.57-2.66 4.68.03 3.72 3.26 4.96 3.3 4.98-.03.09-.51 1.76-1.5 3.71z"/></svg>
                {t.auth.continueWithApple}
              </button>
            </div>
            <div className="divider-or">or</div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          {authTab === "register" && (
            <div className="form-field">
              <label>{t.auth.fullName}</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}
          <div className="form-field">
            <label>{t.auth.email}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {authTab !== "forgot" && (
            <div className="form-field">
              <label>{t.auth.password}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
          )}

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button className="btn btn-dark" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
            {loading ? "…" : authTab === "login" ? t.auth.login : authTab === "register" ? t.auth.register : t.auth.sendResetLink}
          </button>
        </form>

        <div className="modal-foot">
          {authTab === "login" && (
            <button onClick={() => { setAuthTab("forgot"); reset(); }}>{t.auth.forgotPassword}</button>
          )}
          {authTab === "forgot" && (
            <button onClick={() => { setAuthTab("login"); reset(); }}>{"← " + t.auth.login}</button>
          )}
        </div>
      </div>
    </div>
  );
}
