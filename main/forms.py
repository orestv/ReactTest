from django.forms import ModelForm
from main.models import Comment


class CommentForm(ModelForm):
    class Meta:
        model = Comment
        fields = (
            'text',
            'author',
            'parent'
        )


