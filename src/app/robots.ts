import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/admin/", "/preview/", "/saved"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
