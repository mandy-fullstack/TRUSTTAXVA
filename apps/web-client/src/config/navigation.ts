/**
 * Central navigation config: single source of truth for routes, labels, and order.
 * Used by Header, Layout, and Footer.
 */

export const MOBILE_BREAKPOINT = 768;

export interface PublicNavItem {
  path: string;
  i18nKey: string;
  order: number;
}

export const publicNavItems: PublicNavItem[] = [
  { path: "/", i18nKey: "header.home", order: 0 },
  { path: "/about", i18nKey: "header.about", order: 1 },
  { path: "/services", i18nKey: "header.services", order: 2 },
  { path: "/contact", i18nKey: "header.contact", order: 3 },
];

export interface DashboardNavItem extends PublicNavItem {
  icon?: "LayoutDashboard" | "ShoppingBag" | "FileText" | "Settings" | "Folder";
  /** Show this item only when pathname matches (e.g. /dashboard). */
  showOnlyWhen?: string;
}

export const dashboardNavItems: DashboardNavItem[] = [
  {
    path: "/dashboard",
    i18nKey: "header.dashboard",
    order: 0,
    icon: "LayoutDashboard",
  },
  {
    path: "/dashboard/services",
    i18nKey: "header.services",
    order: 1,
    icon: "ShoppingBag",
  },
  {
    path: "/dashboard/documents",
    i18nKey: "header.documents",
    order: 2,
    icon: "Folder",
  },
  {
    path: "/dashboard/orders",
    i18nKey: "header.orders",
    order: 3,
    icon: "FileText",
  },
  {
    path: "/dashboard/settings",
    i18nKey: "header.settings",
    order: 99,
    icon: "Settings",
  },
];

export interface AuthNavLink {
  type: "link";
  path: string;
  i18nKey: string;
  order: number;
}

export interface AuthNavUser {
  type: "user";
  i18nKey: string;
}

export interface AuthNavLogout {
  type: "logout";
  i18nKey: string;
}

export type AuthNavItem = AuthNavLink | AuthNavUser | AuthNavLogout;

const authNavPublic: AuthNavLink[] = [
  { type: "link", path: "/login", i18nKey: "header.login", order: 0 },
  { type: "link", path: "/register", i18nKey: "common.get_started", order: 1 },
];

const authNavAuthenticated: AuthNavItem[] = [
  { type: "user", i18nKey: "header.user" },
  { type: "logout", i18nKey: "header.logout" },
];

export function getPublicNav(): PublicNavItem[] {
  return [...publicNavItems].sort((a, b) => a.order - b.order);
}

export function getDashboardNav(location: {
  pathname: string;
}): DashboardNavItem[] {
  const base = dashboardNavItems.filter((i) => !i.showOnlyWhen);
  const extra = dashboardNavItems.filter(
    (i) => i.showOnlyWhen && location.pathname === i.showOnlyWhen,
  );
  return [...base, ...extra].sort((a, b) => a.order - b.order);
}

export function getAuthNav(isAuthenticated: boolean): AuthNavItem[] {
  if (isAuthenticated) {
    return authNavAuthenticated;
  }
  return authNavPublic.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
