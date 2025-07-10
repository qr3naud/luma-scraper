// API Request/Response Types
export interface ScrapeRequest {
  event_url: string;
  description: string;
  callback_url: string;
}

export interface ScrapeResponse {
  status: 'success' | 'error';
  message: string;
  contacts_found?: number;
  error?: string;
}

export interface Contact {
  name: string;
  profile_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  other_links?: string[];
}

// Clay Response Types (what comes back to frontend)
export interface ClayResult {
  contact: Contact;
  reason: string;
  linkedin_message: string;
  match_score: number;
}

export interface ClayCallback {
  top_matches: ClayResult[];
  original_request: ScrapeRequest;
  processing_time: number;
}

// Health Check
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp?: string;
  version?: string;
} 