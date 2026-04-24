import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/constants/routes";
import { env, isProductionStage } from "@/lib/env";

const baseUrl = new URL(env.NEXT_PUBLIC_APP_URL).origin;

export default function robots(): MetadataRoute.Robots {
  if (!isProductionStage) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/"
      },
      sitemap: `${baseUrl}/sitemap.xml`,
      host: baseUrl
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: [ROUTES.public.home, ROUTES.public.contact, ROUTES.public.shop, ROUTES.public.tailored],
        disallow: [
          ROUTES.public.signIn,
          ROUTES.public.signUp,
          ROUTES.public.forgotPassword,
          ROUTES.public.resetPassword,
          ROUTES.public.maintenance,
          ROUTES.private.dashboard,
          ROUTES.auth.callback
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
