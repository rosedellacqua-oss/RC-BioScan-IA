export interface HairAnalysisData {
  densityScore: number;
  thicknessScore: number;
  hydrationScore: number;
  scalpHealthScore: number;
  overallHealthScore: number;
  condition: string;
  detectedIssues: string[];
  recommendations: string[];
  technicalSummary: string;
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface ChartDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}