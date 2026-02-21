import FinancialInput from "./financialInputs";

export default function ExpensesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rp-base via-rp-surface to-rp-overlay px-4 py-10 text-soft">
      <div className="max-w-6xl mx-auto">
        <FinancialInput />
      </div>
    </div>
  );
}
