import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { AnnouncementForm } from "./AnnouncementForm";
import { HomeSections } from "./HomeSections";
import { SlidesSection } from "./SlidesSection";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("content"))("title") };
}

export default async function ContentPage() {
  const token = await requireSession();
  const [t, content] = await Promise.all([getTranslations("content"), api.getSiteContent(token)]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-[0.08em]">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Card className="max-w-2xl">
        <CardContent>
          <AnnouncementForm content={content} />
        </CardContent>
      </Card>
      <SlidesSection token={token} />
      <HomeSections token={token} />
    </div>
  );
}
