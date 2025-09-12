import { ReactNode } from "react";

type Props = {
  title: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
};

export default function MetricCard({ title, value, helper, icon }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        {icon && <div className="p-2 rounded-xl bg-slate-100">{icon}</div>}
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}
