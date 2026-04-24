import  type  {  Config  }  from  "tailwindcss";
import  tailwindcssAnimate  from  "tailwindcss-animate";

const  config:  Config  =  {
    darkMode:  ["class"],
    content:  [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}",
        "./hooks/**/*.{ts,tsx}"
    ],
    theme:  {
        container:  {
            center:  true,
            padding:  "1rem",
            screens:  {
                "2xl":  "1280px"
            }
        },
        extend:  {
            colors:  {
                border:  "hsl(var(--border))",
                input:  "hsl(var(--input))",
                ring:  "hsl(var(--ring))",
                background:  "hsl(var(--background))",
                foreground:  "hsl(var(--foreground))",
                primary:  {
                    DEFAULT:  "hsl(var(--primary))",
                    foreground:  "hsl(var(--primary-foreground))"
                },
                secondary:  {
                    DEFAULT:  "hsl(var(--secondary))",
                    foreground:  "hsl(var(--secondary-foreground))"
                },
                muted:  {
                    DEFAULT:  "hsl(var(--muted))",
                    foreground:  "hsl(var(--muted-foreground))"
                },
                accent:  {
                    DEFAULT:  "hsl(var(--accent))",
                    foreground:  "hsl(var(--accent-foreground))"
                },
                card:  {
                    DEFAULT:  "hsl(var(--card))",
                    foreground:  "hsl(var(--card-foreground))"
                },
                gold:  {
                    400:  "hsl(var(--gold-400))",
                    500:  "hsl(var(--gold-500))",
                    600:  "hsl(var(--gold-600))"
                }
            },
            fontFamily:  {
                sans:  ["var(--font-body)",  "ui-sans-serif",  "system-ui",  "sans-serif"],
                serif:  ["var(--font-heading)",  "ui-serif",  "Georgia",  "serif"]
            },
            borderRadius:  {
                lg:  "var(--radius)",
                md:  "calc(var(--radius)  -  2px)",
                sm:  "calc(var(--radius)  -  4px)"
            },
            boxShadow:  {
                luxe:  "0  12px  32px  -12px  hsla(41,  45%,  45%,  0.35)",
                soft:  "0  10px  30px  -16px  hsla(0,  0%,  0%,  0.5)"
            },
            backgroundImage:  {
                "hero-glow":
                    "radial-gradient(circle  at  top,  hsla(42,  40%,  45%,  0.22),  transparent  45%)",
                "gold-line":
                    "linear-gradient(90deg,  transparent,  hsla(42,  45%,  55%,  0.6),  transparent)"
            }
        }
    },
    plugins:  [tailwindcssAnimate]
};

export  default  config;
