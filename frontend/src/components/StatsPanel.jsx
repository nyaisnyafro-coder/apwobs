import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';

export default function StatsPanel() {
    const [stats, setStats] = useState({
        green: 0,
        yellow: 0,
        red: 0
    });

    // Fetch live stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch stats for the last 1 hour
                const res = await fetch('/api/v1/stats/visual-stats?hours=1');
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        green: data.green,
                        yellow: data.yellow,
                        red: data.red
                    });
                }
            } catch (e) {
                console.error("Stats fetch error", e);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Son 1 Saat
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div
                    className="flex flex-col items-center p-2 rounded bg-green-500/10 border border-green-500/20 cursor-help group relative"
                    title="Son 1 saatte doğrulanmış güvenilir haberler"
                >
                    <ShieldCheck className="w-4 h-4 text-green-400 mb-1" />
                    <span className="text-lg font-bold text-green-400 leading-none">{stats.green}</span>
                    <span className="text-[9px] text-green-300/60 mt-1">Güvenilir</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-[10px] text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-gray-700">
                        Kaynağı doğrulanmış haberler
                    </div>
                </div>

                <div
                    className="flex flex-col items-center p-2 rounded bg-yellow-500/10 border border-yellow-500/20 cursor-help group relative"
                    title="Son 1 saatte inceleme bekleyen şüpheli içerikler"
                >
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mb-1" />
                    <span className="text-lg font-bold text-yellow-400 leading-none">{stats.yellow}</span>
                    <span className="text-[9px] text-yellow-300/60 mt-1">Şüpheli</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-[10px] text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-gray-700">
                        Manuel inceleme gerektiren içerikler
                    </div>
                </div>

                <div
                    className="flex flex-col items-center p-2 rounded bg-red-500/10 border border-red-500/20 cursor-help group relative"
                    title="Son 1 saatte henüz doğrulanmamış yeni içerikler"
                >
                    <XCircle className="w-4 h-4 text-red-400 mb-1" />
                    <span className="text-lg font-bold text-red-400 leading-none">{stats.red}</span>
                    <span className="text-[9px] text-red-300/60 mt-1">Teyitsiz</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-[10px] text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-gray-700">
                        Doğrulama bekleyen haberler
                    </div>
                </div>
            </div>
        </div>
    );
}
