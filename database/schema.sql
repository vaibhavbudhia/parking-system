-- ============================================================
--  PARKING LOT MANAGEMENT SYSTEM
--  File        : schema.sql
--  Course      : UCS310 - Database Management Systems
--  Institute   : Thapar Institute of Engineering and Technology
--  Members     : Lovish Bansal (1024030297)
--                Vaibhav Budhia (1024030307)
--                Aayushi Uniyal (1024030308)
--  Description : Creates the database and all 6 tables.
--                Run this file first before anything else.
-- ============================================================


-- ------------------------------------------------------------
-- Create and use the database
-- ------------------------------------------------------------

DROP DATABASE IF EXISTS parking_system;
CREATE DATABASE parking_system;
USE parking_system;


-- ------------------------------------------------------------
-- TABLE 1: ADMIN
-- Stores login accounts for admin and operator staff.
-- ------------------------------------------------------------

CREATE TABLE ADMIN (
    Admin_ID   INT          NOT NULL AUTO_INCREMENT,
    Name       VARCHAR(100) NOT NULL,
    Username   VARCHAR(50)  NOT NULL,
    Password   VARCHAR(100) NOT NULL,
    Role       VARCHAR(20)  NOT NULL DEFAULT 'operator',

    PRIMARY KEY (Admin_ID),
    UNIQUE (Username),
    CHECK (Role IN ('admin', 'operator'))
);


-- ------------------------------------------------------------
-- TABLE 2: OWNER
-- Person who owns the vehicle.
-- One owner can have multiple vehicles.
-- ------------------------------------------------------------

CREATE TABLE OWNER (
    Owner_ID   INT          NOT NULL AUTO_INCREMENT,
    Owner_Name VARCHAR(100) NOT NULL,
    Phone      VARCHAR(15)  NOT NULL,
    Email      VARCHAR(100),

    PRIMARY KEY (Owner_ID),
    UNIQUE (Phone)
);


-- ------------------------------------------------------------
-- TABLE 3: VEHICLE
-- Each vehicle belongs to one owner (many-to-one).
-- Vehicle_Type decides the hourly parking rate.
-- ------------------------------------------------------------

CREATE TABLE VEHICLE (
    Vehicle_ID     INT         NOT NULL AUTO_INCREMENT,
    Vehicle_Number VARCHAR(20) NOT NULL,
    Vehicle_Type   VARCHAR(20) NOT NULL DEFAULT 'four_wheeler',
    Owner_ID       INT         NOT NULL,

    PRIMARY KEY (Vehicle_ID),
    UNIQUE (Vehicle_Number),
    FOREIGN KEY (Owner_ID) REFERENCES OWNER(Owner_ID),
    CHECK (Vehicle_Type IN ('two_wheeler', 'four_wheeler', 'heavy'))
);


-- ------------------------------------------------------------
-- TABLE 4: PARKING_SLOT
-- Physical parking spots in the lot.
-- Status is updated automatically by triggers.
-- ------------------------------------------------------------

CREATE TABLE PARKING_SLOT (
    Slot_ID     INT         NOT NULL AUTO_INCREMENT,
    Slot_Number VARCHAR(10) NOT NULL,
    Slot_Type   VARCHAR(20) NOT NULL,
    Floor       VARCHAR(10) NOT NULL DEFAULT 'G',
    Status      VARCHAR(15) NOT NULL DEFAULT 'available',

    PRIMARY KEY (Slot_ID),
    UNIQUE (Slot_Number),
    CHECK (Status   IN ('available', 'occupied')),
    CHECK (Slot_Type IN ('two_wheeler', 'four_wheeler', 'heavy'))
);


-- ------------------------------------------------------------
-- TABLE 5: PARKING_RECORD
-- One row per parking session.
-- Exit_Time and Amount are NULL when vehicle first enters
-- and get filled when the vehicle exits.
-- ------------------------------------------------------------

CREATE TABLE PARKING_RECORD (
    Record_ID  INT           NOT NULL AUTO_INCREMENT,
    Vehicle_ID INT           NOT NULL,
    Slot_ID    INT           NOT NULL,
    Entry_Time DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Exit_Time  DATETIME      DEFAULT NULL,
    Amount     DECIMAL(8,2)  DEFAULT NULL,

    PRIMARY KEY (Record_ID),
    FOREIGN KEY (Vehicle_ID) REFERENCES VEHICLE(Vehicle_ID),
    FOREIGN KEY (Slot_ID)    REFERENCES PARKING_SLOT(Slot_ID)
);


-- ------------------------------------------------------------
-- TABLE 6: PAYMENT
-- Created after the vehicle exits and bill is generated.
-- One payment per parking record (1 to 1).
-- ------------------------------------------------------------

CREATE TABLE PAYMENT (
    Payment_ID   INT           NOT NULL AUTO_INCREMENT,
    Record_ID    INT           NOT NULL,
    Amount       DECIMAL(8,2)  NOT NULL,
    Payment_Mode VARCHAR(10)   NOT NULL DEFAULT 'cash',
    Payment_Time DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (Payment_ID),
    UNIQUE (Record_ID),
    FOREIGN KEY (Record_ID) REFERENCES PARKING_RECORD(Record_ID),
    CHECK (Payment_Mode IN ('cash', 'card', 'upi'))
);


-- ------------------------------------------------------------
-- Confirm all tables were created
-- ------------------------------------------------------------

SHOW TABLES;

-- ============================================================
--  END OF schema.sql
--  Next file to run: triggers.sql
-- ============================================================
