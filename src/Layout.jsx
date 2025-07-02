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
  Flame,
  LogIn,
  BookUser,
  Bell,
  Settings
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
  const [unreadCount, setUnreadCount] = useState(3); // Mock unread messages

  const navigationItems = [
    { 
      key: "dashboard", 
      icon: Home, 
      pageName: "Dashboard",
      description: "Overview & analytics"
    },
    { 
      key: "feeds", 
      icon: Flame, 
      pageName: "Feeds",
      description: "Recent activity",
      badge: "New"
    },
    { 
      key: "marketplace", 
      icon: ShoppingBag, 
      pageName: "Marketplace",
      description: "Browse listings"
    },
    { 
      key: "favorites", 
      icon: Heart, 
      pageName: "Favorites",
      description: "Saved items"
    },
    { 
      key: "messages", 
      icon: MessageSquare, 
      pageName: "Messages",
      description: "Chat & inquiries",
      count: unreadCount
    },
    { 
      key: "forum", 
      title: "Forum", 
      icon: MessageCircleQuestion, 
      pageName: "Forum",
      description: "Community discussions"
    },
    { 
      key: "my_profile", 
      title: "Profile", 
      icon: UserIcon, 
      pageName: "My_profile",
      description: "Account settings"
    },
    { 
      key: "contact", 
      title: "Contact", 
      icon: BookUser, 
      pageName: "Contact",
      description: "Get support"
    },
  ];

  const handleLogout = async () => {
    await User.logout();
    window.location.href = "/";
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)'
      }}>
        <Sidebar className="clay-nav border-0 w-48 md:w-56">
          <SidebarHeader className="clay-p-3 border-0">
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 group">
              <div className="clay-card w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Leaf className="w-4 h-4 text-white drop-shadow-sm" />
              </div>
              <div>
                <h2 className="clay-text-title text-sm font-bold text-gray-800">Fresh Trade</h2>
                <p className="text-xs text-green-600 font-medium tracking-wide">Local Exchange</p>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="clay-p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="clay-text-soft text-xs font-bold uppercase tracking-wider px-2 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === createPageUrl(item.pageName);
                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton 
                          asChild 
                          className={`clay-nav-item group ${isActive ? 'active' : ''} relative overflow-hidden`}
                        >
                          <Link to={createPageUrl(item.pageName)} className="flex items-center gap-2 px-2 py-2">
                            <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-xs">{t(item.key) || item.title}</span>
                              {item.description && (
                                <p className="text-xs clay-text-soft hidden md:block">{item.description}</p>
                              )}
                            </div>
                            {item.count && (
                              <div className="clay-badge clay-badge-green text-xs px-1 py-0.5 min-w-[16px] h-4 flex items-center justify-center">
                                {item.count}
                              </div>
                            )}
                            {item.badge && (
                              <div className="clay-badge clay-badge-purple text-xs px-1 py-0.5">
                                {item.badge}
                              </div>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="clay-text-soft text-xs font-bold uppercase tracking-wider px-2 py-2">
                Quick Actions
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="clay-nav-item group">
                      <Link to={createPageUrl("CreateListing")} className="flex items-center gap-2 px-2 py-2">
                        <div className="clay-button-primary p-1 rounded-lg">
                          <Plus className="w-3 h-3 text-white" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-xs">{t('create_listing')}</span>
                          <p className="text-xs clay-text-soft hidden md:block">Share produce</p>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="clay-p-2 space-y-2 border-0">
            {/* User Profile Card */}
            <div className="clay-card p-2 bg-gradient-to-br from-white/60 to-white/40">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6 clay-card">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white font-semibold text-xs">
                    JF
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs text-gray-800 truncate">John Farmer</p>
                  <p className="text-xs clay-text-soft truncate hidden md:block">farmer@example.com</p>
                </div>
                <button className="clay-button p-1 rounded-lg hover:bg-gray-100">
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <LanguageSelector />
              <ThemeToggle />
              <button 
                onClick={handleLogout}
                className="clay-button flex-1 flex items-center justify-center gap-1 text-red-600 hover:bg-red-50 text-xs"
              >
                <LogOut className="w-3 h-3"/>
                <span className="font-medium hidden md:inline">{t('sign_out')}</span>
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
            
            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="clay-text-soft text-xs font-bold uppercase tracking-wider px-3 py-3">
                Quick Actions
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="clay-nav-item group">
                      <Link to={createPageUrl("CreateListing")} className="flex items-center gap-3 px-4 py-3">
                        <div className="clay-button-primary p-2 rounded-xl">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-sm">{t('create_listing')}</span>
                          <p className="text-xs clay-text-soft">Share your produce</p>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
           

          <SidebarFooter className="clay-p-4 space-y-4 border-0">
            {/* User Profile Card */}
            <div className="clay-card p-4 bg-gradient-to-br from-white/60 to-white/40">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 clay-card">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white font-semibold">
                    JF
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">John Farmer</p>
                  <p className="text-xs clay-text-soft truncate">farmer@example.com</p>
                </div>
                <button className="clay-button p-2 rounded-xl hover:bg-gray-100">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
              <button 
                onClick={handleLogout}
                className="clay-button flex-1 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4"/>
                <span className="font-semibold text-sm">{t('sign_out')}</span>
              </button>
            </div>
          </SidebarFooter>
      

        <main className="flex-1 flex flex-col min-w-0 bg-transparent">
          {/* Mobile Header */}
          <header className="clay-floating mx-2 mt-2 px-3 py-2 md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="clay-button p-1 rounded-lg" />
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Leaf className="w-3 h-3 text-white" />
                  </div>
                  <h1 className="font-bold text-sm text-gray-800">Fresh Trade</h1>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="clay-button p-1 rounded-lg relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{unreadCount}</span>
                    </div>
                  )}
                </button>
                <LanguageSelector />
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-2 md:p-4">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)'
    }}>
      {/* Public Header */}
      <header className="clay-floating m-2 px-3 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="clay-text-title text-sm font-bold">Fresh Trade</span>
              <p className="text-xs text-green-600 font-medium">Local Exchange</p>
            </div>
          </div>
          
          <nav className="hidden sm:flex items-center gap-4">
            <Link to="/marketplace" className="clay-text-soft hover:text-gray-700 font-medium transition-colors text-sm">
              Marketplace
            </Link>
            <Link to="/contact" className="clay-text-soft hover:text-gray-700 font-medium transition-colors text-sm">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      
      <div className="px-2">
        {children}
      </div>
    </div>
  );
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
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)'
      }}>
        <div className="clay-card p-4 text-center">
          <div className="clay-animate-pulse w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div className="clay-loading h-1 w-20 mx-auto"></div>
        </div>
      </div>
    );
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