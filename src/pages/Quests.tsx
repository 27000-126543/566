import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Clock, CheckCircle, PlayCircle, XCircle, Coins, Star, Calendar, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button.js';
import { Input } from '@/components/ui/Input.js';
import { Textarea } from '@/components/ui/Textarea.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Badge } from '@/components/ui/Badge.js';
import { Modal } from '@/components/ui/Modal.js';
import Empty from '@/components/Empty.js';
import { useAppStore } from '@/store/index.js';
import { formatDate, formatDateTime } from '@/utils/format.js';
import { QUEST_STATUS_NAMES } from '../../shared/types.js';
import type { QuestStatus } from '../../shared/types.js';

const statusIcons: Record<QuestStatus, React.ReactNode> = {
  available: <PlayCircle className="w-5 h-5 text-green-400" />,
  in_progress: <Clock className="w-5 h-5 text-yellow-400" />,
  completed: <CheckCircle className="w-5 h-5 text-blue-400" />,
  pending_settlement: <CheckCircle className="w-5 h-5 text-orange-400" />,
  settled: <Wallet className="w-5 h-5 text-emerald-400" />,
  expired: <XCircle className="w-5 h-5 text-red-400" />,
};

const statusVariants: Record<QuestStatus, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  available: 'success',
  in_progress: 'warning',
  completed: 'info',
  pending_settlement: 'warning',
  settled: 'success',
  expired: 'danger',
};

const filterTabs: { key: QuestStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'available', label: '可接取' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'pending_settlement', label: '待结算' },
  { key: 'settled', label: '已发放' },
  { key: 'expired', label: '已过期' },
];

export default function Quests() {
  const { id } = useParams<{ id: string }>();
  const user = useAppStore((state) => state.user);
  const currentGuild = useAppStore((state) => state.currentGuild);
  const quests = useAppStore((state) => state.quests);
  const fetchQuests = useAppStore((state) => state.fetchQuests);
  const fetchGuildDetail = useAppStore((state) => state.fetchGuildDetail);
  const publishQuest = useAppStore((state) => state.publishQuest);
  const acceptQuest = useAppStore((state) => state.acceptQuest);
  const completeQuest = useAppStore((state) => state.completeQuest);
  const settleQuest = useAppStore((state) => state.settleQuest);
  const settleAllQuests = useAppStore((state) => state.settleAllQuests);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSettlingAll, setIsSettlingAll] = useState(false);
  const [filter, setFilter] = useState<QuestStatus | 'all'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rewardContribution: 0,
    rewardFunds: 0,
    deadline: '',
  });

  const isLeader = user?.guildRole === 'leader';
  const isViceLeader = currentGuild?.viceLeaderIds.includes(user?.id || '');
  const canManage = isLeader || isViceLeader;

  useEffect(() => {
    if (id) {
      fetchQuests(id);
    }
  }, [id, fetchQuests]);

  const filteredQuests = quests.filter((quest) =>
    filter === 'all' ? true : quest.status === filter
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    setIsCreating(true);
    const deadline = new Date(formData.deadline).getTime();
    const success = await publishQuest(id, {
      title: formData.title,
      description: formData.description,
      rewardContribution: formData.rewardContribution,
      rewardFunds: formData.rewardFunds,
      deadline,
      publisherId: user.id,
    });
    setIsCreating(false);

    if (success) {
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        rewardContribution: 0,
        rewardFunds: 0,
        deadline: '',
      });
      fetchQuests(id);
    }
  };

  const handleAccept = async (questId: string) => {
    if (!user) return;
    const success = await acceptQuest(questId, user.id);
    if (success && id) {
      fetchQuests(id);
    }
  };

  const handleComplete = async (questId: string) => {
    if (!user) return;
    const success = await completeQuest(questId, user.id);
    if (success && id) {
      fetchQuests(id);
    }
  };

  const handleSettle = async (questId: string) => {
    if (!user || !id) return;
    const success = await settleQuest(questId, user.id);
    if (success) {
      fetchQuests(id);
      fetchGuildDetail(id);
    }
  };

  const handleSettleAll = async () => {
    if (!user || !id) return;
    setIsSettlingAll(true);
    const success = await settleAllQuests(id, user.id);
    setIsSettlingAll(false);
    if (success) {
      fetchQuests(id);
      fetchGuildDetail(id);
    }
  };

  const canAccept = (quest: typeof quests[0]) =>
    quest.status === 'available' && !quest.acceptedBy;

  const canComplete = (quest: typeof quests[0]) =>
    quest.status === 'in_progress' && quest.acceptedBy === user?.id;

  const canSettle = (quest: typeof quests[0]) =>
    quest.status === 'pending_settlement' && canManage;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-game-text">任务系统</h1>
          <p className="text-game-subtext">发布、接取和完成公会任务</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleSettleAll} isLoading={isSettlingAll}>
              <Wallet className="w-5 h-5 mr-2" />
              一键结算
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              发布任务
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {filteredQuests.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredQuests.map((quest, index) => (
            <Card key={quest.id} className="glass-effect animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {statusIcons[quest.status]}
                    <CardTitle className="text-lg">{quest.title}</CardTitle>
                  </div>
                  <Badge variant={statusVariants[quest.status]}>
                    {QUEST_STATUS_NAMES[quest.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-game-subtext">{quest.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-game-subtext">
                    <Star className="w-4 h-4 text-gold-400" />
                    <span>贡献奖励:</span>
                    <span className="text-gold-400 font-medium">{quest.reward.contribution}</span>
                  </div>
                  <div className="flex items-center gap-2 text-game-subtext">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span>资金奖励:</span>
                    <span className="text-yellow-400 font-medium">{quest.reward.funds}</span>
                  </div>
                  <div className="flex items-center gap-2 text-game-subtext col-span-2">
                    <Calendar className="w-4 h-4 text-primary-400" />
                    <span>截止时间:</span>
                    <span className="text-primary-300 font-medium">{formatDateTime(quest.deadline)}</span>
                  </div>
                </div>

                <div className="text-xs text-game-subtext border-t border-game-border pt-3">
                  发布于 {formatDate(quest.createdAt)}
                  {quest.acceptedBy && quest.acceptedAt && (
                    <span className="ml-2">· 接取于 {formatDate(quest.acceptedAt)}</span>
                  )}
                  {quest.completedAt && (
                    <span className="ml-2">· 完成于 {formatDate(quest.completedAt)}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  {canAccept(quest) && (
                    <Button className="flex-1" onClick={() => handleAccept(quest.id)}>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      接取任务
                    </Button>
                  )}
                  {canComplete(quest) && (
                    <Button className="flex-1" variant="success" onClick={() => handleComplete(quest.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      完成任务
                    </Button>
                  )}
                  {canSettle(quest) && (
                    <Button className="flex-1" onClick={() => handleSettle(quest.id)}>
                      <Wallet className="w-4 h-4 mr-2" />
                      结算
                    </Button>
                  )}
                  {quest.status === 'in_progress' && quest.acceptedBy !== user?.id && (
                    <Button className="flex-1" disabled>
                      已被其他人接取
                    </Button>
                  )}
                  {quest.status === 'completed' && (
                    <Button className="flex-1" variant="secondary" disabled>
                      已完成
                    </Button>
                  )}
                  {quest.status === 'pending_settlement' && !canManage && (
                    <Button className="flex-1" variant="secondary" disabled>
                      已完成待结算
                    </Button>
                  )}
                  {quest.status === 'settled' && (
                    <Button className="flex-1" variant="secondary" disabled>
                      奖励已发放
                    </Button>
                  )}
                  {quest.status === 'expired' && (
                    <Button className="flex-1" variant="secondary" disabled>
                      已过期
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="发布任务"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="任务标题"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="请输入任务标题"
            required
          />
          <Textarea
            label="任务描述"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="请输入任务描述"
            rows={4}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="贡献奖励"
              type="number"
              min="0"
              value={formData.rewardContribution}
              onChange={(e) => setFormData({ ...formData, rewardContribution: parseInt(e.target.value) || 0 })}
              required
            />
            <Input
              label="资金奖励"
              type="number"
              min="0"
              value={formData.rewardFunds}
              onChange={(e) => setFormData({ ...formData, rewardFunds: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <Input
            label="截止时间"
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsCreateModalOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" className="flex-1" isLoading={isCreating}>
              <Plus className="w-4 h-4 mr-2" />
              发布
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
