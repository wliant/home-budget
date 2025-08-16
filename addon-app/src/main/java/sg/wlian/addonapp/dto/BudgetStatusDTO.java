package sg.wlian.addonapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import sg.wlian.addonapp.entity.Budget;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetStatusDTO {
    private Budget budget;
    private BigDecimal totalExpenses;
    private BigDecimal remainingAmount;
    private BigDecimal percentageUsed;
    private boolean isOverBudget;
}
