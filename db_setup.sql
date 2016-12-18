CREATE DATABASE feedback;

CREATE EXTENSION pgcrypto;

use feedback;
CREATE TABLE course
(
  code character varying(7),
  CONSTRAINT course_pkey PRIMARY KEY (code)
);

CREATE TABLE section
(
  code character varying(7) NOT NULL,
  sectionid uuid NOT NULL DEFAULT gen_random_uuid(),
  timeslot character varying,
  CONSTRAINT section_pkey PRIMARY KEY (sectionid),
  CONSTRAINT section_code_fkey FOREIGN KEY (code)
      REFERENCES course (code) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE ta(  studnum character varying(10) NOT NULL,  fn character varying,  ln character varying,  profilepic character varying,  CONSTRAINT ta_pkey PRIMARY KEY (studnum),);

CREATE TABLE teaches(  studnum character varying(10) NOT NULL,  sectionid uuid NOT NULL,  CONSTRAINT teaches_sectionid_fkey FOREIGN KEY (sectionid)      REFERENCES section (sectionid) MATCH SIMPLE      ON UPDATE NO ACTION ON DELETE NO ACTION,  CONSTRAINT teaches_taid_fkey FOREIGN KEY (studnum)      REFERENCES ta (studnum) MATCH SIMPLE      ON UPDATE NO ACTION ON DELETE NO ACTION);

CREATE TABLE feedback
(
  manyfield character varying,
  comments character varying,
  stud character varying(20) NOT NULL,
  feedbackid uuid NOT NULL DEFAULT gen_random_uuid(),
  sectionid uuid NOT NULL,
  CONSTRAINT feedback_pkey PRIMARY KEY (feedbackid),
  CONSTRAINT feedback_sectionid_fkey FOREIGN KEY (sectionid)
      REFERENCES section (sectionid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);
