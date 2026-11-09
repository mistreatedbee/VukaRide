# Prompt: Vuka Ride website frontend (for v0 / Magic Patterns)

Paste everything below the line into the tool. If the tool has an image or file upload, also attach the logo SVGs (logo-horizontal.svg, logo-horizontal-white.svg, mark-color.svg, mark-white.svg, app-icon-rounded.svg) and a screenshot of the app. The prompt works without them, because the mark is included as inline SVG.

---

## 1. What to build

Build the complete marketing website frontend for **Vuka Ride**, a ride-hailing app for Africa. "Vuka" means "rise / wake up". Tagline: **"Moving Africa Forward"**. The site's jobs are:

1. Get riders to download the app (Google Play and App Store).
2. Recruit drivers ("Drive with us").
3. Build trust (safety, verified drivers).
4. Provide the legal and support pages the app stores require (Privacy Policy, Terms, Delete Account, Contact).

This is a frontend only. Use mock data and placeholders; no real backend. Forms should validate and show a success state, then log the data to the console, with a clearly marked `// TODO: connect to API` comment.

## 2. Tech stack

- Next.js (App Router) with TypeScript.
- Tailwind CSS with the design tokens in section 3 defined in `tailwind.config` (or CSS variables).
- shadcn/ui components where useful (Button, Accordion, Sheet for the mobile menu, Input, Select, Textarea, Label, Checkbox).
- `lucide-react` for icons. No emoji anywhere.
- Poppins via `next/font/google` (weights 400, 500, 600, 700).
- `react-hook-form` and `zod` for form validation.
- Fully responsive, mobile first. Test at 360px, 390px, 768px, 1024px and 1440px. No horizontal scrolling at any width.
- Semantic HTML, one `<h1>` per page, visible focus rings, `alt` text on images, `aria-label` on icon-only buttons, keyboard-navigable menu and accordion, and `prefers-reduced-motion` respected.
- Per-page metadata (title, description, Open Graph) via the Next.js metadata API.

## 3. Brand and design tokens

**Personality:** trustworthy, warm, confident, modern African. Clean and spacious, not corporate-cold. The sunrise (a gold sun rising out of a V-shaped road) is the brand idea.

**Colours (use exactly these):**

| Token | Hex | Use |
|---|---|---|
| deep | #064E2B | Primary dark. Headings on light, dark sections, footer base |
| green | #0B8F3E | Brand green. Gradients, large shapes, icons |
| green-600 | #097235 | **Button and link green for white text** (passes contrast) |
| night | #04371F | Darkest green. Gradient ends, footer |
| orange | #F57C00 | Accent for large text, icons, graphics only |
| sun | #FFB300 | Accent. The sun, badges, highlights, primary CTA on dark |
| ink | #111827 | Body text on light |
| slate | #4B5563 | Secondary text |
| mist | #F5F7F5 | Light section background |
| leaf | #D1FAE5 | Light green text on dark backgrounds |
| white | #FFFFFF | |

Green scale for tints: 50 #EBF6F0, 100 #D3EBDC, 200 #A7D7BA, 300 #76C093, 400 #41A868, 500 #0B8F3E, 600 #097235, 700 #064E2B, 800 #054225, 900 #04371F.

**Colour balance:** roughly 40% deep green, 30% white and mist, 20% brand green, and only about 10% orange and gold. The gold is the spark: use it for the sun, one highlighted word in a headline, badges, step numbers and the main call to action on dark backgrounds.

**Contrast rules (important):**
- Never put white text on #0B8F3E at small sizes (4.2:1). Use #097235 for buttons and any small white-on-green text.
- Never use orange #F57C00 for small text on white or white text on orange (2.7:1). Orange is for large text, icons and graphics only.
- Gold #FFB300 buttons use ink #111827 text (9.9:1). Gold text on deep green is fine (5.5:1).
- Body text: ink or slate on white or mist. Small text on dark: leaf or white.

**Gradients:** brand gradient `linear-gradient(135deg, #0B8F3E 0%, #064E2B 55%, #04371F 100%)`. Sun gradient `linear-gradient(180deg, #FFB300, #FF7A00)`.

**Typography (Poppins):**
- H1: 700, 40px mobile to 68px desktop, line-height 1.05, letter-spacing -0.02em.
- H2: 700, 30px to 44px, line-height 1.12.
- H3: 600, 20 to 22px.
- Body: 400, 16 to 18px, line-height 1.6 to 1.7.
- Eyebrow labels: 600, 12 to 13px, uppercase, letter-spacing 0.14em, in green-600 on light or gold on dark.

**Shape and spacing:** cards 24px radius, buttons fully rounded (pill) or 14px for store buttons, large panels 28 to 36px radius. Section padding 64 to 96px vertical on desktop, 48px on mobile. Content max-width 1200px with 20px mobile and 64px desktop side padding. Touch targets at least 44px.

**Motion:** subtle only. Fade and rise on scroll for sections (200 to 400ms), button hover brightness change, accordion expand. Nothing flashy, and everything disabled under `prefers-reduced-motion`.

## 4. The logo mark (inline SVG, use this exactly)

The mark is a bold white V (the road) with a gold sun rising in its mouth. Build a `<VukaMark />` React component from this. It scales to any size, and `variant` switches the V colour (white on dark backgrounds, #064E2B on light).

```tsx
export function VukaMark({ size = 48, variant = "white" }: { size?: number; variant?: "white" | "green" }) {
  const v = variant === "white" ? "#FFFFFF" : "#064E2B";
  return (
    <svg width={size} height={size} viewBox="64 64 384 384" aria-hidden="true">
      <defs>
        <linearGradient id="vukaSun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB300" />
          <stop offset="1" stopColor="#FF7A00" />
        </linearGradient>
      </defs>
      <path d="M138 196 L256 388 L374 196" fill="none" stroke={v} strokeWidth="76" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="256" cy="158" r="46" fill="url(#vukaSun)" />
    </svg>
  );
}
```

**Wordmark:** "Vuka" + "Ride" set in Poppins Bold with tight tracking (-0.015em), no space between them. "Vuka" in deep green #064E2B (or white on dark), "Ride" in orange #F57C00 (or gold #FFB300 on dark). Build a `<VukaLogo />` component: mark on the left, wordmark on the right, with a `theme` prop of `light` or `dark`. If logo files are attached, use them instead.

**App icon:** a rounded square (radius about 22%) with the brand gradient background and the white-V-plus-sun mark centred. Use it in the download section and the favicon.

## 5. Brand patterns (build as CSS or SVG backgrounds)

Use these tone-on-tone and very subtle (white at 10% opacity on dark, deep green at 12% opacity on light):

1. **Road zigzag** (60px tile): a rounded zigzag line (stroke 7px, `M0 15 L30 45 L60 15`) with a small gold dot above each bend (r 4.5, gold at 45% opacity). Use on the hero and the download banner.
2. **Mark repeat** (120px tile): the V and sun mark at 52px, repeated in a half-drop grid. Use on the dark safety section.
3. **Sunrise dots** (96px tile): a 4x4 grid of tiny dots with one larger orange dot per tile. Use on the light "How it works" section.
4. **Lane lines**: short dashed rounded bars slanted at -18 degrees, alternating grey and orange. Optional accent on cards.

## 6. Global layout

**Header:** sticky, transparent over the hero and turning solid deep green with a subtle shadow after 24px of scroll. Logo (dark theme) on the left; centre nav links: How it works, Safety, Drive with us, FAQ; right: a gold pill button "Get the app". On mobile, show a hamburger icon (44px) that opens a full-height sheet with the same links, large and tappable, plus both store buttons.

**Footer** (night #04371F): logo (dark theme), tagline "Moving Africa Forward.", three link columns (Explore: How it works, Safety, Drive with us, FAQ; Company: About, Contact; Legal: Privacy Policy, Terms of Service, Delete account), a contact column with placeholders `[support@yourdomain]` and `[+27 00 000 0000]`, social icon links (Facebook, Instagram, X, WhatsApp) to `#`, and a bottom line "© 2026 Vuka Ride. All rights reserved." separated by a hairline border at 20% leaf.

**Store buttons:** build a reusable `<StoreButtons />` with two white rounded buttons (14px radius, min-height 44px): a download icon, small label "Get it on" over "Google Play", and "Download on the" over "App Store". Both link to `#` with `// TODO: real store URLs`. Do not imitate the official badge artwork.

## 7. Pages and sections

### Page 1: Home (`/`)

1. **Hero** (brand gradient plus road-zigzag pattern). Left: eyebrow pill "Moving Africa Forward"; H1 "**Vuka.** Your ride is waiting." (the word "Vuka." in gold); sub-copy "Request a ride in a few taps, meet a verified driver, and get where you are going safely."; store buttons. Right: a phone mockup (320x640, dark bezel, 46px radius) showing an app screen: a pale green map with white roads, a green route line from a white origin dot to a gold destination dot, the small logo in a white pill top-left, and a white bottom sheet with "Where to?", a search field "Search destination", two saved places (Home, Work) and a green "Request a ride" button. If the app screenshot is attached, use it inside the phone frame instead. Stack on mobile (text first, phone below).
2. **Why Vuka Ride** (white). Centred eyebrow, H2 "Built for everyday journeys", one-line intro, then three cards on a mist background: *Verified drivers* (shield-check icon), *Follow your trip* (map-pin), *Clear fares* (receipt). Each icon sits in a 56px deep-green rounded square with a white icon.
3. **How it works** (mist plus sunrise-dots pattern). H2 "Three taps from here to there". Three white bordered cards with gold numbered circles: 1 Request, 2 Meet your driver, 3 Arrive.
4. **Safety** (night plus mark-repeat pattern). Two columns. Left: gold eyebrow "Safety first", H2 "Every ride, looked after", intro, and a checklist with gold check circles: Verified driver badge and ID; Share your trip; Help when you need it. Right: a white card, rotated -2 degrees, containing a **car door decal graphic** (build it in code: green rounded rectangle with gold inner border, the mark, the wordmark, "MOVING AFRICA FORWARD" small caps, a divider, "VERIFIED DRIVER" and "Download the Vuka Ride app") and the caption "Look for this sticker on every Vuka Ride car."
5. **Drive with us** (white section, big gold #FFB300 rounded panel). Left: eyebrow, H2 "Drive with Vuka Ride", copy "Join the drivers moving Africa forward. [Add driver requirements and earnings details here.]", deep-green pill button "Apply to drive" linking to `/drive`. Right: three white pill rows with deep-green numbered circles: Sign up in the app; Upload your documents; Get verified and start driving.
6. **Download banner** (green-600 to night gradient plus road-zigzag pattern, centred). App icon (96px, rounded, shadow), H2 "Ready to ride?", "Download Vuka Ride and rise to your next trip.", store buttons.
7. **FAQ** (white, max-width 820px). Accordion with five items (use shadcn Accordion): Where is Vuka Ride available? ([Add your launch cities here.]); How do I pay for a ride? ([Add the payment methods the app supports.]); How do I become a driver?; What if I need help during a trip? ([Add support details.]); How is my information used? (summary plus link to `/privacy`). Plus-to-minus icon, 18px bold questions.

### Page 2: Drive with us (`/drive`)

- Hero in deep green with the road-zigzag pattern: eyebrow "Drive with us", H1 "Drive. Earn. Move Africa forward.", gold button "Apply now" that scrolls to the form.
- Benefits grid (4 cards): Flexible hours; Clear earnings ([Add earnings details]); Verified and respected (driver ID and sticker); Support when you need it.
- Requirements checklist, with placeholders: valid driver's licence and PrDP where required, vehicle details, identity document, proof of address, clean vehicle in good condition. Mark with `[Confirm requirements]`.
- 3-step "How to start" timeline.
- **Driver application form** (card, two-column on desktop): full name, mobile number, email, city (select with placeholder cities), vehicle make and model, vehicle year, licence plate, "I have a valid driver's licence" and "I agree to the Terms and Privacy Policy" checkboxes (required). Inline validation, a loading state on submit, and a success panel ("Thanks, we have your details. We will be in touch.").
- FAQ for drivers (3 items), then the download banner.

### Page 3: Safety (`/safety`)

Hero, then a feature grid (6 cards): Verified drivers and ID; Know your driver and car before you ride; Share your trip; Help during a trip; Rate and report; Safety tips. Then a "Safety tips for riders" and a "Safety standards for drivers" list. Placeholders where specifics are needed.

### Page 4: About (`/about`)

Story section ("Vuka" means to rise or wake up), a mission block "Moving Africa Forward", a values grid (Safety, Dignity, Community, Reliability), and the download banner. Use placeholder copy marked `[Add your story]`.

### Page 5: Contact (`/contact`)

Two columns. Left: support email, phone, WhatsApp, address and hours, all placeholders. Right: contact form (name, email, topic select with Rider support, Driver support, Partnerships, Other; message) with validation and a success state.

### Page 6: Legal pages

- `/privacy` and `/terms`: a clean long-form layout with a sticky table of contents on desktop (a collapsible one on mobile), numbered headings and a "Last updated: [date]" line. Use clearly marked placeholder sections (`[Insert Privacy Policy text]`) so the real legal text can be pasted in. Do not invent legal wording.
- `/delete-account`: required by Google Play. Short explanation of how to delete the account and data from inside the app, plus a request form (email or phone, reason optional, confirm checkbox) with a success state. Placeholder text for retention details.

### Page 7: 404

On-brand: the mark, "This road does not lead anywhere", and a button back home.

## 8. Components to extract

`Header`, `Footer`, `VukaLogo`, `VukaMark`, `StoreButtons`, `SectionHeading` (eyebrow, H2, intro), `FeatureCard`, `StepCard`, `DoorDecal`, `PhoneMockup`, `PatternBackground` (a `pattern` prop of `road`, `mark`, `dots` and a `tone` prop of `dark` or `light`), `FaqAccordion`, `ApplyForm`, `ContactForm`, `DeleteAccountForm`, `LegalLayout`, `CtaBanner`.

## 9. Content rules

- Write natural, warm, plain English. No invented statistics, ratings, user counts, testimonials, prices or awards.
- Anything I have not told you (cities, payment methods, earnings, requirements, contact details, legal text) must be a visible `[bracketed placeholder]`.
- No lorem ipsum. No stock-photo people. If imagery is needed, use the pattern backgrounds, the phone mockup and the door decal graphic.

## 10. Definition of done

- All pages above exist and are linked from the header or footer.
- Every form validates, shows errors, and has a success state.
- Passes keyboard-only navigation, and the colour contrast rules in section 3 are followed.
- Looks right at 360px wide: no clipped text, no overlapping elements, buttons at least 44px.
- Lighthouse accessibility score of 95 or more.
- A short README listing every placeholder that needs real content.
