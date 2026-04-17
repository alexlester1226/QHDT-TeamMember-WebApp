from django.conf import settings
from django.db import models


class Team(models.Model):
    name = models.CharField(max_length=50)
    title = models.CharField(max_length=20000)
    bio = models.CharField(max_length=255)
    users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="teams",
        blank=True,
    )

    def __str__(self):
        return self.name
