import { legalStyles as s } from "../_styles";

export const metadata = { title: "Privacy Policy — Aegis", robots: { index: true, follow: true } };

export default function PrivacyPage() {
  return (
    <article>
      <h1 style={s.h1}>Privacy Policy</h1>
      <p style={s.updated}>Last updated: May 2026</p>

      <p style={s.p}>
        Aegis (&quot;Aegis&quot;, &quot;we&quot;, &quot;us&quot;) is an open, non-profit platform operated by ThinkLance AI.
        This policy explains what personal data we process when you use aegis-eu.com and why. We process
        personal data in accordance with the EU General Data Protection Regulation (GDPR).
      </p>

      <h2 style={s.h2}>1. Who is responsible</h2>
      <p style={s.p}>
        The data controller for this website is ThinkLance AI (Brussels, Belgium). For any privacy request,
        contact <a style={s.a} href="mailto:info@thinklanceai.com">info@thinklanceai.com</a>.
      </p>

      <h2 style={s.h2}>2. What we collect</h2>
      <ul>
        <li style={s.li}><strong>Account data</strong> — if you create an account: email address and authentication identifiers.</li>
        <li style={s.li}><strong>Access requests</strong> — if you request contributor access: the name, role, organisation, email and message you submit.</li>
        <li style={s.li}><strong>Content you create</strong> — assessments (FRIA drafts) and any documents you choose to upload for ingestion.</li>
        <li style={s.li}><strong>Technical data</strong> — minimal server logs (IP address, request metadata) used for security and rate limiting.</li>
      </ul>

      <h2 style={s.h2}>3. Why we process it</h2>
      <ul>
        <li style={s.li}>To provide the platform and your account (performance of a service you request).</li>
        <li style={s.li}>To evaluate and manage contributor access requests (legitimate interest).</li>
        <li style={s.li}>To secure the platform and prevent abuse (legitimate interest).</li>
      </ul>

      <h2 style={s.h2}>4. Legal basis</h2>
      <p style={s.p}>
        We rely on your consent (where given), the performance of the service you request, and our legitimate
        interest in operating a secure, useful platform — balanced against your rights.
      </p>

      <h2 style={s.h2}>5. Sharing &amp; processors</h2>
      <p style={s.p}>
        We do not sell personal data. We use infrastructure providers (hosting, database, authentication) acting
        as processors on our behalf, located in the EU where possible. We never share contributor data with third
        parties for marketing.
      </p>

      <h2 style={s.h2}>6. Retention</h2>
      <p style={s.p}>
        We keep personal data only as long as needed for the purposes above, or until you ask us to delete it.
        Access-request data is kept for the duration of the evaluation and a reasonable period thereafter.
      </p>

      <h2 style={s.h2}>7. Your rights</h2>
      <p style={s.p}>
        Under the GDPR you have the right to access, rectify, erase, restrict and port your data, and to object to
        processing. To exercise these rights, email <a style={s.a} href="mailto:info@thinklanceai.com">info@thinklanceai.com</a>.
        You also have the right to lodge a complaint with your national data protection authority.
      </p>

      <div style={s.note}>
        Aegis is a non-profit project. We collect the minimum data needed to run the platform and to let trusted
        contributors help shape it — nothing more.
      </div>
    </article>
  );
}
