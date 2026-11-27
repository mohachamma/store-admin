import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { DeliveryCompanyForm } from "./DeliveryCompanyForm";
import { FreeShippingForm } from "./FreeShippingForm";
import { ShippingTable } from "./ShippingTable";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("shipping"))("title") };
}

export default async function ShippingPage() {
  const token = await requireSession();
  const [t, td, data, delivery] = await Promise.all([getTranslations("shipping"), getTranslations("delivery"), api.getShipping(token), api.getDelivery(token)]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-medium">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <p className="flex items-start gap-2 rounded-2xl bg-amber-400/10 px-4 py-3 text-xs text-amber-200 light:bg-amber-50 light:text-amber-900">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {t("placeholderWarning")}
      </p>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>{t("freeTitle")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">{t("freeHint")}</p>
          <FreeShippingForm value={data.freeShippingOver} />
        </CardContent>
      </Card>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>{td("title")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">{td("hint")}</p>
          <DeliveryCompanyForm delivery={delivery} />
        </CardContent>
      </Card>
      <div className="space-y-3">
        <h2 className="label">{t("fees")}</h2>
        <ShippingTable wilayas={data.wilayas} />
      </div>
    </div>
  );
}
