package sg.wlian.addonapp.entity;

public enum PaymentMethod {
    CASH("Cash"),
    CREDIT_CARD("Credit Card"),
    DEBIT_CARD("Debit Card"),
    BANK_TRANSFER("Bank Transfer"),
    DIGITAL_WALLET("Digital Wallet"),
    CHECK("Check"),
    OTHER("Other");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
