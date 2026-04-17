from django.db import models


class Timeline(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    team = models.ForeignKey(
        "teams.Team",
        related_name="timeline_events",
        on_delete=models.CASCADE,
    )
    date = models.DateField()

    def __str__(self):
        return f"Timeline: {self.title}"
