import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/constants/routes";
import { env } from "@/lib/env";

const baseUrl = new URL(env.NEXT_PUBLIC_APP_URL).origin;
const now = new Date();

const publicRoutes = [
  {
    path: ROUTES.public.home,
    changeFrequency: "weekly" as const,
    priority: 1
  },
  {
    path: ROUTES.public.shop,
    changeFrequency: "weekly" as const,
    priority: 0.9
  },
  {
    path: ROUTES.public.tailored,
    changeFrequency: "weekly" as const,
    priority: 0.9
  },
  {
    path: ROUTES.public.contact,
    changeFrequency: "monthly" as const,
    priority: 0.7
  }
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: new URL(route.path, baseUrl).toString(),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
