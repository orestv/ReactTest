from django.db import models

# Create your models here.


class Comment(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=False)
    text = models.CharField(max_length=2**10 * 50, null=False)
    parent = models.OneToOneField(to='Comment', default=None)
