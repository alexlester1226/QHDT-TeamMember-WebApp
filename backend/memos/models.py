from django.db import models

# Create your models here.

class Memo(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    team = models.CharField(max_length=200)


    def __str__(self):
        return f"Post: {self.title}"