import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection configuration
const config = {
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'quanta',
    port: 3309
};

async function getAllLoans() {
    let connection;
    try {
        // Create a new connection
        connection = await mysql.createConnection(config);
        
        // Execute query
        await connection.execute(`
            update loans set status = "pending" where status = "approved" and deleted_at is null
        `);

        let [rows] = await connection.execute(`
            select id from loans where loans.deleted_at is null
            `)
        
        for(let x = 0; x < rows.length;x++) {

                // console.log(rows[x])
                let due = await connection.execute(`
                    SELECT (sum(due) + sum(fees)) as total_due FROM loan_schedules where loan_id = ${rows[x].id}
                        and deleted_at is null
                    `)
                //console.log(due[0])
                if(due[0][0].total_due == null) {
                    rows[x].total_due = 0
                } else {
                    rows[x].total_due = due[0][0].total_due
                }
                //lets go to repayments

                let totalPayed = await connection.execute(`
                    select sum(amount) as total_payed from loan_repayments where loan_id = ${rows[x].id} and deleted_at is null 
                `)

                if(totalPayed[0][0].total_payed == null) {
                    rows[x].total_payed = 0
                }else {
                    rows[x].total_payed = totalPayed[0][0].total_payed
                }

                
               
        }

        console.log(rows)

    
    } catch (error) {
        console.error('Error fetching loans:', error);
        throw error;
    } finally {
        // Close the connection after use
        if (connection) await connection.end();
    }
}

// Usage example
async function main() {
    try {
        const loans = await getAllLoans();
        console.log('Loans:', loans);
    } catch (error) {
        console.error('Main error:', error);
    }
}

main();