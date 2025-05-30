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
            select other_income.id as income_id, other_income.amount as amount , 
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

export const getIncomeById = async (income_id) => {
    try {

        const query = `
            SELECT 
                other_income.id AS income_id,
                other_income.amount,
                other_income.date,
                other_income.notes,
                other_income.other_income_type_id,
                other_income_types.name AS income_type
            FROM other_income
            JOIN other_income_types 
                ON other_income.other_income_type_id = other_income_types.id
            WHERE other_income.id = ? AND other_income.deleted_at IS NULL
              AND other_income_types.deleted_at IS NULL
            LIMIT 1
        `;

        const [rows] = await pool.query(query, [income_id])

        return {
            queryStatus: true,
            data: rows[0],
        }

    }catch (error) {

        handleError(error , "Failed To Get Income/c")

    }
}

export const updateIncome = async ({ income_id, income_type, amount, income_date, notes }, branch) => {
    try {
        const timeStamp = new Date();

        const query = `
            UPDATE other_income 
            SET 
                other_income_type_id = ?, 
                date = ?, 
                amount = ?, 
                notes = ?, 
                updated_at = ?
            WHERE 
                id = ? AND branch_id = ? AND deleted_at IS NULL
        `;

        await pool.query(query, [
            income_type, income_date, amount, notes, timeStamp, income_id, branch
        ]);

        return { queryStatus: true };

    } catch (error) {
        return handleError(error, "Failed To Update Income/c");
    }
};

export const softDeleteIncome = async (income_id) => {
    try {
        const query = `
            UPDATE other_income 
            SET deleted_at = ? 
            WHERE id = ? 
        `;
        const timeStamp = new Date();
        await pool.query(query, [timeStamp, income_id]);

        return { queryStatus: true };
    } catch (error) {
        throw handleError(error, "Failed To Delete Income/c");
    }
};
