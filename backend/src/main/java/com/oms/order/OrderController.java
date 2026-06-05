package com.oms.order;

import com.oms.order.dto.*;
import com.oms.user.UserRole;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> listOrders(Authentication auth) {
        return ResponseEntity.ok(orderService.getOrdersForUser(auth.getName(), getRole(auth)));
    }

    @PostMapping
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<OrderResponse> createOrder(@RequestBody @Valid CreateOrderRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request, auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(orderService.getOrder(id, auth.getName(), getRole(auth)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<OrderResponse> updateOrder(@PathVariable Long id,
                                                     @RequestBody @Valid CreateOrderRequest request,
                                                     Authentication auth) {
        return ResponseEntity.ok(orderService.updateOrder(id, request, auth.getName()));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<OrderResponse> submitOrder(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(orderService.submitOrder(id, auth.getName()));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('PURCHASER')")
    public ResponseEntity<OrderResponse> approveOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.approveOrder(id));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('PURCHASER')")
    public ResponseEntity<OrderResponse> completeOrder(@PathVariable Long id,
                                                       @RequestBody @Valid CompleteOrderRequest request) {
        return ResponseEntity.ok(orderService.completeOrder(id, request.txnReference()));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasRole('PURCHASER')")
    public ResponseEntity<OrderResponse> returnOrder(@PathVariable Long id,
                                                     @RequestBody @Valid PurchaserActionRequest request) {
        return ResponseEntity.ok(orderService.returnOrder(id, request.note()));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('PURCHASER')")
    public ResponseEntity<OrderResponse> rejectOrder(@PathVariable Long id,
                                                     @RequestBody @Valid PurchaserActionRequest request) {
        return ResponseEntity.ok(orderService.rejectOrder(id, request.note()));
    }

    private UserRole getRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PURCHASER"))
                ? UserRole.PURCHASER : UserRole.CREATOR;
    }
}
