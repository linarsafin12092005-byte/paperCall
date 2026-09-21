package com.callflow.api.call;

import com.callflow.api.client.Client;
import com.callflow.api.client.ClientRepository;
import com.callflow.api.event.CallEvent;
import com.callflow.api.event.CallEventProducer;
import com.callflow.api.event.CallEventType;
import com.callflow.api.operator.Operator;
import com.callflow.api.operator.OperatorRepository;
import com.callflow.api.user.User;
import com.callflow.api.user.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CallService {

    private final CallRepository callRepository;
    private final ClientRepository clientRepository;
    private final OperatorRepository operatorRepository;
    private final CallEventProducer callEventProducer;
    private final UserRepository userRepository;

    public CallService(CallRepository callRepository,
                        ClientRepository clientRepository,
                        OperatorRepository operatorRepository,
                        CallEventProducer callEventProducer,
                        UserRepository userRepository) {
        this.callRepository = callRepository;
        this.clientRepository = clientRepository;
        this.operatorRepository = operatorRepository;
        this.callEventProducer = callEventProducer;
        this.userRepository = userRepository;
    }

    public List<Call> getAll(String actorEmail) {
        User actor = requiredUser(actorEmail);
        if (isAdministrator(actor)) {
            return callRepository.findAll();
        }
        return callRepository.findAll().stream()
                .filter(call -> !isArchivedRecord(call))
                .filter(call -> call.getInitiator() != null && actor.getId().equals(call.getInitiator().getId())
                        || call.getRecipient() != null && actor.getId().equals(call.getRecipient().getId()))
                .toList();
    }

    public Call getByIdForActor(String actorEmail, Long id) {
        Call call = getById(id);
        ensureAccess(actorEmail, call);
        return call;
    }

    public Call getById(Long id) {
        return callRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Call not found: " + id));
    }

    @Transactional
    public Call create(String actorEmail, CallRequest request) {
        User initiator = requiredUser(actorEmail);
        Call call = new Call();
        call.setInitiator(initiator);
        call.setCallType(request.callType().toUpperCase());
        call.setTopic(request.topic());
        call.setNote(request.note());
        call.setPlannedAt(request.plannedAt());
        call.setStatus(CallStatus.PLANNED);
        if ("INTERNAL".equalsIgnoreCase(request.callType())) {
            if (request.recipientUserId() == null) throw new IllegalArgumentException("Укажите сотрудника-получателя");
            call.setRecipient(requiredUser(request.recipientUserId()));
        } else if ("EXTERNAL".equalsIgnoreCase(request.callType())) {
            if (request.clientId() == null) throw new IllegalArgumentException("Укажите внешний контакт");
            call.setClient(clientRepository.findById(request.clientId())
                    .orElseThrow(() -> new IllegalArgumentException("Внешний контакт не найден")));
        } else {
            throw new IllegalArgumentException("Неизвестный тип звонка");
        }
        Call saved = callRepository.save(call);
        return saved;
    }

    @Transactional
    public Call updateStatus(String actorEmail, Long id, CallStatus status) {
        Call call = getById(id);
        ensureAccess(actorEmail, call);
        if (status == CallStatus.RINGING || status == CallStatus.ANSWERED) {
            throw new IllegalArgumentException("Телефония Asterisk ещё не подключена");
        }
        call.setStatus(status);
        if (status == CallStatus.COMPLETED) call.setFinishedAt(LocalDateTime.now());
        return callRepository.save(call);
    }

    private User requiredUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new AccessDeniedException("Пользователь не найден"));
    }

    private User requiredUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Сотрудник не найден"));
    }

    private void ensureAccess(String email, Call call) {
        User user = requiredUser(email);
        if (isArchivedRecord(call) && !isAdministrator(user)) {
            throw new AccessDeniedException("Нет доступа к архивной записи");
        }
        if ((call.getInitiator() == null || !user.getId().equals(call.getInitiator().getId()))
                && (call.getRecipient() == null || !user.getId().equals(call.getRecipient().getId()))
                && !isAdministrator(user)) {
            throw new AccessDeniedException("Нет доступа к звонку");
        }
    }

    private boolean isAdministrator(User user) {
        return user.getRole().name().equals("ADMIN") || user.getRole().name().equals("SUPER_ADMIN");
    }

    private boolean isArchivedRecord(Call call) {
        return call.isLegacyDemo()
                || (call.getInitiator() == null && call.getRecipient() == null && call.getCallType() == null);
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
