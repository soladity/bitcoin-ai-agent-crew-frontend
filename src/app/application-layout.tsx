"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Boxes, Menu, X, LogOut, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreadList } from "@/components/threads/thread-list";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface ApplicationLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { id: "chat", name: "Chat", href: "/chat", icon: MessageSquare },
  { id: "agents", name: "Agents", href: "/agents", icon: Users },
  { id: "daos", name: "DAOs", href: "/daos", icon: Boxes },
  {
    id: "profile",
    name: "Profile",
    href: "/profile",
    icon: ({ className }: { className?: string }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [leftPanelOpen, setLeftPanelOpen] = React.useState(false);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(false);
  const [hasUser, setHasUser] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setLeftPanelOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setHasUser(!!user);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasUser(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Mobile Navigation Bar */}
      <div className="md:hidden h-14 px-2 flex items-center justify-between border-b border-zinc-800/50 bg-zinc-900">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className="text-zinc-400"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/logos/aibtcdev-avatar-1000px.png"
            alt="AIBTCDEV"
            width={20}
            height={20}
          />
          <Image
            src="/logos/aibtcdev-primary-logo-white-wide-1000px.png"
            alt="AIBTCDEV"
            width={150}
            height={300}
          />
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 flex min-w-0 max-h-[100vh] overflow-hidden">
        {/* Left Sidebar */}
        <aside
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
          className={cn(
            "border-r border-zinc-800/50 flex flex-col transition-all duration-300 ease-in-out",
            "fixed md:relative inset-y-0 left-0 z-20",
            isMobile
              ? "bg-zinc-900 w-[min(100vw,320px)]"
              : "bg-zinc-900/50 w-16",
            isMobile ? (leftPanelOpen ? "flex" : "hidden") : "flex",
            !isMobile && isHovered && "w-64"
          )}
        >
          {/* Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800/50">
            <div className="flex items-center gap-2 overflow-hidden">
              <Image
                src="/logos/aibtcdev-avatar-1000px.png"
                alt="AIBTCDEV"
                width={24}
                height={24}
                className="flex-shrink-0"
              />
              <div
                className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  !isHovered && !isMobile ? "w-0" : "w-auto"
                )}
              >
                <Image
                  src="/logos/aibtcdev-primary-logo-white-wide-1000px.png"
                  alt="AIBTCDEV"
                  width={150}
                  height={300}
                />
              </div>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLeftPanelOpen(false)}
                className="text-zinc-400 md:hidden h-8 w-8 hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-col h-[calc(100vh-3.5rem)]">
            <div
              className={cn(
                "flex-1 overflow-y-auto transition-opacity duration-300",
                (!isHovered && !isMobile) || (!leftPanelOpen && isMobile)
                  ? "opacity-0 invisible"
                  : "opacity-100 visible"
              )}
            >
              <ThreadList setLeftPanelOpen={setLeftPanelOpen} />
            </div>
            <nav className="flex-none p-2" id="step4">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      id={item.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-zinc-800/50 text-white"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span
                        className={cn(
                          "transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
                          !isHovered && !isMobile ? "w-0" : "w-auto"
                        )}
                      >
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Sign Out Button */}
            {hasUser && (
              <div className="flex-none p-2">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span
                    className={cn(
                      "transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
                      !isHovered && !isMobile ? "w-0" : "w-auto"
                    )}
                  >
                    Sign Out
                  </span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 relative">
          <ScrollArea className="h-screen w-full">{children}</ScrollArea>
        </main>

        {/* Overlay for mobile when panels are open */}
        <div
          className={cn(
            "fixed inset-0 bg-black/80 md:hidden transition-opacity z-10",
            leftPanelOpen || rightPanelOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          )}
          onClick={() => {
            setLeftPanelOpen(false);
            setRightPanelOpen(false);
          }}
        />
      </div>
    </div>
  );
}
