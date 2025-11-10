"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppName } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, Map, Menu, Vote } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/map", label: "Map", icon: Map },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setSheetOpen] = useState(false);

  const NavLink = ({ href, label, icon: Icon }: typeof navLinks[0]) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        pathname === href
          ? "bg-secondary text-secondary-foreground"
          : "text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
      )}
      onClick={() => setSheetOpen(false)}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Vote className="h-6 w-6 text-accent" />
            <span className="hidden font-bold sm:inline-block">
              {AppName}
            </span>
          </Link>
          <nav className="flex items-center space-x-2">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
        </div>

        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col space-y-4">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setSheetOpen(false)}>
                  <Vote className="h-6 w-6 text-accent" />
                  <span className="font-bold">{AppName}</span>
                </Link>
                <nav className="flex flex-col space-y-2">
                    {navLinks.map((link) => (
                        <NavLink key={link.href} {...link} />
                    ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Future elements like user profile can go here */}
        </div>
      </div>
    </header>
  );
}
