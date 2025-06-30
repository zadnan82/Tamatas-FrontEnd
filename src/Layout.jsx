import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "@/entities/all";
import { createPageUrl } from "@/utils";
import { 
  Home, 
  ShoppingBag, 
  MessageSquare, 
  User as UserIcon,
  Plus,
  Leaf,
  Heart,
  MessageCircleQuestion,
  LogOut,
  Flame, // Added for Feeds
  LogIn,
  BookUser
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "./components/contexts/ThemeProvider";
import { LanguageProvider, useLanguage } from "./components/contexts/LanguageProvider";
import ThemeToggle from "./components/shared/ThemeToggle";
import LanguageSelector from "./components/shared/LanguageSelector";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";

const AppLayout = ({ children }) => {
  const location = useLocation();
  const { t } = useLanguage();

  const navigationItems = [
    { key: "dashboard", icon: Home, pageName: "Dashboard" },
    { key: "feeds", icon: Flame, pageName: "Feeds" },
    { key: "marketplace", icon: ShoppingBag, pageName: "Marketplace" },
    { key: "favorites", icon: Heart, pageName: "Favorites" },
    { key: "messages", icon: MessageSquare, pageName: "Messages" },
    { key: "forum", title: "Forum", icon: MessageCircleQuestion, pageName: "Forum" },
    { key: "my_profile", title: "Profile", icon: UserIcon, pageName: "My_profile" },
    { key: "contact", title: "Contact", icon: BookUser, pageName: "Contact" },
  ];

  const handleLogout = async () => {
    await User.logout();
    window.location.href = "/";
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-black dark:to-gray-800 text-gray-800 dark:text-gray-200">
        <Sidebar className="border-r border-green-100 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-800">
          <SidebarHeader className="border-b border-green-100 dark:border-gray-800 p-6">
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900 dark:text-white">Fresh Trade</h2>
                <p className="text-xs text-green-600 font-medium">Local Food Exchange</p>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton 
                        asChild 
                        className={`rounded-xl transition-all duration-200 hover:bg-green-50 hover:text-green-700 dark:hover:bg-gray-800 dark:hover:text-green-400 ${
                          location.pathname === createPageUrl(item.pageName)
                            ? 'bg-green-100 text-green-700 shadow-sm dark:bg-green-900/50 dark:text-green-300' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <Link to={createPageUrl(item.pageName)} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className={`w-5 h-5`} />
                          <span className="font-medium">{t(item.key) || item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
             <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-3">
                Quick Actions
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="rounded-xl hover:bg-green-50 text-gray-600 hover:text-green-700 dark:hover:bg-gray-800 dark:hover:text-green-400">
                      <Link to={createPageUrl("CreateListing")} className="flex items-center gap-3 px-4 py-3">
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">{t('create_listing')}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-green-100 dark:border-gray-800 p-4 space-y-4">
             <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400">
                <LogOut className="w-5 h-5 mr-3"/>
                <span className="font-medium">{t('sign_out')}</span>
            </Button>
             <div className="flex items-center justify-center gap-2">
                <LanguageSelector />
                <ThemeToggle />
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 dark:bg-gray-900/80 dark:border-gray-800 px-6 py-4 md:hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="hover:bg-green-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors duration-200" />
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fresh Trade</h1>
                </div>
                <div className="flex items-center gap-2">
                    <LanguageSelector />
                    <ThemeToggle />
                </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

const PublicLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* You could add a simple public header here if needed */}
            {children}
        </div>
    )
}

export default function Layout({ children, pageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [location.pathname]);

  if (loading) {
      return <div className="h-screen w-screen flex items-center justify-center"><Leaf className="w-12 h-12 text-green-500 animate-spin"/></div>;
  }
  
  const isPublicPage = location.pathname === createPageUrl("Home") || location.pathname === "/";
  
  return (
    <ThemeProvider>
      <LanguageProvider>
          {isPublicPage && !user ? <PublicLayout>{children}</PublicLayout> : <AppLayout>{children}</AppLayout>}
      </LanguageProvider>
    </ThemeProvider>
  );
}