from django.contrib import admin
from django.test import TestCase

from oauth2_provider.models import AccessToken


class AccesstokenAdminTest(TestCase):

    def test_accesstoken_in_admin(self):
        #test that accestoken is in Django admin.
        self.assertIn(AccessToken, admin.site._registry)
