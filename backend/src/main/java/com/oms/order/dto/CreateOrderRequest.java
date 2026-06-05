package com.oms.order.dto;

import java.time.LocalDate;
import java.util.List;

public record CreateOrderRequest(String title, LocalDate expiresAt, List<OrderItemRequest> items) {}
