
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

export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
}

export enum ComplianceRule {
  BIO = 'BIO (Basisbeveiliging Overheid)',
  AVG = 'AVG / GDPR',
  DATA_RESIDENCY = 'NL Data Residency (West Europe)',
  PURVIEW = 'Governance via Microsoft Purview'
}
