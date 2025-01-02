package sg.wlian.addonapp.entity;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Embeddable
@Setter
@Getter
public class TimePeriod {

    private LocalDate startDate;
    private LocalDate endDate;
}