import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert, Clock, User } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(3);
    const [locked, setLocked] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const navigate = useNavigate();
    const timerRef = useRef(null);

    useEffect(() => {
        if (locked && remainingSeconds > 0) {
            timerRef.current = setInterval(() => {
                setRemainingSeconds((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setLocked(false);
                        setAttemptsLeft(3);
                        setError('');
                        setPassword('');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [locked, remainingSeconds]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (locked) return;
        setLoading(true);
        setError('');

        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            if (res.ok) {
                navigate('/');
                return;
            }

            const data = await res.json().catch(() => ({}));
            const detail = data.detail;

            if (typeof detail === 'object') {
                if (detail.locked) {
                    setLocked(true);
                    setRemainingSeconds(detail.remaining_seconds || 900);
                    setError(detail.message || 'Hesap kilitlendi.');
                } else {
                    setAttemptsLeft(detail.attempts_left ?? 3);
                    setError(detail.message || 'Giris basarisiz.');
                }
            } else {
                setError(detail || 'Giris basarisiz.');
            }
        } catch {
            setError('Sunucu hatasi');
        } finally {
            setLoading(false);
        }
    };

    if (locked) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-dark-card border border-red-500/30 rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-6">
                        <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <ShieldAlert className="w-10 h-10 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-red-400">Hesap Kilitlendi</h1>
                        <p className="text-gray-500 text-sm mt-2">
                            Cok fazla hatali deneme yapildi
                        </p>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 text-center">
                        <Clock className="w-8 h-8 text-red-400 mx-auto mb-3" />
                        <div className="text-4xl font-mono font-bold text-red-400 mb-2">
                            {formatTime(remainingSeconds)}
                        </div>
                        <p className="text-gray-500 text-sm">
                            sonra tekrar deneyebilirsiniz
                        </p>
                    </div>

                    <div className="mt-4 w-full bg-dark-bg rounded-full h-1.5 overflow-hidden">
                        <div
                            className="h-full bg-red-500/60 rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${(remainingSeconds / 900) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-100">ApertusAI</h1>
                    <p className="text-gray-500 text-sm mt-2">Yonetici Paneli Giris</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Kullanici Adi
                        </label>
                        <div className="relative">
                            <User className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
                                placeholder="kullanici_adi"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Sifre
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
                            placeholder="••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {attemptsLeft < 3 && attemptsLeft > 0 && (
                        <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-400/70 text-xs text-center">
                            {attemptsLeft} deneme hakkiniz kaldi
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-dark-bg font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Giris yapiliyor...' : 'Giris Yap'}
                    </button>
                </form>
            </div>
        </div>
    );
}
