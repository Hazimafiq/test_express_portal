/**
 * Custom Select Dropdown Functionality
 * This module provides a reusable custom select dropdown component
 * that can be used across different pages.
 */

class CustomSelect {
    constructor() {
        this.customSelects = [];
        this.init();
    }

    init() {
        // Initialize custom select dropdowns
        this.customSelects = document.querySelectorAll('.custom-select');
        
        this.customSelects.forEach(select => {
            this.setupSelect(select);
        });
    }

    setupSelect(select) {
        const trigger = select.querySelector('.custom-select__trigger');
        const options = select.querySelector('.custom-select__options');
        const placeholder = select.querySelector('.custom-select__placeholder');
        const hiddenSelect = select.parentNode.querySelector('select');
        
        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(select);
        });
        
        // Handle option selection
        const optionElements = select.querySelectorAll('.custom-select__option');
        optionElements.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectOption(select, option, placeholder, hiddenSelect);
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!select.contains(e.target)) {
                this.closeDropdown(select);
            }
        });
        
        // Handle keyboard navigation
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                trigger.click();
            }
        });
        
        // Set initial value if hidden select has a value
        this.setInitialValue(select, hiddenSelect, placeholder);
    }

    toggleDropdown(select) {
        // Close all other dropdowns
        this.customSelects.forEach(otherSelect => {
            if (otherSelect !== select) {
                this.closeDropdown(otherSelect);
            }
        });
        
        // Toggle current dropdown
        const trigger = select.querySelector('.custom-select__trigger');
        trigger.classList.toggle('active');
    }

    selectOption(select, option, placeholder, hiddenSelect) {
        // Remove selected class from all options
        const optionElements = select.querySelectorAll('.custom-select__option');
        optionElements.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Update placeholder text
        placeholder.textContent = option.textContent;
        placeholder.style.color = '#000000';
        
        // Update hidden select value
        const value = option.getAttribute('data-value');
        hiddenSelect.value = value;
        
        // Trigger change event on hidden select
        const event = new Event('change', { bubbles: true });
        hiddenSelect.dispatchEvent(event);
        
        // Close dropdown
        this.closeDropdown(select);
    }

    closeDropdown(select) {
        const trigger = select.querySelector('.custom-select__trigger');
        trigger.classList.remove('active');
    }

    setInitialValue(select, hiddenSelect, placeholder) {
        if (hiddenSelect.value) {
            const selectedOption = select.querySelector(`[data-value="${hiddenSelect.value}"]`);
            if (selectedOption) {
                selectedOption.classList.add('selected');
                placeholder.textContent = selectedOption.textContent;
                placeholder.style.color = '#000000';
            }
        }
    }

    // Public method to set initial value from external data
    setValueFromData(selectId, value) {
        if (!value || value === 'undefined' || value === 'null') return;
        
        const customSelect = document.getElementById(`${selectId}-select`);
        const hiddenSelect = document.getElementById(selectId);
        
        if (customSelect && hiddenSelect) {
            const placeholder = customSelect.querySelector('.custom-select__placeholder');
            const option = customSelect.querySelector(`[data-value="${value}"]`);
            
            if (placeholder && option) {
                // Update placeholder text
                placeholder.textContent = value;
                placeholder.style.color = '#000000';
                
                // Update hidden select value
                hiddenSelect.value = value;
                
                // Mark the corresponding option as selected
                option.classList.add('selected');
            }
        }
    }

    // Public method to add new custom select dynamically
    addCustomSelect(container) {
        const newSelect = container.querySelector('.custom-select');
        if (newSelect) {
            this.setupSelect(newSelect);
            this.customSelects = document.querySelectorAll('.custom-select');
        }
    }

    // Public method to refresh all selects
    refresh() {
        this.customSelects = document.querySelectorAll('.custom-select');
        this.customSelects.forEach(select => {
            this.setupSelect(select);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.customSelect = new CustomSelect();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomSelect;
}
