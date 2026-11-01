import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user — upsert with password update so DB-based admin auth always works
  const adminPassword = await bcrypt.hash("YM@Admin2025", 12);
  await prisma.user.upsert({
    where: { email: "admin@yourmithila.in" },
    update: {
      // Always refresh the password hash so DB-based admin login works
      // even if the record was created before we switched from env-var auth
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name: "Your Mithila Admin",
      email: "admin@yourmithila.in",
      password: adminPassword,
      phone: "7033669971",
      role: "ADMIN",
      city: "Madhubani",
      district: "Madhubani",
      isVerified: true,
    },
  });
  console.log("✅ Admin user created/updated — login: admin@yourmithila.in / YM@Admin2025");

  // Sample reviews
  const reviews = [
    {
      name: "Ramesh Kumar",
      location: "Madhubani",
      rating: 5,
      comment: "Found a great flat in just 2 days! The WhatsApp contact feature is amazing.",
      commentHi: "सिर्फ 2 दिनों में बढ़िया फ्लैट मिला! WhatsApp संपर्क सुविधा बहुत अच्छी है।",
      isApproved: true,
    },
    {
      name: "Sunita Devi",
      location: "Darbhanga",
      rating: 5,
      comment: "Got a job through this platform. Very easy to use and completely free for seekers!",
      commentHi: "इस प्लेटफॉर्म से नौकरी मिली। उपयोग करना बहुत आसान है और खोजने वालों के लिए बिल्कुल मुफ्त!",
      isApproved: true,
    },
    {
      name: "Manoj Jha",
      location: "Sitamarhi",
      rating: 4,
      comment: "Listed my shop for rent and got inquiries within a week. Highly recommended!",
      commentHi: "अपनी दुकान किराए पर दी और एक हफ्ते में पूछताछ मिली। बहुत अच्छा!",
      isApproved: true,
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({ data: review });
  }
  console.log("✅ Sample reviews created");

  // Promo codes
  const promoCodes = [
    {
      code: "MITHILA50",
      discountType: "PERCENT" as const,
      discountValue: 50,
      validUntil: new Date("2026-12-31"),
      maxUses: 100,
      isActive: true,
    },
    {
      code: "NEWUSER",
      discountType: "FLAT" as const,
      discountValue: 50,
      minAmount: 99,
      validUntil: new Date("2026-12-31"),
      maxUses: 500,
      isActive: true,
    },
    {
      code: "MADHUBANI",
      discountType: "PERCENT" as const,
      discountValue: 20,
      validUntil: new Date("2026-12-31"),
      isActive: true,
    },
    {
      code: "LAUNCH25",
      discountType: "PERCENT" as const,
      discountValue: 25,
      validUntil: new Date("2026-12-31"),
      maxUses: 200,
      isActive: true,
    },
  ];

  for (const promo of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: {},
      create: promo,
    });
  }
  console.log("✅ Promo codes created");

  console.log("🎉 Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
