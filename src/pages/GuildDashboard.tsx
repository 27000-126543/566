import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Scroll,
  Package,
  Megaphone,
  Crown,
  Coins,
  Star,
  Sword,
  History,
  UserCheck,
  Wallet,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Badge } from '@/components/ui/Badge.js';
import { useAppStore } from '@/store/index.js';
import { ROLE_NAMES, PROFESSION_NAMES } from '../../shared/types.js';
import type { Profession } from '../../shared/types.js';

const professionIcons: Record<Profession, React.ReactNode> = {
  warrior: <Sword className="w-5 h-5" />,
  mage: <Sword className="w-5 h-5" />,
  archer: <Sword className="w-5 h-5" />,
  priest: <Sword className="w-5 h-5" />,
};

export default function GuildDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const currentGuild = useAppStore((state) => state.currentGuild);
  const members = useAppStore((state) => state.members);
  const applications = useAppStore((state) => state.applications);
  const quests = useAppStore((state) => state.quests);
  const announcements = useAppStore((state) => state.announcements);
  const fetchGuildDetail = useAppStore((state) => state.fetchGuildDetail);
  const fetchMembers = useAppStore((state) => state.fetchMembers);
  const fetchApplications = useAppStore((state) => state.fetchApplications);
  const fetchQuests = useAppStore((state) => state.fetchQuests);
  const fetchAnnouncements = useAppStore((state) => state.fetchAnnouncements);

  const isLeader = user?.guildRole === 'leader';
  const isViceLeader = currentGuild?.viceLeaderIds.includes(user?.id || '');
  const canManage = isLeader || isViceLeader;

  useEffect(() => {
    if (id) {
      fetchGuildDetail(id);
      fetchMembers(id);
      fetchApplications(id);
      fetchQuests(id);
      fetchAnnouncements(id);
    }
  }, [id, fetchGuildDetail, fetchMembers, fetchApplications, fetchQuests, fetchAnnouncements]);

  const pendingApplications = applications.filter((app) => app.status === 'pending');
  const pendingSettlementQuests = quests.filter((q) => q.status === 'pending_settlement');
  const inProgressQuests = quests.filter((q) => q.status === 'in_progress');
  const recentAnnouncements = announcements.slice(0, 3);

  const quickActions = [
    {
      key: 'members',
      label: '成员管理',
      icon: Users,
      color: 'from-blue-500 to-blue-700',
      badge: members.length,
      show: true,
    },
    {
      key: 'applications',
      label: '入会申请',
      icon: UserCheck,
      color: 'from-green-500 to-green-700',
      badge: pendingApplications.length,
      show: canManage,
    },
    {
      key: 'quests',
      label: '任务系统',
      icon: Scroll,
      color: 'from-yellow-500 to-orange-600',
      badge: inProgressQuests.length,
      show: true,
    },
    {
      key: 'settlement',
      label: '任务结算',
      icon: Wallet,
      color: 'from-emerald-500 to-emerald-700',
      badge: pendingSettlementQuests.length,
      show: canManage,
    },
    {
      key: 'warehouse',
      label: '仓库管理',
      icon: Package,
      color: 'from-purple-500 to-purple-700',
      badge: null,
      show: true,
    },
    {
      key: 'announcements',
      label: '公告管理',
      icon: Megaphone,
      color: 'from-cyan-500 to-cyan-700',
      badge: null,
      show: true,
    },
    {
      key: 'logs',
      label: '操作记录',
      icon: History,
      color: 'from-gray-500 to-gray-700',
      badge: null,
      show: true,
    },
  ].filter((item) => item.show);

  const handleNavigate = (path: string) => {
    navigate(`/guild/${id}/${path}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-game-text">公会工作台</h1>
          <p className="text-game-subtext">欢迎回来，查看你的公会概况</p>
        </div>
        {user && (
          <div className="flex items-center gap-3 p-3 glass-effect rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              {user.profession && professionIcons[user.profession]}
            </div>
            <div>
              <p className="font-medium text-game-text">{user.username}</p>
              <p className="text-xs text-game-subtext">
                {user.guildRole ? ROLE_NAMES[user.guildRole] : '成员'} · Lv.{user.level}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-game-subtext text-sm">公会等级</p>
                <p className="text-2xl font-bold text-game-text">
                  Lv.{currentGuild?.level || 1}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-game-subtext text-sm">成员数量</p>
                <p className="text-2xl font-bold text-game-text">
                  {currentGuild?.memberCount || 0}/{currentGuild?.maxMembers || 30}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-game-subtext text-sm">公会资金</p>
                <p className="text-2xl font-bold text-gold-400">
                  {currentGuild?.funds || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-game-subtext text-sm">我的贡献</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {user?.contribution || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {canManage && pendingApplications.length > 0 && (
        <Card className="glass-effect border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-game-text">待处理的入会申请</p>
                  <p className="text-sm text-game-subtext">
                    有 {pendingApplications.length} 个新的入会申请等待审批
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNavigate('members')}
                className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm font-medium"
              >
                立即处理
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {canManage && pendingSettlementQuests.length > 0 && (
        <Card className="glass-effect border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-game-text">待结算的任务</p>
                  <p className="text-sm text-game-subtext">
                    有 {pendingSettlementQuests.length} 个任务等待结算发放奖励
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNavigate('quests')}
                className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm font-medium"
              >
                去结算
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-display font-bold text-game-text mb-4">功能入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                onClick={() => handleNavigate(action.key)}
                className="group glass-effect p-5 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] hover:border-primary-500/50"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-game-text">{action.label}</span>
                  {action.badge !== null && action.badge > 0 && (
                    <Badge variant="danger" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">最新公告</CardTitle>
            <button
              onClick={() => handleNavigate('announcements')}
              className="text-primary-400 hover:text-primary-300 text-sm font-medium"
            >
              查看全部
            </button>
          </CardHeader>
          <CardContent>
            {recentAnnouncements.length === 0 ? (
              <p className="text-game-subtext text-center py-8">暂无公告</p>
            ) : (
              <div className="space-y-3">
                {recentAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3 bg-game-card rounded-lg border border-game-border hover:border-primary-500/30 transition-colors cursor-pointer"
                    onClick={() => handleNavigate('announcements')}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Megaphone className="w-4 h-4 text-primary-400" />
                      <span className="font-medium text-game-text text-sm">{ann.title}</span>
                    </div>
                    <p className="text-xs text-game-subtext line-clamp-2">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">公会成员</CardTitle>
            <button
              onClick={() => handleNavigate('members')}
              className="text-primary-400 hover:text-primary-300 text-sm font-medium"
            >
              查看全部
            </button>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-game-subtext text-center py-8">暂无成员</p>
            ) : (
              <div className="space-y-2">
                {members.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-game-card transition-colors"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                      {member.profession && (
                        <span className="text-white text-xs">
                          {PROFESSION_NAMES[member.profession]?.[0] || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-game-text text-sm truncate">
                          {member.username}
                        </span>
                        {member.guildRole === 'leader' && (
                          <Crown className="w-3 h-3 text-gold-400" />
                        )}
                        {member.guildRole === 'vice_leader' && (
                          <Star className="w-3 h-3 text-primary-400" />
                        )}
                      </div>
                      <span className="text-xs text-game-subtext">
                        Lv.{member.level} · {PROFESSION_NAMES[member.profession]}
                      </span>
                    </div>
                    <Badge variant="info" className="text-xs">
                      {member.contribution}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
