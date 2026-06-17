import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sword, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button.js';
import { Input } from '@/components/ui/Input.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { useAppStore } from '@/store/index.js';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAppStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(username, password);
    setIsLoading(false);
    
    if (success) {
      navigate('/hall');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-game-bg via-primary-950/50 to-game-bg" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-primary-500" />
            <h1 className="text-4xl font-display font-bold text-game-text bg-gradient-to-r from-primary-400 to-gold-400 bg-clip-text text-transparent">
              游戏公会管理系统
            </h1>
          </div>
          <p className="text-game-subtext">欢迎回来，勇士！</p>
        </div>

        <Card className="glass-effect animate-fade-in">
          <CardHeader>
            <CardTitle className="text-center">登录账户</CardTitle>
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
                placeholder="请输入密码"
                required
                autoComplete="current-password"
              />
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                <Sword className="w-5 h-5 mr-2" />
                登录
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-game-subtext">
                还没有账户？
                <Link to="/register" className="text-primary-400 hover:text-primary-300 ml-1 font-medium">
                  立即注册
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center gap-8 text-game-subtext">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-400" />
            <span className="text-sm">公会管理</span>
          </div>
          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-gold-400" />
            <span className="text-sm">任务系统</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-400" />
            <span className="text-sm">仓库管理</span>
          </div>
        </div>
      </div>
    </div>
  );
}
