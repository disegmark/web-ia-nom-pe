export type IconKey =
  | "sales"
  | "support"
  | "marketing"
  | "operations"
  | "research"
  | "admin"
  | "data"
  | "crm"
  | "google"
  | "email"
  | "whatsapp"
  | "social"
  | "erp"
  | "database"
  | "api"
  | "automation"
  | "knowledge"
  | "security"
  | "config"
  | "integration"
  | "advisory"
  | "chat"
  | "brain"
  | "network"
  | "globe"
  | "bot"
  | "tools"
  | "process"
  | "target"
  | "analysis"
  | "decisions"
  | "execution"
  | "person"
  | "design"
  | "trending"
  | "search-doc"
  | "calendar"
  | "video"
  | "logistics"
  | "slides"
  | "media";

export type AgentArea = {
  slug: string;
  name: string;
  description: string;
  capabilities: string[];
  icon: IconKey;
};

export type Service = {
  slug: string;
  name: string;
  description: string;
  bullets: string[];
  icon: IconKey;
};

export type Integration = {
  name: string;
  category: string;
  icon: IconKey;
};

export type Industry = {
  slug: string;
  name: string;
  description: string;
  useCases: string[];
};

export type Faq = {
  question: string;
  answer: string;
};

export type ProcessStep = {
  title: string;
  description: string;
  icon?: IconKey;
};

export type IconItem = {
  title: string;
  description: string;
  icon: IconKey;
};

export type AutomationExample = {
  title: string;
  description: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  content: string[];
};
