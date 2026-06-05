package com.oms.order.dto;

import jakarta.validation.constraints.NotBlank;

public record CompleteOrderRequest(@NotBlank String txnReference) {}
