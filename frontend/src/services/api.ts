import axios from 'axios';
import { XRayListResponse, XRayRecord, SearchFilters, ApiStats, DropdownData, ElasticsearchResult } from '../types';

// Configure axios base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export class XRayAPI {
  /**
   * Get list of X-ray scans with optional filtering
   */
  static async getXRays(filters: SearchFilters = {}, page: number = 1): Promise<XRayListResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.body_part) params.append('body_part', filters.body_part);
    if (filters.diagnosis) params.append('diagnosis', filters.diagnosis);
    if (filters.institution) params.append('institution', filters.institution);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.tags) params.append('tags', filters.tags);
    if (page > 1) params.append('page', page.toString());

    const response = await api.get(`/api/xrays/?${params.toString()}`);
    return response.data;
  }

  /**
   * Get specific X-ray scan by ID
   */
  static async getXRayById(id: number): Promise<XRayRecord> {
    const response = await api.get(`/api/xrays/${id}/`);
    return response.data;
  }

  /**
   * Advanced search using Elasticsearch (with fallback)
   */
  static async elasticsearchSearch(filters: SearchFilters): Promise<ElasticsearchResult> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('q', filters.search);

    try {
      const response = await api.get(`/api/search/?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Fallback to regular Django search
      console.warn('Elasticsearch not available, falling back to Django search');
      const fallbackResponse = await this.getXRays(filters);
      return {
        results: fallbackResponse.results,
        total_hits: fallbackResponse.count,
        max_score: 1.0,
        took: 0,
        query: { q: filters.search || '', filters }
      };
    }
  }

  /**
   * Get autocomplete suggestions
   */
  static async getSuggestions(field: string, text: string): Promise<string[]> {
    try {
      const response = await api.get(`/api/elasticsearch/suggestions/?field=${field}&text=${text}`);
      return response.data.suggestions || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get statistics for dashboard
   */
  static async getStats(): Promise<ApiStats> {
    const response = await api.get('/api/xrays/stats/');
    return response.data;
  }

  /**
   * Get dropdown data for filters
   */
  static async getDropdownData(): Promise<DropdownData> {
    const [bodyPartsResponse, institutionsResponse, diagnosesResponse] = await Promise.all([
      api.get('/api/xrays/body_parts/'),
      api.get('/api/xrays/institutions/'),
      api.get('/api/xrays/diagnoses/'),
    ]);

    return {
      body_parts: bodyPartsResponse.data.body_parts,
      institutions: institutionsResponse.data.institutions,
      diagnoses: diagnosesResponse.data.diagnoses,
    };
  }

  /**
   * Create new X-ray record
   */
  static async createXRay(data: FormData): Promise<XRayRecord> {
    const response = await api.post('/api/xrays/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Delete X-ray record
   */
  static async deleteXRay(id: number): Promise<void> {
    await api.delete(`/api/xrays/${id}/`);
  }
}

export default api; 