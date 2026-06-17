import { getDb, saveDb } from '../db/index.js';
import type { GuildLog, GuildLogType, GuildRole } from '../../shared/types.js';
import { generateId } from './authService.js';

export async function createGuildLog(
  guildId: string,
  type: GuildLogType,
  operatorId: string,
  targetUserId: string | null,
  description: string,
  details: Record<string, unknown>
): Promise<GuildLog> {
  const db = await getDb();

  const newLog: GuildLog = {
    id: generateId(),
    guildId,
    type,
    operatorId,
    targetUserId,
    description,
    details,
    createdAt: Date.now(),
  };

  db.data!.guildLogs.push(newLog);
  await saveDb();

  return newLog;
}

export async function getGuildLogs(
  guildId: string,
  userId: string,
  userRole: GuildRole
): Promise<GuildLog[]> {
  const db = await getDb();

  let logs = db.data!.guildLogs.filter((log) => log.guildId === guildId);

  if (userRole !== 'leader' && userRole !== 'vice_leader') {
    logs = logs.filter(
      (log) => log.operatorId === userId || log.targetUserId === userId
    );
  }

  return logs.sort((a, b) => b.createdAt - a.createdAt);
}
