import json
import os

os.environ['DJANGO_SETTINGS_MODULE'] = 'react.settings'

import django
django.setup()

from tornado.ioloop import IOLoop
from tornado.web import RequestHandler, Application, url

from main.models import Comment
from main.forms import CommentForm


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

    def set_default_headers(self):
        super().set_default_headers()

        self.add_header('Access-Control-Allow-Origin', '*')
        self.add_header('Access-Control-Allow-Headers', 'X-CSRFToken')
        self.add_header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')

    def get(self):
        response_dict = {'comments': get_comment_list()}
        comment_json = json.dumps(response_dict)
        self.write(comment_json)

    def post(self, *args, **kwargs):
        author = self.get_argument('author', None)
        text = self.get_argument('text', None)
        parent_id = self.get_argument('parentCommentId', None)

        form = CommentForm(data={
            'author': author,
            'text': text,
            'parent': parent_id
        })
        form.is_valid()     # TODO: raise exception if not valid

        comment = Comment(**form.clean())
        comment.save()

        response_dict = {'comments': get_comment_list()}
        comment_json = json.dumps(response_dict)
        self.write(comment_json)

    def options(self, *args, **kwargs):
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
