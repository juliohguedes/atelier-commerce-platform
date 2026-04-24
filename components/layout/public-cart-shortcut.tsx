"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

interface PublicCartShortcutProps {
  mobile?: boolean;
}

export function PublicCartShortcut({ mobile = false }: PublicCartShortcutProps) {
  const pathname = usePathname();

  if (pathname !== ROUTES.public.shop) {
    return null;
  }

  return (
    <Link
      aria-label="Abrir carrinho"
      className={cn(
        buttonVariants({ variant: "outline", size: mobile ? "icon" : "sm" }),
        !mobile && "gap-2 px-3"
      )}
      href={ROUTES.private.clientStoreCart}
      title="Carrinho"
    >
      <ShoppingCart className="h-4 w-4" />
      {!mobile ? <span className="hidden lg:inline">Carrinho</span> : null}
    </Link>
  );
}
