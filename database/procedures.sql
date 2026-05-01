-- ============================================================
--  PARKING LOT MANAGEMENT SYSTEM
--  File        : procedures.sql
--  Course      : UCS310 - Database Management Systems
--  Institute   : Thapar Institute of Engineering and Technology
--  Members     : Lovish Bansal (1024030297)
--                Vaibhav Budhia (1024030307)
--                Aayushi Uniyal (1024030308)
--  Description : Two stored procedures for entry and exit,
--                plus two simple views for reporting.
--                Run this AFTER triggers.sql.
-- ============================================================

USE parking_system;

DELIMITER $$


-- ============================================================
--  PROCEDURE 1: sp_vehicle_entry
--
--  What it does:
--    The operator calls this when a vehicle arrives.
--    It checks if a matching slot is free, then logs
--    the vehicle entry into PARKING_RECORD.
--    The trigger trg_after_entry fires automatically
--    after this and marks the slot as occupied.
--
--  Parameters:
--    p_vehicle_id  - ID of the vehicle entering
--    p_slot_type   - type of slot needed (two_wheeler /
--                    four_wheeler / heavy)
--
--  How to call it:
--    CALL sp_vehicle_entry(1, 'four_wheeler');
-- ============================================================

CREATE PROCEDURE sp_vehicle_entry (
    IN p_vehicle_id  INT,
    IN p_slot_type   VARCHAR(20)
)
BEGIN
    DECLARE v_slot_id    INT;
    DECLARE v_slot_num   VARCHAR(10);

    -- find the first available slot matching the type needed
    SELECT Slot_ID, Slot_Number
    INTO   v_slot_id, v_slot_num
    FROM   PARKING_SLOT
    WHERE  Status    = 'available'
    AND    Slot_Type = p_slot_type
    ORDER  BY Slot_ID
    LIMIT  1;

    -- if no slot found, stop and show an error
    IF v_slot_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No available slot for this vehicle type.';
    END IF;

    -- log the entry (trigger fires here and marks slot occupied)
    INSERT INTO PARKING_RECORD (Vehicle_ID, Slot_ID, Entry_Time)
    VALUES (p_vehicle_id, v_slot_id, NOW());

    -- show the operator which slot was assigned
    SELECT
        'Entry logged'   AS Status,
        v_slot_num       AS Assigned_Slot,
        NOW()            AS Entry_Time;

END$$


-- ============================================================
--  PROCEDURE 2: sp_vehicle_exit
--
--  What it does:
--    The operator calls this when a vehicle is leaving.
--    It sets Exit_Time on the parking record.
--    The trigger trg_before_exit fires automatically,
--    calculates the fee, writes it into Amount, and
--    marks the slot available again.
--    Then this procedure creates a PAYMENT row.
--
--  Parameters:
--    p_record_id    - the parking record to close
--    p_payment_mode - how the customer is paying
--                     (cash / card / upi)
--
--  How to call it:
--    CALL sp_vehicle_exit(1, 'cash');
-- ============================================================

CREATE PROCEDURE sp_vehicle_exit (
    IN p_record_id    INT,
    IN p_payment_mode VARCHAR(10)
)
BEGIN
    DECLARE v_amount  DECIMAL(8,2);
    DECLARE v_check   INT;

    -- make sure this record exists and is still open
    SELECT COUNT(*) INTO v_check
    FROM   PARKING_RECORD
    WHERE  Record_ID = p_record_id
    AND    Exit_Time IS NULL;

    IF v_check = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Record not found or vehicle already exited.';
    END IF;

    -- set exit time (this fires trg_before_exit automatically)
    -- the trigger writes Amount into the row before saving
    UPDATE PARKING_RECORD
    SET    Exit_Time = NOW()
    WHERE  Record_ID = p_record_id;

    -- read the amount the trigger just calculated
    SELECT Amount INTO v_amount
    FROM   PARKING_RECORD
    WHERE  Record_ID = p_record_id;

    -- create the payment record
    INSERT INTO PAYMENT (Record_ID, Amount, Payment_Mode)
    VALUES (p_record_id, v_amount, p_payment_mode);

    -- show the bill to the operator
    SELECT
        'Exit logged'    AS Status,
        p_record_id      AS Record_ID,
        v_amount         AS Amount_Due,
        p_payment_mode   AS Payment_Mode;

END$$


DELIMITER ;


-- ============================================================
--  VIEW 1: vw_occupied_slots
--  Shows all currently occupied slots with vehicle details.
--  Useful for the operator to see what's parked where.
-- ============================================================

CREATE OR REPLACE VIEW vw_occupied_slots AS
SELECT
    ps.Slot_Number,
    ps.Slot_Type,
    ps.Floor,
    v.Vehicle_Number,
    o.Owner_Name,
    o.Phone,
    pr.Entry_Time,
    TIMESTAMPDIFF(HOUR, pr.Entry_Time, NOW()) AS Hours_So_Far
FROM
    PARKING_SLOT   ps
JOIN PARKING_RECORD pr ON ps.Slot_ID    = pr.Slot_ID
                      AND pr.Exit_Time  IS NULL
JOIN VEHICLE        v  ON pr.Vehicle_ID = v.Vehicle_ID
JOIN OWNER          o  ON v.Owner_ID    = o.Owner_ID;


-- ============================================================
--  VIEW 2: vw_daily_revenue
--  Shows total amount collected per day from payments.
--  Useful for the admin to track daily earnings.
-- ============================================================

CREATE OR REPLACE VIEW vw_daily_revenue AS
SELECT
    DATE(Payment_Time)  AS Payment_Date,
    COUNT(*)            AS Total_Transactions,
    SUM(Amount)         AS Total_Revenue
FROM
    PAYMENT
GROUP BY
    DATE(Payment_Time)
ORDER BY
    Payment_Date DESC;


-- ============================================================
--  VERIFY procedures and views were created
-- ============================================================

-- check procedures
SELECT ROUTINE_NAME AS Procedure_Name
FROM   information_schema.ROUTINES
WHERE  ROUTINE_SCHEMA = 'parking_system'
AND    ROUTINE_TYPE   = 'PROCEDURE';

-- check views
SELECT TABLE_NAME AS View_Name
FROM   information_schema.VIEWS
WHERE  TABLE_SCHEMA = 'parking_system';

-- ============================================================
--  END OF procedures.sql
--  Next file to run: seed.sql
-- ============================================================
