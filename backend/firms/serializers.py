from rest_framework import serializers
from .models import LawFirm


class LawFirmSerializer(serializers.ModelSerializer):
    total_chats = serializers.SerializerMethodField()

    class Meta:
        model = LawFirm
        fields = (
            'id', 'name', 'description', 'website', 'address',
            'phone', 'email', 'embed_key', 'allowed_domains',
            'plan', 'is_active', 'created_at', 'total_chats'
        )
        read_only_fields = ('embed_key', 'created_at', 'total_chats')

    def get_total_chats(self, obj):
        return obj.sessions.count() if hasattr(obj, 'sessions') else 0


class LawFirmPublicSerializer(serializers.ModelSerializer):
    """Minimal public info for widget validation."""
    class Meta:
        model = LawFirm
        fields = ('id', 'name', 'is_active', 'allowed_domains')
