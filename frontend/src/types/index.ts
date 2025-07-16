// Types for X-ray data from Django API

export interface XRayRecord {
  id: number;
  patient_id: string;
  image: string;
  image_url: string;
  body_part: string;
  scan_date: string;
  institution: string;
  description: string;
  diagnosis: string;
  tags: string[] | string;  // Can be array from regular API or string from Elasticsearch
  tags_display: string;
  created_at: string;
  updated_at: string;
}

export interface XRayListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: XRayRecord[];
}

export interface SearchFilters {
  search?: string;
  body_part?: string;
  diagnosis?: string;
  institution?: string;
  date_from?: string;
  date_to?: string;
  tags?: string;
}

export interface ApiStats {
  total_scans: number;
  body_part_distribution: { [key: string]: number };
  institution_distribution: { [key: string]: number };
  recent_scans_30_days: number;
}

export interface DropdownData {
  body_parts: string[];
  institutions: string[];
  diagnoses: string[];
}

export interface ElasticsearchResult {
  results: XRayRecord[];
  total_hits: number;
  max_score: number;
  took: number;
  query: {
    q: string;
    filters?: SearchFilters;
  };
} 