import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ComingSoon } from "@/components/ComingSoon";
import { navItems } from "@/config/nav";

const item = navItems.find((i) => i.key === "orders")!;

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("nav"))("orders") };
}

export default async function Page() {
  const t = await getTranslations("nav");
  return <ComingSoon title={t("orders")} icon={item.icon} phase={item.phase} />;
}
