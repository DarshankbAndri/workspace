package com.example.cmmsApplication.service;

import com.example.cmmsApplication.dto.PageProperties;
import com.example.cmmsApplication.dto.PagePropertiesDTO;
import com.example.cmmsApplication.dto.SearchCriteriaDTO;
import com.example.cmmsApplication.dto.SearchDTO;
import com.example.cmmsApplication.enums.SearchOperation;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class SearchServiceImp implements SearchService {
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 100;

    @Override
    public <T> PageProperties getFilteredResults(SearchDTO searchDTO, JpaSpecificationExecutor<T> repository, Class<T> entityClass) {
        PagePropertiesDTO pagination = searchDTO == null ? null : searchDTO.getPagination();
        int pageNumber = Math.max(0, pagination == null || pagination.getPageNumber() == null ? 0 : pagination.getPageNumber());
        int pageSize = pagination == null || pagination.getRecordsPerPage() == null || pagination.getRecordsPerPage() <= 0
                ? DEFAULT_PAGE_SIZE
                : Math.min(pagination.getRecordsPerPage(), MAX_PAGE_SIZE);

        Pageable pageable = PageRequest.of(pageNumber, pageSize, resolveSort(pagination, entityClass));
        Page<T> page = repository.findAll(buildSpecification(searchDTO, entityClass), pageable);
        return new PageProperties(page.getContent(), page.getTotalElements(), page.getNumber(), page.getSize(), page.getTotalPages());
    }

    private <T> Specification<T> buildSpecification(SearchDTO searchDTO, Class<T> entityClass) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            List<SearchCriteriaDTO> criteriaList = searchDTO == null ? null : searchDTO.getSearchCriteriaList();
            if (criteriaList == null || criteriaList.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            for (SearchCriteriaDTO criteria : criteriaList) {
                if (criteria == null || isBlank(criteria.getFilterKey()) || isEmptyValue(criteria.getValue())) {
                    continue;
                }
                if ("commonSearch".equals(criteria.getFilterKey())) {
                    Predicate commonSearch = buildCommonSearchPredicate(entityClass, root, criteria, criteriaBuilder);
                    if (commonSearch != null) {
                        predicates.add(commonSearch);
                    }
                    continue;
                }
                predicates.add(toPredicate(root.get(criteria.getFilterKey()), criteria.getValue(), criteria.getOperation(), criteriaBuilder));
            }

            if (predicates.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return "any".equalsIgnoreCase(searchDTO == null ? null : searchDTO.getDataOption())
                    ? criteriaBuilder.or(predicates.toArray(new Predicate[0]))
                    : criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private <T> Predicate buildCommonSearchPredicate(Class<T> entityClass,
                                                    Path<T> root,
                                                    SearchCriteriaDTO criteria,
                                                    jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder) {
        List<Predicate> predicates = Arrays.stream(entityClass.getDeclaredFields())
                .filter((field) -> String.class.equals(field.getType()))
                .map((field) -> criteriaBuilder.like(
                        criteriaBuilder.lower(root.get(field.getName()).as(String.class)),
                        "%" + criteria.getValue().toString().trim().toLowerCase(Locale.ROOT) + "%"
                ))
                .collect(Collectors.toList());
        return predicates.isEmpty() ? null : criteriaBuilder.or(predicates.toArray(new Predicate[0]));
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    private Predicate toPredicate(Path<?> fieldPath,
                                  Object value,
                                  String operationValue,
                                  jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder) {
        SearchOperation operation = SearchOperation.fromValue(operationValue);
        Class<?> javaType = fieldPath.getJavaType();

        if (SearchOperation.IN.equals(operation)) {
            jakarta.persistence.criteria.CriteriaBuilder.In<Object> inClause = criteriaBuilder.in(fieldPath);
            for (Object item : toValueList(value)) {
                if (!isEmptyValue(item)) {
                    inClause.value(convertValue(item, javaType));
                }
            }
            return inClause;
        }

        if (SearchOperation.BETWEEN.equals(operation)) {
            List<Object> values = toValueList(value);
            if (values.size() < 2) {
                return criteriaBuilder.conjunction();
            }
            Expression<? extends Comparable> expression = fieldPath.as((Class<? extends Comparable>) javaType);
            return criteriaBuilder.between(expression, (Comparable) convertValue(values.get(0), javaType), (Comparable) convertValue(values.get(1), javaType));
        }

        Object convertedValue = convertValue(value, javaType);
        if (SearchOperation.CONTAINS.equals(operation)) {
            return criteriaBuilder.like(
                    criteriaBuilder.lower(fieldPath.as(String.class)),
                    "%" + convertedValue.toString().toLowerCase(Locale.ROOT) + "%"
            );
        }
        if (SearchOperation.EQUAL.equals(operation)) {
            if (String.class.equals(javaType)) {
                return criteriaBuilder.equal(criteriaBuilder.lower(fieldPath.as(String.class)), convertedValue.toString().toLowerCase(Locale.ROOT));
            }
            return criteriaBuilder.equal(fieldPath, convertedValue);
        }
        if (SearchOperation.NOT_EQUAL.equals(operation)) {
            if (String.class.equals(javaType)) {
                return criteriaBuilder.notEqual(criteriaBuilder.lower(fieldPath.as(String.class)), convertedValue.toString().toLowerCase(Locale.ROOT));
            }
            return criteriaBuilder.notEqual(fieldPath, convertedValue);
        }

        Expression<? extends Comparable> comparableExpression = fieldPath.as((Class<? extends Comparable>) javaType);
        Comparable comparableValue = (Comparable) convertedValue;
        if (SearchOperation.GREATER_THAN.equals(operation)) {
            return criteriaBuilder.greaterThan(comparableExpression, comparableValue);
        }
        if (SearchOperation.LESS_THAN.equals(operation)) {
            return criteriaBuilder.lessThan(comparableExpression, comparableValue);
        }
        if (SearchOperation.GREATER_THAN_EQUAL.equals(operation)) {
            return criteriaBuilder.greaterThanOrEqualTo(comparableExpression, comparableValue);
        }
        if (SearchOperation.LESS_THAN_EQUAL.equals(operation)) {
            return criteriaBuilder.lessThanOrEqualTo(comparableExpression, comparableValue);
        }
        return criteriaBuilder.conjunction();
    }

    private <T> Sort resolveSort(PagePropertiesDTO pagination, Class<T> entityClass) {
        if (pagination == null || isBlank(pagination.getSortBy()) || findField(entityClass, pagination.getSortBy()) == null) {
            return findField(entityClass, "createdAt") == null ? Sort.by(Sort.Direction.DESC, "id") : Sort.by(Sort.Direction.DESC, "createdAt");
        }
        Sort.Direction direction = "ASC".equalsIgnoreCase(pagination.getSortMode()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, pagination.getSortBy());
    }

    private Field findField(Class<?> entityClass, String fieldName) {
        try {
            return entityClass.getDeclaredField(fieldName);
        } catch (NoSuchFieldException ex) {
            return null;
        }
    }

    private Object convertValue(Object value, Class<?> javaType) {
        String stringValue = value == null ? null : value.toString().trim();
        if (String.class.equals(javaType)) {
            return stringValue;
        }
        if (Long.class.equals(javaType)) {
            return Long.valueOf(stringValue);
        }
        if (Integer.class.equals(javaType)) {
            return Integer.valueOf(stringValue);
        }
        if (BigDecimal.class.equals(javaType)) {
            return new BigDecimal(stringValue);
        }
        if (Boolean.class.equals(javaType)) {
            return Boolean.valueOf(stringValue);
        }
        if (LocalDate.class.equals(javaType)) {
            return LocalDate.parse(stringValue);
        }
        if (LocalDateTime.class.equals(javaType)) {
            return LocalDateTime.parse(stringValue);
        }
        return value;
    }

    private List<Object> toValueList(Object value) {
        if (value instanceof Collection<?>) {
            return new ArrayList<>((Collection<?>) value);
        }
        return Arrays.stream(value.toString().split(","))
                .map(String::trim)
                .collect(Collectors.toList());
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private boolean isEmptyValue(Object value) {
        if (value == null) {
            return true;
        }
        if (value instanceof String) {
            return ((String) value).trim().isEmpty();
        }
        if (value instanceof Collection<?>) {
            return ((Collection<?>) value).isEmpty();
        }
        return false;
    }
}
