import type {
  InputHTMLAttributes,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={props.id}
        className="block text-sm font-semibold text-[#101E33]"
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-[#8A96A8]
            "
          >
            {icon}
          </span>
        )}

        <input
          {...props}
          className={`
            h-12
            w-full
            rounded-xl
            border
            bg-white
            text-sm
            text-[#101E33]
            outline-none
            transition-all
            duration-200

            placeholder:text-[#A5ADBA]

            ${
              icon
                ? "pl-11 pr-4"
                : "px-4"
            }

            ${
              error
                ? "border-[#C0272D] focus:ring-4 focus:ring-red-100"
                : "border-[#E1E5EA] focus:border-[#1B3A6B] focus:ring-4 focus:ring-blue-50"
            }

            hover:border-[#C5CBD4]
          `}
        />
      </div>

      {error && (
        <p className="text-xs font-medium text-[#C0272D]">
          {error}
        </p>
      )}
    </div>
  );
}