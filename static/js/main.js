// Main JavaScript file for the application

document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

  // Initialize popovers
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
  
  // Handle confirm dialogs
  const confirmButtons = document.querySelectorAll('[data-confirm]');
  confirmButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const message = this.getAttribute('data-confirm');
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });
  
  // Handle resource assignment form
  const assignForm = document.getElementById('assignResourceForm');
  if (assignForm) {
    assignForm.addEventListener('submit', function(e) {
      const userId = document.getElementById('userIdSelect').value;
      if (!userId) {
        e.preventDefault();
        alert('Por favor, selecione um usuário para atribuir o recurso.');
      }
    });
  }
  
  // Toggle password visibility
  const togglePassword = document.querySelector('.toggle-password');
  if (togglePassword) {
    togglePassword.addEventListener('click', function() {
      const passwordInput = document.querySelector(this.getAttribute('data-target'));
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.querySelector('i').classList.toggle('bi-eye');
      this.querySelector('i').classList.toggle('bi-eye-slash');
    });
  }
  
  // Initialize charts if Chart.js is available and canvas exists
  if (typeof Chart !== 'undefined') {
    // Resources by category chart
    const categoryChart = document.getElementById('categoryChart');
    if (categoryChart) {
      const categoriesData = JSON.parse(categoryChart.getAttribute('data-categories'));
      const labels = Object.keys(categoriesData);
      const data = Object.values(categoriesData);
      
      new Chart(categoryChart, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              '#3B82F6', // blue
              '#10B981', // green
              '#F59E0B', // yellow
              '#EF4444', // red
              '#8B5CF6', // purple
              '#EC4899', // pink
              '#6B7280', // gray
            ],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: 'Recursos por Categoria'
            }
          }
        }
      });
    }
    
    // Resource status chart
    const statusChart = document.getElementById('statusChart');
    if (statusChart) {
      const available = parseInt(statusChart.getAttribute('data-available'));
      const inUse = parseInt(statusChart.getAttribute('data-in-use'));
      const maintenance = parseInt(statusChart.getAttribute('data-maintenance'));
      
      new Chart(statusChart, {
        type: 'bar',
        data: {
          labels: ['Disponível', 'Em Uso', 'Em Manutenção'],
          datasets: [{
            data: [available, inUse, maintenance],
            backgroundColor: [
              '#10B981', // green
              '#3B82F6', // blue
              '#F59E0B', // yellow
            ],
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Status dos Recursos'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    }
  }
});

// Search functionality for resources and users tables
function tableSearch(inputId, tableId) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  
  if (input && table) {
    input.addEventListener('keyup', function() {
      const filter = this.value.toUpperCase();
      const rows = table.getElementsByTagName('tr');
      
      for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
        const row = rows[i];
        const cells = row.getElementsByTagName('td');
        let found = false;
        
        for (let j = 0; j < cells.length; j++) {
          const cell = cells[j];
          if (cell) {
            const text = cell.textContent || cell.innerText;
            if (text.toUpperCase().indexOf(filter) > -1) {
              found = true;
              break;
            }
          }
        }
        
        row.style.display = found ? '' : 'none';
      }
    });
  }
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', function() {
  tableSearch('resourceSearch', 'resourcesTable');
  tableSearch('userSearch', 'usersTable');
});
