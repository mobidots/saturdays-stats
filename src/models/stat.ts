interface Stat {
  name: string;
  gp: number;
  tMoV: number;
  tCS: number;
  aMoV?: number;
  aCS?: number;
  bOT?: number;
  rank?: number;

  difference?: StatDifference
}

interface StatDifference {
  gp: number;
  aMoV: number;
  aCS: number;
  bOT: number;
  rank: number;

  gpText?: string;
  aMoVText?: string;
  aCSText?: string;
  bOTText?: string;
  rankText?: string;
}