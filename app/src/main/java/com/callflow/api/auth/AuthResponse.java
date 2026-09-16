package com.callflow.api.auth;

import com.callflow.api.user.User;

public class AuthResponse {

    private String token;
    private UserInfo user;

    public AuthResponse(String token, User user) {
        this.token = token;
        this.user = new UserInfo(user);
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserInfo getUser() {
        return user;
    }

    public void setUser(UserInfo user) {
        this.user = user;
    }

    public static class UserInfo {
        private Long id;
        private String fullName;
        private String email;
        private String sipExtension;
        private String sipPassword;
        private String phoneNumber;
        private String role;

        public UserInfo(User user) {
            this.id = user.getId();
            this.fullName = user.getFullName();
            this.email = user.getEmail();
            this.sipExtension = user.getSipExtension();
            this.sipPassword = user.getSipPassword();
            this.phoneNumber = user.getPhoneNumber();
            this.role = user.getRole().name();
        }

        // Getters
        public Long getId() { return id; }
        public String getFullName() { return fullName; }
        public String getEmail() { return email; }
        public String getSipExtension() { return sipExtension; }
        public String getSipPassword() { return sipPassword; }
        public String getPhoneNumber() { return phoneNumber; }
        public String getRole() { return role; }
    }
}
