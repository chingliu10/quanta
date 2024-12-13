const handleError = (error, activity) => {
    return {
        queryStatus: false,
        message: error.sqlMessage || error.message || 'An unexpected error occurred',
        errorInformation: {
            errorNo: error.errno || null,
            errorCode: error.code || null,
            errorMessage: error.sqlMessage || error.message,
            stack: error.stack || null,
        },
        activity,
    };
};

export default handleError;

