class LoanProductCalculator {
    static FREQUENCY_RATES = {
        daily: { days: 365, periodPerMonth: 30 },
        weekly: { days: 52, periodPerMonth: 4 },
        monthly: { days: 12, periodPerMonth: 1 },
        yearly: { days: 1, periodPerMonth: 1/12 }
    };

    constructor(principal, interest, duration, {
        paymentFrequency = 'monthly',
        interestFrequency = 'monthly',
        interestType = 'flat' // 'flat' or 'reducing'
    } = {}) {
        this.principal = parseFloat(principal);
        this.interest = parseFloat(interest);
        this.duration = parseInt(duration);
        this.paymentFrequency = paymentFrequency.toLowerCase();
        this.interestFrequency = interestFrequency.toLowerCase();
        this.interestType = interestType.toLowerCase();
        
        // Convert duration to months for internal calculations
        this.durationInMonths = this.convertToMonths(duration, paymentFrequency);
    }

    convertToMonths(duration, frequency) {
        const { periodPerMonth } = LoanProductCalculator.FREQUENCY_RATES[frequency];
        return duration / periodPerMonth;
    }

    normalizeInterestRate() {
        // Convert interest rate to monthly rate
        const { days } = LoanProductCalculator.FREQUENCY_RATES[this.interestFrequency];
        let monthlyRate;

        switch(this.interestFrequency) {
            case 'daily':
                monthlyRate = (this.interest * 30) / days;
                break;
            case 'weekly':
                monthlyRate = (this.interest * 12) / days;
                break;
            case 'monthly':
                monthlyRate = this.interest;
                break;
            case 'yearly':
                monthlyRate = this.interest / 12;
                break;
            default:
                throw new Error('Unsupported interest frequency');
        }
        return monthlyRate;
    }

    calculatePaymentsCount() {
        const { periodPerMonth } = LoanProductCalculator.FREQUENCY_RATES[this.paymentFrequency];
        return Math.ceil(this.durationInMonths * periodPerMonth);
    }

    calculateInterestPerPeriod(currentPrincipal) {
        const monthlyRate = this.normalizeInterestRate();
        const { periodPerMonth } = LoanProductCalculator.FREQUENCY_RATES[this.paymentFrequency];
        
        if (this.interestType === 'flat') {
            return (this.principal * (monthlyRate / 100)) / periodPerMonth;
        } else { // reducing balance
            return (currentPrincipal * (monthlyRate / 100)) / periodPerMonth;
        }
    }

    calculatePrincipalPerPeriod() {
        return this.principal / this.calculatePaymentsCount();
    }

    generateSchedule() {
        const schedule = [];
        const numberOfPayments = this.calculatePaymentsCount();
        const principalPerPeriod = this.calculatePrincipalPerPeriod();
        
        let remainingPrincipal = this.principal;
        let cumulativeTotal = 0;
        const startDate = new Date();
        
        for (let i = 0; i < numberOfPayments; i++) {
            const dueDate = new Date(startDate);
            const { periodPerMonth } = LoanProductCalculator.FREQUENCY_RATES[this.paymentFrequency];
            
            // Adjust date based on frequency
            switch(this.paymentFrequency) {
                case 'daily':
                    dueDate.setDate(dueDate.getDate() + i + 1);
                    break;
                case 'weekly':
                    dueDate.setDate(dueDate.getDate() + ((i + 1) * 7));
                    break;
                case 'monthly':
                    dueDate.setMonth(dueDate.getMonth() + i + 1);
                    break;
                case 'yearly':
                    dueDate.setFullYear(dueDate.getFullYear() + i + 1);
                    break;
            }
            
            const interestPerPeriod = this.calculateInterestPerPeriod(remainingPrincipal);
            const totalDue = principalPerPeriod + interestPerPeriod;
            cumulativeTotal += totalDue;
            remainingPrincipal -= principalPerPeriod;

            schedule.push({
                date: dueDate.toISOString().slice(0, 10),
                description: "Repayment",
                principal: principalPerPeriod.toFixed(2),
                interest: interestPerPeriod.toFixed(2),
                fees: "0.00",
                penalty: "0.00",
                totalDue: totalDue.toFixed(2),
                cumulativeTotal: cumulativeTotal.toFixed(2),
                pendingDue: totalDue.toFixed(2),
                principalBalance: Math.max(0, remainingPrincipal).toFixed(2)
            });
        }
        return schedule;
    }

    printSchedule() {
        const schedule = this.generateSchedule();
        
        console.log('\nLOAN SCHEDULE');
        console.log('=============');
        console.log(`Principal Amount: ${this.principal}`);
        console.log(`Interest Rate: ${this.interest}% per ${this.interestFrequency}`);
        console.log(`Interest Type: ${this.interestType}`);
        console.log(`Payment Frequency: ${this.paymentFrequency}`);
        console.log(`Duration: ${this.duration} ${this.paymentFrequency}`);
        console.log(`Number of Payments: ${schedule.length}`);
        console.log('=============\n');

        // Print header
        console.log('Date\t\tPrincipal\tInterest\tTotal Due\tBalance');
        console.log('----------------------------------------------------------------');

        // Print each payment
        schedule.forEach(payment => {
            console.log(
                `${payment.date}\t` +
                `${payment.principal}\t` +
                `${payment.interest}\t` +
                `${payment.totalDue}\t` +
                `${payment.principalBalance}`
            );
        });

        // Calculate total interest
        const totalInterest = schedule.reduce((sum, payment) => 
            sum + parseFloat(payment.interest), 0).toFixed(2);

        // Print summary
        console.log('\nSUMMARY');
        console.log('=============');
        console.log(`Total Principal: ${this.principal.toFixed(2)}`);
        console.log(`Total Interest: ${totalInterest}`);
        console.log(`Total Payment: ${schedule[schedule.length - 1].cumulativeTotal}`);
    }
}

// // Usage examples:
// console.log("MONTHLY PAYMENTS WITH YEARLY INTEREST (REDUCING):");
// const yearlyInterestLoan = new LoanProductCalculator(100000, 12, 12, {
//     paymentFrequency: 'monthly',
//     interestFrequency: 'yearly',
//     interestType: 'reducing'
// });

// yearlyInterestLoan.printSchedule();

console.log("\nWEEKLY PAYMENTS WITH MONTHLY INTEREST (FLAT):");
const weeklyPaymentLoan = new LoanProductCalculator(300000, 3.5, 24, {
    paymentFrequency: 'weekly',
    interestFrequency: 'monthly',
    interestType: 'flat'
});

weeklyPaymentLoan.printSchedule();