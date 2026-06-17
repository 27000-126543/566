import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, UserCheck, UserX, Crown, Star, Sword, Wand2, Target, Heart, UserMinus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Badge } from '@/components/ui/Badge.js';
import Empty from '@/components/Empty.js';
import { useAppStore } from '@/store/index.js';
import { formatDate } from '@/utils/format.js';
import { PROFESSION_NAMES, ROLE_NAMES } from '../../shared/types.js';
import type { GuildRole, Profession } from '../../shared/types.js';

const professionIcons: Record<Profession, React.ReactNode> = {
  warrior: <Sword className="w-4 h-4" />,
  mage: <Wand2 className="w-4 h-4" />,
  archer: <Target className="w-4 h-4" />,
  priest: <Heart className="w-4 h-4" />,
};

const roleIcons: Record<GuildRole, React.ReactNode> = {
  leader: <Crown className="w-4 h-4 text-gold-400" />,
  vice_leader: <Star className="w-4 h-4 text-primary-400" />,
  member: <Users className="w-4 h-4 text-game-subtext" />,
};

export default function Members() {
  const { id } = useParams<{ id: string }>();
  const user = useAppStore((state) => state.user);
  const members = useAppStore((state) => state.members);
  const applications = useAppStore((state) => state.applications);
  const currentGuild = useAppStore((state) => state.currentGuild);
  const fetchMembers = useAppStore((state) => state.fetchMembers);
  const fetchApplications = useAppStore((state) => state.fetchApplications);
  const approveApplication = useAppStore((state) => state.approveApplication);
  const rejectApplication = useAppStore((state) => state.rejectApplication);
  const kickMember = useAppStore((state) => state.kickMember);
  const appointViceLeader = useAppStore((state) => state.appointViceLeader);
  const removeViceLeader = useAppStore((state) => state.removeViceLeader);
  const [activeTab, setActiveTab] = useState<'members' | 'applications'>('members');

  const isLeader = user?.id === currentGuild?.leaderId;
  const isViceLeader = currentGuild?.viceLeaderIds.includes(user?.id || '');
  const canManage = isLeader || isViceLeader;

  useEffect(() => {
    if (id) {
      fetchMembers(id);
      fetchApplications(id);
    }
  }, [id, fetchMembers, fetchApplications]);

  const handleApprove = async (appId: string) => {
    if (!id || !user) return;
    const success = await approveApplication(id, appId, user.id);
    if (success) {
      fetchMembers(id);
      fetchApplications(id);
    }
  };

  const handleReject = async (appId: string) => {
    if (!id || !user) return;
    const success = await rejectApplication(id, appId, user.id);
    if (success) {
      fetchApplications(id);
    }
  };

  const handleKick = async (userId: string) => {
    if (!id || !user) return;
    const success = await kickMember(id, userId, user.id);
    if (success) {
      fetchMembers(id);
    }
  };

  const handleAppointVice = async (userId: string) => {
    if (!id || !user) return;
    const success = await appointViceLeader(id, userId, user.id);
    if (success) {
      fetchMembers(id);
    }
  };

  const handleRemoveVice = async (userId: string) => {
    if (!id || !user) return;
    const success = await removeViceLeader(id, userId, user.id);
    if (success) {
      fetchMembers(id);
    }
  };

  const pendingApplications = applications.filter((app) => app.status === 'pending');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-game-text">成员管理</h1>
          <p className="text-game-subtext">管理公会成员和入会申请</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'members' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('members')}
          >
            <Users className="w-4 h-4 mr-2" />
            成员列表
            <Badge className="ml-2" variant="info">{members.length}</Badge>
          </Button>
          <Button
            variant={activeTab === 'applications' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('applications')}
          >
            <Plus className="w-4 h-4 mr-2" />
            入会申请
            {pendingApplications.length > 0 && (
              <Badge className="ml-2" variant="danger">{pendingApplications.length}</Badge>
            )}
          </Button>
        </div>
      </div>

      {activeTab === 'members' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.length === 0 ? (
            <div className="col-span-full">
              <Empty />
            </div>
          ) : (
            members.map((member, index) => (
              <Card key={member.id} className="glass-effect animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                      {professionIcons[member.profession]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-game-text truncate">{member.username}</h3>
                        {member.guildRole && roleIcons[member.guildRole]}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge variant="info">Lv.{member.level}</Badge>
                        <Badge variant="default">{PROFESSION_NAMES[member.profession]}</Badge>
                        {member.guildRole && (
                          <Badge variant={member.guildRole === 'leader' ? 'gold' : member.guildRole === 'vice_leader' ? 'default' : 'silver'}>
                            {ROLE_NAMES[member.guildRole]}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-game-subtext">
                        贡献: <span className="text-gold-400 font-medium">{member.contribution}</span>
                        <span className="mx-2">·</span>
                        加入: {formatDate(member.createdAt)}
                      </div>
                    </div>
                  </div>

                  {canManage && member.id !== user?.id && member.guildRole !== 'leader' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-game-border">
                      {member.guildRole === 'vice_leader' ? (
                        isLeader && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleRemoveVice(member.id)}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            罢免副会长
                          </Button>
                        )
                      ) : isLeader && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAppointVice(member.id)}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          任命副会长
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleKick(member.id)}
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        踢出
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>入会申请</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApplications.length === 0 ? (
              <Empty />
            ) : (
              <div className="space-y-4">
                {pendingApplications.map((app) => {
                  const applicant = members.find((m) => m.id === app.userId);
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 bg-game-card rounded-lg border border-game-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-game-text">
                            {applicant?.username || '未知用户'}
                          </p>
                          <p className="text-sm text-game-subtext">
                            申请时间: {formatDate(app.createdAt)}
                          </p>
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(app.id)}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            通过
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(app.id)}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            拒绝
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
