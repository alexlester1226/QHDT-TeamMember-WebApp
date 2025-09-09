from django.db import models

class User(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    type = models.CharField(max_length=50)
    team = models.CharField(max_length=50)
    token = models.CharField(max_length=100, blank=True, null=True)  # Field to store token


    def __str__(self):
        return self.email
