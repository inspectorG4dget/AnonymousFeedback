#####
# Authors: NuclearBanane, inspectorG4dget
# Contributors :
# Date : 2016/12/30
# Version : v0.7
#####

import tornado.ioloop
import tornado.web
import dbhandler
import json

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
        self.render("assets/student.html",courses=courses_u )

class ManageHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("assets/professor.html")

####
# Used for AJAX POST requests
####

class SubmitFeedbackHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        payload = json.loads(self.request.body)
        try:
            student_number = payload['student']
            course_code = payload['course']
            section = payload['section']
            feedback = payload['feedback']
        except KeyError as e:
            print(e)
            status = 'Missing argument: {0}'.format(e.args[0])
        status = dbhandler.submitFeedback(student_number, course_code, section, feedback[0])
        self.write(json.dumps({'status' : status}))
        self.finish()

class GetCoursesHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        courses= dbhandler.getCourses()
        courses_u = [str(k[0]) for k in courses]
        self.write(json.dumps({"results":courses_u}))
        self.finish()

class GetSectionsHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        code=self.get_argument("coursecode")

        today = dt.today()
        year, semester = getYearSemester(today.year, today.month)
        results = list(dbhandler.getSections(code, year, semester, active=True))
        for i, (sectionID, weekday, startTime, endTime) in enumerate(results):
            results[i][1] = str(weekday)
            results[i][2] = startTime.strftime("%H:%M")
            results[i][3] = endTime.strftime("%H:%M")

        self.write(json.dumps({"results":results}))
        self.finish()

class GetSectionTAHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        course = self.get_argument("course")
        section = self.get_argument("section")

        today = dt.today()
        year, semester = getYearSemester(today.year, today.month)
        try:
            active = self.get_argument('active')
        except :
            active = False
        results = list(dbhandler.getSectionTA(course, section, year, semester))
        for i,(taID, fname, lname) in enumerate(results):
            name = "%s %s" %(fname, lname)
            results[i] = {"taID": str(taID), "name": name}
        self.write(json.dumps({"TAs":results}))
        self.finish()


class ViewFeedbackHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
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
    def post(self):
        dbhandler.createCourse(self.get_argument('courseCode'))

class AddSectionHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        courseCode = self.get_argument('courseCode')
        sectionCode = self.get_argument('sectionCode')
        year = self.get_argument('year')
        semester = self.get_argument('semester')
        weekday = self.get_argument('weekday')
        startTime = self.get_argument('startTime')
        endTime = self.get_argument('endTime')
        dbhandler.createSection(courseCode, sectionCode, year, semester, weekday, startTime, endTime)


class AddTAHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        dbhandler.createTA(self.request.arguments)

class AssignTAHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        dbhandler.getFeedBack(self.request.arguments)


class ListAllTAsHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        a = dbhandler.getAllTAs()
        print(a)
        self.write(json.dumps({"results":a}))
        self.finish()


####
# Tornado uses 'handlers' to take care of requests to certain URLs
# This makes certain API requests from a web page or such an easy to handle
# Unfortunatly it means we need to be very granular with our handlers
####

application = tornado.web.Application(
    [
    (r'/',              MainHandler),
    (r'/feedback',      FeedBackHandler),
    (r'/manage',        ManageHandler),
    # asynchronous API end poins
    (r'/submitFeedBack',SubmitFeedbackHandler),
    (r'/getSections',   GetSectionsHandler),
    (r'/getCourses',    GetCoursesHandler),
    (r'/addCourse',     AddCourseHandler),
    (r'/addSection',    AddSectionHandler),
    (r'/addTA',         AddTAHandler),
    (r'/assignTA',      AssignTAHandler),
    (r'/viewFeedBack',  ViewFeedbackHandler),
    (r'/getSectionTAs', GetSectionTAHandler),
    (r'/getTA',     ListAllTAsHandler),
    # Static asset handlers
    (r'/(favicon.ico)', tornado.web.StaticFileHandler, {'path': 'assets/'        }),
    (r'/images/(.*)',   tornado.web.StaticFileHandler, {'path': 'assets/images/' }),
    (r'/fonts/(.*)',    tornado.web.StaticFileHandler, {'path': 'assets/fonts/'  }),
    (r'/css/(.*)',      tornado.web.StaticFileHandler, {'path': 'assets/css/'    }),
    (r'/js/(.*)',       tornado.web.StaticFileHandler, {'path': 'assets/js/'     })
    ],cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__")

####
# When you run python restaurant.py, this runs and starts the tornado listner
####
if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
