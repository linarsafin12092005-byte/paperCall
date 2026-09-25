package com.callflow.api.ami;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AmiEventRecordRepository extends JpaRepository<AmiEventRecord, Long> {
    boolean existsByDeduplicationKey(String deduplicationKey);
}
