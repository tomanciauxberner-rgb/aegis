-- ═══════════════════════════════════════════════════════════════
-- Aegis Children v2 — DSA Article 28 (protection of minors) tracker
-- Investigations, guidelines and recommendations under the DSA.
-- All entries verified and sourced. Run ONCE in Supabase. Re-runnable.
-- ═══════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE dsa_action_type AS ENUM (
    'investigation', 'preliminary_finding', 'guidelines',
    'recommendation', 'information_request', 'coordinated_action'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE dsa_action_status AS ENUM (
    'ongoing', 'preliminary', 'adopted', 'closed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS children_dsa_minors (
  id                VARCHAR(80)  PRIMARY KEY,
  action_type       dsa_action_type NOT NULL,
  status            dsa_action_status NOT NULL,
  target            VARCHAR(160),
  title             TEXT         NOT NULL,
  summary           TEXT         NOT NULL,
  dsa_article       VARCHAR(40)  NOT NULL DEFAULT 'Art. 28',
  concerns          JSONB        NOT NULL DEFAULT '[]',
  action_date       DATE         NOT NULL,
  source_url        TEXT         NOT NULL,
  is_verified       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dsa_minors_date_idx   ON children_dsa_minors (action_date DESC);
CREATE INDEX IF NOT EXISTS dsa_minors_type_idx   ON children_dsa_minors (action_type);
CREATE INDEX IF NOT EXISTS dsa_minors_status_idx ON children_dsa_minors (status);

INSERT INTO children_dsa_minors (id, action_type, status, target, title, summary, dsa_article, concerns, action_date, source_url) VALUES
  (
    'ec-guidelines-minors-2025', 'guidelines', 'adopted', NULL,
    'Commission Guidelines on the protection of minors (Art. 28 DSA)',
    'On 14 July 2025 the Commission adopted guidelines under Article 28(1) detailing concrete measures platforms accessible to minors should take: private-by-default accounts, recommender systems adapted to reduce rabbit-hole effects, disabling addictive features (streaks, autoplay, push notifications, read receipts), and stronger anti-cyberbullying tools. A privacy-preserving age-verification blueprint was released alongside.',
    'Art. 28(1)', '["private_by_default","addictive_design","recommender_systems","cyberbullying","age_verification"]',
    '2025-07-14', 'https://digital-strategy.ec.europa.eu/en/policies/dsa-impact-platforms'
  ),
  (
    'ec-tiktok-addictive-2026', 'preliminary_finding', 'preliminary', 'TikTok',
    'Commission preliminary findings — TikTok addictive design',
    'In February 2026 the Commission accused TikTok of exposing teenagers to risks linked to addictive design features (infinite scroll, rabbit-hole effect, behavioural addiction), finding its risk-mitigation tools (screen-time and parental controls) insufficient under the DSA.',
    'Art. 28', '["addictive_design","recommender_systems","behavioural_addiction"]',
    '2026-02-01', 'https://www.matheson.com/insights/eu-commission-finds-platforms-addictive-design-breaches-dsa/'
  ),
  (
    'ec-meta-age-2026', 'preliminary_finding', 'preliminary', 'Meta (Facebook, Instagram)',
    'Commission preliminary findings — Meta age assurance',
    'In April 2026 the Commission preliminarily found Meta in breach of the DSA for failing to prevent minors under 13 from accessing Facebook and Instagram, citing inadequate age-assurance measures based largely on self-declaration rather than verification.',
    'Art. 28', '["age_verification","underage_access","age_assurance"]',
    '2026-04-01', 'https://www.techpolicy.press/eu-intensifies-child-safety-enforcement-flags-gaps-in-meta-age-checks/'
  ),
  (
    'ec-snapchat-2026', 'investigation', 'ongoing', 'Snapchat',
    'Commission investigation — Snapchat minors protection',
    'In March 2026 the Commission opened an investigation into Snapchat for not preventing users under 13 from accessing the app, and for not adequately assessing whether users are under 17 to ensure an age-appropriate experience.',
    'Art. 28', '["age_verification","underage_access","age_appropriate_design"]',
    '2026-03-01', 'https://fpf.org/blog/the-eu-commissions-approach-to-age-verification-mobile-apps-dsa-enforcement-and-challenging-national-social-media-bans/'
  ),
  (
    'ec-info-request-2025', 'information_request', 'ongoing', 'Snapchat, YouTube, Apple App Store, Google Play',
    'Commission information requests — minors protection measures',
    'On 10 October 2025 the Commission requested information from Snapchat, YouTube, the Apple App Store and Google Play to assess the measures they use to protect minors — the first enforcement step following the July 2025 Guidelines on the Protection of Minors.',
    'Art. 28', '["age_verification","app_store_responsibility","underage_access"]',
    '2025-10-10', 'https://eucrim.eu/news/overview-of-the-latest-developments-on-the-dsa-may-mid-october-2025/'
  ),
  (
    'ec-age-verification-rec-2026', 'recommendation', 'adopted', NULL,
    'Commission Recommendation on age verification',
    'The Commission encourages Member States to make its privacy-preserving EU age-verification app available by 31 December 2026, either standalone or integrated into the European Digital Identity Wallet. A prototype is being tested with Denmark, Greece, Spain, France and Italy.',
    'Art. 28', '["age_verification","eudi_wallet","privacy_preserving"]',
    '2026-04-01', 'https://www.techpolicy.press/eu-intensifies-child-safety-enforcement-flags-gaps-in-meta-age-checks/'
  ),
  (
    'ebds-coordinated-minors-2025', 'coordinated_action', 'ongoing', NULL,
    'European Board for Digital Services — coordinated action on minors',
    'The European Board for Digital Services launched a coordinated action across Member States to strengthen protection of minors from pornographic content on smaller platforms, with national authorities sharing enforcement methods based on the Article 28 guidelines.',
    'Art. 28', '["coordinated_enforcement","harmful_content","age_verification"]',
    '2025-11-01', 'https://cfg.eu/enforcement-spotlight-autumn-2025/'
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  summary = EXCLUDED.summary,
  concerns = EXCLUDED.concerns;

SELECT action_type, status, target, action_date FROM children_dsa_minors ORDER BY action_date DESC;
