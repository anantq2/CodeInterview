import { Loader2Icon } from "lucide-react";

function LoadingSpinner({ size = "lg", text = "Loading...", fullScreen = false }) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2Icon className={`${sizeClasses[size]} animate-spin text-primary`} />
            {text && <p className="text-base-content/70 text-sm font-medium">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            {spinner}
        </div>
    );
}

export default LoadingSpinner;
