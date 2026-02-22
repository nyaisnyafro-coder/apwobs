import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import PulsePanel from '../components/PulsePanel';
import DevelopmentsPanel from '../components/DevelopmentsPanel';
import IntelligenceTabs from '../components/IntelligenceTabs';
import CalendarWidget from '../components/CalendarWidget';

const COLORS = {
    verified: '#4ade80',    // green
    uncertain: '#facc15',   // yellow  
    unverified: '#f87171',  // red
    pending: '#60a5fa'      // blue
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('24h');
    const [chartType, setChartType] = useState('status'); // status | category

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/v1/stats/?range=${timeRange}`);
                if (res.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Dashboard stats error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [timeRange]);

    const handleDownloadReport = () => {
        if (!stats) return;

        const rows = [
            ["Metrik", "Deger"],
            ["Toplam Haber", stats.total_all],
            ["Filtreli Toplam", stats.filtered_total],
            ["Teyitli (Yesil)", stats.verified],
            ["Supheli (Sari)", stats.uncertain],
            ["Teyitsiz/Bekleyen (Kirmizi)", stats.unverified + stats.pending]
        ];

        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `apertus_rapor_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Prepare chart data
    const pieData = stats ? [
        { name: 'Doğrulandı', value: stats.verified || 0, color: COLORS.verified },
        { name: 'Belirsiz', value: stats.uncertain || 0, color: COLORS.uncertain },
        { name: 'Doğrulanamadı', value: stats.unverified || 0, color: COLORS.unverified },
        { name: 'Bekliyor', value: stats.pending || 0, color: COLORS.pending }
    ].filter(d => d.value > 0) : [];

    const categoryData = stats?.category_stats ? stats.category_stats.map(item => ({
        name: item.name || 'Diğer',
        count: item.value || 0
    })) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-3xl font-bold text-gray-100">Genel Bakış</h2>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Time Range Filter */}
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="bg-dark-card border border-dark-border text-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="1h">Son 1 Saat</option>
                        <option value="6h">Son 6 Saat</option>
                        <option value="24h">Son 24 Saat</option>
                        <option value="7d">Son 7 Gün</option>
                    </select>

                    {/* Chart Type Filter */}
                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="bg-dark-card border border-dark-border text-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="status">Teyit Durumu</option>
                        <option value="category">Kategori Dağılımı</option>
                    </select>

                    <button
                        onClick={handleDownloadReport}
                        disabled={loading || !stats}
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        Rapor İndir
                    </button>
                </div>
            </div>

            {/* Nabız Paneli - The Pulse */}
            <PulsePanel />

            {/* Gelismeler ve Hızlı Stats */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <DevelopmentsPanel />
                </div>
                <div className="bg-dark-card border border-dark-border rounded-xl p-4 flex flex-col">
                    {/* Üst Yarı: Hızlı Bakış İstatistikleri */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">Hızlı Bakış</h3>
                        {loading ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-4 bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                            </div>
                        ) : !stats ? (
                            <p className="text-xs text-gray-500">Veri yüklenemedi</p>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Toplam Haber</span>
                                    <span className="text-sm font-bold text-white">{stats.total_all ?? 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Son {timeRange}</span>
                                    <span className="text-sm font-bold text-blue-400">{stats.filtered_total ?? 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Doğrulanmış</span>
                                    <span className="text-sm font-bold text-green-400">{stats.verified ?? 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Şüpheli</span>
                                    <span className="text-sm font-bold text-yellow-400">{stats.uncertain ?? 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Bekleyen</span>
                                    <span className="text-sm font-bold text-red-400">{(stats.pending ?? 0) + (stats.unverified ?? 0)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Alt Yarı: İstihbarat Takvimi */}
                    <div className="mt-4 pt-4 border-t border-dark-border">
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">İstihbarat Takvimi</h3>
                        <CalendarWidget compact />
                        {/* TODO v0.3.2: Haberlerden otomatik takvim etkinliği ekleme */}
                    </div>
                </div>
            </div>

            {/* Katmanlı İstihbarat - Layered Intelligence */}
            <IntelligenceTabs />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full text-center text-gray-500 py-8">İstatistikler yükleniyor...</div>
                ) : !stats ? (
                    <div className="col-span-full text-center text-gray-500 py-8">Veri yok</div>
                ) : (
                    <>
                        {/* Toplam Haber Card */}
                        <div className="bg-dark-card border border-dark-border p-6 rounded-xl group relative">
                            <h3 className="text-gray-500 text-sm font-medium mb-2 flex items-center gap-1">
                                Toplam Haber
                                <span className="cursor-help text-gray-600" title="Veritabanındaki tüm haberlerin toplam sayısı. Tüm zamanları kapsar.">ℹ️</span>
                            </h3>
                            <div className="flex items-end justify-between">
                                <span className="text-2xl font-bold text-gray-100">{stats.total_all}</span>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 block">Tüm Zamanlar</span>
                                </div>
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-gray-700">
                                Veritabanındaki toplam haber sayısı (tüm zamanlar)
                            </div>
                        </div>

                        {/* Teyit Edilen Card */}
                        <div className="bg-dark-card border border-dark-border p-6 rounded-xl group relative">
                            <h3 className="text-gray-500 text-sm font-medium mb-2 flex items-center gap-1">
                                Teyit Edilen
                                <span className="cursor-help text-gray-600" title="AI ve çapraz kaynak doğrulaması ile teyit edilmiş haberler. Güvenilir kaynaklardan otomatik onaylananları da içerir.">ℹ️</span>
                            </h3>
                            <div className="flex items-end justify-between">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-green-400">{stats.verified}</span>
                                    {stats.verified_delta !== undefined && (
                                        <span className={`text-xs font-medium ${stats.verified_delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {stats.verified_delta >= 0 ? '↑' : '↓'}{Math.abs(stats.verified_delta || 0)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">{timeRange}</span>
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700" style={{ maxWidth: '280px', whiteSpace: 'normal' }}>
                                AI ve çapraz kaynak doğrulaması ile teyit edilmiş haberler. Güvenilir kaynaklardan otomatik onaylananları da içerir.
                            </div>
                        </div>

                        {/* Şüpheli Card */}
                        <div className="bg-dark-card border border-dark-border p-6 rounded-xl group relative">
                            <h3 className="text-gray-500 text-sm font-medium mb-2 flex items-center gap-1">
                                Şüpheli
                                <span className="cursor-help text-gray-600" title="Kaynağı veya içeriği tam doğrulanamayan, manuel inceleme gerektiren haberler. Yüksek sayı bilgi kirliliği riskine işaret eder.">ℹ️</span>
                            </h3>
                            <div className="flex items-end justify-between">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-yellow-400">{stats.uncertain}</span>
                                    {stats.uncertain_delta !== undefined && (
                                        <span className={`text-xs font-medium ${stats.uncertain_delta <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {stats.uncertain_delta >= 0 ? '↑' : '↓'}{Math.abs(stats.uncertain_delta || 0)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">{timeRange}</span>
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700" style={{ maxWidth: '280px', whiteSpace: 'normal' }}>
                                Kaynağı doğrulanamayan, manuel inceleme gerektiren haberler. Yüksek sayı bilgi kirliliği riskine işaret eder.
                            </div>
                        </div>

                        {/* Bekleyen Card */}
                        <div className="bg-dark-card border border-dark-border p-6 rounded-xl group relative">
                            <h3 className="text-gray-500 text-sm font-medium mb-2 flex items-center gap-1">
                                Bekleyen
                                <span className="cursor-help text-gray-600" title="Henüz teyit sürecine alınmamış yeni haberler. Sistem bunları otomatik olarak sırayla işleyecektir.">ℹ️</span>
                            </h3>
                            <div className="flex items-end justify-between">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-red-400">{(stats.pending || 0) + (stats.unverified || 0)}</span>
                                    {stats.pending_delta !== undefined && (
                                        <span className={`text-xs font-medium ${stats.pending_delta <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {stats.pending_delta >= 0 ? '↑' : '↓'}{Math.abs(stats.pending_delta || 0)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">{timeRange}</span>
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700" style={{ maxWidth: '280px', whiteSpace: 'normal' }}>
                                Henüz teyit sürecine alınmamış yeni haberler. Sistem bunları otomatik sırayla işler.
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Charts */}
            {!loading && stats && (
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-200 mb-4">
                        {chartType === 'status' ? 'Teyit Durumu Dağılımı' : 'Kategori Dağılımı'}
                    </h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'status' ? (
                                pieData.length > 0 ? (
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500">Veri yok</div>
                                )
                            ) : (
                                categoryData.length > 0 ? (
                                    <BarChart data={categoryData}>
                                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500">Kategori verisi yok</div>
                                )
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

