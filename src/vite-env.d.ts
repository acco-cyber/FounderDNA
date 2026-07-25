/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_GOOGLE_ENABLED?: string;
  readonly VITE_ENABLE_LOCAL_REVIEW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
