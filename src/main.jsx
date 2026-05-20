import { useState, useEffect } from "react";

// ─── Constantes ──────────────────────────────────────────────────────────────
const TEAM = ['Neto', 'Victor', 'Leandro', 'Emily'];
const AVATAR_BG = ['#6366f1', '#8b5cf6', '#0891b2', '#059669'];

const STATUSES = ['Pendente', 'Em Desenvolvimento', 'Concluído'];
const STATUS_STYLE = {
  'Pendente':            { dot: '#f59e0b', bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
  'Em Desenvolvimento':  { dot: '#3b82f6', bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
  'Concluído':           { dot: '#10b981', bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
};

const CRITERIA = [
  { key: 'volume',      label: 'Volume de Dados',                w: 0.20, d1: 'Poucas linhas/tabelas',          d5: 'Milhões de linhas/muitas tabelas'              },
  { key: 'transform',   label: 'Complexidade de Transformação',  w: 0.20, d1: 'Carga simples',                  d5: 'Transformações pesadas, merges, regras complexas' },
  { key: 'frequency',   label: 'Frequência de Atualização',      w: 0.15, d1: 'Semanal / Mensal',               d5: 'Diária ou intra-day'                           },
  { key: 'dax',         label: 'Complexidade DAX & Modelagem',   w: 0.15, d1: 'Medidas simples',                d5: 'Cálculos pesados, alta cardinalidade'           },
  { key: 'audience',    label: 'Audiência Esperada',             w: 0.10, d1: '1 a 3 usuários',                 d5: 'Grande audiência ou clientes externos'         },
  { key: 'rls',         label: 'RLS & Segurança',                w: 0.10, d1: 'Sem RLS',                        d5: 'RLS por usuário, cliente ou filial'             },
  { key: 'criticality', label: 'Criticidade Operacional',        w: 0.10, d1: 'Consulta ocasional',             d5: 'Core ops · Visibilidade C-Level/Diretoria'     },
];

const TIERS = [
  { label: 'Muito Pequeno',  min: 1.0, color: '#15803d', light: '#f0fdf4', border: '#bbf7d0', f4: 'R$ 35 a R$ 105',        f8: 'R$ 67 a R$ 201'       },
  { label: 'Pequeno',        min: 2.0, color: '#1d4ed8', light: '#eff6ff', border: '#bfdbfe', f4: 'R$ 105 a R$ 175',       f8: 'R$ 201 a R$ 335'      },
  { label: 'Médio',          min: 3.0, color: '#b45309', light: '#fffbeb', border: '#fde68a', f4: 'R$ 210 a R$ 350',       f8: 'R$ 402 a R$ 670'      },
  { label: 'Grande',         min: 3.8, color: '#c2410c', light: '#fff7ed', border: '#fed7aa', f4: 'R$ 385 a R$ 700',       f8: 'R$ 737 a R$ 1.340'    },
  { label: 'Crítico/Pesado', min: 4.5, color: '#b91c1c', light: '#fff1f2', border: '#fecdd3', f4: 'R$ 735 a R$ 1.225+',   f8: 'R$ 1.407 a R$ 2.345+' },
];

const SCORE_COLORS = ['#16a34a', '#65a30d', '#ca8a04', '#ea580c', '#dc2626'];

const SAMPLES = [
  { id: '1', name: 'Dashboard Comercial', client: 'Acme Corp', requesterName: 'João Silva', requesterEmail: 'joao@acme.com', targetDate: '2025-07-15', sourceTables: 'CRM, ERP', plan: 'F4', scores: { volume:4, transform:3, frequency:4, dax:3, audience:3, rls:2, criticality:4 }, finalScore: 3.35, status: 'Em Desenvolvimento', assignee: 'Victor', createdAt: '2025-05-01' },
  { id: '2', name: 'KPIs Financeiros', client: 'Beta Ltda', requesterName: 'Maria Costa', requesterEmail: 'maria@beta.com', targetDate: '2025-08-01', sourceTables: 'SAP FI, Oracle', plan: 'F8', scores: { volume:5, transform:5, frequency:3, dax:5, audience:4, rls:4, criticality:5 }, finalScore: 4.55, status: 'Pendente', assignee: 'Neto', createdAt: '2025-05-03' },
  { id: '3', name: 'Relatório de Estoque', client: 'Gamma SA', requesterName: 'Carlos Mendes', requesterEmail: 'carlos@gamma.com', targetDate: '2025-06-30', sourceTables: 'WMS', plan: 'F4', scores: { volume:2, transform:2, frequency:2, dax:1, audience:1, rls:1, criticality:2 }, finalScore: 1.75, status: 'Concluído', assignee: 'Emily', createdAt: '2025-04-20' },
  { id: '4', name: 'Análise de Vendas Regional', client: 'Delta Corp', requesterName: 'Ana Ferreira', requesterEmail: 'ana@delta.com', targetDate: '2025-07-20', sourceTables: 'SQL Server, Excel', plan: 'F4', scores: { volume:3, transform:4, frequency:3, dax:4, audience:3, rls:3, criticality:3 }, finalScore: 3.35, status: 'Pendente', assignee: null, createdAt: '2025-05-10' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTier(score) {
  for (let i = TIERS.length - 1; i >= 0; i--)
    if (score >= TIERS[i].min) return TIERS[i];
  return null;
}

function calcScore(s) {
  return (s.volume||0)*0.20 + (s.transform||0)*0.20 + (s.frequency||0)*0.15
       + (s.dax||0)*0.15 + (s.audience||0)*0.10 + (s.rls||0)*0.10 + (s.criticality||0)*0.10;
}

const EMPTY_SCORES = { volume:0, transform:0, frequency:0, dax:0, audience:0, rls:0, criticality:0 };
const EMPTY_FORM = { name:'', client:'', requesterName:'', requesterEmail:'', targetDate:'', sourceTables:'', plan:'F4', scores:{ ...EMPTY_SCORES } };

const inp = {
  width:'100%', padding:'8px 11px', border:'1.5px solid #e2e8f0', borderRadius:8,
  fontSize:13, color:'#1e293b', background:'white', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit',
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,        setTab]        = useState('form');
  const [projects,   setProjects]   = useState(SAMPLES);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [toast,      setToast]      = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [ready,      setReady]      = useState(false);

  // ── Persistência ──
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get('bi_projects');
        if (r?.value) {
          const data = JSON.parse(r.value);
          if (Array.isArray(data) && data.length > 0) setProjects(data);
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.storage.set('bi_projects', JSON.stringify(projects)).catch(() => {});
  }, [projects, ready]);

  // ── Score em tempo real ──
  const raw = calcScore(form.scores);
  const allFilled = Object.values(form.scores).every(v => v > 0);
  const tier = allFilled ? getTier(raw) : null;
  const canSave = form.name.trim() && form.client.trim() && allFilled;

  function notify(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }

  function handleSave() {
    if (!canSave) return;
    const score = parseFloat(raw.toFixed(2));
    const t = getTier(score);
    setProjects(prev => [{
      id: Date.now().toString(), ...form, finalScore: score,
      status: 'Pendente', assignee: null,
      createdAt: new Date().toISOString().split('T')[0],
    }, ...prev]);
    setForm(EMPTY_FORM);
    notify('Projeto salvo com sucesso!');
    setTab('pipeline');
  }

  function update(id, changes) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p));
  }

  function remove(id) {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (expandedId === id) setExpandedId(null);
    notify('Projeto removido.', 'info');
  }

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:"'Outfit', 'DM Sans', system-ui, sans-serif", color:'#1e293b' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
      <style>{`
        button:hover { opacity: 0.88; }
        input:focus, select:focus { border-color: #a5b4fc !important; box-shadow: 0 0 0 3px #eef2ff; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:16, right:16, zIndex:9999, background: toast.type==='ok' ? '#16a34a' : '#2563eb', color:'white', padding:'10px 18px', borderRadius:10, fontSize:13, fontWeight:600, boxShadow:'0 8px 24px rgba(0,0,0,0.2)', display:'flex', alignItems:'center', gap:8, animation:'fadeIn 0.2s ease' }}>
          <span style={{ fontSize:16 }}>{toast.type==='ok' ? '✓' : 'ℹ'}</span> {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <header style={{ background:'white', borderBottom:'1px solid #e2e8f0', padding:'0 24px', height:56, display:'flex', alignItems:'center', gap:16, position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <rect x="1"  y="10" width="3.5" height="6"  rx="1" fill="white" opacity="0.65"/>
              <rect x="6.5" y="6" width="3.5" height="10" rx="1" fill="white" opacity="0.82"/>
              <rect x="12" y="1" width="3.5" height="15" rx="1" fill="white"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:'#1e293b', letterSpacing:'-0.3px', lineHeight:1 }}>BI Planner</div>
            <div style={{ fontSize:9, color:'#94a3b8', fontFamily:'JetBrains Mono, monospace', letterSpacing:'0.8px' }}>GOVERNANCE & PIPELINE</div>
          </div>
        </div>

        <div style={{ display:'flex', background:'#f1f5f9', padding:3, borderRadius:10, gap:2 }}>
          {[['form', '＋ Nova Estimativa'], ['pipeline', '⊞ Pipeline']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:'6px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit', background: tab===t ? 'white' : 'transparent', color: tab===t ? '#6366f1' : '#64748b', boxShadow: tab===t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition:'all 0.15s' }}>{l}</button>
          ))}
        </div>

        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:3 }}>
          <span style={{ fontSize:11, color:'#94a3b8', marginRight:6, fontWeight:500 }}>Equipe</span>
          {TEAM.map((m, i) => (
            <div key={m} title={m} style={{ width:30, height:30, borderRadius:'50%', background:AVATAR_BG[i], display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'white', border:'2px solid white', marginLeft:-6, cursor:'default', boxShadow:'0 1px 3px rgba(0,0,0,0.15)' }}>{m[0]}</div>
          ))}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          TAB 1 – FORMULÁRIO DE ESTIMATIVA
      ═══════════════════════════════════════════════════ */}
      {tab === 'form' && (
        <main style={{ maxWidth:840, margin:'0 auto', padding:'28px 20px 56px' }}>

          {/* Parte A: Metadados */}
          <Section icon="📋" title="Informações do Projeto">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Fld label="Nome do Dashboard *">
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Ex: Dashboard Comercial Q3" style={inp} />
              </Fld>
              <Fld label="Cliente / Empresa *">
                <input value={form.client} onChange={e => setForm(f => ({...f, client: e.target.value}))} placeholder="Ex: Acme Corp" style={inp} />
              </Fld>
              <Fld label="Nome do Solicitante">
                <input value={form.requesterName} onChange={e => setForm(f => ({...f, requesterName: e.target.value}))} placeholder="Nome completo" style={inp} />
              </Fld>
              <Fld label="E-mail do Solicitante">
                <input type="email" value={form.requesterEmail} onChange={e => setForm(f => ({...f, requesterEmail: e.target.value}))} placeholder="email@empresa.com" style={inp} />
              </Fld>
              <Fld label="Data de Entrega Alvo">
                <input type="date" value={form.targetDate} onChange={e => setForm(f => ({...f, targetDate: e.target.value}))} style={inp} />
              </Fld>
              <Fld label="Tabelas Fonte / Origem dos Dados">
                <input value={form.sourceTables} onChange={e => setForm(f => ({...f, sourceTables: e.target.value}))} placeholder="Ex: CRM, SAP FI, WMS, Excel" style={inp} />
              </Fld>
            </div>
            <div style={{ marginTop:16 }}>
              <Fld label="Plano de Referência">
                <div style={{ display:'flex', gap:8, marginTop:4 }}>
                  {['F4','F8'].map(p => (
                    <button key={p} onClick={() => setForm(f => ({...f, plan: p}))} style={{ padding:'9px 28px', borderRadius:9, border:`2px solid ${form.plan===p ? '#6366f1' : '#e2e8f0'}`, background: form.plan===p ? '#eef2ff' : 'white', color: form.plan===p ? '#6366f1' : '#94a3b8', fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'JetBrains Mono, monospace', transition:'all 0.15s' }}>{p}</button>
                  ))}
                </div>
              </Fld>
            </div>
          </Section>

          {/* Parte B: Avaliação Técnica */}
          <Section icon="🎯" title="Avaliação Técnica" style={{ marginTop:14 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {CRITERIA.map(c => (
                <div key={c.key}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{c.label}</span>
                      <span style={{ fontSize:10, color:'#6366f1', background:'#eef2ff', padding:'1px 6px', borderRadius:4, fontFamily:'JetBrains Mono, monospace', fontWeight:700 }}>×{c.w.toFixed(2)}</span>
                    </div>
                    <span style={{ fontSize:10, color:'#94a3b8', textAlign:'right' }}>
                      1 → {c.d1} &nbsp;·&nbsp; 5 → {c.d5}
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:7 }}>
                    {[1,2,3,4,5].map(v => {
                      const active = form.scores[c.key] === v;
                      const col = SCORE_COLORS[v-1];
                      return (
                        <button key={v} onClick={() => setForm(f => ({...f, scores: {...f.scores, [c.key]: v}}))} style={{
                          flex:1, padding:'11px 0', borderRadius:9,
                          border:`2px solid ${active ? col+'aa' : '#e2e8f0'}`,
                          background: active ? col+'1a' : 'white',
                          color: active ? col : '#c0cdd8',
                          fontWeight:700, fontSize:16, cursor:'pointer',
                          fontFamily:'JetBrains Mono, monospace',
                          transition:'all 0.12s',
                          transform: active ? 'translateY(-1px)' : 'none',
                          boxShadow: active ? `0 2px 8px ${col}33` : 'none',
                        }}>{v}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Parte C: Resultado em tempo real */}
          <div style={{ display:'grid', gridTemplateColumns: allFilled && tier ? '1fr 1fr' : '1fr', gap:12, marginTop:14 }}>
            {/* Score card */}
            <div style={{ background: tier ? tier.light : 'white', border:`1.5px solid ${tier ? tier.border : '#e2e8f0'}`, borderRadius:14, padding:'20px 24px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#64748b', letterSpacing:'1px', marginBottom:8 }}>SCORE TÉCNICO PONDERADO</div>
              <div style={{ fontSize:56, fontWeight:800, fontFamily:'JetBrains Mono, monospace', color: tier ? tier.color : '#cbd5e1', lineHeight:1 }}>
                {allFilled ? raw.toFixed(2) : '—'}
              </div>
              <div style={{ marginTop:12, height:6, background:'#e2e8f0', borderRadius:3, overflow:'hidden' }}>
                <div style={{ width:`${allFilled ? (raw/5)*100 : 0}%`, height:'100%', background: tier ? tier.color : '#e2e8f0', borderRadius:3, transition:'width 0.35s ease' }} />
              </div>
              <div style={{ marginTop:6, fontSize:12, color:'#94a3b8' }}>de 5,00 pontos máximos</div>
            </div>

            {/* Tier card */}
            {allFilled && tier && (
              <div style={{ background: tier.light, border:`1.5px solid ${tier.border}`, borderRadius:14, padding:'20px 24px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:'#64748b', letterSpacing:'1px', marginBottom:8 }}>PORTE DO PROJETO</div>
                  <div style={{ fontSize:30, fontWeight:800, color: tier.color }}>{tier.label}</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.7)', borderRadius:10, padding:'12px 14px', marginTop:12 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#64748b', letterSpacing:'0.8px', marginBottom:4 }}>PLANO {form.plan} · ESTIMATIVA/MÊS</div>
                  <div style={{ fontSize:22, fontWeight:800, color:'#1e293b', fontFamily:'JetBrains Mono, monospace' }}>
                    {form.plan === 'F4' ? tier.f4 : tier.f8}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botão salvar */}
          <button onClick={handleSave} disabled={!canSave} style={{
            width:'100%', marginTop:14, padding:'15px', borderRadius:12, border:'none',
            background: canSave ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#e2e8f0',
            color: canSave ? 'white' : '#94a3b8', fontSize:15, fontWeight:700, cursor: canSave ? 'pointer' : 'not-allowed',
            fontFamily:'inherit', letterSpacing:'-0.2px', transition:'all 0.2s',
            boxShadow: canSave ? '0 4px 20px rgba(99,102,241,0.35)' : 'none',
          }}>
            💾 Salvar Projeto no Pipeline
          </button>

          {!canSave && (
            <p style={{ textAlign:'center', fontSize:12, color:'#94a3b8', marginTop:8 }}>
              {!form.name.trim() || !form.client.trim() ? 'Preencha o nome do dashboard e o cliente.' : 'Avalie todos os 7 critérios para liberar o salvamento.'}
            </p>
          )}
        </main>
      )}

      {/* ══════════════════════════════════════════════════
          TAB 2 – PIPELINE / KANBAN
      ═══════════════════════════════════════════════════ */}
      {tab === 'pipeline' && (
        <main style={{ padding:'24px 20px 56px' }}>

          {/* Contadores */}
          <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
            {[...STATUSES, null].map((s, i) => {
              const count = s ? projects.filter(p => p.status === s).length : projects.length;
              const ss = s ? STATUS_STYLE[s] : null;
              return (
                <div key={i} style={{ flex:1, minWidth:130, background:'white', border:`1px solid ${ss ? ss.border : '#e2e8f0'}`, borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
                  {ss && <div style={{ width:8, height:8, borderRadius:'50%', background:ss.dot, flexShrink:0 }} />}
                  <span style={{ fontSize:12, color:'#64748b', fontWeight:500 }}>{s || 'Total'}</span>
                  <span style={{ marginLeft:'auto', fontSize:24, fontWeight:800, fontFamily:'JetBrains Mono, monospace', color: ss ? ss.dot : '#6366f1' }}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* Kanban board */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, alignItems:'start' }}>
            {STATUSES.map(status => {
              const ss = STATUS_STYLE[status];
              const cards = projects.filter(p => p.status === status).sort((a, b) => b.finalScore - a.finalScore);
              return (
                <div key={status} style={{ background:'#e8eef5', border:'1px solid #dde4ed', borderRadius:14, padding:12 }}>
                  {/* Cabeçalho da coluna */}
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:12, paddingBottom:10, borderBottom:'1px solid #d1dae5' }}>
                    <div style={{ width:9, height:9, borderRadius:'50%', background:ss.dot, flexShrink:0 }} />
                    <span style={{ fontSize:11, fontWeight:700, color:ss.dot, flex:1, letterSpacing:'0.4px' }}>{status.toUpperCase()}</span>
                    <span style={{ fontSize:11, background:ss.bg, color:ss.text, padding:'2px 9px', borderRadius:20, fontWeight:700, border:`1px solid ${ss.border}` }}>{cards.length}</span>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                    {cards.map(p => (
                      <KanbanCard
                        key={p.id}
                        project={p}
                        onUpdate={update}
                        onDelete={remove}
                        expanded={expandedId === p.id}
                        onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
                      />
                    ))}
                    {cards.length === 0 && (
                      <div style={{ textAlign:'center', padding:'32px 0', color:'#b0bbc9', fontSize:13 }}>
                        Nenhum projeto aqui
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}
    </div>
  );
}

// ─── Kanban Card ─────────────────────────────────────────────────────────────
function KanbanCard({ project, onUpdate, onDelete, expanded, onToggle }) {
  const tier = getTier(project.finalScore);

  return (
    <div style={{ background:'white', border:`1.5px solid ${expanded ? '#c7d2fe' : '#e2e8f0'}`, borderRadius:12, overflow:'hidden', transition:'border-color 0.15s, box-shadow 0.15s', boxShadow: expanded ? '0 2px 12px rgba(99,102,241,0.1)' : '0 1px 3px rgba(0,0,0,0.04)' }}>

      {/* Cabeçalho visível */}
      <div onClick={onToggle} style={{ padding:'12px 13px', cursor:'pointer' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:4 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1e293b', lineHeight:1.35, flex:1 }}>{project.name}</div>
          {tier && (
            <div style={{ fontSize:12, fontWeight:700, fontFamily:'JetBrains Mono, monospace', color:tier.color, background:tier.light, padding:'2px 7px', borderRadius:6, whiteSpace:'nowrap', border:`1px solid ${tier.border}` }}>
              {project.finalScore.toFixed(2)}
            </div>
          )}
        </div>
        <div style={{ fontSize:11, color:'#64748b', marginBottom:9 }}>{project.client}</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:4, alignItems:'center' }}>
          {tier && <span style={{ fontSize:10, color:tier.color, background:tier.light, padding:'2px 7px', borderRadius:4, fontWeight:600, border:`1px solid ${tier.border}` }}>{tier.label}</span>}
          <span style={{ fontSize:10, color:'#6366f1', background:'#eef2ff', padding:'2px 7px', borderRadius:4, fontFamily:'JetBrains Mono, monospace', fontWeight:700 }}>{project.plan}</span>
          {project.assignee && <span style={{ fontSize:10, color:'#7c3aed', background:'#f5f3ff', padding:'2px 7px', borderRadius:4, fontWeight:600 }}>@{project.assignee}</span>}
          {project.targetDate && <span style={{ fontSize:10, color:'#94a3b8', marginLeft:'auto' }}>📅 {project.targetDate}</span>}
        </div>
      </div>

      {/* Detalhes expandidos */}
      {expanded && (
        <div style={{ padding:'12px 13px', borderTop:'1px solid #f1f5f9', background:'#fafbff' }}>

          {/* Custo */}
          {tier && (
            <div style={{ background:tier.light, border:`1px solid ${tier.border}`, borderRadius:9, padding:'10px 12px', marginBottom:12 }}>
              <div style={{ fontSize:9, fontWeight:700, color:'#64748b', letterSpacing:'0.8px', marginBottom:3 }}>CUSTO ESTIMADO — PLANO {project.plan}/MÊS</div>
              <div style={{ fontSize:15, fontWeight:800, color:tier.color, fontFamily:'JetBrains Mono, monospace' }}>
                {project.plan === 'F4' ? tier.f4 : tier.f8}
              </div>
            </div>
          )}

          {/* Responsável */}
          <Fld label="RESPONSÁVEL">
            <select value={project.assignee || ''} onChange={e => onUpdate(project.id, { assignee: e.target.value || null })} style={{ width:'100%', marginTop:4, padding:'7px 10px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, background:'white', color:'#1e293b', fontFamily:'inherit', cursor:'pointer' }}>
              <option value="">Não atribuído</option>
              {TEAM.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Fld>

          {/* Status */}
          <div style={{ marginTop:10 }}>
            <Fld label="STATUS">
              <select value={project.status} onChange={e => onUpdate(project.id, { status: e.target.value })} style={{ width:'100%', marginTop:4, padding:'7px 10px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, background:'white', color:'#1e293b', fontFamily:'inherit', cursor:'pointer' }}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Fld>
          </div>

          {/* Breakdown do score */}
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:9, fontWeight:700, color:'#94a3b8', letterSpacing:'0.8px', marginBottom:6 }}>BREAKDOWN DO SCORE</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:4 }}>
              {CRITERIA.map(c => {
                const v = project.scores[c.key];
                return (
                  <div key={c.key} style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:7, padding:'6px 4px', textAlign:'center' }}>
                    <div style={{ fontSize:9, color:'#94a3b8', lineHeight:1.3, marginBottom:2 }}>{c.label.split(' ').slice(0, 2).join(' ')}</div>
                    <div style={{ fontSize:15, fontWeight:800, fontFamily:'JetBrains Mono, monospace', color: v ? SCORE_COLORS[v-1] : '#e2e8f0' }}>{v || '—'}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fontes */}
          {project.sourceTables && (
            <div style={{ marginTop:10, fontSize:11, color:'#64748b', padding:'6px 8px', background:'white', borderRadius:7, border:'1px solid #e2e8f0' }}>
              <span style={{ fontWeight:600, color:'#475569' }}>Fontes: </span>{project.sourceTables}
            </div>
          )}

          {/* Solicitante */}
          {project.requesterName && (
            <div style={{ marginTop:6, fontSize:11, color:'#64748b', padding:'6px 8px', background:'white', borderRadius:7, border:'1px solid #e2e8f0' }}>
              <span style={{ fontWeight:600, color:'#475569' }}>Solicitante: </span>
              {project.requesterName}{project.requesterEmail ? ` · ${project.requesterEmail}` : ''}
            </div>
          )}

          {/* Remover */}
          <button onClick={() => onDelete(project.id)} style={{ marginTop:12, width:'100%', padding:'7px', borderRadius:8, border:'1px solid #fecaca', background:'white', color:'#dc2626', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
            Remover projeto
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────
function Section({ icon, title, children, style }) {
  return (
    <section style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:14, padding:'22px 26px', ...style }}>
      <div style={{ fontSize:14, fontWeight:700, color:'#1e293b', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
        <span>{icon}</span>{title}
      </div>
      {children}
    </section>
  );
}

function Fld({ label, children }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#64748b', marginBottom:4, letterSpacing:'0.5px' }}>{label}</label>
      {children}
    </div>
  );
}