package com.example.cmmsApplication.service;

import com.example.cmmsApplication.config.NotificationProperties;
import com.example.cmmsApplication.entity.Notification;
import com.example.cmmsApplication.entity.User;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final NotificationProperties properties;

    public EmailNotificationService(ObjectProvider<JavaMailSender> mailSenderProvider, NotificationProperties properties) {
        this.mailSenderProvider = mailSenderProvider;
        this.properties = properties;
    }

    public boolean send(Notification notification) {
        User recipient = notification.getRecipientUser();
        if (recipient == null || recipient.getEmail() == null || recipient.getEmail().isBlank()) {
            return false;
        }
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            return false;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.getFromAddress());
        message.setTo(recipient.getEmail());
        message.setSubject(notification.getTitle());
        message.setText(notification.getMessage());
        mailSender.send(message);
        return true;
    }
}
