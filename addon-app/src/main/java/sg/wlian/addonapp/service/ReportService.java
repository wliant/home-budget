package sg.wlian.addonapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sg.wlian.addonapp.dto.CategoryReportDTO;
import sg.wlian.addonapp.dto.MonthlyReportDTO;
import sg.wlian.addonapp.dto.PaymentMethodReportDTO;
import sg.wlian.addonapp.entity.Category;
import sg.wlian.addonapp.entity.Expense;
import sg.wlian.addonapp.entity.PaymentMethod;
import sg.wlian.addonapp.entity.User;
import sg.wlian.addonapp.repository.ExpenseRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserService userService;

    public List<MonthlyReportDTO> getMonthlyTrend(Long userId, int months) {
        User user = userService.findById(userId);
        List<MonthlyReportDTO> report = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();

        for (int i = months - 1; i >= 0; i--) {
            YearMonth month = currentMonth.minusMonths(i);
            LocalDate startDate = month.atDay(1);
            LocalDate endDate = month.atEndOfMonth();

            List<Expense> expenses = expenseRepository.findByUserAndDateBetween(user, startDate, endDate);
            BigDecimal total = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            report.add(new MonthlyReportDTO(month, total, expenses.size()));
        }

        return report;
    }

    public List<CategoryReportDTO> getCategoryBreakdown(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = userService.findById(userId);
        List<Expense> expenses = expenseRepository.findByUserAndDateBetween(user, startDate, endDate);

        BigDecimal totalAmount = expenses.stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<Category, List<Expense>> categoryExpenses = expenses.stream()
            .filter(e -> e.getCategory() != null)
            .collect(Collectors.groupingBy(Expense::getCategory));

        List<CategoryReportDTO> report = new ArrayList<>();
        for (Map.Entry<Category, List<Expense>> entry : categoryExpenses.entrySet()) {
            Category category = entry.getKey();
            List<Expense> categoryExpenseList = entry.getValue();

            BigDecimal categoryTotal = categoryExpenseList.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            double percentage = totalAmount.compareTo(BigDecimal.ZERO) > 0
                ? categoryTotal.divide(totalAmount, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

            report.add(new CategoryReportDTO(
                category.getName(),
                categoryTotal,
                categoryExpenseList.size(),
                percentage
            ));
        }

        report.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));
        return report;
    }

    public List<PaymentMethodReportDTO> getPaymentMethodBreakdown(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = userService.findById(userId);
        List<Expense> expenses = expenseRepository.findByUserAndDateBetween(user, startDate, endDate);

        BigDecimal totalAmount = expenses.stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<PaymentMethod, List<Expense>> paymentMethodExpenses = expenses.stream()
            .filter(e -> e.getPaymentMethod() != null)
            .collect(Collectors.groupingBy(Expense::getPaymentMethod));

        List<PaymentMethodReportDTO> report = new ArrayList<>();
        for (Map.Entry<PaymentMethod, List<Expense>> entry : paymentMethodExpenses.entrySet()) {
            PaymentMethod paymentMethod = entry.getKey();
            List<Expense> pmExpenses = entry.getValue();

            BigDecimal pmTotal = pmExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            double percentage = totalAmount.compareTo(BigDecimal.ZERO) > 0
                ? pmTotal.divide(totalAmount, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

            report.add(new PaymentMethodReportDTO(
                paymentMethod,
                pmTotal,
                pmExpenses.size(),
                percentage
            ));
        }

        report.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));
        return report;
    }

    public Map<String, Object> getWeeklyTrend(Long userId, int weeks) {
        User user = userService.findById(userId);
        List<Map<String, Object>> weeklyData = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = weeks - 1; i >= 0; i--) {
            LocalDate weekStart = today.minusWeeks(i).with(java.time.DayOfWeek.MONDAY);
            LocalDate weekEnd = weekStart.plusDays(6);

            List<Expense> expenses = expenseRepository.findByUserAndDateBetween(user, weekStart, weekEnd);
            BigDecimal total = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> weekData = new HashMap<>();
            weekData.put("week", "Week " + (weeks - i));
            weekData.put("amount", total);
            weekData.put("count", expenses.size());
            weekData.put("startDate", weekStart);
            weekData.put("endDate", weekEnd);

            weeklyData.add(weekData);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("data", weeklyData);
        return result;
    }
}
