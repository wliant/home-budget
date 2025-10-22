package sg.wlian.addonapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sg.wlian.addonapp.dto.UserSettingsDTO;
import sg.wlian.addonapp.entity.User;
import sg.wlian.addonapp.entity.UserSettings;
import sg.wlian.addonapp.repository.UserSettingsRepository;

@Service
public class SettingsService {

    @Autowired
    private UserSettingsRepository settingsRepository;

    @Autowired
    private UserService userService;

    public UserSettingsDTO getUserSettings(Long userId) {
        User user = userService.findById(userId);
        UserSettings settings = settingsRepository.findByUser(user)
            .orElseGet(() -> createDefaultSettings(user));

        return UserSettingsDTO.fromEntity(settings);
    }

    @Transactional
    public UserSettingsDTO updateUserSettings(Long userId, UserSettingsDTO settingsDTO) {
        User user = userService.findById(userId);
        UserSettings settings = settingsRepository.findByUser(user)
            .orElseGet(() -> createDefaultSettings(user));

        settings.setEmailNotifications(settingsDTO.isEmailNotifications());
        settings.setBudgetAlerts(settingsDTO.isBudgetAlerts());
        settings.setMonthlyReports(settingsDTO.isMonthlyReports());
        settings.setExpenseReminders(settingsDTO.isExpenseReminders());
        settings.setCurrency(settingsDTO.getCurrency());
        settings.setDateFormat(settingsDTO.getDateFormat());
        settings.setTheme(settingsDTO.getTheme());
        settings.setLanguage(settingsDTO.getLanguage());

        UserSettings savedSettings = settingsRepository.save(settings);
        return UserSettingsDTO.fromEntity(savedSettings);
    }

    private UserSettings createDefaultSettings(User user) {
        UserSettings settings = new UserSettings();
        settings.setUser(user);
        settings.setEmailNotifications(true);
        settings.setBudgetAlerts(true);
        settings.setMonthlyReports(true);
        settings.setExpenseReminders(false);
        settings.setCurrency("USD");
        settings.setDateFormat("MM/DD/YYYY");
        settings.setTheme("light");
        settings.setLanguage("en");

        return settingsRepository.save(settings);
    }
}
