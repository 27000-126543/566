import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Database } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/db.json');

const defaultData: Database = {
  users: [
    {
      id: 'user1',
      username: 'admin',
      password: '123456',
      profession: 'warrior',
      level: 50,
      contribution: 10000,
      guildId: 'guild1',
      guildRole: 'leader',
      createdAt: Date.now() - 86400000 * 30,
    },
    {
      id: 'user2',
      username: 'vice_admin',
      password: '123456',
      profession: 'mage',
      level: 45,
      contribution: 8000,
      guildId: 'guild1',
      guildRole: 'vice_leader',
      createdAt: Date.now() - 86400000 * 25,
    },
    {
      id: 'user3',
      username: 'player1',
      password: '123456',
      profession: 'archer',
      level: 35,
      contribution: 3000,
      guildId: 'guild1',
      guildRole: 'member',
      createdAt: Date.now() - 86400000 * 20,
    },
    {
      id: 'user4',
      username: 'player2',
      password: '123456',
      profession: 'priest',
      level: 30,
      contribution: 2000,
      guildId: 'guild2',
      guildRole: 'leader',
      createdAt: Date.now() - 86400000 * 15,
    },
    {
      id: 'user5',
      username: 'player3',
      password: '123456',
      profession: 'warrior',
      level: 25,
      contribution: 0,
      guildId: null,
      guildRole: null,
      createdAt: Date.now() - 86400000 * 10,
    },
    {
      id: 'user6',
      username: 'player4',
      password: '123456',
      profession: 'mage',
      level: 20,
      contribution: 0,
      guildId: null,
      guildRole: null,
      createdAt: Date.now() - 86400000 * 5,
    },
  ],
  guilds: [
    {
      id: 'guild1',
      name: '星辰骑士团',
      announcement: '欢迎来到星辰骑士团！我们追求荣耀与正义，每日晚8点准时活动，积极参与任务贡献多多！',
      leaderId: 'user1',
      viceLeaderIds: ['user2'],
      memberCount: 3,
      maxMembers: 50,
      level: 5,
      funds: 50000,
      createdAt: Date.now() - 86400000 * 60,
    },
    {
      id: 'guild2',
      name: '暗影议会',
      announcement: '暗影议会欢迎各位强者加入！我们注重效率和实力，只有最强者才能站在巅峰！',
      leaderId: 'user4',
      viceLeaderIds: [],
      memberCount: 1,
      maxMembers: 30,
      level: 3,
      funds: 20000,
      createdAt: Date.now() - 86400000 * 45,
    },
    {
      id: 'guild3',
      name: '光明圣殿',
      announcement: '光明圣殿是一个充满温暖的大家庭，无论新手老手都能在这里找到归属感！',
      leaderId: 'user3',
      viceLeaderIds: [],
      memberCount: 1,
      maxMembers: 40,
      level: 2,
      funds: 10000,
      createdAt: Date.now() - 86400000 * 30,
    },
  ],
  guildApplications: [
    {
      id: 'app1',
      guildId: 'guild1',
      userId: 'user5',
      status: 'pending',
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'app2',
      guildId: 'guild2',
      userId: 'user6',
      status: 'pending',
      createdAt: Date.now() - 7200000,
    },
  ],
  quests: [
    {
      id: 'quest1',
      guildId: 'guild1',
      title: '讨伐巨龙',
      description: '前往龙之谷击败远古巨龙，获取龙鳞和宝藏。需要至少3名成员组队完成。',
      reward: { contribution: 500, funds: 2000 },
      deadline: Date.now() + 86400000,
      status: 'available',
      acceptedBy: null,
      acceptedAt: null,
      completedAt: null,
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'quest2',
      guildId: 'guild1',
      title: '采集珍稀药材',
      description: '在迷雾森林采集10份月光草，用于公会药水制作。',
      reward: { contribution: 200, funds: 500 },
      deadline: Date.now() + 43200000,
      status: 'in_progress',
      acceptedBy: 'user3',
      acceptedAt: Date.now() - 1800000,
      completedAt: null,
      createdAt: Date.now() - 7200000,
    },
    {
      id: 'quest3',
      guildId: 'guild1',
      title: '护送商队',
      description: '保护商队安全抵达边境城市，途中可能遭遇强盗袭击。',
      reward: { contribution: 300, funds: 1000 },
      deadline: Date.now() - 3600000,
      status: 'pending_settlement',
      acceptedBy: 'user2',
      acceptedAt: Date.now() - 86400000,
      completedAt: Date.now() - 7200000,
      createdAt: Date.now() - 172800000,
    },
    {
      id: 'quest5',
      guildId: 'guild1',
      title: '清剿哥布林营地',
      description: '清剿公会领地附近的哥布林营地，保护周边村民安全。',
      reward: { contribution: 150, funds: 300 },
      deadline: Date.now() - 86400000 * 2,
      status: 'settled',
      acceptedBy: 'user3',
      acceptedAt: Date.now() - 86400000 * 3,
      completedAt: Date.now() - 86400000 * 2.5,
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'quest4',
      guildId: 'guild2',
      title: '竞技场挑战',
      description: '在竞技场获得10场胜利，为公会赢得荣誉。',
      reward: { contribution: 400, funds: 1500 },
      deadline: Date.now() + 86400000 * 2,
      status: 'available',
      acceptedBy: null,
      acceptedAt: null,
      completedAt: null,
      createdAt: Date.now() - 3600000,
    },
  ],
  warehouseItems: [
    {
      id: 'item1',
      guildId: 'guild1',
      name: '生命药水',
      quantity: 50,
      rarity: 'common',
      contributedBy: 'user1',
      createdAt: Date.now() - 86400000 * 10,
    },
    {
      id: 'item2',
      guildId: 'guild1',
      name: '魔法水晶',
      quantity: 20,
      rarity: 'rare',
      contributedBy: 'user2',
      createdAt: Date.now() - 86400000 * 8,
    },
    {
      id: 'item3',
      guildId: 'guild1',
      name: '龙鳞铠甲',
      quantity: 1,
      rarity: 'legendary',
      contributedBy: 'user1',
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'item4',
      guildId: 'guild1',
      name: '敏捷卷轴',
      quantity: 15,
      rarity: 'uncommon',
      contributedBy: 'user3',
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'item5',
      guildId: 'guild1',
      name: '暗影法杖',
      quantity: 2,
      rarity: 'epic',
      contributedBy: 'user2',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'item6',
      guildId: 'guild2',
      name: '力量药水',
      quantity: 30,
      rarity: 'common',
      contributedBy: 'user4',
      createdAt: Date.now() - 86400000 * 5,
    },
  ],
  itemApplications: [
    {
      id: 'itemApp1',
      guildId: 'guild1',
      itemId: 'item1',
      userId: 'user3',
      quantity: 5,
      status: 'pending',
      reviewedBy: null,
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'itemApp2',
      guildId: 'guild1',
      itemId: 'item2',
      userId: 'user3',
      quantity: 3,
      status: 'approved',
      reviewedBy: 'user1',
      createdAt: Date.now() - 86400000,
    },
  ],
  announcements: [
    {
      id: 'ann1',
      guildId: 'guild1',
      title: '公会战通知',
      content: '本周六晚8点将举行跨服公会战，请所有成员准时参加！本次公会战奖励丰厚，包括传说装备和大量公会资金。请大家提前准备好药水和装备，在公会大厅集合。',
      authorId: 'user1',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'ann2',
      guildId: 'guild1',
      title: '欢迎新成员',
      content: '热烈欢迎 player1 加入星辰骑士团！希望你在这里找到志同道合的伙伴，一起征战天下！',
      authorId: 'user1',
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'ann3',
      guildId: 'guild1',
      title: '仓库更新',
      content: '副会长捐赠了2把史诗暗影法杖，有需要的成员可以在仓库申请，但请合理使用资源！',
      authorId: 'user2',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'ann4',
      guildId: 'guild2',
      title: '招募公告',
      content: '暗影议会招募40级以上玩家，要求每日贡献任务，每周至少参加3次公会活动。有意者请直接申请！',
      authorId: 'user4',
      createdAt: Date.now() - 86400000 * 3,
    },
  ],
};

let db: Low<Database> | null = null;

export async function getDb(): Promise<Low<Database>> {
  if (!db) {
    const adapter = new JSONFile<Database>(dbPath);
    db = new Low(adapter, defaultData);
    await db.read();
    if (!db.data) {
      db.data = defaultData;
      await db.write();
    }
  }
  return db;
}

export async function saveDb(): Promise<void> {
  if (db) {
    await db.write();
  }
}
