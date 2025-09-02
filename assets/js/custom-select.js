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
        
        // Get the data-value from the custom option
        const displayValue = option.getAttribute('data-value');
        
        // Find the matching option in the hidden select that matches the display text
        for (let i = 0; i < hiddenSelect.options.length; i++) {
            if (hiddenSelect.options[i].text === option.textContent) {
                // Set the hidden select to this option's value (preserving case)
                hiddenSelect.selectedIndex = i;
                console.log('Selected option:', hiddenSelect.options[i].text, 'Value:', hiddenSelect.options[i].value);
                break;
            }
        }
        
        // Trigger change event on hidden select
        const event = new Event('change', { bubbles: true });
        hiddenSelect.dispatchEvent(event);
        
        // Also trigger input event for validation
        const inputEvent = new Event('input', { bubbles: true });
        hiddenSelect.dispatchEvent(inputEvent);
        
        // Clear any validation errors
        const customSelectWrapper = select.closest('.custom-select-wrapper');
        if (customSelectWrapper) {
            const formField = customSelectWrapper.closest('.form-field');
            customSelectWrapper.classList.remove('field-error');
            
            // If using the form validation system, clear validation state
            if (window.formValidation && hiddenSelect) {
                window.formValidation.clearValidation(hiddenSelect);
                
                // Remove any duplicate error messages and clear the remaining one
                if (formField) {
                    const errorMessages = formField.querySelectorAll('.field-error-message');
                    // Remove all but the first error message element
                    for (let i = 1; i < errorMessages.length; i++) {
                        errorMessages[i].remove();
                    }
                    // Clear the first error message if it exists
                    if (errorMessages.length > 0) {
                        errorMessages[0].textContent = '';
                        errorMessages[0].className = 'field-error-message';
                    }
                }
            }
        }
        
        // Close dropdown
        this.closeDropdown(select);
    }

    closeDropdown(select) {
        const trigger = select.querySelector('.custom-select__trigger');
        trigger.classList.remove('active');
    }

    setInitialValue(select, hiddenSelect, placeholder) {
        if (hiddenSelect.value) {
            // Get the selected option from the hidden select
            const selectedHiddenOption = hiddenSelect.options[hiddenSelect.selectedIndex];
            
            if (selectedHiddenOption) {
                // Find the matching custom option based on display text
                const options = select.querySelectorAll('.custom-select__option');
                let selectedOption = null;
                
                for (const option of options) {
                    if (option.textContent === selectedHiddenOption.text) {
                        selectedOption = option;
                        break;
                    }
                }
                
                // If found, set it as selected
                if (selectedOption) {
                    selectedOption.classList.add('selected');
                    placeholder.textContent = selectedOption.textContent;
                    placeholder.style.color = '#000000';
                }
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
            
            // First set the value in the hidden select
            for (let i = 0; i < hiddenSelect.options.length; i++) {
                if (hiddenSelect.options[i].value === value) {
                    hiddenSelect.selectedIndex = i;
                    
                    // Now find the matching custom option based on text
                    const options = customSelect.querySelectorAll('.custom-select__option');
                    let selectedOption = null;
                    
                    for (const option of options) {
                        if (option.textContent === hiddenSelect.options[i].text) {
                            selectedOption = option;
                            break;
                        }
                    }
                    
                    if (placeholder && selectedOption) {
                        // Clear any previous selections
                        customSelect.querySelectorAll('.custom-select__option').forEach(opt => {
                            opt.classList.remove('selected');
                        });
                        
                        // Update placeholder text with the display text (not the value)
                        placeholder.textContent = selectedOption.textContent;
                        placeholder.style.color = '#000000';
                        
                        // Mark the corresponding option as selected
                        selectedOption.classList.add('selected');
                    }
                    
                    break;
                }
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
    
    // Public method to handle validation states
    setValidationState(selectId, state, message = '') {
        const customSelect = document.getElementById(`${selectId}-select`);
        const hiddenSelect = document.getElementById(selectId);
        
        if (!customSelect || !hiddenSelect) return;
        
        const customSelectWrapper = customSelect.closest('.custom-select-wrapper');
        if (!customSelectWrapper) return;
        
        // Clear existing states
        customSelectWrapper.classList.remove('field-error', 'field-success');
        
        // Apply new state
        if (state === 'error') {
            customSelectWrapper.classList.add('field-error');
            
            // If using the form validation system, show error
            if (window.formValidation && message) {
                window.formValidation.showError(hiddenSelect, message);
            }
        } else if (state === 'success') {
            customSelectWrapper.classList.add('field-success');
            
            // If using the form validation system, show success
            if (window.formValidation && message) {
                window.formValidation.showSuccess(hiddenSelect, message);
            }
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
