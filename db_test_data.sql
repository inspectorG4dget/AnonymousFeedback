--use feedback;
INSERT INTO course(code)
VALUES ('ITI1120'), ('ITI1121'), ('CEG2136'), ('ITI1100');

INSERT INTO ta(stnum, firstName, lastName, profilepic, description) VALUES
('1','Ashwin','Pancakes','AuntJemima.logo', 'Likes puns, Iron Man, and long stays on Mars involving potato farming.'),
('2','Alimou','Rocks','Fuzzy.jpeg', 'It\'s Alimou. That is all.'),
('3','Balmer','Peak','MSlogo.png', 'Your best drinking buddy.'),
('4','Remi','Gel','Rems.png', 'Is a marshmallow.');

INSERT INTO section(course, sectionID,currYear,semester, weekday, startTime, endTime) VALUES
('ITI1120', 'T1', 2016, 1, '1', '11:30', '14:30'),
('CEG2136', 'T1', 2016, 1, '1', '11:30', '14:30'),
('ITI1120', 'T2', 2016, 1, '2', '14:30', '17:30'),
('ITI1121', 'T1', 2017, 2, '1', '11:30', '14:30'),
('ITI1121', 'T2', 2017, 2, '2', '14:30', '17:30'),
('ITI1100', 'T1', 2017, 2, '3', '8:30', '10:00'),
('ITI1100', 'T2', 2017, 2, '3', '8:30', '10:00');


INSERT INTO teaches(taID, course, section, currYear, semester) VALUES
('1', 'ITI1120', 'T1', '2016', '1'),
('1', 'CEG2136', 'T1', '2016', '1'),
('4', 'CEG2136', 'T1', '2016', '1'),
('2', 'ITI1120', 'T2', '2016', '1'),
('1', 'ITI1121', 'T2', '2017', '2'),
('3', 'ITI1121', 'T1', '2017', '2'),
('3', 'ITI1100', 'T1', '2017', '2'),
('4', 'ITI1100', 'T2', '2017', '2');
