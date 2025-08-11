/** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
      ],
      theme: {
        extend: {
          fontFamily: {
            sans: ["Poppins", "ui-sans-serif", "system-ui"],
          },
          colors: {
            // Surfaces
            surface:   "#FFFFFF",  // cards, chat panel
            canvas:    "#F9FAFB",  // page background (very light gray)

            // Text
            ink:       "#111827",  // primary headings (e.g., "Living Profiles")
            muted:     "#6B7280",  // secondary text (subtitles, hints)
            subtle:    "#9CA3AF",  // tertiary/help text (placeholders, empty state)

            // Lines & UI chrome
            line:         "#E5E7EB", // light borders/dividers (card outlines)
            lineStrong:   "#D1D5DB", // slightly stronger strokes if needed

            // Inputs & buttons (neutral look in your screenshot)
            inputBg:      "#FFFFFF",
            inputBorder:  "#E5E7EB",
            inputRing:    "#6366F1", // focus ring (indigo – feel free to change)
            btn:          "#6B7280", // “Search” button fill (neutral gray)
            btnHover:     "#4B5563",
            btnText:      "#FFFFFF",

            // Icons
            icon:      "#9CA3AF",  // outline icons in empty states / headings

            // Optional semantic statuses (not visible yet but handy)
            success:   "#10B981",
            warning:   "#F59E0B",
            danger:    "#EF4444",
          },
        },
      },
      plugins: [],
    }