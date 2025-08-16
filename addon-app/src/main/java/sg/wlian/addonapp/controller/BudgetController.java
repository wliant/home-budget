package sg.wlian.addonapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sg.wlian.addonapp.dto.BudgetStatusDTO;
import sg.wlian.addonapp.entity.Budget;
import sg.wlian.addonapp.entity.User;
import sg.wlian.addonapp.repository.UserRepository;
import sg.wlian.addonapp.service.BudgetService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget) {
        try {
            Budget createdBudget = budgetService.createBudget(budget);
            return new ResponseEntity<>(createdBudget, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @RequestBody Budget budget) {
        try {
            Budget updatedBudget = budgetService.updateBudget(id, budget);
            return new ResponseEntity<>(updatedBudget, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteBudget(@PathVariable Long id) {
        try {
            budgetService.deleteBudget(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Budget>> getBudgetsByUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<Budget> budgets = budgetService.getBudgetsByUser(user);
        return new ResponseEntity<>(budgets, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<List<Budget>> getActiveBudgetsByUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<Budget> budgets = budgetService.getActiveBudgetsByUser(user);
        return new ResponseEntity<>(budgets, HttpStatus.OK);
    }

    @GetMapping("/{budgetId}/status")
    public ResponseEntity<BudgetStatusDTO> getBudgetStatus(@PathVariable Long budgetId) {
        try {
            Budget budget = userRepository.findById(budgetId)
                    .map(user -> budgetService.getBudgetsByUser(user))
                    .orElseThrow(() -> new RuntimeException("Budget not found"))
                    .stream()
                    .filter(b -> b.getId().equals(budgetId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Budget not found"));
            
            BudgetStatusDTO status = budgetService.getBudgetStatus(budget);
            return new ResponseEntity<>(status, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/user/{userId}/status")
    public ResponseEntity<List<BudgetStatusDTO>> getAllBudgetStatuses(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<BudgetStatusDTO> statuses = budgetService.getAllBudgetStatuses(user);
        return new ResponseEntity<>(statuses, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}/date/{date}")
    public ResponseEntity<List<Budget>> getBudgetsForDate(
            @PathVariable Long userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<Budget> budgets = budgetService.getBudgetsForDate(user, date);
        return new ResponseEntity<>(budgets, HttpStatus.OK);
    }

    @PostMapping("/user/{userId}/check-alerts")
    public ResponseEntity<HttpStatus> checkBudgetAlerts(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        budgetService.checkBudgetAlerts(user);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
