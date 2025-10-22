package sg.wlian.addonapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_settings")
@Getter
@Setter
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false)
    private boolean emailNotifications = true;

    @Column(nullable = false)
    private boolean budgetAlerts = true;

    @Column(nullable = false)
    private boolean monthlyReports = true;

    @Column(nullable = false)
    private boolean expenseReminders = false;

    @Column(nullable = false)
    private String currency = "USD";

    @Column(nullable = false)
    private String dateFormat = "MM/DD/YYYY";

    @Column(nullable = false)
    private String theme = "light";

    @Column(nullable = false)
    private String language = "en";
}
