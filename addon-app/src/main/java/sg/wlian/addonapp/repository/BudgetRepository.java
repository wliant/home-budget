package sg.wlian.addonapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import sg.wlian.addonapp.entity.Budget;
import sg.wlian.addonapp.entity.Category;
import sg.wlian.addonapp.entity.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RepositoryRestResource(collectionResourceRel = "budgets", path = "budgets")
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    
    List<Budget> findByUser(User user);
    
    List<Budget> findByUserAndActiveTrue(User user);
    
    Optional<Budget> findByUserAndCategory(User user, Category category);
    
    @Query("SELECT b FROM Budget b WHERE b.user = :user AND b.period.startDate <= :date AND b.period.endDate >= :date")
    List<Budget> findActiveBudgetsForUserAndDate(@Param("user") User user, @Param("date") LocalDate date);
    
    List<Budget> findByUserAndCategoryAndActiveTrue(User user, Category category);
}
