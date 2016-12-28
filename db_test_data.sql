use feedback;
INSERT INTO course(code)
VALUES ('ITI1120'),('ITI1121');

INSERT INTO ta(stnum, firstName, lastName, profilepic) VALUES
('1','Ashwin','Pancakes','AuntJemima.logo'),
('2','Alimou','Rocks','Fuzzy.jpeg'),
('3','Balmer','Peak','MSlogo.png'),
('4','Remi','Gel','Rems.png');

INSERT INTO section(course, sectionID,currYear,semester, weekday, startTime, endTime) VALUES
('ITI1120', 'T1',2016,1, '1', '11:30', '14:30'),
('ITI1120', 'T2',2016,1, '2', '14:30', '17:30'),
('ITI1121', 'T1',2017,2, '1', '11:30', '14:30'),
('ITI1121', 'T2',2017,2, '2', '14:30', '17:30');


INSERT INTO teaches(taID, course, section, currYear, semester) VALUES
('1', 'ITI1120', 'T1', '2016', '1'),
('2', 'ITI1120', 'T2', '2016', '1'),
('1', 'ITI1121', 'T2', '2017', '2'),
('3', 'ITI1121', 'T1', '2017', '2');
