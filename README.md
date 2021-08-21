## OSRIC plugin for the Quilvyn RPG character sheet generator

The quilvyn-osric package bundles modules that extend Quilvyn to work
with the variant 1st Edition rules defined in the
<a href="https://www.knights-n-knaves.com/osric/">Old School Reference and
Index Compilation</a> rule book.

### Requirements

quilvyn-osric relies on the core and srd35 modules installed by the
quilvyn-core package.

### Installation

To use quilvyn-osric, unbundle the release package into the plugins/
subdirectory within the Quilvyn installation directory, then append
following lines to the file plugins/plugins.js:

    RULESETS['OSRIC - Old School Reference and Index Compilation (1E)'] = {
      url:'OSRIC.js',
      group:'Old School D&D',
      require:'v3.5 (SRD only)'
    };

### Usage

Once the quilvyn-osric plugin is installed as described above, start Quilvyn and
check the box next to "OSRIC" from the rule sets menu in the initial window.
