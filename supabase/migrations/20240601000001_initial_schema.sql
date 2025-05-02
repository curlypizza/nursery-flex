-- Create tables for the nursery slot booking system

-- Create age_groups table
CREATE TABLE IF NOT EXISTS age_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_age_months INTEGER NOT NULL,
  max_age_months INTEGER NOT NULL,
  staff_ratio INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create staff_qualification_levels table
CREATE TABLE IF NOT EXISTS staff_qualification_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  qualification_level_id UUID REFERENCES staff_qualification_levels(id),
  is_pfa_holder BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create nursery_details table
CREATE TABLE IF NOT EXISTS nursery_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  max_capacity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create slots table
CREATE TABLE IF NOT EXISTS slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  session TEXT NOT NULL, -- 'Morning', 'Afternoon', 'Full Day'
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date, session)
);

-- Create slot_age_group_capacity table
CREATE TABLE IF NOT EXISTS slot_age_group_capacity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES slots(id) ON DELETE CASCADE,
  age_group_id UUID REFERENCES age_groups(id) ON DELETE CASCADE,
  max_capacity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(slot_id, age_group_id)
);

-- Create staff_schedules table
CREATE TABLE IF NOT EXISTS staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES slots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, slot_id)
);

-- Create users table (to extend auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'parent', -- 'parent', 'admin', 'staff'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age_group_id UUID REFERENCES age_groups(id),
  special_requirements TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES slots(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, slot_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_age_group_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursery_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_qualification_levels ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own data
DROP POLICY IF EXISTS "Users can read their own data" ON users;
CREATE POLICY "Users can read their own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Parents can read their own children
CREATE POLICY "Parents can read their own children"
ON children FOR SELECT
USING (auth.uid() = user_id);

-- Parents can create children
CREATE POLICY "Parents can create children"
ON children FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Parents can update their own children
CREATE POLICY "Parents can update their own children"
ON children FOR UPDATE
USING (auth.uid() = user_id);

-- Parents can read their own bookings
CREATE POLICY "Parents can read their own bookings"
ON bookings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM children
  WHERE children.id = bookings.child_id
  AND children.user_id = auth.uid()
));

-- Parents can create bookings for their own children
CREATE POLICY "Parents can create bookings for their own children"
ON bookings FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM children
  WHERE children.id = bookings.child_id
  AND children.user_id = auth.uid()
));

-- Everyone can read slots
CREATE POLICY "Everyone can read slots"
ON slots FOR SELECT
USING (true);

-- Everyone can read age groups
CREATE POLICY "Everyone can read age groups"
ON age_groups FOR SELECT
USING (true);

-- Admin policies
-- Admins can read all data
CREATE POLICY "Admins can read all users"
ON users FOR SELECT
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

CREATE POLICY "Admins can read all children"
ON children FOR SELECT
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

CREATE POLICY "Admins can read all bookings"
ON bookings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

CREATE POLICY "Admins can read all staff"
ON staff FOR SELECT
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

-- Admins can create and update all data
CREATE POLICY "Admins can create slots"
ON slots FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

CREATE POLICY "Admins can update slots"
ON slots FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

-- Insert initial data
INSERT INTO staff_qualification_levels (name, description) VALUES
('Unqualified/Other', 'No formal childcare qualifications'),
('Student/Apprentice (Studying Level 2)', 'Currently studying for Level 2 qualification'),
('Student/Apprentice (Studying Level 3/6)', 'Currently studying for Level 3 or 6 qualification'),
('Level 2 Approved', 'Has Level 2 childcare qualification'),
('Level 3 Approved', 'Has Level 3 childcare qualification'),
('QTS / EYTS / EYPS / Level 6+', 'Has Qualified Teacher Status or equivalent');

INSERT INTO age_groups (name, min_age_months, max_age_months, staff_ratio) VALUES
('Under 2', 0, 24, 3),
('2-3 years', 24, 36, 4),
('3-5 years', 36, 60, 8);

INSERT INTO nursery_details (name, max_capacity) VALUES
('Happy Days Nursery', 50);

-- Enable realtime for all tables
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table children;
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table staff;
alter publication supabase_realtime add table staff_schedules;
alter publication supabase_realtime add table slots;
alter publication supabase_realtime add table slot_age_group_capacity;
alter publication supabase_realtime add table nursery_details;
alter publication supabase_realtime add table age_groups;
alter publication supabase_realtime add table staff_qualification_levels;