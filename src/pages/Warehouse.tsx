import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Package, Plus, Search, UserCheck, UserX, Gift, User } from 'lucide-react';
import { Button } from '@/components/ui/Button.js';
import { Input } from '@/components/ui/Input.js';
import { Select } from '@/components/ui/Select.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Badge } from '@/components/ui/Badge.js';
import { Modal } from '@/components/ui/Modal.js';
import Empty from '@/components/Empty.js';
import { useAppStore } from '@/store/index.js';
import { formatDate } from '@/utils/format.js';
import { RARITY_NAMES, APPLICATION_STATUS_NAMES } from '../../shared/types.js';
import type { ItemRarity } from '../../shared/types.js';

const rarityColors: Record<ItemRarity, string> = {
  common: 'text-rarity-common',
  uncommon: 'text-rarity-uncommon',
  rare: 'text-rarity-rare',
  epic: 'text-rarity-epic',
  legendary: 'text-rarity-legendary',
};

const rarityVariants: Record<ItemRarity, 'default' | 'success' | 'info' | 'gold' | 'warning'> = {
  common: 'default',
  uncommon: 'success',
  rare: 'info',
  epic: 'gold',
  legendary: 'warning',
};

const rarityOptions = Object.entries(RARITY_NAMES).map(([value, label]) => ({ value, label }));

export default function Warehouse() {
  const { id } = useParams<{ id: string }>();
  const user = useAppStore((state) => state.user);
  const warehouseItems = useAppStore((state) => state.warehouseItems);
  const itemApplications = useAppStore((state) => state.itemApplications);
  const members = useAppStore((state) => state.members);
  const fetchWarehouseItems = useAppStore((state) => state.fetchWarehouseItems);
  const fetchItemApplications = useAppStore((state) => state.fetchItemApplications);
  const contributeItem = useAppStore((state) => state.contributeItem);
  const applyForItem = useAppStore((state) => state.applyForItem);
  const approveItemApplication = useAppStore((state) => state.approveItemApplication);
  const rejectItemApplication = useAppStore((state) => state.rejectItemApplication);

  const [activeTab, setActiveTab] = useState<'items' | 'applications'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<ItemRarity | 'all'>('all');
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof warehouseItems[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contributeForm, setContributeForm] = useState({
    name: '',
    quantity: 1,
    rarity: 'common' as ItemRarity,
  });
  const [applyQuantity, setApplyQuantity] = useState(1);

  const canReview = user?.guildRole === 'leader' || user?.guildRole === 'vice_leader';

  useEffect(() => {
    if (id) {
      fetchWarehouseItems(id);
      fetchItemApplications(id);
    }
  }, [id, fetchWarehouseItems, fetchItemApplications]);

  const filteredItems = warehouseItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = rarityFilter === 'all' || item.rarity === rarityFilter;
    return matchesSearch && matchesRarity;
  });

  const pendingApplications = itemApplications.filter((app) => app.status === 'pending');

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    setIsSubmitting(true);
    const success = await contributeItem(id, {
      name: contributeForm.name,
      quantity: contributeForm.quantity,
      rarity: contributeForm.rarity,
      contributorId: user.id,
    });
    setIsSubmitting(false);

    if (success) {
      setIsContributeModalOpen(false);
      setContributeForm({ name: '', quantity: 1, rarity: 'common' });
      fetchWarehouseItems(id);
    }
  };

  const handleApply = async () => {
    if (!id || !user || !selectedItem) return;

    setIsSubmitting(true);
    const success = await applyForItem(id, {
      itemId: selectedItem.id,
      quantity: applyQuantity,
      userId: user.id,
    });
    setIsSubmitting(false);

    if (success) {
      setIsApplyModalOpen(false);
      setSelectedItem(null);
      setApplyQuantity(1);
      fetchItemApplications(id);
    }
  };

  const handleApprove = async (appId: string) => {
    if (!user) return;
    const success = await approveItemApplication(appId, user.id);
    if (success && id) {
      fetchWarehouseItems(id);
      fetchItemApplications(id);
    }
  };

  const handleReject = async (appId: string) => {
    if (!user) return;
    const success = await rejectItemApplication(appId, user.id);
    if (success && id) {
      fetchItemApplications(id);
    }
  };

  const openApplyModal = (item: typeof warehouseItems[0]) => {
    setSelectedItem(item);
    setApplyQuantity(1);
    setIsApplyModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-game-text">仓库管理</h1>
          <p className="text-game-subtext">管理公会仓库物品和申领</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'items' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('items')}
          >
            <Package className="w-4 h-4 mr-2" />
            物品列表
          </Button>
          <Button
            variant={activeTab === 'applications' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('applications')}
          >
            <Gift className="w-4 h-4 mr-2" />
            申领审批
            {pendingApplications.length > 0 && (
              <Badge className="ml-2" variant="danger">{pendingApplications.length}</Badge>
            )}
          </Button>
        </div>
      </div>

      {activeTab === 'items' ? (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-game-subtext" />
              <Input
                placeholder="搜索物品..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value as ItemRarity | 'all')}
              options={[
                { value: 'all', label: '全部稀有度' },
                ...rarityOptions,
              ]}
              className="w-full sm:w-40"
            />
            <Button onClick={() => setIsContributeModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              贡献物品
            </Button>
          </div>

          {filteredItems.length === 0 ? (
            <Empty />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item, index) => (
                <Card key={item.id} className="glass-effect animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-game-border flex items-center justify-center ${rarityColors[item.rarity]}`}>
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className={`font-bold ${rarityColors[item.rarity]}`}>{item.name}</h3>
                          <Badge variant={rarityVariants[item.rarity]}>
                            {RARITY_NAMES[item.rarity]}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="info">x{item.quantity}</Badge>
                    </div>
                    <div className="text-xs text-game-subtext mb-3">
                      贡献于 {formatDate(item.createdAt)}
                    </div>
                    {item.quantity > 0 && (
                      <Button
                        variant="secondary"
                        className="w-full"
                        size="sm"
                        onClick={() => openApplyModal(item)}
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        申请领取
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>物品申领审批</CardTitle>
          </CardHeader>
          <CardContent>
            {itemApplications.length === 0 ? (
              <Empty />
            ) : (
              <div className="space-y-4">
                {itemApplications.map((app) => {
                  const item = warehouseItems.find((i) => i.id === app.itemId);
                  const applicant = members.find((m) => m.id === app.userId);
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 bg-game-card rounded-lg border border-game-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-game-border flex items-center justify-center ${item ? rarityColors[item.rarity] : ''}`}>
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${item ? rarityColors[item.rarity] : 'text-game-text'}`}>
                              {item?.name || '未知物品'}
                            </span>
                            <Badge variant="info">x{app.quantity}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-game-subtext">
                            <User className="w-4 h-4" />
                            <span>{applicant?.username || '未知用户'}</span>
                            <span>·</span>
                            <span>{formatDate(app.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            app.status === 'approved' ? 'success' :
                            app.status === 'rejected' ? 'danger' : 'warning'
                          }
                        >
                          {APPLICATION_STATUS_NAMES[app.status]}
                        </Badge>
                        {canReview && app.status === 'pending' && (
                          <div className="flex gap-2 ml-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(app.id)}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              通过
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(app.id)}
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              拒绝
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        title="贡献物品"
      >
        <form onSubmit={handleContribute} className="space-y-4">
          <Input
            label="物品名称"
            value={contributeForm.name}
            onChange={(e) => setContributeForm({ ...contributeForm, name: e.target.value })}
            placeholder="请输入物品名称"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="数量"
              type="number"
              min="1"
              value={contributeForm.quantity}
              onChange={(e) => setContributeForm({ ...contributeForm, quantity: parseInt(e.target.value) || 1 })}
              required
            />
            <Select
              label="稀有度"
              value={contributeForm.rarity}
              onChange={(e) => setContributeForm({ ...contributeForm, rarity: e.target.value as ItemRarity })}
              options={rarityOptions}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsContributeModalOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              贡献
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="申请领取物品"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-game-border rounded-lg">
              <div className={`w-12 h-12 rounded-lg bg-game-card flex items-center justify-center ${rarityColors[selectedItem.rarity]}`}>
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`font-bold ${rarityColors[selectedItem.rarity]}`}>{selectedItem.name}</h3>
                <p className="text-sm text-game-subtext">
                  库存: {selectedItem.quantity} · {RARITY_NAMES[selectedItem.rarity]}
                </p>
              </div>
            </div>
            <Input
              label="申请数量"
              type="number"
              min="1"
              max={selectedItem.quantity}
              value={applyQuantity}
              onChange={(e) => setApplyQuantity(Math.min(selectedItem.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
              required
            />
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setIsApplyModalOpen(false)}
              >
                取消
              </Button>
              <Button className="flex-1" isLoading={isSubmitting} onClick={handleApply}>
                <Gift className="w-4 h-4 mr-2" />
                提交申请
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
