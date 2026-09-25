package com.callflow.api.event;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CallEventConsumer {

    private final SimpMessagingTemplate messagingTemplate;
    private final Set<String> deliveredEventKeys = ConcurrentHashMap.newKeySet();

    public CallEventConsumer(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(topics = "call-events", groupId = "callflow-api")
    public void consume(CallEvent event) {
        String key = event.getLinkedId() + "|" + event.getUniqueId() + "|"
                + event.getType() + "|" + event.getTimestamp();
        if (!deliveredEventKeys.add(key)) {
            return;
        }
        System.out.println("[CallEvent received] type=" + event.getType()
                + " callId=" + event.getCallId()
                + " linkedId=" + event.getLinkedId()
                + " status=" + event.getStatus()
                + " time=" + event.getTimestamp());

        // Транслируем событие всем WebSocket клиентам
        messagingTemplate.convertAndSend("/topic/call-events", event);
    }
}
