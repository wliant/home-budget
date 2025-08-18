package sg.wlian.addonapp.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import sg.wlian.addonapp.entity.*;
import sg.wlian.addonapp.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Expense Integration Tests")
class ExpenseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User testUser;
    private Category testCategory;
    private Expense testExpense;

    @BeforeEach
    void setUp() {
        // Clear existing data
        expenseRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        // Create test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");
        testUser = userRepository.save(testUser);

        // Create test category
        testCategory = new Category();
        testCategory.setName("Food");
        testCategory.setDescription("Food expenses");
        testCategory.setColor("#FF5733");
        testCategory.setUser(testUser);
        testCategory = categoryRepository.save(testCategory);

        // Create test expense
        testExpense = new Expense();
        testExpense.setDescription("Grocery shopping");
        testExpense.setAmount(new BigDecimal("50.00"));
        testExpense.setDate(LocalDate.now());
        testExpense.setUser(testUser);
        testExpense.setCategory(testCategory);
        testExpense.setPaymentMethod(PaymentMethod.CREDIT_CARD);
        testExpense.setNotes("Weekly groceries");
        testExpense.setRecurring(false);
    }

    @Nested
    @DisplayName("Create Expense Integration Tests")
    class CreateExpenseTests {

        @Test
        @DisplayName("Should create expense and persist to database")
        void testCreateExpense_PersistsToDatabase() throws Exception {
            String expenseJson = objectMapper.writeValueAsString(testExpense);

            mockMvc.perform(post("/api/expenses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(expenseJson))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").exists())
                    .andExpect(jsonPath("$.description").value("Grocery shopping"))
                    .andExpect(jsonPath("$.amount").value(50.00));

            List<Expense> expenses = expenseRepository.findAll();
            assertEquals(1, expenses.size());
            assertEquals("Grocery shopping", expenses.get(0).getDescription());
        }

        @Test
        @DisplayName("Should create recurring expense")
        void testCreateRecurringExpense() throws Exception {
            testExpense.setRecurring(true);
            testExpense.setRecurrenceFrequency(RecurrenceFrequency.MONTHLY);
            testExpense.setRecurrenceEndDate(LocalDate.now().plusMonths(6));

            String expenseJson = objectMapper.writeValueAsString(testExpense);

            mockMvc.perform(post("/api/expenses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(expenseJson))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.recurring").value(true))
                    .andExpect(jsonPath("$.recurrenceFrequency").value("MONTHLY"));

            Expense saved = expenseRepository.findAll().get(0);
            assertTrue(saved.isRecurring());
            assertEquals(RecurrenceFrequency.MONTHLY, saved.getRecurrenceFrequency());
        }

        @Test
        @DisplayName("Should validate required fields")
        void testCreateExpense_ValidationError() throws Exception {
            Expense invalidExpense = new Expense();
            // Missing required fields

            mockMvc.perform(post("/api/expenses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidExpense)))
                    .andExpect(status().isBadRequest());

            assertTrue(expenseRepository.findAll().isEmpty());
        }
    }

    @Nested
    @DisplayName("Update Expense Integration Tests")
    class UpdateExpenseTests {

        @Test
        @DisplayName("Should update expense in database")
        void testUpdateExpense_UpdatesDatabase() throws Exception {
            Expense saved = expenseRepository.save(testExpense);
            
            saved.setDescription("Updated grocery shopping");
            saved.setAmount(new BigDecimal("75.00"));

            mockMvc.perform(put("/api/expenses/{id}", saved.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(saved)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.description").value("Updated grocery shopping"))
                    .andExpect(jsonPath("$.amount").value(75.00));

            Expense updated = expenseRepository.findById(saved.getId()).orElseThrow();
            assertEquals("Updated grocery shopping", updated.getDescription());
            assertEquals(new BigDecimal("75.00"), updated.getAmount());
        }

        @Test
        @DisplayName("Should return 404 for non-existent expense")
        void testUpdateExpense_NotFound() throws Exception {
            mockMvc.perform(put("/api/expenses/{id}", 999L)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testExpense)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Delete Expense Integration Tests")
    class DeleteExpenseTests {

        @Test
        @DisplayName("Should delete expense from database")
        void testDeleteExpense_RemovesFromDatabase() throws Exception {
            Expense saved = expenseRepository.save(testExpense);
            
            mockMvc.perform(delete("/api/expenses/{id}", saved.getId()))
                    .andExpect(status().isNoContent());

            assertFalse(expenseRepository.existsById(saved.getId()));
        }

        @Test
        @DisplayName("Should handle deletion of non-existent expense")
        void testDeleteExpense_NotFound() throws Exception {
            mockMvc.perform(delete("/api/expenses/{id}", 999L))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Query Expense Integration Tests")
    class QueryExpenseTests {

        @Test
        @DisplayName("Should retrieve expenses by user")
        void testGetExpensesByUser() throws Exception {
            expenseRepository.save(testExpense);
            
            Expense expense2 = new Expense();
            expense2.setDescription("Restaurant");
            expense2.setAmount(new BigDecimal("30.00"));
            expense2.setDate(LocalDate.now());
            expense2.setUser(testUser);
            expense2.setCategory(testCategory);
            expenseRepository.save(expense2);

            mockMvc.perform(get("/api/expenses/user/{userId}", testUser.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].description").value("Grocery shopping"))
                    .andExpect(jsonPath("$[1].description").value("Restaurant"));
        }

        @Test
        @DisplayName("Should retrieve monthly expenses")
        void testGetMonthlyExpenses() throws Exception {
            expenseRepository.save(testExpense);
            
            int year = LocalDate.now().getYear();
            int month = LocalDate.now().getMonthValue();

            mockMvc.perform(get("/api/expenses/user/{userId}/monthly", testUser.getId())
                    .param("year", String.valueOf(year))
                    .param("month", String.valueOf(month)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].description").value("Grocery shopping"));
        }

        @Test
        @DisplayName("Should retrieve expenses by category")
        void testGetExpensesByCategory() throws Exception {
            expenseRepository.save(testExpense);
            
            Category transportCategory = new Category();
            transportCategory.setName("Transport");
            transportCategory.setUser(testUser);
            transportCategory = categoryRepository.save(transportCategory);
            
            Expense transportExpense = new Expense();
            transportExpense.setDescription("Gas");
            transportExpense.setAmount(new BigDecimal("40.00"));
            transportExpense.setDate(LocalDate.now());
            transportExpense.setUser(testUser);
            transportExpense.setCategory(transportCategory);
            expenseRepository.save(transportExpense);

            mockMvc.perform(get("/api/expenses/user/{userId}/category/{categoryId}", 
                    testUser.getId(), testCategory.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].description").value("Grocery shopping"));
        }

        @Test
        @DisplayName("Should retrieve expenses by date range")
        void testGetExpensesByDateRange() throws Exception {
            expenseRepository.save(testExpense);
            
            Expense oldExpense = new Expense();
            oldExpense.setDescription("Old expense");
            oldExpense.setAmount(new BigDecimal("20.00"));
            oldExpense.setDate(LocalDate.now().minusMonths(2));
            oldExpense.setUser(testUser);
            expenseRepository.save(oldExpense);

            LocalDate startDate = LocalDate.now().minusDays(7);
            LocalDate endDate = LocalDate.now();

            mockMvc.perform(get("/api/expenses/user/{userId}/date-range", testUser.getId())
                    .param("startDate", startDate.toString())
                    .param("endDate", endDate.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].description").value("Grocery shopping"));
        }

        @Test
        @DisplayName("Should calculate monthly summary")
        void testGetMonthlySummary() throws Exception {
            expenseRepository.save(testExpense);
            
            Expense expense2 = new Expense();
            expense2.setDescription("Restaurant");
            expense2.setAmount(new BigDecimal("30.00"));
            expense2.setDate(LocalDate.now());
            expense2.setUser(testUser);
            expense2.setCategory(testCategory);
            expenseRepository.save(expense2);

            int year = LocalDate.now().getYear();
            int month = LocalDate.now().getMonthValue();

            mockMvc.perform(get("/api/expenses/user/{userId}/monthly-summary", testUser.getId())
                    .param("year", String.valueOf(year))
                    .param("month", String.valueOf(month)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalAmount").value(80.00))
                    .andExpect(jsonPath("$.expenseCount").value(2))
                    .andExpect(jsonPath("$.categoryBreakdown").exists());
        }
    }

    @Nested
    @DisplayName("Payment Method Tests")
    class PaymentMethodTests {

        @Test
        @DisplayName("Should handle different payment methods")
        void testDifferentPaymentMethods() throws Exception {
            for (PaymentMethod method : PaymentMethod.values()) {
                Expense expense = new Expense();
                expense.setDescription("Test " + method);
                expense.setAmount(new BigDecimal("10.00"));
                expense.setDate(LocalDate.now());
                expense.setUser(testUser);
                expense.setPaymentMethod(method);

                mockMvc.perform(post("/api/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(expense)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.paymentMethod").value(method.toString()));
            }

            List<Expense> expenses = expenseRepository.findAll();
            assertEquals(PaymentMethod.values().length, expenses.size());
        }
    }

    @Nested
    @DisplayName("Concurrent Access Tests")
    class ConcurrentAccessTests {

        @Test
        @DisplayName("Should handle concurrent expense creation")
        void testConcurrentExpenseCreation() throws Exception {
            int threadCount = 5;
            Thread[] threads = new Thread[threadCount];
            
            for (int i = 0; i < threadCount; i++) {
                final int index = i;
                threads[i] = new Thread(() -> {
                    try {
                        Expense expense = new Expense();
                        expense.setDescription("Concurrent expense " + index);
                        expense.setAmount(new BigDecimal("10.00"));
                        expense.setDate(LocalDate.now());
                        expense.setUser(testUser);

                        mockMvc.perform(post("/api/expenses")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(expense)))
                                .andExpect(status().isOk());
                    } catch (Exception e) {
                        fail("Concurrent creation failed: " + e.getMessage());
                    }
                });
                threads[i].start();
            }

            for (Thread thread : threads) {
                thread.join();
            }

            List<Expense> expenses = expenseRepository.findAll();
            assertEquals(threadCount, expenses.size());
        }
    }

    @Nested
    @DisplayName("Data Integrity Tests")
    class DataIntegrityTests {

        @Test
        @DisplayName("Should maintain referential integrity with category")
        void testCategoryReferentialIntegrity() throws Exception {
            Expense saved = expenseRepository.save(testExpense);
            assertNotNull(saved.getCategory());
            
            // Verify category relationship is maintained
            Expense retrieved = expenseRepository.findById(saved.getId()).orElseThrow();
            assertEquals(testCategory.getId(), retrieved.getCategory().getId());
            assertEquals(testCategory.getName(), retrieved.getCategory().getName());
        }

        @Test
        @DisplayName("Should maintain user relationship")
        void testUserRelationship() throws Exception {
            Expense saved = expenseRepository.save(testExpense);
            
            List<Expense> userExpenses = expenseRepository.findByUserId(testUser.getId());
            assertEquals(1, userExpenses.size());
            assertEquals(saved.getId(), userExpenses.get(0).getId());
        }

        @Test
        @DisplayName("Should handle cascade operations correctly")
        void testCascadeOperations() throws Exception {
            Expense saved = expenseRepository.save(testExpense);
            
            // Deleting expense should not delete category or user
            expenseRepository.delete(saved);
            
            assertTrue(categoryRepository.existsById(testCategory.getId()));
            assertTrue(userRepository.existsById(testUser.getId()));
        }
    }
}
