import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { ProductForm } from "../ProductForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("products"))("editTitle") };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await requireSession();
  const product = await api.getProduct(token, id).catch((e: { status?: number }) => {
    if (e.status === 404 || e.status === 422) notFound();
    throw e;
  });
  const [categories, brands] = await Promise.all([api.listCategories(token), api.listBrands(token)]);
  return <ProductForm product={product} categories={categories} brands={brands} />;
}
