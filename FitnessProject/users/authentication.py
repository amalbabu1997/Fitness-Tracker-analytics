from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication that skips CSRF checks.
    """

    def enforce_csrf(self, request):
        # no-op → skips CSRF validation
        return
