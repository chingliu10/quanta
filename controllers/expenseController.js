import { createExpenseType } from '../models/expense_type_model.js';

export const createExpense = async (req, res) => {
  try {
    const { expense_type_add } = req.body;


    console.log(expense_type_add)

    return
    
    // Validate input
    if (!expense_type_add?.trim()) {
      return res.status(400).render('your-template', {
        error: 'Expense type name is required',
        formData: req.body
      });
    }

    // Create using model
    const newType = await createExpenseType(expense_type_add);
    
    // Redirect to prevent duplicate form submissions
    res.redirect('/expense/types?success=true');
  } catch (error) {
    res.status(400).render('your-template', {
      error: error.message,
      formData: req.body
    });
  }
};

export const getExpenseTypes = async (req, res) => {
  try {
    const types = await getAllExpenseTypes();
    res.render('your-template', {
      types,
      success: req.query.success
    });
  } catch (error) {
    res.status(500).render('your-template', {
      error: 'Failed to load expense types'
    });
  }
};