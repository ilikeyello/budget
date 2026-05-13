const { useState, useEffect, useRef, useCallback } = React;

/* ── helpers ── */
const fmt = n => '$' + Number(n).toLocaleString('en-US');

const CATEGORY_OPTIONS = [
  { id: 'groceries', name: 'Groceries', icon: '🛒' },
  { id: 'dining',    name: 'Dining Out', icon: '🍽' },
  { id: 'savings',   name: 'Savings', icon: '💰' },
  { id: 'emergency', name: 'Emergency Fund', icon: '🛡' },
  { id: 'fun',       name: 'Entertainment', icon: '🎬' },
  { id: 'shopping',  name: 'Shopping', icon: '🛍' },
  { id: 'transport', name: 'Gas & Transit', icon: '⛽' },
  { id: 'health',    name: 'Health & Fitness', icon: '💪' },
  { id: 'learning',  name: 'Learning', icon: '📚' },
  { id: 'treats',    name: 'Coffee & Treats', icon: '☕' },
  { id: 'giving',    name: 'Giving', icon: '💝' },
  { id: 'personal',  name: 'Personal Care', icon: '✨' },
];

const PALETTE = ['#6BCB77','#74B9FF','#FFB347','#A29BFE','#FD79A8','#81ECEC','#FDCB6E','#778BEB','#55E6C1','#FF6B6B','#F8A5C2','#B2BEC3','#95E1D3','#F38181'];

/* ── shared inline styles ── */
const S = {
  page: { minHeight: '100vh', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', maxWidth: 560, width: '100%', padding: '36px 32px', position: 'relative' },
  bubble: { background: 'var(--primary-lighter)', borderRadius: '20px 20px 20px 6px', padding: '14px 20px', marginBottom: 12, lineHeight: 1.65, fontSize: 16 },
  inputArea: { marginTop: 22, paddingTop: 22, borderTop: '1px solid var(--border-light)' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, gap: 12 },
  progress: { height: 6, borderRadius: 3, background: 'var(--border-light)', overflow: 'hidden', marginBottom: 28 },
  progressFill: (pct) => ({ height: '100%', borderRadius: 3, background: 'var(--primary)', transition: 'width 0.5s ease', width: `${pct}%` }),
};

/* ── Bubble with stagger ── */
function Bubble({ children, i = 0 }) {
  return (
    <div className="anim-in" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', animationDelay: `${i * 0.4}s`, marginBottom: 12 }}>
      {i === 0 ? (
        <img src="BudgetBuddyTransparent.png" alt="Budget Buddy" style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0, marginTop: 4 }} />
      ) : (
        <div style={{ width: 44, flexShrink: 0 }} />
      )}
      <div style={{ ...S.bubble, animationDelay: '0s', marginBottom: 0, flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

/* ── Progress bar ── */
function Progress({ step, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
      <div style={{ flex: 1, ...S.progress, marginBottom: 0 }}>
        <div style={S.progressFill((step / total) * 100)} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
        {step} of {total}
      </span>
    </div>
  );
}

/* ═══════════════════════════ STEP 1: WELCOME ═══════════════════════════ */
function WelcomeStep({ onNext }) {
  return (
    <div style={S.page}>
      <div style={S.card} className="anim-scale">
        <Bubble i={0}>
          <p style={{ fontSize: 26, fontWeight: 800 }}>Hey there!</p>
        </Bubble>
        <Bubble i={1}>
          <p>I'm <strong>BudgetBuddy</strong> — your personal money sidekick. Let's set up your monthly budget together.</p>
        </Bubble>
        <Bubble i={2}>
          <p>It only takes about 2 minutes, and you'll have a clear plan for every dollar.</p>
        </Bubble>
        <div className="anim-in" style={{ animationDelay: '1.4s', textAlign: 'center', marginTop: 28 }}>
          <button className="btn btn-primary" onClick={onNext} style={{ padding: '14px 36px', fontSize: 17 }}>
            Let's Go →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ STEP 2: INCOME ═══════════════════════════ */
function IncomeStep({ income, setIncome, payDay, setPayDay, onNext, onBack }) {
  const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 900); }, []);

  return (
    <div style={S.page}>
      <div style={S.card} className="anim-scale">
        <Progress step={1} total={4} />
        <Bubble i={0}>
          <p>First things first — <strong>how much do you bring home each month?</strong></p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Your take-home pay, after taxes.</p>
        </Bubble>
        <div className="anim-in" style={{ ...S.inputArea, animationDelay: '0.5s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-tertiary)' }}>$</span>
            <input
              ref={ref}
              type="number"
              className="input-field input-lg"
              placeholder="0"
              value={income || ''}
              onChange={e => setIncome(Math.max(0, Number(e.target.value) || 0))}
              onKeyDown={e => e.key === 'Enter' && income > 0 && onNext()}
            />
          </div>
          {income > 0 && (
            <div className="anim-fade" style={{ marginTop: 12 }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {fmt(income)}/month — that's {fmt(income * 12)}/year
              </p>
              <div className="anim-in" style={{ marginTop: 24, animationDelay: '0.1s' }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>What day of the month do you get paid?</p>
                <input
                  type="number" min="1" max="31"
                  className="input-field"
                  placeholder="e.g. 1 or 15"
                  value={payDay || ''}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') setPayDay('');
                    else setPayDay(Math.min(31, Math.max(1, Number(val))));
                  }}
                  style={{ maxWidth: 120 }}
                  onKeyDown={e => e.key === 'Enter' && income > 0 && onNext()}
                />
              </div>
            </div>
          )}
          <div style={S.row}>
            <button className="btn btn-ghost" onClick={onBack}>← Back</button>
            <button className="btn btn-primary" onClick={onNext} disabled={!income || income <= 0}>Continue →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ STEP 3: DEBTS ═══════════════════════════ */
function DebtsStep({ income, debts, setDebts, onNext, onBack }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const total = debts.reduce((s, d) => s + d.amount, 0);
  const remaining = income - total;

  const add = () => {
    if (!name.trim() || !amount) return;
    setDebts([...debts, { name: name.trim(), amount: Number(amount), dueDate: Number(dueDate) || 1 }]);
    setName(''); setAmount(''); setDueDate('');
  };

  const remove = (i) => setDebts(debts.filter((_, idx) => idx !== i));

  const suggestions = ['Rent', 'Car Payment', 'Student Loan', 'Insurance', 'Phone Bill', 'Internet', 'Streaming'];

  return (
    <div style={S.page}>
      <div style={S.card} className="anim-scale">
        <Progress step={2} total={4} />
        <Bubble i={0}>
          <p>Now, what are your <strong>fixed monthly bills?</strong></p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Rent, car payments, subscriptions, loans — the things you pay every month.
          </p>
        </Bubble>

        {/* Quick-add suggestions */}
        <div className="anim-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 8, animationDelay: '0.4s' }}>
          {suggestions.filter(s => !debts.find(d => d.name === s)).slice(0, 5).map(s => (
            <button key={s} onClick={() => { setName(s); }}
              style={{ padding: '6px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: 13, fontWeight: 600 }}>
              {s}
            </button>
          ))}
        </div>

        {/* Debt list */}
        {debts.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {debts.map((d, i) => (
              <div key={i} className="anim-in" style={{ display: 'flex', alignItems: 'center', background: 'var(--primary-lighter)', borderRadius: 12, padding: '10px 14px' }}>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{d.name}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginRight: 16 }}>Due: {d.dueDate}</span>
                <span style={{ fontWeight: 700, marginRight: 12 }}>{fmt(d.amount)}</span>
                <button onClick={() => remove(i)} style={{ background: 'none', color: 'var(--text-tertiary)', fontSize: 18, padding: '0 4px', lineHeight: 1 }}>×</button>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px', fontWeight: 700, fontSize: 15 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total fixed costs</span>
              <span>{fmt(total)}/mo</span>
            </div>
          </div>
        )}

        {/* Add form */}
        <div className="anim-in" style={{ ...S.inputArea, animationDelay: '0.5s' }}>
          <div className="bill-form" style={{ display: 'flex', gap: 10, alignItems: 'stretch', flexWrap: 'wrap' }}>
            <input className="input-field" placeholder="Bill name" value={name}
              onChange={e => setName(e.target.value)} style={{ flex: 1, minWidth: 120 }}
              onKeyDown={e => e.key === 'Enter' && add()} />
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 100, border: '2px solid var(--border)', borderRadius: 14, background: 'var(--card)', padding: '0 12px' }}>
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 700 }}>$</span>
              <input type="number" placeholder="0" value={amount}
                onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && add()}
                style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 600, padding: '12px 8px', background: 'transparent', color: 'var(--text)' }} />
            </div>
            <input type="number" min="1" max="31" className="input-field" placeholder="Day (1-31)" value={dueDate}
              onChange={e => setDueDate(e.target.value)} style={{ width: 110 }}
              onKeyDown={e => e.key === 'Enter' && add()} />
            <button onClick={add} className="btn btn-secondary" style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>Add</button>
          </div>
          {remaining > 0 && debts.length > 0 && (
            <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
              {fmt(remaining)} remaining after fixed costs
            </p>
          )}
          <div style={S.row}>
            <button className="btn btn-ghost" onClick={onBack}>← Back</button>
            <button className="btn btn-primary" onClick={onNext}>
              {debts.length === 0 ? 'Skip — No Fixed Costs' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ STEP 4: CATEGORIES ═══════════════════════════ */
function CategoriesStep({ remaining, categories, setCategories, onNext, onBack }) {
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const toggle = (cat) => {
    if (categories.find(c => c.id === cat.id)) {
      setCategories(categories.filter(c => c.id !== cat.id));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    const id = 'custom_' + Date.now();
    setCategories([...categories, { id, name: customName.trim(), icon: '📌', custom: true }]);
    setCustomName('');
    setShowCustom(false);
  };

  const isSelected = (id) => categories.some(c => c.id === id);

  return (
    <div style={S.page}>
      <div style={S.card} className="anim-scale">
        <Progress step={3} total={4} />
        <Bubble i={0}>
          <p>You've got <strong style={{ color: 'var(--primary-dark)' }}>{fmt(remaining)}</strong> left after fixed costs.</p>
          <p style={{ marginTop: 4 }}>Pick the categories you want to budget for:</p>
        </Bubble>

        <div className="anim-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginTop: 16, animationDelay: '0.4s' }}>
          {CATEGORY_OPTIONS.map(cat => {
            const sel = isSelected(cat.id);
            return (
              <button key={cat.id} onClick={() => toggle(cat)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', borderRadius: 14,
                background: sel ? 'var(--primary)' : 'var(--card)',
                color: sel ? 'white' : 'var(--text)',
                border: sel ? '2px solid var(--primary)' : '2px solid var(--border)',
                fontWeight: 600, fontSize: 14,
                transition: 'all 0.2s ease',
                transform: sel ? 'scale(1.02)' : 'scale(1)',
              }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <span style={{ textWrap: 'pretty' }}>{cat.name}</span>
              </button>
            );
          })}
          {/* Custom categories */}
          {categories.filter(c => c.custom).map(cat => (
            <button key={cat.id} onClick={() => toggle(cat)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', borderRadius: 14,
              background: 'var(--primary)', color: 'white',
              border: '2px solid var(--primary)', fontWeight: 600, fontSize: 14,
            }}>
              <span style={{ fontSize: 20 }}>📌</span>
              <span>{cat.name}</span>
            </button>
          ))}
          {/* Add custom button */}
          <button onClick={() => setShowCustom(true)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderRadius: 14,
            background: 'var(--card)', color: 'var(--text-tertiary)',
            border: '2px dashed var(--border)', fontWeight: 600, fontSize: 14,
          }}>
            <span style={{ fontSize: 20 }}>+</span>
            <span>Add Custom</span>
          </button>
        </div>

        {showCustom && (
          <div className="anim-in" style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <input className="input-field" placeholder="Category name" value={customName}
              onChange={e => setCustomName(e.target.value)} style={{ flex: 1 }}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              autoFocus />
            <button className="btn btn-secondary" onClick={addCustom}>Add</button>
            <button className="btn btn-ghost" onClick={() => setShowCustom(false)} style={{ padding: '12px' }}>×</button>
          </div>
        )}

        <div style={{ ...S.row, marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
          <button className="btn btn-primary" onClick={onNext} disabled={categories.length === 0}>
            Continue → ({categories.length} selected)
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ STEP 5: ALLOCATION ═══════════════════════════ */
function AllocationStep({ remaining, categories, allocations, setAllocations, onNext, onBack }) {
  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0);
  const unallocated = remaining - totalAllocated;

  const setVal = (id, val) => {
    setAllocations({ ...allocations, [id]: Math.max(0, Math.round(val)) });
  };

  const sliderBg = (val, max, color) => {
    const pct = max > 0 ? Math.min((val / max) * 100, 100) : 0;
    return `linear-gradient(to right, ${color} ${pct}%, var(--border) ${pct}%)`;
  };

  return (
    <div style={S.page}>
      <div style={{ ...S.card, maxWidth: 620 }} className="anim-scale">
        <Progress step={4} total={4} />
        <Bubble i={0}>
          <p>Now the fun part — <strong>split your {fmt(remaining)}</strong> across your categories.</p>
        </Bubble>

        <div className="anim-in" style={{ animationDelay: '0.4s', marginTop: 16 }}>
          {/* Total bar */}
          <div style={{ background: 'var(--primary-lighter)', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                Allocated: {fmt(totalAllocated)}
              </span>
              <span style={{ fontWeight: 700, fontSize: 15, color: unallocated < 0 ? 'var(--danger)' : 'var(--primary-dark)' }}>
                {unallocated >= 0 ? `${fmt(unallocated)} left` : `${fmt(Math.abs(unallocated))} over`}
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: unallocated < 0 ? 'var(--danger)' : 'var(--primary)',
                width: `${Math.min((totalAllocated / remaining) * 100, 100)}%`,
                transition: 'all 0.3s ease',
              }} />
            </div>
          </div>

          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {categories.map((cat, i) => {
              const val = allocations[cat.id] || 0;
              const color = PALETTE[i % PALETTE.length];
              const pct = remaining > 0 ? Math.round((val / remaining) * 100) : 0;
              return (
                <div key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{cat.icon} {cat.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)' }}>{pct}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <input
                      type="range" min="0" max={remaining} step={10} value={val}
                      onChange={e => setVal(cat.id, Number(e.target.value))}
                      style={{ flex: 1, background: sliderBg(val, remaining, color) }}
                    />
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      border: '2px solid var(--border)', borderRadius: 10,
                      padding: '6px 10px', minWidth: 100, background: 'var(--card)',
                    }}>
                      <span style={{ color: 'var(--text-tertiary)', fontWeight: 700, fontSize: 15 }}>$</span>
                      <input type="number" min={0} value={val || ''}
                        onChange={e => setVal(cat.id, Number(e.target.value) || 0)}
                        style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 15, padding: '4px 6px', background: 'transparent', color: 'var(--text)' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {unallocated < 0 && (
            <p className="anim-fade" style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: '#FFF0F0', color: 'var(--danger)', fontWeight: 600, fontSize: 14 }}>
              You're {fmt(Math.abs(unallocated))} over budget. Adjust your categories or go back to review your fixed costs.
            </p>
          )}

          <div style={{ ...S.row, marginTop: 24 }}>
            <button className="btn btn-ghost" onClick={onBack}>← Back</button>
            <button className="btn btn-primary" onClick={onNext} style={{ padding: '14px 32px', fontSize: 17 }}>
              See My Budget →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ ROLLOVER STEP ═══════════════════════════ */
function RolloverStep({ data, patch, onComplete }) {
  const { income, categories, allocations, transactions = [], rolloverBoosts = {} } = data;
  
  const [newIncome, setNewIncome] = useState(income);
  const [choices, setChoices] = useState({});

  const leftovers = React.useMemo(() => {
    return categories.map(cat => {
      const allocated = allocations[cat.id] || 0;
      const boost = rolloverBoosts[cat.id] || 0;
      const spent = transactions.filter(t => t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0);
      const left = allocated + boost - spent;
      return { id: cat.id, name: cat.name, left: Math.max(0, left), icon: cat.icon };
    }).filter(c => c.left > 0);
  }, [categories, allocations, transactions, rolloverBoosts]);

  const submit = () => {
    const newBoosts = {};
    leftovers.forEach(cat => {
      const choice = choices[cat.id] || cat.id;
      if (choice === 'discard') return;
      newBoosts[choice] = (newBoosts[choice] || 0) + cat.left;
    });

    patch({
      income: newIncome,
      rolloverBoosts: newBoosts,
      transactions: [],
      lastCycleStart: window.getCycleStart(data.payDay)
    });
    onComplete();
  };

  return (
    <div style={S.page}>
      <div style={{ ...S.card, maxWidth: 600 }} className="anim-scale">
        <Bubble i={0}>
          <p style={{ fontSize: 24, fontWeight: 800 }}>It's Payday!</p>
          <p>A new budget cycle has started. Let's get things set up.</p>
        </Bubble>
        
        <div className="anim-in" style={{ animationDelay: '0.4s', marginTop: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Confirm your income for this cycle</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-tertiary)' }}>$</span>
            <input
              type="number" className="input-field input-lg"
              value={newIncome || ''}
              onChange={e => setNewIncome(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
        </div>

        {leftovers.length > 0 && (
          <div className="anim-in" style={{ animationDelay: '0.6s', marginTop: 32 }}>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>You have unspent funds!</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Where do you want to move the leftover money from last cycle?</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {leftovers.map((cat, i) => (
                <div key={cat.id} className="rollover-item" style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', padding: '12px 16px', borderRadius: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{cat.icon} {cat.name}</div>
                    <div style={{ color: 'var(--primary-dark)', fontWeight: 800, fontSize: 14 }}>{fmt(cat.left)} left</div>
                  </div>
                  <select 
                    className="input-field" 
                    style={{ flex: 1.5, padding: '8px 12px', fontSize: 14 }}
                    value={choices[cat.id] || cat.id}
                    onChange={e => setChoices({ ...choices, [cat.id]: e.target.value })}
                  >
                    <option value={cat.id}>Keep in {cat.name}</option>
                    <option value="discard">Don't roll over</option>
                    <optgroup label="Move to...">
                      {categories.filter(c => c.id !== cat.id).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="anim-in" style={{ ...S.row, marginTop: 32, animationDelay: '0.8s' }}>
          <button className="btn btn-primary" onClick={submit} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            Start New Cycle →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Export ── */
Object.assign(window, {
  WelcomeStep, IncomeStep, DebtsStep, CategoriesStep, AllocationStep, RolloverStep,
  CATEGORY_OPTIONS, PALETTE, fmt,
});
