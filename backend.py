#####
# Author: NuclearBanane
# Contributors :
# Date : 2016/12/17
# Version : v0.1
#####

import tornado.ioloop
import tornado.web
import dbhandler
import json


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
        dbhandler.submitFeedback(self.request.arguments)
        self.write('{success}')
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
        results = dbhandler.getSections(code)
        self.write(json.dumps({"results":results}))
        self.finish()

class ViewFeedbackHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        x = dbhandler.getFeedBack(self.request.arguments)
        self.write(json.dumps(x))
        self.finish()

class AddCourseHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        dbhandler.createCourse(self.request.arguments)

class AddSectionHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        dbhandler.createSection(self.request.arguments)


class AddTAHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        dbhandler.createTA(self.request.arguments)

class AssignTAHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        dbhandler.getFeedBack(self.request.arguments)


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
