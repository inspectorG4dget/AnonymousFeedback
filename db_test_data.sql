use feedback;
INSERT INTO course(code)
VALUES ('ITI1120'),('ITI1121');

INSERT INTO ta(studnum, fn, ln, profilepic) VALUES
('1','Ashwin','Pancakes','AuntJemima.logo'),
('2','Alimou','Rocks','Fuzzy.jpeg'),
('3','Balmer','Peak','MSlogo.png'),
('4','Remi','Gel','Rems.png');

INSERT INTO section(course, sectionID, weekday, startTime, endTime) VALUES
('ITI1120', 'T1', '1', '11:30', '14:30'),
('ITI1120', 'T2', '2', '14:30', '17:30'),
('ITI1121', 'T1', '1', '11:30', '14:30'),
('ITI1121', 'T2', '2', '14:30', '17:30');


INSERT INTO teaches(ta, course, section, year, semester) VALUES
('1', 'ITI1120', 'T1', '2016', '3'),
('2', 'ITI1120', 'T2', '2016', '3'),
('1', 'ITI1121', 'T2', '2017', '1'),
('3', 'ITI1121', 'T1', '2017', '1');
