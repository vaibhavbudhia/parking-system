-- ============================================================
--  PARKING LOT MANAGEMENT SYSTEM
--  File        : additions.sql
--  Description : Adds the missing PL/SQL requirements:
--                1. fn_calculate_fee  — stored function
--                2. sp_revenue_report — procedure using cursor
--  Run this AFTER procedures.sql
-- ============================================================

USE parking_system;

DELIMITER $$


-- ============================================================
--  FUNCTION: fn_calculate_fee
--  Calculates parking fee based on hours and vehicle type.
--  Called manually to get a fee estimate for any vehicle.
--
--  Rates:
--    two_wheeler  = Rs. 10 per hour
--    four_wheeler = Rs. 20 per hour
--    heavy        = Rs. 40 per hour
--
--  Usage:
--    SELECT fn_calculate_fee(3, 'four_wheeler');
--    → returns 60
-- ============================================================

CREATE FUNCTION fn_calculate_fee (
    p_hours        INT,
    p_vehicle_type VARCHAR(20)
)
RETURNS DECIMAL(8,2)
DETERMINISTIC
BEGIN
    DECLARE v_rate  INT;
    DECLARE v_total DECIMAL(8,2);

    IF p_hours < 1 THEN
        SET p_hours = 1;
    END IF;

    IF p_vehicle_type = 'two_wheeler' THEN
        SET v_rate = 10;
    ELSEIF p_vehicle_type = 'heavy' THEN
        SET v_rate = 40;
    ELSE
        SET v_rate = 20;
    END IF;

    SET v_total = p_hours * v_rate;
    RETURN v_total;
END$$


-- ============================================================
--  PROCEDURE WITH CURSOR: sp_revenue_report
--  Uses a cursor to loop through all payments and
--  calculate total revenue per vehicle type.
--  This is a classic cursor use case — iterating rows
--  one by one and accumulating values.
--
--  Usage:
--    CALL sp_revenue_report();
-- ============================================================

CREATE PROCEDURE sp_revenue_report()
BEGIN
    -- variables to hold each row from the cursor
    DECLARE v_vehicle_type  VARCHAR(20);
    DECLARE v_amount        DECIMAL(8,2);
    DECLARE v_done          INT DEFAULT 0;

    -- accumulators
    DECLARE v_two_total     DECIMAL(10,2) DEFAULT 0;
    DECLARE v_four_total    DECIMAL(10,2) DEFAULT 0;
    DECLARE v_heavy_total   DECIMAL(10,2) DEFAULT 0;
    DECLARE v_grand_total   DECIMAL(10,2) DEFAULT 0;

    -- declare the cursor — fetches vehicle type and amount
    -- for every completed parking session that has a payment
    DECLARE revenue_cursor CURSOR FOR
        SELECT v.Vehicle_Type, p.Amount
        FROM   PAYMENT        p
        JOIN   PARKING_RECORD pr ON p.Record_ID  = pr.Record_ID
        JOIN   VEHICLE        v  ON pr.Vehicle_ID = v.Vehicle_ID
        WHERE  pr.Exit_Time IS NOT NULL;

    -- when cursor runs out of rows, set v_done = 1
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    -- open and loop through the cursor
    OPEN revenue_cursor;

    read_loop: LOOP
        FETCH revenue_cursor INTO v_vehicle_type, v_amount;

        IF v_done = 1 THEN
            LEAVE read_loop;
        END IF;

        -- add to the correct bucket
        IF v_vehicle_type = 'two_wheeler' THEN
            SET v_two_total  = v_two_total  + v_amount;
        ELSEIF v_vehicle_type = 'heavy' THEN
            SET v_heavy_total = v_heavy_total + v_amount;
        ELSE
            SET v_four_total = v_four_total + v_amount;
        END IF;

        SET v_grand_total = v_grand_total + v_amount;

    END LOOP;

    CLOSE revenue_cursor;

    -- return the summary
    SELECT
        v_two_total    AS Two_Wheeler_Revenue,
        v_four_total   AS Four_Wheeler_Revenue,
        v_heavy_total  AS Heavy_Vehicle_Revenue,
        v_grand_total  AS Grand_Total;

END$$


DELIMITER ;


-- ============================================================
--  TEST BOTH
-- ============================================================

-- Test function: 3 hours, four_wheeler → should return 60.00
SELECT fn_calculate_fee(3, 'four_wheeler') AS Fee_Estimate;

-- Test cursor procedure: revenue breakdown by vehicle type
CALL sp_revenue_report();

-- ============================================================
--  END OF additions.sql
-- ============================================================
