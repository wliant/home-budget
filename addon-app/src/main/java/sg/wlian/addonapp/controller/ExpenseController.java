package sg.wlian.addonapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sg.wlian.addonapp.dto.ExpenseSummaryDTO;
import sg.wlian.addonapp.entity.Expense;
import sg.wlian.addonapp.service.ExpenseService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Expense>> getUserExpenses(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getExpensesByUser(userId));
    }

    @GetMapping("/user/{userId}/month/{year}/{month}")
    public ResponseEntity<List<Expense>> getMonthlyExpenses(
            @PathVariable Long userId,
            @PathVariable int year,
            @PathVariable int month) {
        return ResponseEntity.ok(expenseService.getMonthlyExpenses(userId, year, month));
    }

    @GetMapping("/user/{userId}/summary/month/{year}/{month}")
    public ResponseEntity<ExpenseSummaryDTO> getMonthlySummary(
            @PathVariable Long userId,
            @PathVariable int year,
            @PathVariable int month) {
        return ResponseEntity.ok(expenseService.getMonthlySummary(userId, year, month));
    }

    @GetMapping("/user/{userId}/category/{categoryId}")
    public ResponseEntity<List<Expense>> getExpensesByCategory(
            @PathVariable Long userId,
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(expenseService.getExpensesByCategory(userId, categoryId));
    }

    @GetMapping("/user/{userId}/daterange")
    public ResponseEntity<List<Expense>> getExpensesByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(expenseService.getExpensesByDateRange(userId, startDate, endDate));
    }
    
    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.createExpense(expense));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.updateExpense(id, expense));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/recurring/process")
    public ResponseEntity<Void> processRecurringExpenses() {
        expenseService.processRecurringExpenses();
        return ResponseEntity.ok().build();
    }
}
