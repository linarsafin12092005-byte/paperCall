package com.callflow.api.tenant;

import com.callflow.api.call.Call;
import com.callflow.api.call.CallRepository;
import com.callflow.api.call.CallService;
import com.callflow.api.client.Client;
import com.callflow.api.client.ClientRepository;
import com.callflow.api.client.ClientService;
import com.callflow.api.client.ClientRequest;
import com.callflow.api.event.CallEventProducer;
import com.callflow.api.operator.Operator;
import com.callflow.api.operator.OperatorRepository;
import com.callflow.api.operator.OperatorService;
import com.callflow.api.organization.Organization;
import com.callflow.api.organization.OrganizationMembership;
import com.callflow.api.organization.OrganizationMembershipRepository;
import com.callflow.api.organization.OrganizationRepository;
import com.callflow.api.user.User;
import com.callflow.api.user.UserRepository;
import com.callflow.api.user.UserRole;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
class TenantIsolationIntegrationTest {

    @Container
    static final MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4")
            .withDatabaseName("callflow")
            .withUsername("callflow")
            .withPassword("callflow_test_password");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired private OrganizationRepository organizationRepository;
    @Autowired private OrganizationMembershipRepository membershipRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ClientRepository clientRepository;
    @Autowired private OperatorRepository operatorRepository;
    @Autowired private CallRepository callRepository;
    @Autowired private ClientService clientService;
    @Autowired private CallService callService;
    @Autowired private OperatorService operatorService;

    private static Long organizationA;
    private static Long organizationB;
    private static String userAEmail;

    @BeforeAll
    static void marker() {
        // Container lifecycle is managed by Testcontainers.
    }

    @Test
    void tenantBObjectsAreNotVisibleFromTenantA() {
        Organization a = new Organization("Tenant A", "tenant-a");
        Organization b = new Organization("Tenant B", "tenant-b");
        organizationA = organizationRepository.save(a).getId();
        organizationB = organizationRepository.save(b).getId();

        User userA = new User("Tenant A User", "tenant-a@example.test", "hash");
        userA.setRole(UserRole.ADMIN);
        User userB = new User("Tenant B User", "tenant-b@example.test", "hash");
        userB.setRole(UserRole.ADMIN);
        userA = userRepository.save(userA);
        userB = userRepository.save(userB);
        userAEmail = userA.getEmail();

        membershipRepository.save(new OrganizationMembership(userA, a, "ADMIN", true));
        membershipRepository.save(new OrganizationMembership(userB, b, "ADMIN", true));

        Client clientB = new Client("Tenant B Client", "+79990000001");
        clientB.setOrganizationEntity(b);
        clientB = clientRepository.save(clientB);

        Operator operatorB = new Operator("Tenant B Operator", "operator-b@example.test");
        operatorB.setOrganization(b);
        operatorB = operatorRepository.save(operatorB);

        Call callB = new Call(clientB);
        callB.setOrganization(b);
        callB.setInitiator(userB);
        callB.setCallType("EXTERNAL");
        callB.setPlannedAt(LocalDateTime.now());
        callB = callRepository.save(callB);
        final Long clientBId = clientB.getId();
        final Long callBId = callB.getId();

        assertTrue(clientService.getAll(userAEmail).isEmpty());
        assertThrows(RuntimeException.class, () -> clientService.getById(userAEmail, clientBId));
        assertTrue(operatorService.getAll(userAEmail).isEmpty());
        assertTrue(callService.getAll(userAEmail).isEmpty());
        assertThrows(RuntimeException.class, () -> callService.getByIdForActor(userAEmail, callBId));
    }
}
