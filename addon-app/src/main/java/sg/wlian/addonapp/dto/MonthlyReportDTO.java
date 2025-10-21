package sg.wlian.addonapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.YearMonth;

@Getter
@Setter
@AllArgsConstructor
public class MonthlyReportDTO {
    private YearMonth month;
    private BigDecimal totalExpenses;
    private int expenseCount;
}
