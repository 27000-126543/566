import { getDb, saveDb } from '../db/index.js';
import {
  validateQuestTitle,
  validateQuestDescription,
  validateQuestReward,
  validateQuestDeadline,
  validateQuestPublishInterval,
  validateCanAcceptQuest,
  validateUserExists,
  validateGuildExists,
  validateGuildRole,
  validateCanSettleQuests,
  validateUserBelongsToGuild,
  ValidationError,
} from '../validators/index.js';
import type { Quest, GuildLogType } from '../../shared/types.js';
import { generateId } from './authService.js';
import { createGuildLog } from './guildLogService.js';

export async function publishQuest(
  guildId: string,
  title: string,
  description: string,
  rewardContribution: number,
  rewardFunds: number,
  deadline: number,
  publisherId: string
): Promise<Quest> {
  const db = await getDb();

  const publisher = db.data!.users.find((u) => u.id === publisherId);
  validateUserExists(publisher);
  validateGuildRole(publisher, ['leader', 'vice_leader']);
  validateUserBelongsToGuild(publisher, guildId);

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);

  validateQuestTitle(title);
  validateQuestDescription(description);
  validateQuestReward(rewardContribution, rewardFunds);
  validateQuestDeadline(deadline);
  validateQuestPublishInterval(db, guildId);

  const newQuest: Quest = {
    id: generateId(),
    guildId,
    title,
    description,
    reward: {
      contribution: rewardContribution,
      funds: rewardFunds,
    },
    deadline,
    status: 'available',
    acceptedBy: null,
    acceptedAt: null,
    completedAt: null,
    createdAt: Date.now(),
  };

  db.data!.quests.push(newQuest);
  await saveDb();

  return newQuest;
}

export async function getQuestsByGuildId(guildId: string): Promise<Quest[]> {
  const db = await getDb();

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);

  return db.data!.quests.filter((q) => q.guildId === guildId);
}

export async function acceptQuest(questId: string, userId: string): Promise<void> {
  const db = await getDb();

  const user = db.data!.users.find((u) => u.id === userId);
  validateUserExists(user);
  validateCanAcceptQuest(user);

  const quest = db.data!.quests.find((q) => q.id === questId);
  if (!quest) {
    throw new ValidationError('任务不存在');
  }
  if (quest.guildId !== user.guildId) {
    throw new ValidationError('您无权接取其他公会的任务');
  }
  if (quest.status !== 'available') {
    throw new ValidationError('该任务不可接取');
  }

  const activeQuests = db.data!.quests.filter(
    (q) => q.acceptedBy === userId && q.status === 'in_progress'
  ).length;
  if (activeQuests >= 3) {
    throw new ValidationError('您已接取3个任务，请先完成现有任务');
  }

  quest.status = 'in_progress';
  quest.acceptedBy = userId;
  quest.acceptedAt = Date.now();

  await saveDb();
}

export async function completeQuest(questId: string, userId: string): Promise<void> {
  const db = await getDb();

  const user = db.data!.users.find((u) => u.id === userId);
  validateUserExists(user);

  const quest = db.data!.quests.find((q) => q.id === questId);
  if (!quest) {
    throw new ValidationError('任务不存在');
  }
  if (quest.guildId !== user.guildId) {
    throw new ValidationError('您无权完成其他公会的任务');
  }
  if (quest.status !== 'in_progress') {
    throw new ValidationError('该任务未在进行中');
  }
  if (quest.acceptedBy !== userId) {
    throw new ValidationError('您不是该任务的接取人');
  }

  quest.status = 'pending_settlement';
  quest.completedAt = Date.now();

  await saveDb();
}

export async function settleQuest(questId: string, operatorId: string): Promise<void> {
  const db = await getDb();

  const operator = db.data!.users.find((u) => u.id === operatorId);
  validateUserExists(operator);
  validateCanSettleQuests(operator);

  const quest = db.data!.quests.find((q) => q.id === questId);
  if (!quest) {
    throw new ValidationError('任务不存在');
  }
  validateUserBelongsToGuild(operator, quest.guildId);
  if (quest.status !== 'pending_settlement') {
    throw new ValidationError('该任务状态不是待结算，无法结算');
  }

  const member = db.data!.users.find((u) => u.id === quest.acceptedBy);
  if (member) {
    member.contribution += quest.reward.contribution;
  }

  const guild = db.data!.guilds.find((g) => g.id === quest.guildId);
  if (guild) {
    guild.funds += quest.reward.funds;
  }

  quest.status = 'settled';

  await createGuildLog(quest.guildId, 'quest_settle', operatorId, quest.acceptedBy, `结算任务「${quest.title}」`, {
    questId: quest.id,
    questTitle: quest.title,
    rewardContribution: quest.reward.contribution,
    rewardFunds: quest.reward.funds,
  });

  await saveDb();
}

export async function settleAllPendingQuests(guildId: string, operatorId: string): Promise<number> {
  const db = await getDb();

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);

  const operator = db.data!.users.find((u) => u.id === operatorId);
  validateUserExists(operator);
  validateUserBelongsToGuild(operator, guildId);

  const pendingQuests = db.data!.quests.filter(
    (q) => q.guildId === guildId && q.status === 'pending_settlement'
  );

  for (const quest of pendingQuests) {
    await settleQuest(quest.id, operatorId);
  }

  return pendingQuests.length;
}

export async function settleExpiredQuests(): Promise<{ expired: number; settled: number }> {
  const db = await getDb();

  const now = Date.now();
  let expiredCount = 0;
  let settledCount = 0;

  for (const quest of db.data!.quests) {
    if (quest.status === 'available' && quest.deadline < now) {
      quest.status = 'expired';
      expiredCount++;
    } else if (quest.status === 'in_progress' && quest.deadline < now) {
      quest.status = 'expired';
      expiredCount++;
    } else if (quest.status === 'completed' && !quest.completedAt) {
      quest.status = 'completed';
      settledCount++;
    }
  }

  await saveDb();

  return { expired: expiredCount, settled: settledCount };
}

export async function getQuestById(questId: string): Promise<Quest | undefined> {
  const db = await getDb();
  return db.data!.quests.find((q) => q.id === questId);
}
