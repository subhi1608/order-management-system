package com.oms.auth.dto;
public record LoginResponse(String token, String role, String username) {}
