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
		a = t.fetchall()
		return a
	#inserted new user
	return False

def submitFeedback(form):
	t=conn.cursor()
	t.execute("""SELECT sectionid FROM section WHERE timeslot=%s;""",(str(form['section_code'][0]),))
	conn.commit()
	suuid = t.fetchall();
	t=conn.cursor()
	t.execute("""INSERT INTO feedback(range_fields,comments, stud, sectionid) VALUES (%s,%s,%s,%s)""",
		([int(form['range_1'][0]),
		 int(form['range_2'][0]),
		 int(form['range_3'][0])],
		 form['courseFeedback'][0],
		 form['studnum'][0],
		 suuid[0][0],))
	conn.commit()
