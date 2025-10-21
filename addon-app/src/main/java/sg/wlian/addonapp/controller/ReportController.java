package sg.wlian.addonapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sg.wlian.addonapp.dto.CategoryReportDTO;
import sg.wlian.addonapp.dto.MonthlyReportDTO;
import sg.wlian.addonapp.dto.PaymentMethodReportDTO;
import sg.wlian.addonapp.service.ReportService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/user/{userId}/monthly-trend")
    public ResponseEntity<List<MonthlyReportDTO>> getMonthlyTrend(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "6") int months) {
        List<MonthlyReportDTO> report = reportService.getMonthlyTrend(userId, months);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/user/{userId}/category-breakdown")
    public ResponseEntity<List<CategoryReportDTO>> getCategoryBreakdown(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<CategoryReportDTO> report = reportService.getCategoryBreakdown(userId, startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/user/{userId}/payment-method-breakdown")
    public ResponseEntity<List<PaymentMethodReportDTO>> getPaymentMethodBreakdown(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<PaymentMethodReportDTO> report = reportService.getPaymentMethodBreakdown(userId, startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/user/{userId}/weekly-trend")
    public ResponseEntity<Map<String, Object>> getWeeklyTrend(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "4") int weeks) {
        Map<String, Object> report = reportService.getWeeklyTrend(userId, weeks);
        return ResponseEntity.ok(report);
    }
}
