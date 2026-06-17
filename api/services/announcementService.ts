import { getDb, saveDb } from '../db/index.js';
import {
  validateAnnouncementTitle,
  validateAnnouncementContent,
  validateUserExists,
  validateGuildExists,
  validateGuildRole,
} from '../validators/index.js';
import type { Announcement } from '../../shared/types.js';
import { generateId } from './authService.js';

export async function createAnnouncement(
  guildId: string,
  title: string,
  content: string,
  authorId: string
): Promise<Announcement> {
  const db = await getDb();

  const author = db.data!.users.find((u) => u.id === authorId);
  validateUserExists(author);
  validateGuildRole(author, ['leader', 'vice_leader']);

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);

  validateAnnouncementTitle(title);
  validateAnnouncementContent(content);

  const newAnnouncement: Announcement = {
    id: generateId(),
    guildId,
    title,
    content,
    authorId,
    createdAt: Date.now(),
  };

  db.data!.announcements.push(newAnnouncement);
  await saveDb();

  return newAnnouncement;
}

export async function getAnnouncementsByGuildId(guildId: string): Promise<Announcement[]> {
  const db = await getDb();

  const guild = db.data!.guilds.find((g) => g.id === guildId);
  validateGuildExists(guild);

  return db.data!.announcements
    .filter((ann) => ann.guildId === guildId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAnnouncementById(announcementId: string): Promise<Announcement | undefined> {
  const db = await getDb();
  return db.data!.announcements.find((ann) => ann.id === announcementId);
}
