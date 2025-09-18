# TaskMe - Firefox Extension for Natural Language Calendar Events

## Overview

TaskMe is a Firefox extension that revolutionizes calendar event creation by enabling users to add Google Calendar events and tasks using natural language input. Instead of navigating through complex calendar interfaces, users can simply type descriptions like "Lunch with Sam tomorrow at noon for an hour" and have events created instantly.

## Key Features

- **🚀 Lightning Fast**: Create events with a simple hotkey anywhere in Firefox
- **🧠 Natural Language**: AI-powered parsing understands context and extracts event details
- **📅 Google Calendar Integration**: Direct API integration with OAuth2 authentication
- **👀 Smart Preview**: Confidence-based preview system with editing capabilities
- **↩️ Undo Support**: Easy undo for recently created events
- **🖱️ Context Menu**: Right-click selected text to create events
- **⚙️ Customizable**: Extensive settings for personalization and privacy

## Example Usage

```
User types: "Team standup every Monday at 9am starting next week"
Extension creates: 
  - Title: Team standup
  - Date: Next Monday
  - Time: 9:00 AM
  - Recurrence: Weekly, every Monday
  - Duration: 30 minutes (default)
```

## Documentation Structure

This repository contains comprehensive design documentation:

### 📋 [DESIGN.md](./DESIGN.md)
**Main Design Document** - Complete specification covering:
- Project overview and vision
- Detailed feature requirements
- Technical architecture
- User interface design
- API integrations (Google Calendar, LLM)
- Security and privacy considerations
- Development roadmap and phases
- Testing strategy and success metrics

### 🔧 [TECHNICAL_SPECS.md](./TECHNICAL_SPECS.md)
**Technical Implementation Guide** - Developer-focused specifications:
- Extension manifest configuration
- API specifications and data schemas
- Component architecture details
- Message passing protocols
- Performance requirements
- Security implementation
- Testing requirements
- Build and deployment processes

### 🔄 [USER_WORKFLOWS.md](./USER_WORKFLOWS.md)
**User Experience Flows** - Visual workflow documentation:
- Core user interaction patterns
- Detailed state diagrams
- Error handling flows
- Accessibility workflows
- Cross-platform considerations
- Privacy and consent flows

## Quick Start Development Guide

### Prerequisites
- Node.js 16+ and npm
- Firefox Developer Edition (recommended)
- Google Calendar API credentials
- OpenAI API key (or alternative LLM provider)

### Project Structure
```
taskme-extension/
├── manifest.json              # Extension manifest (v3)
├── background/                # Background scripts and APIs
├── content/                   # Content scripts for page interaction
├── popup/                     # Extension popup interface  
├── ui/                        # User interface components
├── lib/                       # Shared libraries and utilities
└── icons/                     # Extension icons and assets
```

### Development Setup
1. **Clone and Setup**
   ```bash
   git clone https://github.com/veggiebob/taskme.git
   cd taskme
   npm install
   ```

2. **Configure APIs**
   - Set up Google Calendar API credentials
   - Obtain LLM provider API keys
   - Configure OAuth2 redirect URIs

3. **Build and Test**
   ```bash
   npm run build:dev      # Development build
   npm run test           # Run test suite  
   npm run lint           # Code quality checks
   ```

4. **Load Extension**
   - Open Firefox Developer Tools
   - Navigate to `about:debugging`
   - Load temporary extension from `dist/` folder

## Development Phases

### Phase 1: Core Functionality (Weeks 1-4)
- [x] Project architecture and setup
- [ ] Command bar interface
- [ ] Google Calendar integration  
- [ ] Basic natural language processing

### Phase 2: Enhanced Features (Weeks 5-8)
- [ ] Preview and confirmation system
- [ ] Context menu integration
- [ ] Undo functionality
- [ ] Settings and configuration

### Phase 3: Polish and Launch (Weeks 9-12)
- [ ] UI/UX refinements
- [ ] Comprehensive testing
- [ ] Documentation and help system
- [ ] Firefox Add-ons store submission

## Architecture Highlights

### 🏗️ Modern Extension Architecture
- **Manifest V3** compliance for future-proofing
- **Service Worker** background processing
- **Content Scripts** for seamless page integration
- **Secure Storage** with encryption for sensitive data

### 🤖 Intelligent Processing
- **LLM Integration** with multiple provider support (OpenAI, Claude)
- **Confidence Scoring** for smart user experience
- **Context Awareness** using page and time context
- **Fallback Parsing** for offline scenarios

### 🔒 Privacy-First Design
- **Local Processing** when possible
- **Minimal Data Collection** with user control
- **Secure Authentication** using OAuth2 PKCE
- **Transparent Privacy Policy** with clear opt-outs

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Read the Documentation**: Start with [DESIGN.md](./DESIGN.md) for overall vision
2. **Check Technical Specs**: Review [TECHNICAL_SPECS.md](./TECHNICAL_SPECS.md) for implementation details
3. **Understand User Flows**: Study [USER_WORKFLOWS.md](./USER_WORKFLOWS.md) for UX patterns
4. **Follow Code Standards**: Use existing linting and testing configurations
5. **Test Thoroughly**: Ensure cross-platform compatibility

### Development Guidelines
- **Minimal Changes**: Make focused, surgical modifications
- **Test-Driven**: Write tests for new functionality
- **Privacy-Conscious**: Follow privacy-by-design principles
- **Accessible**: Ensure keyboard navigation and screen reader support
- **Performance-Focused**: Optimize for speed and resource usage

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Security

For security concerns or vulnerabilities, please email [security@taskme-extension.com](mailto:security@taskme-extension.com) rather than opening public issues.

## Support

- **Documentation**: Check the design documents in this repository
- **Issues**: [GitHub Issues](https://github.com/veggiebob/taskme/issues)
- **Discussions**: [GitHub Discussions](https://github.com/veggiebob/taskme/discussions)
- **Email**: [support@taskme-extension.com](mailto:support@taskme-extension.com)

## Acknowledgments

- **Firefox WebExtensions Team** for the excellent extension APIs
- **Google Calendar API** for robust calendar integration
- **OpenAI** for natural language processing capabilities
- **Open Source Community** for libraries and inspiration

---

**TaskMe** - Making calendar management as simple as typing a sentence. ⚡📅