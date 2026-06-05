package com.oms.order;

import com.oms.order.dto.*;
import com.oms.user.User;
import com.oms.user.UserRepository;
import com.oms.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {

    private static final List<OrderStatus> BLOCKING_STATUSES =
            List.of(OrderStatus.SUBMITTED, OrderStatus.APPROVED);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public OrderResponse createOrder(CreateOrderRequest request, String username) {
        User creator = findUser(username);
        Order order = Order.builder()
                .title(request.title())
                .status(OrderStatus.DRAFT)
                .createdBy(creator)
                .expiresAt(request.expiresAt())
                .build();
        request.items().stream()
                .map(i -> OrderItem.builder().order(order).itemName(i.itemName()).quantity(i.quantity()).build())
                .forEach(order.getItems()::add);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse updateOrder(Long orderId, CreateOrderRequest request, String username) {
        Order order = getOwnedEditableOrder(orderId, username);
        order.setTitle(request.title());
        order.setExpiresAt(request.expiresAt());
        order.getItems().clear();
        request.items().stream()
                .map(i -> OrderItem.builder().order(order).itemName(i.itemName()).quantity(i.quantity()).build())
                .forEach(order.getItems()::add);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse submitOrder(Long orderId, String username) {
        Order order = getOwnedEditableOrder(orderId, username);
        checkDuplicateItems(order);
        order.setStatus(OrderStatus.SUBMITTED);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse approveOrder(Long orderId) {
        Order order = getOrderInStatus(orderId, OrderStatus.SUBMITTED);
        order.setStatus(OrderStatus.APPROVED);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse completeOrder(Long orderId, String txnReference) {
        Order order = getOrderInStatus(orderId, OrderStatus.APPROVED);
        order.setTxnReference(txnReference);
        order.setStatus(OrderStatus.COMPLETED);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse returnOrder(Long orderId, String note) {
        Order order = getOrderInStatus(orderId, OrderStatus.SUBMITTED);
        order.setPurchaserNote(note);
        order.setStatus(OrderStatus.RETURNED);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse rejectOrder(Long orderId, String note) {
        Order order = getOrderInStatus(orderId, OrderStatus.SUBMITTED);
        order.setPurchaserNote(note);
        order.setStatus(OrderStatus.REJECTED);
        return toResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForUser(String username, UserRole role) {
        User user = findUser(username);
        List<Order> orders = role == UserRole.CREATOR
                ? orderRepository.findByCreatedBy(user)
                : orderRepository.findByStatusIn(List.of(
                        OrderStatus.SUBMITTED, OrderStatus.APPROVED, OrderStatus.COMPLETED,
                        OrderStatus.REJECTED, OrderStatus.RETURNED));
        return orders.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId, String username, UserRole role) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (role == UserRole.CREATOR && !order.getCreatedBy().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        if (role == UserRole.PURCHASER && order.getStatus() == OrderStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return toResponse(order);
    }

    private void checkDuplicateItems(Order order) {
        List<String> activeItemNames = orderRepository.findItemNamesInActiveOrders(BLOCKING_STATUSES, order.getId());
        Set<String> activeNamesLower = activeItemNames.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
        List<String> conflicts = order.getItems().stream()
                .map(i -> i.getItemName().toLowerCase())
                .filter(activeNamesLower::contains)
                .toList();
        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Items already in active orders: " + String.join(", ", conflicts));
        }
    }

    private Order getOwnedEditableOrder(Long orderId, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getCreatedBy().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this order");
        }
        if (order.getStatus() != OrderStatus.DRAFT && order.getStatus() != OrderStatus.RETURNED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Order cannot be edited in status: " + order.getStatus());
        }
        return order;
    }

    private Order getOrderInStatus(Long orderId, OrderStatus expectedStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (order.getStatus() != expectedStatus) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Order must be in status " + expectedStatus + " but is " + order.getStatus());
        }
        return order;
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private OrderResponse toResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getTitle(),
                order.getStatus(),
                order.getCreatedBy().getUsername(),
                order.getExpiresAt(),
                order.getPurchaserNote(),
                order.getTxnReference(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getItems().stream()
                        .map(i -> new OrderItemResponse(i.getId(), i.getItemName(), i.getQuantity()))
                        .toList()
        );
    }
}
