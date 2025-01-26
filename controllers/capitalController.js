import connection from '../config/connection.js';
import handleError from '../helpers/handleError.js';

const { pool } = connection;


export const insertBank = async (bank) => {

    try {

        let checkBank = `
            select name from bank_accounts where name = ? and deleted_at is null
        `
        let [rows] = await pool.query(checkBank, [bank])

        if(rows.length > 0) {
            return {
                queryStatus : true,
                message : "found"
            }
        }

        let timeStamp = new Date()

        let insert = `
            insert into bank_accounts (name, created_at, updated_at) values(?,?,?)
        `

        await pool.query(insert, [ bank.toUpperCase() , timeStamp , timeStamp ])

        return {
            queryStatus : true,
            message : "done"
        }

    }catch (error) {

        return handleError(error, "Failed To Add Bank Account")


    }


}

export const getAllBanks = async () => {


        try {

            let query = `
                select id, name from bank_accounts where deleted_at is null
            `
            let [rows] = await pool.query(query)

            return {
                queryStatus : true,
                data : rows
            }

        }catch (error) {

            console.log(error)
            return handleError(error, "Failed To Get Bank Accounts!")

        }

}

export const getBankDetails = async (bank) => {

    try {

        let query = `
            select id, name from bank_accounts where id = ? and deleted_at is null limit 1
        `

        let [rows] = await pool.query(query, [bank])

        return {
            queryStatus : true,
            data : rows[0]
        }

    }catch (error) {

        console.log(error)
        return handleError(error, "Failed To Get Bank Details")

    }

}

export const changeBankDetails = async ({ bank_id, bank_name }) => {

    try {

            let checkBank = `
                select name from bank_accounts where name = ? and deleted_at is null limit 1
            `
            let [rows] = await pool.query(checkBank, [bank_name])

        if(rows.length > 0) {

                return {
                    queryStatus : true,
                    message : "found"
                }
            }

        let timeStamp = new Date()

        let insert = `
                update bank_accounts set name = ? , updated_at = ? where id = ?
            `
        await pool.query(insert , [ bank_name.toUpperCase() , timeStamp , bank_id ])
  

        return {
            queryStatus : true,
            message : "done"
        }

    }catch (error) {

        console.log(error)
        return handleError(error, "Failed To Edit Bank Account/c");

    }
    
}

export const deleteBank = async (bank_id) => {

    try {

        let timeStamp = new Date()

        const query = `
            update bank_accounts set deleted_at = ? 
                where id = ?
        `

        await pool.query(query, [timeStamp, bank_id])

        return {
            queryStatus : true
        }

    }catch (error) {

        return handleError(error, "Failed To Delete Bank")

    }

}


export const addCapital = async ( userWhoHasPosted, branch, {bank, amount, date, description}) => {


    try {

        let timeStamp = new Date()

        let query = `
            insert into capital (user_id, amount, bank_account_id, notes, branch_id,created_at, updated_at)
                values (?,?,?,?,?,?, ?)
        `
        await pool.query(query, [userWhoHasPosted , amount, bank, description, branch, timeStamp, timeStamp])

        return {
            queryStatus : true
        }

    }catch (error) {

        console.log(error)
        return handleError(error, "Failed To Deposit Capital")

    }

}


export const getAllCapitalDeposits = async (branch) => {

    try {

        const query = `
           select capital.id as capital_id , capital.amount as capital_amount , capital.notes as capital_notes , 
	capital.created_at as capital_deposited_at, bank_accounts.name as bank from capital join bank_accounts
		on capital.bank_account_id = bank_accounts.id where capital.branch_id = ? and capital.deleted_at is null
			and bank_accounts.deleted_at is null;
        `
        let [rows] = await pool.query(query, [branch])

        return {
            queryStatus : true,
            data : rows
        }

    }catch (error) {

        console.log(error)
        return handleError(error, "Failed To Get Capital Deposits/c")

    }



}




