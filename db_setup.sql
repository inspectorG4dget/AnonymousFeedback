DROP TABLE TEACHES;
DROP TABLE FEEDBACK;
DROP TABLE TA;
DROP TABLE SECTION;
DROP TABLE COURSE;
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
    description VARCHAR(250),
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
    FOREIGN KEY(course,section,currYear,semester) REFERENCES SECTION(course,sectionID,currYear,semester)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    PRIMARY KEY(taID, course, section, currYear, semester)
);
CREATE TABLE RANGE_QUESTIONS (
    id              SERIAL,
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
    q1          INTEGER,
    q2          INTEGER,
    q3          INTEGER,
    feedback    VARCHAR,
    FOREIGN KEY (taID) REFERENCES TA (stnum)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,
    FOREIGN KEY(course,section,currYear,semester) REFERENCES SECTION(course,sectionID,currYear,semester)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    PRIMARY KEY (student, taID, course, section, currYear, semester)
);
