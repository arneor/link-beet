import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                brutal: "1rem", // Standard rounded corner for cards
                'brutal-lg': "1.5rem", // Larger cards
                'brutal-xl': "2rem", // Feature sections
                'pill': "9999px", // Buttons
            },
            colors: {
                // Neo-Brutalist Palette
                lime: {
                    DEFAULT: "hsl(var(--lime) / <alpha-value>)",
                    foreground: "hsl(var(--dark-green) / <alpha-value>)",
                },
                'dark-green': {
                    DEFAULT: "hsl(var(--dark-green) / <alpha-value>)",
                    foreground: "hsl(var(--white) / <alpha-value>)",
                },
                purple: {
                    DEFAULT: "hsl(var(--purple) / <alpha-value>)",
                    foreground: "hsl(var(--white) / <alpha-value>)",
                },
                'dark-red': "hsl(var(--dark-red) / <alpha-value>)",
                blue: "hsl(var(--blue) / <alpha-value>)",
                pink: "hsl(var(--pink) / <alpha-value>)",
                cream: "hsl(var(--cream) / <alpha-value>)",

                // Shadcn/UI Standard Enforcers
                background: "hsl(var(--background) / <alpha-value>)",
                foreground: "hsl(var(--foreground) / <alpha-value>)",
                card: {
                    DEFAULT: "hsl(var(--card) / <alpha-value>)",
                    foreground: "hsl(var(--card-foreground) / <alpha-value>)",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover) / <alpha-value>)",
                    foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary) / <alpha-value>)",
                    foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
                    foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted) / <alpha-value>)",
                    foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent) / <alpha-value>)",
                    foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
                    foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
                },
                border: "hsl(var(--border) / <alpha-value>)",
                input: "hsl(var(--input) / <alpha-value>)",
                ring: "hsl(var(--ring) / <alpha-value>)",
            },
            fontFamily: {
                sans: ["var(--font-body)"],
                display: ["var(--font-display)"],
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                float: "float 6s ease-in-out infinite",
            },
        },
    },
    plugins: [tailwindcssAnimate, typography],
};

export default config;

