export default function Button({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    onClick,
    className = '',
}) {
    const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed duration-200'

    const variants = {
        primary:   'bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white',
        secondary: 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700',
        danger:    'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500',
        ghost:     'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800',
    }

    const sizes = {
        sm: 'text-sm px-3 py-1.5',
        md: 'text-sm px-4 py-2.5',
        lg: 'text-base px-6 py-3',
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {loading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            {children}
        </button>
    )
}