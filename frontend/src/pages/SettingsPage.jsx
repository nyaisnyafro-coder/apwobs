import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, RefreshCw, Save, Sparkles, Trash2 } from 'lucide-react';

const DEFAULT_OPTIONS = {
    languages: [],
    tones: [],
    topics: [],
};

const INITIAL_FORM = {
    display_name: '',
    email: '',
    brand_name: '',
    brand_description: '',
    brand_focus: '',
    related_topics: [],
    brand_language: 'tr',
    brand_tone: 'sage',
    sample_posts: [],
    share_preferences: {},
    analysis_profile: null,
};
const SAMPLE_TEXT_MAX = 7000;

function createSampleCard() {
    return {
        id: `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
        title: '',
        text: '',
    };
}

export default function SettingsPage() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [options, setOptions] = useState(DEFAULT_OPTIONS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [message, setMessage] = useState('');
    const [loadedSnapshot, setLoadedSnapshot] = useState('');
    const saveSequenceRef = useRef(0);

    const serializedForm = useMemo(() => JSON.stringify(form), [form]);
    const isDirty = loadedSnapshot && serializedForm !== loadedSnapshot;

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (!isDirty) return;
        const timer = setTimeout(() => {
            saveSettings(true);
        }, 1200);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serializedForm]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (!isDirty) return;
            event.preventDefault();
            event.returnValue = 'Kaydedilmemiş değişiklikleriniz var.';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const [profileRes, optionsRes] = await Promise.all([
                fetch('/api/v1/settings/profile'),
                fetch('/api/v1/settings/profile/options'),
            ]);

            if (optionsRes.ok) {
                const optData = await optionsRes.json();
                setOptions(optData.data || DEFAULT_OPTIONS);
            }

            if (profileRes.ok) {
                const data = await profileRes.json();
                const payload = data.data || {};
                const samplePosts = Array.isArray(payload.sample_posts)
                    ? payload.sample_posts
                        .map((item) => {
                            if (typeof item === 'string') {
                                return { ...createSampleCard(), title: 'Ornek', text: item };
                            }
                            return {
                                id: item.id || createSampleCard().id,
                                title: item.title || '',
                                text: item.text || '',
                            };
                        })
                        .filter((item) => (item.text || '').trim())
                    : [];

                const nextForm = {
                    display_name: payload.display_name || '',
                    email: payload.email || '',
                    brand_name: payload.brand_name || '',
                    brand_description: payload.brand_description || '',
                    brand_focus: payload.brand_focus || '',
                    related_topics: Array.isArray(payload.related_topics) ? payload.related_topics : [],
                    brand_language: payload.brand_language || 'tr',
                    brand_tone: payload.brand_tone || 'sage',
                    sample_posts: samplePosts,
                    share_preferences: payload.share_preferences || {},
                    analysis_profile: payload.analysis_profile || null,
                };
                setForm(nextForm);
                setLoadedSnapshot(JSON.stringify(nextForm));
            } else {
                setMessage('Ayarlar yüklenemedi.');
            }
        } catch (err) {
            console.error('Settings fetch error:', err);
            setMessage('Ayarlar yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (silent = false) => {
        if (!isDirty && !silent) {
            setMessage('Değişiklik bulunmuyor.');
            return;
        }

        const currentForm = { ...form };
        const requestSeq = ++saveSequenceRef.current;
        setSaving(true);
        const payload = {
            ...currentForm,
            sample_posts: (currentForm.sample_posts || [])
                .map((item) => ({
                    id: item.id,
                    title: (item.title || '').trim(),
                    text: (item.text || '').trim(),
                }))
                .filter((item) => item.text),
        };

        try {
            const res = await fetch('/api/v1/settings/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                const saved = data.data || payload;
                if (requestSeq !== saveSequenceRef.current) {
                    return;
                }
                const nextForm = {
                    ...currentForm,
                    display_name: saved.display_name || '',
                    email: saved.email || '',
                    brand_name: saved.brand_name || '',
                    brand_description: saved.brand_description || '',
                    brand_focus: saved.brand_focus || '',
                    related_topics: Array.isArray(saved.related_topics) ? saved.related_topics : currentForm.related_topics,
                    brand_language: saved.brand_language || 'tr',
                    brand_tone: saved.brand_tone || 'sage',
                    sample_posts: Array.isArray(saved.sample_posts) ? saved.sample_posts : payload.sample_posts,
                    analysis_profile: saved.analysis_profile || currentForm.analysis_profile,
                    share_preferences: saved.share_preferences || currentForm.share_preferences,
                };
                if (!silent) {
                    setForm(nextForm);
                }
                setLoadedSnapshot(JSON.stringify(nextForm));
                if (!silent) setMessage('Ayarlar kaydedildi.');
            } else if (!silent) {
                const errData = await res.json().catch(() => ({}));
                setMessage(`Kaydetme hatası: ${errData.detail || 'Bilinmeyen hata'}`);
            }
        } catch (err) {
            console.error('Settings save error:', err);
            if (!silent) setMessage('Kaydetme hatası.');
        } finally {
            if (requestSeq === saveSequenceRef.current) {
                setSaving(false);
            }
            if (!silent && requestSeq === saveSequenceRef.current) {
                setTimeout(() => setMessage(''), 2500);
            }
        }
    };

    const analyzeBrand = async () => {
        const samplePosts = (form.sample_posts || [])
            .map((item) => ({
                id: item.id,
                title: (item.title || '').trim(),
                text: (item.text || '').trim(),
            }))
            .filter((item) => item.text);

        if (samplePosts.length === 0) {
            setMessage('Marka analizi için en az bir örnek kart ekleyin.');
            return;
        }

        setAnalyzing(true);
        setMessage('');
        try {
            const res = await fetch('/api/v1/settings/brand/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brand_name: form.brand_name,
                    brand_description: form.brand_description,
                    brand_focus: form.brand_focus,
                    related_topics: form.related_topics || [],
                    brand_language: form.brand_language,
                    brand_tone: form.brand_tone,
                    sample_posts: samplePosts,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const profile = data.analysis_profile || null;
                setForm((prev) => ({ ...prev, analysis_profile: profile }));
                setMessage('Marka kimliği analizi güncellendi.');
            } else {
                const errData = await res.json().catch(() => ({}));
                setMessage(`Analiz hatası: ${errData.detail || 'Bilinmeyen hata'}`);
            }
        } catch (err) {
            console.error('Brand analyze error:', err);
            setMessage('Marka analizi yapılamadı.');
        } finally {
            setAnalyzing(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const addSampleCard = () => {
        setForm((prev) => ({ ...prev, sample_posts: [...(prev.sample_posts || []), createSampleCard()] }));
    };

    const removeSampleCard = (id) => {
        setForm((prev) => ({ ...prev, sample_posts: (prev.sample_posts || []).filter((item) => item.id !== id) }));
    };

    const updateSampleCard = (id, field, value) => {
        setForm((prev) => ({
            ...prev,
            sample_posts: (prev.sample_posts || []).map((item) => (item.id === id ? { ...item, [field]: value } : item)),
        }));
    };

    const toggleTopic = (topic) => {
        setForm((prev) => {
            const current = prev.related_topics || [];
            const selected = current.includes(topic);
            return {
                ...prev,
                related_topics: selected ? current.filter((item) => item !== topic) : [...current, topic],
            };
        });
    };

    const selectedTone = useMemo(
        () => (options.tones || []).find((item) => item.value === form.brand_tone),
        [options.tones, form.brand_tone],
    );

    if (loading) {
        return (
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-10 bg-gray-800 rounded"></div>
                    <div className="h-10 bg-gray-800 rounded"></div>
                    <div className="h-24 bg-gray-800 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-100">Ayarlar</h2>
                    <p className="text-gray-500 mt-1">Profil ve marka kimliği konfigürasyonu</p>
                </div>
                <button
                    onClick={() => saveSettings(false)}
                    disabled={saving}
                    className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Kaydet
                </button>
            </div>

            {isDirty && <p className="text-xs text-amber-300">Kaydedilmemiş değişiklikler var (otomatik kayıt açık).</p>}
            {message && <p className="text-xs text-emerald-300">{message}</p>}

            <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-2">İsim</label>
                        <input
                            value={form.display_name}
                            onChange={(e) => setForm((prev) => ({ ...prev, display_name: e.target.value }))}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200"
                            placeholder="Ad Soyad"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-2">Mail Adresi (Opsiyonel)</label>
                        <input
                            value={form.email}
                            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200"
                            placeholder="ornek@mail.com"
                        />
                    </div>
                </div>

                <div className="border-t border-dark-border pt-5 space-y-4">
                    <h3 className="text-sm font-bold text-white">Marka Kimliği</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-2">Marka Adı</label>
                            <input
                                value={form.brand_name}
                                onChange={(e) => setForm((prev) => ({ ...prev, brand_name: e.target.value }))}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200"
                                placeholder="Marka adı"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-2">Marka Dili</label>
                            <select
                                value={form.brand_language}
                                onChange={(e) => setForm((prev) => ({ ...prev, brand_language: e.target.value }))}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200"
                            >
                                {(options.languages || []).map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-2">Marka Tonu (16 Arketip)</label>
                            <select
                                value={form.brand_tone}
                                onChange={(e) => setForm((prev) => ({ ...prev, brand_tone: e.target.value }))}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200"
                            >
                                {(options.tones || []).map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label} - {item.archetype}
                                    </option>
                                ))}
                            </select>
                            {selectedTone && (
                                <p className="text-[11px] text-gray-500 mt-1">{selectedTone.description}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-2">Marka Açıklaması</label>
                        <textarea
                            value={form.brand_description}
                            onChange={(e) => setForm((prev) => ({ ...prev, brand_description: e.target.value }))}
                            className="w-full min-h-[90px] bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200"
                            placeholder="Markanın genel kapsamını yazın (ör: Genel gündem, ekonomi, teknoloji ve iş dünyası haber platformu)"
                            maxLength={1200}
                        />
                        <div className="text-[11px] text-gray-500 mt-1 text-right">
                            {(form.brand_description || '').length}/1200
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-2">Odak</label>
                        <textarea
                            value={form.brand_focus}
                            onChange={(e) => setForm((prev) => ({ ...prev, brand_focus: e.target.value }))}
                            className="w-full min-h-[80px] bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200"
                            placeholder="İçerik odağınızı yazın (ör: gündem, ekonomi ve sektör etkileri)"
                            maxLength={1200}
                        />
                        <div className="text-[11px] text-gray-500 mt-1 text-right">
                            {(form.brand_focus || '').length}/1200
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs text-gray-400">İlgili Konular</label>
                            <span className="text-[11px] text-gray-500">{(form.related_topics || []).length} seçili</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {(options.topics || []).map((topic) => {
                                const selected = (form.related_topics || []).includes(topic);
                                return (
                                    <button
                                        key={topic}
                                        type="button"
                                        onClick={() => toggleTopic(topic)}
                                        className={`px-2 py-1.5 rounded-lg text-xs border ${
                                            selected
                                                ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200'
                                                : 'bg-dark-bg border-dark-border text-gray-300'
                                        }`}
                                    >
                                        {topic}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-xs text-gray-300">Marka Paylaşım Kartları</label>
                                <p className="text-[11px] text-gray-500 mt-1">Örnekleri kart olarak ekleyin, isimlendirin ve yönetin.</p>
                            </div>
                            <button
                                onClick={addSampleCard}
                                type="button"
                                className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Ekle
                            </button>
                        </div>

                        {(form.sample_posts || []).length === 0 ? (
                            <div className="border border-dashed border-dark-border rounded-lg p-4 text-xs text-gray-500">
                                Henüz örnek kart yok. + Ekle ile ilk kartı oluşturabilirsiniz.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(form.sample_posts || []).map((item) => (
                                    <div key={item.id} className="bg-dark-bg border border-dark-border rounded-lg p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={item.title || ''}
                                                onChange={(e) => updateSampleCard(item.id, 'title', e.target.value)}
                                                className="flex-1 bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-xs text-gray-200"
                                                placeholder="Kart ismi (ör. Finans tonu)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSampleCard(item.id)}
                                                className="p-2 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10"
                                                title="Kartı sil"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <textarea
                                            value={item.text || ''}
                                            onChange={(e) => updateSampleCard(item.id, 'text', e.target.value)}
                                            maxLength={SAMPLE_TEXT_MAX}
                                            className="w-full min-h-[110px] bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200"
                                            placeholder="Başlık / Alt Başlık / Metin alanlarını satır satır yazabilirsiniz"
                                        />
                                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                                            <span>Başlık, alt başlık ve sayfa başlıklarını ayrı satırlarda girebilirsiniz.</span>
                                            <span>{(item.text || '').length}/{SAMPLE_TEXT_MAX}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={analyzeBrand}
                            disabled={analyzing}
                            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                        >
                            {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Gemini ile Marka Analizi
                        </button>
                    </div>
                    {form.analysis_profile && (
                        <div className="bg-dark-bg border border-dark-border rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-2">Analiz Sonucu</p>
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                                {JSON.stringify(form.analysis_profile, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
