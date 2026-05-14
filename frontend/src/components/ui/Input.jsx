export default function Input({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    required = false,
    maxLength,
    className = '',
}) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                    {label} {required && <span className="text-red-400 dark:text-red-500">*</span>}
                </label>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-500
                    ${error
                        ? 'border-red-300 focus:border-red-400 bg-red-50 text-gray-900 dark:border-red-500/50 dark:focus:border-red-500 dark:bg-red-900/20 dark:text-white'
                        : 'border-gray-200 focus:border-gray-400 bg-white text-gray-900 dark:border-gray-700 dark:focus:border-gray-500 dark:bg-gray-800 dark:text-white'
                    }`}
            />
            {error && <p className="text-xs text-red-500 dark:text-red-400 transition-colors">{error}</p>}
            {maxLength && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-right transition-colors">
                    {value?.length || 0}/{maxLength}
                </p>
            )}
        </div>
    )
}