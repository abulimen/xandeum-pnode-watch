# Changelog

All notable changes to the Xandeum pNode Analytics Platform.

## [Unreleased]

### Added
- Map page redesign with left sidebar, top stats bar, and full-height map
- Collapsible sidebar for mobile on map page
- Country → City → Node accordion navigation on map page
- Empty state when search returns no results on map page
- "Show more countries" button for long country lists
- Live updates indicator with sync timestamp on map page
- Network health progress bar in sidebar
- Version type filter (Mainnet, Trynet, Devnet)
- Version badges with experimental warnings
- Uptime reliability badges (Elite, Reliable, Average, Unreliable)
- Alert subscription system with email and push notifications
- Info tooltips on analytics page metrics
- ROI Calculator page with real-time network data
- XANDSOL Staking Calculator with Jupiter API integration
- New API routes: `/api/credits`, `/api/token`, `/api/xandsol`
- Global Header and Footer components
- AI Copilot with RAG and real-time data access
- Animated retry buttons on error states
- Token Price Ticker with live updates
- Node Comparison Tool with radar charts
- AI Network Summary with typewriter effect
- Telegram Bot for network monitoring
- Discord Bot with slash commands
- Bot webhook endpoints: `/api/telegram/webhook`, `/api/discord/interactions`
- Interactive Tour Guide with driver.js (Desktop & Mobile)
- Global "Skip Tour" functionality
- Tour Guide exclusion for /guide page

### Changed
- **AI Migration**: Replaced Gemini with LongCat AI (OpenAI-compatible)
- Map now fills entire viewport without footer
- WorldMap component uses h-full instead of fixed height
- Improved mobile responsiveness across all pages

### Changed
- Map now fills entire viewport without footer
- WorldMap component uses h-full instead of fixed height
- Improved mobile responsiveness across all pages

### Fixed
- Fixed map footer overlay issue on mobile
- Fixed blank space below map on desktop
- Fixed version badge display on experimental versions

---

## [0.1.0] - 2024-12-01

### Added
- Initial release
- Real-time dashboard with network statistics
- pNode data table with sorting and filtering
- Search functionality by node ID, country, city
- Node details page with comprehensive metrics
- Analytics page with charts and trends
- Geographic map visualization with react-simple-maps
- Leaderboard for top performing nodes
- User guide page
- Dark/light theme toggle
- Data export (CSV/JSON)
- Node comparison tool
- Auto-refresh every 30 seconds
- Error handling with retry logic
- Mobile responsive design

### Technical
- Next.js 14+ with App Router
- TypeScript strict mode
- Tailwind CSS + shadcn/ui components
- TanStack Query for data fetching
- SQLite for alert subscriptions
- Brevo API for email notifications
- Web Push for browser notifications
