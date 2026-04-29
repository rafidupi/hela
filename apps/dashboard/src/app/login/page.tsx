'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const LIME = '#B7FF00';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, loginWithApple, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState<'email' | 'google' | 'apple' | 'reset' | null>(null);

  async function onResetPassword() {
    setError(null);
    setInfo(null);
    if (!email) {
      setError('Ingresa tu correo arriba para enviarte el enlace de recuperación.');
      return;
    }
    setPending('reset');
    try {
      await resetPassword(email);
      setInfo(`Te enviamos un enlace de recuperación a ${email}.`);
    } catch (err) {
      setError(humanizeAuthError(err));
    } finally {
      setPending(null);
    }
  }

  async function withPending(kind: 'email' | 'google' | 'apple', fn: () => Promise<void>) {
    setPending(kind);
    setError(null);
    setInfo(null);
    try {
      await fn();
      router.replace('/dashboard');
    } catch (err) {
      setError(humanizeAuthError(err));
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#0a0c10]">
      {/* Background video — mining footage from landing */}
      <video
        aria-hidden
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="pointer-events-none absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero/mining-hero.mp4" type="video/mp4" />
      </video>

      {/* Subtle brand tint only — no darkening */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 50% at 50% 0%, rgba(183,255,0,0.06) 0%, rgba(183,255,0,0) 60%)',
        }}
      />

      <div className="relative w-full max-w-6xl rounded-[28px] bg-[#FAFAF8]/75 backdrop-blur-2xl backdrop-saturate-75 ring-1 ring-white/20 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* ── Left: form ───────────────────────────────────────── */}
        <div className="px-8 sm:px-14 py-12 sm:py-16 flex flex-col">
          {/* Brand */}
          <div className="flex items-center mb-12">
            <span className="font-bold text-xl tracking-[0.08em] text-neutral-900">
              hela<span style={{ color: LIME }}>.</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 mb-3">
            Iniciar sesión
          </h1>
          <p className="text-sm text-neutral-700 mb-10">
            Bienvenido de vuelta. Ingresa tus credenciales para continuar.
          </p>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void withPending('email', () => login(email, password));
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-700 mb-2">
                Correo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.cl"
                required
                autoComplete="email"
                className="w-full h-12 px-4 rounded-xl bg-white/70 backdrop-blur-sm border border-white/60 text-neutral-900 placeholder:text-neutral-500 outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  disabled={pending !== null}
                  className="text-[11px] font-medium text-neutral-700 hover:text-neutral-900 transition disabled:opacity-50"
                  onClick={() => void onResetPassword()}
                >
                  {pending === 'reset' ? 'Enviando…' : '¿Olvidaste tu contraseña?'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-12 pl-4 pr-12 rounded-xl bg-white/70 backdrop-blur-sm border border-white/60 text-neutral-900 placeholder:text-neutral-500 outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-neutral-600 hover:text-neutral-900 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={pending !== null}
              className="w-full h-12 rounded-xl text-neutral-950 text-sm font-bold uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-95"
              style={{ backgroundColor: LIME }}
            >
              {pending === 'email' ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-neutral-300" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-700">
              o continuar con
            </span>
            <div className="flex-1 h-px bg-neutral-300" />
          </div>

          {/* Social */}
          <div className="flex items-center justify-center gap-3">
            <SocialButton
              label="Google"
              loading={pending === 'google'}
              disabled={pending !== null}
              onClick={() => void withPending('google', loginWithGoogle)}
            >
              <GoogleIcon />
            </SocialButton>
            <SocialButton
              label="Apple"
              loading={pending === 'apple'}
              disabled={pending !== null}
              onClick={() => void withPending('apple', loginWithApple)}
            >
              <AppleIcon />
            </SocialButton>
          </div>

          <p className="mt-auto pt-10 text-xs text-neutral-700">
            ¿Problemas para acceder? Contacta a tu administrador.
          </p>
        </div>

        {/* ── Right: visual ────────────────────────────────────── */}
        <div className="hidden lg:block relative bg-black overflow-hidden">
          {/* Helmet — fills entire panel */}
          <img
            src="/hero/hela-helmet-render.png"
            alt="Casco inteligente Hela"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '15% center' }}
          />

          {/* Subtle vignette + bottom darken for tagline legibility */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%), radial-gradient(80% 60% at 50% 40%, rgba(183,255,0,0.05) 0%, transparent 60%)',
            }}
          />

          {/* Industrial bottom-corner brackets — frame the tagline */}
          <div className="absolute bottom-6 left-6 w-4 h-4 border-b-[1.5px] border-l-[1.5px]" style={{ borderColor: 'rgba(183,255,0,0.5)' }} />
          <div className="absolute bottom-6 right-6 w-4 h-4 border-b-[1.5px] border-r-[1.5px]" style={{ borderColor: 'rgba(183,255,0,0.5)' }} />

          {/* Tracking nodes — pill backdrop so they read on any photo content */}
          <div className="absolute top-8 left-8 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: LIME }} />
            <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: LIME }}>
              Nodo activo
            </div>
          </div>
          <div className="absolute top-8 right-8 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <div
              className="w-2 h-2 rounded-full border"
              style={{ borderColor: LIME }}
            />
            <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: LIME }}>
              Cámara · 360°
            </div>
          </div>

          {/* Tagline */}
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-2">
              Plataforma de seguridad minera
            </div>
            <div className="text-2xl font-medium leading-snug max-w-sm">
              Visibilidad total en terreno, en tiempo real.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SocialButton({
  children,
  label,
  loading,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Continuar con ${label}`}
      disabled={disabled}
      onClick={onClick}
      className="h-14 w-20 sm:w-24 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-400 hover:shadow-md flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
  );
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.2c-.4.4 6.5-4.7 6.5-14.7 0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-neutral-900">
      <path d="M16.365 1.43c0 1.14-.43 2.236-1.213 3.04-.78.793-2.066 1.413-3.21 1.32-.13-1.108.45-2.27 1.193-3.027.794-.812 2.13-1.41 3.23-1.333zM20.5 17.18c-.555 1.28-.82 1.85-1.534 2.98-1 1.585-2.41 3.557-4.156 3.572-1.554.014-1.954-1.013-4.063-1.001-2.108.013-2.55 1.022-4.103 1.008-1.748-.014-3.084-1.793-4.085-3.378-2.797-4.43-3.09-9.628-1.365-12.39 1.226-1.965 3.157-3.114 4.973-3.114 1.847 0 3.012 1.013 4.54 1.013 1.484 0 2.388-1.014 4.526-1.014 1.616 0 3.327.88 4.547 2.4-3.998 2.193-3.348 7.92.72 8.924z" />
    </svg>
  );
}

function humanizeAuthError(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code: string }).code;
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Correo o contraseña incorrectos.';
      case 'auth/invalid-email':
        return 'Ese correo no parece válido.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Cerraste la ventana antes de completar el inicio de sesión.';
      case 'auth/popup-blocked':
        return 'Tu navegador bloqueó la ventana emergente. Habilita los pop-ups e intenta nuevamente.';
      case 'auth/operation-not-allowed':
        return 'Este método de inicio de sesión aún no está habilitado en el proyecto.';
      case 'auth/network-request-failed':
        return 'No se pudo conectar. Revisa tu conexión.';
    }
  }
  return err instanceof Error ? err.message : 'No se pudo iniciar sesión.';
}
