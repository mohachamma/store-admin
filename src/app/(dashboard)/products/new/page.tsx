import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { ProductForm } from "../ProductForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("products"))("newTitle") };
}

export default async function NewProductPage() {
  const token = await requireSession();
  const [categories, brands] = await Promise.all([api.listCategories(token), api.listBrands(token)]);
  return <ProductForm categories={categories} brands={brands} />;
}
