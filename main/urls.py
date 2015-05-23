from django.conf.urls import url

import main.views as main_views

urlpatterns = [
    url(r'^$', main_views.Home.as_view(), name='main_home'),
    url(r'^comments.json', main_views.CommentsView.as_view()),
    # url(r'^add_comment', main_views.AddComment.as_view()),
]