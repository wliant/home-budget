package sg.wlian.addonapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sg.wlian.addonapp.dto.ExpenseSummaryDTO;
import sg.wlian.addonapp.entity.Category;
import sg.wlian.addonapp.entity.Expense;
import sg.wlian.addonapp.entity.User;
import sg.wlian.addonapp.repository.ExpenseRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    public Expense createExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    public Expense updateExpense(Long id, Expense expenseDetails) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
        
        expense.setDescription(expenseDetails.getDescription());
        expense.setAmount(expenseDetails.getAmount());
        expense.setDate(expenseDetails.getDate());
        expense.setCategory(expenseDetails.getCategory());
        expense.setPaymentMethod(expenseDetails.getPaymentMethod());
        expense.setNotes(expenseDetails.getNotes());
        expense.setRecurring(expenseDetails.isRecurring());
        expense.setRecurrenceFrequency(expenseDetails.getRecurrenceFrequency());
        expense.setRecurrenceEndDate(expenseDetails.getRecurrenceEndDate());
        
        return expenseRepository.save(expense);
    }

    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }

    public List<Expense> getExpensesByUser(Long userId) {
        return expenseRepository.findByUserId(userId);
    }
    
    public List<Expense> getExpensesByUser(User user) {
        return expenseRepository.findByUser(user);
    }
    
    public List<Expense> getMonthlyExpenses(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        return expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }
    
    public ExpenseSummaryDTO getMonthlySummary(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        BigDecimal total = expenses.stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<Category, BigDecimal> categoryBreakdown = expenses.stream()
            .filter(e -> e.getCategory() != null)
            .collect(Collectors.groupingBy(
                Expense::getCategory,
                Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
            ));
        
        return new ExpenseSummaryDTO(yearMonth, total, expenses.size(), categoryBreakdown);
    }
    
    public List<Expense> getExpensesByCategory(Long userId, Long categoryId) {
        return expenseRepository.findByUserIdAndCategoryId(userId, categoryId);
    }
    
    public List<Expense> getExpensesByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    public List<Expense> getExpensesByUserAndDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserAndDateBetween(user, startDate, endDate);
    }

    public List<Expense> getExpensesByUserAndCategory(User user, Category category) {
        return expenseRepository.findByUserAndCategory(user, category);
    }

    public BigDecimal getTotalExpenses(User user, LocalDate startDate, LocalDate endDate) {
        BigDecimal total = expenseRepository.getTotalExpensesByUserAndDateRange(user, startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    public Map<Category, BigDecimal> getExpensesByCategory(User user, LocalDate startDate, LocalDate endDate) {
        List<Expense> expenses = expenseRepository.findByUserAndDateBetween(user, startDate, endDate);
        
        return expenses.stream()
                .filter(e -> e.getCategory() != null)
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));
    }

    public ExpenseSummaryDTO getMonthlyExpenseSummary(User user, YearMonth yearMonth) {
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        List<Expense> expenses = expenseRepository.findByUserAndDateBetween(user, startDate, endDate);
        BigDecimal total = getTotalExpenses(user, startDate, endDate);
        Map<Category, BigDecimal> categoryBreakdown = getExpensesByCategory(user, startDate, endDate);
        
        return new ExpenseSummaryDTO(yearMonth, total, expenses.size(), categoryBreakdown);
    }

    public List<Expense> getRecurringExpenses(User user) {
        return expenseRepository.findByUserAndIsRecurringTrue(user);
    }

    public void processRecurringExpenses() {
        List<Expense> allRecurringExpenses = expenseRepository.findByIsRecurringTrue();
        LocalDate today = LocalDate.now();

        for (Expense recurring : allRecurringExpenses) {
            processRecurringExpense(recurring, today);
        }
    }

    public void processRecurringExpenses(User user) {
        List<Expense> recurringExpenses = getRecurringExpenses(user);
        LocalDate today = LocalDate.now();

        for (Expense recurring : recurringExpenses) {
            processRecurringExpense(recurring, today);
        }
    }

    private void processRecurringExpense(Expense recurring, LocalDate today) {
        // Check if recurrence has ended
        if (recurring.getRecurrenceEndDate() != null && today.isAfter(recurring.getRecurrenceEndDate())) {
            return;
        }

        // Determine the next occurrence date
        LocalDate nextOccurrence = calculateNextOccurrence(recurring, today);

        // Check if we should create a new expense
        if (nextOccurrence != null && !nextOccurrence.isAfter(today)) {
            createRecurringExpenseInstance(recurring, nextOccurrence);

            // Update last recurrence date
            recurring.setLastRecurrenceDate(nextOccurrence);
            expenseRepository.save(recurring);
        }
    }

    private LocalDate calculateNextOccurrence(Expense recurring, LocalDate today) {
        LocalDate baseDate = recurring.getLastRecurrenceDate() != null
            ? recurring.getLastRecurrenceDate()
            : recurring.getDate();

        if (baseDate == null) {
            return null;
        }

        LocalDate nextOccurrence = null;

        switch (recurring.getRecurrenceFrequency()) {
            case DAILY:
                nextOccurrence = baseDate.plusDays(1);
                break;
            case WEEKLY:
                nextOccurrence = baseDate.plusWeeks(1);
                break;
            case BIWEEKLY:
                nextOccurrence = baseDate.plusWeeks(2);
                break;
            case MONTHLY:
                nextOccurrence = baseDate.plusMonths(1);
                break;
            case QUARTERLY:
                nextOccurrence = baseDate.plusMonths(3);
                break;
            case SEMI_ANNUALLY:
                nextOccurrence = baseDate.plusMonths(6);
                break;
            case ANNUALLY:
                nextOccurrence = baseDate.plusYears(1);
                break;
        }

        return nextOccurrence;
    }

    private void createRecurringExpenseInstance(Expense recurring, LocalDate occurrenceDate) {
        Expense newExpense = new Expense();
        newExpense.setDescription(recurring.getDescription());
        newExpense.setAmount(recurring.getAmount());
        newExpense.setDate(occurrenceDate);
        newExpense.setCategory(recurring.getCategory());
        newExpense.setUser(recurring.getUser());
        newExpense.setPaymentMethod(recurring.getPaymentMethod());
        newExpense.setNotes(recurring.getNotes() + " (Auto-generated from recurring expense)");
        newExpense.setRecurring(false); // The instance itself is not recurring

        expenseRepository.save(newExpense);
    }
}
