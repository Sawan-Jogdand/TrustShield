/**
 * TrustShield AI - API Configuration
 * Uses relative API paths for single-origin unified deployment,
 * with optional VITE_API_BASE_URL support for external / decoupled staging.
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const API_ENDPOINTS = {
  ANALYZE_TEXT: `${API_BASE}/api/analyze/text`,
  ANALYZE_MEDIA: `${API_BASE}/api/analyze/media`,
  DATASET_STATS: `${API_BASE}/api/dataset/stats`,
  MODELS_METRICS: `${API_BASE}/api/models/metrics`,
  REPORTS_HISTORY: `${API_BASE}/api/reports/history`,
  REPORTS_SAVE: `${API_BASE}/api/reports/save`,
  REPORT_BY_ID: (id) => `${API_BASE}/api/reports/${id}`,
};
