package com.oms.order;

import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class OrderSpecification {

    private OrderSpecification() {}

    public static Specification<Order> titleContains(String title) {
        return (root, query, cb) -> {
            if (title == null || title.isBlank()) return null;
            String escaped = title.replace("\\", "\\\\")
                                  .replace("%", "\\%")
                                  .replace("_", "\\_")
                                  .toLowerCase();
            return cb.like(cb.lower(root.get("title")), "%" + escaped + "%", '\\');
        };
    }

    public static Specification<Order> ownedBy(String username) {
        return (root, query, cb) -> {
            if (username == null) return null;
            return cb.equal(root.get("createdBy").get("username"), username);
        };
    }

    public static Specification<Order> statusIn(List<OrderStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return null;
            return root.get("status").in(statuses);
        };
    }
}
