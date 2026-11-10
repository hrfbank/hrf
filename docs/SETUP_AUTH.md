# إعداد تسجيل الدخول والنشر (خطوات المستخدم)

الكود جاهز. هذي الخطوات تحتاج حساباتك، وما أقدر أسويها عنك.

## ١. قاعدة البيانات (Supabase)
1. ادخل https://supabase.com/dashboard ← مشروعك ← **SQL Editor** ← **New query**.
2. شغّل الملفات بالترتيب (الصق ← **Run**):
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_letter_stats.sql`
   - `supabase/migrations/003_profiles.sql`

## ٢. Google (مجاني)
1. https://console.cloud.google.com ← أنشئ مشروع (أو اختر مشروع).
2. **APIs & Services** ← **OAuth consent screen**: اسم التطبيق «حروف»، وبريدك.
3. **Credentials** ← **Create Credentials** ← **OAuth client ID** ← نوع **Web application**.
4. في **Authorized redirect URIs** أضف:
   `https://lksngoztobtavuhicnzz.supabase.co/auth/v1/callback`
5. انسخ **Client ID** و **Client Secret**.
6. في Supabase: **Authentication** ← **Sign In / Providers** ← **Google** ← فعّل والصق القيمتين ← **Save**.

## ٣. Apple (يحتاج اشتراك Apple Developer السنوي)
1. https://developer.apple.com ← **Certificates, Identifiers & Profiles**.
2. أنشئ **Services ID** وفعّل **Sign in with Apple**، وحط نفس رابط الـ callback أعلاه، والدومين `lksngoztobtavuhicnzz.supabase.co`.
3. أنشئ **Key** لـ Sign in with Apple ونزّل ملف `.p8`.
4. في Supabase: **Authentication** ← **Providers** ← **Apple** ← فعّل واتبع الحقول (Services ID، Team ID، Key ID، والمفتاح).

> تقدر تبدأ بـ Google بس، وتضيف Apple بعدين. زر Apple يطلع خطأ واضح لين يتفعّل.

## ٤. النشر على Vercel
1. https://vercel.com ← **Add New** ← **Project** ← اختر ريبو `hrfbank/hrf`.
2. **Framework**: Vite. **Build Command**: `npm run build`. **Output**: `dist`.
3. **Environment Variables**:
   - `VITE_SUPABASE_URL` = `https://lksngoztobtavuhicnzz.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = المفتاح العام `sb_publishable_...` (مو secret ولا service_role)
4. **Deploy**. بتحصل رابط مثل `https://hrf.vercel.app`.
5. ارجع لـ Supabase ← **Authentication** ← **URL Configuration**:
   - **Site URL**: رابط Vercel.
   - **Redirect URLs**: أضف رابط Vercel نفسه.

> مشروع Vercel القديم اللي فيه `api/generate-questions` احذفه أو اربطه بالفرع الجديد، لأنه رابط عام يصرف من رصيد OpenAI.

## بعد ما تخلص
قل لي «خلصت الإعداد» وأتحقق من الرابط المنشور.
