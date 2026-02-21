/**
 * Betting Platforms
 * Add new betting platform entries here as needed.
 */
export interface BettingPlatform {
  value: string;
  label: string;
}

export const BETTING_SITES: BettingPlatform[] = [
  { value: "playtime", label: "PlayTime" },
  { value: "1xbet", label: "1xBet" },
  { value: "bingoplus", label: "Bingoplus" },
  { value: "casinoplus", label: "Casinoplus" },
];
