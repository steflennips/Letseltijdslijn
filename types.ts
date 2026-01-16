
export interface ArchitectureNode {
  id: string;
  label: string;
  category: 'Source' | 'Ingestion' | 'Storage' | 'Processing' | 'Serving' | 'AI' | 'Governance';
  description: string;
  icon: string;
  color: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}
