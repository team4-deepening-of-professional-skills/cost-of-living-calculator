import { Button } from "@/components/ui/Button";

import { Entry } from "./financialInputs";

type Props = {
  entries: Entry[];
  onDelete: (id: string) => void;
};

function formatEUR(n: number) {
  return `€ ${n.toFixed(2).replace(".", ",")}`;
}

// list of all entries / full history.. (think full bank statement). sorts newest entries first.
export default function EntryList({ entries, onDelete }: Props) {
  const sorted = [...entries].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-soft">History</h2>
        <span className="text-xs text-subtle">{sorted.length} entries</span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted">No history yet.</p>
      ) : (
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2 rounded-xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-rp-border [&::-webkit-scrollbar-thumb]:rounded-full">
          {sorted.map((entry) => {
            const isIncome = entry.category === "income";

            return (
              <div
                key={entry.id}
                className="flex items-start justify-between gap-4 border-b border-rp-border pb-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <div
                    className={`font-semibold ${
                      isIncome ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {formatEUR(entry.amount)}
                  </div>

                  <div className="text-sm text-soft mt-1">
                    <span className="font-medium capitalize">
                      {entry.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-subtle"> · </span>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
