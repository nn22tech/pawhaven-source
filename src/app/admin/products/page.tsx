import { getCategories } from "@/lib/cache";
import { ProductsManager } from "@/components/panel/products-manager";

export const revalidate = 120;

export default async function AdminProducts() {
  const categories = await getCategories();
  return <ProductsManager categories={categories} />;
}
