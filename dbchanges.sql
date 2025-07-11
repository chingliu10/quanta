#added deleted_at column branch_users table

ALTER TABLE branch_users ADD COLUMN deleted_at DATETIME NULL;

#added deleted_at column branches table

ALTER TABLE branches ADD COLUMN deleted_at DATETIME NULL;

#added updated_at on branches table

ALTER TABLE branches ADD COLUMN updated_at DATETIME NULL;


#Indexes for borrower_group_members table
CREATE INDEX idx_borrower_group_id ON borrower_group_members (borrower_group_id);
CREATE INDEX idx_borrower_id ON borrower_group_members (borrower_id);

#Indexes for borrowers table
#(Primary key on `id` is assumed to already exist)

#Indexes for loans table
CREATE INDEX idx_loans_borrower_id ON loans (borrower_id);
CREATE INDEX idx_loans_deleted_at ON loans (deleted_at);

#Indexes for loan_schedules table
CREATE INDEX idx_loan_schedules_loan_id_deleted_at ON loan_schedules (loan_id, deleted_at);
CREATE INDEX idx_loan_schedules_deleted_at ON loan_schedules (deleted_at);

#Indexes for loan_repayments table
CREATE INDEX idx_loan_repayments_loan_id_deleted_at ON loan_repayments (loan_id, deleted_at);
CREATE INDEX idx_loan_repayments_deleted_at ON loan_repayments (deleted_at);

#Index for borrower_groups table
CREATE INDEX idx_borrower_groups_id ON borrower_groups (id);

#Additional composite indexes if needed
#These composite indexes optimize WHERE and JOIN conditions with multiple columns
CREATE INDEX idx_loans_borrower_deleted ON loans (borrower_id, deleted_at);
CREATE INDEX idx_group_members_group_borrower ON borrower_group_members (borrower_group_id, borrower_id);

#Add deleted_at column on borrower_group_members
ALTER TABLE borrower_group_members ADD COLUMN deleted_at DATETIME NULL;

#Adding indexes
CREATE INDEX idx_loans_status_branch ON loans(status, branch_id, deleted_at);
CREATE INDEX idx_borrowers_composite ON borrowers(id, deleted_at);


ALTER TABLE loan_repayments ADD INDEX idx_loan_id (loan_id);
ALTER TABLE loan_schedules ADD INDEX idx_loan_id (loan_id);
CREATE INDEX idx_borrower_deleted ON loans (borrower_id);

CREATE INDEX idx_loan_id_deleted ON loan_schedules (deleted_at)
CREATE INDEX idx_loan_id_deleted ON loan_repayments (deleted_at)


#on bank accounts
ALTER TABLE bank_accounts
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

#add column on capital table
ALTER TABLE capital
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

#add column deleted_at 
ALTER TABLE savings_transactions ADD COLUMN deleted_at DATETIME NULL;

#add unique column
ALTER TABLE other_income_types ADD UNIQUE (name);

#add created_at on the other_income_types
ALTER TABLE other_income_types ADD COLUMN created_at DATETIME NULL;
ALTER TABLE other_income_types ADD COLUMN updated_at DATETIME NULL;
ALTER TABLE other_income_types ADD COLUMN deleted_at DATETIME NULL;

#add branch_id column other_income_types
ALTER TABLE other_income_types
ADD COLUMN branch_id INTEGER;

#added deleted_at column
ALTER TABLE other_income ADD COLUMN deleted_at DATETIME NULL;

#expense type additional colums
ALTER TABLE expense_types 
  ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN deleted_at DATETIME DEFAULT NULL;

#added deleted_at on payroll
ALTER TABLE payroll
ADD COLUMN deleted_at DATETIME NULL AFTER updated_at;

#added users
ALTER TABLE users
ADD COLUMN deleted_at DATETIME NULL AFTER updated_at;