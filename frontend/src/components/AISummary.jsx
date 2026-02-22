import { useState, useEffect } from 'react';
import { Bot, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AISummary() {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/stats/summary');
            if (res.ok) {
                const data = await res.json();
                setSummary(data.summary || 'Özet oluşturulamadı.');
                setLastUpdated(new Date());
            }
        } catch (e) {
            console.error('Summary fetch error:', e);
            setSummary('Özet yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">AI Yönetici Özeti</h3>
                        <p className="text-[10px] text-gray-500">
                            {lastUpdated ? `Güncellendi: ${lastUpdated.toLocaleTimeString('tr-TR')}` : 'Yükleniyor...'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchSummary}
                    disabled={loading}
                    className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        loading
                            ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                            : "hover:bg-dark-bg text-gray-400 hover:text-gray-200"
                    )}
                    title="Yenile"
                >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                </button>
            </div>

            <div className="relative">
                {loading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-3 bg-gray-700 rounded w-full"></div>
                        <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-700 rounded w-4/6"></div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-300 leading-relaxed">
                        {summary}
                    </p>
                )}

                {/* Gradient overlay for long text */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-dark-card to-transparent pointer-events-none" />
            </div>
        </div>
    );
}
