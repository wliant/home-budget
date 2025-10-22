package sg.wlian.addonapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import sg.wlian.addonapp.entity.PaymentMethod;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class PaymentMethodReportDTO {
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private int expenseCount;
    private double percentage;
}
