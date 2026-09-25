package com.callflow.api.client;

import com.callflow.api.organization.Organization;
import com.callflow.api.organization.OrganizationContextService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final OrganizationContextService organizationContextService;

    public ClientService(ClientRepository clientRepository, OrganizationContextService organizationContextService) {
        this.clientRepository = clientRepository;
        this.organizationContextService = organizationContextService;
    }

    public List<Client> getAll(String actorEmail) {
        return clientRepository.findByOrganizationEntity_IdAndArchivedFalseOrderByFullNameAsc(
                organizationContextService.requiredForUser(actorEmail).getId());
    }

    public Client getById(String actorEmail, Long id) {
        return clientRepository.findByIdAndOrganizationEntity_Id(id, organizationContextService.requiredForUser(actorEmail).getId())
                .orElseThrow(() -> new RuntimeException("Client not found: " + id));
    }

    public Client create(String actorEmail, ClientRequest request) {
        Organization organization = organizationContextService.requiredForUser(actorEmail);
        Client client = new Client(request.fullName(), request.phoneNumber());
        client.setOrganizationEntity(organization);
        client.setEmail(request.email());
        client.setOrganization(request.organization());
        client.setNote(request.note());
        return clientRepository.save(client);
    }

    public Client update(String actorEmail, Long id, ClientRequest request) {
        Client client = getById(actorEmail, id);
        client.setFullName(request.fullName());
        client.setPhoneNumber(request.phoneNumber());
        client.setEmail(request.email());
        client.setOrganization(request.organization());
        client.setNote(request.note());
        return clientRepository.save(client);
    }

    public Client archive(String actorEmail, Long id) {
        Client client = getById(actorEmail, id);
        client.setArchived(true);
        return clientRepository.save(client);
    }
}
