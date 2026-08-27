package com.callflow.api.call;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CallRepository extends JpaRepository<Call, Long> {
}
