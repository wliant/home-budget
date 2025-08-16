package sg.wlian.addonapp.entity;

public enum RecurrenceFrequency {
    DAILY("Daily"),
    WEEKLY("Weekly"),
    BIWEEKLY("Bi-weekly"),
    MONTHLY("Monthly"),
    QUARTERLY("Quarterly"),
    SEMI_ANNUALLY("Semi-annually"),
    ANNUALLY("Annually");

    private final String displayName;

    RecurrenceFrequency(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
