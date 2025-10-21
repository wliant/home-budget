package sg.wlian.addonapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sg.wlian.addonapp.entity.UserSettings;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsDTO {
    private boolean emailNotifications;
    private boolean budgetAlerts;
    private boolean monthlyReports;
    private boolean expenseReminders;
    private String currency;
    private String dateFormat;
    private String theme;
    private String language;

    public static UserSettingsDTO fromEntity(UserSettings settings) {
        return new UserSettingsDTO(
            settings.isEmailNotifications(),
            settings.isBudgetAlerts(),
            settings.isMonthlyReports(),
            settings.isExpenseReminders(),
            settings.getCurrency(),
            settings.getDateFormat(),
            settings.getTheme(),
            settings.getLanguage()
        );
    }
}
