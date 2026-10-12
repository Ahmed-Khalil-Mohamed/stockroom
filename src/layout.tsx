import type { ReactNode } from "react";
import {
  UsersThree,
  ListBullets,
  CalendarBlank,
  HandHeart,
  Package,
  ChartBar,
  Cards,
} from "@phosphor-icons/react";
import type { Lang } from "./contracts";
export function ProductLayout({
  brand,
  utilities,
  lang,
  children,
}: {
  brand: ReactNode;
  utilities: ReactNode;
  lang: Lang;
  children: ReactNode;
}) {
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  return (
    <div className="stock-shell">
      <header className="stock-rail">
        {brand}
        <nav>
          <a href="#records">
            <Package size={21} />
            {t("Stock ledger", "دفتر المخزون")}
          </a>
          <a href="#overview">
            <ChartBar size={21} />
            {t("Overview", "نظرة عامة")}
          </a>
        </nav>
        <span className="stock-rail-label">
          {t("LOCAL INVENTORY", "مخزون محلي")}
        </span>
        {utilities}
      </header>
      <main className="identity-main">{children}</main>
    </div>
  );
}
