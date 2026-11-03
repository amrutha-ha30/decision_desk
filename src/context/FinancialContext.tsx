import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AssessmentRecord,
  FinancialInput,
  Thresholds,
} from '@/lib/types';
import { DEFAULT_THRESHOLDS } from '@/lib/types';

const STORAGE_KEY = 'decision-desk-data-v1';

interface PersistedData {
  input: FinancialInput;
  thresholds: Thresholds;
  history: AssessmentRecord[];
}

const defaultInput: FinancialInput = {
  monthlyIncome: 50000,
  emergencyAmount: 100000,
  existingEMI: 8000,
  bnplPayments: 3000,
  creditCardPayments: 4000,
  availableSavings: 25000,
  emergencyCategory: 'Medical',
  repaymentDuration: 12,
};

interface FinancialContextValue {
  input: FinancialInput;
  setInput: (input: Partial<FinancialInput>) => void;
  replaceInput: (input: FinancialInput) => void;
  thresholds: Thresholds;
  setThresholds: (t: Thresholds) => void;
  history: AssessmentRecord[];
  saveAssessment: (record: AssessmentRecord) => void;
  clearHistory: () => void;
  resetAll: () => void;
}

const FinancialContext = createContext<FinancialContextValue | null>(null);

function loadData(): PersistedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedData;
      return {
        input: { ...defaultInput, ...parsed.input },
        thresholds: { ...DEFAULT_THRESHOLDS, ...parsed.thresholds },
        history: parsed.history ?? [],
      };
    }
  } catch {
    // ignore corrupt data
  }
  return {
    input: defaultInput,
    thresholds: DEFAULT_THRESHOLDS,
    history: [],
  };
}

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PersistedData>(() => loadData());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage may be full or blocked
    }
  }, [data]);

  const setInput = useCallback((partial: Partial<FinancialInput>) => {
    setData((prev) => ({
      ...prev,
      input: { ...prev.input, ...partial },
    }));
  }, []);

  const replaceInput = useCallback((input: FinancialInput) => {
    setData((prev) => ({ ...prev, input }));
  }, []);

  const setThresholds = useCallback((t: Thresholds) => {
    setData((prev) => ({ ...prev, thresholds: t }));
  }, []);

  const saveAssessment = useCallback((record: AssessmentRecord) => {
    setData((prev) => ({
      ...prev,
      history: [record, ...prev.history].slice(0, 20),
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setData((prev) => ({ ...prev, history: [] }));
  }, []);

  const resetAll = useCallback(() => {
    setData({
      input: defaultInput,
      thresholds: DEFAULT_THRESHOLDS,
      history: [],
    });
  }, []);

  const value = useMemo(
    () => ({
      input: data.input,
      setInput,
      replaceInput,
      thresholds: data.thresholds,
      setThresholds,
      history: data.history,
      saveAssessment,
      clearHistory,
      resetAll,
    }),
    [data, setInput, replaceInput, setThresholds, saveAssessment, clearHistory, resetAll],
  );

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial(): FinancialContextValue {
  const ctx = useContext(FinancialContext);
  if (!ctx) throw new Error('useFinancial must be used within FinancialProvider');
  return ctx;
}
