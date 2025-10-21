package sg.wlian.addonapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class CategoryReportDTO {
    private String categoryName;
    private BigDecimal amount;
    private int expenseCount;
    private double percentage;
}
