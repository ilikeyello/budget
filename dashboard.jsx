const { useState, useEffect, useMemo } = React;

/* ═══════════════════════════ SUMMARY CARDS ═══════════════════════════ */
function SummaryCards({ income, totalDebts, totalAllocated, totalSpent, remaining, paySchedule }) {
  const left = remaining - totalSpent;
  const freqStr = paySchedule?.frequency ? paySchedule.frequency.charAt(0).toUpperCase() + paySchedule.frequency.slice(1).replace('weekly', '-weekly') : '';
  const dateStr = paySchedule?.nextDate ? paySchedule.nextDate.split('-').slice(1).join('/') : '';
  const cards = [
    { label: 'Monthly Income', value: fmt(income), color: 'var(--primary)', bg: 'var(--primary-lighter)', sub: `${freqStr} (Next: ${dateStr})` },
    { label: 'Fixed Costs', value: fmt(totalDebts), color: '#E85D5D', bg: '#FFF0F0', sub: `${Math.round((totalDebts / income) * 100)}%` },
    { label: 'Spent So Far', value: fmt(totalSpent), color: '#E8A440', bg: '#FFF8E0', sub: `${Math.round((totalSpent / totalAllocated) * 100) || 0}% of budget` },
    { label: 'Left to Spend', value: fmt(left), color: left >= 0 ? 'var(--primary-dark)' : 'var(--danger)', bg: left >= 0 ? 'var(--primary-lighter)' : '#FFF0F0', sub: 'flexible' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
      {cards.map((c, i) => (
        <div key={i} className="anim-in" style={{
          animationDelay: `${i * 0.08}s`,
          background: 'var(--card)', borderRadius: 'var(--radius)', padding: '20px 18px',
          boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: c.color, lineHeight: 1.1 }}>{c.value}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 4, display: 'inline-block', background: c.bg, padding: '2px 8px', borderRadius: 6 }}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════ DONUT CHART ═══════════════════════════ */
function DonutChart({ segments, size = 220 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <p style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No allocations yet</p>;
  const r = 78, cx = 100, cy = 100;
  const circ = 2 * Math.PI * r;
  let rotation = -90;

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const len = pct * circ;
        const gap = circ - len;
        const rot = rotation;
        rotation += pct * 360;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={26}
            strokeDasharray={`${len} ${gap}`} transform={`rotate(${rot} ${cx} ${cy})`}
            strokeLinecap="butt" style={{ transition: 'all 0.6s ease' }} />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--text)" fontFamily="Nunito, sans-serif">{fmt(total)}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-tertiary)" fontFamily="Nunito, sans-serif">budgeted</text>
    </svg>
  );
}

/* ═══════════════════════════ BAR CHART ═══════════════════════════ */
function HBarChart({ segments }) {
  const maxVal = Math.max(...segments.map(s => s.value), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {segments.map((seg, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 90, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seg.name}</span>
          <div style={{ flex: 1, height: 22, background: 'var(--border-light)', borderRadius: 11, overflow: 'hidden' }}>
            <div style={{ width: `${(seg.value / maxVal) * 100}%`, height: '100%', background: seg.color, borderRadius: 11, transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ width: 65, textAlign: 'right', fontSize: 13, fontWeight: 700 }}>{fmt(seg.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════ CATEGORY LIST ═══════════════════════════ */
function CategoryList({ segments }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {segments.map((seg, i) => {
        const pct = seg.value > 0 ? Math.min((seg.spent / seg.value) * 100, 100) : (seg.spent > 0 ? 100 : 0);
        const isOver = seg.spent > seg.value;
        const color = isOver ? 'var(--danger)' : seg.color;
        return (
          <div key={i} className="anim-in" style={{ animationDelay: `${i * 0.05}s`, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--card)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: seg.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {seg.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{seg.name}</div>
              <div style={{ height: 5, borderRadius: 3, background: 'var(--border-light)', marginTop: 5, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(seg.spent)} <span style={{fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)'}}>/ {fmt(seg.value)}</span></div>
              <div style={{ fontSize: 12, color: isOver ? 'var(--danger)' : 'var(--text-tertiary)', fontWeight: 600 }}>{isOver ? 'Over budget' : `${Math.round(pct)}% spent`}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════ SAVING TIPS ═══════════════════════════ */
function generateTips(data) {
  const { income, debts, categories, allocations } = data;
  const totalDebts = debts.reduce((s, d) => s + d.amount, 0);
  const remaining = income - totalDebts;
  const totalAlloc = Object.values(allocations).reduce((s, v) => s + v, 0);
  const tips = [];
  const get = (id) => allocations[id] || 0;
  const hasCat = (id) => categories.some(c => c.id === id);

  if (totalDebts > income * 0.5) {
    tips.push({ type: 'warning', text: `Over ${Math.round(totalDebts/income*100)}% of your income goes to fixed costs. Look into negotiating bills, refinancing, or cutting subscriptions to free up cash.`, icon: '⚡' });
  }
  if (!hasCat('savings') && !hasCat('emergency')) {
    tips.push({ type: 'important', text: "You don't have a savings category yet. Even $50/month creates a safety net — future you will be grateful!", icon: '🎯' });
  } else {
    const savTotal = get('savings') + get('emergency');
    const savPct = remaining > 0 ? (savTotal / remaining) * 100 : 0;
    if (savPct > 0 && savPct < 20) {
      tips.push({ type: 'suggestion', text: `You're saving ${Math.round(savPct)}% of your flexible income. Experts recommend 20%. Bump it up by ${fmt(Math.round(remaining * 0.2 - savTotal))}/month to hit the target!`, icon: '📈' });
    } else if (savPct >= 20) {
      tips.push({ type: 'positive', text: `You're saving ${Math.round(savPct)}% of your flexible income — that's above the recommended 20%. Amazing discipline!`, icon: '🏆' });
    }
  }
  if (get('dining') > get('groceries') && get('dining') > 0 && hasCat('groceries')) {
    tips.push({ type: 'suggestion', text: 'Dining out costs more than your groceries. Cooking at home 3 extra nights a week could save $200+/month — try meal prepping on Sundays.', icon: '🍳' });
  }
  if (get('fun') > get('savings') && get('fun') > 0 && get('savings') > 0) {
    tips.push({ type: 'suggestion', text: 'Your entertainment exceeds savings. Try the "pay yourself first" method: auto-transfer savings on payday before you spend.', icon: '💡' });
  }
  if (get('treats') > 80) {
    tips.push({ type: 'fun', text: `${fmt(get('treats'))}/month on coffee & treats = ${fmt(get('treats') * 12)}/year. A good home setup pays for itself in weeks and you level up your barista skills!`, icon: '☕' });
  }
  if (totalAlloc <= remaining && totalAlloc > 0) {
    tips.push({ type: 'positive', text: "You're living within your means — that alone puts you ahead of most people. Keep this up and compound growth does the rest.", icon: '🌟' });
  }
  if (totalAlloc > remaining) {
    tips.push({ type: 'warning', text: `You're ${fmt(totalAlloc - remaining)} over budget. Review categories for easy wins — even small trims add up fast.`, icon: '🔴' });
  }
  // Always add a general tip
  tips.push({ type: 'general', text: "The 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings. Compare your budget against this benchmark — it's a great north star.", icon: '🧭' });
  return tips;
}

function TipCard({ tip, i }) {
  const bgMap = { warning: '#FFF8F0', important: '#FFF0F0', suggestion: 'var(--primary-lighter)', positive: '#F0FFF4', fun: '#FFFDF0', general: 'var(--primary-lighter)' };
  const borderMap = { warning: '#FFD9A0', important: '#FFB0B0', suggestion: 'var(--border)', positive: '#B0E8C0', fun: '#FFE8A0', general: 'var(--border)' };
  return (
    <div className="anim-in" style={{
      animationDelay: `${i * 0.1}s`,
      display: 'flex', gap: 14, alignItems: 'flex-start',
      padding: '16px 18px', borderRadius: 14,
      background: bgMap[tip.type] || 'var(--primary-lighter)',
      border: `1px solid ${borderMap[tip.type] || 'var(--border)'}`,
    }}>
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{tip.icon}</span>
      <p style={{ fontSize: 14, lineHeight: 1.6, fontWeight: 500, color: 'var(--text-secondary)' }}>{tip.text}</p>
    </div>
  );
}

/* ═══════════════════════════ LOG EXPENSE MODAL ═══════════════════════════ */
function LogExpenseModal({ segments, transactions, patch, onClose }) {
  const [txAmount, setTxAmount] = useState('');
  const [txCat, setTxCat] = useState('');
  const [txNote, setTxNote] = useState('');

  const addTx = () => {
    if (!txAmount || !txCat) return;
    const newTx = { id: Date.now(), categoryId: txCat, amount: Number(txAmount), note: txNote, date: new Date().toISOString() };
    patch({ transactions: [newTx, ...transactions] });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(27, 51, 39, 0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="anim-scale" style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 400, padding: 24, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18 }}>Log Expense</h3>
          <button className="btn-ghost" onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', padding: 4, color: 'var(--text-tertiary)' }}>✕</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <select className="input-field" value={txCat} onChange={e => setTxCat(e.target.value)}>
            <option value="" disabled>Select Category</option>
            {segments.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
          </select>
          
          <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--border)', borderRadius: 14, background: 'var(--card)', padding: '0 12px' }}>
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 700, fontSize: 20 }}>$</span>
            <input type="number" inputMode="decimal" placeholder="0" value={txAmount} onChange={e => setTxAmount(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'Nunito, sans-serif', fontSize: 18, fontWeight: 600, padding: '14px 10px', background: 'transparent', color: 'var(--text)' }} />
          </div>
          
          <input className="input-field" placeholder="Note (optional)" value={txNote} onChange={e => setTxNote(e.target.value)} />
          
          <button onClick={addTx} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 8 }}>Add Transaction</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ TRANSACTIONS ═══════════════════════════ */
function TransactionsSection({ segments, transactions, patch }) {
  const [txAmount, setTxAmount] = useState('');
  const [txCat, setTxCat] = useState('');
  const [txNote, setTxNote] = useState('');

  const addTx = () => {
    if (!txAmount || !txCat) return;
    const newTx = { id: Date.now(), categoryId: txCat, amount: Number(txAmount), note: txNote, date: new Date().toISOString() };
    patch({ transactions: [newTx, ...transactions] });
    setTxAmount(''); setTxNote('');
  };

  return (
    <div className="anim-in" style={{ animationDelay: '0.4s', marginTop: 24, background: 'var(--card)', borderRadius: 'var(--radius)', padding: '20px 22px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
      <h3 style={{ fontSize: 16, marginBottom: 14 }}>Log Expense</h3>
      <div className="tx-form" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select className="input-field" value={txCat} onChange={e => setTxCat(e.target.value)} style={{ flex: 1, minWidth: 140, padding: '10px 14px' }}>
          <option value="" disabled>Select Category</option>
          {segments.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', width: 120, border: '2px solid var(--border)', borderRadius: 14, background: 'var(--card)', padding: '0 12px' }}>
          <span style={{ color: 'var(--text-tertiary)', fontWeight: 700 }}>$</span>
          <input type="number" inputMode="decimal" placeholder="0" value={txAmount} onChange={e => setTxAmount(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 600, padding: '10px 8px', background: 'transparent', color: 'var(--text)' }} />
        </div>
        <input className="input-field" placeholder="Note (optional)" value={txNote} onChange={e => setTxNote(e.target.value)} style={{ flex: 2, minWidth: 160, padding: '10px 14px' }} />
        <button onClick={addTx} className="btn btn-primary" style={{ padding: '10px 20px' }}>Add</button>
      </div>
      
      {transactions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 10 }}>Recent Transactions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {transactions.slice(0, 5).map(t => {
              const cat = segments.find(s => s.id === t.categoryId) || {};
              return (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 18 }}>{cat.icon || '💸'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{cat.name || 'Unknown'}</div>
                      {t.note && <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{t.note}</div>}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                    {fmt(t.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ DASHBOARD ═══════════════════════════ */
function Dashboard({ data, patch, tweaks, onEdit, onReset }) {
  const [showLogModal, setShowLogModal] = useState(false);
  const { income, debts, categories, allocations, transactions = [], rolloverBoosts = {}, paySchedule } = data;
  const totalDebts = debts.reduce((s, d) => s + d.amount, 0);
  const remaining = income - totalDebts;
  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0) + Object.values(rolloverBoosts).reduce((s, v) => s + v, 0);
  const totalSpent = transactions.reduce((s, t) => s + t.amount, 0);

  const segments = useMemo(() =>
    categories.map((cat, i) => {
      const allocated = (allocations[cat.id] || 0) + (rolloverBoosts[cat.id] || 0);
      const spent = transactions.filter(t => t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0);
      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        value: allocated,
        spent: spent,
        color: PALETTE[i % PALETTE.length],
      };
    }).filter(s => s.value > 0 || s.spent > 0),
  [categories, allocations, transactions, rolloverBoosts]);

  const tips = useMemo(() => generateTips(data), [data]);

  const ChartComponent = tweaks.chartStyle === 'bars' ? HBarChart : DonutChart;

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', padding: '24px 16px', background: 'var(--surface)' }}>
      {showLogModal && <LogExpenseModal segments={segments} transactions={transactions} patch={patch} onClose={() => setShowLogModal(false)} />}
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div className="anim-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26 }}>Your Monthly Budget</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 2 }}>Here's where every dollar goes</p>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={onEdit} style={{ padding: '10px 20px', fontSize: 14 }}>Edit Budget</button>
            <button className="btn btn-ghost" onClick={onReset} style={{ fontSize: 14 }}>Start Over</button>
          </div>
        </div>

        {/* Summary cards */}
        <SummaryCards income={income} totalDebts={totalDebts} totalAllocated={totalAllocated} totalSpent={totalSpent} remaining={remaining} paySchedule={paySchedule} />

        {/* Quick Log Button */}
        {segments.length > 0 && (
          <div className="anim-in" style={{ marginTop: 24, display: 'flex', justifyContent: 'center', animationDelay: '0.1s' }}>
            <button className="btn btn-primary" onClick={() => setShowLogModal(true)} style={{ padding: '12px 28px', fontSize: 15, borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-sm)' }}>
              + Log Expense
            </button>
          </div>
        )}

        {/* Chart + Categories */}
        <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: segments.length > 0 ? 'minmax(220px, 1fr) 2fr' : '1fr', gap: 20, marginTop: 24, alignItems: 'start' }}>
          {segments.length > 0 && (
            <div className="anim-in" style={{ animationDelay: '0.2s', background: 'var(--card)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
              <h3 style={{ marginBottom: 16, fontSize: 16 }}>Budget Breakdown</h3>
              <ChartComponent segments={segments} />
              {/* Legend for donut */}
              {tweaks.chartStyle !== 'bars' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 18, justifyContent: 'center' }}>
                  {segments.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                      {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div>
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>Categories</h3>
            <CategoryList segments={segments} />
          </div>
        </div>

        {/* Fixed costs breakdown */}
        {debts.length > 0 && (
          <div className="anim-in" style={{ animationDelay: '0.3s', marginTop: 24, background: 'var(--card)', borderRadius: 'var(--radius)', padding: '20px 22px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Fixed Monthly Costs</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {debts.map((d, i) => {
                const isDueSoon = new Date().getDate() <= d.dueDate && d.dueDate - new Date().getDate() <= 3;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: isDueSoon ? '#FFF0F0' : 'var(--primary-lighter)', border: isDueSoon ? '1px solid #FFD0D0' : '1px solid transparent', borderRadius: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</span>
                      <span style={{ fontSize: 12, color: isDueSoon ? 'var(--danger)' : 'var(--text-tertiary)', fontWeight: 600 }}>Due: {d.dueDate}{isDueSoon ? ' (Soon!)' : ''}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>{fmt(d.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transactions Form & List */}
        <TransactionsSection segments={segments} transactions={transactions} patch={patch} />

        {/* Saving Tips */}
        {tweaks.showTips && tips.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Money-Saving Tips</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tips.map((tip, i) => <TipCard key={i} tip={tip} i={i} />)}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '40px 0 20px', color: 'var(--text-tertiary)', fontSize: 13 }}>
          Made with BudgetBuddy — your money, your plan
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
