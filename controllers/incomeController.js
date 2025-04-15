import connection from '../config/connection.js';
import handleError from '../helpers/handleError.js';

const { pool } = connection;

// Get all payroll entries
export const storeIncomeType = async (income_type, branch ) => {


    try {

        let timeStamp = new Date()

        const query = `
           INSERT INTO other_income_types 
            (name, created_at, updated_at) values (?, ?, ?)
        `;

        await pool.query(query, [income_type.toUpperCase(), timeStamp , timeStamp, branch ])

        return { queryStatus: true }

    } catch (error) {

        return handleError(error, 'Failed To Create Income Type/c');

    }

};


export const getAllIncomeTypes = async ( branch ) => {

    try {

        const query = `
            SELECT id, name FROM other_income_types
        `

        let [rows] = await pool.query(query, [ branch ])

        return {
            queryStatus : true,
            data : rows
        }

    }catch (error) {

        return handleError(error, "Failed To Get Income Types/c")

    }

}


export const storeIncome = async ( {  income_type , amount, income_date, notes } , branch ) => {

    try {

        let timeStamp = new Date()

        let query = `
            insert into other_income (other_income_type_id, date, amount, notes, created_at, updated_at, branch_id) 
                values (?, ?, ?, ?, ? , ?, ?)
        `

        await pool.query(query, [income_type , income_date, amount, notes, timeStamp, timeStamp, branch])

        return {
            queryStatus : true
        }

    }catch (error) {

        console.log(error)
        handleError(error , "Failed To Add Income/c")

    }

}


export const getAllIncomes = async (branch) => {


    try {

        let query = `
            select other_income.other_income_type_id as 
	income_id  , other_income.amount as amount , 
		other_income.date as date , other_income.notes as description ,
		  other_income_types.name as income_type	from other_income join other_income_types on other_income.other_income_type_id = 
	other_income_types.id where  other_income.branch_id = ? and  other_income.deleted_at is null
		and other_income_types.deleted_at is null;
        `

        let [rows] = await pool.query(query, [branch])

        console.log(rows)

        return {
            queryStatus : true,
            data : rows
        }

    }catch (error) {

        handleError(error , "Failed To Get Incomes/c")

    }
}