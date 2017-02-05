#####
# Authors: NuclearBanane, inspectorG4dget
# Contributors :
# Date : 2016/12/30
# Version : v0.7
#####

import datetime
import dbhandler
import json
import re
import tornado.ioloop
import tornado.web

from datetime import datetime as dt

def getYearSemester(year=dt.today().year, month=dt.today().month):
    semester = {0:2, 1:3, 2:1, 3:1}[month//4]
    return year, semester

class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("user")

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("assets/index.html")

class FeedBackHandler(tornado.web.RequestHandler):
    def get(self):
        courses= dbhandler.getCourses()
        courses_u = [str(k[0]) for k in courses]
        self.render("assets/feedback.html")

class ManageHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("assets/professor.html")

####
# Used for AJAX POST requests
####

class SubmitFeedbackHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        student_number = self.get_argument('student_number')
        course_code = self.get_argument('course_code')
        section_id = self.get_argument('section_id')
        ta_id = self.get_argument('ta_id')
        q1 = self.get_argument('q1')
        q2 = self.get_argument('q2')
        q3 = self.get_argument('q3')
        feedback = self.get_argument('feedback')
        status = dbhandler.submitFeedback(student_number, course_code, section_id, ta_id, q1, q2, q3, feedback)
        self.write(json.dumps({'status' : status}))
        self.finish()

class GetCoursesHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        courses= dbhandler.getCourses()
        courses_u = [str(k[0]) for k in courses]
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
            results[i][2] = startTime.strftime("%H:%M")
            results[i][3] = endTime.strftime("%H:%M")

        self.write(json.dumps({'results' : results}))
        self.finish()

class GetSectionTAHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        course_code = self.get_argument("course_code")
        section_id = self.get_argument("section_id")

        today = dt.today()
        year, semester = getYearSemester(today.year, today.month)
        try:
            active = self.get_argument('active')
        except :
            active = False
        results = list(dbhandler.getSectionTA(course_code, section_id, year, semester))
        for i,(taID, fname, lname) in enumerate(results):
            name = "%s %s" %(fname, lname)
            results[i] = {"taID": str(taID), "name": name}
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
        course_code = self.get_argument('course_code').upper()
        if re.match(r'^[A-Z]{3}\d{4}', course_code):
            if dbhandler.createCourse(course_code):
                self.set_status(200)
            else:
                self.set_status(409)
        else:
            self.set_status(400)
        self.finish()

class AddSectionHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def put(self):
        flag = False
        course_code = self.get_argument('course_code').upper()
        if not re.match(r'^[A-Z]{3}\d{4}', course_code):
            self.set_status(400)
            flag = True
        section_id = self.get_argument('section_id')
        year = int(self.get_argument('year'))
        if year < datetime.datetime.now().year:
            self.set_status(400)
            flag = True
        semester = self.get_argument('semester')
        semester = ['fall', 'winter', 'spring', 'summer'].index(semester) + 1
        if not 1 <= semester <= 4:
            self.set_status(400)
            flag = True
        weekday = self.get_argument('weekday').lower()
        weekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].index(weekday) + 1
        if not 1 <= weekday <= 7:
            self.set_status(400)
            flag = True
        if not flag:
            start_time = self.get_argument('start_time')
            end_time = self.get_argument('end_time')
            dbhandler.createSection(course_code, section_id, year, semester, weekday, start_time, end_time)
        self.finish()

class AddTAHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        dbhandler.createTA(self.request.arguments)

class AssignTAHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        ta_id = int(self.get_argument('ta_id'))
        course_code = self.get_argument('course_code').upper()
        section_id = self.get_argument('section_id').upper()
        dbhandler.assign_ta_to_section(ta_id, course_code, section_id)

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

        self.write(json.dumps({"results": ta_list}))
        self.finish()

####
# Tornado uses 'handlers' to take care of requests to certain URLs
# This makes certain API requests from a web page or such an easy to handle
# Unfortunatly it means we need to be very granular with our handlers
####

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
                'debug' : True,
                'cookie_secret' : '9e3c8a18-1f36-4dc0-84d2-38ef3160528f'
            }
        tornado.web.Application.__init__(self, handlers, **settings)

if __name__ == "__main__":
    app = AnonymousFeedback()
    app.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
