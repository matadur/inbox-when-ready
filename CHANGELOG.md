# CHANGELOG
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/).

## [1.1.15] - 2016-07-18
### Added
- Support for Gmail custom views (unread first, starred first, etc)

### Fixed
- Inbox link label unread count should remain accurate when toggling inbox visibility. Props to Mohsin Amarjee for help debugging this issue.

## [1.1.14] - 2016-07-16
### Fixed
- Inbox link label should not be blank if there are no unread messages. Props to Mohsin Amarjee for help debugging this issue.

## [1.1.13] - 2016-07-15
### Fixed
- Show / hide function should work on Gmail when inbox tabs are disabled. Props to @HansCronau for help debugging this issue.
- Inbox link label unread count should stay hidden when inbox is hidden.

### Changed
- Flash messages should only be visible when inbox is visible, not the other way around.


## [1.1.12] - 2016-07-12
### Changed
- Rename app "Inbox When Ready for Gmail" as per Chrome Web Store guidelines.

## [1.1.11] - 2016-07-12
### Added
- When inbox is hidden, document title should not include unread message count.
- Flash message to encourage social share, review or feedback.
- More test coverage.

### Fixed
- Should preserve unread message count if Gmail loads on non-inbox view.
- Hide function should target .aDP and .aKh elements. (Previously targetted .aE3, which was not reliably present for all users.) Props to @HansCronau for help debugging this issue.
- Should support Inbox by Gmail.

### Changed
- Big JavaScript refactor to shift in the direction of MVC and modular patterns.

## [1.1.10] - 2016-07-03
### Changed
- Account metadata (displayed beneath inbox) now remains visible when inbox is hidden

### Fixed
- Toggling inbox display should not cause UI buttons to jiggle left / right.

## [1.1.9] - 2016-06-15
### Fixed
- Inbox should remain visible on compose screen if user wants to see it.

## [1.1.8] - 2016-06-15
### Added
- Google Analytics event tracking.
- Extension now saves load count and first load timestamp to chrome.storage.

## [1.1.7] - 2016-06-15
###Added
- Validation tests.
- Install helper script (for LDE and a future CI setup).

### Changed
- Refactored JS and CSS.

### Fixed
- Inbox should not be briefly visible when view changes back to inbox.
- Show / hide function should work on Inbox by Gmail.

## [1.1.6] - 2016-04-01
### Fixed
- Should not add multiple show/hide buttons if Gmail causes a hashchange while loading.

## [1.1.4] - 2016-01-12
### Fixed
- Show / hide function should remain active on inbox compose screen.

## [1.1.3] - 2016-01-10
### Fixed
- Show / hide button should be added even if the Gmail app is loaded to a
view that isn't the inbox.

## [1.1.2] - 2015-11-04
### Changed
- Pinned items view should not be affected by this plugin (i.e. pinned items should be visible via toggle button even when inbox is hidden).

### Fixed
- Show / hide buttons not visible for some users. Fixes #1.

## [1.1.1] - 2015-11-01
### Changed
- Remove unnecessary "tabs" permission request from extension manifest

## [1.1.0] - 2015-11-01
### Added
- Support for Inbox by Gmail. Resolves #1.
- A couple of development helpers (shell scripts that stop me having to memorise project-specific grunt / gulp commands).

### Fixed
- Email view should remain visible if you browse directly to an email URL. Fixes #2.

## [1.0.1] - 2015-10-11
### Fixed
- Email list should show on non-inbox views when hide inbox enabled

## [1.0.0] - 2015-10-10
- Initial release.