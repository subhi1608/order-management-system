package com.oms.order.dto;

import jakarta.validation.constraints.NotBlank;

public record PurchaserActionRequest(@NotBlank String note) {}
