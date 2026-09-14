"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBalanceSheetCalculation } from "@/hooks/use-balance-sheet";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Organization {
  name: string;
  tradeName?: string;
  address: string;
  city: string;
  postalCode: string;
  siret: string;
  vatNumber: string;
}

const ORGANIZATION: Organization = {
  name: "Société Comptable Exemple",
  tradeName: "SCEX",
  address: "12 rue de la Paix",
  city: "Paris",
  postalCode: "75002",
  siret: "123 456 789 00012",
  vatNumber: "FR 12 123 456 789",
};

interface LineItem {
  code: string;
  label: string;
  amount: number;
}

const ACTIF_KEYWORDS = [
  "immobilisation",
  "stock",
  "créance",
  "participations",
  "titre",
  "placement",
  "disponibilité",
  "banque",
  "caisse",
  "clients",
  "créances",
  "valeur",
  "actif",
];

const PASSIF_KEYWORDS = [
  "fournisseur",
  "emploi",
  "dette",
  "provision",
  "avance",
  "dettes",
  "charges",
  "passif",
  "subvention",
  "autre dette",
  "social",
  "fiscale",
];

const CAPITAUX_KEYWORDS = [
  "capital",
  "réserve",
  "report",
  "résultat",
  "résultat de",
  "apport",
  "prime",
  "capitaux",
  "subvention d'investissement",
];

function categorizeRows(
  rows: { label: string; value: number }[] | undefined
): {
  actif: LineItem[];
  passif: LineItem[];
  capitaux: LineItem[];
} {
  const actif: LineItem[] = [];
  const passif: LineItem[] = [];
  const capitaux: LineItem[] = [];

  if (!rows) return { actif, passif, capitaux };

  rows.forEach((row, idx) => {
    const label = row.label.toLowerCase();
    const item: LineItem = {
      code: "",
      label: row.label,
      amount: row.value,
    };
    if (CAPITAUX_KEYWORDS.some((k) => label.includes(k))) {
      capitaux.push(item);
    } else if (PASSIF_KEYWORDS.some((k) => label.includes(k))) {
      passif.push(item);
    } else {
      actif.push(item);
    }
  });

  return { actif, passif, capitaux };
}

function LineRow({ item, isTotal = false }: { item: LineItem; isTotal?: boolean }) {
  return (
    <div
      className={cn(
        "flex justify-between border-b border-gray-300 px-3 py-1 text-sm",
        isTotal ? "font-bold" : ""
      )}
    >
      <span className="flex-1">
        {item.code ? `${item.code} ` : ""}
        {item.label}
      </span>
      <span
        className={cn(
          "w-32 text-right tabular-nums",
          isTotal ? "font-bold" : ""
        )}
      >
        {formatCurrency(item.amount)}
      </span>
    </div>
  );
}

function SectionColumn({
  title,
  titleColor,
  items,
  total,
}: {
  title: string;
  titleColor: string;
  items: LineItem[];
  total: number;
}) {
  return (
    <div className="border border-gray-400 bg-white">
      <div className={cn("px-3 py-2 text-center font-bold text-white", titleColor)}>
        {title}
      </div>
      <div>
        {items.map((item, i) => (
          <LineRow key={`${item.label}-${i}`} item={item} />
        ))}
        <div className="flex justify-between border-t-2 border-gray-600 px-3 py-1 font-bold">
          <span className="flex-1">Total {title}</span>
          <span className="w-32 text-right tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BilanPrintPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.id as string;
  const [preparedBy, setPreparedBy] = useState("Préparé par : Comptable");
  const [preparedDate, setPreparedDate] = useState(
    formatDate(new Date(), "dd/MM/yyyy")
  );

  const { data: calculation, isLoading, error } = useBalanceSheetCalculation(
    draftId
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleBack = () => {
    router.push(`/bilan/${draftId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Chargement du bilan...</div>
      </div>
    );
  }

  if (error || !calculation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">
          Erreur lors du chargement du bilan.
        </div>
      </div>
    );
  }

  const fiscalYear = new Date(calculation.calculatedAt).getFullYear();
  const assets = calculation.assets;
  const liabilities = calculation.liabilities;
  const equity = calculation.equity;
  const totalPassif = liabilities + equity;
  const isBalanced = Math.abs(assets - totalPassif) < 0.01;

  const categorized = categorizeRows(calculation.rows);
  const actifItems = categorized.actif;
  const passifItems = categorized.passif;
  const capitauxItems = categorized.capitaux;

  const orgName = ORGANIZATION.tradeName
    ? `${ORGANIZATION.name} - ${ORGANIZATION.tradeName}`
    : ORGANIZATION.name;

  return (
    <>
      <style jsx-global>{`
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-page-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 text-gray-900 font-serif print:bg-white">
        <div className="no-print print:hidden bg-gray-100 p-4 flex gap-3 justify-end">
          <Button variant="outline" size="sm" onClick={handleBack}>
            Retour au bilan
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            Exporter PDF
          </Button>
          <Button size="sm" onClick={handlePrint}>
            Imprimer
          </Button>
        </div>

        <div
          id="print-bilan-content"
          className="mx-auto w-[210mm] max-w-4xl bg-white px-10 py-8 shadow print:shadow-none print:p-0"
        >
          <header className="mb-8 text-center">
            <h1 className="text-sm font-bold uppercase tracking-wider">
              {orgName}
            </h1>
            <p className="text-xs text-gray-600">{ORGANIZATION.address}</p>
            <p className="text-xs text-gray-600">
              {ORGANIZATION.postalCode} {ORGANIZATION.city}
            </p>
            <p className="text-xs text-gray-600">
              SIRET : {ORGANIZATION.siret} | TVA : {ORGANIZATION.vatNumber}
            </p>
          </header>

          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold uppercase tracking-widest">
              BILAN
            </h2>
            <p className="mt-1 text-lg italic">
              Au {fiscalYear}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-8">
            <SectionColumn
              title="Actif"
              titleColor="bg-blue-700"
              items={actifItems}
              total={assets}
            />
            <div className="grid grid-rows-[1fr_auto_1fr] gap-8">
              <div>
                <SectionColumn
                  title="Passif"
                  titleColor="bg-purple-700"
                  items={passifItems}
                  total={liabilities}
                />
              </div>
              <div>
                <SectionColumn
                  title="Capitaux propres"
                  titleColor="bg-amber-700"
                  items={capitauxItems}
                  total={equity}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-8">
            <div className="border border-gray-400">
              <div className="bg-gray-200 px-3 py-2 text-center font-bold">
                ACTIF TOTAL
              </div>
              <div className="flex justify-between border-t border-gray-400 px-3 py-2 font-bold">
                <span className="flex-1">Total général de l'actif</span>
                <span className="w-32 text-right tabular-nums">
                  {formatCurrency(assets)}
                </span>
              </div>
            </div>

            <div className="grid grid-rows-2 gap-4">
              <div className="border border-gray-400">
                <div className="bg-gray-200 px-3 py-2 text-center font-bold">
                  PASSIF TOTAL
                </div>
                <div className="flex justify-between border-t border-gray-400 px-3 py-1 font-bold">
                  <span className="flex-1">Total passif</span>
                  <span className="w-32 text-right tabular-nums">
                    {formatCurrency(liabilities)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-400 px-3 py-1 font-bold">
                  <span className="flex-1">Capitaux propres</span>
                  <span className="w-32 text-right tabular-nums">
                    {formatCurrency(equity)}
                  </span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-600 px-3 py-1 font-bold">
                  <span className="flex-1">Total général du passif</span>
                  <span className="w-32 text-right tabular-nums">
                    {formatCurrency(totalPassif)}
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "border border-gray-400 px-3 py-2 text-center font-bold",
                  isBalanced
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {isBalanced
                  ? "✓ Le bilan est équilibré"
                  : "✗ Le bilan est déséquilibré"}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-8 border-t border-gray-400 pt-6 text-xs">
            <div>
              <span className="font-semibold">{preparedBy}</span>
              <br />
              <span>Date : {preparedDate}</span>
              <br />
              <span className="text-gray-500">
                Document généré automatiquement le{" "}
                {formatDate(calculation.calculatedAt, "dd/MM/yyyy HH:mm")}
              </span>
            </div>
            <div className="text-right">
              <span className="font-semibold">Exercice fiscal :</span>{" "}
              {fiscalYear}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500 print:mt-4">
            <span>
              Page <span className="print:page-number">1</span> sur{" "}
              <span className="print:pages-count">1</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
