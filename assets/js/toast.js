/**
 * Toast Notification Component
 * Easy-to-use toast notifications with customizable icons and messages
 */

class Toast {
    static instance = null;

    constructor() {
        if (Toast.instance) {
            return Toast.instance;
        }
        this.container = null;
        this.toasts = new Map();
        this.init();
        Toast.instance = this;
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    /**
     * Show a toast notification
     * @param {Object} options - Toast configuration
     * @param {string} options.type - Toast type: 'success', 'error', 'warning', 'info'
     * @param {string} options.title - Toast title
     * @param {string} options.message - Toast message (optional)
     * @param {string} options.icon - Custom icon path (optional, defaults to type-based icon)
     * @param {number} options.duration - Auto-dismiss duration in ms (0 = no auto-dismiss, default: 3000)
     * @param {boolean} options.closable - Show close button (default: false)
     * @param {boolean} options.showProgress - Show progress bar (default: false)
     * @param {function} options.onClose - Callback when toast is closed
     * @returns {string} Toast ID for manual control
     */
    show(options = {}) {
        const {
            type = 'info',
            title = '',
            message = '',
            icon = null,
            duration = 3000,
            closable = false,
            onClose = null,
            showProgress = false
        } = options;

        const toastId = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('data-toast-id', toastId);

        // Get icon source
        const iconSrc = icon || this.getDefaultIcon(type);

        // Build toast HTML
        toast.innerHTML = `
            ${iconSrc ? `<div class="toast-icon">${this.getIconHTML(iconSrc)}</div>` : ''}
            <div class="toast-content">
                ${title ? `<div class="toast-title">${this.escapeHtml(title)}</div>` : ''}
                ${message ? `<div class="toast-message">${this.escapeHtml(message)}</div>` : ''}
            </div>
            ${closable ? '<button class="toast-close" type="button">&times;</button>' : ''}
            ${duration > 0 && showProgress ? '<div class="toast-progress"></div>' : ''}
        `;

        // Add to container
        this.container.appendChild(toast);

        // Store toast reference
        this.toasts.set(toastId, {
            element: toast,
            timer: null,
            onClose: onClose
        });

        // Add event listeners
        if (closable) {
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => this.hide(toastId));
        }

        // Show animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto-dismiss setup
        if (duration > 0) {
            const progressBar = toast.querySelector('.toast-progress');
            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.style.transitionDuration = duration + 'ms';
                setTimeout(() => {
                    progressBar.style.width = '0%';
                }, 50);
            }

            const timer = setTimeout(() => {
                this.hide(toastId);
            }, duration);

            this.toasts.get(toastId).timer = timer;
        }

        return toastId;
    }

    /**
     * Hide a specific toast
     * @param {string} toastId - Toast ID to hide
     */
    hide(toastId) {
        const toastData = this.toasts.get(toastId);
        if (!toastData) return;

        const { element, timer, onClose } = toastData;

        // Clear timer if exists
        if (timer) {
            clearTimeout(timer);
        }

        // Hide animation
        element.classList.add('hide');
        element.classList.remove('show');

        // Remove from DOM after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(toastId);

            // Call onClose callback
            if (onClose && typeof onClose === 'function') {
                onClose(toastId);
            }
        }, 300);
    }

    /**
     * Hide all toasts
     */
    hideAll() {
        this.toasts.forEach((_, toastId) => {
            this.hide(toastId);
        });
    }

    /**
     * Get default icon for toast type
     * @param {string} type - Toast type
     * @returns {string} Icon path
     */
    getDefaultIcon(type) {
        const icons = {
            success: '/assets/images/success.svg',
            error: '/assets/images/error.svg',
            warning: '/assets/images/warning.svg',
            info: '/assets/images/info.svg'
        };
        return icons[type] || null;
    }

    /**
     * Get icon HTML based on source
     * @param {string} iconSrc - Icon source (path or SVG string)
     * @returns {string} Icon HTML
     */
    getIconHTML(iconSrc) {
        if (iconSrc.startsWith('<svg')) {
            return iconSrc;
        } else {
            return `<img src="${iconSrc}" alt="Toast icon" />`;
        }
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Static methods for convenience
    static getInstance() {
        if (!Toast.instance) {
            Toast.instance = new Toast();
        }
        return Toast.instance;
    }

    static show(options) {
        return Toast.getInstance().show(options);
    }

    static success(title, message = '', options = {}) {
        return Toast.getInstance().show({ ...options, type: 'success', title, message });
    }

    static error(title, message = '', options = {}) {
        return Toast.getInstance().show({ ...options, type: 'error', title, message });
    }

    static warning(title, message = '', options = {}) {
        return Toast.getInstance().show({ ...options, type: 'warning', title, message });
    }

    static info(title, message = '', options = {}) {
        return Toast.getInstance().show({ ...options, type: 'info', title, message });
    }

    static hideAll() {
        Toast.getInstance().hideAll();
    }
}

// Initialize Toast instance
document.addEventListener('DOMContentLoaded', () => {
    Toast.getInstance();
    // Make Toast globally available
    window.Toast = Toast;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Toast;
}