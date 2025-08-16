package sg.wlian.addonapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import sg.wlian.addonapp.entity.Category;
import sg.wlian.addonapp.entity.Expense;
import sg.wlian.addonapp.entity.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RepositoryRestResource(collectionResourceRel = "expenses", path = "expenses")
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findByUser(User user);
    
    List<Expense> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);
    
    List<Expense> findByUserAndCategory(User user, Category category);
    
    List<Expense> findByUserAndCategoryAndDateBetween(User user, Category category, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.date BETWEEN :startDate AND :endDate")
    BigDecimal getTotalExpensesByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.category = :category AND e.date BETWEEN :startDate AND :endDate")
    BigDecimal getTotalExpensesByUserCategoryAndDateRange(@Param("user") User user, @Param("category") Category category, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    List<Expense> findByUserAndIsRecurringTrue(User user);
    
    List<Expense> findByUserId(Long userId);
    
    List<Expense> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    
    List<Expense> findByUserIdAndCategoryId(Long userId, Long categoryId);
    
    List<Expense> findByIsRecurringTrue();
}
