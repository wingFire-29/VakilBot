from django.db import models
import uuid


class LawFirm(models.Model):
    """Represents a law firm registered on the platform."""
    name = models.CharField(max_length=200)
    owner = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='owned_firm',
        null=True,
        blank=True
    )
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    embed_key = models.CharField(max_length=64, unique=True, default='')
    allowed_domains = models.TextField(
        blank=True,
        help_text="Comma-separated list of domains allowed to use the widget"
    )
    plan = models.CharField(
        max_length=20,
        choices=(('free', 'Free'), ('pro', 'Pro'), ('enterprise', 'Enterprise')),
        default='free'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.embed_key:
            self.embed_key = uuid.uuid4().hex
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']
