import pg8000

conn = pg8000.connect(host="127.0.0.1", port=5432,user="feed", password="meh", database="feedback")
t = conn.cursor()
t.execute("SET CLIENT_ENCODING TO 'UTF8'")
t.execute("""SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';""")
print t.fetchall()


def getCourses():
	t=conn.cursor()
	t.execute("""SELECT * FROM course;""")
	conn.commit()
	#inserted new user
	return t.fetchall()

def getSections(code):
	print code
	t=conn.cursor()
	t.execute("""SELECT * FROM course;""")
	conn.commit()
	x =[str(k[0]) for k in t.fetchall()]
	print x
	if code in x:
		t=conn.cursor()
		t.execute("""SELECT timeslot FROM section WHERE code=%s;""",(str(code),))
		conn.commit()
		a = t.fetchall()
		return a
	#inserted new user
	return False
