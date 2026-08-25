package com.callflow.api.dto;

public class CallResponse {

    private Long id;
    private String phone;
    private String operator;
    private String status;

    public CallResponse(
            Long id,
            String phone,
            String operator,
            String status
    ) {
        this.id = id;
        this.phone = phone;
        this.operator = operator;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public String getPhone() {
        return phone;
    }

    public String getOperator() {
        return operator;
    }

    public String getStatus() {
        return status;
    }
}
