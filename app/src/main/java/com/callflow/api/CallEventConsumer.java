package com.callflow.api.event;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class CallEventConsumer {

    @KafkaListener(topics = "call-events", groupId = "callflow-api")
    public void consume(CallEvent event) {
        System.out.println("[CallEvent received] type=" + event.getType()
                + " callId=" + event.getCallId()
                + " operatorId=" + event.getOperatorId()
                + " status=" + event.getStatus()
                + " time=" + event.getTimestamp());
    }
}
