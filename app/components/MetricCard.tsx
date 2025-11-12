import { ReactNode } from "react";

type Props = {
  title: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
};

export default function MetricCard({ title, value, helper, icon }: Props) {
  return (
    <div className="bg-card border border-appborder rounded-2xl p-4 transition-colors duration-150 hover:bg-[rgba(var(--color-text-rgb),0.03)]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[rgba(var(--color-text-rgb),0.85)]">{title}</h3>
        {icon && (
          <div className="p-2 rounded-xl bg-[rgba(var(--color-accent2-rgb),0.12)]">{icon}</div>
        )}
      </div>
      <div className="mt-3 text-3xl font-bold text-[rgba(var(--color-text-rgb),1)]">{value}</div>
      {helper && <p className="mt-1 text-xs text-[rgba(var(--color-text-rgb),0.6)]">{helper}</p>}
    </div>
  );
}
