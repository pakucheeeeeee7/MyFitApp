import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Menu, 
  Dumbbell, 
  BarChart3, 
  User, 
  Scale, 
  LogOut,
  Home
} from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const displayName = profile?.username || user?.email || 'ユーザー';

  const navigationItems = [
    { name: 'ダッシュボード', href: '/dashboard', icon: Home },
    { name: 'ワークアウト', href: '/workout', icon: Dumbbell },
    { name: '体重記録', href: '/body-metrics', icon: Scale },
    { name: '高度分析', href: '/analytics', icon: BarChart3 },
    { name: 'プロフィール', href: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    setIsLogoutDialogOpen(false);
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">MyFit</h1>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.name}</span>
                </Button>
              );
            })}
          </nav>

          {/* デスクトップユーザーメニュー */}
          <div className="hidden md:flex items-center space-x-3">
            <span className="text-sm text-gray-600 hidden lg:inline">
              {displayName}さん
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsLogoutDialogOpen(true)}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline ml-2">ログアウト</span>
            </Button>
            <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ログアウト確認</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-600">
                    本当にログアウトしますか？
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsLogoutDialogOpen(false)}
                  >
                    キャンセル
                  </Button>
                  <Button onClick={handleLogout}>
                    ログアウト
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* モバイルメニュートリガー */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  {/* ユーザー情報 */}
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h2 className="text-lg font-semibold">MyFit</h2>
                    <p className="text-sm text-gray-600">
                      おかえりなさい、{displayName}さん
                    </p>
                  </div>

                  {/* ナビゲーションメニュー */}
                  <nav className="flex-1 space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.name}
                          onClick={() => handleNavigation(item.href)}
                          variant={isActive(item.href) ? 'default' : 'ghost'}
                          className="w-full justify-start gap-3 h-12"
                        >
                          <Icon className="h-5 w-5" />
                          {item.name}
                        </Button>
                      );
                    })}
                  </nav>

                  {/* ログアウトボタン */}
                  <div className="border-t border-gray-200 pt-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => setIsLogoutDialogOpen(true)}
                    >
                      <LogOut className="h-5 w-5" />
                      ログアウト
                    </Button>
                    <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>ログアウト確認</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-gray-600">
                            本当にログアウトしますか？
                          </p>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsLogoutDialogOpen(false)}
                          >
                            キャンセル
                          </Button>
                          <Button onClick={handleLogout}>
                            ログアウト
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
