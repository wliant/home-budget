package sg.wlian.addonapp.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CategoryTreeDTO {
    private Long id;
    private String name;
    private String description;
    private String color;
    private String icon;
    private BigDecimal budgetAmount;
    private Boolean isActive;
    private List<CategoryTreeDTO> children;
    private BigDecimal totalSpent; // Total spent in this category
    private BigDecimal budgetUsagePercentage; // Percentage of budget used
}
