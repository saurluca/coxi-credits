import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

type SiteFooterProps = {
  actions?: React.ReactNode;
};

export function SiteFooter({ actions }: SiteFooterProps) {
  return (
    <footer className="mt-12 py-4 border-t text-center text-sm text-gray-500">
      {actions ? (
        <div className="flex flex-col items-center gap-3 mb-2">{actions}</div>
      ) : null}
      <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        <Link href="/impressum" className="text-blue-500 hover:underline">
          Legal Notice
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/datenschutz" className="text-blue-500 hover:underline">
          Privacy Policy
        </Link>
        <span aria-hidden="true">·</span>
        <a
          href="https://github.com/saurluca/coxi-credits"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          GitHub
        </a>
      </p>
      <p>
        Created by Luca Saur •{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-blue-500 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      </p>
      <p className="mt-4 text-xs text-gray-400 max-w-2xl mx-auto">
        This tool is not affiliated with, endorsed by, or officially connected
        to the University of Osnabrück (Universität Osnabrück). All calculations
        and grade estimates are provided for informational purposes only; no
        guarantee is given for their accuracy.
      </p>
    </footer>
  );
}
