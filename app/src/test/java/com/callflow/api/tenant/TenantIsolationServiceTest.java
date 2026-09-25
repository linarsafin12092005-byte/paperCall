package com.callflow.api.tenant;

import com.callflow.api.call.Call;
import com.callflow.api.call.CallRepository;
import com.callflow.api.call.CallService;
import com.callflow.api.call.CallStatus;
import com.callflow.api.call.CallRequest;
import com.callflow.api.client.Client;
import com.callflow.api.client.ClientRepository;
import com.callflow.api.client.ClientRequest;
import com.callflow.api.client.ClientService;
import com.callflow.api.event.CallEventProducer;
import com.callflow.api.operator.OperatorRepository;
import com.callflow.api.organization.Organization;
import com.callflow.api.organization.OrganizationContextService;
import com.callflow.api.organization.OrganizationMembershipRepository;
import com.callflow.api.user.User;
import com.callflow.api.user.UserRepository;
import com.callflow.api.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.redis.core.RedisTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantIsolationServiceTest {

    @Mock private OrganizationContextService organizationContextService;
    @Mock private Organization organization;
    @Mock private ClientRepository clientRepository;
    @Mock private CallRepository callRepository;
    @Mock private OperatorRepository operatorRepository;
    @Mock private CallEventProducer callEventProducer;
    @Mock private UserRepository userRepository;
    @Mock private OrganizationMembershipRepository membershipRepository;
    @Mock private RedisTemplate<String, String> redisTemplate;

    private final Long organizationId = 10L;
    private User actor;

    @BeforeEach
    void setUp() {
        actor = new User("Actor", "actor@example.com", "hash");
        actor.setRole(UserRole.ADMIN);
        when(organization.getId()).thenReturn(organizationId);
        when(organizationContextService.requiredForUser("actor@example.com")).thenReturn(organization);
    }

    @Test
    void clientsAreQueriedOnlyForCurrentOrganization() {
        ClientService service = new ClientService(clientRepository, organizationContextService);
        when(clientRepository.findByOrganizationEntity_IdAndArchivedFalseOrderByFullNameAsc(organizationId))
                .thenReturn(List.of());

        assertTrue(service.getAll("actor@example.com").isEmpty());
        verify(clientRepository).findByOrganizationEntity_IdAndArchivedFalseOrderByFullNameAsc(organizationId);
        verify(clientRepository, never()).findAll();
    }

    @Test
    void foreignClientCannotBeReadOrUpdated() {
        ClientService service = new ClientService(clientRepository, organizationContextService);
        when(clientRepository.findByIdAndOrganizationEntity_Id(99L, organizationId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.getById("actor@example.com", 99L));
        assertThrows(RuntimeException.class, () -> service.update(
                "actor@example.com", 99L,
                new ClientRequest("Other", "+79990000000", null, null, null)));
        verify(clientRepository, never()).save(any());
    }

    @Test
    void callsAreQueriedOnlyForCurrentOrganization() {
        CallService service = new CallService(
                callRepository, clientRepository, operatorRepository, callEventProducer,
                userRepository, organizationContextService, membershipRepository);
        when(userRepository.findByEmail("actor@example.com")).thenReturn(Optional.of(actor));
        when(callRepository.findAllByOrganization_Id(organizationId)).thenReturn(List.of());

        assertTrue(service.getAll("actor@example.com").isEmpty());
        verify(callRepository).findAllByOrganization_Id(organizationId);
        verify(callRepository, never()).findAll();
    }

    @Test
    void foreignCallCannotBeUpdated() {
        CallService service = new CallService(
                callRepository, clientRepository, operatorRepository, callEventProducer,
                userRepository, organizationContextService, membershipRepository);
        when(callRepository.findByIdAndOrganization_Id(99L, organizationId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.updateStatus("actor@example.com", 99L, CallStatus.COMPLETED));
        verify(callRepository, never()).save(any());
    }

    @Test
    void callCreationUsesCurrentOrganizationForClientLookup() {
        CallService service = new CallService(
                callRepository, clientRepository, operatorRepository, callEventProducer,
                userRepository, organizationContextService, membershipRepository);
        when(userRepository.findByEmail("actor@example.com")).thenReturn(Optional.of(actor));
        when(clientRepository.findByIdAndOrganizationEntity_Id(7L, organizationId)).thenReturn(Optional.empty());

        CallRequest request = new CallRequest(
                "EXTERNAL", null, 7L, LocalDateTime.now(), "topic", "note");

        assertThrows(IllegalArgumentException.class,
                () -> service.create("actor@example.com", request));
        verify(clientRepository).findByIdAndOrganizationEntity_Id(7L, organizationId);
        verify(callRepository, never()).save(any());
    }
}
