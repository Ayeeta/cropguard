import { create } from "zustand";
import { BACKEND_URL } from "../constants/api";

export interface ScanResult {
  scan_id: string;
  crop_type: string;
  disease: {
    name: string;
    confidence: number;
    severity: string;
    affected_percent: number;
    description: string;
  };
  mask_url: string;
  nutrients: {
    deficiencies: string[];
    recommendations: {
      nutrient: string;
      symptom: string;
      treatment: string;
      frequency: string;
      organic_option: string;
    }[];
  };
  watering: {
    current_status: string;
    schedule: string;
    amount_ml_per_plant: number;
    warning: string | null;
  };
  pests: {
    detected: boolean;
    type: string | null;
    severity: string | null;
    treatment: string | null;
  };
  soil: {
    recommended_ph: string;
    amendments: string[];
    drainage: string;
  };
  care_plan: {
    immediate: string[];
    this_week: string[];
    ongoing: string[];
  };
  recovery_outlook: string;
}

export interface ScanSummary {
  scan_id: string;
  timestamp: string;
  crop_type: string;
  disease_name: string;
  severity: string;
  thumbnail_url: string;
}

interface ScanStore {
  currentScanId: string | null;
  currentResult: ScanResult | null;
  scanHistory: ScanSummary[];
  isAnalyzing: boolean;
  error: string | null;
  startAnalysis: (imageUri: string) => Promise<void>;
  setResult: (result: ScanResult) => void;
  loadHistory: () => Promise<void>;
  clearCurrent: () => void;
}

export const useScanStore = create<ScanStore>((set) => ({
  currentScanId: null,
  currentResult: null,
  scanHistory: [],
  isAnalyzing: false,
  error: null,

  startAnalysis: async (imageUri: string) => {
    set({ isAnalyzing: true, error: null, currentResult: null });

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "crop.jpg",
      } as any);

      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result: ScanResult = await response.json();
      set({
        currentScanId: result.scan_id,
        currentResult: result,
        isAnalyzing: false,
      });
    } catch (error: any) {
      set({
        isAnalyzing: false,
        error: error.message || "Analysis failed",
      });
    }
  },

  setResult: (result: ScanResult) => {
    set({ currentScanId: result.scan_id, currentResult: result });
  },

  loadHistory: async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/history`);
      if (!response.ok) throw new Error("Failed to load history");
      const history: ScanSummary[] = await response.json();
      set({ scanHistory: history });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  clearCurrent: () => {
    set({ currentScanId: null, currentResult: null, error: null });
  },
}));
