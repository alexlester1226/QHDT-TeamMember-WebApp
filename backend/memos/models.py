from django.db import models


class Memo(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    team = models.ForeignKey(
        "teams.Team",
        related_name="memos",
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return f"Memo: {self.title}"
