
import { Header } from '@/components/header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarBrand, SidebarContent } from '@/components/ui/sidebar';
import { AuthProvider } from '@/hooks/use-auth';
import {
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Book, Compass, Trophy, Search, GraduationCap, LayoutDashboard, Settings } from 'lucide-react';

export default function LearningPathsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Sidebar>
            <SidebarBrand />
            <SidebarContent>
                <ul className="flex w-full min-w-0 flex-col gap-1">
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Dashboard">
                            <Link href="/dashboard">
                                <LayoutDashboard />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Competitions">
                            <Link href="/competitions">
                                <Trophy />
                                <span>Competitions</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Learn">
                            <Link href="/learn">
                                <GraduationCap />
                                <span>Learn</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive tooltip="Learning Paths">
                            <Link href="/learning-paths">
                                <Compass />
                                <span>Learning Paths</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Resources">
                            <Link href="/resources">
                                <Book />
                                <span>Resources</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Settings">
                            <Link href="/settings">
                                <Settings />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </ul>
            </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="p-4 lg:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
