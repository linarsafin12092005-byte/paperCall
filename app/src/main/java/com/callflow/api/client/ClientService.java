package com.callflow.api.client;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public List<Client> getAll() {
        return clientRepository.findByArchivedFalseOrderByFullNameAsc();
    }

    public Client getById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found: " + id));
    }

    public Client create(ClientRequest request) {
        Client client = new Client(request.fullName(), request.phoneNumber());
        client.setEmail(request.email());
        client.setOrganization(request.organization());
        client.setNote(request.note());
        return clientRepository.save(client);
    }

    public Client update(Long id, ClientRequest request) {
        Client client = getById(id);
        client.setFullName(request.fullName());
        client.setPhoneNumber(request.phoneNumber());
        client.setEmail(request.email());
        client.setOrganization(request.organization());
        client.setNote(request.note());
        return clientRepository.save(client);
    }

    public Client archive(Long id) {
        Client client = getById(id);
        client.setArchived(true);
        return clientRepository.save(client);
    }
}
