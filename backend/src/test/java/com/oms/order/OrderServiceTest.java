package com.oms.order;

import com.oms.order.dto.CreateOrderRequest;
import com.oms.order.dto.OrderItemRequest;
import com.oms.order.dto.OrderResponse;
import com.oms.user.User;
import com.oms.user.UserRepository;
import com.oms.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock UserRepository userRepository;
    @InjectMocks OrderService orderService;

    private User creator;
    private Order draftOrder;

    @BeforeEach
    void setUp() {
        creator = User.builder().id(1L).username("creator1").role(UserRole.CREATOR).build();

        OrderItem item = OrderItem.builder().id(1L).itemName("Pen").quantity(5).build();
        draftOrder = Order.builder()
                .id(10L)
                .title("Test Order")
                .status(OrderStatus.DRAFT)
                .createdBy(creator)
                .expiresAt(LocalDate.now().plusDays(7))
                .build();
        draftOrder.getItems().add(item);
        item.setOrder(draftOrder);
    }

    @Test
    void submitOrder_transitions_draft_to_submitted_when_no_conflicts() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));
        when(orderRepository.findItemNamesInActiveOrders(any(), eq(10L))).thenReturn(List.of());
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse result = orderService.submitOrder(10L, "creator1");

        assertEquals(OrderStatus.SUBMITTED, result.status());
    }

    @Test
    void submitOrder_throws_409_when_items_conflict_with_active_orders() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));
        when(orderRepository.findItemNamesInActiveOrders(any(), eq(10L))).thenReturn(List.of("Pen"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> orderService.submitOrder(10L, "creator1"));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertTrue(ex.getReason().toLowerCase().contains("pen"));
    }

    @Test
    void updateOrder_throws_403_when_user_is_not_owner() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));

        CreateOrderRequest req = new CreateOrderRequest("Updated", LocalDate.now().plusDays(10),
                List.of(new OrderItemRequest("Stapler", 2)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> orderService.updateOrder(10L, req, "other_user"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void updateOrder_throws_400_when_order_is_not_editable() {
        draftOrder.setStatus(OrderStatus.SUBMITTED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));

        CreateOrderRequest req = new CreateOrderRequest("Updated", LocalDate.now().plusDays(10),
                List.of(new OrderItemRequest("Stapler", 2)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> orderService.updateOrder(10L, req, "creator1"));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void approveOrder_transitions_submitted_to_approved() {
        draftOrder.setStatus(OrderStatus.SUBMITTED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse result = orderService.approveOrder(10L);

        assertEquals(OrderStatus.APPROVED, result.status());
    }

    @Test
    void completeOrder_sets_txn_reference_and_transitions_to_completed() {
        draftOrder.setStatus(OrderStatus.APPROVED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse result = orderService.completeOrder(10L, "TXN-001");

        assertEquals(OrderStatus.COMPLETED, result.status());
        assertEquals("TXN-001", result.txnReference());
    }

    @Test
    void returnOrder_sets_note_and_transitions_to_returned() {
        draftOrder.setStatus(OrderStatus.SUBMITTED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse result = orderService.returnOrder(10L, "Please add more items");

        assertEquals(OrderStatus.RETURNED, result.status());
        assertEquals("Please add more items", result.purchaserNote());
    }

    @Test
    void rejectOrder_sets_note_and_transitions_to_rejected() {
        draftOrder.setStatus(OrderStatus.SUBMITTED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse result = orderService.rejectOrder(10L, "Budget exceeded");

        assertEquals(OrderStatus.REJECTED, result.status());
        assertEquals("Budget exceeded", result.purchaserNote());
    }

    @Test
    void approveOrder_throws_400_when_order_not_submitted() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> orderService.approveOrder(10L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }
}
