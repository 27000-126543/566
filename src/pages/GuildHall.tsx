import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Crown, LogOut, Search, DoorOpen, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button.js';
import { Input } from '@/components/ui/Input.js';
import { Textarea } from '@/components/ui/Textarea.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Badge } from '@/components/ui/Badge.js';
import { Modal } from '@/components/ui/Modal.js';
import Empty from '@/components/Empty.js';
import { useAppStore } from '@/store/index.js';
import { formatDate } from '@/utils/format.js';

export default function GuildHall() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const guilds = useAppStore((state) => state.guilds);
  const fetchGuilds = useAppStore((state) => state.fetchGuilds);
  const createGuild = useAppStore((state) => state.createGuild);
  const applyToGuild = useAppStore((state) => state.applyToGuild);
  const logout = useAppStore((state) => state.logout);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildAnnouncement, setNewGuildAnnouncement] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchGuilds();
  }, [fetchGuilds]);

  const filteredGuilds = guilds.filter((guild) =>
    guild.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsCreating(true);
    const success = await createGuild(newGuildName, newGuildAnnouncement, user.id);
    setIsCreating(false);
    
    if (success) {
      setIsCreateModalOpen(false);
      setNewGuildName('');
      setNewGuildAnnouncement('');
      fetchGuilds();
    }
  };

  const handleApply = async (guildId: string) => {
    if (!user) return;
    await applyToGuild(guildId, user.id);
  };

  const handleEnterGuild = (guildId: string) => {
    navigate(`/guild/${guildId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-game-bg">
      <header className="glass-effect border-b border-game-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary-500" />
              <h1 className="text-2xl font-display font-bold text-game-text">公会大厅</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-game-text font-medium">{user?.username}</p>
                <p className="text-sm text-game-subtext">Lv.{user?.level}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-game-subtext" />
              <Input
                placeholder="搜索公会..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {!user?.guildId && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              创建公会
            </Button>
          )}
        </div>

        {user?.guildId && (
          <Card className="mb-8 glass-effect animate-fade-in">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-gold-500 rounded-xl flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-game-text">你已加入公会</h3>
                  <p className="text-game-subtext">点击下方按钮进入公会管理页面</p>
                </div>
              </div>
              <Button onClick={() => handleEnterGuild(user.guildId!)} size="lg">
                <DoorOpen className="w-5 h-5 mr-2" />
                进入公会
              </Button>
            </CardContent>
          </Card>
        )}

        {filteredGuilds.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuilds.map((guild, index) => (
              <Card
                key={guild.id}
                hoverable
                glow
                className="glass-effect animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-gold-400" />
                      {guild.name}
                    </CardTitle>
                    <Badge variant="gold">Lv.{guild.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-game-subtext text-sm line-clamp-2">{guild.announcement}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-game-subtext">
                      <Users className="w-4 h-4" />
                      <span>{guild.memberCount}/{guild.maxMembers}</span>
                    </div>
                    <div className="text-game-subtext">
                      资金: <span className="text-gold-400 font-medium">{guild.funds}</span>
                    </div>
                  </div>

                  <div className="text-xs text-game-subtext">
                    创建于 {formatDate(guild.createdAt)}
                  </div>

                  <div className="flex gap-2">
                    {user?.guildId === guild.id ? (
                      <Button className="flex-1" onClick={() => handleEnterGuild(guild.id)}>
                        <DoorOpen className="w-4 h-4 mr-2" />
                        进入
                      </Button>
                    ) : user?.guildId ? (
                      <Button className="flex-1" disabled>
                        已加入其他公会
                      </Button>
                    ) : (
                      <Button className="flex-1" variant="secondary" onClick={() => handleApply(guild.id)}>
                        申请加入
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="创建公会"
      >
        <form onSubmit={handleCreateGuild} className="space-y-4">
          <Input
            label="公会名称"
            value={newGuildName}
            onChange={(e) => setNewGuildName(e.target.value)}
            placeholder="请输入公会名称"
            required
          />
          <Textarea
            label="公会公告"
            value={newGuildAnnouncement}
            onChange={(e) => setNewGuildAnnouncement(e.target.value)}
            placeholder="请输入公会公告"
            rows={4}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsCreateModalOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" className="flex-1" isLoading={isCreating}>
              <Plus className="w-4 h-4 mr-2" />
              创建
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
