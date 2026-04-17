from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from memos.models import Memo
from teams.models import Team
from users.models import User


class IsSameTeamMemoTests(APITestCase):
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

        self.memo_a = Memo.objects.create(title="memo-a", body="x", team=self.team_a)
        self.memo_b = Memo.objects.create(title="memo-b", body="y", team=self.team_b)

        self.token_a = Token.objects.create(user=self.user_a).key
        self.token_b = Token.objects.create(user=self.user_b).key

    def _auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

    def test_unauthenticated_list_denied(self):
        resp = self.client.get(reverse("memo-list"))
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_only_returns_own_team(self):
        self._auth(self.token_a)
        resp = self.client.get(reverse("memo-list"))
        self.assertEqual(resp.status_code, 200)
        ids = [m["id"] for m in resp.data]
        self.assertIn(self.memo_a.id, ids)
        self.assertNotIn(self.memo_b.id, ids)

    def test_cross_team_detail_not_found(self):
        self._auth(self.token_a)
        resp = self.client.get(reverse("memo-detail", args=[self.memo_b.id]))
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_same_team_detail_ok(self):
        self._auth(self.token_a)
        resp = self.client.get(reverse("memo-detail", args=[self.memo_a.id]))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["team_name"], "Alpha")

    def test_create_for_other_team_denied(self):
        self._auth(self.token_a)
        resp = self.client.post(
            reverse("memo-list"),
            {"title": "hack", "body": "x", "team": self.team_b.id},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_cross_team_delete_not_found(self):
        self._auth(self.token_a)
        resp = self.client.delete(reverse("memo-detail", args=[self.memo_b.id]))
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_staff_sees_all_teams(self):
        admin = User.objects.create_user(
            email="admin@example.com", password="pw12345!",
            first_name="A", last_name="D", is_staff=True,
        )
        token = Token.objects.create(user=admin).key
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        resp = self.client.get(reverse("memo-list"))
        ids = [m["id"] for m in resp.data]
        self.assertIn(self.memo_a.id, ids)
        self.assertIn(self.memo_b.id, ids)
