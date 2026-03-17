import { Transaction } from "@/types/transaction";

export const INTEREST_PERIODS = ["day", "month", "year"] as const;

type InterestMode = "fixed" | "percentage";
type InterestPeriod = (typeof INTEREST_PERIODS)[number];

const MONTH_FACTOR: Record<InterestPeriod, number> = {
  day: 30,
  month: 1,
  year: 1 / 12,
};

export function getInterestMode(transaction: Pick<Transaction, "interest_mode" | "type">): InterestMode {
  if (transaction.type === "collection") return "fixed";
  return transaction.interest_mode === "percentage" ? "percentage" : "fixed";
}

export function getInterestPeriod(transaction: Pick<Transaction, "interest_period" | "type">): InterestPeriod {
  if (transaction.type === "collection") return "day";
  if (transaction.interest_period === "month" || transaction.interest_period === "year") return transaction.interest_period;
  return "day";
}

export function getMonthlyInterestProjection(
  transaction: Pick<Transaction, "amount" | "interest" | "interest_mode" | "interest_period" | "type">,
): number {
  if (transaction.type === "collection") return 0;

  const mode = getInterestMode(transaction);
  const period = getInterestPeriod(transaction);
  const baseInterest = mode === "percentage"
    ? (Number(transaction.amount) * Number(transaction.interest)) / 100
    : Number(transaction.interest);

  return baseInterest * MONTH_FACTOR[period];
}

export function formatCurrency(value: number): string {
  return `₹${Number(value).toLocaleString()}`;
}

export function formatInterestLabel(
  transaction: Pick<Transaction, "interest" | "interest_mode" | "interest_period" | "type">,
): string {
  if (transaction.type === "collection") return "Received";

  const mode = getInterestMode(transaction);
  const period = getInterestPeriod(transaction);

  if (mode === "percentage") {
    return `${Number(transaction.interest).toLocaleString()}% / ${period}`;
  }

  return `${formatCurrency(Number(transaction.interest))} / ${period}`;
}
