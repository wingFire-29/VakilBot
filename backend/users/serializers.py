from rest_framework import serializers
from django.contrib.auth import get_user_model
from firms.models import LawFirm

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    firm_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'phone', 'firm_name')

    def create(self, validated_data):
        firm_name = validated_data.pop('firm_name', None)
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.role = 'admin'
        user.save()

        if firm_name:
            import uuid
            firm = LawFirm.objects.create(
                name=firm_name,
                owner=user,
                embed_key=str(uuid.uuid4()).replace('-', '')
            )
            user.firm = firm
            user.save()

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone')
