import { getDb, saveDb } from '../db/index.js';
import {
  validateUsername,
  validatePassword,
  validateProfession,
  ValidationError,
} from '../validators/index.js';
import type { User } from '../../shared/types.js';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export async function register(
  username: string,
  password: string,
  profession: string
): Promise<User> {
  const db = await getDb();

  validateUsername(username);
  validatePassword(password);
  validateProfession(profession);

  const existingUser = db.data!.users.find((u) => u.username === username);
  if (existingUser) {
    throw new ValidationError('该用户名已被注册，请选择其他用户名');
  }

  const newUser: User = {
    id: generateId(),
    username,
    password,
    profession,
    level: 1,
    contribution: 0,
    guildId: null,
    guildRole: null,
    createdAt: Date.now(),
  };

  db.data!.users.push(newUser);
  await saveDb();

  return newUser;
}

export async function login(username: string, password: string): Promise<User> {
  const db = await getDb();

  validateUsername(username);
  validatePassword(password);

  const user = db.data!.users.find((u) => u.username === username);
  if (!user) {
    throw new ValidationError('用户名或密码错误');
  }

  if (user.password !== password) {
    throw new ValidationError('用户名或密码错误');
  }

  return user;
}

export { generateId };
