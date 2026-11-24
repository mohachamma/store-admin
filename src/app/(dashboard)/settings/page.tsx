import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ComingSoon } from "@/components/ComingSoon";
import { navItems } from "@/config/nav";

const item = navItems.find((i) => i.key === "settings")!;

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("nav"))("settings") };
}

export default async function Page() {
  const t = await getTranslations("nav");
  return <ComingSoon title={t("settings")} icon={item.icon} phase={item.phase} />;
}
