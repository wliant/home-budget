package sg.wlian.addonapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import sg.wlian.addonapp.entity.Category;

import java.util.List;

@RepositoryRestResource
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findByUserId(Long userId);
    
    List<Category> findByUserIdAndParentCategoryIsNull(Long userId);
    
    List<Category> findByParentCategoryId(Long parentCategoryId);
    
    @Query("SELECT c FROM Category c WHERE c.user.id = :userId AND c.isActive = true")
    List<Category> findActiveCategoriesByUserId(@Param("userId") Long userId);
    
    @Query("SELECT c FROM Category c WHERE c.user.id = :userId AND c.parentCategory IS NULL AND c.isActive = true")
    List<Category> findActiveRootCategoriesByUserId(@Param("userId") Long userId);
}
