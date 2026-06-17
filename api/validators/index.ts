import type { Low } from 'lowdb';
import type { Database, User, Guild, GuildRole, Profession } from '../../shared/types.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateUsername(username: string): void {
  if (!username || username.trim().length === 0) {
    throw new ValidationError('用户名不能为空');
  }
  if (username.length < 3 || username.length > 20) {
    throw new ValidationError('用户名长度必须在3-20个字符之间');
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    throw new ValidationError('用户名只能包含字母、数字、下划线和中文');
  }
}

export function validatePassword(password: string): void {
  if (!password || password.length === 0) {
    throw new ValidationError('密码不能为空');
  }
  if (password.length < 6 || password.length > 30) {
    throw new ValidationError('密码长度必须在6-30个字符之间');
  }
}

export function validateProfession(profession: string): asserts profession is Profession {
  const validProfessions: Profession[] = ['warrior', 'mage', 'archer', 'priest'];
  if (!validProfessions.includes(profession as Profession)) {
    throw new ValidationError('无效的职业选择');
  }
}

export function validateGuildName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new ValidationError('公会名称不能为空');
  }
  if (name.length < 2 || name.length > 20) {
    throw new ValidationError('公会名称长度必须在2-20个字符之间');
  }
}

export async function validateGuildNameUnique(db: Low<Database>, name: string, excludeId?: string): Promise<void> {
  const existingGuild = db.data!.guilds.find(
    (g) => g.name === name && g.id !== excludeId
  );
  if (existingGuild) {
    throw new ValidationError('该公会名称已被使用，请选择其他名称');
  }
}

export function validateGuildAnnouncement(announcement: string): void {
  if (announcement && announcement.length > 500) {
    throw new ValidationError('公会公告不能超过500个字符');
  }
}

export function validateUserHasGuild(user: User): void {
  if (user.guildId) {
    throw new ValidationError('您已经加入了一个公会，请先退出当前公会');
  }
}

export function validateUserNotInGuild(user: User): void {
  if (!user.guildId) {
    throw new ValidationError('您还没有加入任何公会');
  }
}

export function validateGuildExists(guild: Guild | undefined): asserts guild is Guild {
  if (!guild) {
    throw new ValidationError('公会不存在');
  }
}

export function validateGuildNotFull(guild: Guild): void {
  if (guild.memberCount >= guild.maxMembers) {
    throw new ValidationError('公会成员已满，无法加入');
  }
}

export function validateGuildRole(
  user: User,
  allowedRoles: GuildRole[]
): void {
  if (!user.guildRole || !allowedRoles.includes(user.guildRole)) {
    throw new ValidationError('权限不足，无法执行此操作');
  }
}

export function validateUserExists(user: User | undefined): asserts user is User {
  if (!user) {
    throw new ValidationError('用户不存在');
  }
}

export function validateCanKickMember(
  currentUser: User,
  targetUser: User,
  guild: Guild
): void {
  if (currentUser.guildRole !== 'leader') {
    throw new ValidationError('只有会长才能踢出成员');
  }
  if (targetUser.guildId !== guild.id) {
    throw new ValidationError('该用户不在此公会中');
  }
  if (targetUser.id === currentUser.id) {
    throw new ValidationError('不能踢出自己');
  }
  if (targetUser.guildRole === 'leader') {
    throw new ValidationError('不能踢出会长');
  }
}

export function validateCanApproveGuildApplication(currentUser: User): void {
  if (currentUser.guildRole !== 'leader') {
    throw new ValidationError('只有会长才能审批入会申请');
  }
}

export function validateCanReviewItemApplication(currentUser: User): void {
  if (currentUser.guildRole !== 'leader' && currentUser.guildRole !== 'vice_leader') {
    throw new ValidationError('只有会长和副会长才能审批物品申领');
  }
}

export function validateCanCreateAnnouncement(currentUser: User): void {
  if (currentUser.guildRole !== 'leader') {
    throw new ValidationError('只有会长才能发布公告');
  }
}

export function validateCanSettleQuests(currentUser: User): void {
  if (currentUser.guildRole !== 'leader' && currentUser.guildRole !== 'vice_leader') {
    throw new ValidationError('只有会长和副会长才能进行任务结算');
  }
}

export function validateCanAppointViceLeader(
  currentUser: User,
  targetUser: User,
  guild: Guild
): void {
  if (currentUser.guildRole !== 'leader') {
    throw new ValidationError('只有会长才能任命副会长');
  }
  
  if (targetUser.guildId !== guild.id) {
    throw new ValidationError('该用户不在此公会中');
  }
  
  if (targetUser.guildRole === 'leader') {
    throw new ValidationError('会长不能被任命为副会长');
  }
  
  if (targetUser.guildRole === 'vice_leader') {
    throw new ValidationError('该用户已经是副会长');
  }
  
  if (guild.viceLeaderIds.length >= 3) {
    throw new ValidationError('副会长人数已达上限（最多3人）');
  }
}

export function validateCanRemoveViceLeader(
  currentUser: User,
  targetUser: User
): void {
  if (currentUser.guildRole !== 'leader') {
    throw new ValidationError('只有会长才能罢免副会长');
  }
  
  if (targetUser.guildRole !== 'vice_leader') {
    throw new ValidationError('该用户不是副会长');
  }
}

export function validateQuestTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new ValidationError('任务标题不能为空');
  }
  if (title.length < 2 || title.length > 50) {
    throw new ValidationError('任务标题长度必须在2-50个字符之间');
  }
}

export function validateQuestDescription(description: string): void {
  if (!description || description.trim().length === 0) {
    throw new ValidationError('任务描述不能为空');
  }
  if (description.length > 500) {
    throw new ValidationError('任务描述不能超过500个字符');
  }
}

export function validateQuestReward(contribution: number, funds: number): void {
  if (contribution < 0) {
    throw new ValidationError('贡献奖励不能为负数');
  }
  if (funds < 0) {
    throw new ValidationError('资金奖励不能为负数');
  }
  if (contribution > 10000) {
    throw new ValidationError('贡献奖励不能超过10000');
  }
  if (funds > 100000) {
    throw new ValidationError('资金奖励不能超过100000');
  }
}

export function validateQuestDeadline(deadline: number): void {
  const now = Date.now();
  if (deadline <= now) {
    throw new ValidationError('任务截止时间必须在未来');
  }
  const maxDeadline = now + 86400000 * 7;
  if (deadline > maxDeadline) {
    throw new ValidationError('任务截止时间不能超过7天');
  }
}

export function validateQuestPublishInterval(
  db: Low<Database>,
  guildId: string
): void {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  
  const recentQuests = db.data!.quests.filter(
    (q) => q.guildId === guildId && q.createdAt > oneHourAgo
  );
  
  if (recentQuests.length >= 5) {
    throw new ValidationError('发布任务过于频繁，请一小时后再试');
  }
}

export function validateCanAcceptQuest(user: User): void {
  validateUserNotInGuild(user);
  
  const activeQuests = 0;
  if (activeQuests >= 3) {
    throw new ValidationError('您已接取3个任务，请先完成现有任务');
  }
}

export function validateItemName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new ValidationError('物品名称不能为空');
  }
  if (name.length < 2 || name.length > 30) {
    throw new ValidationError('物品名称长度必须在2-30个字符之间');
  }
}

export function validateItemQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new ValidationError('物品数量必须是正整数');
  }
  if (quantity > 999) {
    throw new ValidationError('物品数量不能超过999');
  }
}

export function validateItemRarity(rarity: string): void {
  const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  if (!validRarities.includes(rarity)) {
    throw new ValidationError('无效的物品稀有度');
  }
}

export function validateAnnouncementTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new ValidationError('公告标题不能为空');
  }
  if (title.length < 2 || title.length > 50) {
    throw new ValidationError('公告标题长度必须在2-50个字符之间');
  }
}

export function validateAnnouncementContent(content: string): void {
  if (!content || content.trim().length === 0) {
    throw new ValidationError('公告内容不能为空');
  }
  if (content.length > 1000) {
    throw new ValidationError('公告内容不能超过1000个字符');
  }
}
