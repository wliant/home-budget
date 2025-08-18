package sg.wlian.addonapp.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import sg.wlian.addonapp.dto.BudgetStatusDTO;
import sg.wlian.addonapp.entity.*;
import sg.wlian.addonapp.repository.BudgetRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BudgetService Tests")
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private ExpenseService expenseService;

    @InjectMocks
    private BudgetService budgetService;

    private User testUser;
    private Category testCategory;
    private Budget monthlyBudget;
    private Budget yearlyBudget;
    private Budget categoryBudget;

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

        monthlyBudget = new Budget();
        monthlyBudget.setId(1L);
        monthlyBudget.setName("Monthly Budget");
        monthlyBudget.setAmount(new BigDecimal("2000.00"));
        monthlyBudget.setBudgetType(BudgetType.OVERALL);
        monthlyBudget.setTimePeriod(TimePeriod.MONTHLY);
        monthlyBudget.setStartDate(LocalDate.now().withDayOfMonth(1));
        monthlyBudget.setEndDate(LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()));
        monthlyBudget.setUser(testUser);
        monthlyBudget.setActive(true);

        yearlyBudget = new Budget();
        yearlyBudget.setId(2L);
        yearlyBudget.setName("Yearly Budget");
        yearlyBudget.setAmount(new BigDecimal("24000.00"));
        yearlyBudget.setBudgetType(BudgetType.OVERALL);
        yearlyBudget.setTimePeriod(TimePeriod.YEARLY);
        yearlyBudget.setStartDate(LocalDate.now().withDayOfYear(1));
        yearlyBudget.setEndDate(LocalDate.now().withDayOfYear(LocalDate.now().lengthOfYear()));
        yearlyBudget.setUser(testUser);
        yearlyBudget.setActive(true);

        categoryBudget = new Budget();
        categoryBudget.setId(3L);
        categoryBudget.setName("Food Budget");
        categoryBudget.setAmount(new BigDecimal("500.00"));
        categoryBudget.setBudgetType(BudgetType.CATEGORY);
        categoryBudget.setTimePeriod(TimePeriod.MONTHLY);
        categoryBudget.setCategory(testCategory);
        categoryBudget.setStartDate(LocalDate.now().withDayOfMonth(1));
        categoryBudget.setEndDate(LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()));
        categoryBudget.setUser(testUser);
        categoryBudget.setActive(true);
    }

    @Nested
    @DisplayName("Create Budget Tests")
    class CreateBudgetTests {

        @Test
        @DisplayName("Should create monthly budget successfully")
        void testCreateMonthlyBudget_Success() {
            when(budgetRepository.save(any(Budget.class))).thenReturn(monthlyBudget);

            Budget created = budgetService.createBudget(monthlyBudget);

            assertNotNull(created);
            assertEquals(monthlyBudget.getName(), created.getName());
            assertEquals(monthlyBudget.getAmount(), created.getAmount());
            assertEquals(TimePeriod.MONTHLY, created.getTimePeriod());
            verify(budgetRepository, times(1)).save(monthlyBudget);
        }

        @Test
        @DisplayName("Should create category budget successfully")
        void testCreateCategoryBudget_Success() {
            when(budgetRepository.save(any(Budget.class))).thenReturn(categoryBudget);

            Budget created = budgetService.createBudget(categoryBudget);

            assertNotNull(created);
            assertEquals(categoryBudget.getName(), created.getName());
            assertEquals(BudgetType.CATEGORY, created.getBudgetType());
            assertEquals(testCategory, created.getCategory());
            verify(budgetRepository, times(1)).save(categoryBudget);
        }

        @Test
        @DisplayName("Should validate budget amount is positive")
        void testCreateBudget_NegativeAmount() {
            Budget invalidBudget = new Budget();
            invalidBudget.setAmount(new BigDecimal("-100.00"));

            assertThrows(IllegalArgumentException.class, () -> {
                budgetService.createBudget(invalidBudget);
            });
            verify(budgetRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should validate budget dates")
        void testCreateBudget_InvalidDates() {
            Budget invalidBudget = new Budget();
            invalidBudget.setAmount(new BigDecimal("100.00"));
            invalidBudget.setStartDate(LocalDate.now());
            invalidBudget.setEndDate(LocalDate.now().minusDays(1));

            assertThrows(IllegalArgumentException.class, () -> {
                budgetService.createBudget(invalidBudget);
            });
            verify(budgetRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Update Budget Tests")
    class UpdateBudgetTests {

        @Test
        @DisplayName("Should update budget successfully")
        void testUpdateBudget_Success() {
            Long budgetId = 1L;
            Budget updatedDetails = new Budget();
            updatedDetails.setName("Updated Monthly Budget");
            updatedDetails.setAmount(new BigDecimal("2500.00"));
            updatedDetails.setActive(false);

            when(budgetRepository.findById(budgetId)).thenReturn(Optional.of(monthlyBudget));
            when(budgetRepository.save(any(Budget.class))).thenReturn(monthlyBudget);

            Budget updated = budgetService.updateBudget(budgetId, updatedDetails);

            assertNotNull(updated);
            assertEquals(updatedDetails.getName(), monthlyBudget.getName());
            assertEquals(updatedDetails.getAmount(), monthlyBudget.getAmount());
            assertFalse(monthlyBudget.isActive());
            verify(budgetRepository, times(1)).findById(budgetId);
            verify(budgetRepository, times(1)).save(monthlyBudget);
        }

        @Test
        @DisplayName("Should throw exception when budget not found")
        void testUpdateBudget_NotFound() {
            Long budgetId = 999L;
            when(budgetRepository.findById(budgetId)).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> {
                budgetService.updateBudget(budgetId, new Budget());
            });
            verify(budgetRepository, times(1)).findById(budgetId);
            verify(budgetRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should update budget category")
        void testUpdateBudget_ChangeCategory() {
            Long budgetId = 3L;
            Category newCategory = new Category();
            newCategory.setId(2L);
            newCategory.setName("Transport");

            Budget updatedDetails = new Budget();
            updatedDetails.setCategory(newCategory);

            when(budgetRepository.findById(budgetId)).thenReturn(Optional.of(categoryBudget));
            when(budgetRepository.save(any(Budget.class))).thenReturn(categoryBudget);

            Budget updated = budgetService.updateBudget(budgetId, updatedDetails);

            assertNotNull(updated);
            assertEquals(newCategory, categoryBudget.getCategory());
            verify(budgetRepository, times(1)).save(categoryBudget);
        }
    }

    @Nested
    @DisplayName("Delete Budget Tests")
    class DeleteBudgetTests {

        @Test
        @DisplayName("Should delete budget successfully")
        void testDeleteBudget_Success() {
            Long budgetId = 1L;
            doNothing().when(budgetRepository).deleteById(budgetId);

            budgetService.deleteBudget(budgetId);

            verify(budgetRepository, times(1)).deleteById(budgetId);
        }

        @Test
        @DisplayName("Should handle deletion of non-existent budget")
        void testDeleteBudget_NotFound() {
            Long budgetId = 999L;
            doThrow(new RuntimeException("Budget not found")).when(budgetRepository).deleteById(budgetId);

            assertThrows(RuntimeException.class, () -> {
                budgetService.deleteBudget(budgetId);
            });
            verify(budgetRepository, times(1)).deleteById(budgetId);
        }
    }

    @Nested
    @DisplayName("Retrieve Budget Tests")
    class RetrieveBudgetTests {

        @Test
        @DisplayName("Should get all budgets by user")
        void testGetBudgetsByUser_Success() {
            List<Budget> budgets = Arrays.asList(monthlyBudget, yearlyBudget, categoryBudget);
            when(budgetRepository.findByUserId(1L)).thenReturn(budgets);

            List<Budget> result = budgetService.getBudgetsByUser(1L);

            assertNotNull(result);
            assertEquals(3, result.size());
            assertTrue(result.contains(monthlyBudget));
            assertTrue(result.contains(yearlyBudget));
            assertTrue(result.contains(categoryBudget));
            verify(budgetRepository, times(1)).findByUserId(1L);
        }

        @Test
        @DisplayName("Should get active budgets only")
        void testGetActiveBudgets_Success() {
            List<Budget> activeBudgets = Arrays.asList(monthlyBudget, categoryBudget);
            when(budgetRepository.findByUserIdAndIsActiveTrue(1L)).thenReturn(activeBudgets);

            List<Budget> result = budgetService.getActiveBudgets(1L);

            assertNotNull(result);
            assertEquals(2, result.size());
            assertTrue(result.stream().allMatch(Budget::isActive));
            verify(budgetRepository, times(1)).findByUserIdAndIsActiveTrue(1L);
        }

        @Test
        @DisplayName("Should get budgets by category")
        void testGetBudgetsByCategory_Success() {
            List<Budget> categoryBudgets = Arrays.asList(categoryBudget);
            when(budgetRepository.findByUserIdAndCategoryId(1L, 1L)).thenReturn(categoryBudgets);

            List<Budget> result = budgetService.getBudgetsByCategory(1L, 1L);

            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals(testCategory, result.get(0).getCategory());
            verify(budgetRepository, times(1)).findByUserIdAndCategoryId(1L, 1L);
        }

        @Test
        @DisplayName("Should return empty list when no budgets found")
        void testGetBudgetsByUser_EmptyList() {
            when(budgetRepository.findByUserId(1L)).thenReturn(Collections.emptyList());

            List<Budget> result = budgetService.getBudgetsByUser(1L);

            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(budgetRepository, times(1)).findByUserId(1L);
        }
    }

    @Nested
    @DisplayName("Budget Status Tests")
    class BudgetStatusTests {

        @Test
        @DisplayName("Should calculate budget status correctly")
        void testGetBudgetStatus_UnderBudget() {
            Long budgetId = 1L;
            BigDecimal spentAmount = new BigDecimal("800.00");
            
            when(budgetRepository.findById(budgetId)).thenReturn(Optional.of(monthlyBudget));
            when(expenseService.getTotalExpenses(any(User.class), any(LocalDate.class), any(LocalDate.class)))
                    .thenReturn(spentAmount);

            BudgetStatusDTO status = budgetService.getBudgetStatus(budgetId);

            assertNotNull(status);
            assertEquals(monthlyBudget, status.getBudget());
            assertEquals(spentAmount, status.getSpentAmount());
            assertEquals(new BigDecimal("1200.00"), status.getRemainingAmount());
            assertEquals(new BigDecimal("40.00"), status.getPercentageUsed());
            assertFalse(status.isOverBudget());
            verify(budgetRepository, times(1)).findById(budgetId);
        }

        @Test
        @DisplayName("Should detect over budget situation")
        void testGetBudgetStatus_OverBudget() {
            Long budgetId = 1L;
            BigDecimal spentAmount = new BigDecimal("2500.00");
            
            when(budgetRepository.findById(budgetId)).thenReturn(Optional.of(monthlyBudget));
            when(expenseService.getTotalExpenses(any(User.class), any(LocalDate.class), any(LocalDate.class)))
                    .thenReturn(spentAmount);

            BudgetStatusDTO status = budgetService.getBudgetStatus(budgetId);

            assertNotNull(status);
            assertEquals(spentAmount, status.getSpentAmount());
            assertEquals(new BigDecimal("-500.00"), status.getRemainingAmount());
            assertEquals(new BigDecimal("125.00"), status.getPercentageUsed());
            assertTrue(status.isOverBudget());
        }

        @Test
        @DisplayName("Should handle zero budget amount")
        void testGetBudgetStatus_ZeroBudget() {
            monthlyBudget.setAmount(BigDecimal.ZERO);
            BigDecimal spentAmount = new BigDecimal("100.00");
            
            when(budgetRepository.findById(1L)).thenReturn(Optional.of(monthlyBudget));
            when(expenseService.getTotalExpenses(any(User.class), any(LocalDate.class), any(LocalDate.class)))
                    .thenReturn(spentAmount);

            BudgetStatusDTO status = budgetService.getBudgetStatus(1L);

            assertNotNull(status);
            assertEquals(BigDecimal.ZERO, status.getPercentageUsed());
            assertTrue(status.isOverBudget());
        }

        @Test
        @DisplayName("Should calculate category budget status")
        void testGetCategoryBudgetStatus() {
            Long budgetId = 3L;
            BigDecimal spentAmount = new BigDecimal("300.00");
            
            when(budgetRepository.findById(budgetId)).thenReturn(Optional.of(categoryBudget));
            when(expenseService.getTotalExpensesByCategory(any(User.class), any(Category.class), 
                    any(LocalDate.class), any(LocalDate.class)))
                    .thenReturn(spentAmount);

            BudgetStatusDTO status = budgetService.getBudgetStatus(budgetId);

            assertNotNull(status);
            assertEquals(categoryBudget, status.getBudget());
            assertEquals(spentAmount, status.getSpentAmount());
            assertEquals(new BigDecimal("200.00"), status.getRemainingAmount());
            assertEquals(new BigDecimal("60.00"), status.getPercentageUsed());
            assertFalse(status.isOverBudget());
        }
    }

    @Nested
    @DisplayName("Budget Period Tests")
    class BudgetPeriodTests {

        @Test
        @DisplayName("Should get current period budgets")
        void testGetCurrentPeriodBudgets() {
            List<Budget> currentBudgets = Arrays.asList(monthlyBudget, categoryBudget);
            LocalDate now = LocalDate.now();
            
            when(budgetRepository.findByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                    eq(1L), eq(now), eq(now)))
                    .thenReturn(currentBudgets);

            List<Budget> result = budgetService.getCurrentPeriodBudgets(1L);

            assertNotNull(result);
            assertEquals(2, result.size());
            verify(budgetRepository, times(1))
                    .findByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(eq(1L), eq(now), eq(now));
        }

        @Test
        @DisplayName("Should get budgets for specific month")
        void testGetBudgetsForMonth() {
            YearMonth yearMonth = YearMonth.now();
            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();
            List<Budget> monthBudgets = Arrays.asList(monthlyBudget, categoryBudget);
            
            when(budgetRepository.findByUserIdAndDateRange(1L, startDate, endDate))
                    .thenReturn(monthBudgets);

            List<Budget> result = budgetService.getBudgetsForMonth(1L, yearMonth);

            assertNotNull(result);
            assertEquals(2, result.size());
            verify(budgetRepository, times(1)).findByUserIdAndDateRange(1L, startDate, endDate);
        }

        @Test
        @DisplayName("Should check if budget is expired")
        void testIsBudgetExpired() {
            Budget expiredBudget = new Budget();
            expiredBudget.setEndDate(LocalDate.now().minusDays(1));
            
            Budget activeBudget = new Budget();
            activeBudget.setEndDate(LocalDate.now().plusDays(1));

            assertTrue(budgetService.isBudgetExpired(expiredBudget));
            assertFalse(budgetService.isBudgetExpired(activeBudget));
        }

        @Test
        @DisplayName("Should auto-renew monthly budget")
        void testAutoRenewBudget() {
            monthlyBudget.setAutoRenew(true);
            LocalDate nextStartDate = monthlyBudget.getEndDate().plusDays(1);
            LocalDate nextEndDate = nextStartDate.plusMonths(1).minusDays(1);
            
            when(budgetRepository.save(any(Budget.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Budget renewed = budgetService.renewBudget(monthlyBudget);

            assertNotNull(renewed);
            assertEquals(monthlyBudget.getName(), renewed.getName());
            assertEquals(monthlyBudget.getAmount(), renewed.getAmount());
            assertEquals(nextStartDate, renewed.getStartDate());
            assertEquals(nextEndDate, renewed.getEndDate());
            verify(budgetRepository, times(1)).save(any(Budget.class));
        }
    }

    @Nested
    @DisplayName("Budget Validation Tests")
    class BudgetValidationTests {

        @Test
        @DisplayName("Should validate overlapping budgets")
        void testValidateOverlappingBudgets() {
            Budget newBudget = new Budget();
            newBudget.setBudgetType(BudgetType.OVERALL);
            newBudget.setTimePeriod(TimePeriod.MONTHLY);
            newBudget.setStartDate(monthlyBudget.getStartDate());
            newBudget.setEndDate(monthlyBudget.getEndDate());
            newBudget.setUser(testUser);
            
            when(budgetRepository.findOverlappingBudgets(any(), any(), any(), any()))
                    .thenReturn(Arrays.asList(monthlyBudget));

            assertThrows(IllegalArgumentException.class, () -> {
                budgetService.validateNoOverlappingBudgets(newBudget);
            });
        }

        @Test
        @DisplayName("Should allow non-overlapping budgets")
        void testValidateNonOverlappingBudgets() {
            Budget newBudget = new Budget();
            newBudget.setBudgetType(BudgetType.OVERALL);
            newBudget.setTimePeriod(TimePeriod.MONTHLY);
            newBudget.setStartDate(LocalDate.now().plusMonths(2));
            newBudget.setEndDate(LocalDate.now().plusMonths(3));
            newBudget.setUser(testUser);
            
            when(budgetRepository.findOverlappingBudgets(any(), any(), any(), any()))
                    .thenReturn(Collections.emptyList());

            assertDoesNotThrow(() -> {
                budgetService.validateNoOverlappingBudgets(newBudget);
            });
        }

        @Test
        @DisplayName("Should validate budget amount limits")
        void testValidateBudgetAmountLimits() {
            Budget budget = new Budget();
            
            // Test minimum amount
            budget.setAmount(new BigDecimal("0.01"));
            assertDoesNotThrow(() -> budgetService.validateBudgetAmount(budget));
            
            // Test maximum amount
            budget.setAmount(new BigDecimal("999999999.99"));
            assertDoesNotThrow(() -> budgetService.validateBudgetAmount(budget));
            
            // Test invalid amounts
            budget.setAmount(BigDecimal.ZERO);
            assertThrows(IllegalArgumentException.class, () -> budgetService.validateBudgetAmount(budget));
            
            budget.setAmount(new BigDecimal("-1"));
            assertThrows(IllegalArgumentException.class, () -> budgetService.validateBudgetAmount(budget));
        }
    }

    @Nested
    @DisplayName("Budget Summary Tests")
    class BudgetSummaryTests {

        @Test
        @DisplayName("Should generate monthly budget summary")
        void testGetMonthlyBudgetSummary() {
            List<Budget> budgets = Arrays.asList(monthlyBudget, categoryBudget);
            BigDecimal totalSpent = new BigDecimal("1300.00");
            BigDecimal totalBudgeted = new BigDecimal("2500.00");
            
            when(budgetRepository.findByUserIdAndTimePeriod(1L, TimePeriod.MONTHLY))
                    .thenReturn(budgets);
            when(expenseService.getTotalExpenses(any(), any(), any()))
                    .thenReturn(totalSpent);

            var summary = budgetService.getMonthlyBudgetSummary(1L);

            assertNotNull(summary);
            assertEquals(totalBudgeted, summary.getTotalBudgeted());
            assertEquals(totalSpent, summary.getTotalSpent());
            assertEquals(new BigDecimal("1200.00"), summary.getTotalRemaining());
            assertEquals(new BigDecimal("52.00"), summary.getOverallPercentageUsed());
        }

        @Test
        @DisplayName("Should calculate budget alerts")
        void testGetBudgetAlerts() {
            BigDecimal nearLimitSpent = new BigDecimal("1800.00"); // 90% of 2000
            BigDecimal overLimitSpent = new BigDecimal("2200.00"); // 110% of 2000
            
            when(budgetRepository.findByUserIdAndIsActiveTrue(1L))
                    .thenReturn(Arrays.asList(monthlyBudget));
            when(expenseService.getTotalExpenses(any(), any(), any()))
                    .thenReturn(nearLimitSpent);

            List<BudgetAlert> alerts = budgetService.getBudgetAlerts(1L);

            assertNotNull(alerts);
            assertFalse(alerts.isEmpty());
            assertTrue(alerts.stream().anyMatch(a -> a.getAlertType() == AlertType.NEAR_LIMIT));
        }
    }
}
