package com.callflow.api.call;

import com.callflow.api.client.Client;
import com.callflow.api.client.ClientRepository;
import com.callflow.api.event.CallEvent;
import com.callflow.api.event.CallEventProducer;
import com.callflow.api.event.CallEventType;
import com.callflow.api.operator.Operator;
import com.callflow.api.operator.OperatorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CallService {

    private final CallRepository callRepository;
    private final ClientRepository clientRepository;
    private final OperatorRepository operatorRepository;
    private final CallEventProducer callEventProducer;

    public CallService(CallRepository callRepository,
                        ClientRepository clientRepository,
                        OperatorRepository operatorRepository,
                        CallEventProducer callEventProducer) {
        this.callRepository = callRepository;
        this.clientRepository = clientRepository;
        this.operatorRepository = operatorRepository;
        this.callEventProducer = callEventProducer;
    }

    public List<Call> getAll() {
        return callRepository.findAll();
    }

    public Call getById(Long id) {
        return callRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Call not found: " + id));
    }

    public Call createForClient(Long clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found: " + clientId));
        Call call = new Call(client);
        Call saved = callRepository.save(call);

        callEventProducer.send(new CallEvent(
                CallEventType.CALL_CREATED, saved.getId(), clientId, null, saved.getStatus().name()));

        return saved;
    }

    public Call assignOperator(Long callId, Long operatorId) {
        Call call = getById(callId);
        Operator operator = operatorRepository.findById(operatorId)
                .orElseThrow(() -> new RuntimeException("Operator not found: " + operatorId));
        call.setOperator(operator);
        call.setStatus(CallStatus.ANSWERED);
        call.setAnsweredAt(LocalDateTime.now());
        Call saved = callRepository.save(call);

        callEventProducer.send(new CallEvent(
                CallEventType.CALL_ANSWERED, saved.getId(), saved.getClient().getId(), operatorId, saved.getStatus().name()));

        return saved;
    }

    public Call finish(Long callId) {
        Call call = getById(callId);
        call.setStatus(CallStatus.FINISHED);
        call.setFinishedAt(LocalDateTime.now());
        Call saved = callRepository.save(call);

        Long operatorId = saved.getOperator() != null ? saved.getOperator().getId() : null;
        callEventProducer.send(new CallEvent(
                CallEventType.CALL_FINISHED, saved.getId(), saved.getClient().getId(), operatorId, saved.getStatus().name()));

        return saved;
    }
}
