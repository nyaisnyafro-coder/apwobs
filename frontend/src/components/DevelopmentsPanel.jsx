import { useState, useEffect } from 'react';
import { Newspaper, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DevelopmentsPanel() {
    const DEVELOPMENTS_LIMIT = 11; // 8 + 3 ek satir
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchDevelopments();
    }, []);

    const fetchDevelopments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/v1/stats/developments?limit=${DEVELOPMENTS_LIMIT}`);
            if (res.ok) {
                const data = await res.json();
                setItems(Array.isArray(data.items) ? data.items : []);
                setExpandedId(null);
                setLastUpdated(new Date());
            }
        } catch (e) {
            console.error('Developments fetch error:', e);
            setItems([{ id: 'err', line: 'Gelişmeler yüklenemedi.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <Newspaper className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Gelişmeler</h3>
                        <p className="text-[10px] text-gray-500">
                            {lastUpdated ? `Güncellendi: ${lastUpdated.toLocaleTimeString('tr-TR')}` : 'Yükleniyor...'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchDevelopments}
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

            {loading ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-8 bg-gray-800/70 rounded-lg"></div>
                    <div className="h-8 bg-gray-800/70 rounded-lg"></div>
                    <div className="h-8 bg-gray-800/70 rounded-lg"></div>
                    <div className="h-8 bg-gray-800/70 rounded-lg"></div>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.id} className="space-y-1">
                            <button
                                type="button"
                                onClick={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                                className={cn(
                                    "block text-left bg-dark-bg/60 border border-dark-border rounded-lg px-3 py-2 text-xs text-gray-300 leading-relaxed transition-all duration-200",
                                    expandedId === item.id
                                        ? "w-full whitespace-normal break-words border-primary/40 bg-primary/5"
                                        : "w-full truncate whitespace-nowrap"
                                )}
                                title={expandedId === item.id ? "Daraltmak için tıkla" : "Dikey genişletmek için tıkla"}
                            >
                                {item.line}
                            </button>
                            {expandedId === item.id && item.url && (
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-[11px] text-primary hover:underline px-1"
                                >
                                    Haberi Aç
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
