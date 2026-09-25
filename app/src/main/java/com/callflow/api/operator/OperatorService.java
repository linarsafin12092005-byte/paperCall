package com.callflow.api.operator;

import com.callflow.api.organization.Organization;
import com.callflow.api.organization.OrganizationContextService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OperatorService {

    private static final String STATUS_KEY_PREFIX = "operator:status:";

    private final OperatorRepository operatorRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final OrganizationContextService organizationContextService;

    public OperatorService(OperatorRepository operatorRepository,
                            RedisTemplate<String, String> redisTemplate,
                            OrganizationContextService organizationContextService) {
        this.operatorRepository = operatorRepository;
        this.redisTemplate = redisTemplate;
        this.organizationContextService = organizationContextService;
    }

    public List<Operator> getAll(String actorEmail) {
        return operatorRepository.findAllByOrganization_Id(organizationContextService.requiredForUser(actorEmail).getId());
    }

    public Operator getById(String actorEmail, Long id) {
        return operatorRepository.findByIdAndOrganization_Id(id, organizationContextService.requiredForUser(actorEmail).getId())
                .orElseThrow(() -> new RuntimeException("Operator not found: " + id));
    }

    public Operator create(String actorEmail, Operator operator) {
        Organization organization = organizationContextService.requiredForUser(actorEmail);
        operator.setOrganization(organization);
        Operator saved = operatorRepository.save(operator);
        redisTemplate.opsForValue().set(STATUS_KEY_PREFIX + saved.getId(), saved.getStatus().name());
        return saved;
    }

    public Operator updateStatus(String actorEmail, Long id, OperatorStatus newStatus) {
        Operator operator = getById(actorEmail, id);
        operator.setStatus(newStatus);
        Operator saved = operatorRepository.save(operator);
        redisTemplate.opsForValue().set(STATUS_KEY_PREFIX + saved.getId(), saved.getStatus().name());
        return saved;
    }

    public String getCachedStatus(String actorEmail, Long id) {
        String cached = redisTemplate.opsForValue().get(STATUS_KEY_PREFIX + id);
        if (cached != null) {
            return cached;
        }
        return getById(actorEmail, id).getStatus().name();
    }
}
