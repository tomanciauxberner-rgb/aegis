-- ============================================================
-- AEGIS — Fix convergence severity logic
-- Problem: all countries showing CRITICAL because severity was
-- derived purely from convergence_score (3 signal types = critical)
-- Fix: severity now considers actual signal severity distribution
-- ============================================================

-- Drop and recreate the RPC
DROP FUNCTION IF EXISTS recompute_convergence();

CREATE OR REPLACE FUNCTION recompute_convergence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM convergence_alerts WHERE is_active = true;

  INSERT INTO convergence_alerts (
    country, group_id, sector,
    convergence_score,
    severity,
    has_statistical, has_legislative, has_incident,
    signal_ids, signal_details,
    headline, is_active, last_computed_at
  )
  SELECT
    s.country,
    s.group_id,
    s.sector,
    COUNT(DISTINCT s.signal_type)::int AS convergence_score,
    CASE
      WHEN COUNT(DISTINCT s.signal_type) = 3
           AND COUNT(*) FILTER (WHERE s.severity = 'critical') >= 2
        THEN 'critical'
      WHEN COUNT(DISTINCT s.signal_type) = 3
           AND COUNT(*) FILTER (WHERE s.severity IN ('critical','elevated')) >= 1
        THEN 'elevated'
      WHEN COUNT(DISTINCT s.signal_type) >= 2
           AND COUNT(*) FILTER (WHERE s.severity = 'critical') >= 1
        THEN 'elevated'
      WHEN COUNT(DISTINCT s.signal_type) >= 2
        THEN 'watch'
      ELSE 'watch'
    END AS severity,
    bool_or(s.signal_type = 'statistical') AS has_statistical,
    bool_or(s.signal_type = 'legislative') AS has_legislative,
    bool_or(s.signal_type = 'incident')    AS has_incident,
    array_agg(s.id) AS signal_ids,
    jsonb_agg(
      jsonb_build_object(
        'signal_type', s.signal_type,
        'title', s.title,
        'summary', s.summary,
        'delta_pp', CASE
          WHEN s.value_eu_avg IS NOT NULL AND s.value_eu_avg > 0
          THEN round((s.value_observed - s.value_eu_avg)::numeric, 1)
          ELSE NULL
        END,
        'source', s.source_label,
        'year', s.year_observed
      )
      ORDER BY
        CASE s.severity WHEN 'critical' THEN 0 WHEN 'elevated' THEN 1 ELSE 2 END,
        s.year_observed DESC NULLS LAST
    ) AS signal_details,
    (
      SELECT t.title FROM signals t
      WHERE t.country = s.country
        AND t.group_id = s.group_id
        AND t.sector = s.sector
        AND t.is_active = true
      ORDER BY
        CASE t.severity WHEN 'critical' THEN 0 WHEN 'elevated' THEN 1 ELSE 2 END,
        t.year_observed DESC NULLS LAST
      LIMIT 1
    ) AS headline,
    true AS is_active,
    now() AS last_computed_at
  FROM signals s
  WHERE s.is_active = true
  GROUP BY s.country, s.group_id, s.sector
  HAVING COUNT(DISTINCT s.signal_type) >= 1;
END;
$$;

-- Recreate the view with proper ordering
DROP VIEW IF EXISTS active_alerts_ranked;

CREATE OR REPLACE VIEW active_alerts_ranked AS
SELECT
  ca.*,
  CASE ca.severity
    WHEN 'critical' THEN 0
    WHEN 'elevated' THEN 1
    WHEN 'watch'    THEN 2
  END AS severity_order
FROM convergence_alerts ca
WHERE ca.is_active = true
ORDER BY
  CASE ca.severity
    WHEN 'critical' THEN 0
    WHEN 'elevated' THEN 1
    WHEN 'watch'    THEN 2
  END,
  ca.convergence_score DESC,
  ca.country;
