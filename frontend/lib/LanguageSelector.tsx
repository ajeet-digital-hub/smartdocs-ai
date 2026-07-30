import React from "react";

interface Language {
  code: string;
  name: string;
}

// This list would typically come from an API or a centralized data source
const SUPPORTED_LANGUAGES: Language[] = [
  { code: "auto", name: "Detect Language" },
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "ur", name: "Urdu" },
  { code: "ar", name: "Arabic" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "ru", name: "Russian" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "bn", name: "Bengali" },
  { code: "pa", name: "Punjabi" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "or", name: "Odia" },
  { code: "as", name: "Assamese" },
  // ... 100+ other languages
];

interface LanguageSelectorProps {
  label: string;
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
  excludeAuto?: boolean;
  disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  selectedLanguage,
  onSelectLanguage,
  excludeAuto = false,
  disabled = false,
}) => {
  const languages = excludeAuto
    ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== "auto")
    : SUPPORTED_LANGUAGES;

  return (
    <div className="flex flex-col">
      <label htmlFor={`language-select-${label}`} className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        id={`language-select-${label}`}
        value={selectedLanguage}
        onChange={(e) => onSelectLanguage(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        disabled={disabled}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;