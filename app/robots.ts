import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/api/",
          "/auth/forgot-password",
          "/choose-role",
          "/seeker/",
          "/saved",
          "/profile",
        ],
      },
    ],
    sitemap: "https://yourmithila.in/sitemap.xml",
    host: "https://yourmithila.in",
  };
}
