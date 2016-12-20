use feedback;
INSERT INTO course(code)
VALUES ('ITI1120'),('ITI1121');

INSERT INTO ta(studnum, fn, ln, profilepic) VALUES
('1','Ashwin','Pancakes','AuntJemima.logo'),
('2','Alimou','Rocks','Fuzzy.jpeg'),
('3','Balmer','Peak','MSlogo.png'),
('4','Remi','Gel','Rems.png');

INSERT INTO section(sectionid, code,timeslot) VALUES
('fdf39a4f-5b0e-4a1a-897f-af3119e97712','ITI1120','Meh oclock'),
('2732a472-f644-42a2-aa41-f785aeccb50c','ITI1120','Oh lord its late'),
('d932c0c3-7be8-4ac3-98a1-a89c34e1a470','ITI1121','DFS hour'),
('48be0083-ad05-420f-b745-d5c9338768a1','ITI1121','Its to O-O-ly for this');



INSERT INTO teaches(sectionid, studnum) VALUES
('fdf39a4f-5b0e-4a1a-897f-af3119e97712','1'),
('2732a472-f644-42a2-aa41-f785aeccb50c','2'),
('d932c0c3-7be8-4ac3-98a1-a89c34e1a470','3'),
('48be0083-ad05-420f-b745-d5c9338768a1','4');
