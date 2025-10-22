package sg.wlian.addonapp.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import sg.wlian.addonapp.dto.AuthResponse;
import sg.wlian.addonapp.dto.LoginRequest;
import sg.wlian.addonapp.dto.RegisterRequest;
import sg.wlian.addonapp.dto.UserDTO;
import sg.wlian.addonapp.entity.User;
import sg.wlian.addonapp.security.JwtTokenProvider;
import sg.wlian.addonapp.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            UserDTO userDTO = userService.registerUser(request);
            User user = userService.findById(userDTO.getId());
            String token = tokenProvider.generateToken(user.getUsername(), user.getId());

            return ResponseEntity.ok(new AuthResponse(token, userDTO));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userService.findByUsername(request.getUsername());
            String token = tokenProvider.generateToken(user.getUsername(), user.getId());
            UserDTO userDTO = UserDTO.fromEntity(user);

            return ResponseEntity.ok(new AuthResponse(token, userDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (tokenProvider.validateToken(token)) {
                    Long userId = tokenProvider.getUserIdFromToken(token);
                    UserDTO userDTO = userService.getUserProfile(userId);
                    return ResponseEntity.ok(userDTO);
                }
            }
            return ResponseEntity.status(401).body("Invalid token");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }
}
