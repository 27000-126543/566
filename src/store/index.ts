import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Guild, GuildApplication, GuildLog, Quest, WarehouseItem, ItemApplication, Announcement } from '../../shared/types.js';
import { api } from '../utils/api.js';

interface GuildApplicationWithUser extends GuildApplication {
  user: { username: string; profession: string; level: number } | null;
}

interface AppState {
  user: User | null;
  currentGuild: Guild | null;
  guilds: Guild[];
  members: User[];
  applications: GuildApplicationWithUser[];
  quests: Quest[];
  warehouseItems: WarehouseItem[];
  itemApplications: ItemApplication[];
  announcements: Announcement[];
  guildLogs: GuildLog[];
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
  
  setUser: (user: User | null) => void;
  setCurrentGuild: (guild: Guild | null) => void;
  setNotification: (notification: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  
  login: (username: string, password: string) => Promise<User | null>;
  register: (username: string, password: string, profession: string) => Promise<User | null>;
  logout: () => void;
  
  fetchGuilds: () => Promise<void>;
  createGuild: (name: string, announcement: string, userId: string) => Promise<boolean>;
  fetchGuildDetail: (guildId: string) => Promise<void>;
  applyToGuild: (guildId: string, userId: string) => Promise<boolean>;
  
  fetchMembers: (guildId: string) => Promise<void>;
  fetchApplications: (guildId: string) => Promise<void>;
  approveApplication: (guildId: string, appId: string, reviewerId: string) => Promise<boolean>;
  rejectApplication: (guildId: string, appId: string, reviewerId: string) => Promise<boolean>;
  kickMember: (guildId: string, userId: string, operatorId: string) => Promise<boolean>;
  appointViceLeader: (guildId: string, userId: string, operatorId: string) => Promise<boolean>;
  removeViceLeader: (guildId: string, userId: string, operatorId: string) => Promise<boolean>;
  
  fetchQuests: (guildId: string) => Promise<void>;
  publishQuest: (guildId: string, data: { title: string; description: string; rewardContribution: number; rewardFunds: number; deadline: number; publisherId: string }) => Promise<boolean>;
  acceptQuest: (questId: string, userId: string) => Promise<boolean>;
  completeQuest: (questId: string, userId: string) => Promise<boolean>;
  settleQuest: (questId: string, userId: string) => Promise<boolean>;
  settleAllQuests: (guildId: string, userId: string) => Promise<boolean>;
  fetchGuildLogs: (guildId: string, userId: string, userRole: string) => Promise<void>;
  
  fetchWarehouseItems: (guildId: string) => Promise<void>;
  contributeItem: (guildId: string, data: { name: string; quantity: number; rarity: string; contributorId: string }) => Promise<boolean>;
  fetchItemApplications: (guildId: string) => Promise<void>;
  applyForItem: (guildId: string, data: { itemId: string; quantity: number; userId: string }) => Promise<boolean>;
  approveItemApplication: (appId: string, reviewerId: string) => Promise<boolean>;
  rejectItemApplication: (appId: string, reviewerId: string) => Promise<boolean>;
  
  fetchAnnouncements: (guildId: string) => Promise<void>;
  createAnnouncement: (guildId: string, data: { title: string; content: string; authorId: string }) => Promise<boolean>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      currentGuild: null,
      guilds: [],
      members: [],
      applications: [],
      quests: [],
      warehouseItems: [],
      itemApplications: [],
      announcements: [],
      guildLogs: [],
      notification: null,
      
      setUser: (user) => set({ user }),
      setCurrentGuild: (guild) => set({ currentGuild: guild }),
      setNotification: (notification) => set({ notification }),
      
      login: async (username, password) => {
        const res = await api.post<User>('/auth/login', { username, password });
        if (res.success && res.data) {
          set({ user: res.data });
          set({ notification: { type: 'success', message: '登录成功！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '登录失败' } });
          return false;
        }
      },
      
      register: async (username, password, profession) => {
        const res = await api.post<User>('/auth/register', { username, password, profession });
        if (res.success && res.data) {
          set({ user: res.data });
          set({ notification: { type: 'success', message: '注册成功！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '注册失败' } });
          return false;
        }
      },
      
      logout: () => {
        set({
          user: null,
          currentGuild: null,
          guilds: [],
          members: [],
          applications: [],
          quests: [],
          warehouseItems: [],
          itemApplications: [],
          announcements: [],
          guildLogs: [],
        });
      },
      
      fetchGuilds: async () => {
        const res = await api.get<Guild[]>('/guilds');
        if (res.success && res.data) {
          set({ guilds: res.data });
        }
      },
      
      createGuild: async (name, announcement, userId) => {
        const res = await api.post<Guild>('/guilds', { name, announcement, userId });
        if (res.success && res.data) {
          set({ currentGuild: res.data });
          set({ notification: { type: 'success', message: '公会创建成功！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '创建失败' } });
          return false;
        }
      },
      
      fetchGuildDetail: async (guildId) => {
        const res = await api.get<Guild>(`/guilds/${guildId}`);
        if (res.success && res.data) {
          set({ currentGuild: res.data });
        }
      },
      
      applyToGuild: async (guildId, userId) => {
        const res = await api.post<GuildApplication>(`/guilds/${guildId}/apply`, { userId });
        if (res.success) {
          set({ notification: { type: 'success', message: '申请已提交，等待审批！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '申请失败' } });
          return false;
        }
      },
      
      fetchMembers: async (guildId) => {
        const res = await api.get<User[]>(`/guilds/${guildId}/members`);
        if (res.success && res.data) {
          set({ members: res.data });
        }
      },
      
      fetchApplications: async (guildId) => {
        const res = await api.get<GuildApplicationWithUser[]>(`/guilds/${guildId}/applications`);
        if (res.success && res.data) {
          set({ applications: res.data });
        }
      },
      
      approveApplication: async (guildId, appId, reviewerId) => {
        const res = await api.post<GuildApplication>(`/guilds/${guildId}/applications/${appId}/approve`, { reviewerId });
        if (res.success) {
          set({ notification: { type: 'success', message: '已批准申请！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '操作失败' } });
          return false;
        }
      },
      
      rejectApplication: async (guildId, appId, reviewerId) => {
        const res = await api.post<GuildApplication>(`/guilds/${guildId}/applications/${appId}/reject`, { reviewerId });
        if (res.success) {
          set({ notification: { type: 'success', message: '已拒绝申请！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '操作失败' } });
          return false;
        }
      },
      
      kickMember: async (guildId, userId, operatorId) => {
        const res = await api.post(`/guilds/${guildId}/members/${userId}/kick`, { operatorId });
        if (res.success) {
          set({ notification: { type: 'success', message: '已踢出该成员！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '操作失败' } });
          return false;
        }
      },
      
      appointViceLeader: async (guildId, userId, operatorId) => {
        const res = await api.post(`/guilds/${guildId}/members/${userId}/appoint-vice`, { operatorId });
        if (res.success) {
          set({ notification: { type: 'success', message: '已任命为副会长！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '操作失败' } });
          return false;
        }
      },
      
      removeViceLeader: async (guildId, userId, operatorId) => {
        const res = await api.post(`/guilds/${guildId}/members/${userId}/remove-vice`, { operatorId });
        if (res.success) {
          set({ notification: { type: 'success', message: '已罢免副会长！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '操作失败' } });
          return false;
        }
      },
      
      fetchQuests: async (guildId) => {
        const res = await api.get<Quest[]>(`/guilds/${guildId}/quests`);
        if (res.success && res.data) {
          set({ quests: res.data });
        }
      },
      
      publishQuest: async (guildId, data) => {
        const res = await api.post<Quest>(`/guilds/${guildId}/quests`, data);
        if (res.success) {
          set({ notification: { type: 'success', message: '任务发布成功！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '发布失败' } });
          return false;
        }
      },
      
      acceptQuest: async (questId, userId) => {
        const res = await api.post<Quest>(`/quests/${questId}/accept`, { userId });
        if (res.success) {
          set({ notification: { type: 'success', message: '任务接取成功！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '接取失败' } });
          return false;
        }
      },
      
      completeQuest: async (questId, userId) => {
        const res = await api.post<Quest>(`/quests/${questId}/complete`, { userId });
        if (res.success) {
          set({ notification: { type: 'success', message: '任务完成！等待结算后发放奖励' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '操作失败' } });
          return false;
        }
      },
      
      fetchGuildLogs: async (guildId, userId, userRole) => {
        const res = await api.get<GuildLog[]>(`/guild-logs/${guildId}?userId=${userId}&userRole=${userRole}`);
        if (res.success && res.data) {
          set({ guildLogs: res.data });
        }
      },
      
      settleQuest: async (questId, userId) => {
        const res = await api.post(`/quests/${questId}/settle`, { userId });
        if (res.success) {
          set({ notification: { type: 'success', message: '任务结算成功！奖励已发放' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '结算失败' } });
          return false;
        }
      },
      
      settleAllQuests: async (guildId, userId) => {
        const res = await api.post<number>(`/quests/settle-all/${guildId}`, { userId });
        if (res.success && typeof res.data === 'number') {
          set({ notification: { type: 'success', message: `成功结算 ${res.data} 个任务！` } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '批量结算失败' } });
          return false;
        }
      },
      
      fetchWarehouseItems: async (guildId) => {
        const res = await api.get<WarehouseItem[]>(`/guilds/${guildId}/items`);
        if (res.success && res.data) {
          set({ warehouseItems: res.data });
        }
      },
      
      contributeItem: async (guildId, data) => {
        const res = await api.post<WarehouseItem>(`/guilds/${guildId}/items`, data);
        if (res.success) {
          set({ notification: { type: 'success', message: '物品贡献成功！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '贡献失败' } });
          return false;
        }
      },
      
      fetchItemApplications: async (guildId) => {
        const res = await api.get<ItemApplication[]>(`/guilds/${guildId}/item-applications`);
        if (res.success && res.data) {
          set({ itemApplications: res.data });
        }
      },
      
      applyForItem: async (guildId, data) => {
        const res = await api.post<ItemApplication>(`/guilds/${guildId}/item-applications`, data);
        if (res.success) {
          set({ notification: { type: 'success', message: '物品申请已提交！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '申请失败' } });
          return false;
        }
      },
      
      approveItemApplication: async (appId, reviewerId) => {
        const res = await api.post<ItemApplication>(`/item-applications/${appId}/approve`, { reviewerId });
        if (res.success) {
          set({ notification: { type: 'success', message: '已批准物品申请！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '操作失败' } });
          return false;
        }
      },
      
      rejectItemApplication: async (appId, reviewerId) => {
        const res = await api.post<ItemApplication>(`/item-applications/${appId}/reject`, { reviewerId });
        if (res.success) {
          set({ notification: { type: 'success', message: '已拒绝物品申请！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '操作失败' } });
          return false;
        }
      },
      
      fetchAnnouncements: async (guildId) => {
        const res = await api.get<Announcement[]>(`/guilds/${guildId}/announcements`);
        if (res.success && res.data) {
          set({ announcements: res.data });
        }
      },
      
      createAnnouncement: async (guildId, data) => {
        const res = await api.post<Announcement>(`/guilds/${guildId}/announcements`, data);
        if (res.success) {
          set({ notification: { type: 'success', message: '公告发布成功！' } });
          return true;
        } else {
          set({ notification: { type: 'error', message: res.error || '发布失败' } });
          return false;
        }
      },
    }),
    {
      name: 'guild-system-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
