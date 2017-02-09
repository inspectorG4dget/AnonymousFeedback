#####
# Authors: NuclearBanane, inspectorG4dget
# Contributors :
# Date : 2016/12/30
# Version : v0.8
#####

import operator
import pg8000
import sys
import toml

from datetime import datetime as dt
from backend import getYearSemester

conf = toml.load('conf.toml')['db']

try:
    conn = pg8000.connect(
            host=conf['host'],
            port=conf['port'],
            user=conf['username'],
            password=conf['password'],
            database=conf['database']
        )
except Exception:
    log.crit('Could not establish a database connection.')
    log.info('Quitting.')
    sys.exit(1)

def getCourses():
    '''
    Fetches the entire contents of the `course` table (1 column).

    Args:
        none.
    Returns:
        A list of course codes available in `course`.
    '''
    c = conn.cursor()
    try:
        c.execute("""SELECT * FROM course""")
        conn.commit()
        #inserted new user
        return c.fetchall()
    except pg8000.ProgrammingError as e:
        log.fail(str(e))
        conn.rollback()
        return False

def getSections(course_code, year, semester, active):
    '''
    Fetches the contents of a join of the `section` and `teaches` tables.

    Args:
        course_code: the course code of the course to which the section belongs.
        year: the year during which the section is offered.
        semester: the semester during which the sections ifs offered.
        active: whether the section is "active" (has an assigned TA)
    Returns:
        A list of tuples of (section ID, weekday, startTime, endTime)
    '''
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
                        (course_code, year, semester))
        else :
            c.execute("""SELECT sectionID, weekday, startTime, endTime
                    FROM section
                    WHERE course=%s
                        AND currYear=%s
                        AND semester=%s""",
                        (course_code, year, semester))
        conn.commit()
        res = c.fetchall()
        return res
    except pg8000.ProgrammingError as e:
        log.fail(str(e))
        conn.rollback()
        return False

def getSectionTA(course_code, section_id, year=getYearSemester()[0], semester=getYearSemester()[1]):
    '''
    Fetches TAs for a given section.

    Args:
        course_code: the course code of the course to which a given section belongs.
        section_id: the ID of the section to query.
        year: the year during which the section is offered.
        semester: the semester during which the sections ifs offered.
    Returns:
        A tuple with identifying information about a TA: (taID, firstName, lastName)
    '''
    c = conn.cursor()
    try:
        c.execute('''SELECT taID, firstName, lastName
                    FROM TA, TEACHES
                    WHERE TA.stnum=TEACHES.taID
                        AND TEACHES.course=%s
                        AND TEACHES.section=%s
                        AND TEACHES.currYear=%s
                        AND TEACHES.semester=%s''', (course_code, section_id, year, semester,))
        conn.commit()
        return c.fetchall()
    except pg8000.ProgrammingError as e:
        log.fail(str(e))
        conn.rollback()
        return False

def createTA(stnum, fname, lname,  profilepic):
    '''
    Inserts a TA's identifying information in to the `ta` table.

    Args:
        stnum: the TA's student number.
        fname: the TA's first name.
        lname: the TA's last name.
        profilepic: the URL of a profile picture to be used in a TA's profile.
    Returns:
        A tuple with (HTTP status code, human-readable status, verbose message)
    '''
    c = conn.cursor()
    try:
        c.execute("""INSERT INTO ta (stnum, firstname, lastname, profilepic) VALUES (%s,%s,%s,%s)""", (stnum, fname, lname, profilepic))
        conn.commit()
        return (200, 'success', 'Success')
    except pg8000.ProgrammingError as e:
        log.fail(str(e[3]) + ' : ' + str(e[4]))
        conn.rollback()
        return (409, 'fail', 'TA is already registered')
    except Exception as e:
        log.fail(e[2] + ' ' + e[3])
        conn.rollback()
        return (500, 'fail', 'An unknown error has occurred')

def createCourse(course_code):
    '''
    Inserts a course code into the `course` table.

    Args:
        course_code: the course code.
    Returns:
        A tuple with (HTTP status code, human-readable status, verbose message)
    '''
    c = conn.cursor()
    try:
        c.execute("""INSERT INTO course (code) VALUES (%s)""", (course_code,))
        conn.commit()
        return (200, 'success', 'Success')
    except pg8000.ProgrammingError:
        conn.rollback()
        return (409, 'fail', 'Course already exists')
    except Exception:
        conn.rollback()
        return (500, 'fail', 'An unknown error has occurred')

#def createSection(courseCode, sectionCode, year, semester, weekday, startTime, endTime):
def createSection(courseCode, sectionCode, year, semester, weekday, startTime, endTime):
    c = conn.cursor()
    try:
        c.execute("""INSERT INTO section(course, sectionID,  currYear, semester, weekday, startTime, endTime) VALUES (%s, %s, %s, %s ,%s,%s,%s)""",
            (courseCode, sectionCode, year, semester, weekday, startTime, endTime,))
        conn.commit()
        return (200, 'success', 'success')
    except pg8000.ProgrammingError as e:
        print(e)
        conn.rollback()
        return (409, 'fail', 'Section exists')
    except Exception as e:
        print(e)
        conn.rollback()
        return (500, 'fail', 'Database error')

def assign_ta_to_section(ta_id, course_code, section_id):
    c = conn.cursor()
    try:
        year, semester = getYearSemester()
        c.execute("""INSERT INTO teaches(taid, course, section, curryear, semester) VALUES (%s, %s, %s, %s, %s)""",
                (ta_id, course_code, section_id, year, semester))
        conn.commit()
        return (200, 'success', 'Success')
    except pg8000.ProgrammingError as e:
        print(e)
        conn.rollback()
        return (409, 'fail', 'This TA is already assigned to this section')
    except Exception as e:
        print(e)
        conn.rollback()
        return (500, 'fail', 'Database error')

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
        return (200, 'success', 'Success')
    except pg8000.ProgrammingError as e:
        # log.fail(e[3] + ' : ' + e[4])
        conn.rollback()
        return (400, 'fail', 'Duplicate feedback')

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

