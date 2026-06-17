## 1. 架构设计

```mermaid
graph TD
    A["浏览器前端"] --> B["React Router 路由"]
    B --> C["页面组件"]
    C --> D["Zustand 状态管理"]
    D --> E["API 请求层"]
    E --> F["Express 后端"]
    F --> G["业务逻辑层"]
    G --> H["数据校验层"]
    G --> I["数据持久化层"]
    I --> J["LowDB 本地数据库"]
```

## 2. 技术说明
- 前端：React@18 + TypeScript + tailwindcss@3 + Vite
- 初始化工具：vite-init
- 后端：Express@4 + TypeScript
- 数据库：LowDB（本地 JSON 数据库，便于演示）
- 状态管理：Zustand
- 路由：React Router DOM
- 图标：lucide-react

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| /login | 登录页面 |
| /register | 注册页面 |
| /hall | 公会大厅（公会列表） |
| /guild/:id | 公会主页 |
| /guild/:id/members | 成员管理 |
| /guild/:id/quests | 任务系统 |
| /guild/:id/warehouse | 仓库系统 |
| /guild/:id/announcements | 公告板 |

## 4. API 定义

```typescript
// 用户相关
interface User {
  id: string;
  username: string;
  password: string;
  profession: 'warrior' | 'mage' | 'archer' | 'priest';
  level: number;
  contribution: number;
  guildId: string | null;
  guildRole: 'leader' | 'vice_leader' | 'member' | null;
  createdAt: number;
}

// 公会相关
interface Guild {
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

// 成员申请
interface GuildApplication {
  id: string;
  guildId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

// 任务相关
interface Quest {
  id: string;
  guildId: string;
  title: string;
  description: string;
  reward: {
    contribution: number;
    funds: number;
  };
  deadline: number;
  status: 'available' | 'in_progress' | 'completed' | 'expired';
  acceptedBy: string | null;
  acceptedAt: number | null;
  completedAt: number | null;
  createdAt: number;
}

// 仓库物品
interface WarehouseItem {
  id: string;
  guildId: string;
  name: string;
  quantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  contributedBy: string;
  createdAt: number;
}

// 物品申请
interface ItemApplication {
  id: string;
  guildId: string;
  itemId: string;
  userId: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null;
  createdAt: number;
}

// 公告
interface Announcement {
  id: string;
  guildId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: number;
}

// API 响应格式
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## 5. 服务器架构图

```mermaid
graph TD
    A["客户端请求"] --> B["Express 中间件"]
    B --> C["路由层 (Routes)"]
    C --> D["控制器层 (Controllers)"]
    D --> E["业务逻辑层 (Services)"]
    E --> F["数据校验层 (Validators)"]
    E --> G["数据访问层 (Repositories)"]
    G --> H["LowDB 数据库"]
    F --> I["错误处理中间件"]
    I --> J["统一响应格式"]
```

## 6. 数据模型

### 6.1 数据模型定义

```mermaid
erDiagram
    USER ||--o{ GUILD_APPLICATION : "提交"
    USER ||--o{ QUEST : "接取"
    USER ||--o{ WAREHOUSE_ITEM : "贡献"
    USER ||--o{ ITEM_APPLICATION : "申请"
    USER ||--o{ ANNOUNCEMENT : "发布"
    GUILD ||--|| USER : "会长"
    GUILD ||--o{ USER : "成员"
    GUILD ||--o{ GUILD_APPLICATION : "收到"
    GUILD ||--o{ QUEST : "发布"
    GUILD ||--o{ WAREHOUSE_ITEM : "拥有"
    GUILD ||--o{ ITEM_APPLICATION : "处理"
    GUILD ||--o{ ANNOUNCEMENT : "拥有"
    WAREHOUSE_ITEM ||--o{ ITEM_APPLICATION : "被申请"
    
    USER {
        string id PK
        string username
        string password
        string profession
        int level
        int contribution
        string guildId FK
        string guildRole
        timestamp createdAt
    }
    
    GUILD {
        string id PK
        string name
        string announcement
        string leaderId FK
        string[] viceLeaderIds
        int memberCount
        int maxMembers
        int level
        int funds
        timestamp createdAt
    }
    
    GUILD_APPLICATION {
        string id PK
        string guildId FK
        string userId FK
        string status
        timestamp createdAt
    }
    
    QUEST {
        string id PK
        string guildId FK
        string title
        string description
        int rewardContribution
        int rewardFunds
        timestamp deadline
        string status
        string acceptedBy FK
        timestamp acceptedAt
        timestamp completedAt
        timestamp createdAt
    }
    
    WAREHOUSE_ITEM {
        string id PK
        string guildId FK
        string name
        int quantity
        string rarity
        string contributedBy FK
        timestamp createdAt
    }
    
    ITEM_APPLICATION {
        string id PK
        string guildId FK
        string itemId FK
        string userId FK
        int quantity
        string status
        string reviewedBy FK
        timestamp createdAt
    }
    
    ANNOUNCEMENT {
        string id PK
        string guildId FK
        string title
        string content
        string authorId FK
        timestamp createdAt
    }
```

### 6.2 初始化数据
- 3 个示例公会：「星辰骑士团」「暗影议会」「光明圣殿」
- 6 个示例玩家账号（不同职业）
- 若干示例任务、物品、公告
- 演示用的成员申请和物品申请记录
