--use feedback;
INSERT INTO course (code) VALUES
('CEG2136'),
('ITI1100'),
('ITI1120'),
('ITI1121');

INSERT INTO ta (stnum, firstName, lastName, profilepic, description) VALUES
('1995523','Steve','Ballmer','ballmer.jpg','Former CEO, Microsoft. Appreciates devleopers.'),
('4224126','Ashwin','Panchapakesan','ashwin.jpg','Frequently rants about Python''s greatness.'),
('5112142','Alan','Turing','turing.jpg','Computer scientist at Bletchley Park. Fan of infinite tapes.'),
('5521511','Grace','Hopper','hopper.jpg','I will find actual bugs in your computers.'),
('8112115','Ada','Lovelace','ada.jpg','All your assignments will be done on a scriptable loom.');

INSERT INTO section(course, sectionID,currYear,semester, weekday, startTime, endTime) VALUES
('ITI1120', 'T1', 2016, 1, '1', '11:30', '14:30'),
('CEG2136', 'T1', 2016, 1, '1', '11:30', '14:30'),
('ITI1120', 'T2', 2016, 1, '2', '14:30', '17:30'),
('ITI1121', 'T1', 2017, 2, '1', '11:30', '14:30'),
('ITI1121', 'T2', 2017, 2, '2', '14:30', '17:30'),
('ITI1100', 'T1', 2017, 2, '3', '8:30', '10:00'),
('ITI1100', 'T2', 2017, 2, '3', '8:30', '10:00');


INSERT INTO teaches(taID, course, section, currYear, semester) VALUES
('1995523', 'ITI1120', 'T1', '2016', '1'),
('4224126', 'CEG2136', 'T1', '2016', '1'),
('5112142', 'CEG2136', 'T1', '2016', '1'),
('5521511', 'ITI1120', 'T2', '2016', '1'),
('8112115', 'ITI1121', 'T2', '2017', '2'),
('1995523', 'ITI1121', 'T1', '2017', '2'),
('4224126', 'ITI1100', 'T1', '2017', '2'),
('5112142', 'ITI1100', 'T1', '2017', '2'),
('8112115', 'ITI1100', 'T2', '2017', '2');
