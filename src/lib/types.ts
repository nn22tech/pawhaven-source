import type { Product, ProductMedia, Category } from "@prisma/client";

export type ProductWithMedia = Product & {
  media: ProductMedia[];
  category: Category | null;
};
