CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  owner_name TEXT,
  first_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  website TEXT,
  rating NUMERIC,
  review_count INT,
  city TEXT,
  niche TEXT,
  score INT DEFAULT 50,
  status TEXT DEFAULT 'new',
  notes TEXT,
  estimated_value INT DEFAULT 200,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  email_number INT NOT NULL,
  subject_variant TEXT,
  subject TEXT,
  body TEXT,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  open_count INT DEFAULT 0,
  replied_at TIMESTAMPTZ,
  gmail_message_id TEXT,
  gmail_thread_id TEXT,
  status TEXT DEFAULT 'queued',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id UUID REFERENCES sends(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  body TEXT,
  category TEXT,
  handled BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  full_name TEXT,
  business_name TEXT,
  phone TEXT,
  physical_address TEXT,
  gmail_address TEXT,
  gmail_refresh_token TEXT,
  send_rate INT DEFAULT 40,
  demo_link TEXT,
  booking_link TEXT,
  monthly_price INT DEFAULT 200,
  niche TEXT,
  cities TEXT[],
  value_prop TEXT,
  paused BOOLEAN DEFAULT TRUE,
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_sends_status ON sends(status);
CREATE INDEX IF NOT EXISTS idx_sends_scheduled ON sends(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_sends_variant ON sends(subject_variant);
CREATE INDEX IF NOT EXISTS idx_replies_handled ON replies(handled);

ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE sends DISABLE ROW LEVEL SECURITY;
ALTER TABLE replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
