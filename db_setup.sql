CREATE DATABASE feedback;

CREATE EXTENSION pgcrypto;

use feedback;

CREATE TABLE COURSE (
    code    VARCHAR(7),
    PRIMARY KEY (code)
);


CREATE TABLE SECTION (
    course      VARCHAR(7),
    sectionID   VARCHAR(2),
    currYear    NUMERIC(4),
    semester    NUMERIC(1),
	weekday NUMERIC(1),
    startTime   TIME,
    endTime     TIME,

    FOREIGN KEY (course) REFERENCES COURSE(code)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    PRIMARY KEY (course, sectionID, currYear, semester)
);


CREATE TABLE TA (
    stnum       NUMERIC(10),
    firstName   VARCHAR(20),
    lastName    VARCHAR(20),
    profilePic  VARCHAR(100),
    PRIMARY KEY (stnum)
);


CREATE TABLE TEACHES (
    taID        NUMERIC(10),
    course      VARCHAR(7),
    section     VARCHAR(2),
    currYear    NUMERIC(4),
    semester    NUMERIC(1),

    FOREIGN KEY (taID) REFERENCES TA(stnum)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(course) REFERENCES SECTION(course)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(section) REFERENCES SECTION(sectionID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(currYear) REFERENCES SECTION(currYear)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY(semester) REFERENCES SECTION(semester)
        ON UPDATE CASCADE
        ON DELETE CASCADE,


    PRIMARY KEY(taID, course, section, currYear, semester)
);


CREATE TABLE RANGE_QUESTIONS (
    id              NUMERIC(1) SERIAL,
    description     VARCHAR(50),

    PRIMARY KEY (id)
);


CREATE TABLE FEEDBACK (
    student     NUMERIC(10),
    taID        NUMERIC(10),
    course      VARCHAR(7),
    section     VARCHAR(2),
    currYear    NUMERIC(4),
    semester    NUMERIC(1),

    q1          NUMERIC(1),
    q2          NUMERIC(1),
    q3          NUMERIC(1),
    feedback    VARCHAR,

    FOREIGN KEY (taID) REFERENCES TA (stnum)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,

    FOREIGN KEY (course) REFERENCES SECTION(course)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,

    FOREIGN KEY (section) REFERENCES SECTION(sectionID)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,

    FOREIGN KEY (currYear) REFERENCES SECTION(currYear)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,

    FOREIGN KEY (semester) REFERENCES SECTION(semester)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,

    PRIMARY KEY (student, taID, course, section, currYear, semester)
);
