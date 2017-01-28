#####
# Authors: NuclearBanane, inspectorG4dget
# Contributors :
# Date : 2016/12/30
# Version : v0.7
#####

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
    t.execute("""SELECT * FROM course""")
    conn.commit()
    #inserted new user
    return t.fetchall()


def getSections(courseCode, year, semester, active):
    t=conn.cursor()
    if active is True:
        t.execute("""SELECT DISTINCT sectionID, weekday, startTime, endTime
                FROM section, teaches
                WHERE section.course=%s
                    AND section.currYear=%s
                    AND section.semester=%s
                    AND teaches.currYear=section.currYear
                    AND teaches.semester=section.semester
                    AND teaches.course=section.course""",
                    (courseCode, year, semester))
    else :
        t.execute("""SELECT sectionID, weekday, startTime, endTime
                FROM section
                WHERE course=%s
                    AND currYear=%s
                    AND semester=%s""",
                    (courseCode, year, semester))
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

def createTA(stnum, fname, lname,  profilepic):
    t=conn.cursor()
    t.execute("""INSERT INTO ta(stnum,firstname, lastname, profilepic) VALUES (%s,%s,%s,%s)""", (stnum, fname, lname, profilepic))
    conn.commit()

def createCourse(courseCode):
    t=conn.cursor()
    t.execute("""INSERT INTO course(code) VALUES (%s)""", (courseCode,))
    conn.commit()

#def createSection(courseCode, sectionCode, year, semester, weekday, startTime, endTime):
def createSection(courseCode, sectionCode, year, semester, weekday, startTime, endTime):
    t=conn.cursor()
    t.execute("""INSERT INTO section(course, sectionID,  currYear, semester, weekday, startTime, endTime) VALUES (%s, %s, %s, %s ,%s,%s,%s)""",
        (courseCode, sectionCode, year, semester, weekday, startTime, endTime,))
    conn.commit()


def assignTAtoSection(taID, courseCode, sectionCode):
    t=conn.cursor()
    year, semester = getYearSemester()
    t.execute("""INSERT INTO teaches(taid, course, section, year, semester) VALUES (%s, %s, %s, %s, %s)""", (taID, courseCode, sectionCode, year, semester))
    conn.commit()


def submitFeedback(student_number, course_code, section, fb):
    year, semester = getYearSemester()

    # extract individual feedback fields
    try:
        taID, q1, q2, q3, feedback = fb['taID'], fb['q1'], fb['q2'], fb['q3'], fb['feedback']
    except ValueError as e:
        return 'ValueError in submitFeedback'

    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO feedback
                (student, course, section, currYear, semester, taID, q1, q2, q3, feedback) VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''' ,
            (student_number, course_code, section, year, semester, taID, q1, q2, q3, feedback))
        conn.commit()
        return 'success'
    except pg8000.ProgrammingError as e:
        conn.rollback()
        return 'pg8000.ProgrammingError in submitFeedback'

def getCourseFeedbacks(courseCode, sectionCode):
    year, semester = getYearSemester()
    c = conn.cursor()

    try:
        c.execute("""
                SELECT feedback.course, section, firstName, lastName, q1, q2, q3, feedback
                    FROM feedback, ta, section
                    WHERE FEEDBACK.taID=TA.stnum
                        AND SECTION.course=FEEDBACK.course
                        AND SECTION.sectionid=FEEDBACK.section
                        AND FEEDBACK.course=%s
                        AND FEEDBACK.section=%s
                        AND section.currYear=%s
                        AND section.semester=%s""", (courseCode, sectionCode, year, semester))
        conn.commit()
        raw_feedbacks = c.fetchall()

    except pg8000.ProgrammingError as e:
        print(e)
        return 'pg8000.ProgrammingError in getCourseFeedbacks'

    feedbacks = {}

    # load all relevant feedback information into a dict of dicts (for easy deduplication server-side)
    for course, section, fname, lname, q1, q2, q3, feedback in raw_feedbacks:
        ta = '{0} {1}'.format(fname, lname)

        if ta not in feedbacks.keys():
            feedbacks[ta] = {
                    'ta' : ta,
                    'section' : section,
                    'course' : course,
                    'feedback' : []
                }

        feedbacks[ta]['feedback'].append([q1, q2, q3, feedback])

    # the client is actually given a schema and a _list_ (not dict) of feedbacks sorted by TA with some metadata
    # this is because it's easier to iterate over using an index than using a TA's name
    return {
            'schema' : ['q1', 'q2', 'q3', 'feedback'],
            'feedbacks': feedbacks.values(),
        }


def getAllTAs():
    query = """SELECT stnum, firstname, lastname from TA"""
    t = conn.cursor()
    t.execute(query)
    conn.commit()
    tas = t.fetchall()

    return [(str(row[0]), ' '.join(row[1:])) for row in tas]
