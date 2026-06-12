


export const SB_URL = 'https://tvtfoghrdqwssdwvebuo.supabase.co';
export const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dGZvZ2hyZHF3c3Nkd3ZlYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzk2ODksImV4cCI6MjA5NTgxNTY4OX0.n_CRdzQQKYNGDHYmoVxyKafFJCfezKKlSiZddx8MXH4';

export function sb(env) {
  const base = ((env && env.SUPABASE_URL) || SB_URL).replace(/\/$/, '');
  const key = (env && env.SUPABASE_ANON_KEY) || SB_ANON;
  return { base, key, headers: { apikey: key, authorization: `Bearer ${key}` } };
}
