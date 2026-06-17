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
  ValidationError,
} from '../validators/index.js';
import type { Quest } from '../../shared/types.js';
import { generateId } from './authService.js';

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
  if (quest.status !== 'in_progress') {
    throw new ValidationError('该任务未在进行中');
  }
  if (quest.acceptedBy !== userId) {
    throw new ValidationError('您不是该任务的接取人');
  }

  quest.status = 'completed';
  quest.completedAt = Date.now();

  user.contribution += quest.reward.contribution;

  const guild = db.data!.guilds.find((g) => g.id === quest.guildId);
  if (guild) {
    guild.funds += quest.reward.funds;
  }

  await saveDb();
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
