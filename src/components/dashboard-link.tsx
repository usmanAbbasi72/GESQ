"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export function DashboardLink() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button asChild variant="outline" className="w-full">
      <Link href="/admin/dashboard">
        <LayoutDashboard className="mr-2 h-4 w-4" />
        Go to Dashboard
      </Link>
    </Button>
  );
}
