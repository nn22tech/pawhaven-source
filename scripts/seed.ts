/**
 * PawHaven seed script.
 * Run with: bun run scripts/seed.ts
 * Idempotent — safe to run multiple times.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding PawHaven…");

  // ── Site settings ──────────────────────────────────────────────
  await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "PawHaven",
      siteTagline: "Where Every Pet Finds a Home",
      heroTitle: "Find Your New Best Friend",
      heroSubtitle:
        "Adopt a loving pet or shop premium supplies — all in one warm, caring place.",
      heroImageUrl: "/uploads/hero.png",
      heroCtaText: "Browse Pets",
      footerText: "© PawHaven. Where every paw finds a home.",
      contactEmail: "orders@pawhaven.example",
      orderEmail: "orders@pawhaven.example",
      address: "123 Pawsome Street, Petville",
      socialInstagram: "https://instagram.com",
      socialFacebook: "https://facebook.com",
    },
  });

  // ── Admin & Moderator accounts ─────────────────────────────────
  const adminPass = await bcrypt.hash("Admin@1234", 12);
  const modPass = await bcrypt.hash("Moderator@1234", 12);

  await db.user.upsert({
    where: { email: "admin@pawhaven.com" },
    update: {},
    create: {
      email: "admin@pawhaven.com",
      password: adminPass,
      name: "Site Administrator",
      role: "ADMIN",
    },
  });

  await db.user.upsert({
    where: { email: "moderator@pawhaven.com" },
    update: {},
    create: {
      email: "moderator@pawhaven.com",
      password: modPass,
      name: "Store Moderator",
      role: "MODERATOR",
    },
  });

  console.log("  ✓ admin@pawhaven.com / Admin@1234");
  console.log("  ✓ moderator@pawhaven.com / Moderator@1234");

  // ── Categories ─────────────────────────────────────────────────
  const cats = [
    { name: "Dogs", slug: "dogs", icon: "Dog", order: 1, description: "Loyal companions looking for a forever home." },
    { name: "Cats", slug: "cats", icon: "Cat", order: 2, description: "Independent and affectionate feline friends." },
    { name: "Small Pets", slug: "small-pets", icon: "Rabbit", order: 3, description: "Rabbits, guinea pigs, hamsters and more." },
    { name: "Birds", slug: "birds", icon: "Bird", order: 4, description: "Feathered friends with vibrant personalities." },
    { name: "Food", slug: "food", icon: "Beef", order: 5, description: "Nutritious food for every pet." },
    { name: "Toys", slug: "toys", icon: "Bone", order: 6, description: "Toys to keep tails wagging." },
    { name: "Beds & Furniture", slug: "beds", icon: "BedDouble", order: 7, description: "Cozy beds and accessories." },
    { name: "Accessories", slug: "accessories", icon: "Bone", order: 8, description: "Leashes, collars, bowls and more." },
  ];

  const categoryMap: Record<string, string> = {};
  for (const c of cats) {
    const rec = await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categoryMap[c.slug] = rec.id;
  }

  // ── Products ───────────────────────────────────────────────────
  const products = [
    {
      name: "Buddy — Golden Retriever Puppy",
      type: "PET",
      description:
        "Buddy is an 8-week-old Golden Retriever puppy with a heart of gold. He loves belly rubs, long naps, and making new friends. Vaccinated, dewormed, and ready to find his forever family. Buddy is playful, curious, and great with children.",
      price: 450,
      breed: "Golden Retriever",
      age: "8 weeks",
      color: "Golden",
      gender: "Male",
      vaccinated: true,
      neutered: false,
      categorySlug: "dogs",
      stock: 1,
      featured: true,
      media: [{ url: "/uploads/dog-golden.png", type: "IMAGE" }],
    },
    {
      name: "Luna — Tabby Cat",
      type: "PET",
      description:
        "Luna is a graceful 1-year-old tabby cat with striking green eyes. She is calm, affectionate, and loves sunny windowsills. Spayed, vaccinated, and litter-trained. Luna would thrive in a quiet, loving home.",
      price: 120,
      breed: "Domestic Shorthair",
      age: "1 year",
      color: "Brown Tabby",
      gender: "Female",
      vaccinated: true,
      neutered: true,
      categorySlug: "cats",
      stock: 1,
      featured: true,
      media: [{ url: "/uploads/cat-tabby.png", type: "IMAGE" }],
    },
    {
      name: "Coco — Fluffy Kitten",
      type: "PET",
      description:
        "Coco is a playful 10-week-old kitten full of energy. She adores yarn balls, feather wands, and cuddle sessions. Vaccinated and ready to bring joy to your home.",
      price: 90,
      breed: "Domestic Longhair",
      age: "10 weeks",
      color: "Grey & White",
      gender: "Female",
      vaccinated: true,
      neutered: false,
      categorySlug: "cats",
      stock: 1,
      featured: true,
      media: [{ url: "/uploads/kitten.png", type: "IMAGE" }],
    },
    {
      name: "Cotton — Lop Rabbit",
      type: "PET",
      description:
        "Cotton is a sweet Holland Lop rabbit, 6 months old. Gentle and social, she enjoys being petted and exploring. Perfect for first-time small-pet owners.",
      price: 60,
      breed: "Holland Lop",
      age: "6 months",
      color: "White & Brown",
      gender: "Female",
      vaccinated: true,
      neutered: false,
      categorySlug: "small-pets",
      stock: 1,
      media: [{ url: "/uploads/rabbit.png", type: "IMAGE" }],
    },
    {
      name: "Kiwi — Blue Parrot",
      type: "PET",
      description:
        "Kiwi is a vibrant 2-year-old parrot with a big personality. He mimics sounds, loves interaction, and is hand-tamed. Comes with a health certificate.",
      price: 350,
      breed: "Indian Ringneck",
      age: "2 years",
      color: "Blue",
      gender: "Male",
      vaccinated: true,
      neutered: false,
      categorySlug: "birds",
      stock: 1,
      media: [{ url: "/uploads/parrot.png", type: "IMAGE" }],
    },
    {
      name: "Premium Adult Dog Food — 10kg",
      type: "SUPPLY",
      description:
        "Nutrient-rich dry dog food for adult dogs of all breeds. Made with real chicken, wholesome grains, and added vitamins for a shiny coat and strong muscles. No artificial colors or flavors.",
      price: 42.99,
      compareAtPrice: 54.99,
      brand: "PawNutrition",
      categorySlug: "food",
      stock: 40,
      featured: true,
      media: [{ url: "/uploads/dogfood.png", type: "IMAGE" }],
    },
    {
      name: "Rope & Chew Dog Toy Set",
      type: "SUPPLY",
      description:
        "Durable cotton rope toys that clean teeth and satisfy your dog's natural urge to chew. Great for tug-of-war and fetch. Safe, non-toxic, and machine washable.",
      price: 14.99,
      brand: "HappyTails",
      categorySlug: "toys",
      stock: 60,
      media: [{ url: "/uploads/dogtoy.png", type: "IMAGE" }],
    },
    {
      name: "Cozy Round Cat Bed",
      type: "SUPPLY",
      description:
        "Ultra-soft plush cat bed with non-slip bottom. The raised rim provides head and neck support while the self-warming fleece keeps your cat cozy. Machine washable.",
      price: 29.99,
      brand: "PawComfort",
      categorySlug: "beds",
      stock: 25,
      media: [{ url: "/uploads/catbed.png", type: "IMAGE" }],
    },
    {
      name: "Leather Dog Leash & Collar Set",
      type: "SUPPLY",
      description:
        "Handcrafted genuine leather leash and collar set with polished hardware. Comfortable grip, adjustable collar, and built to last. Available in brown.",
      price: 39.99,
      compareAtPrice: 49.99,
      brand: "UrbanPaw",
      categorySlug: "accessories",
      stock: 30,
      media: [{ url: "/uploads/leash.png", type: "IMAGE" }],
    },
  ];

  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) continue;
    const { categorySlug, media, ...rest } = p;
    await db.product.create({
      data: {
        ...rest,
        slug,
        categoryId: categoryMap[categorySlug],
        status: "ACTIVE",
        media: { create: media.map((m, i) => ({ ...m, order: i, isMain: i === 0 })) },
      },
    });
  }

  console.log("Seed complete ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
