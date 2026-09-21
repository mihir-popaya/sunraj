import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
}

export default function Button({
  children,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className="
        group
        flex
        h-12
        w-full
        items-center
        justify-center
        gap-3
        rounded-xl
        bg-[#C0272D]
        px-5
        text-sm
        font-bold
        text-white
        shadow-sm
        transition-all
        duration-200

        hover:bg-[#A91F25]
        hover:shadow-lg
        hover:shadow-red-900/10

        active:scale-[0.99]

        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {loading ? (
        <>
          <span
            className="
              h-4
              w-4
              animate-spin
              rounded-full
              border-2
              border-white/30
              border-t-white
            "
          />

          Signing in...
        </>
      ) : (
        children
      )}
    </button>
  );
}