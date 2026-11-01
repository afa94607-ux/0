export type Language = 'kh' | 'en';

export interface Translations {
  // Tabs
  tabBet: string;
  tabStatement: string;
  tabResults: string;
  tabAdmin: string;

  // Header
  deposit: string;
  rules: string;
  sound: string;
  soundMuted: string;
  soundUnmuted: string;

  // Sidebar
  balance: string;
  totalBet: string;
  clear: string;
  double: string;
  todayProfitLoss: string;
  recentResults: string;
  currentBets: string;
  noBetsYet: string;
  win: string;
  loss: string;

  // Arena & Countdown
  round: string;
  drawing: string;
  countdownSeconds: string;
  waitingForNext: string;

  // Betting Board
  big: string;
  small: string;
  odd: string;
  even: string;
  red: string;
  green: string;
  blue: string;
  rate: string;

  // Roadmap
  roadmapNumberBigSmall: string;
  roadmapColorOddEven: string;

  // Language names
  khmer: string;
  english: string;
}

export const translations: Record<Language, Translations> = {
  kh: {
    tabBet: 'ភ្នាល់',
    tabStatement: 'ឈ្នះចាញ់',
    tabResults: 'លទ្ធផល',
    tabAdmin: 'ផ្ទាំងគ្រប់គ្រង (Admin)',
    deposit: 'ដាក់ប្រាក់',
    rules: 'របៀបលេង',
    sound: 'សំឡេង',
    soundMuted: 'បើកសំឡេង',
    soundUnmuted: 'បិទសំឡេង',
    balance: 'សមតុល្យ',
    totalBet: 'ប្រាក់ភ្នាល់សរុប',
    clear: 'សម្អាត',
    double: 'ទ្វេដង',
    todayProfitLoss: 'ឈ្នះ/ចាញ់ថ្ងៃនេះ',
    recentResults: 'លទ្ធផលថ្មីៗ',
    currentBets: 'ការភ្នាល់បច្ចុប្បន្ន',
    noBetsYet: 'មិនទាន់មានការភ្នាល់នៅឡើយទេ',
    win: 'ឈ្នះ',
    loss: 'ចាញ់',
    round: 'ជុំ',
    drawing: 'កំពុងចាប់រង្វាន់...',
    countdownSeconds: 'វិនាទី',
    waitingForNext: 'រង់ចាំជុំបន្ទាប់',
    big: 'ធំ',
    small: 'តូច',
    odd: 'សេស',
    even: 'គូ',
    red: 'ក្រហម',
    green: 'បៃតង',
    blue: 'ខៀវ',
    rate: 'អត្រា',
    roadmapNumberBigSmall: 'លេខ / តូចធំ',
    roadmapColorOddEven: 'ពណ៌ / សេសគូ',
    khmer: '1. ខ្មែរ',
    english: '2. English',
  },
  en: {
    tabBet: 'Bet',
    tabStatement: 'Win/Loss',
    tabResults: 'Results',
    tabAdmin: 'Admin Panel',
    deposit: 'Deposit',
    rules: 'Rules',
    sound: 'Sound',
    soundMuted: 'Unmute',
    soundUnmuted: 'Mute',
    balance: 'Balance',
    totalBet: 'Total Bet',
    clear: 'Clear',
    double: 'Double',
    todayProfitLoss: 'Today P/L',
    recentResults: 'Recent Results',
    currentBets: 'Current Bets',
    noBetsYet: 'No active bets yet',
    win: 'Win',
    loss: 'Loss',
    round: 'Round',
    drawing: 'Drawing Result...',
    countdownSeconds: 'seconds',
    waitingForNext: 'Waiting for next round',
    big: 'Big',
    small: 'Small',
    odd: 'Odd',
    even: 'Even',
    red: 'Red',
    green: 'Green',
    blue: 'Blue',
    rate: 'Odds',
    roadmapNumberBigSmall: 'Number / Big-Small',
    roadmapColorOddEven: 'Color / Odd-Even',
    khmer: '1. ខ្មែរ',
    english: '2. English',
  },
};
