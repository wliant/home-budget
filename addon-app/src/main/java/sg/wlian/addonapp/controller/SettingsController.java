package sg.wlian.addonapp.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sg.wlian.addonapp.dto.UserSettingsDTO;
import sg.wlian.addonapp.security.JwtTokenProvider;
import sg.wlian.addonapp.service.SettingsService;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @GetMapping("/me")
    public ResponseEntity<UserSettingsDTO> getUserSettings(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long userId = tokenProvider.getUserIdFromToken(token);
        UserSettingsDTO settings = settingsService.getUserSettings(userId);
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/me")
    public ResponseEntity<UserSettingsDTO> updateUserSettings(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UserSettingsDTO settingsDTO) {
        String token = authHeader.substring(7);
        Long userId = tokenProvider.getUserIdFromToken(token);
        UserSettingsDTO updatedSettings = settingsService.updateUserSettings(userId, settingsDTO);
        return ResponseEntity.ok(updatedSettings);
    }
}
