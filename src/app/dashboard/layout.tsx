"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { BrainCircuit } from "@/components/icons";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, History, LogOut, User } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (user?.isAnonymous) {
      // Clear local storage for guest
      // In a real app, you might want to be more specific about what you clear
      localStorage.clear();
    }
    
    await signOut(auth);
    toast({ title: "Logged out", description: "You have been successfully logged out." });
    router.push('/');
  }

  const getAvatarFallback = () => {
    if (user?.isAnonymous) return "G";
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  }
  
  const getUserName = () => {
    if (user?.isAnonymous) return "Guest User";
    return user?.displayName || user?.email || "User";
  }

  const getUserEmail = () => {
    if (user?.isAnonymous) return "guest@example.com";
    return user?.email || "";
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenuButton asChild className="h-auto justify-center p-0 hover:bg-transparent" size="lg">
            <Link href="/dashboard" className="flex items-center gap-2">
              <BrainCircuit className="size-7 text-primary" />
              <span className="text-lg font-semibold text-foreground">QuizAI</span>
            </Link>
          </SidebarMenuButton>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard"}
                tooltip="Dashboard"
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/dashboard/history")}
                tooltip="Quiz History"
              >
                <Link href="/dashboard/history">
                  <History />
                  <span>Quiz History</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto w-full justify-start gap-2 p-2">
                     <Avatar className="h-9 w-9">
                        {user?.photoURL ? <AvatarImage src={user.photoURL} alt="User avatar" /> :
                         (userAvatar && !user?.isAnonymous && <AvatarImage src={userAvatar.imageUrl} alt={userAvatar.description} data-ai-hint={userAvatar.imageHint} />)
                        }
                        <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left group-data-[collapsible=icon]:hidden truncate">
                        <p className="text-sm font-medium truncate">{getUserName()}</p>
                        <p className="text-xs text-muted-foreground truncate">{getUserEmail()}</p>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col flex-1 min-h-dvh">
         <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:h-[60px] md:px-6 sticky top-0 z-30">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
                <h1 className="font-semibold text-lg">
                    {pathname.includes('history') ? 'Quiz History' : 'Dashboard'}
                </h1>
            </div>
            <ThemeToggle />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-secondary/50">
            {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
