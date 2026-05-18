CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  identifier   VARCHAR(256)  NOT NULL,
  window_start TIMESTAMPTZ   NOT NULL DEFAULT date_trunc('minute', NOW()),
  count        INTEGER       NOT NULL DEFAULT 1,
  PRIMARY KEY (identifier, window_start)
);

CREATE INDEX IF NOT EXISTS rlb_window_idx ON rate_limit_buckets (window_start);
