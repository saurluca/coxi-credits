import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

type LegalPageLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-orange-100 border border-orange-300 rounded-lg p-6 text-center">
        <h1 className="text-3xl font-bold text-black mb-4">{title}</h1>
        <Link
          href="/"
          className="underline text-orange-600 hover:text-orange-800 text-lg"
        >
          ← Back to Grade Calculator
        </Link>
      </div>

      <div className="bg-white border border-orange-200 rounded-lg p-6 space-y-6 text-sm text-gray-700 leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-black [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-black [&_h3]:pt-2 [&_a]:text-orange-600 [&_a:hover]:text-orange-800 [&_a]:underline [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
        {children}
      </div>

      <SiteFooter />
    </div>
  );
}
