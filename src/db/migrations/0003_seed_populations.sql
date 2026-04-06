-- Aegis: Protected Populations Seed
-- Auto-generated — do not edit manually

INSERT INTO populations (code, name, category)
VALUES
  ('general', 'General population', 'general'),
  ('women', 'Women', 'gender'),
  ('men', 'Men', 'gender'),
  ('non_binary', 'Non-binary / gender diverse', 'gender'),
  ('african_descent', 'People of African descent', 'ethnic'),
  ('roma', 'Roma and Travellers', 'ethnic'),
  ('turkish', 'Turkish background', 'ethnic'),
  ('north_african', 'North African background', 'ethnic'),
  ('south_asian', 'South Asian background', 'ethnic'),
  ('east_asian', 'East Asian background', 'ethnic'),
  ('sub_saharan', 'Sub-Saharan African background', 'ethnic'),
  ('jewish', 'Jewish people', 'religion'),
  ('muslim', 'Muslim people', 'religion'),
  ('lgbtiq', 'LGBTIQ+ people', 'sexual_orientation'),
  ('lesbian', 'Lesbian women', 'sexual_orientation'),
  ('gay', 'Gay men', 'sexual_orientation'),
  ('bisexual', 'Bisexual people', 'sexual_orientation'),
  ('transgender', 'Transgender people', 'gender_identity'),
  ('intersex', 'Intersex people', 'gender_identity'),
  ('disability_physical', 'People with physical disabilities', 'disability'),
  ('disability_mental', 'People with mental health conditions', 'disability'),
  ('disability_intellectual', 'People with intellectual disabilities', 'disability'),
  ('disability_sensory', 'People with sensory disabilities', 'disability'),
  ('elderly_65plus', 'Elderly (65+)', 'age'),
  ('youth_16_24', 'Youth (16-24)', 'age'),
  ('children', 'Children (under 18)', 'age'),
  ('migrants_recent', 'Recent migrants (< 5 years)', 'migration'),
  ('migrants_undocumented', 'Undocumented migrants', 'migration'),
  ('asylum_seekers', 'Asylum seekers', 'migration'),
  ('refugees', 'Refugees', 'migration'),
  ('low_income', 'Low-income individuals', 'socioeconomic'),
  ('rural', 'Rural population', 'geographic')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category;
