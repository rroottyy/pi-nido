export default function Spinner({ size = 'md' }) {
    const sizes = {
        sm: 'w-5 h-5 border-2',
        md: 'w-10 h-10 border-4',
        lg: 'w-16 h-16 border-4',
    }
    return (
        <div className="flex justify-center items-center py-20">
            <div className={`${sizes[size]} border-gray-200 border-t-gray-800 rounded-full animate-spin`}></div>
        </div>
    )
}