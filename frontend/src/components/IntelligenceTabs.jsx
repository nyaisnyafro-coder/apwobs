import { useState, useEffect } from 'react';

const TABS = [
    { id: 'hourly', label: '⚡ Saatlik', role: 'The Watchman' },
    { id: 'daily', label: '📅 Günlük', role: 'The Journalist' },
    { id: 'weekly', label: '🗓️ Haftalık', role: 'The Historian' }
];

export default function IntelligenceTabs() {
    const [activeTab, setActiveTab] = useState('hourly');
    const [reports, setReports] = useState({});
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [viewMode, setViewMode] = useState('default'); // 'default' | 'custom'
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [customReports, setCustomReports] = useState({});
    const [customLoading, setCustomLoading] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState([]);

    useEffect(() => {
        fetchReports();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/v1/intelligence/categories');
            if (!res.ok) return;
            const data = await res.json();
            setCategoryOptions(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            console.error('Category fetch error:', err);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/intelligence/');
            if (res.ok) {
                const data = await res.json();
                setReports(data.data || {});
            }
        } catch (err) {
            console.error('Intelligence fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const triggerGeneration = async (type) => {
        if (viewMode === 'custom') {
            return triggerCustomReport(type);
        }
        setGenerating(true);
        try {
            await fetch(`/api/v1/intelligence/generate/${type}`, { method: 'POST' });
            // Wait a bit for generation, then refresh
            setTimeout(() => {
                fetchReports();
                setGenerating(false);
            }, 5000);
        } catch (err) {
            console.error('Generation error:', err);
            setGenerating(false);
        }
    };

    const triggerCustomReport = async (type) => {
        if (!selectedCategories.length) return;
        setCustomLoading(true);
        const categoryKey = [...selectedCategories].sort().join('|');
        const reportKey = `${type}::${categoryKey}`;
        try {
            const res = await fetch('/api/v1/intelligence/custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_type: type,
                    categories: selectedCategories,
                }),
            });
            if (!res.ok) return;
            const data = await res.json();
            setCustomReports((prev) => ({ ...prev, [reportKey]: data.data }));
        } catch (err) {
            console.error('Custom intelligence error:', err);
        } finally {
            setCustomLoading(false);
        }
    };

    const currentCategoryKey = [...selectedCategories].sort().join('|');
    const currentReportKey = `${activeTab}::${currentCategoryKey}`;
    const currentReport = viewMode === 'custom' ? customReports[currentReportKey] : reports[activeTab];
    const sanitize = (text) => (text || '').replace(/[*_`#]/g, '').trim();

    const formatDate = (isoString) => {
        if (!isoString) return 'Henüz oluşturulmadı';
        const date = new Date(isoString);
        return date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-100">🧠 Katmanlı İstihbarat</h3>
                    {/* View mode selector */}
                    <div className="flex bg-dark-bg rounded-lg p-0.5">
                        <button
                            onClick={() => setViewMode('default')}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${viewMode === 'default'
                                    ? 'bg-primary/20 text-primary font-medium'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Varsayılan Görünüm
                        </button>
                        <button
                            onClick={() => setViewMode('custom')}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${viewMode === 'custom'
                                    ? 'bg-primary/20 text-primary font-medium'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Özelleştirilmiş Akış
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => triggerGeneration(activeTab)}
                    disabled={generating || customLoading || (viewMode === 'custom' && selectedCategories.length === 0)}
                    className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50"
                >
                    {generating || customLoading ? '⏳ Üretiliyor...' : viewMode === 'custom' ? '🔍 Özel Özet Üret' : '🔄 Şimdi Üret'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-dark-border mb-4">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === tab.id
                            ? 'text-primary'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                ))}
            </div>

            {/* Category filter for custom mode */}
            {viewMode === 'custom' && (
                <div className="mb-4 p-3 bg-dark-bg rounded-lg border border-dark-border">
                    <p className="text-xs text-gray-400 mb-2">İstediğiniz kategorileri seçin:</p>
                    <div className="flex flex-wrap gap-2">
                        {(categoryOptions || []).map(cat => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setSelectedCategories(prev =>
                                        prev.includes(cat)
                                            ? prev.filter(c => c !== cat)
                                            : [...prev, cat]
                                    );
                                }}
                                className={`px-2 py-1 text-xs rounded-full border transition-all ${selectedCategories.includes(cat)
                                        ? 'bg-primary/20 border-primary/50 text-primary'
                                        : 'bg-dark-card border-dark-border text-gray-400 hover:border-gray-500'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    {selectedCategories.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">{selectedCategories.length} kategori seçildi</p>
                    )}
                    {viewMode === 'custom' && !selectedCategories.length && (
                        <p className="text-xs text-amber-300 mt-2">Özel özet için en az 1 kategori seçin.</p>
                    )}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-700 rounded"></div>
                </div>
            ) : !currentReport ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-3">Bu periyot için henüz rapor oluşturulmadı.</p>
                    <button
                        onClick={() => triggerGeneration(activeTab)}
                        disabled={generating}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                        📊 İlk Raporu Oluştur
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Summary */}
                    <div>
                        <p className="text-gray-300 leading-relaxed">{sanitize(currentReport.summary)}</p>
                    </div>

                    {/* Top Topics */}
                    {currentReport.top_topics && currentReport.top_topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {currentReport.top_topics.map((topic, idx) => (
                                <span
                                    key={idx}
                                    className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                                >
                                    #{topic}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Forecast Box */}
                    {currentReport.forecast && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                            <h4 className="text-amber-400 font-semibold text-sm mb-2">
                                🔮 Apertus Öngörüsü
                            </h4>
                            <p className="text-amber-100/80 text-sm leading-relaxed">
                                {sanitize(currentReport.forecast)}
                            </p>
                        </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-dark-border">
                        <span>📰 {currentReport.news_count || 0} haber analiz edildi</span>
                        <span>🕐 {formatDate(currentReport.created_at)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
