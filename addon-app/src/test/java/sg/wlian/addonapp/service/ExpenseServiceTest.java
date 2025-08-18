package sg.wlian.addonapp.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import sg.wlian.addonapp.dto.ExpenseSummaryDTO;
import sg.wlian.addonapp.entity.Category;
import sg.wlian.addonapp.entity.Expense;
import sg.wlian.addonapp.entity.PaymentMethod;
import sg.wlian.addonapp.entity.RecurrenceFrequency;
import sg.wlian.addonapp.entity.User;
import sg.wlian.addonapp.repository.ExpenseRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private ExpenseService expenseService;

    private User testUser;
    private Category testCategory;
    private Expense testExpense;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Food");
        testCategory.setUser(testUser);

        testExpense = new Expense();
        testExpense.setId(1L);
        testExpense.setDescription("Grocery shopping");
        testExpense.setAmount(new BigDecimal("50.00"));
        testExpense.setDate(LocalDate.now());
        testExpense.setUser(testUser);
        testExpense.setCategory(testCategory);
        testExpense.setPaymentMethod(PaymentMethod.CREDIT_CARD);
        testExpense.setRecurring(false);
    }

    @Test
    void testCreateExpense() {
        when(expenseRepository.save(any(Expense.class))).thenReturn(testExpense);

        Expense created = expenseService.createExpense(testExpense);

        assertNotNull(created);
        assertEquals(testExpense.getDescription(), created.getDescription());
        assertEquals(testExpense.getAmount(), created.getAmount());
        verify(expenseRepository, times(1)).save(testExpense);
    }

    @Test
    void testUpdateExpense() {
        Long expenseId = 1L;
        Expense updatedDetails = new Expense();
        updatedDetails.setDescription("Updated grocery shopping");
        updatedDetails.setAmount(new BigDecimal("75.00"));
        updatedDetails.setDate(LocalDate.now());
        updatedDetails.setCategory(testCategory);
        updatedDetails.setPaymentMethod(PaymentMethod.CASH);
        updatedDetails.setNotes("Weekly shopping");
        updatedDetails.setRecurring(true);
        updatedDetails.setRecurrenceFrequency(RecurrenceFrequency.WEEKLY);
        updatedDetails.setRecurrenceEndDate(LocalDate.now().plusMonths(3));

        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(expenseRepository.save(any(Expense.class))).thenReturn(testExpense);

        Expense updated = expenseService.updateExpense(expenseId, updatedDetails);

        assertNotNull(updated);
        assertEquals(updatedDetails.getDescription(), testExpense.getDescription());
        assertEquals(updatedDetails.getAmount(), testExpense.getAmount());
        assertEquals(updatedDetails.getPaymentMethod(), testExpense.getPaymentMethod());
        assertTrue(testExpense.isRecurring());
        verify(expenseRepository, times(1)).findById(expenseId);
        verify(expenseRepository, times(1)).save(testExpense);
    }

    @Test
    void testUpdateExpenseNotFound() {
        Long expenseId = 999L;
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            expenseService.updateExpense(expenseId, new Expense());
        });
    }

    @Test
    void testDeleteExpense() {
        Long expenseId = 1L;
        doNothing().when(expenseRepository).deleteById(expenseId);

        expenseService.deleteExpense(expenseId);

        verify(expenseRepository, times(1)).deleteById(expenseId);
    }

    @Test
    void testGetExpensesByUserId() {
        List<Expense> expenses = Arrays.asList(testExpense);
        when(expenseRepository.findByUserId(1L)).thenReturn(expenses);

        List<Expense> result = expenseService.getExpensesByUser(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testExpense, result.get(0));
    }

    @Test
    void testGetExpensesByUser() {
        List<Expense> expenses = Arrays.asList(testExpense);
        when(expenseRepository.findByUser(testUser)).thenReturn(expenses);

        List<Expense> result = expenseService.getExpensesByUser(testUser);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testExpense, result.get(0));
    }

    @Test
    void testGetMonthlyExpenses() {
        int year = 2025;
        int month = 1;
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Expense> expenses = Arrays.asList(testExpense);
        when(expenseRepository.findByUserIdAndDateBetween(1L, startDate, endDate))
                .thenReturn(expenses);

        List<Expense> result = expenseService.getMonthlyExpenses(1L, year, month);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testExpense, result.get(0));
    }

    @Test
    void testGetMonthlySummary() {
        int year = 2025;
        int month = 1;
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        Expense expense1 = new Expense();
        expense1.setAmount(new BigDecimal("50.00"));
        expense1.setCategory(testCategory);

        Expense expense2 = new Expense();
        expense2.setAmount(new BigDecimal("30.00"));
        expense2.setCategory(testCategory);

        List<Expense> expenses = Arrays.asList(expense1, expense2);
        when(expenseRepository.findByUserIdAndDateBetween(1L, startDate, endDate))
                .thenReturn(expenses);

        ExpenseSummaryDTO summary = expenseService.getMonthlySummary(1L, year, month);

        assertNotNull(summary);
        assertEquals(yearMonth, summary.getPeriod());
        assertEquals(new BigDecimal("80.00"), summary.getTotalAmount());
        assertEquals(2, summary.getExpenseCount());
        assertEquals(1, summary.getCategoryBreakdown().size());
        assertEquals(new BigDecimal("80.00"), summary.getCategoryBreakdown().get(testCategory));
    }

    @Test
    void testGetExpensesByCategory() {
        List<Expense> expenses = Arrays.asList(testExpense);
        when(expenseRepository.findByUserIdAndCategoryId(1L, 1L)).thenReturn(expenses);

        List<Expense> result = expenseService.getExpensesByCategory(1L, 1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testExpense, result.get(0));
    }

    @Test
    void testGetExpensesByDateRange() {
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();
        List<Expense> expenses = Arrays.asList(testExpense);
        
        when(expenseRepository.findByUserIdAndDateBetween(1L, startDate, endDate))
                .thenReturn(expenses);

        List<Expense> result = expenseService.getExpensesByDateRange(1L, startDate, endDate);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testExpense, result.get(0));
    }

    @Test
    void testGetTotalExpenses() {
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();
        BigDecimal expectedTotal = new BigDecimal("150.00");
        
        when(expenseRepository.getTotalExpensesByUserAndDateRange(testUser, startDate, endDate))
                .thenReturn(expectedTotal);

        BigDecimal total = expenseService.getTotalExpenses(testUser, startDate, endDate);

        assertNotNull(total);
        assertEquals(expectedTotal, total);
    }

    @Test
    void testGetTotalExpensesWithNull() {
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();
        
        when(expenseRepository.getTotalExpensesByUserAndDateRange(testUser, startDate, endDate))
                .thenReturn(null);

        BigDecimal total = expenseService.getTotalExpenses(testUser, startDate, endDate);

        assertNotNull(total);
        assertEquals(BigDecimal.ZERO, total);
    }

    @Test
    void testGetExpensesByCategoryWithDateRange() {
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();
        
        Expense expense1 = new Expense();
        expense1.setAmount(new BigDecimal("50.00"));
        expense1.setCategory(testCategory);

        Category category2 = new Category();
        category2.setId(2L);
        category2.setName("Transport");

        Expense expense2 = new Expense();
        expense2.setAmount(new BigDecimal("30.00"));
        expense2.setCategory(category2);

        List<Expense> expenses = Arrays.asList(expense1, expense2);
        when(expenseRepository.findByUserAndDateBetween(testUser, startDate, endDate))
                .thenReturn(expenses);

        Map<Category, BigDecimal> result = expenseService.getExpensesByCategory(testUser, startDate, endDate);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(new BigDecimal("50.00"), result.get(testCategory));
        assertEquals(new BigDecimal("30.00"), result.get(category2));
    }

    @Test
    void testGetRecurringExpenses() {
        testExpense.setRecurring(true);
        List<Expense> expenses = Arrays.asList(testExpense);
        
        when(expenseRepository.findByUserAndIsRecurringTrue(testUser)).thenReturn(expenses);

        List<Expense> result = expenseService.getRecurringExpenses(testUser);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).isRecurring());
    }

    @Test
    void testGetMonthlyExpenseSummary() {
        YearMonth yearMonth = YearMonth.now();
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        List<Expense> expenses = Arrays.asList(testExpense);
        BigDecimal total = new BigDecimal("50.00");
        
        when(expenseRepository.findByUserAndDateBetween(testUser, startDate, endDate))
                .thenReturn(expenses);
        when(expenseRepository.getTotalExpensesByUserAndDateRange(testUser, startDate, endDate))
                .thenReturn(total);

        ExpenseSummaryDTO summary = expenseService.getMonthlyExpenseSummary(testUser, yearMonth);

        assertNotNull(summary);
        assertEquals(yearMonth, summary.getPeriod());
        assertEquals(total, summary.getTotalAmount());
        assertEquals(1, summary.getExpenseCount());
    }

    @Test
    void testProcessRecurringExpensesForUser() {
        testExpense.setRecurring(true);
        testExpense.setRecurrenceFrequency(RecurrenceFrequency.MONTHLY);
        testExpense.setRecurrenceEndDate(LocalDate.now().plusMonths(6));
        
        List<Expense> recurringExpenses = Arrays.asList(testExpense);
        when(expenseRepository.findByUserAndIsRecurringTrue(testUser)).thenReturn(recurringExpenses);

        // This method doesn't throw exceptions and processes silently
        assertDoesNotThrow(() -> expenseService.processRecurringExpenses(testUser));
        
        verify(expenseRepository, times(1)).findByUserAndIsRecurringTrue(testUser);
    }
}
