package sg.wlian.addonapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sg.wlian.addonapp.entity.User;
import sg.wlian.addonapp.entity.UserSettings;

import java.util.Optional;

public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {
    Optional<UserSettings> findByUser(User user);
    Optional<UserSettings> findByUserId(Long userId);
}
