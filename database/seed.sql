-- ============================================================
--  PARKING LOT MANAGEMENT SYSTEM
--  File        : seed.sql
--  Course      : UCS310 - Database Management Systems
--  Institute   : Thapar Institute of Engineering and Technology
--  Members     : Lovish Bansal (1024030297)
--                Vaibhav Budhia (1024030307)
--                Aayushi Uniyal (1024030308)
--  Description : Sample data for demo and testing.
--                ADMIN, OWNER, VEHICLE, PARKING_SLOT are
--                inserted directly (plain INSERT).
--                Past parking sessions are inserted directly
--                with realistic timestamps.
--                3 vehicles are left currently parked so
--                the views show live data during demo.
--  Prerequisite: Run in this order:
--                1. schema.sql
--                2. triggers.sql
--                3. procedures.sql
--                4. seed.sql  <-- you are here
-- ============================================================

USE parking_system;


-- ============================================================
--  STEP 1: ADMIN accounts
-- ============================================================

INSERT INTO ADMIN (Name, Username, Password, Role) VALUES
('Lovish Bansal',  'admin',    'admin123',    'admin'),
('Vaibhav Budhia', 'operator', 'operator123', 'operator');


-- ============================================================
--  STEP 2: OWNERS
-- ============================================================

INSERT INTO OWNER (Owner_Name, Phone, Email) VALUES
('Rajesh Kumar',   '9872011111', 'rajesh@gmail.com'),
('Priya Sharma',   '9872022222', 'priya@gmail.com'),
('Amit Singh',     '9872033333', 'amit@gmail.com'),
('Sunita Verma',   '9872044444', 'sunita@gmail.com'),
('Harpreet Kaur',  '9872055555', 'harpreet@gmail.com'),
('Deepak Gupta',   '9872066666', 'deepak@gmail.com');


-- ============================================================
--  STEP 3: VEHICLES
--  Each vehicle belongs to one owner.
--  Mixing vehicle types for variety in demo.
-- ============================================================

INSERT INTO VEHICLE (Vehicle_Number, Vehicle_Type, Owner_ID) VALUES
('PB08AB1234', 'four_wheeler', 1),
('PB08CD5678', 'two_wheeler',  2),
('PB10EF9012', 'four_wheeler', 3),
('CH01GH3456', 'two_wheeler',  4),
('PB65IJ7890', 'heavy',        5),
('PB13KL2345', 'four_wheeler', 6),
('CH04MN6789', 'two_wheeler',  1);  -- Rajesh owns 2 vehicles


-- ============================================================
--  STEP 4: PARKING SLOTS
--  12 slots across ground floor and first floor.
-- ============================================================

INSERT INTO PARKING_SLOT (Slot_Number, Slot_Type, Floor) VALUES
('G1', 'four_wheeler', 'Ground'),
('G2', 'four_wheeler', 'Ground'),
('G3', 'four_wheeler', 'Ground'),
('G4', 'four_wheeler', 'Ground'),
('G5', 'two_wheeler',  'Ground'),
('G6', 'two_wheeler',  'Ground'),
('G7', 'two_wheeler',  'Ground'),
('G8', 'heavy',        'Ground'),
('F1', 'four_wheeler', 'First'),
('F2', 'four_wheeler', 'First'),
('F3', 'two_wheeler',  'First'),
('F4', 'two_wheeler',  'First');


-- ============================================================
--  STEP 5: PAST PARKING SESSIONS — 2 days ago
--  Inserted directly with fixed timestamps so the revenue
--  view shows data across multiple days.
--  Amount is set manually here since we are bypassing
--  the trigger with historical timestamps.
-- ============================================================

-- 2 days ago: 3 completed sessions
INSERT INTO PARKING_RECORD (Vehicle_ID, Slot_ID, Entry_Time, Exit_Time, Amount) VALUES
(1, 1, NOW() - INTERVAL 2 DAY,
       NOW() - INTERVAL 2 DAY + INTERVAL 3 HOUR,  60.00),
(2, 5, NOW() - INTERVAL 2 DAY + INTERVAL 1 HOUR,
       NOW() - INTERVAL 2 DAY + INTERVAL 3 HOUR,  20.00),
(5, 8, NOW() - INTERVAL 2 DAY + INTERVAL 2 HOUR,
       NOW() - INTERVAL 2 DAY + INTERVAL 5 HOUR, 120.00);

INSERT INTO PAYMENT (Record_ID, Amount, Payment_Mode, Payment_Time) VALUES
(1, 60.00,  'cash', NOW() - INTERVAL 2 DAY + INTERVAL 3 HOUR),
(2, 20.00,  'upi',  NOW() - INTERVAL 2 DAY + INTERVAL 3 HOUR),
(3, 120.00, 'cash', NOW() - INTERVAL 2 DAY + INTERVAL 5 HOUR);


-- ============================================================
--  STEP 6: PAST PARKING SESSIONS — yesterday
-- ============================================================

INSERT INTO PARKING_RECORD (Vehicle_ID, Slot_ID, Entry_Time, Exit_Time, Amount) VALUES
(3, 2, NOW() - INTERVAL 1 DAY,
       NOW() - INTERVAL 1 DAY + INTERVAL 2 HOUR,  40.00),
(4, 6, NOW() - INTERVAL 1 DAY + INTERVAL 1 HOUR,
       NOW() - INTERVAL 1 DAY + INTERVAL 4 HOUR,  30.00),
(6, 3, NOW() - INTERVAL 1 DAY + INTERVAL 3 HOUR,
       NOW() - INTERVAL 1 DAY + INTERVAL 6 HOUR,  60.00),
(7, 7, NOW() - INTERVAL 1 DAY + INTERVAL 2 HOUR,
       NOW() - INTERVAL 1 DAY + INTERVAL 3 HOUR,  10.00);

INSERT INTO PAYMENT (Record_ID, Amount, Payment_Mode, Payment_Time) VALUES
(4, 40.00, 'card', NOW() - INTERVAL 1 DAY + INTERVAL 2 HOUR),
(5, 30.00, 'cash', NOW() - INTERVAL 1 DAY + INTERVAL 4 HOUR),
(6, 60.00, 'upi',  NOW() - INTERVAL 1 DAY + INTERVAL 6 HOUR),
(7, 10.00, 'cash', NOW() - INTERVAL 1 DAY + INTERVAL 3 HOUR);


-- ============================================================
--  STEP 7: TODAY — 3 active sessions (vehicles still parked)
--  These go through sp_vehicle_entry so the trigger fires
--  and slots are marked occupied automatically.
-- ============================================================

-- Vehicle 1 (PB08AB1234) enters slot for four_wheeler
CALL sp_vehicle_entry(1, 'four_wheeler');

-- Vehicle 2 (PB08CD5678) enters slot for two_wheeler
CALL sp_vehicle_entry(2, 'two_wheeler');

-- Vehicle 5 (PB65IJ7890) enters slot for heavy
CALL sp_vehicle_entry(5, 'heavy');


-- ============================================================
--  STEP 8: VERIFY everything loaded correctly
-- ============================================================

-- row counts
SELECT 'ADMIN'          AS Table_Name, COUNT(*) AS Rows FROM ADMIN          UNION ALL
SELECT 'OWNER',                        COUNT(*)          FROM OWNER          UNION ALL
SELECT 'VEHICLE',                      COUNT(*)          FROM VEHICLE        UNION ALL
SELECT 'PARKING_SLOT',                 COUNT(*)          FROM PARKING_SLOT   UNION ALL
SELECT 'PARKING_RECORD',               COUNT(*)          FROM PARKING_RECORD UNION ALL
SELECT 'PAYMENT',                      COUNT(*)          FROM PAYMENT;

-- currently occupied slots (should show 3)
SELECT * FROM vw_occupied_slots;

-- revenue per day (should show 2 days)
SELECT * FROM vw_daily_revenue;

-- ============================================================
--  END OF seed.sql
--  Your database is complete.
--  To demo entry:  CALL sp_vehicle_entry(3, 'four_wheeler');
--  To demo exit:   CALL sp_vehicle_exit(10, 'cash');
-- ============================================================
