#####
# Authors: NuclearBanane, inspectorG4dget
# Contributors :
# Date : 2016/12/30
# Version : v0.8
#####

import datetime
import dbhandler
import json
import logging
import re
import sys
import toml
import tornado.ioloop
import tornado.web

from datetime import datetime as dt
from slog import Slog

conf = toml.load('conf.toml')

log = Slog(conf['log']['file'], conf['log']['level'])

dbhandler.log = log

def getYearSemester(year=dt.today().year, month=dt.today().month):
    '''
    Given at least a month, returns the current semester. Optionally takes a
    year, but this defaults to the current year, which is often the most
    practical value.

    Args:
        year: defaults to the current year.
        month: an integer [1..12] representing the current month.
    Returns:
        (year, semester)
    '''
    semester = {0:2, 1:3, 2:1, 3:1}[month//4]
    return year, semester

###
# Web frontend handlers. Render static assets to a browser.
###
class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie('user')

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('assets/index.html')

class FeedBackHandler(tornado.web.RequestHandler):
    def get(self):
        courses= dbhandler.getCourses()
        courses_u = [str(k[0]) for k in courses]
        self.render('assets/feedback.html')

class ManageHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('assets/professor.html')

###
# RESTful API endpoints
###
class SubmitFeedbackHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        resp = {
                'status' : 'fail',
                'msg': None
            }
        try:
            student_number = self.get_argument('student_number')
            course_code = self.get_argument('course_code')
            section_id = self.get_argument('section_id')
            ta_id = self.get_argument('ta_id')
            q1 = self.get_argument('q1')
            q2 = self.get_argument('q2')
            q3 = self.get_argument('q3')
            feedback = self.get_argument('feedback')
        except KeyError as e:
            print(e)
        (http_status, status, message) = dbhandler.submitFeedback(student_number, course_code, section_id, ta_id, q1, q2, q3, feedback)
        resp['status'] = status
        resp['msg'] = message
        self.write(json.dumps(resp))
        self.set_status(http_status)
        self.finish()

class GetCoursesHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        courses= dbhandler.getCourses()
        courses_u = sorted([str(k[0]) for k in courses])
        self.write(json.dumps({'results' : courses_u}))
        self.finish()

class GetSectionsHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        course_code = self.get_argument('course_code')
        try:
            active = bool(int(self.get_argument('active')))
        except:
            active = True

        today = dt.today()
        year, semester = getYearSemester(today.year, today.month)
        results = list(dbhandler.getSections(course_code, year, semester, active))
        for i, (sectionID, weekday, startTime, endTime) in enumerate(results):
            results[i][1] = str(weekday)
            results[i][2] = startTime.strftime('%H:%M')
            results[i][3] = endTime.strftime('%H:%M')

        self.write(json.dumps({'results' : sorted(results)}))
        self.finish()

class GetSectionTAHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        course_code = self.get_argument('course_code')
        section_id = self.get_argument('section_id')

        today = dt.today()
        year, semester = getYearSemester(today.year, today.month)
        try:
            active = self.get_argument('active')
        except :
            active = False
        results = list(dbhandler.getSectionTA(course_code, section_id, year, semester))
        for i,(taID, fname, lname) in enumerate(results):
            name = '%s %s' %(fname, lname)
            results[i] = {'taID': str(taID), 'name': name}
        self.write(json.dumps({'results' : results}))
        self.finish()


class ViewFeedbackHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        try:
            course_code = self.get_argument('courseCode')
            section_code = self.get_argument('sectionCode')
        except KeyError as e:
            print(e)

        # pull data or an error from the database
        data = dbhandler.getCourseFeedbacks(course_code, section_code)

        # do triage on the returned data : error if it's a string, success if it's a dict
        if type(data) == str: status = 'error'
        else: status = 'success'

        # pass the information on to the client
        self.write(json.dumps({
            'status' : status,
            'data' : data
        }))

        self.finish()
class AddCourseHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def put(self):
        '''
        Invokes `dbhandler.createCourse()` to add a course to the `course` table.

        Args:
            course_code: the course to add, identified by a code matching /^[A-Za-z]{3}\d{4}$/.
        Returns:
            HTTP 200 on success
            HTTP 400 if the request is malformed
            HTTP 409 if a course is a duplicate
            HTTP 500 for other errors
        '''
        try:
            course_code = self.get_argument('course_code').upper()
        except KeyError as e:
            log.info('Missing argument: course_code')
            self.set_status(400)
            self.finish()

        if re.match(r'^[A-Z]{3}\d{4}', course_code):
            db_status = dbhandler.createCourse(course_code)
            self.set_status(db_status[0])
            self.write(db_status[2])
        else:
            self.set_status(400)
        self.finish()

# TODO: review error handling and input validation. Could probably be streamlined a bit.
class AddSectionHandler(tornado.web.RequestHandler):
    '''
    Invokes dbhandler.createSection to register a new section for a course.

    Args:
        course_code: the course code. Matches /^[A-Za-z]{3}\d{4}$/.
        section_id: the section ID to add.
        year: the calendar year during which the section will be available.
        semester: the semester during which the section will be available. Maps [fall..summer] => [1..4].
        weekday: the weekday during which the section will be available. Maps [mon..sun] => [1..7].
        start_time: the 24h time when a section starts.
        end_time: the 24h time when a section ends.
    '''
    @tornado.web.asynchronous
    def put(self):
        flag = False
        resp = {
                'status' : 'fail',
                'msg': None
            }
        try:
            course_code = self.get_argument('course_code').upper()
            section_id = self.get_argument('section_id')
            year = int(self.get_argument('year'))
            semester = self.get_argument('semester')
            weekday = self.get_argument('weekday').lower()
            start_time = self.get_argument('start_time')
            end_time = self.get_argument('end_time')
        except KeyError as e:
            self.set_status(400)
            resp['msg'] = 'Missing form field'
            self.write(json.dumps(resp))
            self.finish()

        start_time_dt = None
        resp = {
                'status' : 'fail',
                'msg': None
            }

        if not re.match(r'^[A-Z]{3}\d{4}', course_code):
            self.set_status(400)
            resp['msg'] = 'Invalid course code'
            flag = True
        if not flag and year < datetime.datetime.now().year:
            self.set_status(400)
            resp['msg'] = 'Invalid year'
            flag = True
        semester = ['fall', 'winter', 'spring', 'summer'].index(semester) + 1
        if not flag and not 1 <= semester <= 4:
            self.set_status(400)
            resp['msg'] = 'Invalid semester'
            flag = True
        weekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].index(weekday) + 1
        if not flag and not 1 <= weekday <= 7:
            self.set_status(400)
            resp['msg'] = 'Invalid weekday'
            flag = True
        if not flag and not re.match(r'^\d{1,2}:\d{2}', start_time):
            self.set_status(400)
            resp['msg'] = 'Invalid start time'
            flag = True
        if not flag and not re.match(r'^\d{1,2}:\d{2}', end_time):
            self.set_status(400)
            resp['msg'] = 'Invalid end time'
            flag = True
        if not flag:
            try:
                h, m = start_time.split(':')
                start_time_dt = datetime.datetime(1, 1, 1, int(h), int(m))
            except ValueError as e:
                self.set_status(400)
                resp['msg'] = 'Invalid start time'
                flag = True
        if not flag:
            try:
                h, m = end_time.split(':')
                end_time_dt = datetime.datetime(1, 1, 1, int(h), int(m))
                if end_time_dt < start_time_dt:
                    raise ValueError
            except ValueError as e:
                self.set_status(400)
                resp['msg'] = 'Invalid end time'
                flag = True
        if not flag:
            (http_status, status, msg) = dbhandler.createSection(course_code, section_id, year, semester, weekday, start_time, end_time)
            self.set_status(http_status)
            resp['status'] = status
            resp['msg'] = msg
        self.write(json.dumps(resp))
        self.finish()

class AddTAHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def put(self):
        resp = {
                'status' : 'fail',
                'msg': None
            }
        try:
            ta_fname = self.get_argument('fname')
            ta_lname = self.get_argument('lname')
            ta_num = self.get_argument('student_no')
            profile_pic_url = self.get_argument('profile_picture')
        except KeyError as e:
            resp['msg'] = 'Missing form field';
            self.set_status(400)
            self.write(json.dumps(resp))
            self.finish()
        (http_status, status, msg) = dbhandler.createTA(ta_num, ta_fname, ta_lname, profile_pic_url)
        self.set_status(http_status)
        resp['status'] = status
        resp['msg'] = msg
        self.write(json.dumps(resp))
        self.finish()

class AssignTAHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        resp = {
                'status' : 'fail',
                'msg': None
            }
        try:
            ta_id = int(self.get_argument('ta_id'))
            course_code = self.get_argument('course_code').upper()
            section_id = self.get_argument('section_id').upper()
        except KeyError as e:
            resp['msg'] = 'Missing form field';
            self.set_status(400)
            self.write(json.dumps(resp))
            self.finish()
        (http_status, status, msg) = dbhandler.assign_ta_to_section(ta_id, course_code, section_id)
        self.set_status(http_status)
        resp['status'] = status
        resp['msg'] = msg
        self.write(json.dumps(resp))
        self.finish()

class ListAllTAsHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        ta_list = []
        tas = dbhandler.getAllTAs()
        for (ta_id, name) in tas:
            ta_list.append({
                    'id' : ta_id,
                    'name' : name
                })

        self.write(json.dumps({'results': ta_list}))
        self.finish()

####
# Tornado uses 'handlers' to take care of requests to certain URLs
# This makes certain API requests from a web page or such an easy to handle
# Unfortunatly it means we need to be very granular with our handlers
####

conf = conf['app']

# we subclass the Application class to configure some useful settings (like the cookie
# secret and the debug option) more cleanly
class AnonymousFeedback(tornado.web.Application):
    def __init__(self, **overrides):
        handlers = [
                (r'/',                      MainHandler),
                (r'/feedback',              FeedBackHandler),
                (r'/manage',                ManageHandler),
                # asynchronous API end poins
                (r'/submitFeedback',        SubmitFeedbackHandler),
                (r'/getSections',           GetSectionsHandler),
                (r'/getCourses',            GetCoursesHandler),
                (r'/addCourse',             AddCourseHandler),
                (r'/addSection',            AddSectionHandler),
                (r'/addTA',                 AddTAHandler),
                (r'/assignTA',              AssignTAHandler),
                (r'/viewFeedBack',          ViewFeedbackHandler),
                (r'/getSectionTAs',         GetSectionTAHandler),
                (r'/getTA',                 ListAllTAsHandler),
                # Static asset handlers
                (r'/(favicon.ico)', tornado.web.StaticFileHandler, {'path': 'assets/'        }),
                (r'/images/(.*)',   tornado.web.StaticFileHandler, {'path': 'assets/images/' }),
                (r'/fonts/(.*)',    tornado.web.StaticFileHandler, {'path': 'assets/fonts/'  }),
                (r'/svg/(.*)',      tornado.web.StaticFileHandler, {'path': 'assets/svg/'    }),
                (r'/css/(.*)',      tornado.web.StaticFileHandler, {'path': 'assets/css/'    }),
                (r'/js/(.*)',       tornado.web.StaticFileHandler, {'path': 'assets/js/'     })
            ]
        settings = {
                'debug' : conf['debug'],
                'cookie_secret' : conf['cookie_secret']
        }
        tornado.web.Application.__init__(self, handlers, **settings)

if __name__ == '__main__':
    logging.getLogger('tornado.access').disabled = True
    app = AnonymousFeedback()
    log.info('Starting {0} on port {1}.'.format(conf['name'], conf['port']))
    try:
        app.listen(conf['port'])
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        log.info('Received KeyboardInterrupt, exiting.')
        sys.exit(0)
    except Exception as e:
        print(e)
        log.crit('Encountered an unhandled exception.')
