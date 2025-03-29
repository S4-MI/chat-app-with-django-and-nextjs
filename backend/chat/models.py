from accounts.models import User
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class Conversation(models.Model):
    title = models.CharField(verbose_name=_("title"), max_length=100, blank=True)
    icon = models.ImageField(
        verbose_name=_("icon"), upload_to="icons/", blank=True, null=True
    )
    is_group = models.BooleanField(verbose_name=_("is_group"), default=False)
    admin = models.ForeignKey(
        verbose_name=_("admin"),
        to=User,
        on_delete=models.CASCADE,
        null=True,
        related_name="admin_conversations",
    )
    members = models.ManyToManyField(
        verbose_name=_("members"),
        to=User,
        related_name="conversations",
    )
    created_at = models.DateTimeField(verbose_name=_("created_at"), auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name=_("updated_at"), auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        verbose_name = _("conversation")
        verbose_name_plural = _("conversations")

    def __str__(self):
        return self.title if self.is_group else "Direct Message"


class Message(models.Model):
    class MessageType(models.TextChoices):
        USER = "user", _("User")
        SYSTEM = "system", _("System")

    conversation = models.ForeignKey(
        verbose_name=_("conversation"),
        to=Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        verbose_name=_("sender"),
        to=User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="sent_messages",
    )
    content = models.TextField(verbose_name=_("content"))
    type = models.CharField(
        verbose_name=_("type"),
        max_length=10,
        choices=MessageType.choices,
        default=MessageType.USER,
    )
    created_at = models.DateTimeField(verbose_name=_("created_at"), auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = _("message")
        verbose_name_plural = _("messages")

    def __str__(self):
        return (
            f"{self.sender.username}: {self.content[:20]}..."
            if self.sender
            else f"System: {self.content[:20]}..."
        )
