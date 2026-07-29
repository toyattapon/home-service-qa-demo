CREATE TABLE users (
  id text PRIMARY KEY,
  name varchar(100) NOT NULL,
  email varchar(254) NOT NULL,
  password varchar(200) NOT NULL,
  role varchar(20) NOT NULL CHECK (role IN ('admin', 'technician')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_lower_unique ON users (lower(email));

CREATE TABLE technicians (
  id text PRIMARY KEY,
  user_id text UNIQUE REFERENCES users(id),
  name varchar(100) NOT NULL,
  phone varchar(10) NOT NULL CHECK (phone ~ '^[0-9]{10}$'),
  active boolean NOT NULL DEFAULT true,
  skill_tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE customers (
  id text PRIMARY KEY,
  name varchar(50) NOT NULL CHECK (char_length(name) BETWEEN 2 AND 50),
  phone varchar(10) NOT NULL CHECK (phone ~ '^[0-9]{10}$'),
  address varchar(200) NOT NULL CHECK (char_length(address) BETWEEN 5 AND 200),
  ac_brand varchar(100),
  btu integer NOT NULL CHECK (btu IN (9000, 12000, 18000, 24000)),
  ac_type varchar(30) NOT NULL
    CHECK (ac_type IN ('Wall Type', 'Cassette', 'Floor Standing', 'Portable')),
  note varchar(300),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE inventory_items (
  id text PRIMARY KEY,
  name varchar(100) NOT NULL UNIQUE,
  stock integer NOT NULL CHECK (stock >= 0),
  safety_stock integer NOT NULL CHECK (safety_stock >= 0),
  unit_cost numeric(12, 2) NOT NULL CHECK (unit_cost >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE jobs (
  id text PRIMARY KEY,
  customer_id text NOT NULL REFERENCES customers(id),
  service_type varchar(20) NOT NULL
    CHECK (service_type IN ('Cleaning', 'Repair', 'Installation')),
  preferred_date date NOT NULL,
  time_slot varchar(20) NOT NULL
    CHECK (time_slot IN ('08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00')),
  technician_id text REFERENCES technicians(id),
  number_of_units integer NOT NULL CHECK (number_of_units BETWEEN 1 AND 5),
  priority varchar(10) NOT NULL CHECK (priority IN ('Normal', 'Urgent')),
  problem_description varchar(500),
  status varchar(20) NOT NULL
    CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (status = 'Pending' AND technician_id IS NULL)
    OR status <> 'Pending'
  ),
  CHECK (
    status IN ('Pending', 'Cancelled')
    OR technician_id IS NOT NULL
  )
);

CREATE INDEX jobs_customer_id_index ON jobs (customer_id);
CREATE INDEX jobs_status_index ON jobs (status);
CREATE INDEX jobs_preferred_date_index ON jobs (preferred_date);
CREATE INDEX jobs_technician_id_index ON jobs (technician_id);

CREATE UNIQUE INDEX jobs_active_technician_slot_unique
ON jobs (technician_id, preferred_date, time_slot)
WHERE technician_id IS NOT NULL
  AND status IN ('Assigned', 'In Progress');

CREATE TABLE job_used_parts (
  job_id text NOT NULL REFERENCES jobs(id),
  inventory_item_id text NOT NULL REFERENCES inventory_items(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (job_id, inventory_item_id)
);

CREATE TABLE invoices (
  id text PRIMARY KEY,
  job_id text NOT NULL UNIQUE REFERENCES jobs(id),
  service_fee numeric(12, 2) NOT NULL CHECK (service_fee >= 0),
  urgent_surcharge numeric(12, 2) NOT NULL CHECK (urgent_surcharge >= 0),
  parts_cost numeric(12, 2) NOT NULL CHECK (parts_cost >= 0),
  subtotal numeric(12, 2) NOT NULL CHECK (subtotal >= 0),
  vat numeric(12, 2) NOT NULL CHECK (vat >= 0),
  total numeric(12, 2) NOT NULL CHECK (total >= 0),
  status varchar(10) NOT NULL CHECK (status IN ('Unpaid', 'Paid')),
  receipt_no varchar(40) UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  CHECK (
    (status = 'Unpaid' AND receipt_no IS NULL AND paid_at IS NULL)
    OR (status = 'Paid' AND receipt_no IS NOT NULL AND paid_at IS NOT NULL)
  )
);

CREATE INDEX invoices_status_index ON invoices (status);
