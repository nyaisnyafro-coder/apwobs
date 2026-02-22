import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Activity, Zap, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PulsePanel() {
    const [pulse, setPulse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPulse();
        // Her 5 dakikada bir güncelle
        const interval = setInterval(fetchPulse, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchPulse = async () => {
        try {
            const res = await fetch('/api/v1/stats/pulse');
            if (res.ok) {
                const data = await res.json();
                setPulse(data);
            }
        } catch (e) {
            console.error('Pulse fetch error:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-dark-card border border-dark-border rounded-xl p-4 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!pulse) return null;

    const cards = [
        {
            title: "Gündem Yoğunluğu",
            value: pulse.volume?.count || 0,
            subtitle: pulse.volume?.trend_label || "",
            yesterday: pulse.volume?.yesterday_count || 0,
            tooltip: "Son 24 saatte sisteme giren toplam haber adedi. Ani artışlar gündem baskısının yükseldiğini, olağanüstü bir gelişme yaşandığını ve kamuoyunun dikkatinin yoğunlaştığını gösterir.",
            icon: Activity,
            trend: pulse.volume?.trend > 0 ? 'up' : 'down',
            color: "blue"
        },
        {
            title: "Kirlilik Oranı",
            value: `%${pulse.misinformation?.rate || 0}`,
            subtitle: pulse.misinformation?.label || "Normal",
            yesterday: `%${pulse.misinformation?.yesterday_rate || 0}`,
            tooltip: "Şüpheli ve doğrulanamayan içeriklerin toplama oranı. %20 üzeri bilgi kirliliği riskine, teyit maliyetinin artmasına ve okuyucu güveninin düşmesine işaret eder.",
            icon: AlertTriangle,
            trend: pulse.misinformation?.rate > 20 ? 'danger' : 'safe',
            color: pulse.misinformation?.rate > 20 ? "red" : "green"
        },
        {
            title: "Kriz Skoru",
            value: pulse.crisis_score?.score || 0,
            subtitle: pulse.crisis_score?.label || "Normal",
            tooltip: "Kirlilik oranı, haber hacmi ve bekleyen haber yoğunluğunun birleşiminden hesaplanan 0-100 arası risk puanı. 70+ kritik seviye, 40-70 dikkat gerektiren, 0-40 normal operasyonu ifade eder.",
            icon: Zap,
            trend: pulse.crisis_score?.score > 40 ? 'danger' : 'safe',
            color: pulse.crisis_score?.score > 70 ? "red" : (pulse.crisis_score?.score > 40 ? "yellow" : "green")
        },
        {
            title: "Doğrulama Gücü",
            value: `%${100 - (pulse.misinformation?.rate || 0)}`,
            subtitle: "Temiz Haber",
            yesterday: `%${100 - (pulse.misinformation?.yesterday_rate || 0)}`,
            tooltip: "Güvenilir ve doğrulanmış (temiz) haberlerin toplam haberlere oranı. Düşüş kalite alarmı anlamına gelir ve editoryal müdahale gerektirebilir.",
            icon: Shield,
            trend: 'safe',
            color: "emerald"
        }
    ];

    const colorMap = {
        blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400",
        red: "from-red-500/20 to-red-600/5 border-red-500/30 text-red-400",
        yellow: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30 text-yellow-400",
        green: "from-green-500/20 to-green-600/5 border-green-500/30 text-green-400",
        emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400"
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    tabIndex={0}
                    role="note"
                    aria-label={`${card.title} aciklamasi`}
                    aria-describedby={`pulse-tooltip-${idx}`}
                    className={cn(
                        "relative overflow-hidden bg-gradient-to-br rounded-xl p-4 border transition-all duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 group",
                        colorMap[card.color]
                    )}
                >
                    {/* Tooltip on Hover */}
                    <div id={`pulse-tooltip-${idx}`} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none whitespace-normal text-center max-w-[260px] z-50 border border-gray-700">
                        {card.tooltip}
                    </div>

                    {/* Glow effect */}
                    <div className={cn(
                        "absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-30",
                        card.color === "red" && "bg-red-500",
                        card.color === "yellow" && "bg-yellow-500",
                        card.color === "green" && "bg-green-500",
                        card.color === "blue" && "bg-blue-500",
                        card.color === "emerald" && "bg-emerald-500"
                    )} />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                {card.title}
                            </span>
                            <card.icon className="w-4 h-4 opacity-60" />
                        </div>

                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-white">
                                {card.value}
                            </span>
                            {card.trend === 'up' && (
                                <TrendingUp className="w-4 h-4 text-green-400 mb-1" />
                            )}
                            {card.trend === 'down' && (
                                <TrendingDown className="w-4 h-4 text-red-400 mb-1" />
                            )}
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                            {card.subtitle}
                        </p>

                        {/* Previous day comparison */}
                        {card.yesterday !== undefined && (
                            <p className="text-xs text-gray-600 mt-2 border-t border-gray-700 pt-2">
                                Dün: {card.yesterday}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
