import { createExpenseType , getAllExpenseTypes } from '../models/expense_type_model.js';
import handleError from '../helpers/handleError.js';

export const createExpense = async ({ expense_type }) => {
  try {
  
    // Validate input
    // if (!expense_type?.trim()) {
    //   return res.status(400).render('your-template', {
    //     error: 'Expense type name is required',
    //     formData: req.body
    //   });
    // }

    // Create using model
    await createExpenseType(expense_type);
    return {
      queryStatus : true
    }

  } catch (error) {

    console.log(error)
    return handleError(error,  error.errorMessage || 'Failed To Create Expense Type/c');

  }
};

export const getExpenseTypes = async (req, res) => {
  try {
    const rows = await getAllExpenseTypes();
    
    return {
      status : true,
      data : rows
    }
  } catch (error) {
    
    return handleError(error,  error.errorMessage || 'Failed To Fetch Expenses Types');

  }
};

// export const deleteExpenseType = async (req, res) => {

// }