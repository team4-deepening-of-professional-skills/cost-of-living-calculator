import { Entry } from "./financialInputs"

type Props = {
  entries: Entry[]
  onDelete: (id: string) => void;
}

// list of all entries / full history.. (think full bank statement). sorts newest entries first.
export default function EntryList({ entries, onDelete }: Props){

     const sorted = [...entries].sort((a, b) => b.createdAt - a.createdAt)

    return(
        <div className="border p-4 rounded">
            <h2 className="font-semibold mb-2">History</h2>
            <hr/>
            {entries.length === 0 && (
                <p className="text-sm text-gray-500">No history yet</p>
            )}

            {/* Entry info */}
            {entries.map((entry) => (
                <div
                    key={entry.id}
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                <div className="flex flex-col">
                    {/* amount */}
                      <span className="font-semibold">
                        {entry.amount.toFixed(2)} €
                      </span>

                    <div className="flex flex-col">
                    {/* category */}
                    <span className="font-semibold">
                        {entry.category}
                    </span>
                    {/* merchant */}
                    <span className="font-medium">
                        {entry.merchant}
                    </span>
                {/* description */}
                    <span className="text-sm text-gray-600">
                        "{entry.description}"
                    </span>
                {/* timestamp */}
                    <span className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString("en-GB")}
                    </span>
                    </div>


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
    )
}