import {
  Award,
  BadgePercent,
  FolderTree,
  LayoutGrid,
  Package,
  Wallet,
  Settings,
  Shirt,
  TicketPercent,
  Truck,
  Users,
  Images,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type NavKey = "overview" | "orders" | "products" | "catalog" | "brands" | "offers" | "content" | "shipping" | "discounts" | "profit" | "pages" | "customers" | "settings";

export interface NavItem {
  key: NavKey;
  href: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar (others live under "More"). */
  primary?: boolean;
  /** Build phase that delivers the page (see CLAUDE.md). */
  phase: number;
}

export const navItems: NavItem[] = [
  { key: "overview", href: "/", icon: LayoutGrid, primary: true, phase: 2 },
  { key: "orders", href: "/orders", icon: Package, primary: true, phase: 2 },
  { key: "products", href: "/products", icon: Shirt, primary: true, phase: 3 },
  { key: "catalog", href: "/catalog", icon: FolderTree, phase: 4 },
  { key: "brands", href: "/brands", icon: Award, phase: 4 },
  { key: "offers", href: "/offers", icon: BadgePercent, phase: 4 },
  { key: "content", href: "/content", icon: Images, phase: 4 },
  { key: "shipping", href: "/shipping", icon: Truck, phase: 4 },
  { key: "discounts", href: "/discounts", icon: TicketPercent, phase: 4 },
  { key: "profit", href: "/profit", icon: Wallet, phase: 7 },
  { key: "pages", href: "/pages", icon: FileText, phase: 7 },
  { key: "customers", href: "/customers", icon: Users, phase: 6 },
  { key: "settings", href: "/settings", icon: Settings, phase: 6 },
];

export const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
