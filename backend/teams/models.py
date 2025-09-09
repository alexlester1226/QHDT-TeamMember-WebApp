from django.db import models
from users.models import User
from memos.models import Memo

class Team(models.Model):
    name = models.CharField(max_length=50)
    title = models.CharField(max_length=20000)
    bio = models.CharField(max_length=255)  # specify max_length for CharField
    users = models.ManyToManyField(User, related_name='teams', blank=True)
    memos = models.ManyToManyField(Memo, related_name='teams', blank=True)

    def __str__(self):
        return self.name  # return name instead of email
