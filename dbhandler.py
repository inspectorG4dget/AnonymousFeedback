#####
# Authors: NuclearBanane, inspectorG4dget
# Contributors :
# Date : 2016/12/30
# Version : v0.7
#####

import ConfigParser as CP
import operator
import pg8000
import toml

from datetime import datetime as dt
from backend import getYearSemester

config = CP.RawConfigParser()
config.read('dbconn.conf')
# conf = toml.load('dbconn.toml')

ip          = config.get("Default", "IP")
port        = config.getint("Default", "port")
username    = config.get("Default", "user")
pwd         = config.get("Default", "password")
db          = config.get("Default", "database")

conn = pg8000.connect(host=ip, port=port,user=username, password=pwd, database=db)

def getCourses():
    c = conn.cursor()
    try:
        c.execute("""SELECT * FROM course""")
        conn.commit()
        #inserted new user
        return c.fetchall()
    except pg8000.ProgrammingError as e:
        print(e)
        conn.rollback()
        return False

def getSections(courseCode, year, semester, active):
    c = conn.cursor()
    try:
        if active is True:
            c.execute("""SELECT DISTINCT sectionID, weekday, startTime, endTime
                    FROM section, teaches
                    WHERE section.course=%s
                        AND section.currYear=%s
                        AND section.semester=%s
                        AND teaches.currYear=section.currYear
                        AND teaches.semester=section.semester
                        AND teaches.course=section.course""",
                        (courseCode, year, semester))
        else :
            c.execute("""SELECT sectionID, weekday, startTime, endTime
                    FROM section
                    WHERE course=%s
                        AND currYear=%s
                        AND semester=%s""",
                        (courseCode, year, semester))
        conn.commit()
        res = c.fetchall()
        return res
    except pg8000.ProgrammingError as e:
        print(e)
        conn.rollback()
        return False

def getSectionTA(courseCode, sectionCode, year=getYearSemester()[0], semester=getYearSemester()[1]):
    c = conn.cursor()
    try:
        c.execute('''SELECT taID, firstName, lastName
                    FROM TA, TEACHES
                    WHERE TA.stnum=TEACHES.taID
                        AND TEACHES.course=%s
                        AND TEACHES.section=%s
                        AND TEACHES.currYear=%s
                        AND TEACHES.semester=%s''', (courseCode, sectionCode, year, semester,))
        conn.commit()
        return c.fetchall()
    except pg8000.ProgrammingError as e:
        print(e)
        conn.rollback()
        return False

def createTA(stnum, fname, lname,  profilepic):
    c = conn.cursor()
    try:
        c.execute("""INSERT INTO ta (stnum, firstname, lastname, profilepic) VALUES (%s,%s,%s,%s)""", (stnum, fname, lname, profilepic))
        conn.commit()
    except pg8000.ProgrammingError as e:
        print(e)
        conn.rollback()
        return False

def createCourse(courseCode):
    c = conn.cursor()
    try:
        c.execute("""INSERT INTO course(code) VALUES (%s)""", (courseCode,))
        conn.commit()
        return True
    except pg8000.ProgrammingError:
        conn.rollback()
        return False

#def createSection(courseCode, sectionCode, year, semester, weekday, startTime, endTime):
def createSection(courseCode, sectionCode, year, semester, weekday, startTime, endTime):
    c = conn.cursor()
    try:
        c.execute("""INSERT INTO section(course, sectionID,  currYear, semester, weekday, startTime, endTime) VALUES (%s, %s, %s, %s ,%s,%s,%s)""",
            (courseCode, sectionCode, year, semester, weekday, startTime, endTime,))
        conn.commit()
    except pg8000.ProgrammingError as e:
        print(e)
        conn.rollback()
        return False

def assign_ta_to_section(ta_id, course_code, section_id):
    c = conn.cursor()
    try:
        year, semester = getYearSemester()
        c.execute("""INSERT INTO teaches(taid, course, section, curryear, semester) VALUES (%s, %s, %s, %s, %s)""",
                (ta_id, course_code, section_id, year, semester))
        conn.commit()
    except pg8000.ProgrammingError as e:
        conn.rollback()
        print(e)
        return False

def submitFeedback(student_number, course_code, section_id, ta_id, q1, q2, q3, feedback):
    year, semester = getYearSemester()
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO feedback
                (student, course, section, currYear, semester, taID, q1, q2, q3, feedback) VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''' ,
            (student_number, course_code, section_id, year, semester, ta_id, q1, q2, q3, feedback))
        conn.commit()
        return 'success'
    except pg8000.ProgrammingError as e:
        print(e)
        conn.rollback()
        return False

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
        conn.rollback()
        return False

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
    c = conn.cursor()
    try:
        c.execute('SELECT stnum, firstname, lastname FROM ta')
        conn.commit()
        tas = c.fetchall()
        return [(str(row[0]), ' '.join(row[1:])) for row in tas]
    except pg8000.ProgrammingError as e:
        print(e)
        conn.rollback()
        return False

