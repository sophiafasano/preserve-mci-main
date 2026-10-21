
import { useMemo, useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import SleepLogModal from './SleepLogModal'

interface DietLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DietLogData) => void;
  existingLogs?: { date: string }[];
}

export interface DietLogData {

  leafyGreens: number;
  vegetables: number;
  berries: number;
  nuts: number;
  wholeGrains: number;
  seafood: number;
  beans: number;
  chickenOrTurkey: number;
  cheese: number;
  processedMeat: number;
  friedFood: number;
  sweets: number;
  wine: number;


  date: string;
  }

function timeToMinutes(time?: string): number | null {
  if (!time) return null;
  const parts = time.split(':');
  if (parts.length < 2) return null;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function toHours(bed?: string, wake?: string): number {
  if (!bed || !wake) return 0;
  const bedDate = new Date(`2000-01-01T${bed}:00`);
  let wakeDate = new Date(`2000-01-01T${wake}:00`);
  if (wakeDate < bedDate) wakeDate = new Date(`2000-01-02T${wake}:00`);
  const diff = wakeDate.getTime() - bedDate.getTime();
  return Math.max(0, Math.round((diff / (1000 * 60 * 60)) * 10) / 10);
}

const EMOTIONS = [
  'Helplessness', 'Anxiety', 'Anger', 'Sadness',
  'Happiness', 'Fear', 'Surprise', 'Disgust',
];

const STEPS = ['Brain-Healthy Foods', 'Foods to Limit'];

const purple = '#6D28D9';
const purpleHover = '#5B21B6';
const gradient = 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)';
const borderColor = '#E9D5FF';

function YesNoButtons({
  value,
  onChange,
  disabled = false,
}: {
  value: boolean | null | undefined;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2 mt-1">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          disabled={disabled}
          onClick={() => onChange(v)}
          className="px-5 py-2 rounded-lg text-sm transition-all duration-200"
          style={{
            backgroundColor:
              value === v ? (v ? '#DCFCE7' : '#FEE2E2') : disabled ? '#F3F4F6' : '#F9F7FF',
            color:
              value === v ? (v ? '#166534' : '#991B1B') : disabled ? '#9CA3AF' : '#6B7280',
            border: `0.5px solid ${value === v ? (v ? '#86EFAC' : '#FCA5A5') : disabled ? '#E5E7EB' : borderColor}`,
            fontWeight: value === v ? 600 : 400,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  );
}

function Question({
  label,
  children,
  disabled = false,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? 'opacity-40' : ''}>
      <label className="block text-sm" style={{ color: '#1A1A2E' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function DietLogModal({
  isOpen,
  onClose,
  onSubmit,
  existingLogs = [],
}: DietLogModalProps) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const [activeLog, setActiveLog] = useState<'sleep' | 'diet' | null>('diet');

  //other Logs
  const [sleepModalOpen, setSleepModalOpen] = useState(false);


  // Step 1 — Sleep Diary

  const [leafyGreens, setLeafyGreens] = useState<number | null>(null);
  const [vegetables, setVegetables] = useState<number | null>(null);
  const [berries, setBerries] = useState<number | null>(null);
  const [nuts, setNuts] = useState<number | null>(null);
  const [wholeGrains, setWholeGrains] = useState<number | null>(null);
  const [seafood, setSeafood] = useState<number | null>(null);
  const [beans, setBeans] = useState<number | null>(null);
  const [chickenOrTurkey, setChickenOrTurkey] = useState<number | null>(null);
  const [oilType, setOilType] = useState('None');

  useState<number | null>(null);
  const [butter, setButter] = useState('None');
  const [cheese, setCheese] = useState<number | null>(null);
  const [processedMeat, setProcessedMeat] = useState<number | null>(null);
  const [friedFood, setFriedFood] = useState<number | null>(null);
  const [sweets, setSweets] = useState<number | null>(null);
  const [wine, setWine] = useState<number | null>(null);


  useEffect(() => {
    const saved = sessionStorage.getItem('dietDraft');
  
    if (saved) {
      const data = JSON.parse(saved);
  
      setLeafyGreens(data.leafyGreens ?? null);
      setVegetables(data.vegetables ?? null);
      setBerries(data.berries ?? null);
      setNuts(data.nuts ?? null);
      setWholeGrains(data.wholeGrains ?? null);
      setSeafood(data.seafood ?? null);
      setBeans(data.beans ?? null);
      setChickenOrTurkey(data.chickenOrTurkey ?? null);
      setOilType(data.oilType ?? 'None');
      setButter(data.butter ?? 'None');
      setCheese(data.cheese ?? null);
      setProcessedMeat(data.processedMeat ?? null);
      setFriedFood(data.friedFood ?? null);
      setSweets(data.sweets ?? null);
      setWine(data.wine ?? null);
    }
  }, []);
  
  useEffect(() => {
    sessionStorage.setItem(
      'dietDraft',
      JSON.stringify({
        leafyGreens,
        vegetables,
        berries,
        nuts,
        wholeGrains,
        seafood,
        beans,
        chickenOrTurkey,
        oilType,
        butter,
        cheese,
        processedMeat,
        friedFood,
        sweets,
        wine,
      })
    );
  }, [
    leafyGreens,
    vegetables,
    berries,
    nuts,
    wholeGrains,
    seafood,
    beans,
    chickenOrTurkey,
    oilType,
    butter,
    cheese,
    processedMeat,
    friedFood,
    sweets,
    wine,
  ]);
  

  const resetForm = () => {

    setStep(0);
    setLeafyGreens(null);
    setVegetables(null);
    setBerries(null);
    setNuts(null);
    setWholeGrains(null);
    setSeafood(null);
    setBeans(null);
    setChickenOrTurkey(null);
    setOilType('None');
    setButter('None');
    setCheese(null);
    setProcessedMeat(null);
    setFriedFood(null);
    setSweets(null);
    setWine(null);
      };


  const handleNext = () => {
    if (step === 0 && leafyGreens == null || vegetables == null || berries == null || nuts == null || wholeGrains == null || seafood == null || beans == null || chickenOrTurkey == null) {
      toast.error('Please fill out each section to the best of your knowledge');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    onSubmit({
      date: new Date().toISOString(),
      leafyGreens: leafyGreens!,
      vegetables: vegetables!,
      berries: berries!,
      nuts: nuts!,
      wholeGrains: wholeGrains!,
      seafood: seafood!,
      beans: beans!,
      chickenOrTurkey: chickenOrTurkey!,
      cheese: cheese!,
      processedMeat: processedMeat!,
      friedFood: friedFood!,
      sweets: sweets!,
      wine: wine!
    });

    toast.success('Diet log saved', {
      position: 'bottom-center',
      duration: 3000,
      style: { background: '#1A1A2E', color: '#FFFFFF', borderRadius: '8px', padding: '10px 20px', fontSize: '13px' },
    });

    resetForm();
    sessionStorage.removeItem('dietDraft');
    onClose();
  };

  const hasLoggedToday = useMemo(() => {
    const today = new Date().toDateString();
    return existingLogs.some((log) => new Date(log.date).toDateString() === today);
  }, [existingLogs]);

  if (!isOpen) return null;

  const homepageButtonGradient = 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)';
  const token = {
    white: '#FFFFFF',
  }

 return (
  <>
    {activeLog === 'diet' ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-[560px] rounded-2xl bg-white p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <button
            type="button"
            onClick={() => setActiveLog('sleep')}
            className="transition-all duration-200 hover:brightness-95 hover:-translate-y-px active:translate-y-0"
            style={{
                  color: token.white,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '9px 16px',
                  border: 'none',
                  backgroundImage: homepageButtonGradient,
                  marginBottom: '20px', 
                }}>
                  Sleep Log
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A2E' }}>
              Daily Diet Log
            </h2>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 transition-all duration-200 hover:bg-[#F3E8FF] hover:scale-105 active:scale-100"
          >
            <X size={18} strokeWidth={1.5} color="#1A1A2E" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6 flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: i <= step ? purple : '#E9D5FF' }}
            />
          ))}
        </div>

        {/* Already logged */}
        {hasLoggedToday ? (
          <div className="py-8 text-center">
            <p style={{ fontSize: '15px', color: '#1A1A2E', fontWeight: 600, marginBottom: '8px' }}>
              You've already logged today
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>Come back tomorrow to log again.</p>
          </div>
        ) : (
          <>
            {/* ── STEP 1: Sleep Diary ── */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Servings of leafy greens today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>Spinach, kale, collards, salad greens. 1 serving = 1 cup raw or 1/2 cup cooked</p>
                  <div className="grid grid-cols-10 gap-2">
                    {[0, 1, 2, "3+"].map((r) => {
                      const sel = leafyGreens === r;
                      const selStyle: React.CSSProperties = sel
                        ? r < 1 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r <= 2 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setLeafyGreens(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Servings of other vegetables today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>Broccoli, carrots, tomatoes, peppers, green beans, okra. ½ cup. Not fries or chip</p>
                  <div className="grid grid-cols-10 gap-2">
                    {[0, 1, 2, "3+"].map((r) => {
                      const sel = vegetables === r;
                      const selStyle: React.CSSProperties = sel
                        ? r < 1 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r <= 2 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setVegetables(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>


                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Servings for berries today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>Fresh or frozen. 1/2 cup</p>
                  <div className="grid grid-cols-10 gap-2">
                    {[0, 1, "2+"].map((r) => {
                      const sel = berries === r;
                      const selStyle: React.CSSProperties = sel
                        ? r == 0 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r == 1 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setBerries(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Servings of nuts today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>Small handful (1oz)</p>
                  <div className="grid grid-cols-10 gap-2">
                    {[0, 1, "2+"].map((r) => {
                      const sel = nuts === r;
                      const selStyle: React.CSSProperties = sel
                        ? r == 0 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r == 1 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setNuts(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Servings of whole grains today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>1 slice whole-grain bread, or 1/2 cup oatmeal, brown rice, or whole wheat pasta</p>
                  <div className="grid grid-cols-10 gap-2">
                    {[0, 1, 2, 3, "4+"].map((r) => {
                      const sel = wholeGrains === r;
                      const selStyle: React.CSSProperties = sel
                        ? r < 1 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r <= 3 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setWholeGrains(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Servings of fish or seafood, not fried, today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>Baked, grilled, or canned. 3-4 oz</p>
                  <div className="grid grid-cols-10 gap-2">
                    {[0, 1, "2+"].map((r) => {
                      const sel = seafood === r;
                      const selStyle: React.CSSProperties = sel
                        ? r == 0 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r == 1 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setSeafood(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Meals with beans or lentils today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>Black beans, black-eyed peas, chickpeas, lentils, bean soup</p>
                  <div className="grid grid-cols-10 gap-2">
                    {[0, 1, "2+"].map((r) => {
                      const sel = beans === r;
                      const selStyle: React.CSSProperties = sel
                        ? r == 0 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r == 1 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setBeans(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Servings of chicken or turkey, not fried, today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>3-4 oz</p>
                  <div className="grid grid-cols-10 gap-2">
                    {[0, 1, "2+"].map((r) => {
                      const sel = chickenOrTurkey === r;
                      const selStyle: React.CSSProperties = sel
                        ? r == 0 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r == 1 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setChickenOrTurkey(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>
                    Oil or fat used for cooking or salad dressing today:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Olive Oil', 'Other oil or fat', 'None'].map((opt) => (
                      <button
                        key={opt} type="button" onClick={() => setOilType(opt)}
                        className="rounded-full px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-px"
                        style={{
                          backgroundColor: oilType === opt ? purple : '#FFFFFF',
                          color: oilType === opt ? '#FFFFFF' : '#6B7280',
                          border: oilType === opt ? 'none' : `0.5px solid ${borderColor}`,
                        }}
                      >{opt}</button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ── STEP 2: Stimulus Control ── */}
            {step === 1 && (
              <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Butter or stick margarine today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>On bread, vegetables, or in cooking</p>
                  <div className="flex flex-wrap gap-2">
                    {['None', 'Less than 1 Tbsp', 'About 1 Tbsp', 'About 2 Tbsp', 'More than 2 Tbsp'].map((opt) => (
                      <button
                        key={opt} type="button" onClick={() => setButter(opt)}
                        className="rounded-full px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-px"
                        style={{
                          backgroundColor: butter === opt ? purple : '#FFFFFF',
                          color: butter === opt ? '#FFFFFF' : '#6B7280',
                          border: butter === opt ? 'none' : `0.5px solid ${borderColor}`,
                        }}
                      >{opt}</button>
                    ))}
                  </div>

                  <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Servings of cheese today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>1 slice or 1 oz, including on sandwiches, pizza, or grits</p>
                  <div className="grid grid-cols-10 gap-2">
                    {[0, 1, "2+"].map((r) => {
                      const sel = cheese === r;
                      const selStyle: React.CSSProperties = sel
                        ? r == 0 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r == 1 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setCheese(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Servings of red or processed meat today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>Beef, pork, hamburger, hot dogs, sausage, bacon, deli meat</p>
                  <div className="grid grid-cols-10 gap-2">
                    {[0, 1, 2, "3+"].map((r) => {
                      const sel = processedMeat === r;
                      const selStyle: React.CSSProperties = sel
                        ? r == 0 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r == 1 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setProcessedMeat(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Servings of fried food or fast food today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>Fried chicken or fish, French fries, fast-food meals</p>
                  <div className="grid grid-cols-10 gap-2">
                    {[0, 1, "2+"].map((r) => {
                      const sel = friedFood === r;
                      const selStyle: React.CSSProperties = sel
                        ? r == 0 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r == 1 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setFriedFood(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Servings of pastries or sweets today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>Cake, cookies, pie, donuts, ice cream, candy</p>
                  <div className="grid grid-cols-10 gap-2">
                    {[0, 1, 2, "3+"].map((r) => {
                      const sel = sweets === r;
                      const selStyle: React.CSSProperties = sel
                        ? r == 0 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r == 1 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setSweets(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: '#1A1A2E' }}>Glasses of wine today:</label>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', fontStyle: 'italic'}}>5 oz glass. For research only; we do not recommend starting to drink</p>
                  <div className="grid grid-cols-10 gap-2">
                    {[0, 1, "2+"].map((r) => {
                      const sel = wine === r;
                      const selStyle: React.CSSProperties = sel
                        ? r == 0 ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                          : r == 1 ? { backgroundColor: '#FEF9C3', color: '#854D0E' }
                          : { backgroundColor: '#DCFCE7', color: '#166534' }
                        : { backgroundColor: '#F9F7FF', border: `0.5px solid ${borderColor}`, color: '#6B7280' };
                      return (
                        <button key={r} type="button" onClick={() => setWine(r)}
                          className="h-9 rounded-md text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={selStyle}>{r}</button>
                      );
                    })}
                  </div>
                </div>

                </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  type="button" onClick={handleBack}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm transition-all duration-200 hover:bg-[#F3E8FF]"
                  style={{ color: purple, border: `0.5px solid ${borderColor}` }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
              ) : <div />}

              {step < STEPS.length - 1 ? (
                <button
                  type="button" onClick={handleNext}
                  className="flex items-center gap-1 px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-md"
                  style={{ backgroundImage: gradient }}
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button" onClick={handleSubmit}
                  className="flex-1 rounded-[10px] text-white py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-px hover:shadow-md"
                  style={{ backgroundImage: gradient }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundImage = `linear-gradient(90deg, ${purpleHover} 0%, #4C1D95 100%)`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundImage = gradient; }}
                >
                  Save Entry
                </button>
              )}
            </div>
          </>
        )}
        </div>
</div>
    ) : (
      <SleepLogModal
        isOpen={true}
        onClose={onClose}
        onSubmit={(data) => {
          // Replace this with your diet log save function
          setActiveLog('sleep');
        }}
      />
    )}
  </>
  );
}