package com.oms.auth.dto;
public record ChangePasswordRequest(String currentPassword, String newPassword) {}
