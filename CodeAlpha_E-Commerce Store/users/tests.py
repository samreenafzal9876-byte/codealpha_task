from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User

class UserAuthTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.username = 'testuser'
        self.password = 'testpassword123'
        self.email = 'test@example.com'
        self.user = User.objects.create_user(
            username=self.username,
            password=self.password,
            email=self.email,
            first_name='Original',
            last_name='User'
        )

    def test_registration_view_get(self):
        response = self.client.get(reverse('users:register'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Sign Up')

    def test_registration_view_post_success(self):
        post_data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password1': 'AuraPass123!@#',
            'password2': 'AuraPass123!@#',
        }
        response = self.client.post(reverse('users:register'), post_data)
        # Success redirects to product list page
        self.assertEqual(response.status_code, 302)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_login_view_success(self):
        post_data = {
            'username': self.username,
            'password': self.password
        }
        response = self.client.post(reverse('users:login'), post_data)
        self.assertEqual(response.status_code, 302)
        # Session should contain the authenticated user
        self.assertEqual(int(self.client.session['_auth_user_id']), self.user.pk)

    def test_profile_view_redirects_anonymous_user(self):
        response = self.client.get(reverse('users:profile'))
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse('users:login'), response.url)

    def test_profile_view_logged_in_user(self):
        self.client.login(username=self.username, password=self.password)
        response = self.client.get(reverse('users:profile'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.username)
        self.assertContains(response, 'Original')
        self.assertContains(response, 'User')

    def test_profile_update_post_success(self):
        self.client.login(username=self.username, password=self.password)
        post_data = {
            'first_name': 'UpdatedFirst',
            'last_name': 'UpdatedLast',
            'email': 'updated@example.com'
        }
        response = self.client.post(reverse('users:profile'), post_data)
        self.assertEqual(response.status_code, 302)
        
        # Verify db changes
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'UpdatedFirst')
        self.assertEqual(self.user.last_name, 'UpdatedLast')
        self.assertEqual(self.user.email, 'updated@example.com')
