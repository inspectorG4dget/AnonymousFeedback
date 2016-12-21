CREATE DATABASE feedback;

CREATE EXTENSION pgcrypto;

use feedback;

CREATE TABLE COURSE (
    code    VARCHAR(7),
    PRIMARY KEY (code)
);


CREATE TABLE SECTION (
    course      VARCHAR(7),
    sectionID   VARCHAR(1),
    year        NUMERIC(4),
    semester    NUMERIC(1),
    startTime   TIME,
    endTime     TIME,

    FOREIGN KEY (course) REFERENCES COURSE(code)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    PRIMARY KEY (course, sectionID, year, semester)
);


CREATE TABLE TA (
    stnum       NUMERIC(10),
    firstName   VARCHAR(20),
    lastName    VARCHAR(20),
    profilePic  VARCHAR(100)
);


CREATE TABLE TEACHES (
    ta          NUMERIC(10),  -- TODO: FK
    course      VARCHAR(7),
    section     VARCHAR(1),
    year        NUMERIC(4),
    semester    NUMERIC(1),

    FOREIGN KEY (ta) REFERENCES TA(stnum)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(course) REFERENCES COURSE(code)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(section) REFERENCES SECTION(sectionID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(year) REFERENCES SECTION(year)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(semester) REFERENCES SECTION(semester)
        ON UPDATE CASCADE
        ON DELETE CASCADE,


    PRIMARY KEY(ta, course, section , year, semester)
);


CREATE TABLE FEEDBACK (
    student     NUMERIC(10), 
    ta          NUMERIC(10),
    course      VARCHAR(7),
    section     VARCHAR(1),
    year        NUMERIC(4),
    semester    NUMERIC(1),
    feedback    VARCHAR,

    FOREIGN KEY (ta) REFERENCES TA (stnum)
        ON DELETE DO NOTHING
        ON UPDATE CASCADE,

    FOREIGN KEY (course) REFERENCES SECTION(course)
        ON DELETE DO NOTHING
        ON UPDATE CASCADE,

    FOREIGN KEY (section) REFERENCES SECTION(sectionID)
        ON DELETE DO NOTHING
        ON UPDATE CASCADE,

    FOREIGN KEY (year) REFERENCES SECTION(year)
        ON DELETE DO NOTHING
        ON UPDATE CASCADE,

    FOREIGN KEY (semester) REFERENCES SECTION(semester)
        ON DELETE DO NOTHING
        ON UPDATE CASCADE,

    PRIMARY KEY (student, ta, course, section, year, semester)
);
