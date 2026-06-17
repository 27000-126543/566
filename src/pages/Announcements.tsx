import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Megaphone, Plus, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button.js';
import { Input } from '@/components/ui/Input.js';
import { Textarea } from '@/components/ui/Textarea.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Badge } from '@/components/ui/Badge.js';
import { Modal } from '@/components/ui/Modal.js';
import Empty from '@/components/Empty.js';
import { useAppStore } from '@/store/index.js';
import { formatDateTime } from '@/utils/format.js';

export default function Announcements() {
  const { id } = useParams<{ id: string }>();
  const user = useAppStore((state) => state.user);
  const announcements = useAppStore((state) => state.announcements);
  const members = useAppStore((state) => state.members);
  const fetchAnnouncements = useAppStore((state) => state.fetchAnnouncements);
  const createAnnouncement = useAppStore((state) => state.createAnnouncement);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const canCreate = user?.guildRole === 'leader';

  useEffect(() => {
    if (id) {
      fetchAnnouncements(id);
    }
  }, [id, fetchAnnouncements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    setIsCreating(true);
    const success = await createAnnouncement(id, {
      title: formData.title,
      content: formData.content,
      authorId: user.id,
    });
    setIsCreating(false);

    if (success) {
      setIsCreateModalOpen(false);
      setFormData({ title: '', content: '' });
      fetchAnnouncements(id);
    }
  };

  const getAuthorName = (authorId: string) => {
    const author = members.find((m) => m.id === authorId);
    return author?.username || '未知用户';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-game-text">公告管理</h1>
          <p className="text-game-subtext">发布和查看公会公告</p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            发布公告
          </Button>
        )}
      </div>

      {announcements.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement, index) => (
            <Card
              key={announcement.id}
              className="glass-effect animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-game-subtext mt-1">
                        <User className="w-4 h-4" />
                        <span>{getAuthorName(announcement.authorId)}</span>
                        <span>·</span>
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(announcement.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge variant="danger" className="self-start">
                      最新
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-game-text whitespace-pre-wrap leading-relaxed">
                    {announcement.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="发布公告"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="公告标题"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="请输入公告标题"
            required
          />
          <Textarea
            label="公告内容"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="请输入公告内容"
            rows={8}
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
              发布
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
