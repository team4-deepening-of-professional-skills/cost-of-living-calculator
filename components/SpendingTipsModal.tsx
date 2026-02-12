"use client";

import { Button } from "@/components/ui/Button";

export interface TipsResponse {
  date_from: string;
  date_to: string;
  total_spending: string;
  summary: string;
  tip1: string;
  tip2: string;
  tip3: string;
}

interface SpendingTipsModalProps {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  data: TipsResponse | null;
  category: string | null;
  onClose: () => void;
}

export function SpendingTipsModal({
  isOpen,
  isLoading,
  error,
  data,
  category,
  onClose,
}: SpendingTipsModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl rounded-2xl border border-rp-border bg-rp-surface p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-soft">Savings Tips</h3>
            {category && (
              <div className="text-xs text-subtle capitalize">
                {category.replace(/_/g, " ")}
              </div>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted">Generating tips...</p>
        ) : error ? (
          <div className="text-sm text-rose-300">{error}</div>
        ) : data ? (
          <div className="space-y-4 text-sm text-soft">
            <div className="text-subtle">
              {data.date_from} - {data.date_to}
            </div>
            <div>
              <span className="text-subtle">Total spending:</span> €{" "}
              {data.total_spending}
            </div>
            <div>{data.summary}</div>
            <div>
              <div className="text-subtle mb-1">Tips</div>
              <ul className="space-y-2">
                <li>{data.tip1}</li>
                <li>{data.tip2}</li>
                <li>{data.tip3}</li>
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">No tips available.</p>
        )}
      </div>
    </div>
  );
}
