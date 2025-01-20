// // class LoanCalculator {
// //     constructor(params) {
// //         // Basic loan parameters
// //         this.principal = parseFloat(params.principal);
// //         this.interestRate = parseFloat(params.interestRate);
// //         this.interestFrequency = params.interestFrequency.toLowerCase(); // 'weekly' or 'monthly'
// //         this.paymentFrequency = params.paymentFrequency.toLowerCase(); // 'weekly' or 'monthly'
// //         this.durationInWeeks = parseInt(params.durationInWeeks);
// //         this.startDate = new Date(params.startDate);
// //         this.initialFees = parseFloat(params.fees || 0);
        
// //         // Calculate core values
// //         this.calculateBaseValues();
// //     }

// //     calculateBaseValues() {
// //         // Calculate number of payments
// //         this.numberOfPayments = this.durationInWeeks;
        
// //         // Calculate principal per payment
// //         this.principalPerPayment = this.principal / this.numberOfPayments;
        
// //         // Calculate interest per payment based on frequency
// //         if (this.interestFrequency === 'weekly') {
// //             // For weekly interest (like your 35%/week example)
// //             this.interestPerPayment = (this.principal * (this.interestRate / 100)) / this.numberOfPayments;
// //         } else if (this.interestFrequency === 'monthly') {
// //             // For monthly interest (like your 5%/month example)
// //             // Convert monthly rate to weekly
// //             const monthlyInterest = this.principal * (this.interestRate / 100);
// //             this.interestPerPayment = monthlyInterest / 4; // Divide by 4 weeks
// //         }
// //     }

// //     generateSchedule() {
// //         let schedule = [];
// //         let remainingPrincipal = this.principal;
// //         let cumulativeTotal = 0;
// //         const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;

// //         for (let week = 0; week < this.numberOfPayments; week++) {
// //             // Calculate payment date
// //             const paymentDate = new Date(this.startDate.getTime() + (week * millisecondsPerWeek));
            
// //             // Calculate payment components
// //             const principalPayment = parseFloat(this.principalPerPayment.toFixed(2));
// //             const interestPayment = parseFloat(this.interestPerPayment.toFixed(2));
// //             const fees = week === 0 ? this.initialFees : 0;
            
// //             // Calculate totals
// //             const totalDue = principalPayment + interestPayment + fees;
// //             cumulativeTotal += totalDue;
// //             remainingPrincipal -= principalPayment;

// //             // Create payment record
// //             schedule.push({
// //                 paymentNumber: week + 1,
// //                 date: paymentDate.toISOString().split('T')[0],
// //                 description: "Repayment",
// //                 principal: principalPayment.toFixed(2),
// //                 interest: interestPayment.toFixed(2),
// //                 fees: fees.toFixed(2),
// //                 penalty: "0.00",
// //                 due: totalDue.toFixed(2),
// //                 totalDue: cumulativeTotal.toFixed(2),
// //                 pendingDue: totalDue.toFixed(2),
// //                 principalBalance: Math.max(0, remainingPrincipal).toFixed(2)
// //             });
// //         }

// //         return schedule;
// //     }

// //     printSchedule() {
// //         const schedule = this.generateSchedule();
        
// //         // Print loan details
// //         console.log('\nLOAN DETAILS');
// //         console.log('============');
// //         console.log(`Principal: ${this.principal.toFixed(2)}`);
// //         console.log(`Interest Rate: ${this.interestRate}% per ${this.interestFrequency}`);
// //         console.log(`Payment Frequency: ${this.paymentFrequency}`);
// //         console.log(`Duration: ${this.durationInWeeks} weeks`);
// //         console.log(`Initial Fees: ${this.initialFees.toFixed(2)}`);
        
// //         // Print schedule header
// //         console.log('\nREPAYMENT SCHEDULE');
// //         console.log('=================');
// //         console.log('# | Date | Principal | Interest | Fees | Due | Balance');
        
// //         // Print payments
// //         schedule.forEach(payment => {
// //             console.log(
// //                 `${payment.paymentNumber} | ` +
// //                 `${payment.date} | ` +
// //                 `${payment.principal} | ` +
// //                 `${payment.interest} | ` +
// //                 `${payment.fees} | ` +
// //                 `${payment.due} | ` +
// //                 `${payment.principalBalance}`
// //             );
// //         });
        
// //         // Print summary
// //         const totalInterest = schedule.reduce((sum, payment) => sum + parseFloat(payment.interest), 0);
// //         const totalFees = schedule.reduce((sum, payment) => sum + parseFloat(payment.fees), 0);
// //         const totalPayments = schedule.reduce((sum, payment) => sum + parseFloat(payment.due), 0);
        
// //         console.log('\nLOAN SUMMARY');
// //         console.log('============');
// //         console.log(`Total Principal: ${this.principal.toFixed(2)}`);
// //         console.log(`Total Interest: ${totalInterest.toFixed(2)}`);
// //         console.log(`Total Fees: ${totalFees.toFixed(2)}`);
// //         console.log(`Total Payments: ${totalPayments.toFixed(2)}`);
// //     }
// // }

// // // Example usage for weekly interest (35% per week):
// // const weeklyLoan = new LoanCalculator({
// //     principal: 800000,
// //     interestRate: 44,
// //     interestFrequency: 'weekly',
// //     paymentFrequency: 'weekly',
// //     durationInWeeks: 32,
// //     startDate: '2024-08-09',
// //     fees: 27000
// // });

// // // Example usage for monthly interest (5% per month):
// // // const monthlyLoan = new LoanCalculator({
// // //     principal: 300000,
// // //     interestRate: 5,
// // //     interestFrequency: 'monthly',
// // //     paymentFrequency: 'weekly',
// // //     durationInWeeks: 24,
// // //     startDate: '2024-08-12',
// // //     fees: 35000
// // // });

// // // Print schedules
// // console.log("\nWEEKLY INTEREST LOAN (35% per week):");
// // weeklyLoan.printSchedule();

// // // console.log("\nMONTHLY INTEREST LOAN (5% per month):");
// // // monthlyLoan.printSchedule();

class LoanScheduleCalculator {
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

// Example usage for weekly interest:
const weeklyLoanData = {
    principalAmount: '800000',
    releaseDate: '2024-08-09',
    interestMethod: 'flat_rate',
    interestRate: '35',
    interestPeriod: 'week',
    duration: '32',
    durationType: 'week',
    repaymentCycle: 'weekly'
};

// Example usage for monthly interest:
const monthlyLoanData = {
    principalAmount: '300000',
    releaseDate: '2024-08-09',
    interestMethod: 'flat_rate',
    interestRate: '3.5',
    interestPeriod: 'month',
    duration: '1',
    durationType: 'monthly',
    repaymentCycle: 'monthly'
};

// Generate schedule for weekly interest
const weeklyCalculator = new LoanScheduleCalculator(weeklyLoanData);
const weeklySchedule = weeklyCalculator.generateSchedule();

// Generate schedule for monthly interest
const monthlyCalculator = new LoanScheduleCalculator(monthlyLoanData);
const monthlySchedule = monthlyCalculator.generateSchedule();

// Example output (first item of weekly schedule)
console.log(monthlySchedule);