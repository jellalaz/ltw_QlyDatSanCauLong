-- Remove redundant column from venues and seed 6 courts for venue id = 1.
-- Run this manually in MySQL.

START TRANSACTION;

-- 1) Remove denormalized column (safe for MySQL 8+)
ALTER TABLE venues
  DROP COLUMN IF EXISTS number_of_court;

-- 2) Ensure venue id=1 exists before seeding
-- If this query returns 0 rows, stop and fix venue id.
SELECT id, name FROM venues WHERE id = 1;

-- 3) Replace current courts of venue 1 with exactly 6 courts
DELETE FROM court WHERE venues_id = 1;

INSERT INTO court (description, is_active, venues_id)
VALUES
  ('San so 1', 1, 1),
  ('San so 2', 1, 1),
  ('San so 3', 1, 1),
  ('San so 4', 1, 1),
  ('San so 5', 1, 1),
  ('San so 6', 1, 1);

COMMIT;

-- 4) Verify
SELECT venues_id, COUNT(*) AS total_courts
FROM court
WHERE venues_id = 1
GROUP BY venues_id;

