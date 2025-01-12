//principal
//interest rate
//duration
//repayment cycle

// Let's start with flat interest, as it's the simplest type of loan calculation. We'll go step by step.

// Step 1: Key Concepts
// Principal: This is the amount of money borrowed. Example: TZS 10,000.
// Interest Rate: The percentage charged on the principal. Example: 10% per year.
// Duration: The time for which the loan is borrowed. Example: 3 years.
// Flat Interest: A method where interest is calculated on the original principal, regardless of how much has been paid back.


function calculateLoanInfo ({ principalAmount , interest , duration }) {


   //interest
   //payable amount

   let interestAmount = principalAmount * ( interest / 100)

   let totalPayableAmount = principalAmount + interestAmount

   return  {

        principal : principalAmount,
        totalInterest : interestAmount,
        totalPayableAmount 

   }

}


console.log(
calculateLoanInfo({
    principalAmount : 20000,
    interestRate : 30,
    interestPeriod : "month",
    loan_duration : 6,
    repaymentCycle : "month"
})
)