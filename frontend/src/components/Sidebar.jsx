import { useEffect, useState } from 'react';
import { LayoutDashboard, Brain, Flame, Radio, Archive, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import StatsPanel from './StatsPanel';

// Ana Modüller (Sadeleştirilmiş)
const MAIN_MENU = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "İstihbarat", path: "/verify", icon: Brain },
    { name: "Trend Avcısı", path: "/trends", icon: Flame, badge: "DEV" },
    { name: "Rakip Radarı", path: "/competitors", icon: Radio, badge: "DEV" },
    { name: "İçerikler", path: "/contents", icon: Archive },
    { name: "Ayarlar", path: "/settings", icon: Settings },
];

export default function Sidebar() {
    const [profile, setProfile] = useState({ display_name: '', email: '', username: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, meRes] = await Promise.all([
                    fetch('/api/v1/settings/profile'),
                    fetch('/api/v1/auth/me'),
                ]);

                const baseProfile = { display_name: '', email: '', username: '' };
                if (meRes.ok) {
                    const meData = await meRes.json();
                    const sessionUser = meData.user || {};
                    baseProfile.display_name = sessionUser.display_name || '';
                    baseProfile.username = sessionUser.username || '';
                }

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    const payload = profileData.data || {};
                    baseProfile.display_name = payload.display_name || baseProfile.display_name;
                    baseProfile.email = payload.email || '';
                }

                setProfile(baseProfile);
            } catch (err) {
                console.error('Sidebar profile fetch error:', err);
            }
        };

        fetchProfile();
    }, []);

    const identityText = profile.display_name || profile.username || '';
    const initials = identityText ? identityText.charAt(0).toUpperCase() : '?';

    const handleLogout = async () => {
        try {
            await fetch('/api/v1/auth/logout');
            window.location.href = '/login';
        } catch (e) {
            console.error("Logout failed", e);
            window.location.href = '/login';
        }
    };

    return (
        <div className="hidden md:flex w-64 h-screen bg-dark-card border-r border-dark-border flex-col fixed left-0 top-0 z-50">
            {/* Header */}
            <div className="p-6 border-b border-dark-border">
                <div className="flex items-center gap-3 mb-4">
                    <img src="/logo.png" alt="Apertus Logo" className="w-8 h-8 object-contain" />
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                            Apertus Workspace
                        </h1>
                        <p className="text-[10px] text-gray-500 font-mono">v0.3.1 Intelligence</p>
                    </div>
                </div>

                {/* Admin Profile */}
                <div className="flex items-center gap-3 bg-dark-bg/50 p-2 rounded-lg border border-dark-border/50">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-primary/20">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-200 truncate">{identityText || 'Kullanici'}</p>
                        <p className="text-[10px] text-gray-500 truncate">{profile.email || profile.username || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-5">

                {/* Ana Menü */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                        Menü
                    </h3>
                    <div className="space-y-1">
                        {MAIN_MENU.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                        isActive
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-gray-400 hover:text-gray-100 hover:bg-dark-bg"
                                    )
                                }
                            >
                                <item.icon className="w-4 h-4 transition-transform group-hover:scale-105" />
                                <span>{item.name}</span>
                                {item.badge && (
                                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-dark-border bg-dark-bg/30">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px] ring-1 ring-primary/20">
                            {initials}
                        </div>
                        <p className="text-xs font-semibold text-gray-200 truncate">{identityText || 'Kullanici'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Çıkış Yap"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
                <StatsPanel />
            </div>
        </div>
    );
}

