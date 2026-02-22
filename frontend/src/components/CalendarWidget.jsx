import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Loader2, Sparkles, RefreshCw } from 'lucide-react';

const TYPE_COLORS = {
    resmi: 'bg-red-500/20 text-red-400 border-red-500/30',
    ozel_gun: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    uluslararasi: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    lansman: 'bg-green-500/20 text-green-400 border-green-500/30',
    protesto: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    ziyaret: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    dava: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    konferans: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function CalendarWidget({ compact = false }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState({});
    const [hoveredDate, setHoveredDate] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState({});
    const [loadingAnalysis, setLoadingAnalysis] = useState(null);
    const [scanning, setScanning] = useState(false);
    const hoverTimeout = useRef(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch(`/api/v1/events?month=${month + 1}&year=${year}`);
            if (res.ok) {
                const data = await res.json();
                // Convert array to date-keyed object
                const eventsMap = {};
                (data.events || []).forEach(event => {
                    eventsMap[event.date] = event;
                });
                setEvents(eventsMap);
            }
        } catch (err) {
            console.error('Events fetch error:', err);
        }
    }, [month, year]);

    // Fetch events when month changes
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleScanNews = async () => {
        setScanning(true);
        try {
            const res = await fetch('/api/v1/events/scan-all?hours=48', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                alert(`${data.events_found} yeni etkinlik bulundu!`);
                fetchEvents();
            }
        } catch (err) {
            console.error('Scan error:', err);
        } finally {
            setScanning(false);
        }
    };

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay() || 7;

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const formatDate = (day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const getEventForDate = (day) => {
        const dateStr = formatDate(day);
        return events[dateStr];
    };

    const handleMouseEnter = (day) => {
        const event = getEventForDate(day);
        if (!event) return;

        const dateStr = formatDate(day);
        setHoveredDate(dateStr);

        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

        hoverTimeout.current = setTimeout(() => {
            if (!aiAnalysis[dateStr]) {
                fetchAIAnalysis(dateStr, event);
            }
        }, 500);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        setHoveredDate(null);
    };

    const fetchAIAnalysis = async (dateStr, event) => {
        setLoadingAnalysis(dateStr);
        try {
            // Static analyses for common events
            const staticAnalyses = {
                'Sevgililer Günü': 'Perakende ve e-ticaret sektöründe %40-60 satış artışı beklenir. Restoran ve konaklama sektörü yoğunluk yaşar.',
                'Dünya Kadınlar Günü': 'Kadın hakları ve eşitlik temalı kurumsal paylaşımlar artar. CSR kampanyaları için ideal zamanlama.',
                'Çanakkale Zaferi': 'Milli duygular yoğunlaşır, vatanseverlik temalı içerikler etkileşim alır.',
                'Cumhuriyet Bayramı': 'Resmi tatil nedeniyle tüketim artışı. Milli değerler ön planda.',
            };

            let analysis = staticAnalyses[event.title];

            if (!analysis && event.description) {
                analysis = event.description;
            }

            if (!analysis) {
                analysis = `${event.title} - ${event.type} türünde bir etkinlik. Sektörel kampanyalar için değerlendirilmeli.`;
            }

            setAiAnalysis(prev => ({ ...prev, [dateStr]: analysis }));
        } catch (error) {
            console.error('AI analysis error:', error);
        } finally {
            setLoadingAnalysis(null);
        }
    };

    // Generate calendar days
    const days = [];
    for (let i = 1; i < startingDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const event = getEventForDate(day);
        const dateStr = formatDate(day);
        const isToday = new Date().toISOString().slice(0, 10) === dateStr;

        days.push(
            <div
                key={day}
                className={`relative h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all
                    ${isToday ? 'bg-primary text-dark-bg font-bold' : 'hover:bg-dark-bg'}
                    ${event ? (TYPE_COLORS[event.type] || TYPE_COLORS.other) + ' border' : ''}
                `}
                onMouseEnter={() => handleMouseEnter(day)}
                onMouseLeave={handleMouseLeave}
            >
                {day}
                {event && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-current animate-pulse" />}

                {hoveredDate === dateStr && event && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-bold text-white text-sm">{event.title}</span>
                        </div>

                        {event.source && event.source !== 'static' && (
                            <div className="text-[10px] text-gray-500 mb-2">📰 {event.source}</div>
                        )}

                        {loadingAnalysis === dateStr ? (
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                AI analiz yapıyor...
                            </div>
                        ) : aiAnalysis[dateStr] ? (
                            <div className="text-xs text-gray-300 border-t border-gray-700 pt-2 mt-2">
                                <div className="flex items-center gap-1 text-purple-400 mb-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span className="font-semibold">Analiz</span>
                                </div>
                                <p className="leading-relaxed">{aiAnalysis[dateStr]}</p>
                            </div>
                        ) : null}

                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                            <div className="border-8 border-transparent border-t-gray-900" />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={compact ? '' : 'bg-dark-card border border-dark-border rounded-xl p-4'}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Önemli Günler
                </h3>
                <div className="flex items-center gap-1">
                    {!compact && (
                        <button
                            onClick={handleScanNews}
                            disabled={scanning}
                            className="p-1 hover:bg-dark-bg rounded text-gray-400 hover:text-primary"
                            title="Haberlerden etkinlik tara"
                        >
                            <RefreshCw className={`w-3 h-3 ${scanning ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                    <button onClick={prevMonth} className="p-1 hover:bg-dark-bg rounded">
                        <ChevronLeft className="w-4 h-4 text-gray-400" />
                    </button>
                    <span className="text-xs text-gray-300 min-w-[100px] text-center">
                        {monthNames[month]} {year}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-dark-bg rounded">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-[10px] text-gray-500 font-medium">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs">{days}</div>
        </div>
    );
}

