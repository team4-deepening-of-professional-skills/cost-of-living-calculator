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
  onDelete: (id: string) => void;
}

// sort the entries by category. newest 1st. shows / calculates full total of category. divides them into their boxes.
export default function EntriesByCategory({ entries, onDelete }: Props) {
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
              <span>{total.toFixed(2)} €</span>
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
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                  >
                    <div className="flex flex-col">
                       {/* amount */}
                      <span className="font-semibold">
                        {entry.amount.toFixed(2)} €
                      </span>

                      {/* merch*/}
                      <span className="font-medium">
                        {entry.merchant}
                      </span>

                      {/* description */}
                      <span className="text-sm text-gray-600">
                        "{entry.description}"
                      </span>

                      {/* time */}
                      <span className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="bg-brand box-border border rounded-base px-2 text-sm">
                        Delete
                      </button>

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