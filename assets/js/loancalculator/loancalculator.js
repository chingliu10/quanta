export default class LoanScheduleCalculator {
    constructor(loanData) {
        this.principal = parseFloat(loanData.principalAmount);
        this.startDate = new Date(loanData.releaseDate);
        this.interestMethod = loanData.interestMethod;
        this.interestRate = parseFloat(loanData.interestRate);
        this.interestPeriod = loanData.interestPeriod;
        this.duration = parseInt(loanData.duration);
        this.durationType = loanData.durationType;
        this.repaymentCycle = loanData.repaymentCycle;
    }

    calculatePayments() {
        const principalPerPayment = this.principal / this.duration;
        let interestPerPayment;

        // Calculate interest per payment based on period
        if (this.interestPeriod === 'week') {
            // For weekly interest
            const totalInterest = this.principal * (this.interestRate / 100);
            interestPerPayment = totalInterest / this.duration;
        } else if (this.interestPeriod === 'month') {
            // For monthly interest (convert to weekly)
            const monthlyInterest = this.principal * (this.interestRate / 100);
            interestPerPayment = monthlyInterest / 4; // Divide by 4 for weekly payments
        }

        return { principalPerPayment, interestPerPayment };
    }

    generateSchedule() {
        const schedule = [];
        const { principalPerPayment, interestPerPayment } = this.calculatePayments();
        let remainingPrincipal = this.principal;
        let currentDate = new Date(this.startDate);

        for (let i = 0; i < this.duration; i++) {
            const principal = Number(principalPerPayment.toFixed(2));
            const interest = Number(interestPerPayment.toFixed(2));
            const fees = i === 0 ? 27000 : 0; // Initial fees for first payment
            const due = principal + interest + fees;

            remainingPrincipal -= principal;

            // Create payment object
            schedule.push({
                paymentNo: i + 1,
                date: currentDate.toISOString().split('T')[0],
                description: "Repayment",
                principal: principal.toFixed(2),
                interest: interest.toFixed(2),
                fees: fees.toFixed(2),
                penalty: "0.00",
                due: due.toFixed(2),
                balance: Math.max(0, remainingPrincipal).toFixed(2)
            });

            // Add 7 days for next payment
            currentDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
        }

        return schedule;
    }
}

// // Example usage for weekly interest:
// const weeklyLoanData = {
//     principalAmount: '800000',
//     releaseDate: '2024-08-09',
//     interestMethod: 'flat_rate',
//     interestRate: '35',
//     interestPeriod: 'week',
//     duration: '32',
//     durationType: 'week',
//     repaymentCycle: 'weekly'
// };

// // Example usage for monthly interest:
// const monthlyLoanData = {
//     principalAmount: '300000',
//     releaseDate: '2024-08-09',
//     interestMethod: 'flat_rate',
//     interestRate: '3.5',
//     interestPeriod: 'month',
//     duration: '1',
//     durationType: 'monthly',
//     repaymentCycle: 'monthly'
// };

// // Generate schedule for weekly interest
// const weeklyCalculator = new LoanScheduleCalculator(weeklyLoanData);
// const weeklySchedule = weeklyCalculator.generateSchedule();

// // Generate schedule for monthly interest
// const monthlyCalculator = new LoanScheduleCalculator(monthlyLoanData);
// const monthlySchedule = monthlyCalculator.generateSchedule();

// // Example output (first item of weekly schedule)
// console.log(monthlySchedule);