from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from teams.models import Team
from users.models import User


class AuthFlowTests(APITestCase):
    def setUp(self):
        self.team = Team.objects.create(name="Alpha", title="A", bio="alpha")

    def test_signup_returns_token_and_adds_user_to_team(self):
        resp = self.client.post(
            reverse("signup"),
            {
                "email": "new@example.com",
                "password": "pw12345!",
                "first_name": "N",
                "last_name": "U",
                "type": "member",
                "team": "alpha",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", resp.data)
        user = User.objects.get(email="new@example.com")
        self.assertTrue(user.check_password("pw12345!"))
        self.assertTrue(self.team.users.filter(id=user.id).exists())
        self.assertEqual(Token.objects.get(user=user).key, resp.data["token"])

    def test_signup_with_unknown_team_rejected(self):
        resp = self.client.post(
            reverse("signup"),
            {"email": "x@example.com", "password": "pw12345!", "team": "nope"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("nope", resp.data["error"])
        self.assertFalse(User.objects.filter(email="x@example.com").exists())

    def test_signup_without_team_bio_rejected(self):
        resp = self.client.post(
            reverse("signup"),
            {"email": "x@example.com", "password": "pw12345!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_same_token(self):
        self.client.post(
            reverse("signup"),
            {
                "email": "u@example.com",
                "password": "pw12345!",
                "first_name": "U",
                "last_name": "U",
                "team": "alpha",
            },
            format="json",
        )
        resp = self.client.post(
            reverse("login"),
            {"email": "u@example.com", "password": "pw12345!"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        token = Token.objects.get(user__email="u@example.com")
        self.assertEqual(resp.data["token"], token.key)

    def test_login_bad_password(self):
        User.objects.create_user(
            email="u@example.com", password="pw12345!", first_name="U", last_name="U"
        )
        resp = self.client.post(
            reverse("login"),
            {"email": "u@example.com", "password": "wrong"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_end_to_end_signup_then_authenticated_memo_create(self):
        signup = self.client.post(
            reverse("signup"),
            {
                "email": "e2e@example.com",
                "password": "pw12345!",
                "first_name": "E",
                "last_name": "E",
                "team": "alpha",
            },
            format="json",
        )
        token = signup.data["token"]

        # unauthenticated -> 401
        resp = self.client.get(reverse("memo-list"))
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

        # garbage token -> 401
        self.client.credentials(HTTP_AUTHORIZATION="Token not-a-real-token")
        resp = self.client.get(reverse("memo-list"))
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

        # real token -> 201 on create
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        resp = self.client.post(
            reverse("memo-list"),
            {"title": "hi", "body": "ok", "team": self.team.id},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["team_name"], "Alpha")
