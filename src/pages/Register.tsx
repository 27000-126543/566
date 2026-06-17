import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Shield, Sword, Wand2, Target, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button.js';
import { Input } from '@/components/ui/Input.js';
import { Select } from '@/components/ui/Select.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { useAppStore } from '@/store/index.js';
import type { Profession } from '../../shared/types.js';
import { PROFESSION_NAMES } from '../../shared/types.js';

const professionOptions = Object.entries(PROFESSION_NAMES).map(([value, label]) => ({ value, label }));

const professionIcons: Record<Profession, React.ReactNode> = {
  warrior: <Sword className="w-5 h-5" />,
  mage: <Wand2 className="w-5 h-5" />,
  archer: <Target className="w-5 h-5" />,
  priest: <Heart className="w-5 h-5" />,
};

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profession, setProfession] = useState<Profession>('warrior');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const register = useAppStore((state) => state.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }
    
    setIsLoading(true);
    
    const success = await register(username, password, profession);
    setIsLoading(false);
    
    if (success) {
      navigate('/hall');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-game-bg via-primary-950/50 to-game-bg" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-primary-500" />
            <h1 className="text-4xl font-display font-bold text-game-text bg-gradient-to-r from-primary-400 to-gold-400 bg-clip-text text-transparent">
              游戏公会管理系统
            </h1>
          </div>
          <p className="text-game-subtext">创建你的冒险者账户</p>
        </div>

        <Card className="glass-effect animate-fade-in">
          <CardHeader>
            <CardTitle className="text-center">注册账户</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="用户名"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
                autoComplete="username"
              />
              <Input
                label="密码"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（至少6位）"
                required
                autoComplete="new-password"
              />
              <Input
                label="确认密码"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                required
                autoComplete="new-password"
                error={error}
              />
              <Select
                label="选择职业"
                value={profession}
                onChange={(e) => setProfession(e.target.value as Profession)}
                options={professionOptions}
                required
              />

              <div className="grid grid-cols-4 gap-2 pt-2">
                {Object.entries(professionIcons).map(([key, icon]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setProfession(key as Profession)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1 ${
                      profession === key
                        ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                        : 'border-game-border bg-game-card text-game-subtext hover:border-primary-500/50'
                    }`}
                  >
                    {icon}
                    <span className="text-xs">{PROFESSION_NAMES[key as Profession]}</span>
                  </button>
                ))}
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                <UserPlus className="w-5 h-5 mr-2" />
                注册
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-game-subtext">
                已有账户？
                <Link to="/login" className="text-primary-400 hover:text-primary-300 ml-1 font-medium">
                  立即登录
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
