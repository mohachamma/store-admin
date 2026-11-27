import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminLogo } from "@/components/shell/AdminLogo";
import { cookies } from "next/headers";
import { LanguageToggle } from "@/components/shell/LanguageToggle";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { usingMock } from "@/lib/api";
import { MOCK_CREDENTIALS } from "@/lib/api/mock";
import { LoginForm } from "./LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");
  return { title: t("title") };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, t] = await Promise.all([searchParams, getTranslations("login")]);
  const theme = (await cookies()).get("theme")?.value === "light" ? "light" : "dark";

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6">
        <div className="flex items-center justify-between">
          <AdminLogo />
          <div className="flex items-center gap-1">
            <ThemeToggle initial={theme} />
            <LanguageToggle />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-4xl font-medium">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
          <LoginForm next={next} />
          {usingMock ? (
            <p className="mt-6 rounded-2xl bg-secondary px-4 py-3 text-center text-xs text-muted-foreground" dir="auto">
              {t("mockHint", MOCK_CREDENTIALS)}
            </p>
          ) : null}
        </div>
      </div>
      {/* Brand panel — same ink/mist identity as the storefront. */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#2a1d14] via-[#1a1411] to-[#3a1f0c] light:bg-none light:bg-ink lg:block">
        <div className="absolute inset-0 grid place-items-center">
          <p dir="ltr" className="select-none font-display text-[9vw] font-medium uppercase leading-none tracking-[0.3em] text-white/[0.06]">
            STORE
          </p>
        </div>
        <div className="absolute inset-x-12 bottom-12 grid grid-cols-3 gap-3">
          {["hoodie-stone", "sneaker-red", "coat-sand"].map((p) => (
            <div key={p} className="aspect-[4/5] rounded-[var(--radius-card)] bg-white/[0.07] backdrop-blur p-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- decorative local SVG */}
              <img src={`/placeholders/${p}.svg`} alt="" className="size-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
