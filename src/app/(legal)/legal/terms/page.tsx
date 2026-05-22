import { legalStyles as s } from "../_styles";

export const metadata = { title: "Terms of Use — Aegis", robots: { index: true, follow: true } };

export default function TermsPage() {
  return (
    <article>
      <h1 style={s.h1}>Terms of Use</h1>
      <p style={s.updated}>Last updated: May 2026</p>

      <p style={s.p}>
        By using aegis-eu.com you agree to these terms. Aegis is an open, non-profit platform operated by
        ThinkLance AI for informational and assessment-support purposes.
      </p>

      <div style={s.note}>
        <strong>Not legal advice.</strong> Aegis provides information, intelligence and assessment tools — including
        Fundamental Rights Impact Assessment (FRIA) drafting support. It does not constitute legal advice. A FRIA or
        any output generated with Aegis should be reviewed and validated by a qualified professional before being
        relied upon or filed with any authority. You remain solely responsible for your compliance obligations.
      </div>

      <h2 style={s.h2}>1. Access tiers</h2>
      <ul>
        <li style={s.li}><strong>Viewing</strong> is open to everyone, to keep the platform transparent.</li>
        <li style={s.li}><strong>Contribution</strong> (uploading documents, enriching data) is granted only to approved contributors, to protect data integrity. We may grant, refuse or revoke contributor access at our discretion.</li>
      </ul>

      <h2 style={s.h2}>2. Data accuracy</h2>
      <p style={s.p}>
        We strive to surface verified, sourced information and to link each data point to its primary source.
        However, Aegis aggregates and analyses third-party information and may contain errors, omissions or
        out-of-date entries. Always verify against the cited primary source.
      </p>

      <h2 style={s.h2}>3. Contributions</h2>
      <p style={s.p}>
        If you are an approved contributor, you confirm you have the right to submit the material you upload, that it
        does not infringe third-party rights, and that it may be reviewed before publication. Contributors may be
        credited openly; submitted material is used solely to enrich the platform&apos;s public-interest mission.
      </p>

      <h2 style={s.h2}>4. Acceptable use</h2>
      <p style={s.p}>
        You agree not to misuse the platform, attempt to disrupt it, scrape it at scale, or upload unlawful,
        infringing or malicious content.
      </p>

      <h2 style={s.h2}>5. No warranty &amp; liability</h2>
      <p style={s.p}>
        The platform is provided &quot;as is&quot;, without warranty of any kind. To the extent permitted by law,
        ThinkLance AI is not liable for any loss arising from use of, or reliance on, the platform or its outputs.
      </p>

      <h2 style={s.h2}>6. Changes</h2>
      <p style={s.p}>
        We may update these terms as the platform evolves. Material changes will be reflected by the &quot;last
        updated&quot; date above.
      </p>

      <h2 style={s.h2}>7. Contact</h2>
      <p style={s.p}>
        Questions about these terms: <a style={s.a} href="mailto:info@thinklanceai.com">info@thinklanceai.com</a>.
      </p>
    </article>
  );
}
