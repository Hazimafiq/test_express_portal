/**
 * Custom Date Picker Component
 * A reusable calendar-style date picker that can be used across different pages
 */

class CustomDatePicker {
    constructor(inputElement, options = {}) {
        this.input = inputElement;
        this.options = {
            minDate: options.minDate || null,
            maxDate: options.maxDate || null,
            format: options.format || 'YYYY-MM-DD',
            placeholder: options.placeholder || 'Select',
            ...options
        };
        
        this.currentDate = new Date();
        this.selectedDate = null;
        this.isOpen = false;
        
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        this.weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        
        this.init();
    }
    
    init() {
        this.createDatePickerHTML();
        this.attachEventListeners();
        this.updateCalendar();
        
        // Set initial value if input has a value
        if (this.input.value) {
            this.selectedDate = new Date(this.input.value);
            this.updateInputDisplay();
        }
    }
    
    createDatePickerHTML() {
        // Wrap the input in a custom date picker container
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-date-picker';
        
        // Create input wrapper
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'date-input-wrapper';
        
        // Replace the original input
        this.input.parentNode.insertBefore(wrapper, this.input);
        wrapper.appendChild(inputWrapper);
        inputWrapper.appendChild(this.input);
        
        // Update input classes and attributes
        this.input.className = 'date-input';
        this.input.type = 'text';
        this.input.placeholder = this.options.placeholder;
        this.input.readOnly = true;
        
        // Add calendar icon
        const calendarIcon = document.createElement('div');
        calendarIcon.className = 'calendar-icon';
        inputWrapper.appendChild(calendarIcon);
        
        // Create calendar dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'calendar-dropdown date-menu';
        dropdown.innerHTML = `
            <div class="calendar-header date-header">
                <button type="button" class="calendar-nav-btn date-nav prev" data-dir="-1">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(180deg);">
                        <path d="M5.07617 3.42383C4.84178 3.18943 4.84176 2.8105 5.07617 2.57617C5.31055 2.34195 5.68948 2.34169 5.92383 2.57617L10.9238 7.57617C11.0409 7.69328 11.0996 7.84666 11.0996 8C11.0996 8.15333 11.0409 8.30673 10.9238 8.42383L5.92383 13.4238C5.68942 13.6582 5.31048 13.6583 5.07617 13.4238C4.84196 13.1895 4.84173 12.8105 5.07617 12.5762L9.65234 8L5.07617 3.42383Z" fill="#333333" stroke="#333333" stroke-width="0.2"/>
                    </svg>
                </button>
                <div class="calendar-month-year date-title">Month YYYY</div>
                <button type="button" class="calendar-nav-btn date-nav next" data-dir="1">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.07617 3.42383C4.84178 3.18943 4.84176 2.8105 5.07617 2.57617C5.31055 2.34195 5.68948 2.34169 5.92383 2.57617L10.9238 7.57617C11.0409 7.69328 11.0996 7.84666 11.0996 8C11.0996 8.15333 11.0409 8.30673 10.9238 8.42383L5.92383 13.4238C5.68942 13.6582 5.31048 13.6583 5.07617 13.4238C4.84196 13.1895 4.84173 12.8105 5.07617 12.5762L9.65234 8L5.07617 3.42383Z" fill="#333333" stroke="#333333" stroke-width="0.2"/>
                    </svg>
                </button>
            </div>
            <div class="calendar-weekdays date-weekdays">
                ${this.weekdays.map(day => `<span>${day}</span>`).join('')}
            </div>
            <div class="calendar-days date-grid"></div>
        `;
        
        wrapper.appendChild(dropdown);
        
        this.wrapper = wrapper;
        this.dropdown = dropdown;
        this.monthYearDisplay = dropdown.querySelector('.date-title');
        this.daysContainer = dropdown.querySelector('.date-grid');
    }
    
    attachEventListeners() {
        // Input click to open calendar
        this.input.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });
        
        // Calendar icon click
        this.wrapper.querySelector('.calendar-icon').addEventListener('click', () => {
            this.toggle();
        });
        
        // Month navigation
        this.dropdown.querySelector('.prev').addEventListener('click', () => {
            this.previousMonth();
        });
        
        this.dropdown.querySelector('.next').addEventListener('click', () => {
            this.nextMonth();
        });
        
        // Close calendar when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.wrapper.contains(e.target)) {
                this.close();
            }
        });
        
        // Keyboard navigation
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.dropdown.classList.add('open');
        this.updateCalendar();
    }
    
    close() {
        this.isOpen = false;
        this.dropdown.classList.remove('open');
    }
    
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.updateCalendar();
    }
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.updateCalendar();
    }
    
    updateCalendar() {
        this.updateMonthYearDisplay();
        this.updateDaysGrid();
    }
    
    updateMonthYearDisplay() {
        const monthName = this.monthNames[this.currentDate.getMonth()];
        const year = this.currentDate.getFullYear();
        this.monthYearDisplay.textContent = `${monthName} ${year}`;
    }
    
    updateDaysGrid() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Get first day of week (Monday = 0)
        let startingDayOfWeek = firstDay.getDay() - 1;
        if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sunday becomes 6
        
        // Get days from previous month
        const prevMonth = new Date(year, month - 1, 0);
        const daysFromPrevMonth = prevMonth.getDate();
        
        // Clear days container
        this.daysContainer.innerHTML = '';
        
        const today = new Date();
        const todayStr = this.formatDate(today);
        
        // Add days from previous month
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const day = daysFromPrevMonth - i;
            const date = new Date(year, month - 1, day);
            const button = this.createDayButton(day, date, ' muted');
            this.daysContainer.appendChild(button);
        }
        
        // Add days from current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            const isToday = dateStr === todayStr;
            const isSelected = this.selectedDate && dateStr === this.formatDate(this.selectedDate);
            
            let classes = '';
            if (isSelected) classes += ' active';
            else if (isToday) classes += ' today';
            
            const button = this.createDayButton(day, date, classes);
            this.daysContainer.appendChild(button);
        }
        
        // Add days from next month to fill the grid
        const totalCells = this.daysContainer.children.length;
        const remainingCells = 35 - totalCells; // 5 rows × 7 days
        
        for (let day = 1; day <= Math.min(remainingCells, 14); day++) {
            const date = new Date(year, month + 1, day);
            const button = this.createDayButton(day, date, ' muted');
            this.daysContainer.appendChild(button);
        }
    }
    
    createDayButton(day, date, classes = '') {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `calendar-day date-cell${classes}`;
        button.textContent = day;
        
        // Check if date should be disabled
        const isDisabled = this.isDateDisabled(date);
        if (isDisabled) {
            button.disabled = true;
        } else {
            button.addEventListener('click', () => {
                this.selectDate(date);
            });
        }
        
        return button;
    }
    
    isDateDisabled(date) {
        if (this.options.minDate && date < this.options.minDate) {
            return true;
        }
        if (this.options.maxDate && date > this.options.maxDate) {
            return true;
        }
        return false;
    }
    
    selectDate(date) {
        this.selectedDate = new Date(date);
        this.updateInputDisplay();
        this.updateCalendar();
        this.close();
        
        // Trigger both change and input events to ensure validation system catches it
        const changeEvent = new Event('change', { bubbles: true });
        const inputEvent = new Event('input', { bubbles: true });
        this.input.dispatchEvent(changeEvent);
        this.input.dispatchEvent(inputEvent);
    }
    
    updateInputDisplay() {
        if (this.selectedDate) {
            this.input.value = this.formatDate(this.selectedDate);
            this.input.classList.add('has-value');
        } else {
            this.input.value = '';
            this.input.classList.remove('has-value');
        }
    }
    
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        switch (this.options.format) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'DD-MM-YYYY':
                return `${day}-${month}-${year}`;
            default:
                return `${year}-${month}-${day}`;
        }
    }
    
    // Public methods
    getValue() {
        return this.selectedDate ? this.formatDate(this.selectedDate) : '';
    }
    
    setValue(value) {
        if (value) {
            this.selectedDate = new Date(value);
            this.updateInputDisplay();
            this.updateCalendar();
            
            // Trigger events when value is set programmatically
            const changeEvent = new Event('change', { bubbles: true });
            const inputEvent = new Event('input', { bubbles: true });
            this.input.dispatchEvent(changeEvent);
            this.input.dispatchEvent(inputEvent);
        } else {
            this.selectedDate = null;
            this.updateInputDisplay();
            
            // Trigger events when value is cleared
            const changeEvent = new Event('change', { bubbles: true });
            const inputEvent = new Event('input', { bubbles: true });
            this.input.dispatchEvent(changeEvent);
            this.input.dispatchEvent(inputEvent);
        }
    }
    
    setMinDate(date) {
        this.options.minDate = date ? new Date(date) : null;
        this.updateCalendar();
    }
    
    setMaxDate(date) {
        this.options.maxDate = date ? new Date(date) : null;
        this.updateCalendar();
    }
    
    destroy() {
        // Remove event listeners and restore original input
        if (this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.insertBefore(this.input, this.wrapper);
            this.wrapper.remove();
        }
    }
}

// Utility function to initialize date pickers
function initializeDatePickers(selector = '[data-date-picker]', options = {}) {
    const elements = document.querySelectorAll(selector);
    const instances = [];
    
    elements.forEach(element => {
        // Get options from data attributes
        const dataOptions = {
            minDate: element.dataset.minDate ? new Date(element.dataset.minDate) : null,
            maxDate: element.dataset.maxDate ? new Date(element.dataset.maxDate) : null,
            format: element.dataset.format || 'YYYY-MM-DD',
            placeholder: element.dataset.placeholder || 'Select'
        };
        
        const mergedOptions = { ...dataOptions, ...options };
        const instance = new CustomDatePicker(element, mergedOptions);
        instances.push(instance);
    });
    
    return instances;
}

// Auto-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDatePickers();
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CustomDatePicker, initializeDatePickers };
}

// Global scope for direct script inclusion
window.CustomDatePicker = CustomDatePicker;
window.initializeDatePickers = initializeDatePickers;
