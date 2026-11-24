import { Bell, LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { logout } from "@/app/login/actions";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { usingMock } from "@/lib/api";
import { AdminLogo } from "./AdminLogo";
import { LanguageToggle } from "./LanguageToggle";

export async function Topbar() {
  const [t, tc] = await Promise.all([getTranslations("nav"), getTranslations("common")]);
  const iconBtn = "relative grid size-10 place-items-center rounded-full transition hover:bg-secondary";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-3 px-4 lg:h-16 lg:px-8">
        <AdminLogo className="lg:hidden" />
        <div className="hidden lg:block">
          {usingMock ? <Badge variant="warning">{tc("mockMode")}</Badge> : null}
        </div>
        <div className="flex items-center gap-1">
          <LanguageToggle className="hidden lg:flex" />
          {/* New-order alerts (live badge + sound) arrive in phase 5. */}
          <Sheet>
            <SheetTrigger className={iconBtn} aria-label={t("notifications")}>
              <Bell className="size-5" strokeWidth={1.8} />
              <span className="absolute end-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
            </SheetTrigger>
            <SheetContent closeLabel={tc("close")}>
              <SheetTitle>{t("notifications")}</SheetTitle>
              <SheetDescription className="py-8 text-center">{tc("noNotifications")}</SheetDescription>
            </SheetContent>
          </Sheet>
          <form action={logout} className="hidden lg:block">
            <button type="submit" className={iconBtn} aria-label={t("logout")} title={t("logout")}>
              <LogOut className="size-5 rtl:-scale-x-100" strokeWidth={1.8} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
