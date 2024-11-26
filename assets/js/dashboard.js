    // Utility function to format numbers
    function formatNumber(n) {
        const number = Number(n);
        // If the number is an integer, format without decimal places
        if (Number.isInteger(number)) {
            return number.toLocaleString('en-US');
        }
        // Otherwise, format with up to 2 decimal places
        return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }


    // Function to fetch data from an API endpoint
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch data from ${url}:`, error.message);
            throw error;
        }
    }

    // Fetch and update total borrowers
    fetchData('/dashboard/getborrowers')
        .then((data) => {
            const loadingElement = document.getElementById('borrowers-loading');
            const dataElement = document.getElementById('borrowers-data');

            // Hide loading and show data
            loadingElement.style.display = 'none';
            dataElement.textContent = data.totalBorrowers;
        })
        .catch((error) => {
            const loadingElement = document.getElementById('borrowers-loading');
            const errorElement = document.getElementById('borrowers-error');

            // Hide loading and show error
            loadingElement.style.display = 'none';
            errorElement.textContent = `Failed to fetch borrowers: ${error.message}`;
        });

    // Fetch and update total loans released
    fetchData('/dashboard/totalloansreleased')
        .then((data) => {
            const loadingElement = document.getElementById('loans-loading');
            const dataElement = document.getElementById('loans-data');

            // Hide loading and show data
            loadingElement.style.display = 'none';
            dataElement.textContent = formatNumber(data.totalLoans);
        })
        .catch((error) => {
            const loadingElement = document.getElementById('loans-loading');
            const errorElement = document.getElementById('loans-error');

            // Hide loading and show error
            loadingElement.style.display = 'none';
            errorElement.textContent = `Failed to fetch total loans: ${error.message}`;
        });

    // Fetch and update total collection
    fetchData('/dashboard/totalcollection')
        .then((data) => {
            const loadingElement = document.getElementById('collection-loading');
            const dataElement = document.getElementById('collection-data');

            // Hide loading and show data
            loadingElement.style.display = 'none';
            dataElement.textContent = formatNumber(data.totalCollection);
        })
        .catch((error) => {
            const loadingElement = document.getElementById('collection-loading');
            const errorElement = document.getElementById('collection-error');

            // Hide loading and show error
            loadingElement.style.display = 'none';
            errorElement.textContent = `Failed to fetch total collection: ${error.message}`;
        });

    // Fetch and update outstanding minus collection
    async function fetchOutstandingMinusCollection() {
        const loadingElement = document.getElementById('outstanding-loading');
        const dataElement = document.getElementById('outstanding-data');

        // Reset UI elements
        loadingElement.style.display = 'block';
        dataElement.textContent = '';

        try {
            // Fetch outstanding and collection data concurrently
            const [outstandingData, collectionData] = await Promise.all([
                fetchData('/dashboard/outstandingopenloans'),
                fetchData('/dashboard/totalcollection')
            ]);

            const outstanding = outstandingData.outstanding;
            const totalCollection = collectionData.totalCollection;

          

            // Perform the calculation
            const result = outstanding - totalCollection;
            console.log("LLLL")
            console.log(result)
            // Update the UI
            loadingElement.style.display = 'none';
            dataElement.textContent = `${formatNumber(result)}`;
        } catch (error) {
            loadingElement.style.display = 'none'; // Hide loading
            errorElement.textContent = `Failed to fetch data: ${error.message}`;
        }
    }

    fetchOutstandingMinusCollection();

    // Fetch and update open loans
    fetchData('/dashboard/openloans')
        .then((data) => {
            const loadingElement = document.getElementById('openloans-loading');
            const dataElement = document.getElementById('openloans-data');

            // Hide loading and show data
            loadingElement.style.display = 'none';
            dataElement.textContent = formatNumber(data.openloans)
             
        })
        .catch((error) => {
            const loadingElement = document.getElementById('openloans-loading');
            const errorElement = document.getElementById('openloans-error');

            // Hide loading and show error
            loadingElement.style.display = 'none';
            errorElement.textContent = `Failed to fetch open loans: ${error.message}`;
        });
    
       // Fetch and update closed loans
    fetchData('/dashboard/closedloans')
        .then((data) => {
            const loadingElement = document.getElementById('closedloans-loading');
            const dataElement = document.getElementById('closedloans-data');

            // Hide loading and show data
            loadingElement.style.display = 'none';
            dataElement.textContent = formatNumber(data.closedloans)
             
        })
        .catch((error) => {
            const loadingElement = document.getElementById('closedloans-loading');
            const errorElement = document.getElementById('closedloans-error');

            // Hide loading and show error
            loadingElement.style.display = 'none';
            errorElement.textContent = `Failed to fetch open loans: ${error.message}`;
        });

        // Fetch and update pending loans
    fetchData('/dashboard/pendingloans')
        .then((data) => {
            const loadingElement = document.getElementById('pendingloans-loading');
            const dataElement = document.getElementById('pendingloans-data');

            // Hide loading and show data
            loadingElement.style.display = 'none';
            dataElement.textContent = formatNumber(data.pendingloans)
             
        })
        .catch((error) => {
            const loadingElement = document.getElementById('pendingloans-loading');
            const errorElement = document.getElementById('pendingloans-error');

            // Hide loading and show error
            loadingElement.style.display = 'none';
            errorElement.textContent = `Failed to fetch open loans: ${error.message}`;
        });

        // Fetch and update awaitingdisbursement loans
    fetchData('/dashboard/awaitingdisbursement')
        .then((data) => {
            const loadingElement = document.getElementById('awaitingdisbursement-loading');
            const dataElement = document.getElementById('awaitingdisbursement-data');

            // Hide loading and show data
            loadingElement.style.display = 'none';
            dataElement.textContent =  formatNumber(data.awaitingDisbursement)
             
        })
        .catch((error) => {
            const loadingElement = document.getElementById('awaitingdisbursement-loading');
            const errorElement = document.getElementById('awaitingdisbursement-error');

            // Hide loading and show error
            loadingElement.style.display = 'none';
            errorElement.textContent = `Failed to fetch awaitingdisbursement loans: ${error.message}`;
        });

       // Fetch and update savingsdeposited loans
    fetchData('/dashboard/savingsdeposited')
        .then((data) => {
            const loadingElement = document.getElementById('savingsdeposited-loading');
            const dataElement = document.getElementById('savingsdeposited-data');

            // Hide loading and show data
            loadingElement.style.display = 'none';
            dataElement.textContent =  formatNumber(data.savingsDeposited)
             
        })
        .catch((error) => {
            const loadingElement = document.getElementById('savingsdeposited-loading');
            const errorElement = document.getElementById('savingsdeposited-error');

            // Hide loading and show error
            loadingElement.style.display = 'none';
            errorElement.textContent = `Failed to fetch savingsdeposited loans: ${error.message}`;
        });

    
       // Fetch and update savingsdeposited loans
    fetchData('/dashboard/savingswithdrawn')
        .then((data) => {
            const loadingElement = document.getElementById('savingswithdrawn-loading');
            const dataElement = document.getElementById('savingswithdrawn-data');

            // Hide loading and show data
            loadingElement.style.display = 'none';
            dataElement.textContent =  formatNumber(data.savingsWithdrawn)
             
        })
        .catch((error) => {
            const loadingElement = document.getElementById('savingswithdrawn-loading');
            const errorElement = document.getElementById('savingswithdrawn-error');

            // Hide loading and show error
            loadingElement.style.display = 'none';
            errorElement.textContent = `Failed to fetch savingswithdrawn loans: ${error.message}`;
        });