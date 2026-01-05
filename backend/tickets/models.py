from django.db import models
from django.conf import settings

class Ticket(models.Model):
    CATEGORY_CHOICES = (
        (1, 'HR'),
        (2, 'IT'),
        (3, 'Facilities'),
        (4, 'Others'),
    )
    
    PRIORITY_CHOICES = (
        (1, 'High'),
        (2, 'Medium'),
        (3, 'Low'),
    )
    
    STATUS_CHOICES = (
        (1, 'Open'),
        (2, 'In Progress'),
        (3, 'Resolved'),
        (4, 'Closed'),
    )
    
    subject = models.CharField(max_length=255)
    description = models.TextField()
    category = models.IntegerField(choices=CATEGORY_CHOICES, default=4)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=3)
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_tickets'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tickets'
    )
    
    class Meta:
        db_table = 'tickets'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"#{self.id} - {self.subject}"


class Comment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'comments'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.full_name} on Ticket #{self.ticket.id}"


class Attachment(models.Model):
    file = models.FileField(upload_to='attachments/%Y/%m/%d/')
    filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='attachments'
    )
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='attachments'
    )
    
    class Meta:
        db_table = 'attachments'
    
    def __str__(self):
        return self.filename


class SLAConfig(models.Model):
    priority = models.IntegerField(unique=True, choices=Ticket.PRIORITY_CHOICES)
    sla_hours = models.IntegerField()
    
    class Meta:
        db_table = 'sla_config'
    
    def __str__(self):
        return f"{self.get_priority_display()} - {self.sla_hours}h"
