/**
 * Dr.IA — Auth Service (Supabase Auth)
 * Handles: signup, login, logout, session, profile sync
 */
import { supabase } from '../lib/supabaseClient';
import { hasValidSupabaseKeys } from './supabaseService';
import { SessionUser } from '../types';

export interface LoginCredentials { email: string; password: string; }
export interface SignupCredentials { email: string; password: string; name: string; bi: string; role?: 'user' | 'institution' | 'admin'; }

export const authService = {
  isConfigured(): boolean { return hasValidSupabaseKeys(); },
  async getSession() { if (!this.isConfigured()) return null; const { data } = await supabase.auth.getSession(); return data.session; },
  async getUser() { if (!this.isConfigured()) return null; const { data } = await supabase.auth.getUser(); return data.user; },

  async signUp({ email, password, name, bi, role = 'user' }: SignupCredentials) {
    if (!this.isConfigured()) return { error: 'Supabase não configurado.' };
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { name, bi, role } } });
    if (authError) return { error: authError.message };
    if (authData.user) {
      await supabase.from('profiles').upsert({ supabase_user_id: authData.user.id, bi, name, email, role, verification_level: 'Pendente', confidence_score: 80, last_access: new Date().toISOString() }, { onConflict: 'bi' });
    }
    return { data: authData, error: null };
  },

  async login({ email, password }: LoginCredentials) {
    if (!this.isConfigured()) return { error: 'Supabase não configurado.' };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const userId = data.user.id;
      (async () => {
        try {
          const { error: profileErr } = await supabase.from('profiles').update({ last_access: new Date().toISOString() }).eq('supabase_user_id', userId);
          if (profileErr) {
            console.warn('Non-blocking: Failed to update profile last_access:', profileErr.message);
          }
        } catch (e) {
          // ignore
        }
      })();
    }
    return { data, error: null };
  },

  async logout() { if (this.isConfigured()) await supabase.auth.signOut(); },

  async getProfile(userId?: string): Promise<any | null> {
    if (!this.isConfigured()) return null;
    let targetId = userId;
    if (!targetId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      targetId = user.id;
    }
    const { data } = await supabase.from('profiles').select('*').eq('supabase_user_id', targetId).maybeSingle();
    return data;
  },

  async updateProfile(fields: Record<string, any>) {
    if (!this.isConfigured()) return { error: 'Supabase não configurado.' };
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado.' };
    const { error } = await supabase.from('profiles').update(fields).eq('supabase_user_id', user.id);
    return { error: error?.message || null };
  },

  buildSessionUser(profile: any): SessionUser {
    return {
      id: profile?.supabase_user_id || profile?.id || '', name: profile?.name || 'Utente Dr.IA',
      firstName: profile?.name?.split(' ')[0] || 'Utente', lastName: profile?.name?.split(' ').slice(-1)[0] || '',
      bi: profile?.bi || '', nif: profile?.nif || '', passport: profile?.passport || '',
      phone: profile?.phone || '', email: profile?.email || '', birthDate: profile?.birth_date || '',
      filiation: profile?.filiation || '', maritalStatus: profile?.marital_status || '',
      avatarUrl: profile?.avatar_url || '', verificationLevel: profile?.verification_level || 'Pendente',
      confidenceScore: profile?.confidence_score || 80, lastAccess: profile?.last_access || new Date().toISOString(),
    };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!this.isConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange(callback);
  }
};
