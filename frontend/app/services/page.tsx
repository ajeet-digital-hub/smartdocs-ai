import type { Metadata } from "next";
import ServicesPage from "./components/ServicesPage";

export const metadata: Metadata = {
  title: "All Services - SmartDocs AI",
  description:
    "Browse 260+ professional services including PDF tools, AI assistants, image editing, video creation, business tools, developer utilities, and more. Powered by SmartDocs AI.",
  keywords:
    "PDF editor, AI tools, image editor, video editor, resume builder, document editor, business tools, developer tools, SmartDocs AI",
  openGraph: {
    title: "All Services - SmartDocs AI",
    description:
      "Browse 260+ professional services including PDF tools, AI assistants, image editing, video creation, business tools, developer utilities, and more.",
    type: "website",
  },
};

export default function ServicesRoute() {
  return <ServicesPage />;
}

