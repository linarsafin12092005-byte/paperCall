package com.callflow.api.client;

import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    public List<Client> getAll() {
        return clientService.getAll();
    }

    @GetMapping("/{id}")
    public Client getById(@PathVariable Long id) {
        return clientService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Client create(@Valid @RequestBody ClientRequest request) {
        return clientService.create(request);
    }

    @PutMapping("/{id}")
    public Client update(@PathVariable Long id, @Valid @RequestBody ClientRequest request) {
        return clientService.update(id, request);
    }

    @PatchMapping("/{id}/archive")
    public Client archive(@PathVariable Long id) {
        return clientService.archive(id);
    }
}
