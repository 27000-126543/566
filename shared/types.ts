export type Profession = 'warrior' | 'mage' | 'archer' | 'priest';
export type GuildRole = 'leader' | 'vice_leader' | 'member';
export type QuestStatus = 'available' | 'in_progress' | 'completed' | 'pending_settlement' | 'settled' | 'expired';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type GuildLogType =
  | 'member_approve'
  | 'member_reject'
  | 'member_kick'
  | 'member_appoint_vice'
  | 'member_remove_vice'
  | 'quest_settle'
  | 'item_contribute'
  | 'item_approve'
  | 'item_reject'
  | 'announcement_create'
  | 'guild_create';

export interface GuildLog {
  id: string;
  guildId: string;
  type: GuildLogType;
  operatorId: string;
  targetUserId: string | null;
  description: string;
  details: Record<string, unknown>;
  createdAt: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  profession: Profession;
  level: number;
  contribution: number;
  guildId: string | null;
  guildRole: GuildRole | null;
  createdAt: number;
}

export interface Guild {
  id: string;
  name: string;
  announcement: string;
  leaderId: string;
  viceLeaderIds: string[];
  memberCount: number;
  maxMembers: number;
  level: number;
  funds: number;
  createdAt: number;
}

export interface GuildApplication {
  id: string;
  guildId: string;
  userId: string;
  status: ApplicationStatus;
  createdAt: number;
}

export interface QuestReward {
  contribution: number;
  funds: number;
}

export interface Quest {
  id: string;
  guildId: string;
  title: string;
  description: string;
  reward: QuestReward;
  deadline: number;
  status: QuestStatus;
  acceptedBy: string | null;
  acceptedAt: number | null;
  completedAt: number | null;
  createdAt: number;
}

export interface WarehouseItem {
  id: string;
  guildId: string;
  name: string;
  quantity: number;
  rarity: ItemRarity;
  contributedBy: string;
  createdAt: number;
}

export interface ItemApplication {
  id: string;
  guildId: string;
  itemId: string;
  userId: string;
  quantity: number;
  status: ApplicationStatus;
  reviewedBy: string | null;
  createdAt: number;
}

export interface Announcement {
  id: string;
  guildId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface Database {
  users: User[];
  guilds: Guild[];
  guildApplications: GuildApplication[];
  quests: Quest[];
  warehouseItems: WarehouseItem[];
  itemApplications: ItemApplication[];
  announcements: Announcement[];
  guildLogs: GuildLog[];
}

export const PROFESSION_NAMES: Record<Profession, string> = {
  warrior: '战士',
  mage: '法师',
  archer: '弓箭手',
  priest: '牧师',
};

export const ROLE_NAMES: Record<GuildRole, string> = {
  leader: '会长',
  vice_leader: '副会长',
  member: '成员',
};

export const RARITY_NAMES: Record<ItemRarity, string> = {
  common: '普通',
  uncommon: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const QUEST_STATUS_NAMES: Record<QuestStatus, string> = {
  available: '可接取',
  in_progress: '进行中',
  completed: '已完成',
  pending_settlement: '待结算',
  settled: '已发放',
  expired: '已过期',
};

export const GUILD_LOG_TYPE_NAMES: Record<GuildLogType, string> = {
  member_approve: '批准入会',
  member_reject: '拒绝入会',
  member_kick: '踢出成员',
  member_appoint_vice: '任命副会长',
  member_remove_vice: '罢免副会长',
  quest_settle: '任务结算',
  item_contribute: '贡献物品',
  item_approve: '批准物品申领',
  item_reject: '拒绝物品申领',
  announcement_create: '发布公告',
  guild_create: '创建公会',
};

export const APPLICATION_STATUS_NAMES: Record<ApplicationStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝',
};
