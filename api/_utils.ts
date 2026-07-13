import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import Groq from 'groq-sdk';

// Vercel serverless function types
export type VercelRequest = {
  method: string;
  body: any;
  query: Record<string, string>;
  headers: Record<string, string>;
};

export type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
};

// Initialize clients lazily to avoid cold start issues
let supabaseAdmin: ReturnType<typeof createClient> | null = null;
let ai: GoogleGenAI | null = null;
let groq: Groq | null = null;

export function getSupabaseAdmin(): ReturnType<typeof createClient> | null {
  if (!supabaseAdmin) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      '';
    if (url && serviceKey) {
      supabaseAdmin = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
    }
  }
  return supabaseAdmin;
}

export function getAI(): GoogleGenAI | null {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (apiKey) {
      try {
        ai = new GoogleGenAI({
          apiKey,
          apiVersion: 'v1beta',
          httpOptions: { headers: { 'User-Agent': 'vercel-deploy' } }
        });
      } catch (e) {
        console.warn('Failed to instantiate GoogleGenAI client:', e);
      }
    }
  }
  return ai;
}

export function getGroq(): Groq | null {
  if (!groq) {
    const groqApiKey = process.env.GROQ_API_KEY || process.env.Teste01 || '';
    if (groqApiKey) {
      try {
        groq = new Groq({ apiKey: groqApiKey });
      } catch (e) {
        console.warn('Failed to instantiate Groq client:', e);
      }
    }
  }
  return groq;
}

export function getRuntimeFlags() {
  return {
    local_bootstrap: (process.env.VITE_ENABLE_LOCAL_BOOTSTRAP || 'true') !== 'false',
    mock_fallback: (process.env.VITE_ENABLE_MOCK_FALLBACK || 'true') !== 'false',
    supabase_auto_seed: (process.env.VITE_ENABLE_SUPABASE_AUTO_SEED || 'false') === 'true',
  };
}

export function handleCors(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return true;
  }
  return false;
}

export function requirePost(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }
  return true;
}