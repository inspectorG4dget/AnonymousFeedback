import ConfigParser as CP
import operator
import pg8000

from datetime import datetime as dt
from backend import getYearSemester


config = CP.RawConfigParser()
config.read('dbconn.conf')
ip = config.get("Default", "IP")
port = config.getint("Default", "port")
username = config.get("Default", "user")
pwd = config.get("Default", "password")
db = config.get("Default", "database")

conn = pg8000.connect(host=ip, port=port,user=username, password=pwd, database=db)


def getCourses():
    t=conn.cursor()
    t.execute("""SELECT * FROM course;""")
    conn.commit()
    #inserted new user
    return t.fetchall()


def getSections(courseCode, year, semester):
    t=conn.cursor()
    t.execute("""SELECT sectionID, weekday, startTime, endTime FROM section WHERE course=%s AND currYear=%s AND semester=%s;""", (courseCode, year, semester))
    conn.commit()
    return t.fetchall()


def getSectionTA(courseCode, sectionCode, year, semester):
    t = conn.cursor()
    t.execute('''SELECT taID, firstName, lastName
                FROM TA, TEACHES
                WHERE TA.stnum=TEACHES.taID
                    AND TEACHES.course=%s
                    AND TEACHES.section=%s
                    AND TEACHES.currYear=%s
                    AND TEACHES.semester=%s''', (courseCode, sectionCode, year, semester,))
    conn.commit()
    return t.fetchall()


def createTA(form):
    t=conn.cursor()
    t.execute("""INSERT INTO ta(studnum,fn, ln, profilepic) VALUES (%s,%s,%s,%s)""",
        (form['studnum'][0],form['fn'][0],form['ln'][0],form['profilepic'][0],))
    conn.commit()

def createCourse(courseCode):
    t=conn.cursor()
    t.execute("""INSERT INTO course(code) VALUES (%s)""", (courseCode,))
    conn.commit()

def createSection(courseCode, sectionCode, startTime, endTime):
    t=conn.cursor()
    t.execute("""INSERT INTO section(code, startTime, endTime) VALUES (%s, %s, %s)""", (courseCode, sectionCode, startTime, endTime))
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


def submitFeedback(feedbacks):
    query = """INSERT INTO FEEDBACK student=%s, course=%s, section=%s, currYear=%s, semester=%s, taID=%s, q1=%s, q2=%s, q3=%s, feedback=%s"""
    idents = operator.itemgetter('student', 'course', 'section')(feedbacks)
    idents += getYearSemester()

    fetch = operator.itemgetter('taID', 'q1', 'q2', 'q3', 'feedback')
    for feedback in feedbacks['feedback']:
        t = conn.cursor()
        t.execute(query, idents+fetch(feedback))
        conn.commit()


def getCourseFeedbacks(form):
    courseCode = form['course'][0]
    sectionCode = form['section'][0]
    year, semester = getYearSemester()

    query = """SELECT FEEDBACK.course, section, firstName, lastName, q1, q2, q3, feedback from FEEDBACK,TA,SECTION WHERE FEEDBACK.taID=TA.stnum AND SECTION.course=FEEDBACK.course AND SECTION.sectionid=FEEDBACK.section AND FEEDBACK.course=%s AND section.currYear=%s AND section.semester=%si"""
    t = conn.cursor()
    t.execute(query, (courseCode, year, semester))
    conn.commit()
    feedbacks = t.fetchall()
    answer = {schema:['q1', 'q2', 'q3', 'feedback']}
    for course, section, startTime, endTime, fname, lname, q1, q2, q3, feedback in feedbacks:
        ta = "%s %s" %(fname, lname)
        if ta not in answer: answer[ta] = {'section':section, 'course':course, 'startTime':startTime, 'endTime':endTime, 'feedback':[]}
        answer[ta]['feedback'].append({'q1':q1, 'q2':q2, 'q3':q3, 'feedback':feedback})

    return {'feedback': answer}
