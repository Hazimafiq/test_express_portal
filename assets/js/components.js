// Component loader utility
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;

        // Initialize component-specific functionality
        await initializeNavRail();
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// Navigation rail functionality
async function initializeNavRail() {
    // Wait for DOM elements to be loaded
    const navRail = document.querySelector('.nav-rail');
    const sideMenuArrow = document.getElementById('sideMenuArrow');
    const arrowIcon = sideMenuArrow?.querySelector('.arrow-icon');
    
    // User role is now available directly from the template via data attribute
    const userManagementNav = document.getElementById('userManagementNav');
    if (userManagementNav) {
        const userRole = userManagementNav.getAttribute('data-user-role');
        console.log('[NavRail] User role:', userRole);
        // Role-based visibility logic can be added here if needed
    }
    
    // Define route groups for navigation highlighting
    const routeGroups = {
        '/user-management': [
            '/user-management',
            '/create-user', 
            '/update-user',
            '/user-details'
        ],
        '/add-case': [
            '/add-case',
            '/upload-stl'
        ]
        // Add more route groups as needed
    };

    // Helper function to check if current path belongs to a route group
    function getActiveRouteGroup(currentPath) {
        for (const [groupKey, routes] of Object.entries(routeGroups)) {
            for (const route of routes) {
                // Check exact matches first
                if (route === currentPath) {
                    return groupKey;
                }
                // Check for dynamic routes that start with the base path
                // e.g., /user-details matches /user-details/123, /update-user matches /update-user/456
                if (currentPath.startsWith(route + '/') || 
                    (route.includes('-') && currentPath.startsWith(route.split('/:')[0] + '/'))) {
                    return groupKey;
                }
            }
        }
        return currentPath; // Return original path if no group found
    }

    // Set active nav item based on current path and route groups
    const currentPath = window.location.pathname;
    const activeRouteGroup = getActiveRouteGroup(currentPath);
    console.log('[NavRail] Current path:', currentPath);
    console.log('[NavRail] Active route group:', activeRouteGroup);
    
    // Top-level items
    document.querySelectorAll('.rail-btn').forEach(btn => {
        const btnHref = btn.getAttribute('href');
        // Check if button href matches the active route group
        if (btnHref === activeRouteGroup || btnHref === currentPath) {
            btn.classList.add('active');
        }
    });
    
    // Submenu items and their parent group
    document.querySelectorAll('.nav-dropdown .menu-item, .expanded-menu .menu-item').forEach(link => {
        const linkHref = link.getAttribute('href');
        // Check if link href matches current path or is part of the active route group
        if (linkHref === currentPath || (routeGroups[activeRouteGroup] && routeGroups[activeRouteGroup].includes(linkHref))) {
            link.classList.add('active');
            const parentExpandable = link.closest('.nav-item.expandable');
            const groupBtn = parentExpandable?.querySelector('.rail-btn');
            if (groupBtn) groupBtn.classList.add('active');
        }
    });

    try {
        const chevronIconDefault = document.querySelector('.expandable-btn .chevron-icon');
        if (chevronIconDefault) {
            chevronIconDefault.src = '/assets/images/chevron-down-arrow.svg';
            chevronIconDefault.style.transition = 'transform 150ms ease';
            chevronIconDefault.style.transformOrigin = 'center center';
            console.debug('[NavRail] Set chevron default to down and added rotation transition');
        }
    } catch {}

    // Expandable menu functionality: only toggle when chevron is clicked
    const expandableBtn = document.querySelector('.expandable-btn');
    const expandableItem = document.querySelector('.nav-item.expandable');
    if (expandableBtn && expandableItem) {
        const chevronIcon = expandableBtn.querySelector('.chevron-icon');
        if (chevronIcon) {
            // Initialize rotation based on current state
            const isExpandedInit = expandableItem.classList.contains('expanded');
            chevronIcon.style.transform = isExpandedInit ? 'rotate(180deg)' : 'rotate(0deg)';
            console.debug('[NavRail] Chevron init. expanded=', isExpandedInit, ' transform=', chevronIcon.style.transform);

            chevronIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                expandableItem.classList.toggle('expanded');
                const isExpanded = expandableItem.classList.contains('expanded');
                chevronIcon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
                console.debug('[NavRail] Chevron clicked. expanded=', isExpanded, ' transform=', chevronIcon.style.transform);
            });
        }
    }

    // Side menu arrow functionality
    if (sideMenuArrow && arrowIcon) {
        const mainContent = document.querySelector('.main-content');
        
        sideMenuArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            navRail.classList.toggle('expanded');
            // Toggle expanded class on main content
            if (mainContent) {
                mainContent.classList.toggle('expanded');
            }
            // Rotate arrow icon 180 degrees when expanded
            arrowIcon.style.transform = navRail.classList.contains('expanded') ? 'rotate(180deg)' : '';
        });

        // Close expanded menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!navRail.contains(event.target) && navRail.classList.contains('expanded')) {
                navRail.classList.remove('expanded');
                if (mainContent) {
                    mainContent.classList.remove('expanded');
                }
                arrowIcon.style.transform = '';
            }
        });
    }

    // Language menu functionality
    const languageFab = document.getElementById('languageFab');
    const languageMenu = document.getElementById('languageMenu');
    const languageText = document.querySelector('.language-text');
    const flagPlaceholder = document.querySelector('.flag-placeholder img');
    
    if (languageFab && languageMenu) {
        languageFab.addEventListener('click', (e) => {
            e.stopPropagation();
            languageMenu.style.display = languageMenu.style.display === 'none' ? 'block' : 'none';
        });
        
        document.addEventListener('click', () => { 
            languageMenu.style.display = 'none'; 
        });
        
        document.querySelectorAll('.lang-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.lang-item').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Update the language display
                if (languageText) {
                    languageText.textContent = e.currentTarget.querySelector('span').textContent;
                }
                
                // Update the flag image
                if (flagPlaceholder) {
                    flagPlaceholder.src = e.currentTarget.querySelector('img').src;
                    flagPlaceholder.alt = e.currentTarget.querySelector('span').textContent;
                }
                
                languageMenu.style.display = 'none';
            });
        });
    }

    // User menu functionality
    const userBtn = document.getElementById('userBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (userBtn && userMenu) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
        });
        
        document.addEventListener('click', () => {
            userMenu.style.display = 'none';
        });
    }

    // Handle logout click
    const logoutBtn = document.querySelector('.logout-item');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    window.location.href = '/login';
                } else {
                    alert('Failed to logout');
                }
            } catch (error) {
                alert('Network error. Please try again.');
            }
        });
    }
}

// Universal Form Validation System
class FormValidation {
    constructor() {
        this.errorColor = '#dc2626';
        this.successColor = '#059669';
        this.defaultBorderColor = '#d1d5db';
        this.boundFields = new Set(); // Track fields with event listeners
    }

    /**
     * Show error on a form field with red border and error message
     * @param {string|HTMLElement} fieldIdentifier - Field ID string or DOM element
     * @param {string} message - Error message to display
     */
    showError(fieldIdentifier, message) {
        const field = typeof fieldIdentifier === 'string' 
            ? document.getElementById(fieldIdentifier) 
            : fieldIdentifier;
        
        if (!field) return;

        // Add error class to field
        field.classList.add('field-error');
        field.classList.remove('field-success');

        // Find or create error message element
        let errorElement = this.getErrorElement(field);
        
        // Set error message
        errorElement.textContent = message;
        errorElement.className = 'field-error-message show';
        
        // Add red border and shadow
        field.style.borderColor = this.errorColor;
        field.style.boxShadow = `0 0 0 3px rgba(220, 38, 38, 0.1)`;

        // Bind event listeners to clear error on interaction
        this.bindClearErrorEvents(field);
    }

    /**
     * Show success state on a form field with green border
     * @param {string|HTMLElement} fieldIdentifier - Field ID string or DOM element
     * @param {string} message - Optional success message
     */
    showSuccess(fieldIdentifier, message = '') {
        const field = typeof fieldIdentifier === 'string' 
            ? document.getElementById(fieldIdentifier) 
            : fieldIdentifier;
        
        if (!field) return;

        // Add success class to field
        field.classList.add('field-success');
        field.classList.remove('field-error');

        // Find or create error message element (reused for success)
        let errorElement = this.getErrorElement(field);
        
        // Set success message or clear
        if (message) {
            errorElement.textContent = message;
            errorElement.className = 'field-error-message field-success-message show';
        } else {
            errorElement.textContent = '';
            errorElement.className = 'field-error-message';
        }
        
        // Add green border
        field.style.borderColor = this.successColor;
        field.style.boxShadow = `0 0 0 3px rgba(5, 150, 105, 0.1)`;
    }

    /**
     * Clear error/success state from a form field
     * @param {string|HTMLElement} fieldIdentifier - Field ID string or DOM element
     */
    clearValidation(fieldIdentifier) {
        const field = typeof fieldIdentifier === 'string' 
            ? document.getElementById(fieldIdentifier) 
            : fieldIdentifier;
        
        if (!field) return;

        // Remove classes
        field.classList.remove('field-error', 'field-success');
        
        // Find and clear error message
        let errorElement = this.getErrorElement(field);
        errorElement.textContent = '';
        errorElement.className = 'field-error-message';
        
        // Reset border styles
        field.style.borderColor = this.defaultBorderColor;
        field.style.boxShadow = '';
    }

    /**
     * Clear all validation states from a form
     * @param {string|HTMLElement} formIdentifier - Form ID string or DOM element
     */
    clearAllValidation(formIdentifier) {
        const form = typeof formIdentifier === 'string' 
            ? document.getElementById(formIdentifier) 
            : formIdentifier;
        
        if (!form) return;

        // Clear all fields with error/success states
        const fields = form.querySelectorAll('.field-error, .field-success');
        fields.forEach(field => this.clearValidation(field));

        // Clear all error messages
        const errorMessages = form.querySelectorAll('.field-error-message');
        errorMessages.forEach(msg => {
            msg.textContent = '';
            msg.className = 'field-error-message';
        });

        // Reset bound fields tracking for this form
        this.clearBoundFieldsForForm(form);
    }

    /**
     * Clear bound fields tracking for a specific form
     * @param {HTMLElement} form - The form element
     */
    clearBoundFieldsForForm(form) {
        const formFields = form.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            const fieldId = field.id || field.name || Math.random().toString(36).substr(2, 9);
            this.boundFields.delete(fieldId);
        });
    }

    /**
     * Validate multiple fields at once
     * @param {Array} validations - Array of {field, rule, message} objects
     * @returns {boolean} - True if all validations pass
     */
    validateFields(validations) {
        let isValid = true;
        const errors = [];

        // First pass: collect all validation results
        validations.forEach(validation => {
            const { field, rule, message } = validation;
            const fieldElement = typeof field === 'string' ? document.getElementById(field) : field;
            
            if (!fieldElement) return;

            let fieldValid = true;

            // Run validation rule
            if (typeof rule === 'function') {
                fieldValid = rule(fieldElement.value, fieldElement);
            } else if (Array.isArray(rule)) {
                // Handle multiple rules - all must pass
                fieldValid = rule.every(r => {
                    if (typeof r === 'function') {
                        return r(fieldElement.value, fieldElement);
                    } else if (r === 'required') {
                        return fieldElement.value.trim() !== '';
                    } else if (r === 'email') {
                        return this.isValidEmail(fieldElement.value);
                    } else if (r === 'integer') {
                        return /^\d+$/.test(fieldElement.value.trim());
                    } else if (r === 'phone') {
                        return /^\d{10,15}$/.test(fieldElement.value.replace(/\D/g, ''));
                    } else if (r === 'radio') {
                        // For radio groups, check if any radio with same name is checked
                        const radioName = fieldElement.name;
                        const radioButtons = document.querySelectorAll(`input[name="${radioName}"]`);
                        return Array.from(radioButtons).some(radio => radio.checked);
                    }
                    return true;
                });
            } else if (rule === 'required') {
                fieldValid = fieldElement.value.trim() !== '';
            } else if (rule === 'email') {
                fieldValid = this.isValidEmail(fieldElement.value);
            } else if (rule === 'integer') {
                fieldValid = /^\d+$/.test(fieldElement.value.trim());
            } else if (rule === 'phone') {
                fieldValid = /^\d{10,15}$/.test(fieldElement.value.replace(/\D/g, ''));
            } else if (rule === 'radio') {
                // For radio groups, check if any radio with same name is checked
                const radioName = fieldElement.name;
                const radioButtons = document.querySelectorAll(`input[name="${radioName}"]`);
                fieldValid = Array.from(radioButtons).some(radio => radio.checked);
            }

            // Collect validation results
            if (!fieldValid) {
                errors.push({ field: fieldElement, message });
                isValid = false;
            }
        });

        // Second pass: apply all validation states
        validations.forEach(validation => {
            const { field } = validation;
            const fieldElement = typeof field === 'string' ? document.getElementById(field) : field;
            
            if (!fieldElement) return;

            // Check if this field has an error
            const fieldError = errors.find(error => error.field === fieldElement);
            
            if (fieldError) {
                this.showError(fieldElement, fieldError.message);
            } else {
                this.clearValidation(fieldElement);
            }
        });

        return isValid;
    }

    /**
     * Validate all required fields in a form and show all errors at once
     * @param {string|HTMLElement} formIdentifier - Form ID string or DOM element
     * @param {string} defaultMessage - Default message for empty required fields
     * @returns {boolean} - True if all required fields are filled
     */
    validateRequiredFields(formIdentifier, defaultMessage = 'This field is required.') {
        const form = typeof formIdentifier === 'string' 
            ? document.getElementById(formIdentifier) 
            : formIdentifier;
        
        if (!form) return true;

        // Find all required fields
        const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        const errors = [];

        // Check all required fields
        requiredFields.forEach(field => {
            let isEmpty = false;
            
            if (field.type === 'radio' || field.type === 'checkbox') {
                // For radio/checkbox, check if any in the group is checked
                const name = field.name;
                const checked = form.querySelector(`input[name="${name}"]:checked`);
                isEmpty = !checked;
            } else {
                // For regular inputs and selects
                isEmpty = !field.value || field.value.trim() === '';
            }

            if (isEmpty) {
                // Get custom message from data attribute or use default
                const customMessage = field.getAttribute('data-error-message') || defaultMessage;
                errors.push({ field, message: customMessage });
                isValid = false;
            }
        });

        // Apply all validation states
        requiredFields.forEach(field => {
            const fieldError = errors.find(error => error.field === field);
            
            if (fieldError) {
                this.showError(field, fieldError.message);
            } else {
                this.clearValidation(field);
            }
        });

        return isValid;
    }

    /**
     * Bind event listeners to clear validation errors on user interaction
     * @param {HTMLElement} field - The form field element
     */
    bindClearErrorEvents(field) {
        // Create a unique identifier for the field
        const fieldId = field.id || field.name || Math.random().toString(36).substr(2, 9);
        
        // Skip if already bound
        if (this.boundFields.has(fieldId)) return;
        this.boundFields.add(fieldId);

        // Handle different field types
        if (field.type === 'radio') {
            // For radio buttons, bind to all radios with the same name
            const radioName = field.name;
            const radioButtons = document.querySelectorAll(`input[name="${radioName}"]`);
            
            radioButtons.forEach(radio => {
                radio.addEventListener('change', () => {
                    this.clearValidation(field);
                });
            });
        } else if (field.type === 'checkbox') {
            // For checkboxes
            field.addEventListener('change', () => {
                this.clearValidation(field);
            });
        } else if (field.tagName === 'SELECT') {
            // For select dropdowns
            field.addEventListener('change', () => {
                this.clearValidation(field);
            });
        } else {
            // For text inputs, textareas, etc.
            field.addEventListener('input', () => {
                this.clearValidation(field);
            });
        }
    }

    /**
     * Get or create error message element for a field
     * @param {HTMLElement} field - The form field element
     * @returns {HTMLElement} - The error message element
     */
    getErrorElement(field) {
        // Handle radio button groups differently
        if (field.type === 'radio') {
            const radioGroup = field.closest('.role-selection') || field.closest('.form-field');
            let errorElement = radioGroup.querySelector('.field-error-message');
            
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'field-error-message';
                radioGroup.appendChild(errorElement);
            }
            
            return errorElement;
        }
        
        // Handle select fields - place error outside select-wrapper but inside form-field
        if (field.tagName === 'SELECT') {
            const formField = field.closest('.form-field');
            let errorElement = formField.querySelector('.field-error-message');
            
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'field-error-message';
                formField.appendChild(errorElement);
            }
            
            return errorElement;
        }
        
        let errorElement = field.parentNode.querySelector('.field-error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error-message';
            
            // Insert after the field (or after password container if it exists)
            const passwordContainer = field.closest('.password-input-container');
            const insertAfter = passwordContainer || field;
            insertAfter.parentNode.insertBefore(errorElement, insertAfter.nextSibling);
        }
        
        return errorElement;
    }

    /**
     * Validate radio button group by name
     * @param {string} radioName - Name attribute of radio group
     * @param {string} message - Error message to display
     * @returns {boolean} - True if a radio button is selected
     */
    validateRadioGroup(radioName, message) {
        const radioButtons = document.querySelectorAll(`input[name="${radioName}"]`);
        const isSelected = Array.from(radioButtons).some(radio => radio.checked);
        
        if (!isSelected && radioButtons.length > 0) {
            // Show error on the first radio button (which will show for the group)
            this.showError(radioButtons[0], message);
            return false;
        } else if (radioButtons.length > 0) {
            // Clear error from the group
            this.clearValidation(radioButtons[0]);
            return true;
        }
        
        return true;
    }

    /**
     * Simple email validation
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Show a general form error message at the top of the form
     * @param {string|HTMLElement} formIdentifier - Form ID string or DOM element
     * @param {string} message - Error message to display
     */
    showFormError(formIdentifier, message) {
        const form = typeof formIdentifier === 'string' 
            ? document.getElementById(formIdentifier) 
            : formIdentifier;
        
        if (!form) return;

        // Remove existing form error
        this.clearFormError(form);

        // Create form error element
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error-message';
        errorElement.textContent = message;
        
        // Insert at the beginning of the form
        form.insertBefore(errorElement, form.firstChild);
    }

    /**
     * Clear general form error message
     * @param {string|HTMLElement} formIdentifier - Form ID string or DOM element
     */
    clearFormError(formIdentifier) {
        const form = typeof formIdentifier === 'string' 
            ? document.getElementById(formIdentifier) 
            : formIdentifier;
        
        if (!form) return;

        const existingError = form.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }
    }
}

// Create global instance
window.formValidation = new FormValidation();