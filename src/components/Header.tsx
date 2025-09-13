import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              SubManager
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={cn(
                "text-base font-medium transition-all duration-300 hover:text-primary relative",
                isActive('/') 
                  ? 'text-primary after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full' 
                  : 'text-muted-foreground hover:after:absolute hover:after:bottom-[-8px] hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-primary/50 hover:after:rounded-full'
              )}
            >
              Plans
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={cn(
                  "text-base font-medium transition-all duration-300 hover:text-primary relative",
                  isActive('/dashboard') 
                    ? 'text-primary after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full' 
                    : 'text-muted-foreground hover:after:absolute hover:after:bottom-[-8px] hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-primary/50 hover:after:rounded-full'
                )}
              >
                Dashboard
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={cn(
                  "text-base font-medium transition-all duration-300 hover:text-primary relative",
                  isActive('/admin') 
                    ? 'text-primary after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full' 
                    : 'text-muted-foreground hover:after:absolute hover:after:bottom-[-8px] hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-primary/50 hover:after:rounded-full'
                )}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-12 w-12 rounded-full bg-gradient-primary/10 hover:bg-gradient-primary/20">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuItem asChild>
                  <div className="flex flex-col p-2">
                    <span className="font-semibold text-base">{user.name}</span>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center p-2 cursor-pointer">
                    <Settings className="mr-3 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive p-2 cursor-pointer">
                  <LogOut className="mr-3 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" asChild className="text-base">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="default" size="lg" className="text-base">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;