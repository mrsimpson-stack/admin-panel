document.addEventListener('DOMContentLoaded', function() {
    // Tab navigation
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and tabs
            links.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Add active class to clicked link and corresponding tab
            this.classList.add('active');
            const tabId = this.getAttribute('href').substring(1);
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Load initial data
    loadDashboardStats();
    loadUsers();
    loadDeposits();

    // Set up filter event listeners
    document.getElementById('deposit-status-filter').addEventListener('change', loadDeposits);
});

async function loadDashboardStats() {
    try {
        const response = await fetch('/admin/stats');
        const data = await response.json();
        
        document.getElementById('total-users').textContent = data.totalUsers;
        document.getElementById('active-investments').textContent = data.activeInvestments;
        document.getElementById('pending-deposits').textContent = data.pendingDeposits;
        document.getElementById('pending-withdrawals').textContent = data.pendingWithdrawals;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadUsers() {
    try {
        const response = await fetch('/admin/users');
        const users = await response.json();
        const tableBody = document.getElementById('users-table');
        
        tableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.balance} UGX</td>
                <td>${user.status}</td>
                <td>
                    <button class="btn btn-edit" data-id="${user.id}">Edit</button>
                    ${user.status === 'active' ? 
                        `<button class="btn btn-suspend" data-id="${user.id}">Suspend</button>` : 
                        `<button class="btn btn-activate" data-id="${user.id}">Activate</button>`}
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadDeposits() {
    const statusFilter = document.getElementById('deposit-status-filter').value;
    
    try {
        const response = await fetch(`/admin/deposits?status=${statusFilter}`);
        const deposits = await response.json();
        const tableBody = document.getElementById('deposits-table');
        
        tableBody.innerHTML = '';
        deposits.forEach(deposit => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${deposit.id}</td>
                <td>${deposit.userName} (ID: ${deposit.userId})</td>
                <td>${deposit.amount} UGX</td>
                <td><a href="/proofs/${deposit.proofImage}" target="_blank">View Proof</a></td>
                <td>${new Date(deposit.date).toLocaleString()}</td>
                <td>${deposit.status}</td>
                <td>
                    ${deposit.status === 'pending' ? `
                        <button class="btn btn-approve" data-id="${deposit.id}">Approve</button>
                        <button class="btn btn-reject" data-id="${deposit.id}">Reject</button>
                    ` : ''}
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners to action buttons
        document.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', approveDeposit);
        });
        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', rejectDeposit);
        });
    } catch (error) {
        console.error('Error loading deposits:', error);
    }
}

async function approveDeposit(e) {
    const depositId = e.target.getAttribute('data-id');
    try {
        const response = await fetch(`/admin/deposits/${depositId}/approve`, {
            method: 'POST'
        });
        
        if (response.ok) {
            loadDeposits();
            loadDashboardStats();
        }
    } catch (error) {
        console.error('Error approving deposit:', error);
    }
}

async function rejectDeposit(e) {
    const depositId = e.target.getAttribute('data-id');
    try {
        const response = await fetch(`/admin/deposits/${depositId}/reject`, {
            method: 'POST'
        });
        
        if (response.ok) {
            loadDeposits();
        }
    } catch (error) {
        console.error('Error rejecting deposit:', error);
    }
}