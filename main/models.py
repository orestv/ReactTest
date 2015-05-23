from django.db import models

# Create your models here.


class Comment(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=False)
    text = models.CharField(max_length=2**10 * 50, null=False)
    author = models.CharField(max_length=512, null=True)
    parent = models.ForeignKey(to='Comment', related_name='children',
                                  default=None, null=True)

    def as_dict(self):
        result = {
            'id': self.pk,
            'text': self.text,
            'author': self.author,
        }
        if self.children.exists():
            result['children'] = [
                child.as_dict() for child in self.children.all()
            ]
        return result