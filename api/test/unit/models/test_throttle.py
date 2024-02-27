from django.contrib import admin
from django.test import TestCase

from api.models import ThrottledApplication


class ThrottledApplicationAdminTest(TestCase):

    def test_throttled_application_in_admin(self):
        #test that ThrottledApplication is in Django admin.
        self.assertIn(ThrottledApplication, admin.site._registry)

