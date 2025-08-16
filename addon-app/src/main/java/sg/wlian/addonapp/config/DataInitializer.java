package sg.wlian.addonapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import sg.wlian.addonapp.entity.*;
import sg.wlian.addonapp.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
@Profile("dev")
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            ExpenseRepository expenseRepository,
            BudgetRepository budgetRepository) {
        
        return args -> {
            // Check if data already exists
            if (userRepository.count() > 0) {
                System.out.println("Data already initialized, skipping...");
                return;
            }
            
            System.out.println("Initializing test data...");
            
            // Create a test user if not exists
            User testUser = userRepository.findByUsername("testuser").orElseGet(() -> {
                User user = new User();
                user.setUsername("testuser");
                user.setEmail("test@example.com");
                user.setPassword("password123");
                user.setFirstName("Test");
                user.setLastName("User");
                user.setActive(true);
                user.setCreatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());
                return userRepository.save(user);
            });
            
            // Create root categories
            Category transportation = new Category();
            transportation.setName("Transportation");
            transportation.setDescription("All transportation expenses");
            transportation.setColor("#4CAF50");
            transportation.setIcon("🚗");
            transportation.setBudgetAmount(new BigDecimal("500.00"));
            transportation.setIsActive(true);
            transportation.setUser(testUser);
            transportation = categoryRepository.save(transportation);
            
            Category food = new Category();
            food.setName("Food & Dining");
            food.setDescription("Food and dining expenses");
            food.setColor("#FF9800");
            food.setIcon("🍔");
            food.setBudgetAmount(new BigDecimal("1000.00"));
            food.setIsActive(true);
            food.setUser(testUser);
            food = categoryRepository.save(food);
            
            Category utilities = new Category();
            utilities.setName("Utilities");
            utilities.setDescription("Utility bills");
            utilities.setColor("#2196F3");
            utilities.setIcon("💡");
            utilities.setBudgetAmount(new BigDecimal("300.00"));
            utilities.setIsActive(true);
            utilities.setUser(testUser);
            utilities = categoryRepository.save(utilities);
            
            Category entertainment = new Category();
            entertainment.setName("Entertainment");
            entertainment.setDescription("Entertainment and leisure");
            entertainment.setColor("#9C27B0");
            entertainment.setIcon("🎮");
            entertainment.setBudgetAmount(new BigDecimal("400.00"));
            entertainment.setIsActive(true);
            entertainment.setUser(testUser);
            entertainment = categoryRepository.save(entertainment);
            
            Category healthcare = new Category();
            healthcare.setName("Healthcare");
            healthcare.setDescription("Medical and health expenses");
            healthcare.setColor("#F44336");
            healthcare.setIcon("🏥");
            healthcare.setBudgetAmount(new BigDecimal("200.00"));
            healthcare.setIsActive(true);
            healthcare.setUser(testUser);
            healthcare = categoryRepository.save(healthcare);
            
            // Create subcategories for Transportation
            Category taxi = new Category();
            taxi.setName("Taxi/Uber");
            taxi.setDescription("Taxi and ride-sharing");
            taxi.setColor("#66BB6A");
            taxi.setIcon("🚕");
            taxi.setBudgetAmount(new BigDecimal("200.00"));
            taxi.setIsActive(true);
            taxi.setUser(testUser);
            taxi.setParentCategory(transportation);
            categoryRepository.save(taxi);
            
            Category publicTransport = new Category();
            publicTransport.setName("Public Transport");
            publicTransport.setDescription("Bus and MRT");
            publicTransport.setColor("#4CAF50");
            publicTransport.setIcon("🚌");
            publicTransport.setBudgetAmount(new BigDecimal("150.00"));
            publicTransport.setIsActive(true);
            publicTransport.setUser(testUser);
            publicTransport.setParentCategory(transportation);
            categoryRepository.save(publicTransport);
            
            Category fuel = new Category();
            fuel.setName("Fuel");
            fuel.setDescription("Petrol and gas");
            fuel.setColor("#388E3C");
            fuel.setIcon("⛽");
            fuel.setBudgetAmount(new BigDecimal("150.00"));
            fuel.setIsActive(true);
            fuel.setUser(testUser);
            fuel.setParentCategory(transportation);
            categoryRepository.save(fuel);
            
            // Create subcategories for Food
            Category groceries = new Category();
            groceries.setName("Groceries");
            groceries.setDescription("Grocery shopping");
            groceries.setColor("#FFB74D");
            groceries.setIcon("🛒");
            groceries.setBudgetAmount(new BigDecimal("600.00"));
            groceries.setIsActive(true);
            groceries.setUser(testUser);
            groceries.setParentCategory(food);
            categoryRepository.save(groceries);
            
            Category restaurants = new Category();
            restaurants.setName("Restaurants");
            restaurants.setDescription("Dining out");
            restaurants.setColor("#FF9800");
            restaurants.setIcon("🍽️");
            restaurants.setBudgetAmount(new BigDecimal("400.00"));
            restaurants.setIsActive(true);
            restaurants.setUser(testUser);
            restaurants.setParentCategory(food);
            categoryRepository.save(restaurants);
            
            // Create some sample expenses
            LocalDate now = LocalDate.now();
            
            // Transportation expenses
            createExpense(expenseRepository, "Taxi to office", new BigDecimal("25.50"), 
                    now.minusDays(1), taxi, testUser, PaymentMethod.CREDIT_CARD, "Morning commute");
            
            createExpense(expenseRepository, "MRT card top-up", new BigDecimal("50.00"), 
                    now.minusDays(2), publicTransport, testUser, PaymentMethod.DEBIT_CARD, "Monthly top-up");
            
            createExpense(expenseRepository, "Petrol", new BigDecimal("80.00"), 
                    now.minusDays(3), fuel, testUser, PaymentMethod.CREDIT_CARD, "Full tank");
            
            // Food expenses
            createExpense(expenseRepository, "NTUC groceries", new BigDecimal("120.50"), 
                    now.minusDays(1), groceries, testUser, PaymentMethod.DEBIT_CARD, "Weekly shopping");
            
            createExpense(expenseRepository, "Lunch at hawker", new BigDecimal("8.50"), 
                    now, restaurants, testUser, PaymentMethod.CASH, "Chicken rice");
            
            createExpense(expenseRepository, "Dinner with friends", new BigDecimal("45.00"), 
                    now.minusDays(2), restaurants, testUser, PaymentMethod.CREDIT_CARD, "Birthday celebration");
            
            // Utilities expenses
            createExpense(expenseRepository, "Electricity bill", new BigDecimal("120.00"), 
                    now.minusDays(5), utilities, testUser, PaymentMethod.BANK_TRANSFER, "Monthly bill");
            
            createExpense(expenseRepository, "Internet bill", new BigDecimal("49.90"), 
                    now.minusDays(5), utilities, testUser, PaymentMethod.BANK_TRANSFER, "Monthly subscription");
            
            // Entertainment expenses
            createExpense(expenseRepository, "Netflix subscription", new BigDecimal("19.98"), 
                    now.minusDays(10), entertainment, testUser, PaymentMethod.CREDIT_CARD, "Monthly subscription");
            
            createExpense(expenseRepository, "Movie tickets", new BigDecimal("26.00"), 
                    now.minusDays(4), entertainment, testUser, PaymentMethod.CREDIT_CARD, "Weekend movie");
            
            // Healthcare expenses
            createExpense(expenseRepository, "Doctor visit", new BigDecimal("45.00"), 
                    now.minusDays(7), healthcare, testUser, PaymentMethod.CASH, "General checkup");
            
            createExpense(expenseRepository, "Pharmacy", new BigDecimal("23.50"), 
                    now.minusDays(7), healthcare, testUser, PaymentMethod.CASH, "Medicine");
            
            // Create budgets for the current month
            TimePeriod currentMonth = new TimePeriod();
            currentMonth.setStartDate(now.withDayOfMonth(1));
            currentMonth.setEndDate(now.withDayOfMonth(now.lengthOfMonth()));
            
            List<Category> allCategories = Arrays.asList(
                transportation, food, utilities, entertainment, healthcare,
                taxi, publicTransport, fuel, groceries, restaurants
            );
            
            for (Category category : allCategories) {
                Budget budget = new Budget();
                budget.setName(category.getName() + " Budget");
                budget.setDescription("Monthly budget for " + category.getName());
                budget.setAmount(category.getBudgetAmount());
                budget.setCategory(category);
                budget.setUser(testUser);
                budget.setPeriod(currentMonth);
                budget.setActive(true);
                budget.setBudgetType(BudgetType.MONTHLY);
                budget.setCreatedAt(LocalDateTime.now());
                budget.setUpdatedAt(LocalDateTime.now());
                budgetRepository.save(budget);
            }
            
            System.out.println("Test data initialized successfully!");
            System.out.println("Created user: " + testUser.getUsername());
            System.out.println("Created " + categoryRepository.count() + " categories");
            System.out.println("Created " + expenseRepository.count() + " expenses");
            System.out.println("Created " + budgetRepository.count() + " budgets");
        };
    }
    
    private void createExpense(ExpenseRepository repository, String description, BigDecimal amount,
                               LocalDate date, Category category, User user, 
                               PaymentMethod paymentMethod, String notes) {
        Expense expense = new Expense();
        expense.setDescription(description);
        expense.setAmount(amount);
        expense.setDate(date);
        expense.setCategory(category);
        expense.setUser(user);
        expense.setPaymentMethod(paymentMethod);
        expense.setNotes(notes);
        expense.setRecurring(false);
        expense.setCreatedAt(LocalDateTime.now());
        expense.setUpdatedAt(LocalDateTime.now());
        repository.save(expense);
    }
}
