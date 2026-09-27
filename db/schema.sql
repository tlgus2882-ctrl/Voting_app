CREATE TABLE IF NOT EXISTS polls (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS options (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  poll_id integer NOT NULL REFERENCES polls (id) ON DELETE CASCADE,
  text text NOT NULL,
  position integer NOT NULL,
  UNIQUE (poll_id, text),
  UNIQUE (poll_id, id)
);

CREATE TABLE IF NOT EXISTS votes (
  poll_id integer NOT NULL REFERENCES polls (id) ON DELETE CASCADE,
  option_id integer NOT NULL,
  voter_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (poll_id, voter_id),
  FOREIGN KEY (poll_id, option_id) REFERENCES options (poll_id, id) ON DELETE CASCADE
);

ALTER TABLE polls ADD COLUMN IF NOT EXISTS deadline timestamptz;

ALTER TABLE polls ADD COLUMN IF NOT EXISTS chart_type text NOT NULL DEFAULT 'horizontal-bar'
  CHECK (chart_type IN ('horizontal-bar', 'vertical-bar', 'donut'));
