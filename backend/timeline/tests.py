from datetime import date

from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from teams.models import Team
from timeline.models import Timeline
from users.models import User


class IsSameTeamTimelineTests(APITestCase):
    def setUp(self):
        self.team_a = Team.objects.create(name="Alpha", title="A", bio="alpha")
        self.team_b = Team.objects.create(name="Bravo", title="B", bio="bravo")

        self.user_a = User.objects.create_user(
            email="a@example.com", password="pw12345!", first_name="A", last_name="A"
        )
        self.user_b = User.objects.create_user(
            email="b@example.com", password="pw12345!", first_name="B", last_name="B"
        )
        self.team_a.users.add(self.user_a)
        self.team_b.users.add(self.user_b)

        self.ev_a = Timeline.objects.create(
            title="ev-a", description="x", team=self.team_a, date=date(2026, 1, 1)
        )
        self.ev_b = Timeline.objects.create(
            title="ev-b", description="y", team=self.team_b, date=date(2026, 2, 2)
        )

        self.token_a = Token.objects.create(user=self.user_a).key

    def _auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token_a}")

    def test_unauthenticated_denied(self):
        resp = self.client.get(reverse("timeline-list"))
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_scoped_to_team(self):
        self._auth()
        resp = self.client.get(reverse("timeline-list"))
        self.assertEqual(resp.status_code, 200)
        ids = [r["id"] for r in resp.data]
        self.assertEqual(ids, [self.ev_a.id])

    def test_cross_team_detail_not_found(self):
        self._auth()
        resp = self.client.get(reverse("timeline-detail", args=[self.ev_b.id]))
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_for_other_team_denied(self):
        self._auth()
        resp = self.client.post(
            reverse("timeline-list"),
            {
                "title": "x",
                "description": "y",
                "team": self.team_b.id,
                "date": "2026-03-03",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
