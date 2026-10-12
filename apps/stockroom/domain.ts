import { z } from "zod";
import {
  c,
  text,
  note,
  money,
  count,
  metric,
  cash,
  fail,
  type Project,
} from "../../src/contracts";
export const stockroom: Project = {
  id: "stockroom",
  name: "Stockroom",
  arabic: "مخزنك",
  kind: "desktop",
  color: "#356871",
  mark: "08",
  tagline: c("Know your stock. Keep moving.", "اعرف مخزونك، وكمّل شغلك."),
  problem: c(
    "An offline stock ledger for small shops, with low-stock alerts, cost valuation, and traceable stock movements.",
    "دفتر مخزون يعمل دون إنترنت للمحال الصغيرة، مع تنبيهات النقص وقيمة المخزون وسجل حركة.",
  ),
  entity: c("products", "منتجات"),
  createLabel: c("Add a product", "إضافة منتج"),
  fields: [
    { key: "title", label: c("Product name", "اسم المنتج"), required: true },
    {
      key: "sku",
      label: c("SKU / product code", "كود المنتج"),
      required: true,
    },
    {
      key: "quantity",
      label: c("Opening quantity", "الرصيد الافتتاحي"),
      type: "number",
      min: 0,
      required: true,
    },
    {
      key: "reorder",
      label: c("Reorder level", "حد إعادة الطلب"),
      type: "number",
      min: 0,
      required: true,
    },
    {
      key: "unitCost",
      label: c("Unit cost · EGP", "تكلفة الوحدة · جنيه"),
      type: "money",
      required: true,
    },
    {
      key: "notes",
      label: c("Supplier / notes", "المورد / ملاحظات"),
      type: "textarea",
    },
  ],
  schema: z
    .object({
      title: text,
      sku: text,
      quantity: z.number().int().min(0).max(1000000),
      reorder: z.number().int().min(0).max(1000000),
      unitCost: money,
      notes: note,
    })
    .strict(),
  create: (d, n) => ({
    ...d,
    sku: d.sku.toUpperCase(),
    movements: [
      {
        kind: "opening",
        quantity: d.quantity,
        reference: "Opening balance",
        at: n.toISOString(),
      },
    ],
  }),
  act: (d, a, p, n) => {
    if (!["receive", "issue"].includes(a)) fail("invalid_transition");
    const x = z.object({ quantity: count, reference: text }).strict().parse(p);
    const qty = d.quantity + (a === "receive" ? x.quantity : -x.quantity);
    if (qty < 0) fail("insufficient_stock");
    if (qty > 1000000) fail("too_many");
    return {
      ...d,
      quantity: qty,
      movements: [...d.movements, { kind: a, ...x, at: n.toISOString() }],
    };
  },
  actions: ["receive", "issue"].map((a) => ({
    id: a,
    label:
      a === "receive"
        ? c("Receive stock", "استلام مخزون")
        : c("Issue stock", "صرف مخزون"),
    fields: [
      {
        key: "quantity",
        label: c("Quantity", "الكمية"),
        type: "number" as const,
        min: 1,
        required: true,
      },
      {
        key: "reference",
        label: c("Reference / reason", "المرجع / السبب"),
        required: true,
      },
    ],
    when: () => true,
  })),
  title: (d) => d.title,
  subtitle: (d) => d.sku,
  status: (d) =>
    d.quantity === 0 ? "empty" : d.quantity <= d.reorder ? "low" : "healthy",
  statuses: {
    empty: c("Out of stock", "نفد المخزون"),
    low: c("Reorder soon", "يحتاج طلب"),
    healthy: c("In stock", "متوفر"),
  },
  metrics: (r, _n, lang = "en") => [
    metric(
      "Product lines",
      "أصناف",
      r.length,
      "Your active inventory",
      "المخزون المسجل",
    ),
    metric(
      "Below reorder level",
      "تحتاج إعادة طلب",
      r.filter((x) => x.data.quantity <= x.data.reorder).length,
      "Including out-of-stock items",
      "تشمل الأصناف النافدة",
    ),
    metric(
      "Stock at cost",
      "المخزون بالتكلفة",
      cash(
        r.reduce(
          (s, x) => s + BigInt(x.data.quantity) * BigInt(x.data.unitCost),
          0n,
        ),
        lang,
      ),
      "Quantity × recorded unit cost",
      "الكمية × تكلفة الوحدة",
    ),
  ],
  seed: (n) => [
    {
      title: "A5 recycled notebook",
      sku: "NB-A5-01",
      quantity: 18,
      reorder: 20,
      unitCost: 4500,
      notes: "Paper House supplier",
      movements: [
        {
          kind: "opening",
          quantity: 18,
          reference: "Opening balance",
          at: n.toISOString(),
        },
      ],
    },
    {
      title: "Black gel pen · pack of 3",
      sku: "PEN-G3",
      quantity: 64,
      reorder: 15,
      unitCost: 2200,
      notes: "",
      movements: [
        {
          kind: "opening",
          quantity: 64,
          reference: "Opening balance",
          at: n.toISOString(),
        },
      ],
    },
  ],
};
