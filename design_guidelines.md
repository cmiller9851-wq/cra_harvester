# CRA Harvester Design Guidelines

## Design Approach
**Reference-Based: Tactical Financial Dashboard**
Drawing inspiration from Linear's dark mode excellence, Bloomberg Terminal's information density, and Vercel Analytics' data clarity. This is a premium, high-stakes financial interface where every pixel serves a purpose.

## Core Design Principles
1. **Dark Tactical Foundation**: Deep charcoal backgrounds with strategic accent lighting
2. **Information Hierarchy**: Military-grade precision in data presentation
3. **Premium Materiality**: Subtle depth through elevation and glass-morphism effects
4. **Data-First Layout**: Zero decorative elements that don't serve the data

## Typography System

**Font Families:**
- Primary: Inter (weights: 400, 500, 600, 700) - metrics and labels
- Monospace: JetBrains Mono (weights: 400, 500) - numerical data, APY, addresses

**Type Scale:**
- Display Numbers: 3xl-4xl (yield percentages, TVL)
- Section Headers: xl-2xl 
- Card Titles: base-lg
- Data Labels: sm (uppercase, tracking-wide for labels)
- Metrics: lg-xl (monospace for numbers)
- Body: sm-base

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Consistent 4-6 unit padding inside cards
- 6-8 unit gaps between dashboard components
- 12-16 unit section padding

**Grid Structure:**
- 12-column responsive grid
- Dashboard cards span 3-6 columns based on data complexity
- Always maintain 4-6 unit gutters between cards

## Component Library

### Navigation & Shell
**Top Bar** (fixed, glass-morphic):
- Left: Logo + protocol name
- Center: Quick metric ticker (scrolling APY highlights)
- Right: Wallet connection + network selector + settings icon
- Height: 16 units, backdrop blur with subtle border-b

**Sidebar** (collapsible, 64 units wide):
- Protocol list with live status indicators (green/yellow/red dots)
- Search/filter at top
- Categorized sections: Active Positions / All Protocols / Watchlist
- Each item shows mini APY badge

### Dashboard Cards
**Standard Card Anatomy:**
- Glass-morphic background with subtle border
- 6-unit padding
- Header: Title + action icon/button
- Content area with clear data hierarchy
- Optional footer for metadata/timestamps

**Card Variants:**
1. **Protocol Status Card** (3-column width):
   - Large protocol icon/logo
   - Protocol name + chain badge
   - Current APY (large, monospace)
   - 24h change indicator (+ arrow, colored)
   - TVL + Volume metrics (smaller, grid layout)

2. **Portfolio Overview** (6-column width):
   - Total value locked (hero metric)
   - Asset breakdown (horizontal bar chart)
   - Daily/weekly yield earned
   - Quick action buttons (Harvest All, Compound)

3. **Yield History Chart** (6-9 column):
   - Line/area chart showing APY trends
   - Time range selector (24h/7d/30d/All)
   - Hover tooltips with exact values
   - Gradient fills beneath lines

4. **Position Cards** (4-column width):
   - Asset pair icons (overlapping)
   - Position size + current value
   - Unrealized yield (green, prominent)
   - Manage/Harvest CTAs

### Data Visualization

**Status Indicators:**
- Dot indicators: 2-unit circles, pulsing animation for "live"
- Color coding: Green (healthy), Yellow (warning), Red (critical)
- Always accompanied by text label

**Metrics Display:**
- Large numbers in monospace font
- Percentage changes with directional arrows
- Color: Green (#10b981) for positive, Red (#ef4444) for negative
- Neutral data in muted foreground color

**Charts & Graphs:**
- Use subtle grid lines (very low opacity)
- Gradient area fills for emphasis
- Crisp, thin line weights (1-2px)
- Interactive tooltips with backdrop blur

### Interactive Elements

**Buttons:**
- Primary CTA: Solid with glow effect on glass background
- Secondary: Ghost style with border
- Sizes: sm (8 unit height), md (10 unit), lg (12 unit)
- Icons precede text when present

**Input Fields:**
- Dark glass background with subtle border
- Focus state: border glow + slight elevation
- Monospace font for numerical inputs
- Inline validation feedback

**Dropdowns/Selectors:**
- Glass panel that appears above content
- Subtle shadow/glow
- Hover state on items with background change
- Selected item highlighted with accent border-l

## Premium Details

**Glass-Morphism Treatment:**
- Semi-transparent dark backgrounds (bg-black/40)
- Backdrop blur (backdrop-blur-xl)
- Subtle borders (border-white/5)
- Strategic use on cards, modals, navigation

**Depth & Elevation:**
- Three-tier system: Base (dashboard bg), Mid (cards), High (modals/dropdowns)
- Achieved through: opacity variations, blur, shadow intensity
- No heavy shadows - use subtle glows instead

**Micro-Interactions:**
- Smooth transitions (150-300ms)
- Subtle scale on card hover (1.02)
- Color shifts on data updates
- Loading states: shimmer effect, not spinners

## Page Structure

**Dashboard Layout:**
1. **Top Section** (full-width):
   - Portfolio summary cards (3-4 cards in row)
   - Quick stats: Total Value, 24h Yield, Active Positions

2. **Main Grid** (2/3 width):
   - Yield chart (large, prominent)
   - Active positions grid (4-column cards)
   - Protocol performance table

3. **Sidebar Panel** (1/3 width, sticky):
   - Top movers/gainers list
   - Recent activity feed
   - Market alerts/notifications

**Protocol Detail View:**
- Hero metric section: APY, TVL, chain info
- Interactive chart (dominant)
- Position management cards
- Risk metrics and protocol info panels

## Images & Graphics

**No Large Hero Image** - This is a data dashboard; immediate information access is critical.

**Strategic Graphics:**
- Protocol logos/icons (use as CDN links or icon libraries)
- Chain badges (Ethereum, Polygon, etc. - use established crypto icon sets)
- Empty state illustrations for no positions (minimal, line-art style)
- Background: Subtle grid pattern or topographic lines at very low opacity

**Icon Usage:**
- Heroicons for UI controls
- Crypto icon libraries for protocol/chain logos
- Monochrome icons, colored only for status

## Accessibility & Performance

- High contrast ratios on all text (especially critical for dark theme)
- All interactive elements minimum 44px touch target
- Keyboard navigation support for all dashboard controls
- Real-time data updates without full refreshes
- Lazy load chart data for performance
- Skeleton screens during data fetch, not blank states