package com.callflow.api.event;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class CallEventProducer {

    private static final String TOPIC = "call-events";

    private final KafkaTemplate<String, CallEvent> kafkaTemplate;

    public CallEventProducer(KafkaTemplate<String, CallEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void send(CallEvent event) {
        kafkaTemplate.send(TOPIC, event.getCallId() != null ? event.getCallId().toString() : "operator", event);
    }
}
