package sg.wlian.addonapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sg.wlian.addonapp.dto.BudgetStatusDTO;
import sg.wlian.addonapp.entity.Budget;
import sg.wlian.addonapp.entity.Category;
import sg.wlian.addonapp.entity.User;
import sg.wlian.addonapp.repository.BudgetRepository;
import sg.wlian.addonapp.repository.ExpenseRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public Budget createBudget(Budget budget) {
        // Check if budget already exists for this user and category
        Optional<Budget> existingBudget = budgetRepository.findByUserAndCategory(
                budget.getUser(), budget.getCategory());
        
        if (existingBudget.isPresent() && existingBudget.get().isActive()) {
            throw new RuntimeException("Active budget already exists for this category");
        }
        
        return budgetRepository.save(budget);
    }

    public Budget updateBudget(Long id, Budget budgetDetails) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));
        
        budget.setAmount(budgetDetails.getAmount());
        budget.setName(budgetDetails.getName());
        budget.setDescription(budgetDetails.getDescription());
        budget.setPeriod(budgetDetails.getPeriod());
        budget.setBudgetType(budgetDetails.getBudgetType());
        budget.setActive(budgetDetails.isActive());
        
        return budgetRepository.save(budget);
    }

    public void deleteBudget(Long id) {
        budgetRepository.deleteById(id);
    }

    public List<Budget> getBudgetsByUser(User user) {
        return budgetRepository.findByUser(user);
    }

    public List<Budget> getActiveBudgetsByUser(User user) {
        return budgetRepository.findByUserAndActiveTrue(user);
    }

    public BudgetStatusDTO getBudgetStatus(Budget budget) {
        LocalDate startDate = budget.getPeriod().getStartDate();
        LocalDate endDate = budget.getPeriod().getEndDate();
        
        BigDecimal totalExpenses = expenseRepository.getTotalExpensesByUserCategoryAndDateRange(
                budget.getUser(), budget.getCategory(), startDate, endDate);
        
        if (totalExpenses == null) {
            totalExpenses = BigDecimal.ZERO;
        }
        
        BigDecimal remaining = budget.getAmount().subtract(totalExpenses);
        BigDecimal percentageUsed = BigDecimal.ZERO;
        
        if (budget.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentageUsed = totalExpenses.divide(budget.getAmount(), 2, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100));
        }
        
        boolean isOverBudget = remaining.compareTo(BigDecimal.ZERO) < 0;
        
        return new BudgetStatusDTO(
                budget,
                totalExpenses,
                remaining,
                percentageUsed,
                isOverBudget
        );
    }

    public List<BudgetStatusDTO> getAllBudgetStatuses(User user) {
        List<Budget> activeBudgets = getActiveBudgetsByUser(user);
        List<BudgetStatusDTO> statuses = new ArrayList<>();
        
        for (Budget budget : activeBudgets) {
            statuses.add(getBudgetStatus(budget));
        }
        
        return statuses;
    }

    public List<Budget> getBudgetsForDate(User user, LocalDate date) {
        return budgetRepository.findActiveBudgetsForUserAndDate(user, date);
    }

    public void checkBudgetAlerts(User user) {
        List<BudgetStatusDTO> statuses = getAllBudgetStatuses(user);
        
        for (BudgetStatusDTO status : statuses) {
            if (status.isOverBudget()) {
                // Send alert for over budget
                sendBudgetAlert(user, status, "OVER_BUDGET");
            } else if (status.getPercentageUsed().compareTo(new BigDecimal(80)) >= 0) {
                // Send alert for approaching budget limit (80% used)
                sendBudgetAlert(user, status, "APPROACHING_LIMIT");
            }
        }
    }

    private void sendBudgetAlert(User user, BudgetStatusDTO status, String alertType) {
        // Implementation for sending alerts (email, push notification, etc.)
        // This would integrate with a notification service
        System.out.println("Budget Alert for " + user.getEmail() + ": " + 
                alertType + " for budget " + status.getBudget().getName());
    }
    
    public void validateBudgetAmount(Budget budget) {
        if (budget.getAmount() == null || budget.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Budget amount must be greater than zero");
        }
    }
}
