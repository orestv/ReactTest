from django.http import JsonResponse

# Create your views here.
import django.views.generic.base as django_base_views
from main.models import Comment


class JSONResponseMixin(object):
    """
    A mixin that can be used to render a JSON response.
    """
    def render_to_json_response(self, context, **response_kwargs):
        """
        Returns a JSON response, transforming 'context' to make the payload.
        """
        return JsonResponse(
            self.get_data(context),
            **response_kwargs
        )

    def get_data(self, context):
        """
        Returns an object that will be serialized as JSON by json.dumps().
        """
        # Note: This is *EXTREMELY* naive; in reality, you'll need
        # to do much more complex handling to ensure that arbitrary
        # objects -- such as Django model instances or querysets
        # -- can be serialized as JSON.
        return context


class Home(django_base_views.TemplateView):
    template_name = 'main/index.html'


class CommentsView(django_base_views.View):

    def dispatch(self, request, *args, **kwargs):
        return super(CommentsView, self).dispatch(request, *args, **kwargs)

    def get_comment_list(self):
        first_level_comments = Comment.objects.filter(parent=None)
        comment_list = [
            comment.as_dict()
            for comment in first_level_comments
        ]
        return comment_list

    def get(self, request, *args, **kwargs):

        comment_list = self.get_comment_list()

        response_dict = {'comments': comment_list}

        return JsonResponse(response_dict, safe=False)

    def post(self, request, *args, **kwargs):

        author = request.POST['author']
        text = request.POST['text']
        parent_id = request.POST.get('parentCommentId', None)

        if parent_id:
            parent = Comment.objects.get(pk=parent_id)
        else:
            parent = None

        comment = Comment(author=author, text=text, parent=parent)
        comment.save()

        comment_list = self.get_comment_list()
        response_dict = {'comments': comment_list}

        return JsonResponse(response_dict, safe=False)
