

// export type Step = {
//   relation:  string;   // e.g. "爸爸"
//   seniority: number;   // 0 = unspecified, 1 = eldest, 2 = second…
// };

// export type RelationshipResult = {
//   success:    boolean;
//   term?:      string;   // colloquial term  e.g. "姑姑"
//   formal?:    string;   // formal term      e.g. "姑母"
//   desc?:      string;   // plain description e.g. "爸爸的姐妹"
//   note?:      string;   // disambiguation note
//   side?:      "paternal" | "maternal" | "self";
//   gen?:       number;   // +1 elder, 0 peer, -1 junior
//   error?:     string;
//   suggestion?: string;
// };


export interface Step {
  relation: string
  seniority?: number
}

export interface RelationshipResult {
  success: boolean

  term?: string
  formal?: string
  desc?: string
  note?: string

  side?: "self" | "paternal" | "maternal"

  gen?: number

  error?: string
}