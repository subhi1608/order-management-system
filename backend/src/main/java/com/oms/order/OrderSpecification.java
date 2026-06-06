package com.oms.order;

import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class OrderSpecification {

    public static Specification<Order> titleContains(String title) {
        return (root, query, cb) -> {
            if (title == null || title.isBlank()) return null;
            return cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
        };
    }

    public static Specification<Order> ownedBy(String username) {
        return (root, query, cb) ->
                cb.equal(root.get("createdBy").get("username"), username);
    }

    public static Specification<Order> statusIn(List<OrderStatus> statuses) {
        return (root, query, cb) -> root.get("status").in(statuses);
    }
}
