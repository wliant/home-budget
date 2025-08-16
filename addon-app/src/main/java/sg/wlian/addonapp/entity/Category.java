package sg.wlian.addonapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Setter
@Getter
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;

    private String description;
    
    private String color; // For UI display
    
    private String icon; // Icon name for UI
    
    @Column(precision = 10, scale = 2)
    private BigDecimal budgetAmount; // Budget allocated for this category
    
    private Boolean isActive = true;

    @ManyToOne
    @JoinColumn(name = "parent_category_id")
    @JsonIgnoreProperties("childCategories")
    private Category parentCategory;

    @OneToMany(mappedBy = "parentCategory", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("parentCategory")
    private List<Category> childCategories;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"categories", "expenses", "budgets"})
    private User user;

    @OneToMany(mappedBy = "category")
    @JsonIgnoreProperties("category")
    private List<Expense> expenses;
}
