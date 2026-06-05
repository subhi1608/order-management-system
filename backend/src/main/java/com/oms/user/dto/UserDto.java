package com.oms.user.dto;

import com.oms.user.UserRole;

public record UserDto(Long id, String username, UserRole role) {}
