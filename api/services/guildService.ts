import { getDb, saveDb } from '../db/index.js';
import {
  validateGuildName,
  validateGuildNameUnique,
  validateGuildAnnouncement,
  validateUserHasGuild,
  validateGuildExists,
  validateGuildNotFull,
  validateUserExists,
  validateGuildRole,
  validateCanKickMember,
  validateCanAppointViceLeader,
  validateCanRemoveViceLeader,
  ValidationError,
} from '../validators/index.js';
import type { Guild, User, GuildApplication } from '../../shared/types.js';
import { generateId } from './authService.js';

export async function createGuild(
  userId: string,
  name: string,
  announcement: string
): Promise<Guild> {
  const db = await getDb();

  const user = db.data!.users.find((u) => u.id === userId);
  validateUserExists(user);
  validateUserHasGuild(user);
  validateGuildName(name);
  await validateGuildNameUnique(db, name);
  validateGuildAnnouncement(announcement);

  const newGuild: Guild = {
    id: generateId(),
    name,
    announcement,
    leaderId: userId,
    viceLeaderIds: [],
    memberCount: 1,
    maxMembers: 30,
    level: 1,
    funds: 0,
    createdAt: Date.now(),
  };

  db.data!.guilds.push(newGuild);

  user.guildId = newGuild.id;
  user.guildRole = 'leader';

  await saveDb();

  return newGuild;
}

export async function getGuildById(guildId: string): Promise<Guild | undefined> {
  const db = await getDb();
  return db.data!.guilds.find((g) => g.id === guildId);
}

export async function getAllGuilds(): Promise<Guild[]> {
  const db = await getDb();
  return [...db.data!.guilds];
}

export async function applyToGuild(userId: string, guildId: string): Promise<GuildApplication> {
  const db = await getDb();

  const user = db.data!.users.find((u) => u.id === userId);
  validateUserExists(user);
  validateUserHasGuild(user);

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);
  validateGuildNotFull(guild);

  const existingApplication = db.data!.guildApplications.find(
    (app) => app.guildId === guildId && app.userId === userId && app.status === 'pending'
  );
  if (existingApplication) {
    throw new ValidationError('您已向该公会提交过申请，请等待审批');
  }

  const newApplication: GuildApplication = {
    id: generateId(),
    guildId,
    userId,
    status: 'pending',
    createdAt: Date.now(),
  };

  db.data!.guildApplications.push(newApplication);
  await saveDb();

  return newApplication;
}

export async function getGuildApplications(guildId: string): Promise<GuildApplication[]> {
  const db = await getDb();

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);

  return db.data!.guildApplications.filter((app) => app.guildId === guildId);
}

export async function approveApplication(
  guildId: string,
  applicationId: string,
  reviewerId: string
): Promise<void> {
  const db = await getDb();

  const reviewer = db.data!.users.find((u) => u.id === reviewerId);
  validateUserExists(reviewer);
  validateGuildRole(reviewer, ['leader', 'vice_leader']);

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);
  validateGuildNotFull(guild);

  const application = db.data!.guildApplications.find(
    (app) => app.id === applicationId && app.guildId === guildId
  );
  if (!application) {
    throw new ValidationError('申请不存在');
  }
  if (application.status !== 'pending') {
    throw new ValidationError('该申请已被处理');
  }

  const applicant = db.data!.users.find((u) => u.id === application.userId);
  validateUserExists(applicant);
  validateUserHasGuild(applicant);

  application.status = 'approved';
  applicant.guildId = guildId;
  applicant.guildRole = 'member';
  guild.memberCount += 1;

  await saveDb();
}

export async function rejectApplication(
  guildId: string,
  applicationId: string,
  reviewerId: string
): Promise<void> {
  const db = await getDb();

  const reviewer = db.data!.users.find((u) => u.id === reviewerId);
  validateUserExists(reviewer);
  validateGuildRole(reviewer, ['leader', 'vice_leader']);

  const application = db.data!.guildApplications.find(
    (app) => app.id === applicationId && app.guildId === guildId
  );
  if (!application) {
    throw new ValidationError('申请不存在');
  }
  if (application.status !== 'pending') {
    throw new ValidationError('该申请已被处理');
  }

  application.status = 'rejected';
  await saveDb();
}

export async function kickMember(
  guildId: string,
  userId: string,
  operatorId: string
): Promise<void> {
  const db = await getDb();

  const operator = db.data!.users.find((u) => u.id === operatorId);
  validateUserExists(operator);
  validateGuildRole(operator, ['leader', 'vice_leader']);

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);

  const targetUser = db.data!.users.find((u) => u.id === userId);
  validateUserExists(targetUser);
  validateCanKickMember(operator, targetUser, guild);

  targetUser.guildId = null;
  targetUser.guildRole = null;
  guild.memberCount -= 1;

  if (guild.viceLeaderIds.includes(userId)) {
    guild.viceLeaderIds = guild.viceLeaderIds.filter((id) => id !== userId);
  }

  await saveDb();
}

export async function appointViceLeader(
  guildId: string,
  userId: string,
  operatorId: string
): Promise<void> {
  const db = await getDb();

  const operator = db.data!.users.find((u) => u.id === operatorId);
  validateUserExists(operator);

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);

  const targetUser = db.data!.users.find((u) => u.id === userId);
  validateUserExists(targetUser);
  validateCanAppointViceLeader(operator, targetUser, guild);

  targetUser.guildRole = 'vice_leader';
  guild.viceLeaderIds.push(userId);

  await saveDb();
}

export async function removeViceLeader(
  guildId: string,
  userId: string,
  operatorId: string
): Promise<void> {
  const db = await getDb();

  const operator = db.data!.users.find((u) => u.id === operatorId);
  validateUserExists(operator);

  const targetUser = db.data!.users.find((u) => u.id === userId);
  validateUserExists(targetUser);
  validateCanRemoveViceLeader(operator, targetUser);

  targetUser.guildRole = 'member';
  
  const guild = db.data!.guilds.find((g) => g.id === guildId);
  if (guild) {
    guild.viceLeaderIds = guild.viceLeaderIds.filter((id) => id !== userId);
  }

  await saveDb();
}

export async function getUserById(userId: string): Promise<User | undefined> {
  const db = await getDb();
  return db.data!.users.find((u) => u.id === userId);
}

export async function getGuildMembers(guildId: string): Promise<User[]> {
  const db = await getDb();

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);

  return db.data!.users.filter((u) => u.guildId === guildId);
}
