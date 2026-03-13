import { MessageSquare, AlertCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const cards = [
    {
        key: 'total',
        label: 'Total Conversations',
        sublabel: 'Active conversations',
        icon: MessageSquare,
        gradient: 'from-brand-500 to-brand-600',
        iconBg: 'bg-white/20',
        textColor: 'text-white',
    },
    {
        key: 'unattended',
        label: 'Queries Unattended',
        sublabel: 'Awaiting response',
        icon: Clock,
        gradient: 'from-violet-500 to-purple-600',
        iconBg: 'bg-white/20',
        textColor: 'text-white',
    },
    {
        key: 'high',
        label: 'High Urgency',
        sublabel: 'Immediate action needed',
        icon: AlertCircle,
        gradient: 'from-red-500 to-red-600',
        iconBg: 'bg-white/20',
        textColor: 'text-white',
    },
    {
        key: 'medium',
        label: 'Medium Urgency',
        sublabel: 'Follow up today',
        icon: AlertTriangle,
        gradient: 'from-amber-400 to-amber-500',
        iconBg: 'bg-white/20',
        textColor: 'text-white',
    },
    {
        key: 'low',
        label: 'Low Urgency',
        sublabel: 'Handle when available',
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-emerald-600',
        iconBg: 'bg-white/20',
        textColor: 'text-white',
    },
];

export default function StatsCards({ stats }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {cards.map(({ key, label, sublabel, icon: Icon, gradient, iconBg, textColor }) => (
                <div
                    key={key}
                    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-md`}
                >
                    {/* Background decoration */}
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
                    <div className="absolute -right-1 -bottom-6 w-16 h-16 bg-white/10 rounded-full" />

                    <div className="relative">
                        <div className={`inline-flex p-2 rounded-xl ${iconBg} mb-3`}>
                            <Icon className={`w-5 h-5 ${textColor}`} />
                        </div>
                        <div className={`text-3xl font-bold ${textColor} leading-none mb-1`}>
                            {stats[key] ?? 0}
                        </div>
                        <div className={`text-sm font-semibold ${textColor} opacity-90`}>{label}</div>
                        <div className={`text-xs ${textColor} opacity-70 mt-0.5`}>{sublabel}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
