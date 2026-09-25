package com.callflow.api.call;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CallRepository extends JpaRepository<Call, Long> {
    java.util.Optional<Call> findByAsteriskLinkedId(String asteriskLinkedId);
    java.util.List<Call> findAllByOrganization_Id(Long organizationId);
    java.util.Optional<Call> findByIdAndOrganization_Id(Long id, Long organizationId);
}
