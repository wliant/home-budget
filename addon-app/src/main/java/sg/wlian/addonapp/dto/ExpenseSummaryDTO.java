package sg.wlian.addonapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import sg.wlian.addonapp.entity.Category;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSummaryDTO {
    private YearMonth period;
    private BigDecimal totalAmount;
    private int transactionCount;
    private Map<Category, BigDecimal> categoryBreakdown;
}
