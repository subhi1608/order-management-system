package com.oms.order;

import com.oms.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    List<Order> findByCreatedBy(User user);

    List<Order> findByStatusIn(List<OrderStatus> statuses);

    @Query("SELECT DISTINCT oi.itemName FROM OrderItem oi " +
           "WHERE oi.order.status IN :statuses AND oi.order.id != :excludeOrderId")
    List<String> findItemNamesInActiveOrders(
            @Param("statuses") List<OrderStatus> statuses,
            @Param("excludeOrderId") Long excludeOrderId);
}
