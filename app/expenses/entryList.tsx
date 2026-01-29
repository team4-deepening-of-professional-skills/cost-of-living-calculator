import { Entry } from "./financialInputs"

type Props = {
  entries: Entry[]
  onDelete: (id: string) => void;
}

// list of all entries / full history.. (think full bank statement)
export default function EntryList({ entries, onDelete }: Props){

     const sorted = [...entries].sort((a, b) => b.createdAt - a.createdAt)

    return(
        <div className="border p-4 rounded">
            <h2 className="font-semibold mb-2">History</h2>
            <hr/>
            {entries.length === 0 && (
                <p className="text-sm text-gray-500">No history yet</p>
            )}

            {entries.map((entry) => (
                <div
                key={entry.id}
                className="flex justify between text-sm py-1"
                >

                {/* Entry Info */}
                <div className="flex flex-col">
                <span>
                    {entry.category} {entry.amount} €
                </span>
                <span className="text-xs text-gray-500">
                    {new Date(entry.createdAt).toLocaleDateString("en-GB")}
                </span>
                </div>
                

                {/* Delete Button */}
                <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="border p-1 rounded hover:bg-gray-100 text-sm"
                        >                   
                        Delete
                      </button>
                </div>

            </div>
            ))}
        </div>
    )
}