package sg.wlian.addonapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Setter
@Getter
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"expenses", "childCategories", "parentCategory", "user"})
    private Category category;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"categories", "expenses", "budgets"})
    private User user;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String notes;

    @Column(nullable = false)
    private boolean isRecurring = false;

    @Enumerated(EnumType.STRING)
    private RecurrenceFrequency recurrenceFrequency;

    private LocalDate recurrenceEndDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
