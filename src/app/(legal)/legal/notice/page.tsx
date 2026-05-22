import { legalStyles as s } from "../_styles";

export const metadata = { title: "Legal Notice — Aegis", robots: { index: true, follow: true } };

export default function NoticePage() {
  return (
    <article>
      <h1 style={s.h1}>Legal Notice</h1>
      <p style={s.updated}>Last updated: May 2026</p>

      <h2 style={s.h2}>Publisher</h2>
      <p style={s.p}>
        This website (aegis-eu.com) is published by ThinkLance AI, based in Brussels, Belgium.
        Contact: <a style={s.a} href="mailto:info@thinklanceai.com">info@thinklanceai.com</a>.
      </p>

      <h2 style={s.h2}>Nature of the project</h2>
      <p style={s.p}>
        Aegis is an open, non-profit initiative. There is no commercial entity selling access, no premium tier and
        no advertising. The project exists to make fundamental rights intelligence — with a focus on children&apos;s
        digital rights — accessible and actionable across the EU.
      </p>

      <h2 style={s.h2}>Hosting</h2>
      <p style={s.p}>
        The platform is hosted on cloud infrastructure within the European Union. Specific provider details are
        available on request.
      </p>

      <h2 style={s.h2}>Sources &amp; methodology</h2>
      <p style={s.p}>
        Aegis aggregates and analyses publicly available information from official sources (data protection
        authorities, EU institutions and agencies, official journals and case law). Each surfaced data point links
        back to its primary source. Verified entries are marked as such and, where applicable, attributed to the
        contributor who validated them.
      </p>

      <h2 style={s.h2}>Intellectual property</h2>
      <p style={s.p}>
        Underlying official documents and decisions remain the property of their respective authors and publishers.
        Aegis&apos;s own analysis and presentation are made available in the spirit of open, public-interest use.
      </p>

      <h2 style={s.h2}>Contact</h2>
      <p style={s.p}>
        For any legal, press or partnership enquiry: <a style={s.a} href="mailto:info@thinklanceai.com">info@thinklanceai.com</a>.
      </p>
    </article>
  );
}
