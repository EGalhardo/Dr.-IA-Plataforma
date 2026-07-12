import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

const PASS = '✅';
const FAIL = '❌';
const WARN = '⚠️';
let passed = 0, failed = 0, warnings = 0;

function check(d: string, c: boolean, detail?: string) {
  if (c) { console.log(`  ${PASS} ${d}`); passed++; }
  else { console.log(`  ${FAIL} ${d}${detail ? ' — ' + detail : ''}`); failed++; }
}
function warn(d: string) { console.log(`  ${WARN} ${d}`); warnings++; }

async function main() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   Dr.IA — INTEGRATION TEST (Supabase)       ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  console.log('📋 1. ENVIRONMENT CONFIGURATION');
  check('SUPABASE_URL configured', !!url, url?.substring(0, 40) + '...');
  check('SUPABASE_ANON_KEY configured', !!anonKey);
  check('SUPABASE_SERVICE_ROLE_KEY configured', !!serviceKey);

  if (!url || !anonKey) {
    warn('Missing Supabase credentials. Cannot run connection tests.');
    console.log('\n📋 SETUP: Create .env with SUPABASE_URL and SUPABASE_ANON_KEY');
    console.log(`\n📊 Results: ${PASS} ${passed} | ${FAIL} ${failed} | ${WARN} ${warnings}\n`);
    return;
  }

  const supabase = createClient(url, anonKey, { realtime: { transport: ws as any } });
  const adminClient = serviceKey ? createClient(url, serviceKey, { realtime: { transport: ws as any } }) : supabase;

  // 2. CONNECTION
  console.log('\n🔌 2. CONNECTION TEST');
  try {
    const { error } = await supabase.auth.getSession();
    check('Supabase connection alive', !error || error.message.includes('session'), error?.message?.substring(0,60));
  } catch (e: any) { check('Supabase connection', false, e?.message?.substring(0,80)); }

  // 3. DATABASE TABLES
  console.log('\n🗄️ 3. DATABASE — TABLES');
  const tables = ['profiles','messages','contacts','notifications','audit_logs','dria_evaluations'];
  for (const t of tables) {
    try {
      const { count, error } = await supabase.from(t).select('*',{count:'exact',head:true});
      if (error) {
        check(`Table "${t}"`, false, error.message);
        if (t==='dria_evaluations' && error.message.includes('does not exist'))
          warn('Run: supabase/dria_evaluations.sql in Supabase SQL Editor');
      } else check(`Table "${t}" (${count} rows)`, true);
    } catch (e: any) { check(`Table "${t}"`, false, e?.message?.substring(0,80)); }
  }

  // 4. PROFILES CRUD
  console.log('\n👤 4. PROFILES — CRUD');
  const testBI = 'TEST-' + Date.now().toString().slice(-8);
  
  const { error: insErr } = await adminClient.from('profiles').upsert({
    bi: testBI, name: 'Test User Dr.IA', email: 'test@dria.ao', role: 'user',
    verification_level: 'Pendente', confidence_score: 80,
  }, { onConflict: 'bi' });
  check('Insert profile', !insErr, insErr?.message?.substring(0,60));

  const { data: rp } = await supabase.from('profiles').select('bi,name,email').eq('bi',testBI).maybeSingle();
  check('Read profile', !!rp);
  if (rp) {
    check('  Name matches', rp.name==='Test User Dr.IA', rp.name);
    check('  Email matches', rp.email==='test@dria.ao', rp.email);
  }

  const { error: upErr } = await adminClient.from('profiles').update({name:'Test Updated',confidence_score:95}).eq('bi',testBI);
  check('Update profile', !upErr, upErr?.message?.substring(0,60));

  const { data: vp } = await supabase.from('profiles').select('name,confidence_score').eq('bi',testBI).maybeSingle();
  check('Verify update', vp?.name==='Test Updated' && vp?.confidence_score===95);

  const { error: delErr } = await adminClient.from('profiles').delete().eq('bi',testBI);
  check('Delete profile', !delErr, delErr?.message?.substring(0,60));
  const { data: dp } = await supabase.from('profiles').select('bi').eq('bi',testBI).maybeSingle();
  check('Verify deletion', !dp);

  // 5. DRIA_EVALUATIONS
  console.log('\n🏥 5. DRIA_EVALUATIONS — CRUD');
  const { error: tc } = await supabase.from('dria_evaluations').select('*',{count:'exact',head:true});
  if (tc?.message?.includes('does not exist')) {
    warn('dria_evaluations table NOT FOUND — run supabase/dria_evaluations.sql');
  } else {
    const tid = 'test-eval-' + Date.now();
    const { error: ei } = await adminClient.from('dria_evaluations').upsert({
      id: tid, patient_name:'Maria Teste', patient_age:32, patient_gender:'Feminino',
      patient_municipality:'Viana', symptoms:'Febre alta — teste integração',
      priority:'Urgente', ai_summary:'Caso simulado', recommendations:['Hidratação','Repouso'],
      doctor_status:'Aguardando'
    }, { onConflict: 'id' });
    check('Insert dria_eval', !ei, ei?.message?.substring(0,60));

    const { data: re } = await supabase.from('dria_evaluations').select('*').eq('id',tid).maybeSingle();
    check('Read dria_eval', !!re);
    if (re) { check('  Patient name', re.patient_name==='Maria Teste'); check('  Priority', re.priority==='Urgente'); }

    const { error: ue } = await adminClient.from('dria_evaluations').update({doctor_status:'Alta', updated_at:new Date().toISOString()}).eq('id',tid);
    check('Update dria_eval', !ue, ue?.message?.substring(0,60));

    const { data: ve } = await supabase.from('dria_evaluations').select('doctor_status').eq('id',tid).maybeSingle();
    check('Verify update', ve?.doctor_status==='Alta');

    const { error: de } = await adminClient.from('dria_evaluations').delete().eq('id',tid);
    check('Delete dria_eval', !de, de?.message?.substring(0,60));
  }

  // 6. AUTH
  console.log('\n🔐 6. AUTH SERVICE');
  const demoEmail = 'edlasio@dria.ao';
  const demoPass = 'Demo@2026';
  try {
    // SignIn with existing demo user
    const { data: si, error: le } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPass });
    check('SignIn demo user', !le, le?.message?.substring(0,60)||'');
    if (si?.session) {
      check('Session obtained', !!si.session.access_token);
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    check('Get current user', !!user, user?.email||'');

    // Verify user metadata
    if (user) {
      check('User email matches', user.email === demoEmail);
    }

    // Link profile to auth
    const { error: linkErr } = await adminClient
      .from('profiles')
      .update({ supabase_user_id: user?.id })
      .eq('bi', '009874562LA041');
    check('Profile linked', !linkErr, linkErr?.message?.substring(0,60));

    // Read profile via auth
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email, role')
      .eq('bi', '009874562LA041')
      .maybeSingle();
    check('Read profile via auth', !!profile, profile?.name||'');
    if (profile) check('Profile role user', profile.role === 'user');

    const { error: so } = await supabase.auth.signOut();
    check('SignOut', !so, so?.message?.substring(0,60));
  } catch (e: any) { check('Auth flow', false, e?.message?.substring(0,80)); }

  // SUMMARY
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   RESULTS                                    ║');
  console.log('╚══════════════════════════════════════════════╝');
  const total = passed + failed;
  const score = total > 0 ? Math.round((passed/total)*100) : 0;
  console.log(`\n  ${PASS} ${passed} passed  ${FAIL} ${failed} failed  ${WARN} ${warnings} warnings`);
  console.log(`  Score: ${score}% [${'█'.repeat(Math.round(score/5))}${'░'.repeat(20-Math.round(score/5))}]\n`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
