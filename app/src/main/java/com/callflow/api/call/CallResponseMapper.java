package com.callflow.api.call;

public final class CallResponseMapper {
    private CallResponseMapper() {}

    public static CallResponse toResponse(Call call) {
        boolean legacy = call.isLegacyDemo() || (call.getInitiator() == null && call.getRecipient() == null && call.getCallType() == null);
        String status = legacy ? "LEGACY" : call.getStatus().name();
        String recipientNumber = call.getRecipient() != null ? call.getRecipient().getSipExtension()
                : call.getClient() != null ? call.getClient().getPhoneNumber() : null;
        return new CallResponse(
                call.getId(), status, call.getCallType(), call.getTopic(), call.getNote(),
                call.getCreatedAt(), call.getPlannedAt(), legacy,
                call.getInitiator() == null ? null : call.getInitiator().getId(),
                call.getInitiator() == null ? null : call.getInitiator().getFullName(),
                call.getRecipient() == null ? null : call.getRecipient().getId(),
                call.getRecipient() == null ? null : call.getRecipient().getFullName(),
                recipientNumber,
                call.getClient() == null ? null : call.getClient().getId(),
                call.getClient() == null ? null : call.getClient().getFullName(),
                call.getClient() == null ? null : call.getClient().getPhoneNumber(),
                call.getOperator() == null ? null : call.getOperator().getId(),
                call.getOperator() == null ? null : call.getOperator().getFullName(),
                call.getAsteriskLinkedId(), call.getStartedAt(), call.getAnsweredAt(), call.getCompletedAt()
        );
    }
}
