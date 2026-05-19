import type { DetectedSignal, SignalType } from "./types";

interface SignalPattern {
  type: SignalType;
  patterns: RegExp[];
  confidence: number;
}

const SIGNAL_PATTERNS: SignalPattern[] = [
  {
    type: "explicit_age_minor_under13",
    confidence: 0.99,
    patterns: [
      /\b(age[d]?|aged|has|is|im|i'm|turning)\s*(0?[1-9]|1[0-2])\b/i,
      /\b(0?[1-9]|1[0-2])\s*(years?\s*old|ans|Jahre|jaar|años|anni)\b/i,
      /\bunder\s*1[0-3]\b/i,
      /\bmoins\s*de\s*1[0-3]\b/i,
    ],
  },
  {
    type: "explicit_age_minor",
    confidence: 0.98,
    patterns: [
      /\b(1[3-9]|0?[1-9])\s*(years?\s*old|ans|Jahre|jaar|años|anni)\b/i,
      /\b(age[d]?|aged|has|is|im|i'm|turning)\s*(1[3-7])\b/i,
      /\bunder\s*(18|sixteen|seventeen|fifteen|fourteen)\b/i,
      /\bmoins\s*de\s*18\b/i,
      /\bunter\s*18\b/i,
      /\bmenor(es)?\s*de\s*18\b/i,
      /\bage\s*[:<]\s*18\b/i,
    ],
  },
  {
    type: "implicit_age_minor",
    confidence: 0.75,
    patterns: [
      /\b(my\s*)?(son|daughter|kid|child|children|toddler|teen|teenager|youngster|youth)\b/i,
      /\b(mon|ma)\s*(fils|fille|enfant|gamin|gamine|ado)\b/i,
      /\b(mein|meine)\s*(Sohn|Tochter|Kind|Jugendliche[r]?)\b/i,
      /\b(minor|minors|underage|under.age)\b/i,
      /\b(mineur|mineurs|mineure|mineures)\b/i,
      /\b(minderjährig|Minderjährige[r]?)\b/i,
      /\b(menore|minorenne)\b/i,
    ],
  },
  {
    type: "parental_role",
    confidence: 0.80,
    patterns: [
      /\b(parent|parents|guardian|guardians|mother|father|mom|dad|papa|mama)\b/i,
      /\b(parental\s*consent|consentement\s*parental|elterliche\s*Zustimmung)\b/i,
      /\b(tuteur|tutrice|responsable\s*légal)\b/i,
    ],
  },
  {
    type: "educational_context",
    confidence: 0.72,
    patterns: [
      /\b(school|schools|college|university|classroom|homework|lesson|student|pupils?|teacher)\b/i,
      /\b(école|collège|lycée|université|devoir|élève|enseignant|classe)\b/i,
      /\b(Schule|Klasse|Schüler|Lehrer|Hausaufgaben)\b/i,
      /\b(educational?\s*institution|learning\s*platform|e.?learning)\b/i,
    ],
  },
  {
    type: "edtech_context",
    confidence: 0.85,
    patterns: [
      /\b(edtech|ed.tech|lms|learning\s*management\s*system)\b/i,
      /\b(tutoring\s*(app|platform|service)|educational\s*(app|software|tool))\b/i,
      /\b(student\s*assessment|exam\s*monitoring|proctoring)\b/i,
      /\b(plateforme\s*(éducative|pédagogique)|logiciel\s*scolaire)\b/i,
    ],
  },
  {
    type: "advertising_context",
    confidence: 0.82,
    patterns: [
      /\b(targeted?\s*ad(vertising|s)?|behavioural?\s*ad(vertising)?|ad\s*targeting)\b/i,
      /\b(publicité\s*ciblée|ciblage\s*publicitaire)\b/i,
      /\b(interest.based\s*advertising|personalised?\s*ad(s|vertising)?)\b/i,
    ],
  },
  {
    type: "profiling_context",
    confidence: 0.83,
    patterns: [
      /\b(profil(ing|age)|user\s*profil(ing|e)|behavioural?\s*profil(ing|e))\b/i,
      /\b(profilage|profilage\s*comportemental)\b/i,
      /\b(recommendation\s*(engine|system|algorithm)|algorithmic\s*recommend)\b/i,
      /\b(tracking|fingerprinting|cross.site\s*track)\b/i,
    ],
  },
  {
    type: "automated_decision",
    confidence: 0.87,
    patterns: [
      /\b(automated?\s*decision|automatic\s*decision|algorithmic\s*decision)\b/i,
      /\b(décision\s*automatisée|traitement\s*automatisé)\b/i,
      /\b(solely\s*automated|without\s*human\s*(review|oversight))\b/i,
      /\bart\.?\s*22\s*(gdpr|rgpd)\b/i,
    ],
  },
  {
    type: "large_scale_processing",
    confidence: 0.78,
    patterns: [
      /\b(large.scale\s*processing|large\s*scale\s*data)\b/i,
      /\b(million[s]?\s*(of\s*)?(users?|records?|children|minors?))\b/i,
      /\b(traitement\s*à\s*grande\s*échelle)\b/i,
    ],
  },
  {
    type: "high_risk_ai",
    confidence: 0.88,
    patterns: [
      /\b(high.risk\s*ai|annex\s*iii|annexe\s*iii|haut\s*risque)\b/i,
      /\b(ai\s*act\s*(art\.?\s*)?(5|6|27)|forbidden\s*ai|prohibited\s*ai)\b/i,
      /\b(biometric\s*(categoris|identif)|emotion\s*(recognition|detect))\b/i,
      /\b(social\s*scor(ing|e)|predictive\s*polic)\b/i,
    ],
  },
  {
    type: "account_creation",
    confidence: 0.65,
    patterns: [
      /\b(sign\s*up|sign.up|register|create\s*(an?\s*)?account|inscription|s'inscrire)\b/i,
      /\b(age\s*(verification|check|gate)|vérification\s*de\s*l'âge)\b/i,
      /\b(date\s*of\s*birth|dob|date\s*de\s*naissance)\b/i,
    ],
  },
];

export function detectSignals(text: string): DetectedSignal[] {
  const detected: DetectedSignal[] = [];
  const seenTypes = new Set<SignalType>();

  for (const { type, patterns, confidence } of SIGNAL_PATTERNS) {
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        if (type === "explicit_age_minor" && seenTypes.has("explicit_age_minor_under13")) {
          continue;
        }
        detected.push({
          type,
          match: match[0],
          position: match.index,
          confidence,
        });
        seenTypes.add(type);
        break;
      }
    }
  }

  return detected.sort((a, b) => b.confidence - a.confidence);
}

export function hasMinorSignal(signals: DetectedSignal[]): boolean {
  return signals.some((s) =>
    s.type === "explicit_age_minor" ||
    s.type === "explicit_age_minor_under13" ||
    s.type === "implicit_age_minor"
  );
}
