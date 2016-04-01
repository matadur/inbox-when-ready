# CHANGELOG
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/).

## [1.1.6] - 2016-04-01
### Fixed
- Should not add multiple show/hide buttons if Gmail causes a hashchange while loading.

## [1.1.4] - 2016-01-12
### Fixed
- Show / hide function should remain active on inbox compose screen

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