import { getDb, saveDb } from '../db/index.js';
import {
  validateItemName,
  validateItemQuantity,
  validateItemRarity,
  validateUserExists,
  validateGuildExists,
  validateUserNotInGuild,
  validateGuildRole,
  ValidationError,
} from '../validators/index.js';
import type { WarehouseItem, ItemApplication } from '../../shared/types.js';
import { generateId } from './authService.js';

export async function contributeItem(
  guildId: string,
  name: string,
  quantity: number,
  rarity: string,
  contributorId: string
): Promise<WarehouseItem> {
  const db = await getDb();

  const contributor = db.data!.users.find((u) => u.id === contributorId);
  validateUserExists(contributor);
  validateUserNotInGuild(contributor);

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);

  validateItemName(name);
  validateItemQuantity(quantity);
  validateItemRarity(rarity);

  const existingItem = db.data!.warehouseItems.find(
    (item) => item.guildId === guildId && item.name === name && item.rarity === rarity
  );

  let newItem: WarehouseItem;

  if (existingItem) {
    existingItem.quantity += quantity;
    newItem = existingItem;
  } else {
    newItem = {
      id: generateId(),
      guildId,
      name,
      quantity,
      rarity: rarity as WarehouseItem['rarity'],
      contributedBy: contributorId,
      createdAt: Date.now(),
    };
    db.data!.warehouseItems.push(newItem);
  }

  const contributionPoints = calculateContributionPoints(rarity, quantity);
  contributor.contribution += contributionPoints;

  await saveDb();

  return newItem;
}

function calculateContributionPoints(rarity: string, quantity: number): number {
  const rarityMultiplier: Record<string, number> = {
    common: 1,
    uncommon: 3,
    rare: 10,
    epic: 30,
    legendary: 100,
  };
  return (rarityMultiplier[rarity] || 1) * quantity;
}

export async function getItemsByGuildId(guildId: string): Promise<WarehouseItem[]> {
  const db = await getDb();

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);

  return db.data!.warehouseItems.filter((item) => item.guildId === guildId);
}

export async function applyForItem(
  guildId: string,
  itemId: string,
  quantity: number,
  userId: string
): Promise<ItemApplication> {
  const db = await getDb();

  const user = db.data!.users.find((u) => u.id === userId);
  validateUserExists(user);
  validateUserNotInGuild(user);

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);

  const item = db.data!.warehouseItems.find(
    (i) => i.id === itemId && i.guildId === guildId
  );
  if (!item) {
    throw new ValidationError('物品不存在');
  }

  validateItemQuantity(quantity);

  if (item.quantity < quantity) {
    throw new ValidationError('物品库存不足');
  }

  const pendingApplications = db.data!.itemApplications.filter(
    (app) => app.userId === userId && app.status === 'pending'
  ).length;
  if (pendingApplications >= 3) {
    throw new ValidationError('您已有3个待审批的申请，请先等待审批');
  }

  const newApplication: ItemApplication = {
    id: generateId(),
    guildId,
    itemId,
    userId,
    quantity,
    status: 'pending',
    reviewedBy: null,
    createdAt: Date.now(),
  };

  db.data!.itemApplications.push(newApplication);
  await saveDb();

  return newApplication;
}

export async function getItemApplicationsByGuildId(guildId: string): Promise<ItemApplication[]> {
  const db = await getDb();

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);

  return db.data!.itemApplications.filter((app) => app.guildId === guildId);
}

export async function approveItemApplication(applicationId: string, reviewerId: string): Promise<void> {
  const db = await getDb();

  const reviewer = db.data!.users.find((u) => u.id === reviewerId);
  validateUserExists(reviewer);
  validateGuildRole(reviewer, ['leader', 'vice_leader']);

  const application = db.data!.itemApplications.find((app) => app.id === applicationId);
  if (!application) {
    throw new ValidationError('申请不存在');
  }
  if (application.status !== 'pending') {
    throw new ValidationError('该申请已被处理');
  }

  const item = db.data!.warehouseItems.find((i) => i.id === application.itemId);
  if (!item) {
    throw new ValidationError('物品不存在');
  }
  if (item.quantity < application.quantity) {
    throw new ValidationError('物品库存不足');
  }

  item.quantity -= application.quantity;
  if (item.quantity <= 0) {
    db.data!.warehouseItems = db.data!.warehouseItems.filter((i) => i.id !== item.id);
  }

  application.status = 'approved';
  application.reviewedBy = reviewerId;

  await saveDb();
}

export async function rejectItemApplication(applicationId: string, reviewerId: string): Promise<void> {
  const db = await getDb();

  const reviewer = db.data!.users.find((u) => u.id === reviewerId);
  validateUserExists(reviewer);
  validateGuildRole(reviewer, ['leader', 'vice_leader']);

  const application = db.data!.itemApplications.find((app) => app.id === applicationId);
  if (!application) {
    throw new ValidationError('申请不存在');
  }
  if (application.status !== 'pending') {
    throw new ValidationError('该申请已被处理');
  }

  application.status = 'rejected';
  application.reviewedBy = reviewerId;

  await saveDb();
}

export async function getItemById(itemId: string): Promise<WarehouseItem | undefined> {
  const db = await getDb();
  return db.data!.warehouseItems.find((item) => item.id === itemId);
}

export async function getItemApplicationById(applicationId: string): Promise<ItemApplication | undefined> {
  const db = await getDb();
  return db.data!.itemApplications.find((app) => app.id === applicationId);
}
