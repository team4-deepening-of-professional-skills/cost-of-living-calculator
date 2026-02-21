import { Button } from "@/components/ui/Button";

import { Entry } from "./financialInputs";

const CATEGORIES: Category[] = [
  { id: "savings", label: "Savings" },
  { id: "housing", label: "Housing" },
  { id: "food", label: "Food" },
  { id: "entertainment", label: "Entertainment" },
  { id: "personal_care", label: "Personal Care" },
  { id: "transportation", label: "Transportation" },
  { id: "loan", label: "Loan Payments" },
  { id: "income", label: "Income" },
];

type Category = {
  id: string;
  label: string;
};

type Props = {
  entries: Entry[];
  onDelete: (id: string) => void;
};

function formatEUR(n: number) {
  return `€ ${n.toFixed(2).replace(".", ",")}`;
}

// sort the entries by category. newest 1st. shows / calculates full total of category. divides them into their boxes.
export default function EntriesByCategory({ entries, onDelete }: Props) {
  return (
    <div className="grid gap-4">
      {CATEGORIES.map((category) => {
        const categoryEntries = entries.filter(
          (entry) => entry.category === category.id,
        );

        const total = categoryEntries.reduce((sum, entry) => sum + entry.amount, 0);

        return (
          <div
            key={category.id}
            className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30 backdrop-blur space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-soft">{category.label}</span>
              <span className="font-semibold text-soft">{formatEUR(total)}</span>
            </div>

            {/* Content */}
            {categoryEntries.length === 0 ? (
              <p className="text-sm text-muted">No history yet.</p>
            ) : (
              <div className="space-y-3">
                {categoryEntries
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between gap-4 border-b border-rp-border pb-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-soft">
                          {formatEUR(entry.amount)}
                        </div>
                        <div className="text-sm text-soft mt-1">
                          <span className="font-medium">{entry.merchant}</span>
                        </div>
                        <div className="text-sm text-subtle">“{entry.description}”</div>
                        <div className="text-xs text-muted mt-1">
                          {new Date(entry.createdAt).toLocaleDateString("en-GB")}
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => onDelete(entry.id)}
                        variant="danger"
                        size="sm"
                        className="shrink-0"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
