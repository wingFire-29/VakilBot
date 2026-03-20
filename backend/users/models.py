from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user model for law firm members."""
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('staff', 'Staff'),
        ('client', 'Client'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    phone = models.CharField(max_length=20, blank=True)
    firm = models.ForeignKey(
        'firms.LawFirm',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
