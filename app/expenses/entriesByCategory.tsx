import { Entry } from "./financialInputs"


const CATEGORIES: Category[] = [
  { id: "savings", label: "Savings" },
  { id: "housing", label: "Housing" },
  { id: "food", label: "Food" },
  { id: "entertainment", label: "Entertainment" },
  { id: "personal_care", label: "Personal Care" },
  { id: "transportation", label: "Transportation" },
  { id: "loan", label: "Loan Payments" },
  { id: "income", label: "Income" }
]


type Category = {
  id: string
  label: string
}

type Props = {
  entries: Entry[]
}

// sort the entries by category (need to add some time limit (like show for 30 days max??))..
export default function EntriesByCategory({ entries }: Props) {
  return (
    <div className="grid gap-4">
      {CATEGORIES.map((category) => {
        const categoryEntries = entries.filter(
          (entry) => entry.category === category.id
        )

        const total = categoryEntries.reduce(
          (sum, entry) => sum + entry.amount,
          0
        )

        return (
          <div
            key={category.id}
            className="border p-4 rounded space-y-2"
          >
            {/* Header */}
            <div className="flex justify-between font-semibold">
              <span>{category.label}</span>
              <span>{total}</span>
            </div>

            <hr />


            {/* Content */}
            {categoryEntries.length === 0 ? (
              <p className="text-sm text-gray-500">No history yet</p>
            ) : (
              <div className="space-y-1 text-sm">
                {categoryEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex flex-col">
                      <span>{entry.amount}€ {entry.description}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
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