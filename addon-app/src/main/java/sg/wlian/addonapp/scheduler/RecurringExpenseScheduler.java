package sg.wlian.addonapp.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import sg.wlian.addonapp.service.ExpenseService;

@Component
public class RecurringExpenseScheduler {

    @Autowired
    private ExpenseService expenseService;

    // Run every day at 1:00 AM
    @Scheduled(cron = "0 0 1 * * ?")
    public void processRecurringExpenses() {
        System.out.println("Running scheduled task: Processing recurring expenses");
        expenseService.processRecurringExpenses();
        System.out.println("Completed processing recurring expenses");
    }

    // Alternative: Run every hour for testing
    // @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void processRecurringExpensesHourly() {
        System.out.println("Running hourly task: Processing recurring expenses");
        expenseService.processRecurringExpenses();
        System.out.println("Completed processing recurring expenses");
    }
}
