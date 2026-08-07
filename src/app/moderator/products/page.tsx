import { db } from "@/lib/db";
import { ProductsManager } from "@/components/panel/products-manager";

export default async function ModeratorProducts() {
  const categories = await db.category.findMany({ orderBy: { order: "asc" } });
  return <ProductsManager categories={categories} />;
}
