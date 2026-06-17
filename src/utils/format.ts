import type { ItemRarity, QuestStatus, ApplicationStatus, GuildRole, Profession } from '../../shared/types.js';
import { RARITY_NAMES, QUEST_STATUS_NAMES, APPLICATION_STATUS_NAMES, ROLE_NAMES, PROFESSION_NAMES } from '../../shared/types.js';

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTime(timestamp: number): string {
  return formatTime(timestamp);
}

export function formatCountdown(deadline: number): string {
  const now = Date.now();
  const diff = deadline - now;
  
  if (diff <= 0) {
    return '已过期';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (days > 0) {
    return `${days}天 ${hours}小时`;
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分 ${seconds}秒`;
  } else {
    return `${seconds}秒`;
  }
}

export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function getRarityName(rarity: ItemRarity): string {
  return RARITY_NAMES[rarity];
}

export function getRarityColor(rarity: ItemRarity): string {
  const colors: Record<ItemRarity, string> = {
    common: 'text-rarity-common',
    uncommon: 'text-rarity-uncommon',
    rare: 'text-rarity-rare',
    epic: 'text-rarity-epic',
    legendary: 'text-rarity-legendary',
  };
  return colors[rarity];
}

export function getRarityBgColor(rarity: ItemRarity): string {
  const colors: Record<ItemRarity, string> = {
    common: 'bg-rarity-common/20 border-rarity-common',
    uncommon: 'bg-rarity-uncommon/20 border-rarity-uncommon',
    rare: 'bg-rarity-rare/20 border-rarity-rare',
    epic: 'bg-rarity-epic/20 border-rarity-epic',
    legendary: 'bg-rarity-legendary/20 border-rarity-legendary',
  };
  return colors[rarity];
}

export function getQuestStatusName(status: QuestStatus): string {
  return QUEST_STATUS_NAMES[status];
}

export function getQuestStatusColor(status: QuestStatus): string {
  const colors: Record<QuestStatus, string> = {
    available: 'text-green-400 bg-green-500/20',
    in_progress: 'text-yellow-400 bg-yellow-500/20',
    completed: 'text-blue-400 bg-blue-500/20',
    pending_settlement: 'text-orange-400 bg-orange-500/20',
    settled: 'text-emerald-400 bg-emerald-500/20',
    expired: 'text-gray-400 bg-gray-500/20',
  };
  return colors[status];
}

export function getApplicationStatusName(status: ApplicationStatus): string {
  return APPLICATION_STATUS_NAMES[status];
}

export function getApplicationStatusColor(status: ApplicationStatus): string {
  const colors: Record<ApplicationStatus, string> = {
    pending: 'text-yellow-400 bg-yellow-500/20',
    approved: 'text-green-400 bg-green-500/20',
    rejected: 'text-red-400 bg-red-500/20',
  };
  return colors[status];
}

export function getRoleName(role: GuildRole): string {
  return ROLE_NAMES[role];
}

export function getRoleColor(role: GuildRole): string {
  const colors: Record<GuildRole, string> = {
    leader: 'text-gold-400 bg-gold-500/20',
    vice_leader: 'text-slate-300 bg-slate-500/20',
    member: 'text-amber-600 bg-amber-500/20',
  };
  return colors[role];
}

export function getProfessionName(profession: Profession): string {
  return PROFESSION_NAMES[profession];
}

export function getProfessionIcon(profession: Profession): string {
  const icons: Record<Profession, string> = {
    warrior: '⚔️',
    mage: '🔮',
    archer: '🏹',
    priest: '✨',
  };
  return icons[profession];
}
