from django.db import models

# Create your models here.


class Comment(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=False)
    text = models.CharField(max_length=2**10 * 50, null=False)
    parent = models.ForeignKey(to='Comment', related_name='children',
                                  default=None, null=True)

    def as_dict(self):
        result = {
            'text': self.text,
        }
        if self.children.exists():
            result['children'] = {
                child.id: child.as_dict() for child in self.children.all()
            }
        return result