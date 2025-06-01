from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
import bcrypt
import jwt
from django.conf import settings
from datetime import datetime, timedelta
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework import serializers


class CookieTokenRefreshSerializer(TokenRefreshSerializer):
    def __init__(self, *args, **kwargs):
        # Grab the request from context and add 'refresh' from cookie to initial data
        request = kwargs.get('context', {}).get('request')
        data = kwargs.get('data', {}).copy() if kwargs.get('data') else {}

        if request is not None:
            refresh = request.COOKIES.get('refresh_token')
            if refresh and refresh != "None":
                data['refresh'] = refresh
            else:
                # No cookie found, validation will fail later
                pass
        
        kwargs['data'] = data
        super().__init__(*args, **kwargs)
    
    def validate(self, attrs):
        # now 'refresh' is already in attrs, no need to add it here again
        return super().validate(attrs)

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        # Only require email, password and password_confirm on registration
        fields = ('email', 'password', 'password_confirm', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            try:
                user = User.objects.get(email=email)
                if user.check_password(password):
                    attrs['user'] = user
                    return attrs
                else:
                    raise serializers.ValidationError('Invalid credentials')
            except User.DoesNotExist:
                raise serializers.ValidationError('Invalid credentials')
        else:
            raise serializers.ValidationError('Must include email and password')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'avatar', 'phone', 'created_at')
        read_only_fields = ('id', 'created_at')

