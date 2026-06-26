import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | Coxi Credits",
  description: "Privacy policy for Coxi Credits",
};

export default function DatenschutzPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p className="text-gray-500">Last updated: June 2026</p>

      <section className="space-y-2">
        <h2>1. Controller</h2>
        <p>
          Luca Saur
          <br />
          Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p>
          (Address see <Link href="/impressum">Legal Notice</Link>.)
        </p>
      </section>

      <section className="space-y-2">
        <h2>2. Overview</h2>
        <p>
          &ldquo;Coxi Credits&rdquo; (
          <a href={SITE_URL}>coxi-credits.vercel.app</a>) is a free,
          non-commercial online tool for tracking study progress and estimating
          grades in the Cognitive Science program (Bachelor and Master) at the
          University of Osnabrück.
        </p>
        <p>
          There is no registration and no user account. Your study data
          (courses, grades, selections) is stored exclusively locally in your
          browser and is not transmitted to us. When you visit the website,
          technical access data and anonymous statistics are additionally
          processed through our hosting provider Vercel (see section 3).
        </p>
      </section>

      <section className="space-y-2">
        <h2>3. What data is processed?</h2>

        <h3>3.1 Data that stays on your device only (localStorage)</h3>
        <p>
          When you use the tool, your browser stores the following information
          locally (<code>localStorage</code>) so your progress is preserved:
        </p>
        <ul>
          <li>Selected program (Bachelor or Master)</li>
          <li>Completed mandatory courses and electives</li>
          <li>Free electives (name, ECTS, grade)</li>
          <li>Mathematics ECTS (Bachelor)</li>
          <li>Grades and course selections</li>
          <li>Master: study project, thesis, mandatory elective areas</li>
        </ul>
        <p>
          Legal basis: Art. 6 (1) (b) GDPR (technically necessary to provide the
          functionality you use) and/or Art. 6 (1) (f) GDPR (legitimate interest
          in functional local storage).
        </p>
        <p>
          You can delete this data at any time by removing website data for this
          site in your browser settings (Browser settings → Cookies and site
          data / Local Storage).
        </p>
        <p>
          JSON export/import and PDF export run entirely in your browser. On
          import, a file you choose is read locally; it is not uploaded to a
          server.
        </p>

        <h3>3.2 Hosting and server log files (Vercel)</h3>
        <p>
          The website is hosted by Vercel Inc., 440 N Barranca Ave #4133,
          Covina, CA 91723, USA.
        </p>
        <p>
          When the website is accessed, data is processed for technical reasons,
          in particular:
        </p>
        <ul>
          <li>IP address (briefly in server log files)</li>
          <li>Date and time of access</li>
          <li>URL accessed</li>
          <li>Browser type and version (User-Agent)</li>
          <li>Referrer URL</li>
        </ul>
        <p>
          This processing is technically necessary to deliver the website and
          ensure stability and security.
        </p>
        <p>
          Legal basis: Art. 6 (1) (f) GDPR (legitimate interest in the secure
          operation of the website).
        </p>
        <p>
          Processor: Vercel Inc.
          <br />
          Privacy:{" "}
          <a
            href="https://vercel.com/legal/privacy-notice"
            target="_blank"
            rel="noopener noreferrer"
          >
            vercel.com/legal/privacy-notice
          </a>
          <br />
          Vercel is certified under the EU-US Data Privacy Framework (
          <a
            href="https://vercel.com/docs/security/compliance"
            target="_blank"
            rel="noopener noreferrer"
          >
            vercel.com/docs/security/compliance
          </a>
          ). Transfers to the USA are based on this framework.
        </p>

        <h3>3.3 Vercel Web Analytics (anonymous)</h3>
        <p>
          We use Vercel Web Analytics (<code>@vercel/analytics</code>) to
          understand in aggregated form how the website is used (e.g. page
          views, country of origin, browser/OS, referrer).
        </p>
        <ul>
          <li>No cookies are set.</li>
          <li>There is no cross-site tracking.</li>
          <li>
            Visitors are not permanently identified; only anonymized, aggregated
            statistics are evaluated.
          </li>
          <li>
            IP addresses are not stored in a way that allows individual persons
            to be identified (see Vercel documentation).
          </li>
        </ul>
        <p>
          Legal basis: Art. 6 (1) (f) GDPR (legitimate interest in anonymous
          reach and usage measurement to improve the service).
        </p>
        <p>
          Further information:{" "}
          <a
            href="https://vercel.com/docs/analytics/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            vercel.com/docs/analytics/privacy-policy
          </a>
        </p>

        <h3>3.4 Vercel Speed Insights (anonymous)</h3>
        <p>
          We use Vercel Speed Insights (<code>@vercel/speed-insights</code>) to
          anonymously measure Core Web Vitals (load times, performance) and
          optimize the website.
        </p>
        <p>
          Data collected includes, among other things, route/URL, device type,
          browser, country (ISO code), and performance metrics — without
          attribution to individual persons and without cookies.
        </p>
        <p>
          Legal basis: Art. 6 (1) (f) GDPR (legitimate interest in technical
          optimization of the website).
        </p>
        <p>
          Further information:{" "}
          <a
            href="https://vercel.com/docs/speed-insights/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            vercel.com/docs/speed-insights/privacy-policy
          </a>
        </p>

        <h3>3.5 Fonts</h3>
        <p>
          The website uses the &ldquo;Geist&rdquo; typeface via{" "}
          <code>next/font/google</code> from Next.js. Font files are loaded onto
          the server at build time and delivered to your browser from there — no
          requests are made to Google servers when you visit the site.
        </p>

        <h3>3.6 External links</h3>
        <p>The website links to external sites, including:</p>
        <ul>
          <li>Google Slides (explanations of the study plan)</li>
          <li>GitHub (project source code)</li>
        </ul>
        <p>
          When you click these links, the privacy policies of the respective
          provider apply. We are not responsible for their data processing.
        </p>
      </section>

      <section className="space-y-2">
        <h2>4. Cookies</h2>
        <p>This website does not set tracking cookies.</p>
        <p>
          Vercel Analytics and Speed Insights work without cookies. Technically
          necessary storage in localStorage (see section 3.1) serves solely to
          operate the tool on your device.
        </p>
      </section>

      <section className="space-y-2">
        <h2>5. Retention</h2>
        <ul>
          <li>
            localStorage: until you delete the data in your browser or perform a
            JSON import that overwrites your local data
          </li>
          <li>
            Server log files (Vercel): according to Vercel policies, typically a
            limited retention period
          </li>
          <li>
            Analytics/Speed Insights: anonymized, aggregated data at Vercel
            according to their retention policies
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2>6. Your rights</h2>
        <p>
          <strong>Locally stored study data:</strong> This data exists solely on
          your device. We have no access to it and cannot view, correct, or
          delete it. You manage this data yourself through your browser settings
          (see section 3.1).
        </p>
        <p>
          <strong>
            Server-side processing (hosting, anonymous statistics):
          </strong>{" "}
          With regard to personal data processed in connection with operating
          this website, you have the following rights:
        </p>
        <ul>
          <li>Right of access (Art. 15 GDPR)</li>
          <li>Right to rectification (Art. 16 GDPR)</li>
          <li>Right to erasure (Art. 17 GDPR)</li>
          <li>Right to restriction of processing (Art. 18 GDPR)</li>
          <li>Right to object to processing (Art. 21 GDPR)</li>
          <li>Right to data portability (Art. 20 GDPR), where applicable</li>
          <li>
            Right to lodge a complaint with a supervisory authority (Art. 77
            GDPR), without prejudice to any other administrative or judicial
            remedy
          </li>
        </ul>
        <p>
          To exercise your rights or for privacy questions, please contact:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p>
          Supervisory authority:
          <br />
          The State Commissioner for Data Protection of Lower Saxony (LfD
          Niedersachsen)
          <br />
          <a
            href="https://lfd.niedersachsen.de"
            target="_blank"
            rel="noopener noreferrer"
          >
            lfd.niedersachsen.de
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2>7. No obligation to provide data</h2>
        <p>
          Using the tool does not require registration or providing personal
          data to us. localStorage is only used when you actively use the tool;
          without local storage, settings and progress cannot be saved
          permanently.
        </p>
      </section>

      <section className="space-y-2">
        <h2>8. Changes</h2>
        <p>
          We reserve the right to update this privacy policy when the website or
          legal requirements change. The current version is always available at
          /datenschutz.
        </p>
      </section>
    </LegalPageLayout>
  );
}
