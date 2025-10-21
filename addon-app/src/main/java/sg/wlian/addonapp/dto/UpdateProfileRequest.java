package sg.wlian.addonapp.dto;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    @Email(message = "Email should be valid")
    private String email;

    private String firstName;

    private String lastName;
}
