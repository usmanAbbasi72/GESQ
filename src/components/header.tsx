'use client';
import Link from 'next/link';
import { Leaf, LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">GreenPass</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {isAuthenticated && user && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
          )}
          {isAuthenticated ? (
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut />
              Logout
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/admin">
                <LogIn />
                Admin Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
