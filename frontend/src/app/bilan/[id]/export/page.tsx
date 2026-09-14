"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { BilanExport, type ExportRow } from "@/components/bilan/bilan-export";
import { exportToCSV, exportToExcel, printBilan } from "@/lib/utils/export";

type Format = "pdf" | "csv" | "excel";
type Section = "actif" | "passif" | "capitaux_propres";

const SECTIONS: { value: Section; label: string }[] = [
  { value: "actif", label: "Actif" },
  { value: "passif", label: "Passif" },
  { value: "capitaux_propres", label: "Capitaux propres" },
];

const FORMATS: { value: Format; label: string; icon: string }[] = [
  { value: "pdf", label: "PDF", icon: "📄" },
  { value: "csv", label: "CSV", icon: "📊" },
  { value: "excel", label: "Excel", icon: "📗" },
];

const dummyExportData: ExportRow[] = [
  { code: "100", libelle: "Capital social", montant: 100000, categorie: "Capitaux propres" },
  { code: "110", libelle: "Réserves", montant: 5430.5, categorie: "Capitaux propres" },
  { code: "120", libelle: "Résultat net", montant: 34000, categorie: "Capitaux propres" },
  { code: "512", libelle: "Trésorerie", montant: 125430.5, categorie: "Actif" },
  { code: "511", libelle: "Créances clients", montant: 45200, categorie: "Actif" },
  { code: "513", libelle: "Stocks", montant: 18750, categorie: "Actif" },
  { code: "520", libelle: "Immobilisations", montant: 85000, categorie: "Actif" },
  { code: "401", libelle: "Fournisseurs", montant: 32500, categorie: "Passif" },
  { code: "520", libelle: "Emprunts", montant: 45000, categorie: "Passif" },
  { code: "530", libelle: "Dettes fiscales", montant: 7450, categorie: "Passif" },
];

export default function BilanExportPage() {
  const params = useParams();
  const router = useRouter();
  const bilanId = params.id as string;

  const [selectedFormat, setSelectedFormat] = useState<Format>("pdf");
  const [selectedSections, setSelectedSections] = useState<Section[]>(["actif", "passif", "capitaux_propres"]);
  const [isPreview, setIsPreview] = useState(false);

  const toggleSection = (section: Section) => {
    setSelectedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  };

  const filteredData = dummyExportData.filter((row) =>
    selectedSections.includes(row.categorie.toLowerCase() as Section),
  );

  const handleExport = () => {
    const data = filteredData;
    switch (selectedFormat) {
      case "csv":
        exportToCSV(data, `bilan-${bilanId}`);
        break;
      case "excel":
        exportToExcel(data, `bilan-${bilanId}`);
        break;
      case "pdf":
        printBilan();
        break;
    }
  };

  const handlePreview = () => {
    setIsPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Export du bilan</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {bilanId}</p>
          </div>
          <Button variant="ghost" onClick={() => router.back()}>
            Retour
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Options d'export</CardTitle>
            <CardDescription>Choisissez le format et les sections à inclure dans l'export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium">Format</p>
              <Select value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as Format)}>
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.icon} {f.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Sections à inclure</p>
              <div className="grid grid-cols-3 gap-4">
                {SECTIONS.map((section) => (
                  <div key={section.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`section-${section.value}`}
                      checked={selectedSections.includes(section.value)}
                      onChange={() => toggleSection(section.value)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`section-${section.value}`}
                      className="cursor-pointer text-sm"
                    >
                      {section.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handlePreview} className="flex-1">
                Aperçu
              </Button>
              <Button onClick={handleExport} variant="default" className="flex-1">
                Exporter
              </Button>
            </div>
          </CardContent>
        </Card>

        {isPreview && (
          <Card>
            <CardHeader>
              <CardTitle>
                Aperçu — {FORMATS.find((f) => f.value === selectedFormat)?.label}
              </CardTitle>
              <CardDescription>
                {selectedSections.map((s) => SECTIONS.find((sec) => sec.value === s)?.label).join(", ")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Code</th>
                        <th className="text-left py-3 px-4 font-semibold">Libellé</th>
                        <th className="text-right py-3 px-4 font-semibold">Montant (€)</th>
                        <th className="text-left py-3 px-4 font-semibold">Catégorie</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-xs">{row.code}</td>
                          <td className="py-3 px-4">{row.libelle}</td>
                          <td className="py-3 px-4 text-right">
                            {new Intl.NumberFormat("fr-FR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(Number(row.montant))}
                          </td>
                          <td className="py-3 px-4">{row.categorie}</td>
                        </tr>
                      ))}
                      {filteredData.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-6 px-4 text-center text-gray-500">
                            Aucune donnée pour les sections sélectionnées
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <BilanExport data={filteredData} filename={`bilan-${bilanId}`} />
        </div>
      </div>
    </div>
  );
}
