package com.oms.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record CreateOrderRequest(
    @NotBlank String title,
    @NotNull LocalDate expiresAt,
    @NotEmpty @Valid List<OrderItemRequest> items
) {}
