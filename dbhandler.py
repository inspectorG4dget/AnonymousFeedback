import pg8000

conn = pg8000.connect(host="127.0.0.1", port=5432,user="feed", password="meh", database="feedback")

def getCourses():
	t=conn.cursor()
	t.execute("""SELECT * FROM course;""")
	conn.commit()
	#inserted new user
	return t.fetchall()

def getSections(code):
	t=conn.cursor()
	t.execute("""SELECT * FROM course;""")
	conn.commit()
	a = t.fetchall()
	x =[str(k[0]) for k in a]
	if code in x:
		t=conn.cursor()
		t.execute("""SELECT timeslot FROM section WHERE code=%s;""",(str(code),))
		conn.commit()
		return t.fetchall()
	#inserted new user
	return False

def submitFeedback(form):
	t=conn.cursor()
	t.execute("""SELECT sectionid FROM section WHERE timeslot=%s;""",(str(form['section_code'][0]),))
	conn.commit()
	suuid = t.fetchall();
	t=conn.cursor()
	t.execute("""INSERT INTO feedback(range_fields,comments, stud, sectionid) VALUES (%s,%s,%s,%s)""",
		([int(form['range_1'][0]),int(form['range_2'][0]),int(form['range_3'][0])],
		 form['courseFeedback'][0],
		 form['studnum'][0],
		 suuid[0][0],))
	conn.commit()

def createTA(form):
	t=conn.cursor()
	t.execute("""INSERT INTO ta(studnum,fn, ln, profilepic) VALUES (%s,%s,%s,%s)""",
		(form['studnum'][0],form['fn'][0],form['ln'][0],form['profilepic'][0],))
	conn.commit()

def createCourse(form):
	t=conn.cursor()
	t.execute("""INSERT INTO course(code) VALUES (%s)""",
		(form['code'][0],))
	conn.commit()

def createSection(form):
	t=conn.cursor()
	t.execute("""INSERT INTO section(code,timeslot) VALUES (%s,%s)""",
		(form['code'][0],form['timeslot'][0]),)
	conn.commit()

def assignTAtoSection(form):
	t=conn.cursor()
	t.execute("""SELECT sectionid FROM section WHERE code=$s AND timeslot=%s """,
		(form['code'][0],form['timeslot'][0]),)
	conn.commit()
	suuid = t.fetchall()

	t=conn.cursor()
	t.execute("""INSERT INTO teaches(studnum,sectionid) VALUES (%s,%s)""",
		(form['studnum'][0],suuid[0][0],))
	conn.commit()

def getFeedBack(form):
	t=conn.cursor()
	t.execute("""SELECT sectionid FROM section WHERE code=%s AND timeslot=%s;""",
		(str(form['course'][0]), str(form['section'][0]),))
	conn.commit()
	suuid = t.fetchall();

	schema = ['range_fields','comments']
	t=conn.cursor()
	t.execute("""SELECT range_fields,comments FROM feedback WHERE sectionid=%s""",(suuid[0][0],))
	conn.commit()
	x = dict()
	x['schema'] = schema
	x['rows'] = t.fetchall()
	return x
