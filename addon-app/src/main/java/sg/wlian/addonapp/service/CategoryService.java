package sg.wlian.addonapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sg.wlian.addonapp.entity.Category;
import sg.wlian.addonapp.entity.User;
import sg.wlian.addonapp.repository.CategoryRepository;
import sg.wlian.addonapp.dto.CategoryTreeDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<Category> getAllCategoriesByUser(Long userId) {
        return categoryRepository.findByUserId(userId);
    }
    
    public List<Category> getRootCategoriesByUser(Long userId) {
        return categoryRepository.findByUserIdAndParentCategoryIsNull(userId);
    }
    
    public Category createCategory(Category category) {
        if (category.getBudgetAmount() == null) {
            category.setBudgetAmount(BigDecimal.ZERO);
        }
        if (category.getIsActive() == null) {
            category.setIsActive(true);
        }
        return categoryRepository.save(category);
    }
    
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setColor(categoryDetails.getColor());
        category.setIcon(categoryDetails.getIcon());
        category.setBudgetAmount(categoryDetails.getBudgetAmount());
        category.setIsActive(categoryDetails.getIsActive());
        
        if (categoryDetails.getParentCategory() != null) {
            category.setParentCategory(categoryDetails.getParentCategory());
        }
        
        return categoryRepository.save(category);
    }
    
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
    
    public BigDecimal getTotalBudgetForCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        BigDecimal total = category.getBudgetAmount() != null ? category.getBudgetAmount() : BigDecimal.ZERO;
        
        // Add budgets from all child categories
        if (category.getChildCategories() != null) {
            for (Category child : category.getChildCategories()) {
                total = total.add(getTotalBudgetForCategory(child.getId()));
            }
        }
        
        return total;
    }
    
    public List<CategoryTreeDTO> getCategoryTree(Long userId) {
        List<Category> rootCategories = getRootCategoriesByUser(userId);
        return rootCategories.stream()
            .map(this::buildCategoryTree)
            .collect(Collectors.toList());
    }
    
    private CategoryTreeDTO buildCategoryTree(Category category) {
        CategoryTreeDTO dto = new CategoryTreeDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setColor(category.getColor());
        dto.setIcon(category.getIcon());
        dto.setBudgetAmount(category.getBudgetAmount());
        dto.setIsActive(category.getIsActive());
        
        if (category.getChildCategories() != null && !category.getChildCategories().isEmpty()) {
            dto.setChildren(
                category.getChildCategories().stream()
                    .map(this::buildCategoryTree)
                    .collect(Collectors.toList())
            );
        }
        
        return dto;
    }
    
    public long countCategoriesByUser(Long userId) {
        return categoryRepository.countByUserId(userId);
    }
    
    public List<Category> getCategoriesByParent(Long parentCategoryId) {
        return categoryRepository.findByParentCategoryId(parentCategoryId);
    }
    
    public boolean hasChildren(Long categoryId) {
        return categoryRepository.existsByParentCategoryId(categoryId);
    }
    
    public void validateCategoryHierarchy(Category category) {
        // Prevent circular references
        if (category.getParentCategory() != null) {
            Category parent = category.getParentCategory();
            while (parent != null) {
                if (parent.getId().equals(category.getId())) {
                    throw new RuntimeException("Circular reference detected in category hierarchy");
                }
                parent = parent.getParentCategory();
            }
        }
    }
    
    public List<Category> getCategoriesByUser(Long userId) {
        return categoryRepository.findByUserId(userId);
    }
    
    public java.util.Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }
    
    public void validateCategory(Category category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }
        if (category.getUser() == null) {
            throw new IllegalArgumentException("Category must have a user");
        }
    }
}
