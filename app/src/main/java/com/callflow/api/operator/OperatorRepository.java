package com.callflow.api.operator;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OperatorRepository extends JpaRepository<Operator, Long> {
    java.util.List<Operator> findAllByOrganization_Id(Long organizationId);
    java.util.Optional<Operator> findByIdAndOrganization_Id(Long id, Long organizationId);
}
