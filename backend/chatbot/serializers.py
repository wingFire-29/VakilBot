from rest_framework import serializers
from .models import ChatSession, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'role', 'content', 'sources', 'timestamp')


class ChatSessionSerializer(serializers.ModelSerializer):
    """Full session serializer - includes messages (used for session detail)."""
    messages = MessageSerializer(many=True, read_only=True)
    message_count = serializers.IntegerField(source='messages.count', read_only=True)

    class Meta:
        model = ChatSession
        fields = (
            'session_id', 'firm', 'client_name', 'client_email',
            'started_at', 'last_active', 'is_active',
            'message_count', 'messages'
        )
        read_only_fields = ('session_id', 'started_at', 'last_active')


class ChatSessionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing sessions (no messages)."""
    message_count = serializers.IntegerField(source='messages.count', read_only=True)

    class Meta:
        model = ChatSession
        fields = (
            'session_id', 'client_name', 'client_email',
            'started_at', 'last_active', 'is_active', 'message_count'
        )
        read_only_fields = ('session_id', 'started_at', 'last_active')


class AskQuestionSerializer(serializers.Serializer):
    question = serializers.CharField(max_length=2000)
    session_id = serializers.UUIDField(required=False)
    embed_key = serializers.CharField(required=False, allow_blank=True)
    client_name = serializers.CharField(required=False, allow_blank=True)
    client_email = serializers.CharField(required=False, allow_blank=True)
