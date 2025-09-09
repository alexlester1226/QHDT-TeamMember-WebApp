from django.db import models

# Create your models here.

class Timeline(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    team = models.TextField()
    date = models.TextField()



    def __str__(self):
        return f"Post: {self.title}"
