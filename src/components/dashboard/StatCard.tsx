import type { ReactNode } from 'react';
import clsx from 'clsx';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export const StatCard = ({ title, value, icon, trend, trendUp, className }: StatCardProps) => {
    return (
        <div className={clsx("bg-[#1a1a1a] p-5 rounded-xl border border-[#333] relative overflow-hidden group hover:border-[#444] transition-colors", className)}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
                {icon && <div className="text-orange-500 opacity-80 group-hover:opacity-100 transition-opacity">{icon}</div>}
            </div>

            <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
                {trend && (
                    <span className={clsx("text-xs font-medium", trendUp ? "text-green-500" : "text-red-500")}>
                        {trend}
                    </span>
                )}
            </div>

            {/* Decorative background glow */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-orange-500/5 blur-2xl rounded-full pointer-events-none"></div>
        </div>
    );
};
