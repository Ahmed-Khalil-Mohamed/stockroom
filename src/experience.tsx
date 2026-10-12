import { useState, type ReactNode } from "react";
import {
  Plus,
  Scales,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  FolderOpen,
  FileText,
  Wrench,
  ShieldCheck,
  Package,
  Receipt,
  Cards,
  MapPin,
  Clock,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import {
  type Project,
  type Entry,
  type Lang,
  type Action,
  cash,
} from "./contracts";
import { Status, fmtDate } from "./components";
type Slots = {
  p: Project;
  now: Date;
  create: () => void;
  notices: ReactNode;
  metrics: ReactNode;
  features: ReactNode;
  records: ReactNode;
  lang: Lang;
};
type Props = {
  p: Project;
  rows: Entry[];
  lang: Lang;
  now: Date;
  busy: boolean;
  open: (e: Entry) => void;
  action: (e: Entry, a: Action) => void;
};
const words = (lang: Lang) => (en: string, ar: string) =>
  lang === "ar" ? ar : en;
function Title({ e, p, open }: Pick<Props, "p" | "open"> & { e: Entry }) {
  return (
    <button className="record-title" dir="auto" onClick={() => open(e)}>
      {p.title(e.data)}
      <ArrowUpRight size={17} />
    </button>
  );
}
function Next({ e, p, lang, busy, action }: Props & { e: Entry }) {
  const a = p.actions.find((a) => a.when(e.data));
  return a ? (
    <button
      className="secondary compact"
      disabled={busy}
      onClick={() => action(e, a)}
    >
      {a.label[lang]}
      <ArrowRight size={14} />
    </button>
  ) : null;
}
function Scene({ label }: { label: string }) {
  return (
    <figure className="brand-scene">
      <img src="/brand-scene.png" alt="" />
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export function ProductComposition({
  p,
  now,
  create,
  notices,
  metrics,
  features,
  records,
  lang,
}: Slots) {
  const t = words(lang);
  return (
    <div className="experience">
      <div className="stock-heading" id="overview">
        <div>
          <span className="overline">
            {t("INVENTORY CONTROL", "إدارة المخزون")}
          </span>
          <h1>{t("Stock ledger", "دفتر المخزون")}</h1>
        </div>
        <button className="primary" onClick={create}>
          <Plus />
          {p.createLabel[lang]}
        </button>
      </div>
      <div className="stock-workbench">
        <div>{records}</div>
        <aside className="stock-readout">
          <span className="overline">
            {t("WAREHOUSE TOTALS", "إجماليات المخزن")}
          </span>
          {metrics}
          <Package size={60} weight="thin" />
          <p>
            {t(
              "Every unit has a movement. Every movement has a record.",
              "كل وحدة لها حركة. وكل حركة لها سجل.",
            )}
          </p>
        </aside>
      </div>
      {features}
      <div className="workspace-notes">{notices}</div>
    </div>
  );
}
export function ProductRecords(props: Props) {
  const { p, rows, lang, now, busy, open, action } = props;
  const t = words(lang);
  return (
    <div className="inventory-sheet">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>{t("Item / SKU", "الصنف / الكود")}</th>
            <th>{t("On hand", "المتوفر")}</th>
            <th>{t("Reorder at", "حد الطلب")}</th>
            <th>{t("Unit cost", "تكلفة الوحدة")}</th>
            <th>{t("Stock value", "قيمة المخزون")}</th>
            <th>{t("Condition", "الحالة")}</th>
            <th>{t("Movement", "حركة")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e, i) => (
            <tr className="record-card" key={e.id}>
              <td className="sheet-index">{i + 1}</td>
              <td>
                <Title {...props} e={e} />
                <code>{e.data.sku}</code>
              </td>
              <td className="quantity-cell">
                <strong>{e.data.quantity}</strong>
                <div className="stock-track">
                  <i
                    style={{
                      width:
                        Math.min(
                          100,
                          (e.data.quantity / Math.max(1, e.data.reorder)) * 100,
                        ) + "%",
                    }}
                  />
                </div>
              </td>
              <td>{e.data.reorder}</td>
              <td>{cash(e.data.unitCost, lang)}</td>
              <td>{cash(e.data.quantity * e.data.unitCost, lang)}</td>
              <td>
                <Status project={p} entry={e} lang={lang} now={now} />
              </td>
              <td>
                <Next {...props} e={e} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
