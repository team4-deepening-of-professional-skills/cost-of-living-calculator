// users choice of time period.
export type PeriodPreset = "7d" | "30d" | "month";

// results for comparing totals between two time periods. shows difference in % and difference.
export type ComparisonResult = {
  currentTotal: number;
  previousTotal: number;
  difference: number;
  percentageChange: number;
  currentRange: { from: Date; to: Date };
  previousRange: { from: Date; to: Date };
};

// comparing between categories
export type CategoryComparisonRow = {
  category: string;
  currentTotal: number;
  previousTotal: number;
  difference: number;
  percentageChange: number;
};

// chooses only amount date and category
type ExpenseLike = {
  amount: number;
  date: string | number;
  category?: string;
};

//  date helpers

//from start of day to end of day
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// substract or add dates how needed
function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

// start and en of month
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function toDate(value: string | number) {
  return new Date(value);
}

// calulation helpers

// count together all expenses in chosen range
function sumInRange(expenses: ExpenseLike[], from: Date, to: Date) {
  return expenses.reduce((sum, e) => {
    const d = toDate(e.date);
    if (d >= from && d <= to) return sum + Number(e.amount || 0);
    return sum;
  }, 0);
}

// count the sum by category
function sumByCategoryInRange(
  expenses: ExpenseLike[],
  from: Date,
  to: Date
): Record<string, number> {
  return expenses.reduce((acc, e) => {
    const d = toDate(e.date);
    if (d < from || d > to) return acc;

    const key = (e.category || "uncategorized").toString();
    acc[key] = (acc[key] || 0) + Number(e.amount || 0);
    return acc;
  }, {} as Record<string, number>);
}

// compare two time periods
export function getRangesForPreset(preset: PeriodPreset, now = new Date()) {
  if (preset === "month") {
    const currentFrom = startOfMonth(now);
    const currentTo = endOfDay(now);

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevFrom = startOfMonth(lastMonth);
    const prevTo = endOfMonth(lastMonth);

    return {
      current: { from: currentFrom, to: currentTo },
      previous: { from: prevFrom, to: prevTo },
    };
  }

// if chosen period isnt a month --> it compares 30 or 7 days
  const days = preset === "7d" ? 7 : 30;

  const currentTo = endOfDay(now);
  const currentFrom = startOfDay(addDays(now, -(days - 1)));

  const prevTo = endOfDay(addDays(currentFrom, -1));
  const prevFrom = startOfDay(addDays(prevTo, -(days - 1)));

  return {
    current: { from: currentFrom, to: currentTo },
    previous: { from: prevFrom, to: prevTo },
  };
}

// compare total spending between two periods
export function compareByPreset(
  expenses: ExpenseLike[],
  preset: PeriodPreset,
  now = new Date()
): ComparisonResult {
  const ranges = getRangesForPreset(preset, now);

  const currentTotal = sumInRange(expenses, ranges.current.from, ranges.current.to);
  const previousTotal = sumInRange(expenses, ranges.previous.from, ranges.previous.to);

  const difference = currentTotal - previousTotal;
  const percentageChange =
    previousTotal === 0 ? 0 : (difference / previousTotal) * 100;

  return {
    currentTotal,
    previousTotal,
    difference,
    percentageChange,
    currentRange: ranges.current,
    previousRange: ranges.previous,
  };
}

// compare categories sepreately between periods
export function compareCategoriesByPreset(
  expenses: ExpenseLike[],
  preset: PeriodPreset,
  now = new Date()
): {
  rows: CategoryComparisonRow[];
  currentRange: { from: Date; to: Date };
  previousRange: { from: Date; to: Date };
} {
  const ranges = getRangesForPreset(preset, now);

  const currentTotals = sumByCategoryInRange(expenses, ranges.current.from, ranges.current.to);
  const previousTotals = sumByCategoryInRange(expenses, ranges.previous.from, ranges.previous.to);

  const allCategories = Array.from(
    new Set([...Object.keys(currentTotals), ...Object.keys(previousTotals)])
  );

  const rows: CategoryComparisonRow[] = allCategories
    .map((category) => {
      const currentTotal = currentTotals[category] ?? 0;
      const previousTotal = previousTotals[category] ?? 0;
      const difference = currentTotal - previousTotal;
      const percentageChange =
        previousTotal === 0 ? 0 : (difference / previousTotal) * 100;

      return {
        category,
        currentTotal,
        previousTotal,
        difference,
        percentageChange,
      };
    })

    //filter highest spending first
    .sort((a, b) => b.currentTotal - a.currentTotal);

  return {
    rows,
    currentRange: ranges.current,
    previousRange: ranges.previous,
  };
}


