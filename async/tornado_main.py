import json
import sys, os

os.environ['DJANGO_SETTINGS_MODULE'] = 'react.settings'

import django
django.setup()

from tornado.ioloop import IOLoop
from tornado.web import RequestHandler, Application, url

from main.models import Comment


class HelloHandler(RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self):
        text_list = [comment.text for comment in Comment.objects.all()]
        self.write("Hello!")
        self.write(', '.join(text_list))



def get_comment_list():
    first_level_comments = Comment.objects.filter(parent=None)
    comment_list = [
        comment.as_dict()
        for comment in first_level_comments
    ]
    return comment_list


class CommentsHandler(RequestHandler):
    def get(self):
        self.add_header('Access-Control-Allow-Origin', 'http://127.0.0.1:8081')
        self.add_header('asdfasdf', 'asdfasdfasdf')

        response_dict = {'comments': get_comment_list()}
        comment_json = json.dumps(response_dict)
        self.write(comment_json)

    def options(self, *args, **kwargs):
        self.add_header('Access-Control-Allow-Origin', 'http://127.0.0.1:8081')
        self.add_header('Access-Control-Allow-Headers', 'X-CSRFToken')

        response_dict = {'comments': get_comment_list()}
        comment_json = json.dumps(response_dict)
        self.write(comment_json)


def make_app():
    return Application([
        url(r'/',  HelloHandler),
        url(r'/comments.json', CommentsHandler),
    ],
    debug=True)


def main():
    app = make_app()
    app.listen(8888)
    IOLoop.current().start()


if __name__ == '__main__':
    main()
