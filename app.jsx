const { useState, useEffect, useCallback } = React;

/* ═══════════════════════════ THEMES ═══════════════════════════ */
const THEMES = {
  mint: {
    '--primary': '#48B577', '--primary-light': '#DCF2E5', '--primary-lighter': '#F0F9F3',
    '--primary-dark': '#2D8A55', '--surface': '#F4F9F6', '--text': '#1B3327',
    '--text-secondary': '#5A7D68', '--text-tertiary': '#8FAA9B',
    '--border': '#D8ECE0', '--border-light': '#E8F4ED',
  },
  ocean: {
    '--primary': '#4A8FD4', '--primary-light': '#DCE9F7', '--primary-lighter': '#EFF5FB',
    '--primary-dark': '#2D6EAA', '--surface': '#F3F8FD', '--text': '#1B2D42',
    '--text-secondary': '#5A7D98', '--text-tertiary': '#8FA5B8',
    '--border': '#D4E2F0', '--border-light': '#E4EFF8',
  },
  lavender: {
    '--primary': '#9870CB', '--primary-light': '#E8DCF5', '--primary-lighter': '#F4EFF9',
    '--primary-dark': '#7450A5', '--surface': '#F8F5FD', '--text': '#2B1D40',
    '--text-secondary': '#7A5F98', '--text-tertiary': '#A08DB8',
    '--border': '#E0D4EE', '--border-light': '#ECE4F4',
  },
};

/* ═══════════════════════════ INITIAL STATE ═══════════════════════════ */
const INIT_STATE = {
  step: 'welcome',
  income: 0,
  paySchedule: { frequency: 'monthly', amount: 0, nextDate: '' },
  debts: [],
  categories: [],
  allocations: {},
  transactions: [],
  rolloverBoosts: {},
  lastCycleStart: null,
  done: false,
};

function getCycleStart(paySchedule, currentDate = new Date()) {
  const schedule = typeof paySchedule === 'object' ? paySchedule : { nextDate: '' };
  let anchorDay = 1;
  if (schedule && schedule.nextDate) {
    const parts = schedule.nextDate.split('-');
    if (parts.length === 3) anchorDay = parseInt(parts[2], 10) || 1;
  }
  let d = new Date(currentDate);
  if (d.getDate() >= anchorDay) {
    d.setDate(anchorDay);
  } else {
    d.setMonth(d.getMonth() - 1);
    const maxDaysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(anchorDay, maxDaysInMonth));
  }
  d.setHours(0,0,0,0);
  return d.toISOString();
}
window.getCycleStart = getCycleStart;

function loadState() {
  try {
    const raw = localStorage.getItem('budgetBuddy_v1');
    if (raw) {
      const data = JSON.parse(raw);
      if (!data.transactions) data.transactions = [];
      if (!data.paySchedule) {
        data.paySchedule = { frequency: 'monthly', amount: data.income || 0, nextDate: data.payDay ? `2026-05-${String(data.payDay).padStart(2, '0')}` : '' };
      }
      if (!data.rolloverBoosts) data.rolloverBoosts = {};
      return data;
    }
  } catch (e) {}
  return { ...INIT_STATE };
}

/* ═══════════════════════════ APP ═══════════════════════════ */
function App() {
  const [state, setState] = useState(loadState);
  const tweakDefaults = typeof TWEAK_DEFAULTS !== 'undefined' ? TWEAK_DEFAULTS : { theme: 'mint', chartStyle: 'donut', showTips: true };
  const [tweaks, setTweak] = typeof useTweaks === 'function' ? useTweaks(tweakDefaults) : [tweakDefaults, () => {}];

  /* apply theme */
  useEffect(() => {
    const t = THEMES[tweaks.theme] || THEMES.mint;
    Object.entries(t).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [tweaks.theme]);

  /* helpers */
  const patch = useCallback((updates) => setState(s => ({ ...s, ...updates })), []);
  const goStep = useCallback((step) => patch({ step }), [patch]);

  /* rollover logic & persistence */
  useEffect(() => {
    localStorage.setItem('budgetBuddy_v1', JSON.stringify(state));
    if (state.done && state.step === 'dashboard') {
      const currentCycle = getCycleStart(state.paySchedule);
      if (!state.lastCycleStart) {
        patch({ lastCycleStart: currentCycle });
      } else if (currentCycle > state.lastCycleStart) {
        patch({ step: 'rollover' });
      }
    }
  }, [state, patch]);

  const totalDebts = state.debts.reduce((s, d) => s + d.amount, 0);
  const remaining = state.income - totalDebts;

  /* step rendering */
  const renderStep = () => {
    switch (state.step) {
      case 'welcome':
        return <WelcomeStep onNext={() => goStep('income')} />;

      case 'income':
        return (
          <IncomeStep
            income={state.income}
            setIncome={(v) => patch({ income: v })}
            paySchedule={state.paySchedule}
            setPaySchedule={(v) => patch({ paySchedule: v })}
            onNext={() => goStep('debts')}
            onBack={() => goStep('welcome')}
          />
        );

      case 'debts':
        return (
          <DebtsStep
            income={state.income}
            debts={state.debts}
            setDebts={(d) => patch({ debts: d })}
            onNext={() => goStep('categories')}
            onBack={() => goStep('income')}
          />
        );

      case 'categories':
        return (
          <CategoriesStep
            remaining={remaining}
            categories={state.categories}
            setCategories={(c) => patch({ categories: c })}
            onNext={() => goStep('allocation')}
            onBack={() => goStep('debts')}
          />
        );

      case 'allocation':
        return (
          <AllocationStep
            remaining={remaining}
            categories={state.categories}
            allocations={state.allocations}
            setAllocations={(a) => patch({ allocations: a })}
            onNext={() => patch({ step: 'dashboard', done: true, lastCycleStart: getCycleStart(state.paySchedule) })}
            onBack={() => goStep('categories')}
          />
        );

      case 'rollover':
        return (
          <RolloverStep
            data={state}
            patch={patch}
            onComplete={() => patch({ step: 'dashboard' })}
          />
        );

      case 'dashboard':
        return (
          <Dashboard
            data={state}
            patch={patch}
            tweaks={tweaks}
            onEdit={() => goStep('allocation')}
            onReset={() => {
              if (confirm('Start over? This will clear your budget.')) {
                setState({ ...INIT_STATE, currentMonth: new Date().toISOString().slice(0, 7) });
                localStorage.removeItem('budgetBuddy_v1');
              }
            }}
          />
        );

      default:
        return <WelcomeStep onNext={() => goStep('income')} />;
    }
  };

  return (
    <React.Fragment>
      <div key={state.step} style={{ minHeight: '100vh', minHeight: '100dvh' }}>
        {renderStep()}
      </div>
      <TweaksPanel title="BudgetBuddy Tweaks">
        <TweakSection label="Theme">
          <TweakRadio value={tweaks.theme} options={[
            { label: 'Mint', value: 'mint' },
            { label: 'Ocean', value: 'ocean' },
            { label: 'Lavender', value: 'lavender' },
          ]} onChange={v => setTweak('theme', v)} />
        </TweakSection>
        <TweakSection label="Chart Style">
          <TweakRadio value={tweaks.chartStyle} options={[
            { label: 'Donut', value: 'donut' },
            { label: 'Bars', value: 'bars' },
          ]} onChange={v => setTweak('chartStyle', v)} />
        </TweakSection>
        <TweakSection label="Saving Tips">
          <TweakToggle value={tweaks.showTips} onChange={v => setTweak('showTips', v)} label="Show contextual tips" />
        </TweakSection>
        <TweakSection label="Data">
          <TweakButton label="Reset Budget" onClick={() => {
            setState({ ...INIT_STATE });
            localStorage.removeItem('budgetBuddy_v1');
          }} />
        </TweakSection>
      </TweaksPanel>
    </React.Fragment>
  );
}

/* ── Mount ── */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
