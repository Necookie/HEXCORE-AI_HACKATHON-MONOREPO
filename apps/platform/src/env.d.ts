/// <reference types="astro/client" />
import type { User } from '@supabase/supabase-js';

declare namespace App {
  interface Locals {
    user: User;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly N8N_WEBHOOK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
