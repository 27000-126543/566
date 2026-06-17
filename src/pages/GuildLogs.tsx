import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  UserCheck,
  UserX,
  UserMinus,
  Award,
  ShieldX,
  ScrollText,
  PackagePlus,
  CheckCircle,
  XCircle,
  Megaphone,
  Users,
  Clock,
  History,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Badge } from '@/components/ui/Badge.js';
import Empty from '@/components/Empty.js';
import { useAppStore } from '@/store/index.js';
import { formatDateTime } from '@/utils/format.js';
import { GUILD_LOG_TYPE_NAMES } from '../../shared/types.js';
import type { GuildLogType } from '../../shared/types.js';

const logIconMap: Record<GuildLogType, typeof UserCheck> = {
  member_approve: UserCheck,
  member_reject: UserX,
  member_kick: UserMinus,
  member_appoint_vice: Award,
  member_remove_vice: ShieldX,
  quest_settle: ScrollText,
  item_contribute: PackagePlus,
  item_approve: CheckCircle,
  item_reject: XCircle,
  announcement_create: Megaphone,
  guild_create: Users,
};

const logColorMap: Record<GuildLogType, string> = {
  member_approve: 'text-green-400 bg-green-500/20',
  member_reject: 'text-red-400 bg-red-500/20',
  member_kick: 'text-red-400 bg-red-500/20',
  member_appoint_vice: 'text-yellow-400 bg-yellow-500/20',
  member_remove_vice: 'text-orange-400 bg-orange-500/20',
  quest_settle: 'text-blue-400 bg-blue-500/20',
  item_contribute: 'text-purple-400 bg-purple-500/20',
  item_approve: 'text-green-400 bg-green-500/20',
  item_reject: 'text-red-400 bg-red-500/20',
  announcement_create: 'text-cyan-400 bg-cyan-500/20',
  guild_create: 'text-yellow-400 bg-yellow-500/20',
};

const logBadgeVariantMap: Record<GuildLogType, 'default' | 'success' | 'danger' | 'warning' | 'info' | 'gold'> = {
  member_approve: 'success',
  member_reject: 'danger',
  member_kick: 'danger',
  member_appoint_vice: 'gold',
  member_remove_vice: 'warning',
  quest_settle: 'info',
  item_contribute: 'default',
  item_approve: 'success',
  item_reject: 'danger',
  announcement_create: 'info',
  guild_create: 'gold',
};

export default function GuildLogs() {
  const { id } = useParams<{ id: string }>();
  const user = useAppStore((state) => state.user);
  const guildLogs = useAppStore((state) => state.guildLogs);
  const fetchGuildLogs = useAppStore((state) => state.fetchGuildLogs);

  useEffect(() => {
    if (id && user) {
      fetchGuildLogs(id, user.id, user.guildRole || 'member');
    }
  }, [id, user, fetchGuildLogs]);

  const sortedLogs = [...guildLogs].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-game-text">操作记录</h1>
          <p className="text-game-subtext">查看公会操作日志</p>
        </div>
        <div className="flex items-center gap-2 text-game-subtext">
          <History className="w-5 h-5" />
          <span>共 {guildLogs.length} 条记录</span>
        </div>
      </div>

      {sortedLogs.length === 0 ? (
        <Empty />
      ) : (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>日志列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedLogs.map((log, index) => {
                const Icon = logIconMap[log.type];
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 bg-game-card rounded-lg border border-game-border animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${logColorMap[log.type]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant={logBadgeVariantMap[log.type]}>
                          {GUILD_LOG_TYPE_NAMES[log.type]}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-game-subtext">
                          <Clock className="w-4 h-4" />
                          <span>{formatDateTime(log.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-game-text leading-relaxed">{log.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
