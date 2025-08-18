package sg.wlian.addonapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import sg.wlian.addonapp.dto.ExpenseSummaryDTO;
import sg.wlian.addonapp.entity.Category;
import sg.wlian.addonapp.entity.Expense;
import sg.wlian.addonapp.entity.PaymentMethod;
import sg.wlian.addonapp.entity.User;
import sg.wlian.addonapp.service.ExpenseService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExpenseController.class)
class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExpenseService expenseService;

    private Expense testExpense;
    private User testUser;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Food");

        testExpense = new Expense();
        testExpense.setId(1L);
        testExpense.setDescription("Grocery shopping");
        testExpense.setAmount(new BigDecimal("50.00"));
        testExpense.setDate(LocalDate.now());
        testExpense.setUser(testUser);
        testExpense.setCategory(testCategory);
        testExpense.setPaymentMethod(PaymentMethod.CREDIT_CARD);
        testExpense.setNotes("Weekly groceries");
        testExpense.setRecurring(false);
    }

    @Test
    void testCreateExpense() throws Exception {
        when(expenseService.createExpense(any(Expense.class))).thenReturn(testExpense);

        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testExpense)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.description").value("Grocery shopping"))
                .andExpect(jsonPath("$.amount").value(50.00))
                .andExpect(jsonPath("$.paymentMethod").value("CREDIT_CARD"));

        verify(expenseService, times(1)).createExpense(any(Expense.class));
    }

    @Test
    void testUpdateExpense() throws Exception {
        Long expenseId = 1L;
        when(expenseService.updateExpense(eq(expenseId), any(Expense.class))).thenReturn(testExpense);

        mockMvc.perform(put("/api/expenses/{id}", expenseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testExpense)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.description").value("Grocery shopping"));

        verify(expenseService, times(1)).updateExpense(eq(expenseId), any(Expense.class));
    }

    @Test
    void testDeleteExpense() throws Exception {
        Long expenseId = 1L;
        doNothing().when(expenseService).deleteExpense(expenseId);

        mockMvc.perform(delete("/api/expenses/{id}", expenseId))
                .andExpect(status().isNoContent());

        verify(expenseService, times(1)).deleteExpense(expenseId);
    }

    @Test
    void testGetExpensesByUser() throws Exception {
        Long userId = 1L;
        List<Expense> expenses = Arrays.asList(testExpense);
        when(expenseService.getExpensesByUser(userId)).thenReturn(expenses);

        mockMvc.perform(get("/api/expenses/user/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description").value("Grocery shopping"));

        verify(expenseService, times(1)).getExpensesByUser(userId);
    }

    @Test
    void testGetMonthlyExpenses() throws Exception {
        Long userId = 1L;
        int year = 2025;
        int month = 1;
        List<Expense> expenses = Arrays.asList(testExpense);
        when(expenseService.getMonthlyExpenses(userId, year, month)).thenReturn(expenses);

        mockMvc.perform(get("/api/expenses/user/{userId}/monthly", userId)
                .param("year", String.valueOf(year))
                .param("month", String.valueOf(month)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description").value("Grocery shopping"));

        verify(expenseService, times(1)).getMonthlyExpenses(userId, year, month);
    }

    @Test
    void testGetMonthlySummary() throws Exception {
        Long userId = 1L;
        int year = 2025;
        int month = 1;
        YearMonth yearMonth = YearMonth.of(year, month);
        
        Map<Category, BigDecimal> categoryBreakdown = new HashMap<>();
        categoryBreakdown.put(testCategory, new BigDecimal("50.00"));
        
        ExpenseSummaryDTO summary = new ExpenseSummaryDTO(
                yearMonth,
                new BigDecimal("50.00"),
                1,
                categoryBreakdown
        );
        
        when(expenseService.getMonthlySummary(userId, year, month)).thenReturn(summary);

        mockMvc.perform(get("/api/expenses/user/{userId}/monthly-summary", userId)
                .param("year", String.valueOf(year))
                .param("month", String.valueOf(month)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount").value(50.00))
                .andExpect(jsonPath("$.expenseCount").value(1));

        verify(expenseService, times(1)).getMonthlySummary(userId, year, month);
    }

    @Test
    void testGetExpensesByCategory() throws Exception {
        Long userId = 1L;
        Long categoryId = 1L;
        List<Expense> expenses = Arrays.asList(testExpense);
        when(expenseService.getExpensesByCategory(userId, categoryId)).thenReturn(expenses);

        mockMvc.perform(get("/api/expenses/user/{userId}/category/{categoryId}", userId, categoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description").value("Grocery shopping"));

        verify(expenseService, times(1)).getExpensesByCategory(userId, categoryId);
    }

    @Test
    void testGetExpensesByDateRange() throws Exception {
        Long userId = 1L;
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();
        List<Expense> expenses = Arrays.asList(testExpense);
        
        when(expenseService.getExpensesByDateRange(userId, startDate, endDate)).thenReturn(expenses);

        mockMvc.perform(get("/api/expenses/user/{userId}/date-range", userId)
                .param("startDate", startDate.toString())
                .param("endDate", endDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description").value("Grocery shopping"));

        verify(expenseService, times(1)).getExpensesByDateRange(userId, startDate, endDate);
    }

    @Test
    void testCreateExpenseWithValidation() throws Exception {
        Expense invalidExpense = new Expense();
        // Missing required fields

        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidExpense)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUpdateNonExistentExpense() throws Exception {
        Long expenseId = 999L;
        when(expenseService.updateExpense(eq(expenseId), any(Expense.class)))
                .thenThrow(new RuntimeException("Expense not found"));

        mockMvc.perform(put("/api/expenses/{id}", expenseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testExpense)))
                .andExpect(status().isInternalServerError());
    }
}
