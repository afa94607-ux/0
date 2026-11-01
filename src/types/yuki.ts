export type ColorType = 'red' | 'green' | 'blue';
export type SizeType = 'small' | 'big';
export type ParityType = 'odd' | 'even';

export interface Animal {
  number: number;
  nameKhmer: string;
  nameEnglish: string;
  color: ColorType;
  size: SizeType;
  parity: ParityType;
  payoutRate: number; // 11
  description: string;
  avatarUrl?: string;
}

export type BetCategory = 
  | 'small' // តូច (1-6)
  | 'big'   // ធំ (7-12)
  | 'odd'   // សេស (1,3,5,7,9,11)
  | 'even'  // គូ (2,4,6,8,10,12)
  | 'red'   // ក្រហម (1,4,7,10)
  | 'green' // បៃតង (2,5,8,11)
  | 'blue'  // ខៀវ (3,6,9,12)
  | `num_${number}`; // 1 to 12

export interface RoundResult {
  id?: string;
  roundId: string; // e.g. "2001#327"
  timestamp: string; // e.g. "18:51"
  fullDateTime: string;
  number: number;
  animal: Animal;
  size: SizeType;
  color: ColorType;
  parity: ParityType;
}

export interface PlacedBet {
  category: BetCategory;
  amount: number; // in KHR
  odds: number;
  labelKhmer: string;
}

export interface SettledBetRecord {
  id: string;
  roundId: string;
  time: string;
  category: BetCategory;
  labelKhmer: string;
  amount: number;
  odds: number;
  won: boolean;
  payout: number;
  winningNumber: number;
  winningAnimalKhmer: string;
}
