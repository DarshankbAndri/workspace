package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dto.NotificationDTO;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationStreamService {
    private static final long EMITTER_TIMEOUT_MS = 0L;

    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emittersByUser = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long userId, long unreadCount) {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT_MS);
        emittersByUser.computeIfAbsent(userId, (id) -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> remove(userId, emitter));
        emitter.onTimeout(() -> remove(userId, emitter));
        emitter.onError((error) -> remove(userId, emitter));
        send(userId, emitter, "notification.connected", Map.of("connected", true));
        send(userId, emitter, "notification.count", Map.of("count", unreadCount));
        return emitter;
    }

    public void publishCreated(Long userId, NotificationDTO notification) {
        publish(userId, "notification.created", notification);
    }

    public void publishUpdated(Long userId, NotificationDTO notification) {
        publish(userId, "notification.updated", notification);
    }

    public void publishUnreadCount(Long userId, long unreadCount) {
        publish(userId, "notification.count", Map.of("count", unreadCount));
    }

    @Scheduled(fixedDelay = 25000)
    public void heartbeat() {
        emittersByUser.forEach((userId, emitters) ->
                emitters.forEach((emitter) -> send(userId, emitter, "heartbeat", Map.of("ok", true))));
    }

    private void publish(Long userId, String eventName, Object data) {
        List<SseEmitter> emitters = emittersByUser.get(userId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }
        emitters.forEach((emitter) -> send(userId, emitter, eventName, data));
    }

    private void send(Long userId, SseEmitter emitter, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event().name(eventName).data(data));
        } catch (IOException | IllegalStateException ex) {
            remove(userId, emitter);
        }
    }

    private void remove(Long userId, SseEmitter emitter) {
        List<SseEmitter> emitters = emittersByUser.get(userId);
        if (emitters == null) {
            return;
        }
        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            emittersByUser.remove(userId);
        }
    }
}
