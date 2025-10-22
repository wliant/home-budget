package sg.wlian.addonapp.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import sg.wlian.addonapp.dto.CategoryTreeDTO;
import sg.wlian.addonapp.entity.Category;
import sg.wlian.addonapp.entity.User;
import sg.wlian.addonapp.repository.CategoryRepository;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryService Tests")
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private User testUser;
    private Category parentCategory;
    private Category childCategory1;
    private Category childCategory2;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        parentCategory = new Category();
        parentCategory.setId(1L);
        parentCategory.setName("Food & Dining");
        parentCategory.setDescription("All food related expenses");
        parentCategory.setColor("#FF5733");
        parentCategory.setUser(testUser);

        childCategory1 = new Category();
        childCategory1.setId(2L);
        childCategory1.setName("Groceries");
        childCategory1.setDescription("Grocery shopping");
        childCategory1.setColor("#33FF57");
        childCategory1.setUser(testUser);
        childCategory1.setParentCategory(parentCategory);

        childCategory2 = new Category();
        childCategory2.setId(3L);
        childCategory2.setName("Restaurants");
        childCategory2.setDescription("Dining out");
        childCategory2.setColor("#3357FF");
        childCategory2.setUser(testUser);
        childCategory2.setParentCategory(parentCategory);
    }

    @Nested
    @DisplayName("Create Category Tests")
    class CreateCategoryTests {

        @Test
        @DisplayName("Should create category successfully")
        void testCreateCategory_Success() {
            when(categoryRepository.save(any(Category.class))).thenReturn(parentCategory);

            Category created = categoryService.createCategory(parentCategory);

            assertNotNull(created);
            assertEquals(parentCategory.getName(), created.getName());
            assertEquals(parentCategory.getColor(), created.getColor());
            verify(categoryRepository, times(1)).save(parentCategory);
        }

        @Test
        @DisplayName("Should create child category with parent")
        void testCreateChildCategory_Success() {
            when(categoryRepository.save(any(Category.class))).thenReturn(childCategory1);

            Category created = categoryService.createCategory(childCategory1);

            assertNotNull(created);
            assertEquals(childCategory1.getName(), created.getName());
            assertEquals(parentCategory, created.getParentCategory());
            verify(categoryRepository, times(1)).save(childCategory1);
        }

        @Test
        @DisplayName("Should handle null category creation")
        void testCreateCategory_NullInput() {
            assertThrows(IllegalArgumentException.class, () -> {
                categoryService.createCategory(null);
            });
            verify(categoryRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Update Category Tests")
    class UpdateCategoryTests {

        @Test
        @DisplayName("Should update category successfully")
        void testUpdateCategory_Success() {
            Long categoryId = 1L;
            Category updatedDetails = new Category();
            updatedDetails.setName("Updated Food");
            updatedDetails.setDescription("Updated description");
            updatedDetails.setColor("#FF0000");

            when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(parentCategory));
            when(categoryRepository.save(any(Category.class))).thenReturn(parentCategory);

            Category updated = categoryService.updateCategory(categoryId, updatedDetails);

            assertNotNull(updated);
            assertEquals(updatedDetails.getName(), parentCategory.getName());
            assertEquals(updatedDetails.getDescription(), parentCategory.getDescription());
            assertEquals(updatedDetails.getColor(), parentCategory.getColor());
            verify(categoryRepository, times(1)).findById(categoryId);
            verify(categoryRepository, times(1)).save(parentCategory);
        }

        @Test
        @DisplayName("Should throw exception when category not found")
        void testUpdateCategory_NotFound() {
            Long categoryId = 999L;
            when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> {
                categoryService.updateCategory(categoryId, new Category());
            });
            verify(categoryRepository, times(1)).findById(categoryId);
            verify(categoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should update parent category relationship")
        void testUpdateCategory_ChangeParent() {
            Long categoryId = 2L;
            Category newParent = new Category();
            newParent.setId(4L);
            newParent.setName("New Parent");

            Category updatedDetails = new Category();
            updatedDetails.setParentCategory(newParent);

            when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(childCategory1));
            when(categoryRepository.save(any(Category.class))).thenReturn(childCategory1);

            Category updated = categoryService.updateCategory(categoryId, updatedDetails);

            assertNotNull(updated);
            assertEquals(newParent, childCategory1.getParentCategory());
            verify(categoryRepository, times(1)).save(childCategory1);
        }
    }

    @Nested
    @DisplayName("Delete Category Tests")
    class DeleteCategoryTests {

        @Test
        @DisplayName("Should delete category successfully")
        void testDeleteCategory_Success() {
            Long categoryId = 1L;
            doNothing().when(categoryRepository).deleteById(categoryId);

            categoryService.deleteCategory(categoryId);

            verify(categoryRepository, times(1)).deleteById(categoryId);
        }

        @Test
        @DisplayName("Should handle deletion of non-existent category")
        void testDeleteCategory_NotFound() {
            Long categoryId = 999L;
            doThrow(new RuntimeException("Category not found")).when(categoryRepository).deleteById(categoryId);

            assertThrows(RuntimeException.class, () -> {
                categoryService.deleteCategory(categoryId);
            });
            verify(categoryRepository, times(1)).deleteById(categoryId);
        }
    }

    @Nested
    @DisplayName("Retrieve Category Tests")
    class RetrieveCategoryTests {

        @Test
        @DisplayName("Should get all categories by user")
        void testGetCategoriesByUser_Success() {
            List<Category> categories = Arrays.asList(parentCategory, childCategory1, childCategory2);
            when(categoryRepository.findByUserId(1L)).thenReturn(categories);

            List<Category> result = categoryService.getCategoriesByUser(1L);

            assertNotNull(result);
            assertEquals(3, result.size());
            assertTrue(result.contains(parentCategory));
            assertTrue(result.contains(childCategory1));
            verify(categoryRepository, times(1)).findByUserId(1L);
        }

        @Test
        @DisplayName("Should return empty list when user has no categories")
        void testGetCategoriesByUser_EmptyList() {
            when(categoryRepository.findByUserId(1L)).thenReturn(Collections.emptyList());

            List<Category> result = categoryService.getCategoriesByUser(1L);

            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(categoryRepository, times(1)).findByUserId(1L);
        }

        @Test
        @DisplayName("Should get category by id")
        void testGetCategoryById_Success() {
            when(categoryRepository.findById(1L)).thenReturn(Optional.of(parentCategory));

            Optional<Category> result = categoryService.getCategoryById(1L);

            assertTrue(result.isPresent());
            assertEquals(parentCategory, result.get());
            verify(categoryRepository, times(1)).findById(1L);
        }

        @Test
        @DisplayName("Should return empty optional for non-existent category")
        void testGetCategoryById_NotFound() {
            when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

            Optional<Category> result = categoryService.getCategoryById(999L);

            assertFalse(result.isPresent());
            verify(categoryRepository, times(1)).findById(999L);
        }
    }

    @Nested
    @DisplayName("Category Tree Tests")
    class CategoryTreeTests {

        @Test
        @DisplayName("Should build category tree successfully")
        void testGetCategoryTree_Success() {
            parentCategory.setChildCategories(Arrays.asList(childCategory1, childCategory2));
            List<Category> rootCategories = Arrays.asList(parentCategory);
            
            when(categoryRepository.findByUserIdAndParentCategoryIsNull(1L)).thenReturn(rootCategories);

            List<CategoryTreeDTO> tree = categoryService.getCategoryTree(1L);

            assertNotNull(tree);
            assertEquals(1, tree.size());
            
            CategoryTreeDTO rootDto = tree.get(0);
            assertEquals(parentCategory.getId(), rootDto.getId());
            assertEquals(parentCategory.getName(), rootDto.getName());
            assertNotNull(rootDto.getChildren());
            assertEquals(2, rootDto.getChildren().size());
            
            verify(categoryRepository, times(1)).findByUserIdAndParentCategoryIsNull(1L);
        }

        @Test
        @DisplayName("Should handle empty category tree")
        void testGetCategoryTree_Empty() {
            when(categoryRepository.findByUserIdAndParentCategoryIsNull(1L))
                    .thenReturn(Collections.emptyList());

            List<CategoryTreeDTO> tree = categoryService.getCategoryTree(1L);

            assertNotNull(tree);
            assertTrue(tree.isEmpty());
            verify(categoryRepository, times(1)).findByUserIdAndParentCategoryIsNull(1L);
        }

        @Test
        @DisplayName("Should build nested category tree")
        void testGetCategoryTree_NestedCategories() {
            Category subChildCategory = new Category();
            subChildCategory.setId(4L);
            subChildCategory.setName("Fast Food");
            subChildCategory.setParentCategory(childCategory2);
            
            childCategory2.setChildCategories(Arrays.asList(subChildCategory));
            parentCategory.setChildCategories(Arrays.asList(childCategory1, childCategory2));
            
            when(categoryRepository.findByUserIdAndParentCategoryIsNull(1L))
                    .thenReturn(Arrays.asList(parentCategory));

            List<CategoryTreeDTO> tree = categoryService.getCategoryTree(1L);

            assertNotNull(tree);
            assertEquals(1, tree.size());
            
            CategoryTreeDTO rootDto = tree.get(0);
            assertEquals(2, rootDto.getChildren().size());
            
            CategoryTreeDTO restaurantDto = rootDto.getChildren().stream()
                    .filter(c -> c.getName().equals("Restaurants"))
                    .findFirst()
                    .orElse(null);
            
            assertNotNull(restaurantDto);
            assertNotNull(restaurantDto.getChildren());
            assertEquals(1, restaurantDto.getChildren().size());
            assertEquals("Fast Food", restaurantDto.getChildren().get(0).getName());
        }
    }

    @Nested
    @DisplayName("Category Validation Tests")
    class CategoryValidationTests {

        @Test
        @DisplayName("Should validate category name length")
        void testValidateCategoryName() {
            Category category = new Category();
            category.setName("");
            
            assertThrows(IllegalArgumentException.class, () -> {
                categoryService.validateCategory(category);
            });
        }

        @Test
        @DisplayName("Should validate category color format")
        void testValidateCategoryColor() {
            Category category = new Category();
            category.setName("Valid Name");
            category.setColor("invalid-color");
            
            assertThrows(IllegalArgumentException.class, () -> {
                categoryService.validateCategory(category);
            });
        }

        @Test
        @DisplayName("Should not allow circular parent reference")
        void testValidateCircularReference() {
            parentCategory.setParentCategory(childCategory1);
            childCategory1.setParentCategory(parentCategory);
            
            assertThrows(IllegalArgumentException.class, () -> {
                categoryService.validateCategoryHierarchy(childCategory1);
            });
        }
    }

    @Nested
    @DisplayName("Category Statistics Tests")
    class CategoryStatisticsTests {

        @Test
        @DisplayName("Should count categories by user")
        void testCountCategoriesByUser() {
            when(categoryRepository.countByUserId(1L)).thenReturn(5L);

            long count = categoryService.countCategoriesByUser(1L);

            assertEquals(5L, count);
            verify(categoryRepository, times(1)).countByUserId(1L);
        }

        @Test
        @DisplayName("Should get categories by parent")
        void testGetCategoriesByParent() {
            when(categoryRepository.findByParentCategoryId(1L))
                    .thenReturn(Arrays.asList(childCategory1, childCategory2));

            List<Category> children = categoryService.getCategoriesByParent(1L);

            assertNotNull(children);
            assertEquals(2, children.size());
            assertTrue(children.contains(childCategory1));
            assertTrue(children.contains(childCategory2));
            verify(categoryRepository, times(1)).findByParentCategoryId(1L);
        }

        @Test
        @DisplayName("Should check if category has children")
        void testHasChildren() {
            when(categoryRepository.existsByParentCategoryId(1L)).thenReturn(true);
            when(categoryRepository.existsByParentCategoryId(2L)).thenReturn(false);

            assertTrue(categoryService.hasChildren(1L));
            assertFalse(categoryService.hasChildren(2L));
            
            verify(categoryRepository, times(1)).existsByParentCategoryId(1L);
            verify(categoryRepository, times(1)).existsByParentCategoryId(2L);
        }
    }
}
