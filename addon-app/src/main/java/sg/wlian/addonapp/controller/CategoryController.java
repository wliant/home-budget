package sg.wlian.addonapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sg.wlian.addonapp.entity.Category;
import sg.wlian.addonapp.service.CategoryService;
import sg.wlian.addonapp.dto.CategoryTreeDTO;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Category>> getCategoriesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(categoryService.getAllCategoriesByUser(userId));
    }
    
    @GetMapping("/user/{userId}/tree")
    public ResponseEntity<List<CategoryTreeDTO>> getCategoryTree(@PathVariable Long userId) {
        return ResponseEntity.ok(categoryService.getCategoryTree(userId));
    }
    
    @GetMapping("/user/{userId}/root")
    public ResponseEntity<List<Category>> getRootCategories(@PathVariable Long userId) {
        return ResponseEntity.ok(categoryService.getRootCategoriesByUser(userId));
    }
    
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/total-budget")
    public ResponseEntity<BigDecimal> getTotalBudget(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getTotalBudgetForCategory(id));
    }
}
