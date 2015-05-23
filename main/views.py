from django.http import JsonResponse

# Create your views here.
import django.views.generic.base as django_base_views
from django.views.generic.list import BaseListView, ListView
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

    def get(self, *args, **kwargs):

        first_level_comments = Comment.objects.filter(parent=None)
        comment_list = [
            comment.as_dict()
            for comment in first_level_comments
        ]

        return JsonResponse(comment_list, safe=False)
