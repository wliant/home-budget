package sg.wlian.addonapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import sg.wlian.addonapp.entity.Expense;

@RepositoryRestResource
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
}
