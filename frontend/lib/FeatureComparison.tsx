"use client";

import { Check, X } from "lucide-react";
import { Plan, PLANS, FeatureId } from "@/lib/plan-config";

interface FeatureComparisonProps {
  plans: Plan[];
}

const ALL_FEATURES: FeatureId[] = [
  "AI_CHAT_LIMITED",
  "AI_CHAT_UNLIMITED",
  "CHAT_HISTORY_1H",
  "CHAT_HISTORY_7D",
  "CHAT_HISTORY_UNLIMITED",
  "TEMPORARY_FILES_AUTO_DELETE",
  "BASIC_AI_FEATURES",
  "PDF_TOOLS",
  "OCR_SCANNER",
  "PHOTO_TOOL",
  "BASIC_IMAGE_ANALYSIS",
  "ADVANCED_AI",
  "DOCUMENT_AI",
  "AUTOMATION_FEATURES",
  "FAMILY_GUARDIAN_ACCESS",
  "ADVANCED_PHOTO_AI",
  "IMAGE_TO_DOCUMENT_CONVERSION",
  "TABLE_EXTRACTION",
  "PREMIUM_AI_FEATURES",
  "MORE_AI_CREDITS",
  "TEAM_FEATURES",
  "PRIORITY_SUPPORT",
  "ENTERPRISE_ADMIN_CONTROLS",
  "MULTIPLE_FAMILIES",
  "ADVANCED_ANALYTICS",
];

const FEATURE_LABELS: Record<FeatureId, string> = {
  AI_CHAT_LIMITED: "AI Chat (Limited)",
  AI_CHAT_UNLIMITED: "AI Chat (Unlimited)",
  CHAT_HISTORY_1H: "1 Hour Chat History",
  CHAT_HISTORY_7D: "7 Days Chat History",
  CHAT_HISTORY_UNLIMITED: "Unlimited Chat History",
  TEMPORARY_FILES_AUTO_DELETE: "Temporary Files Auto Delete",
  BASIC_AI_FEATURES: "Basic AI Features",
  PDF_TOOLS: "PDF Tools",
  OCR_SCANNER: "OCR Scanner",
  PHOTO_TOOL: "Photo Tool",
  BASIC_IMAGE_ANALYSIS: "Basic Image Analysis",
  ADVANCED_AI: "Advanced AI",
  DOCUMENT_AI: "Document AI",
  AUTOMATION_FEATURES: "Automation Features",
  FAMILY_GUARDIAN_ACCESS: "Family Guardian Access",
  ADVANCED_PHOTO_AI: "Advanced Photo AI",
  IMAGE_TO_DOCUMENT_CONVERSION: "Image to Document Conversion",
  TABLE_EXTRACTION: "Table Extraction",
  PREMIUM_AI_FEATURES: "Premium AI Features",
  MORE_AI_CREDITS: "More AI Credits",
  TEAM_FEATURES: "Team Features",
  PRIORITY_SUPPORT: "Priority Support",
  ENTERPRISE_ADMIN_CONTROLS: "Enterprise Admin Controls",
  MULTIPLE_FAMILIES: "Multiple Families",
  ADVANCED_ANALYTICS: "Advanced Analytics",
};

export default function FeatureComparison({ plans }: FeatureComparisonProps) {
  const sortedPlans = plans.filter(p => p.id !== 'enterprise').sort((a, b) => a.price - b.price); // Exclude enterprise for direct comparison

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-800 shadow-lg">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-gray-700 text-xs uppercase text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Feature</th>
            {sortedPlans.map((plan) => (
              <th key={plan.id} scope="col" className="px-6 py-3 text-center">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALL_FEATURES.map((featureId) => (
            <tr key={featureId} className="border-b border-gray-700 last:border-b-0">
              <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                {FEATURE_LABELS[featureId] || featureId.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </th>
              {sortedPlans.map((plan) => (
                <td key={plan.id} className="px-6 py-4 text-center">
                  {plan.features.includes(featureId) ? (
                    <Check className="h-5 w-5 text-green-400 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-400 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}