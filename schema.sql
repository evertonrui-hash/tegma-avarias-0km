CREATE TABLE IF NOT EXISTS occurrences (
  id TEXT PRIMARY KEY,
  occurrence_date TEXT NOT NULL,
  status TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_occurrences_date ON occurrences(occurrence_date);
CREATE INDEX IF NOT EXISTS idx_occurrences_status ON occurrences(status);
