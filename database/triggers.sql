-- ============================================================
--  PARKING LOT MANAGEMENT SYSTEM
--  File        : triggers.sql
--  Course      : UCS310 - Database Management Systems
--  Institute   : Thapar Institute of Engineering and Technology
--  Members     : Lovish Bansal (1024030297)
--                Vaibhav Budhia (1024030307)
--                Aayushi Uniyal (1024030308)
--  Description : Two triggers on PARKING_RECORD table.
--                Run this AFTER schema.sql.
-- ============================================================

USE parking_system;

DELIMITER $$


-- ============================================================
--  TRIGGER 1: trg_after_entry
--
--  When does it fire?
--    Automatically, right after a new row is inserted
--    into PARKING_RECORD (i.e. when a vehicle enters).
--
--  What does it do?
--    Marks the assigned parking slot as 'occupied'
--    so no other vehicle gets assigned that same slot.
--
--  NEW.Slot_ID = the Slot_ID from the row just inserted.
-- ============================================================

CREATE TRIGGER trg_after_entry
AFTER INSERT ON PARKING_RECORD
FOR EACH ROW
BEGIN
    UPDATE PARKING_SLOT
    SET    Status = 'occupied'
    WHERE  Slot_ID = NEW.Slot_ID;
END$$


-- ============================================================
--  TRIGGER 2: trg_before_exit
--
--  When does it fire?
--    Automatically, just before PARKING_RECORD is updated.
--    This happens when the operator sets Exit_Time
--    (i.e. when a vehicle is leaving).
--
--  What does it do?
--    Step 1 - calculates how many hours the vehicle was parked
--             using TIMESTAMPDIFF
--    Step 2 - looks up the vehicle type to find the hourly rate
--             two_wheeler  = Rs. 10 per hour
--             four_wheeler = Rs. 20 per hour
--             heavy        = Rs. 40 per hour
--    Step 3 - multiplies hours x rate to get the total fee
--             and writes it into the Amount column
--    Step 4 - marks the slot back to 'available'
--             so the next vehicle can use it
--
--  We use BEFORE UPDATE so that Amount is already filled
--  by the time the UPDATE is saved to the table.
--
--  OLD.Exit_Time IS NULL check makes sure this only runs
--  when Exit_Time is being set for the first time,
--  not on any other future updates to the same row.
-- ============================================================

CREATE TRIGGER trg_before_exit
BEFORE UPDATE ON PARKING_RECORD
FOR EACH ROW
BEGIN
    DECLARE v_hours  INT;
    DECLARE v_rate   INT;
    DECLARE v_type   VARCHAR(20);

    -- only run when Exit_Time is being set for the first time
    IF OLD.Exit_Time IS NULL AND NEW.Exit_Time IS NOT NULL THEN

        -- Step 1: calculate hours parked (minimum 1 hour charged)
        SET v_hours = TIMESTAMPDIFF(HOUR, OLD.Entry_Time, NEW.Exit_Time);

        IF v_hours < 1 THEN
            SET v_hours = 1;
        END IF;

        -- Step 2: find vehicle type for this record
        SELECT Vehicle_Type INTO v_type
        FROM   VEHICLE
        WHERE  Vehicle_ID = OLD.Vehicle_ID;

        -- Step 3: set hourly rate based on vehicle type
        IF v_type = 'two_wheeler' THEN
            SET v_rate = 10;
        ELSEIF v_type = 'heavy' THEN
            SET v_rate = 40;
        ELSE
            SET v_rate = 20;  -- default: four_wheeler
        END IF;

        -- Step 4: write the calculated amount into the row
        SET NEW.Amount = v_hours * v_rate;

        -- Step 5: free the slot
        UPDATE PARKING_SLOT
        SET    Status = 'available'
        WHERE  Slot_ID = OLD.Slot_ID;

    END IF;
END$$


DELIMITER ;


-- ============================================================
--  VERIFY both triggers were created
-- ============================================================

SELECT
    TRIGGER_NAME        AS Trigger_Name,
    EVENT_MANIPULATION  AS Fires_On,
    ACTION_TIMING       AS When_It_Fires,
    EVENT_OBJECT_TABLE  AS On_Table
FROM
    information_schema.TRIGGERS
WHERE
    TRIGGER_SCHEMA = 'parking_system';

-- ============================================================
--  END OF triggers.sql
--  Next file to run: procedures.sql
-- ============================================================
