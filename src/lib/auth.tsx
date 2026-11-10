// تسجيل الدخول (لصاحب اللعبة فقط) عبر Supabase Auth: Apple و Google.
// يشتغل في النسخة المنشورة (Vercel) لما تكون متغيرات البيئة موجودة.
// داخل Claude ما فيه مفاتيح، فتبقى اللعبة متاحة بدون تسجيل مع تنبيه.
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const authEnabled = Boolean(url && key);
// PKCE: الرجوع من Apple/Google يكون بـ ?code= في الرابط، فما يتعارض مع روابط الموقع (#/...)
export const supabase: SupabaseClient | null = authEnabled
  ? createClient(url!, key!, { auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true } })
  : null;

export type Provider = "apple" | "google";

export type Player = { id: string; name: string; email: string | null; avatar: string | null };

type AuthState = {
  enabled: boolean;
  loading: boolean;
  player: Player | null;
  /** صاحب اللعبة (المطوّر): يشوف بنك الأسئلة والأجوبة كامل. */
  isAdmin: boolean;
  /** في النسخة بدون تسجيل دخول: يعاين اللعبة مثل اللاعب العادي. */
  previewAsPlayer: boolean;
  setPreviewAsPlayer: (on: boolean) => void;
  signIn: (p: Provider) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  enabled: false,
  loading: false,
  player: null,
  isAdmin: false,
  previewAsPlayer: false,
  setPreviewAsPlayer: () => undefined,
  signIn: async () => "تسجيل الدخول غير متاح هنا",
  signOut: async () => undefined,
});

function toPlayer(session: Session | null): Player | null {
  const u = session?.user;
  if (!u) return null;
  const m = u.user_metadata ?? {};
  return {
    id: u.id,
    name: (m.full_name || m.name || u.email?.split("@")[0] || "لاعب") as string,
    email: u.email ?? null,
    avatar: (m.avatar_url || m.picture || null) as string | null,
  };
}

const PREVIEW_KEY = "hrf-preview-player";
const readPreview = () => {
  try {
    return localStorage.getItem(PREVIEW_KEY) === "1";
  } catch {
    return false;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(authEnabled);
  const [serverAdmin, setServerAdmin] = useState(false);
  const [previewAsPlayer, setPreview] = useState(readPreview);

  // مع تسجيل الدخول: صاحب اللعبة يتحدد من جدول admins في Supabase (مو من المتصفح)
  useEffect(() => {
    if (!supabase || !player) {
      setServerAdmin(false);
      return;
    }
    supabase.rpc("is_admin").then(({ data }) => setServerAdmin(data === true));
  }, [player?.id]);

  function setPreviewAsPlayer(on: boolean) {
    setPreview(on);
    try {
      localStorage.setItem(PREVIEW_KEY, on ? "1" : "0");
    } catch {
      /* التخزين غير متاح */
    }
  }

  // بدون تسجيل دخول (نسخة Claude الخاصة فيك): أنت صاحب اللعبة، إلا لو فعّلت «معاينة كلاعب»
  const isAdmin = authEnabled ? serverAdmin : !previewAsPlayer;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setPlayer(toPlayer(data.session));
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setPlayer(toPlayer(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn(provider: Provider) {
    if (!supabase) return "تسجيل الدخول غير متاح في هذه النسخة";
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/` },
    });
    return error ? error.message : null;
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setPlayer(null);
  }

  return <AuthContext.Provider value={{ enabled: authEnabled, loading, player, isAdmin, previewAsPlayer, setPreviewAsPlayer, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
