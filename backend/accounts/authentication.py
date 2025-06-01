from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Get the token from cookie 'access_token'
        raw_token = request.COOKIES.get('access_token')
        if raw_token is None:
            return None  # no token found, move on to other auth methods or deny access
        
        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
