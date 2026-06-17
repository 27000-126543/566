import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Users, Scroll, Package, Megaphone, Crown, ArrowLeft, LogOut, Shield, Coins, History, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { useAppStore } from '@/store/index.js';
import GuildDashboard from './GuildDashboard.js';
import Members from './Members.js';
import Quests from './Quests.js';
import Warehouse from './Warehouse.js';
import Announcements from './Announcements.js';
import GuildLogs from './GuildLogs.js';
import { ROLE_NAMES } from '../../shared/types.js';

export default function GuildHome() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const currentGuild = useAppStore((state) => state.currentGuild);
  const fetchGuildDetail = useAppStore((state) => state.fetchGuildDetail);
  const logout = useAppStore((state) => state.logout);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGuildDetail(id);
    }
  }, [id, fetchGuildDetail]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLeader = user?.guildRole === 'leader';
  const isViceLeader = currentGuild?.viceLeaderIds.includes(user?.id || '');
  const canManage = isLeader || isViceLeader;

  const allNavItems = [
    { path: 'dashboard', label: '工作台', icon: LayoutDashboard, show: true },
    { path: 'members', label: '成员管理', icon: Users, show: true },
    { path: 'quests', label: '任务系统', icon: Scroll, show: true },
    { path: 'warehouse', label: '仓库管理', icon: Package, show: true },
    { path: 'announcements', label: '公告管理', icon: Megaphone, show: true },
    { path: 'logs', label: '操作记录', icon: History, show: true },
  ];

  const navItems = allNavItems.filter((item) => item.show);

  return (
    <div className="min-h-screen bg-game-bg flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 glass-effect border-r border-game-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-game-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-gold-500 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-game-text">{currentGuild?.name || '加载中...'}</h2>
                {currentGuild && (
                  <Badge variant="gold">Lv.{currentGuild.level}</Badge>
                )}
              </div>
            </div>
            {currentGuild && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-game-subtext">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    成员
                  </span>
                  <span className="text-game-text">{currentGuild.memberCount}/{currentGuild.maxMembers}</span>
                </div>
                <div className="flex items-center justify-between text-game-subtext">
                  <span className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-gold-400" />
                    资金
                  </span>
                  <span className="text-gold-400">{currentGuild.funds}</span>
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                      : 'text-game-subtext hover:bg-game-card hover:text-game-text'
                  }`
                }
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-game-border space-y-2">
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-game-card">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-game-text font-medium truncate">{user.username}</p>
                  <p className="text-xs text-game-subtext">
                    {user.guildRole ? ROLE_NAMES[user.guildRole] : '成员'} · Lv.{user.level}
                  </p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-game-subtext hover:text-game-text"
              onClick={() => navigate('/hall')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回大厅
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="glass-effect border-b border-game-border lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(true)}>
              <span className="sr-only">打开菜单</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            <h1 className="text-lg font-display font-bold text-game-text">{currentGuild?.name}</h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<GuildDashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="quests" element={<Quests />} />
            <Route path="warehouse" element={<Warehouse />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="logs" element={<GuildLogs />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
