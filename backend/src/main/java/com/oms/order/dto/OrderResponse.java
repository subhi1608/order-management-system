package com.oms.order.dto;

import com.oms.order.OrderStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String title,
        OrderStatus status,
        String createdBy,
        LocalDate expiresAt,
        String purchaserNote,
        String txnReference,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<OrderItemResponse> items
) {}
