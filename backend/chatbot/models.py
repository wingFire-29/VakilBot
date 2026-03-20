from django.db import models
import uuid


class ChatSession(models.Model):
    """A single chat session between a client and the AI."""
    session_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    firm = models.ForeignKey(
        'firms.LawFirm',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sessions'
    )
    user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sessions'
    )
    # For anonymous widget users (no account)
    anonymous_id = models.CharField(max_length=64, blank=True)
    client_name = models.CharField(max_length=100, blank=True)
    client_email = models.CharField(max_length=200, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Session {self.session_id} - {self.firm}"

    class Meta:
        ordering = ['-last_active']


class Message(models.Model):
    """A single message within a chat session."""
    ROLE_CHOICES = (
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    )
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    sources = models.JSONField(default=list, blank=True)  # references from RAG retrieval
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.role}] {self.content[:60]}..."

    class Meta:
        ordering = ['timestamp']
