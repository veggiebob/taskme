# TaskMe - Firefox Extension Design Document

## 1. Project Overview

**TaskMe** is a Firefox extension designed to streamline the process of creating Google Calendar events and tasks using natural language input. The extension eliminates the need to navigate through the Google Calendar UI by providing a lightweight, quick-access command interface that interprets natural language descriptions and automatically creates calendar entries.

### 1.1 Vision Statement
To provide the most intuitive and efficient way to capture calendar events and tasks directly from the browser, making scheduling as simple as typing a sentence.

### 1.2 Core Value Proposition
- **Speed**: Create calendar events in seconds, not minutes
- **Simplicity**: Natural language input requires no training
- **Accessibility**: Works from anywhere in the browser
- **Intelligence**: AI-powered parsing for accurate event extraction

## 2. Features and Requirements

### 2.1 Core Features

#### 2.1.1 Popup Input Box + Hotkey
- **Global hotkey** (e.g., Ctrl+Shift+T) to open command bar anywhere in Firefox
- **Floating input interface** that overlays current page content
- **Instant feedback** with real-time parsing preview
- **Quick dismiss** with Escape key or click outside

**Requirements:**
- Cross-platform hotkey support (Windows, Mac, Linux)
- Non-intrusive overlay design
- Fast rendering and response time (<200ms)
- Keyboard-only navigation support

#### 2.1.2 Natural Language Processing
- **LLM Integration** with ChatGPT API or compatible service
- **Event extraction** for:
  - Date and time parsing (relative and absolute)
  - Duration calculation
  - Location identification
  - Title and description separation
  - Recurrence pattern recognition

**Supported input examples:**
- "Lunch with Sam tomorrow at noon for an hour"
- "Weekly team standup every Monday at 9am"
- "Doctor appointment next Friday 2pm at Main Street Clinic"
- "Flight to NYC on Dec 15th departing 6:30am"

**Requirements:**
- Configurable LLM backend (OpenAI, Claude, local models)
- Fallback parsing for offline scenarios
- Confidence scoring for parsed results
- Multiple timezone support

#### 2.1.3 Google Calendar Integration
- **OAuth2 authentication** for secure calendar access
- **Multiple calendar support** with user selection
- **Event creation** via Google Calendar API
- **Task creation** via Google Tasks API (when applicable)

**Requirements:**
- Secure credential storage
- Calendar selection and management
- Conflict detection and warnings
- Batch operations support

#### 2.1.4 Preview & Confirmation System
- **Smart confirmation** based on confidence levels
- **Editable preview** before final creation
- **Quick approve** for high-confidence events
- **Detailed edit mode** for complex events

**Requirements:**
- Configurable confidence thresholds
- In-line editing capabilities
- Visual feedback for changes
- One-click approval workflow

#### 2.1.5 Undo Functionality
- **Immediate undo notification** after event creation
- **Timed undo window** (configurable, default 30 seconds)
- **Bulk undo** for multiple events
- **Undo history** for recent actions

**Requirements:**
- Non-blocking notification system
- Persistent undo queue across browser sessions
- Clear visual indicators
- Keyboard shortcut support (Ctrl+Z)

#### 2.1.6 Context Menu Integration
- **Text selection parsing** from any webpage
- **Right-click context menu** option "Add to Calendar"
- **Email integration** for meeting invitations
- **Smart content detection** (dates, times, locations)

**Requirements:**
- Universal text selection support
- Content script optimization
- Email client integration (Gmail, Outlook web)
- Page content analysis

#### 2.1.7 Settings & Configuration
- **Default preferences**: duration, timezone, calendar
- **LLM configuration**: provider, API keys, models
- **UI customization**: themes, hotkeys, behavior
- **Privacy settings**: data retention, sharing preferences

**Requirements:**
- Secure settings storage
- Import/export configurations
- Reset to defaults
- Real-time preference updates

### 2.2 Advanced Features (Future Enhancements)

#### 2.2.1 Smart Suggestions
- **Learning from patterns** in user's calendar creation habits
- **Contact integration** for attendee suggestions
- **Location autocomplete** based on history
- **Template creation** for recurring event types

#### 2.2.2 Multi-Platform Sync
- **Settings synchronization** across Firefox installations
- **Custom vocabulary** and phrase learning
- **Usage analytics** (privacy-compliant)

#### 2.2.3 Integration Expansions
- **Multiple calendar providers** (Outlook, Apple Calendar)
- **Task management systems** (Todoist, Any.do)
- **Communication platforms** (Slack, Teams for meeting scheduling)

## 3. Technical Architecture

### 3.1 Extension Structure

```
taskme-extension/
├── manifest.json              # Extension manifest (v3)
├── background/                # Background scripts
│   ├── service-worker.js     # Main background service worker
│   ├── calendar-api.js       # Google Calendar API client
│   └── nlp-processor.js      # Natural language processing
├── content/                   # Content scripts
│   ├── content-script.js     # Page interaction handler
│   ├── text-extractor.js     # Context menu text processing
│   └── overlay-injector.js   # UI overlay management
├── popup/                     # Extension popup
│   ├── popup.html            # Main popup interface
│   ├── popup.js              # Popup logic
│   └── popup.css             # Popup styles
├── ui/                        # User interface components
│   ├── command-bar.html      # Floating command bar
│   ├── command-bar.js        # Command bar logic
│   ├── settings.html         # Settings page
│   ├── settings.js           # Settings management
│   └── styles/               # CSS files
├── lib/                       # External libraries
│   ├── date-parser.js        # Date parsing utilities
│   └── oauth-client.js       # OAuth2 implementation
└── icons/                     # Extension icons
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

### 3.2 Component Architecture

#### 3.2.1 Service Worker (Background)
- **Event handling**: Hotkey detection and command routing
- **API management**: Google Calendar and LLM API calls
- **Data persistence**: Settings and temporary data storage
- **Network handling**: OAuth flows and API requests

#### 3.2.2 Content Scripts
- **Page integration**: Inject command bar and handle interactions
- **Text extraction**: Process selected text for calendar events
- **DOM manipulation**: Overlay management and cleanup
- **Event propagation**: Communication with background scripts

#### 3.2.3 User Interface Components
- **Command Bar**: Floating input with real-time feedback
- **Settings Panel**: Configuration and preference management
- **Notification System**: Success/error messages and undo options
- **Preview Modal**: Event confirmation and editing interface

### 3.3 Data Flow

```
User Input → Content Script → Background Service Worker → API Processors
     ↓              ↓                     ↓                    ↓
UI Updates ← Content Script ← Background Service ← External APIs
```

1. **Input Capture**: User types in command bar or selects text
2. **Processing**: Background worker processes input through NLP
3. **API Calls**: Parsed data sent to Google Calendar API
4. **Feedback**: Results displayed through UI components
5. **Persistence**: Event data and settings stored locally

### 3.4 Security Architecture

#### 3.4.1 Authentication & Authorization
- **OAuth2 PKCE flow** for Google Calendar access
- **Secure token storage** using Chrome storage API
- **Token refresh** handling with fallback mechanisms
- **Permission scoping** to minimum required access

#### 3.4.2 Data Protection
- **Local encryption** for sensitive settings
- **No server storage** of user calendar data
- **Secure API communication** (HTTPS only)
- **User consent** for all data processing

#### 3.4.3 Privacy Measures
- **Opt-in analytics** with clear disclosure
- **Local-first architecture** for data processing
- **User-controlled data retention** periods
- **Transparent privacy policy**

## 4. User Interface Design

### 4.1 Command Bar Interface

#### 4.1.1 Visual Design
- **Minimal floating bar** with subtle shadow and border
- **Auto-complete suggestions** displayed below input
- **Real-time parsing feedback** with color-coded confidence
- **Keyboard navigation** with arrow keys and tab

#### 4.1.2 Interaction Flow
1. User presses hotkey (Ctrl+Shift+T)
2. Command bar appears centered on screen
3. User types natural language event description
4. Real-time parsing shows extracted details
5. User presses Enter to create or Tab to edit
6. Success notification with undo option

#### 4.1.3 Responsive Behavior
- **Adaptive positioning** to avoid page content overlap
- **Dynamic sizing** based on input length and suggestions
- **Smooth animations** for show/hide transitions
- **Focus management** for accessibility

### 4.2 Settings Interface

#### 4.2.1 Organization
- **Quick Settings**: Most common preferences accessible from popup
- **Advanced Settings**: Detailed configuration in dedicated page
- **Tabbed interface**: Organized by category (General, Calendar, Privacy)
- **Search functionality**: Find settings quickly

#### 4.2.2 Settings Categories

**General Settings:**
- Default event duration (30min, 1hr, 2hr, custom)
- Default calendar selection
- Timezone preferences
- Hotkey customization

**Calendar Integration:**
- Connected Google accounts
- Calendar visibility and selection
- Default event privacy settings
- Meeting location preferences

**Natural Language Processing:**
- LLM provider selection (OpenAI, Claude, local)
- API configuration and testing
- Confidence threshold adjustment
- Custom vocabulary and phrases

**Privacy & Data:**
- Data retention policies
- Usage analytics opt-in/out
- Export/import settings
- Clear stored data

### 4.3 Notification System

#### 4.3.1 Success Notifications
- **Non-blocking toast** appearing in corner
- **Event details summary** with calendar name
- **Undo button** prominently displayed
- **Auto-dismiss** after 30 seconds

#### 4.3.2 Error Handling
- **Clear error messages** with suggested solutions
- **Retry mechanisms** for temporary failures
- **Offline mode** indicators and behavior
- **Help links** for complex issues

## 5. API Integrations

### 5.1 Google Calendar API

#### 5.1.1 Authentication Flow
```
1. User initiates connection in settings
2. Extension redirects to Google OAuth consent screen
3. User grants calendar permissions
4. Extension receives authorization code
5. Background script exchanges code for tokens
6. Tokens stored securely in extension storage
```

#### 5.1.2 API Operations

**Calendar Management:**
- List user's calendars
- Get calendar metadata and settings
- Check calendar permissions

**Event Operations:**
- Create new events with all parsed details
- Update existing events (for corrections)
- Delete events (for undo functionality)
- Query existing events (for conflict detection)

**Error Handling:**
- Rate limit management with exponential backoff
- Network error recovery and retry logic
- Token expiration and refresh handling
- User-friendly error messages

### 5.2 Natural Language Processing

#### 5.2.1 LLM Integration Options

**Primary: OpenAI GPT API**
- High accuracy for date/time parsing
- Good context understanding
- Reliable API with good documentation
- Cost consideration for high usage

**Alternative: Claude API**
- Strong reasoning capabilities
- Good privacy features
- Competitive accuracy
- Different pricing model

**Future: Local Models**
- Privacy-focused solution
- No API costs
- Offline functionality
- Higher computational requirements

#### 5.2.2 Parsing Pipeline

**Input Processing:**
1. Text normalization and cleanup
2. Context injection (current time, timezone)
3. LLM API call with structured prompt
4. Response parsing and validation
5. Confidence scoring and feedback

**Prompt Engineering:**
```
System: You are a calendar event parser. Extract event details from natural language.

User input: "Lunch with Sam tomorrow at noon for an hour"
Current date: 2024-01-15
Current time: 10:30 AM
Timezone: America/New_York

Return JSON with: title, start_date, start_time, duration, location, description, confidence
```

**Output Validation:**
- Date/time consistency checks
- Reasonable duration limits
- Location format validation
- Confidence threshold enforcement

### 5.3 Browser APIs

#### 5.3.1 Firefox WebExtensions APIs
- **storage**: Settings and temporary data persistence
- **commands**: Hotkey registration and handling
- **contextMenus**: Right-click menu integration
- **tabs**: Active tab detection and interaction
- **notifications**: System notification display

#### 5.3.2 Content Script APIs
- **DOM manipulation**: Overlay injection and management
- **Event handling**: User interaction capture
- **Message passing**: Communication with background scripts
- **Selection API**: Text extraction from pages

## 6. Security and Privacy Considerations

### 6.1 Data Security

#### 6.1.1 Sensitive Data Handling
- **OAuth tokens**: Encrypted storage using Web Crypto API
- **API keys**: Secure configuration with user-provided keys
- **Calendar data**: No persistent storage, API-only access
- **User input**: Local processing with optional cloud parsing

#### 6.1.2 Network Security
- **HTTPS only**: All external API calls use secure connections
- **Certificate pinning**: For critical API endpoints
- **Request signing**: Where supported by APIs
- **Rate limiting**: Prevent abuse and API quota exhaustion

### 6.2 Privacy Protection

#### 6.2.1 Data Minimization
- **Local-first architecture**: Process data locally when possible
- **Minimal API calls**: Only send necessary data to external services
- **Temporary storage**: Clear processed data after use
- **User control**: Settings for data retention and processing

#### 6.2.2 Third-Party Services
- **Transparent disclosure**: Clear information about LLM usage
- **User consent**: Explicit opt-in for cloud processing
- **Data isolation**: No cross-user data sharing
- **Provider selection**: Allow user choice of LLM providers

### 6.3 Permission Management

#### 6.3.1 Minimal Permissions
- **activeTab**: Only for content script injection
- **storage**: Local settings and temporary data
- **contextMenus**: Right-click functionality
- **commands**: Hotkey registration
- **identity**: OAuth2 flow handling

#### 6.3.2 User Consent
- **Clear explanations**: What each permission is used for
- **Optional features**: Progressive permission requests
- **Easy revocation**: Settings to disable features and permissions
- **Regular review**: Prompt users to review permissions periodically

## 7. Development Roadmap

### 7.1 Phase 1: Core Functionality (Weeks 1-4)

#### Week 1: Project Setup and Architecture
- [ ] Extension manifest and basic structure
- [ ] Development environment setup
- [ ] Build and packaging scripts
- [ ] Basic UI components and styling

#### Week 2: Command Bar and Input Processing
- [ ] Floating command bar implementation
- [ ] Hotkey registration and handling
- [ ] Basic text input and validation
- [ ] Simple date/time parsing (without LLM)

#### Week 3: Google Calendar Integration
- [ ] OAuth2 authentication flow
- [ ] Google Calendar API client
- [ ] Basic event creation functionality
- [ ] Error handling and user feedback

#### Week 4: Natural Language Processing
- [ ] LLM API integration (OpenAI)
- [ ] Prompt engineering and testing
- [ ] Confidence scoring system
- [ ] Integration with event creation flow

### 7.2 Phase 2: Enhanced Features (Weeks 5-8)

#### Week 5: Preview and Confirmation System
- [ ] Event preview modal design
- [ ] Editable event details interface
- [ ] Confidence-based auto-approval
- [ ] Batch event processing

#### Week 6: Context Menu Integration
- [ ] Content script for text selection
- [ ] Context menu registration
- [ ] Text extraction and preprocessing
- [ ] Integration with main processing pipeline

#### Week 7: Undo and Notification System
- [ ] Undo functionality implementation
- [ ] Notification system design
- [ ] Temporary event storage
- [ ] Bulk undo operations

#### Week 8: Settings and Configuration
- [ ] Settings page design and implementation
- [ ] Preference storage and management
- [ ] Import/export functionality
- [ ] User onboarding flow

### 7.3 Phase 3: Polish and Advanced Features (Weeks 9-12)

#### Week 9: User Experience Improvements
- [ ] UI/UX refinements based on testing
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Error message enhancements

#### Week 10: Testing and Quality Assurance
- [ ] Comprehensive testing suite
- [ ] Cross-platform compatibility testing
- [ ] Performance testing and optimization
- [ ] Security audit and improvements

#### Week 11: Documentation and Deployment
- [ ] User documentation and help system
- [ ] Developer documentation
- [ ] Firefox Add-ons store preparation
- [ ] Beta testing with users

#### Week 12: Launch Preparation
- [ ] Final bug fixes and polish
- [ ] Marketing materials and screenshots
- [ ] Release notes and changelog
- [ ] Firefox Add-ons store submission

### 7.4 Future Enhancements (Post-Launch)

#### Advanced Natural Language Processing
- Custom vocabulary learning
- Context-aware parsing improvements
- Multiple language support
- Local model integration options

#### Extended Integrations
- Multiple calendar provider support
- Task management system integration
- Email client integration
- Mobile companion apps

#### Smart Features
- Machine learning for user pattern recognition
- Intelligent conflict detection and resolution
- Automated event categorization
- Smart scheduling suggestions

## 8. Testing Strategy

### 8.1 Unit Testing

#### 8.1.1 Core Functionality Tests
- **Date/time parsing**: Various input formats and edge cases
- **Event validation**: Required fields and data consistency
- **API integration**: Mock Google Calendar API responses
- **OAuth flow**: Authentication state management

#### 8.1.2 Utility Function Tests
- Text processing and normalization
- Timezone conversion and handling
- Input validation and sanitization
- Configuration management

### 8.2 Integration Testing

#### 8.2.1 API Integration Tests
- Google Calendar API with test account
- LLM API with sample inputs and expected outputs
- OAuth2 flow with live Google services
- Error handling for API failures

#### 8.2.2 Cross-Component Tests
- Message passing between content scripts and background
- UI component interaction flows
- Settings persistence and retrieval
- Event creation end-to-end workflow

### 8.3 User Acceptance Testing

#### 8.3.1 Usability Testing
- Command bar discoverability and ease of use
- Natural language input effectiveness
- Settings configuration complexity
- Error message clarity and helpfulness

#### 8.3.2 Accessibility Testing
- Keyboard-only navigation
- Screen reader compatibility
- Color contrast and visual design
- Focus management and indicators

### 8.4 Performance Testing

#### 8.4.1 Response Time Metrics
- Command bar opening speed (<200ms)
- LLM API response time (<3 seconds)
- Calendar event creation speed (<2 seconds)
- UI responsiveness during processing

#### 8.4.2 Resource Usage Testing
- Memory usage monitoring
- CPU impact measurement
- Network bandwidth usage
- Battery impact on mobile devices

### 8.5 Security Testing

#### 8.5.1 Authentication Security
- OAuth2 flow vulnerability assessment
- Token storage security validation
- API key protection verification
- Session management security

#### 8.5.2 Data Protection Testing
- Input sanitization effectiveness
- XSS prevention validation
- CSRF protection verification
- Data encryption validation

## 9. Success Metrics and KPIs

### 9.1 User Adoption Metrics
- **Installation rate**: Downloads from Firefox Add-ons store
- **Active users**: Daily and monthly active user counts
- **Retention rate**: User retention after 1 week, 1 month
- **Feature usage**: Frequency of different feature usage

### 9.2 User Experience Metrics
- **Task completion rate**: Successful event creation percentage
- **Error rates**: Failed event creation attempts
- **Time to completion**: Average time from input to event creation
- **User satisfaction**: Ratings and reviews analysis

### 9.3 Technical Performance Metrics
- **API success rates**: Google Calendar and LLM API reliability
- **Response times**: Average response time for different operations
- **Parsing accuracy**: Natural language processing success rates
- **Crash rates**: Extension stability measurements

### 9.4 Business Success Metrics
- **User growth**: Monthly growth rate of active users
- **Engagement depth**: Average events created per user
- **Feature adoption**: Percentage of users using advanced features
- **Support burden**: Support ticket volume and resolution time

## 10. Risk Assessment and Mitigation

### 10.1 Technical Risks

#### 10.1.1 API Dependencies
**Risk**: External API changes or service unavailability
**Mitigation**: 
- Version pinning and compatibility testing
- Fallback mechanisms for offline use
- Multiple LLM provider support
- Graceful degradation strategies

#### 10.1.2 Browser Compatibility
**Risk**: Firefox API changes or compatibility issues
**Mitigation**:
- Follow Mozilla WebExtensions best practices
- Regular testing with Firefox beta versions
- Backward compatibility strategies
- Progressive enhancement approach

### 10.2 Security Risks

#### 10.2.1 Authentication Vulnerabilities
**Risk**: OAuth token theft or misuse
**Mitigation**:
- Secure token storage with encryption
- Short token lifespans with refresh mechanisms
- PKCE flow implementation
- Regular security audits

#### 10.2.2 Data Privacy Concerns
**Risk**: Unintended data exposure or collection
**Mitigation**:
- Privacy-by-design architecture
- Minimal data collection principles
- Transparent privacy policy
- User control over data processing

### 10.3 Business Risks

#### 10.3.1 Market Competition
**Risk**: Similar products or features from competitors
**Mitigation**:
- Focus on unique value propositions
- Rapid feature iteration
- Strong user experience focus
- Community building and feedback

#### 10.3.2 Regulatory Compliance
**Risk**: Privacy regulation changes affecting data handling
**Mitigation**:
- GDPR and privacy regulation compliance from start
- Regular legal review and updates
- User consent and control mechanisms
- Data minimization practices

## 11. Conclusion

TaskMe represents a significant opportunity to streamline calendar management through natural language processing and browser integration. The extension's design prioritizes user experience, privacy, and security while providing powerful automation capabilities.

The phased development approach ensures early delivery of core functionality while allowing for iterative improvements based on user feedback. The technical architecture supports scalability and future enhancements while maintaining security and performance standards.

Success will be measured through user adoption, engagement metrics, and feedback, with continuous improvement based on real-world usage patterns and requirements. The project's focus on privacy-first design and user control positions it well for long-term success in an increasingly privacy-conscious market.

By following this design document, the development team will have a clear roadmap for building a robust, user-friendly, and secure Firefox extension that transforms how users interact with their calendars.