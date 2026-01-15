import { Users, Wallet } from 'lucide-react';

interface RoleAnalyticsCardProps {
    roleName: string;
    count: number;
    totalCredits: number;
    colorClass?: string;
    onClick?: () => void;
}

export const RoleAnalyticsCard = ({ roleName, count, totalCredits, colorClass = "bg-blue-500", onClick }: RoleAnalyticsCardProps) => {
    return (
        <div
            onClick={onClick}
            className={`bg-[#1a1a1a] rounded-xl border border-[#333] p-4 flex flex-col justify-between hover:border-[#444] transition-all ${onClick ? 'cursor-pointer hover:bg-[#222]' : ''}`}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-2 h-8 rounded-full ${colorClass}`}></div>
                <div>
                    <h3 className="text-white font-bold text-lg">{roleName}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Role Overview</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-3 rounded-lg border border-[#222]">
                    <div className="flex items-center gap-2 mb-1 text-gray-400">
                        <Users size={14} />
                        <span className="text-[10px] uppercase font-bold">Active</span>
                    </div>
                    <span className="text-xl font-bold text-white">{count}</span>
                </div>
                <div className="bg-black/30 p-3 rounded-lg border border-[#222]">
                    <div className="flex items-center gap-2 mb-1 text-gray-400">
                        <Wallet size={14} />
                        <span className="text-[10px] uppercase font-bold">Credits</span>
                    </div>
                    <span className="text-xl font-bold text-white truncate" title={totalCredits.toLocaleString()}>
                        ₱{totalCredits.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })}
                    </span>
                </div>
            </div>
        </div>
    );
};
