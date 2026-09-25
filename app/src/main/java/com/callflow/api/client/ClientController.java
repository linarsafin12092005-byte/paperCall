package com.callflow.api.client;

import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    public List<Client> getAll(Authentication authentication) {
        return clientService.getAll(authentication.getName());
    }

    @GetMapping("/{id}")
    public Client getById(@PathVariable Long id, Authentication authentication) {
        return clientService.getById(authentication.getName(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Client create(@Valid @RequestBody ClientRequest request, Authentication authentication) {
        return clientService.create(authentication.getName(), request);
    }

    @PutMapping("/{id}")
    public Client update(@PathVariable Long id, @Valid @RequestBody ClientRequest request, Authentication authentication) {
        return clientService.update(authentication.getName(), id, request);
    }

    @PatchMapping("/{id}/archive")
    public Client archive(@PathVariable Long id, Authentication authentication) {
        return clientService.archive(authentication.getName(), id);
    }
}
