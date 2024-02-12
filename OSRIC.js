/*
Copyright 2024, James J. Hayes

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation; either version 2 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 59 Temple
Place, Suite 330, Boston, MA 02111-1307 USA.
*/

/*jshint esversion: 6 */
/* jshint forin: false */
/* globals Quilvyn, QuilvynRules, QuilvynUtils, SRD35 */
"use strict";

/*
 * This module loads the rules from the Old School Reference and Index
 * Compilation adaptation of 1st Edition. The OSRIC function contains methods
 * that load rules for particular parts of the rule book; raceRules for
 * character races, magicRules for spells, etc. These member methods can be
 * called independently in order to use a subset of the OSRIC rules.
 * Similarly, the constant fields of OSRIC (LANGUAGES, RACES, etc.) can be
 * manipulated to modify the choices.
 */
function OSRIC(edition) {

  if(window.SRD35 == null) {
    alert('The OSRIC module requires use of the SRD35 module');
    return;
  }

  let rules = new QuilvynRules('OSRIC', OSRIC.VERSION);
  rules.plugin = OSRIC;
  OSRIC.rules = rules;

  rules.defineChoice('choices', OSRIC.CHOICES);
  rules.choiceEditorElements = OSRIC.choiceEditorElements;
  rules.choiceRules = OSRIC.choiceRules;
  rules.removeChoice = OSRIC.removeChoice;
  rules.editorElements = OSRIC.initialEditorElements();
  rules.getFormats = OSRIC.getFormats;
  rules.getPlugins = OSRIC.getPlugins;
  rules.makeValid = OSRIC.makeValid;
  rules.randomizeOneAttribute = OSRIC.randomizeOneAttribute;
  rules.defineChoice('random', OSRIC.RANDOMIZABLE_ATTRIBUTES);
  rules.getChoices = OSRIC.getChoices;
  rules.ruleNotes = OSRIC.ruleNotes;

  OSRIC.createViewers(rules, OSRIC.VIEWERS);
  rules.defineChoice('extras', 'sanityNotes', 'validationNotes');
  rules.defineChoice
    ('preset', 'race:Race,select-one,races','levels:Class Levels,bag,levels');

  OSRIC.abilityRules(rules);
  OSRIC.combatRules(rules, OSRIC.ARMORS, OSRIC.SHIELDS, OSRIC.WEAPONS);
  OSRIC.magicRules(rules, OSRIC.SCHOOLS, OSRIC.SPELLS);
  OSRIC.talentRules
    (rules, OSRIC.FEATURES, OSRIC.GOODIES, OSRIC.LANGUAGES, OSRIC.SKILLS);
  OSRIC.identityRules(rules, OSRIC.ALIGNMENTS, OSRIC.CLASSES, OSRIC.RACES);

  Quilvyn.addRuleSet(rules);

}

OSRIC.VERSION = '2.4.1.0';

/* List of choices that can be expanded by house rules. */
OSRIC.CHOICES = [
  'Armor', 'Class', 'Feature', 'Language', 'Race', 'Shield', 'Spell', 'Weapon'
];
/*
 * List of items handled by randomizeOneAttribute method. The order handles
 * dependencies among attributes when generating random characters.
 */
OSRIC.RANDOMIZABLE_ATTRIBUTES = [
  'abilities',
  'charisma', 'constitution', 'dexterity', 'intelligence', 'strength', 'wisdom',
  'extraStrength', 'name', 'race', 'gender', 'alignment', 'levels',
  'languages', 'hitPoints', 'proficiencies', 'skills', 'armor', 'shield',
  'weapons', 'spells'
];

OSRIC.ABILITIES = {
  'charisma':'',
  'constitution':'',
  'dexterity':'',
  'intelligence':'',
  'strength':'',
  'wisdom':''
};
OSRIC.ALIGNMENTS = {
  'Chaotic Evil':'',
  'Chaotic Good':'',
  'Chaotic Neutral':'',
  'Neutral Evil':'',
  'Neutral Good':'',
  'Neutral':'',
  'Lawful Evil':'',
  'Lawful Good':'',
  'Lawful Neutral':''
};
OSRIC.ARMORS = {
  'None':'AC=0 Move=120 Weight=0 ',
  'Banded':'AC=-6 Move=90 Weight=35',
  'Chain Mail':'AC=-5 Move=90 Weight=30',
  'Elven Chain Mail':'AC=-5 Move=120 Weight=15',
  'Leather':'AC=-2 Move=120 Weight=15',
  'Padded':'AC=-2 Move=90 Weight=10',
  'Plate Mail':'AC=-7 Move=60 Weight=45',
  'Ring Mail':'AC=-3 Move=90 Weight=35',
  'Scale Mail':'AC=-4 Move=60 Weight=40',
  'Splinted':'AC=-6 Move=60 Weight=40',
  'Studded Leather':'AC=-3 Move=90 Weight=20'
};
OSRIC.CLASSES = {
  'Assassin':
    'Require=' +
      '"alignment =~ \'Evil\'","constitution >= 6","dexterity >= 12",' +
      '"intelligence >= 11","strength >= 12","wisdom >= 6" ' +
    'HitDie=d6,15,1 THAC10="11 9@5 6@9 4@13 4@15" ' +
    'WeaponProficiency="3 4@7 5@11 6@15" NonproficientPenalty=-3 ' +
    'Breath="16 15@5 ...13@15" ' +
    'Death="13 12@5 ...10@15" ' +
    'Petrification="12 11@5 ...9@15" ' +
    'Spell="15 13@5 ...9@15" ' +
    'Wand="14 12@5 ...8@15" ' +
    'Features=' +
      '"1:Armor Proficiency (Leather/Studded Leather)",' +
      '"1:Shield Proficiency (All)",' +
      '1:Assassination,1:Backstab,"1:Delayed Henchmen",1:Disguise,' +
      '"1:Poison Use","3:Thief Skills",' +
      '"4:Limited Henchmen Classes",' +
      '"intelligence >= 15 ? 9:Bonus Languages",' +
      '"12:Read Scrolls" ' +
    'Experience=' +
      '"0 1600 3000 5750 12250 24750 50000 99000 200500 300000 400000 600000' +
      ' 750000 1000000 1500000"',
  'Cleric':
    'Require=' +
      '"charisma >= 6","constitution >= 6","intelligence >= 6",' +
      '"strength >= 6","wisdom >= 9" ' +
    'HitDie=d8,9,2 THAC10="10 8@4 ...-1@19" ' +
    'WeaponProficiency="2 3@4 ...9@22" NonproficientPenalty=-3 ' +
    'Breath="16 15@4 13@7 12@10 11@13 10@16 8@19" ' +
    'Death="10 9@4 7@7 6@10 5@13 4@16 2@19" ' +
    'Petrification="13 12@4 10@7 9@10 8@13 7@16 5@19" ' +
    'Spell="15 14@4 12@7 11@10 10@13 9@16 7@19" ' +
    'Wand="14 13@4 11@7 10@10 9@13 8@16 6@19" '+
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"1:Turn Undead",' +
      '"wisdom >= 16 ? 1:Bonus Cleric Experience",' +
      '"wisdom >= 13 ? 1:Bonus Spells",' +
      '"wisdom <= 12 ? 1:Cleric Spell Failure" ' +
    'Experience=' +
      '"0 1550 2900 6000 13250 27000 55000 110000 220000 450000 675000' +
      ' 900000 1125000 1350000 1575000 1800000 2025000 2250000 2475000 ' +
      '2700000 2925000 3150000 3375000 3600000" ' +
    'SpellSlots=' +
      '"C1:1@1 2@2 3@4 4@9 5@11 6@12 7@15 8@17 9@19",' +
      '"C2:1@3 2@4 3@5 4@9 5@12 6@13 7@15 8@17 9@19",' +
      '"C3:1@5 2@6 3@8 4@11 5@12 6@13 7@15 8@17 9@19",' +
      '"C4:1@7 2@8 3@10 4@13 5@14 6@16 7@18 8@20 9@21",' +
      '"C5:1@9 2@10 3@14 4@15 5@16 6@18 7@20 8@21 9@22",' +
      '"C6:1@11 2@12 3@16 4@18 5@20 6@21 7@23 8@24 9@26",' +
      '"C7:1@16 2@19 3@22 4@25 5@27 6@28 7@29"',
  'Druid':
    'Require=' +
      '"alignment =~ \'Neutral\'","charisma >= 15","constitution >= 6",' +
      '"dexterity >= 6","intelligence >= 6","strength >= 6","wisdom >= 12" ' +
    'Require=' +
      '"alignment =~ \'Neutral\'","charisma >= 15","wisdom >= 12" ' +
    'HitDie=d8,14,1 THAC10="10 8@4 ...2@14" ' +
    'WeaponProficiency="2 3@4 ...6@13" NonproficientPenalty=-4 ' +
    'Breath="16 15@4 13@7 12@10 11@11" ' +
    'Death="10 9@4 7@7 6@10 5@13" ' +
    'Petrification="13 12@4 10@7 9@10 8@13" ' +
    'Spell="15 14@4 12@7 11@10 10@13" ' +
    'Wand="14 13@4 11@7 10@10 9@13" ' +
    'Features=' +
      '"1:Armor Proficiency (Leather)","1:Shield Proficiency (All)",' +
      '"charisma >= 16/wisdom >= 16 ? 1:Bonus Druid Experience",' +
      '"wisdom >= 13 ? 1:Bonus Spells",' +
      '"1:Druids\' Cant","1:Resist Fire","1:Resist Lightning",' +
      '"3:Druid\'s Knowledge","3:Wilderness Movement",' +
      '"7:Immunity To Fey Charm",7:Shapeshift ' +
    'Experience=' +
      '"0 2000 4000 8000 12000 20000 35000 60000 90000 125000 200000 300000' +
      ' 750000 1500000" ' +
    'SpellSlots=' +
      '"D1:2@1 3@3 4@4 5@9 6@13",' +
      '"D2:1@2 2@3 3@5 4@7 5@11 6@14",' +
      '"D3:1@3 2@4 3@7 4@12 5@13 6@14",' +
      '"D4:1@6 2@8 3@10 4@12 5@13 6@14",' +
      '"D5:1@9 2@10 3@12 4@13 5@14",' +
      '"D6:1@11 2@12 3@13 4@14",' +
      '"D7:1@12 2@13 3@14"',
  'Fighter':
    'Require=' +
      '"charisma >= 6","constitution >= 7","dexterity >= 6","strength >= 9",' +
      '"wisdom >= 6" ' +
    'HitDie=d10,9,3 THAC10="10 9 ...-9@20" ' +
    'WeaponProficiency="4 5@3 ...15@23" NonproficientPenalty=-2 ' +
    'Breath="17 16@3 13@5 12@7 9@9 8@11 5@13 4@15 3@19" ' +
    'Death="14 13@3 11@5 10@7 8@9 7@11 5@13 4@15 3@17 2@19" ' +
    'Petrification="15 14@3 12@5 11@7 9@9 8@11 6@13 5@15 4@17 3@19" ' +
    'Spell="17 16@3 14@5 13@7 11@9 10@11 8@13 7@15 6@17 5@19" ' +
    'Wand="16 15@3 13@5 12@7 10@9 9@11 7@13 6@15 5@17 4@19" ' +
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"strength >= 16 ? 1:Bonus Fighter Experience",' +
      '"1:Fighting The Unskilled","7:Bonus Attacks" ' +
    'Experience=' +
      '"0 1900 4250 7750 16000 35000 75000 125000 250000 500000 750000' +
      ' 1000000 1250000 1500000 1750000 2000000 2250000 2500000 2750000' +
      ' 3000000 3250000 3500000 3750000 4000000"',
  'Illusionist':
    'Require=' +
      '"charisma >= 6","dexterity >= 16","intelligence >= 15",' +
      '"strength >= 6","wisdom >= 6" ' +
    'HitDie=d4,10,1 THAC10="11 9@6 ...3@24" ' +
    'WeaponProficiency="1 2@6 ...5@21" NonproficientPenalty=-5 ' +
    'Breath="15 13@6 ...7@21" ' +
    'Death="14 13@6 11@11 10@16 8@21" ' +
    'Petrification="13 11@6 ...5@21" ' +
    'Spell="12 10@6 ...4@21" ' +
    'Wand="11 9@6 ...3@21" '+
    'Features=' +
      '"1:Spell Book","10:Eldritch Craft" ' +
    'Experience=' +
      '"0 2500 4750 9000 18000 35000 60250 95000 144500 220000 440000 660000' +
      ' 880000 1100000 1320000 1540000 1760000 1980000 2200000 2420000' +
      ' 2640000 2860000 3080000 3300000" ' +
    'SpellSlots=' +
      '"I1:1@1 2@2 3@4 4@5 5@9 6@17",' +
      '"I2:1@3 2@4 3@5 4@10 5@12 6@18",' +
      '"I3:1@5 2@6 3@9 4@12 5@16 6@20",' +
      '"I4:1@7 2@8 3@11 4@15 5@19 6@21",' +
      '"I5:1@10 2@11 3@16 4@18 5@19 6@23",' +
      '"I6:1@12 2@13 3@17 4@20 5@22 6@24",' +
      '"I7:1@14 2@15 3@21 4@23 5@24"',
  'Magic User':
    'Require=' +
      '"charisma >= 6","constitution >= 6","dexterity >= 6",' +
      '"intelligence >= 9","wisdom >= 6" ' +
    'HitDie=d4,11,1 THAC10="11 9@6 ...3@24" ' +
    'WeaponProficiency="1 2@6 ...5@21" NonproficientPenalty=-5 ' +
    'Breath="15 13@6 ...7@21" ' +
    'Death="14 13@6 11@11 10@16 8@21" ' +
    'Petrification="13 11@6 ...5@21" ' +
    'Spell="12 10@6 ...4@21" ' +
    'Wand="11 9@6 ...3@21" ' +
    'Features=' +
      '"intelligence >= 16 ? 1:Bonus Magic User Experience",' +
      '"1:Spell Book","7:Eldritch Craft","12:Eldritch Power" ' +
    'Experience=' +
      '"0 2400 4800 10250 22000 40000 60000 80000 140000 250000 375000' +
      ' 750000 1125000 1500000 1875000 2250000 2625000 3000000 3375000' +
      ' 3750000 4125000 4500000 4875000 5250000" ' +
    'SpellSlots=' +
      '"M1:1@1 2@2 3@4 4@5 5@12 6@21",' +
      '"M2:1@3 2@4 3@6 4@9 5@13 6@21",' +
      '"M3:1@5 2@6 3@8 4@11 5@14 6@22",' +
      '"M4:1@7 2@8 3@11 4@14 5@17 6@22",' +
      '"M5:1@9 2@10 3@11 4@14 5@17 6@23",' +
      '"M6:1@12 2@13 3@15 4@17 5@19 6@23",' +
      '"M7:1@14 2@15 3@17 4@19 5@22 6@24",' +
      '"M8:1@16 2@17 3@19 4@21 5@24",' +
      '"M9:1@18 2@20 3@23"',
  'Paladin':
    'Require=' +
      '"alignment == \'Lawful Good\'","charisma >= 17","constitution >= 9",' +
      '"dexterity >= 6","intelligence >= 9","strength >= 12","wisdom >= 13" ' +
    'HitDie=d10,9,3 THAC10="10 9 ...-9@20 -9@24" ' +
    'WeaponProficiency="3 4@3 ...14@23" NonproficientPenalty=-2 ' +
    'Breath="15 14@3 11@5 10@7 7@9 6@11 3@13 2@15" ' +
    'Death="12 11@3 9@5 8@7 6@9 5@11 3@13 2@15" ' +
    'Petrification="13 12@3 10@5 9@7 7@9 6@11 4@13 3@15 2@17" ' +
    'Spell="15 14@3 12@5 11@7 9@9 8@11 6@13 5@15 4@17 3@19" ' +
    'Wand="14 13@3 11@5 10@7 8@9 7@11 5@13 4@15 3@17 2@19" ' +
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"strength >= 16/wisdom >= 16 ? 1:Bonus Paladin Experience",' +
      '"1:Cure Disease","1:Detect Evil",1:Discriminating,"1:Divine Health",' +
      '"1:Fighting The Unskilled","1:Improved Saving Throws",' +
      '"1:Lay On Hands",1:Non-Materialist,1:Philanthropist,' +
      '"1:Protection From Evil","3:Turn Undead","4:Summon Warhorse",' +
      '"8:Bonus Attacks" ' +
    'Experience=' +
      '"0 2550 5500 12500 25000 45000 95000 175000 325000 600000 1000000' +
      ' 1350000 1700000 2050000 2400000 2750000 3100000 3450000 3800000' +
      ' 4150000 4500000 4850000 5200000 5550000" ' +
    'SpellSlots=' +
      '"C1:1@9 2@10 3@14 4@21",' +
      '"C2:1@11 2@12 3@16 4@22",' +
      '"C3:1@13 2@17 3@18 4@23",' +
      '"C4:1@15 2@19 3@20 4@24"',
  'Ranger':
    'Require=' +
      '"alignment =~ \'Good\'","charisma >= 6","constitution >= 14",' +
      '"dexterity >= 6","intelligence >= 13","strength >= 13","wisdom >= 14" ' +
    'HitDie=2d8,10,2 THAC10="10 9 ...-9@20 -9@24" ' +
    'WeaponProficiency="3 4@3 ...14@23" NonproficientPenalty=-2 ' +
    'Breath="17 16@3 13@5 12@7 9@9 8@11 5@13 4@15 3@19" ' +
    'Death="14 13@3 11@5 10@7 8@9 7@11 5@13 4@15 3@17 2@19" ' +
    'Petrification="15 14@3 12@5 11@7 9@9 8@11 6@13 5@15 4@17 3@19" ' +
    'Spell="17 16@3 14@5 13@7 11@9 10@11 8@13 7@15 6@17 5@19" ' +
    'Wand="16 15@3 13@5 12@7 10@9 9@11 7@13 6@15 5@17 4@19" ' +
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"strength >= 16/intelligence >= 16/wisdom >= 16 ? 1:Bonus Ranger Experience",' +
      '"1:Alert Against Surprise","1:Damage Bonus","1:Delayed Henchmen",' +
      '"1:Fighting The Unskilled",1:Loner,1:Selective,1:Tracking,' +
      '"1:Travel Light","8:Bonus Attacks","10:Scrying Device Use" ' +
    'Experience=' +
      '"0 2250 4500 9500 20000 40000 90000 150000 225000 325000 650000' +
      ' 975000 1300000 1625000 1950000 2275000 2600000 2925000 3250000' +
      ' 3575000 3900000 4225000 4550000 4875000" ' +
    'SpellSlots=' +
      '"D1:1@8 2@10 3@18 4@23",' +
      '"D2:1@12 2@14 3@20",' +
      '"D3:1@16 2@17 3@22",' +
      '"M1:1@9 2@11 3@19 4@24",' +
      '"M2:1@13 2@15 3@21"',
  'Thief':
    'Require=' +
      '"alignment =~ \'Neutral|Evil\'","dexterity >= 9" ' +
    'Require=' +
      '"alignment =~ \'Neutral|Evil\'","charisma >= 6","constitution >= 6",' +
      '"dexterity >= 9","intelligence >= 6","strength >= 6" ' +
    'HitDie=d6,10,2 THAC10="11 9@5 6@9 4@13 ...0@24" ' +
    'WeaponProficiency="2 3@5 ...7@21" NonproficientPenalty=-3 ' +
    'Breath="16 15@5 ...11@21" ' +
    'Death="13 12@5 ...8@21" ' +
    'Petrification="12 11@5 ...7@21" ' +
    'Spell="15 13@5 ...5@21" ' +
    'Wand="14 12@5 ...4@21" '+
    'Features=' +
      '"1:Armor Proficiency (Leather/Studded Leather)",' +
      '"dexterity >= 16 ? 1:Bonus Thief Experience",' +
      '1:Backstab,"1:Thief Skills","1:Thieves\' Cant","10:Read Scrolls" ' +
    'Experience=' +
      '"0 1250 2500 5000 10000 20000 40000 70000 110000 160000 220000 440000' +
      ' 660000 880000 1100000 1320000 1540000 1760000 1980000 2200000 2420000' +
      ' 2640000 2860000 3080000"'
};
OSRIC.FEATURES = {

  // Class
  'Alert Against Surprise':
    'Section=combat Note="Surprised 1in6, surprise 3in6"',
  'Assassination':
    'Section=combat ' +
    'Note="Strike kills surprised target %{levels.Assassin*5+50}% - 5%/2 foe levels"',
  'Backstab':
    'Section=combat Note="+4 melee attack and x%{((levels.Assassin||0)+7>?(levels.Thief||0)+7)//4<?5} damage when surprising"',
  'Bonus Attacks':'Section=combat Note="+%V attacks/rd"',
  'Bonus Cleric Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Bonus Druid Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Bonus Fighter Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Bonus Languages':
    'Section=skill ' +
    'Note="May learn %{levels.Assassin-8<?4<?intelligence-14} additional choices from alignment languages, druidic, or thieves\' cant"',
  'Bonus Magic User Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Bonus Paladin Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Bonus Ranger Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Bonus Spells':'Section=magic Note="Spell level %V"',
  'Bonus Thief Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Cleric Spell Failure':'Section=magic Note="%{(12-wisdom)*5>?1}%"',
  'Cure Disease':
    'Section=magic ' +
    'Note="May cast <i>Cure Disease</i> %{(levels.Paladin+4)//5<?3}/wk"',
  'Damage Bonus':
    'Section=combat ' +
    'Note="+%{levels.Ranger} melee damage vs. evil humanoids and giantish foes"',
  'Delayed Henchmen':
    'Section=ability ' +
    'Note="May not hire henchmen until level %{levels.Ranger?8:4}"',
  'Detect Evil':
    'Section=magic Note="May cast R60\' <i>Detect Evil</i> at will"',
  'Discriminating':
    'Section=feature Note="Must not associate w/non-good characters"',
  'Disguise':'Section=feature Note="92%+ successful disguise"',
  'Divine Health':'Section=save Note="Immune to disease"',
  'Double Specialization':
    'Section=combat ' +
    'Note="+3 %{weaponSpecialization} Attack Modifier/+3 %{weaponSpecialization} Damage Modifier"',
  "Druids' Cant":'Section=skill Note="Speaks the secret language of Druids"',
  "Druid's Knowledge":
    'Section=feature ' +
    'Note="May identify plant and animal types and determine water purity"',
  'Eldritch Craft':
    'Section=magic ' +
    'Note="May create magical potions and scrolls and recharge rods, staves, and wands%{($\'levels.Magic User\'||11)<11?\' with the aid of an alchemist\':\'\'}"',
  'Eldritch Power':
    'Section=magic ' +
    'Note="May create magical items using the <i>Enchant An Item</i> spell"',
  'Fighting The Unskilled':
    'Section=combat ' +
    'Note="%{warriorLevel} attacks/rd vs. creatures with w/HD less than 1d8"',
  'Immunity To Fey Charm':'Section=save Note="Immune to fey enchantment"',
  'Lay On Hands':
    'Section=magic Note="May use touch to heal %{levels.Paladin*2} HP 1/dy"',
  'Limited Henchmen Classes':
    'Section=ability ' +
    'Note="Henchmen must be assassins%{levels.Assassin<8?\'\':\' or thieves\'}"',
  'Loner':'Section=feature Note="Will not work w/more than 2 other rangers"',
  'Non-Materialist':
    'Section=feature Note="Owns at most 10 magic items, including 1 armor suit and 1 shield"',
  'Philanthropist':
    'Section=feature ' +
    'Note="Must donate 10% of income plus 100% after expenses to lawful good causes"',
  'Poison Use':
    'Section=combat ' +
    'Note="Familiar with ingested poisons and poisoned weapon use"',
  'Protection From Evil':
    'Section=magic ' +
    'Note="Has a continuous <i>Protection From Evil</i> 10\' Radius effect centered on self"',
  'Read Scrolls':
    'Section=magic ' +
    'Note="May use arcane spell scrolls w/a %{intelligence*5-10}% chance of success"',
  'Resist Fire':'Section=save Note="+2 vs. fire"',
  'Resist Lightning':'Section=save Note="+2 vs. lightning"',
  'Scrying Device Use':'Section=magic Note="May use scrying magic items"',
  'Selective':'Section=feature Note="Must employ only good henchmen"',
  'Shapeshift':
    'Section=magic ' +
    'Note="May change into a natural animal, regaining 1d6x10% HP, 3/dy"',
  'Spell Book':
    'Section=magic ' +
    'Note="Understands %{intelligence>=19?10:intelligence==18?9:intelligence==17?8:intelligence>=15?7:intelligence>=13?6:intelligence>=10?5:4}-%{intelligence>=19?22:intelligence==18?18:intelligence==17?14:intelligence>=15?11:intelligence>=13?9:intelligence>=10?7:6} spells of each level; has a %{intelligence>=19?90:intelligence==18?85:intelligence==17?75:intelligence>=15?65:intelligence>=13?55:intelligence>=10?45:35}% chance to understand a particular spell"',
  'Summon Warhorse':
    'Section=feature Note="May call a warhorse w/enhanced features"',
  'Thief Skills':
    'Section=skill ' +
    'Note="May Climb Walls, Find Traps, Hear Noise, Hide In Shadows, Move Silently, Open Locks, Pick Pockets, and Read Languages"',
  "Thieves' Cant":
    'Section=skill Note="Speaks the secret language of thieves"',
  'Tracking':
    'Section=feature Note="May track creatures w/90% success in rural settings and 65%+ success in urban or dungeon settings"',
  'Travel Light':
    'Section=feature Note="May not possess more than can be carried"',
  'Turn Undead':
    'Section=combat ' +
    'Note="May turn for 3d4 rd or %{alignment=~\'Evil\'?\'control\':\'destroy\'} undead creatures"',
  'Weapon Specialization':
     'Section=combat ' +
    'Note="+1 %{weaponSpecialization} Attack Modifier/+2 %{weaponSpecialization} Damage Modifier/+%{level//2} attacks/rd"',
  'Wilderness Movement':
     'Section=feature ' +
     'Note="May move through undergrowth at full speed, leaving no trace"',

  // Race
  'Bow Precision':'Section=combat Note="+1 attack w/bows"',
  'Burrow Tongue':'Section=feature Note="May speak w/burrowing animals"',
  'Deadly Aim':'Section=combat Note="+3 attack w/bows and slings"',
  'Detect Construction':
    'Section=feature Note="R10\' 75% chance to detect new construction"',
  'Detect Hazard':
    'Section=feature ' +
    'Note="R10\' 70% chance to detect unsafe walls, ceilings, and floors"',
  'Detect Secret Doors':
    'Section=feature ' +
    'Note="1in6 chance to notice when passing secret doors and 2in6 chance when searching; 3in6 chance to notice concealed doors"',
  'Detect Sliding':
    'Section=feature Note="R10\' 66% chance to detect sliding walls"',
  'Detect Slope':
    'Section=feature Note="R10\' %{race=~\'Dwarf\'?75:80}% chance to detect slopes and grades"',
  'Detect Traps':
    'Section=feature Note="R10\' 50% chance to detect stonework traps"',
  'Determine Depth':
    'Section=feature ' +
    'Note="%{race=~\'Dwarf\'?50:60}% chance to determine approximate depth underground"',
  'Determine Direction':
    'Section=feature Note="50% chance to determine direction underground"',
  'Dwarf Ability Adjustment':
    'Section=ability Note="+1 Constitution/-1 Charisma"',
  'Dwarf Dodge':
    'Section=combat Note="-4 AC vs. giants, ogres, titans, and trolls"',
  'Dwarf Enmity':'Section=combat Note="+1 attack vs. goblinoids and orcs"',
  'Elf Ability Adjustment':
    'Section=ability Note="+1 Dexterity/-1 Constitution"',
  'Gnome Dodge':
    'Section=combat ' +
    'Note="-4 AC vs. bugbears, giants, gnolls, ogres, titans, and trolls"',
  'Gnome Enmity':'Section=combat Note="+1 attack vs. goblins and kobolds"',
  'Half-Orc Ability Adjustment':
    'Section=ability Note="+1 Strength/+1 Constitution/-2 Charisma"',
  'Halfling Ability Adjustment':
    'Section=ability Note="+1 Dexterity/-1 Strength"',
  'Infravision':'Section=feature Note="60\' vision in darkness"',
  'Resist Charm':'Section=save Note="%{race=~\'Half-Elf\'?30:90}% vs. charm"',
  'Resist Magic':
    'Section=save Note="+%{constitution/3.5//1} vs. spells and wands"',
  'Resist Poison':'Section=save Note="+%{constitution/3.5//1} vs. poison"',
  'Resist Sleep':'Section=save Note="%{race=~\'Half-Elf\'?30:90}% vs. sleep"',
  'Slow':'Section=ability Note="-30 Speed"',
  'Stealthy':
    'Section=combat ' +
    'Note="4in6 chance to surprise when traveling quietly; 2in6 when opening doors"',
  'Sword Precision':
    'Section=combat Note="+1 attack w/Long Sword and Short Sword"',

  // Misc
  'Armor Speed Limit':'Section=ability Note="%V"'

};
OSRIC.GOODIES = {
  'Armor':
    'Pattern="([-+]\\d).*\\b(?:armor(?:\\s+class)?|AC)\\b|\\b(?:armor(?:\\s+class)?|AC)\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=armorClass ' +
    'Section=combat Note="%V Armor Class"',
  'Breath':
    'Pattern="([-+]\\d)\\s+breath\\s+save\\b|\\bbreath\\s+save\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=save.Breath ' +
    'Section=save Note="%V Breath"',
  'Charisma':
    'Pattern="([-+]\\d)\\s+cha(?:risma)?\\b|\\bcha(?:risma)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=charisma ' +
    'Section=ability Note="%V Charisma"',
  'Constitution':
    'Pattern="([-+]\\d)\\s+con(?:stitution)?\\b|\\bcon(?:stitution)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=constitution ' +
    'Section=ability Note="%V Constitution"',
  'Death':
    'Pattern="([-+]\\d)\\s+death\\s+save\\b|\\bdeath\\s+save\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=save.Death ' +
    'Section=save Note="%V Death"',
  'Dexterity':
    'Pattern="([-+]\\d)\\s+dex(?:terity)?\\b|\\bdex(?:terity)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=dexterity ' +
    'Section=ability Note="%V Dexterity"',
  'Intelligence':
    'Pattern="([-+]\\d)\\s+int(?:elligence)?\\b|\\bint(?:elligence)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=intelligence ' +
    'Section=ability Note="%V Intelligence"',
  'Petrification':
    'Pattern="([-+]\\d)\\s+petrification\\s+save\\b|\\bpetrification\\s+save\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=save.Petrification ' +
    'Section=save Note="%V Petrification"',
  'Protection':
    'Pattern="([-+]\\d).*\\bprotection\\b|\\bprotection\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=armorClass ' +
    'Section=combat Note="%V Armor Class"',
  'Shield':
    'Pattern="([-+]\\d).*\\s+shield\\b|\\bshield\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=armorClass ' +
    'Section=combat Note="%V Armor Class"',
  'Speed':
    'Pattern="([-+]\\d+).*\\s+speed\\b|\\bspeed\\s+([-+]\\d+)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=speed ' +
    'Section=ability Note="%V Speed"',
  'Spell':
    'Pattern="([-+]\\d)\\s+spell\\s+save\\b|\\bspell\\s+save\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=save.Spell ' +
    'Section=save Note="%V Spell"',
  'Strength':
    'Pattern="([-+]\\d)\\s+str(?:ength)?\\b|\\bstr(?:ength)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=strength ' +
    'Section=ability Note="%V Strength"',
  'Wand':
    'Pattern="([-+]\\d)\\s+wand\\s+save\\b|\\bwand\\s+save\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=save.Wand ' +
    'Section=save Note="%V Wand"',
  'Wisdom':
    'Pattern="([-+]\\d)\\s+wis(?:dom)?\\b|\\bwis(?:dom)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=wisdom ' +
    'Section=ability Note="%V Wisdom"'
};
OSRIC.LANGUAGES = {
  'Common':'',
  'Dwarf':'',
  'Elf':'',
  'Gnoll':'',
  'Gnome':'',
  'Goblin':'',
  'Halfling':'',
  'Hobgoblin':'',
  'Kobold':'',
  'Orc':''
};
OSRIC.RACES = {
  'Dwarf':
    'Require=' +
      '"charisma <= 16","constitution >= 12","dexterity <= 17",' +
      '"strength >= 8" ' +
    'Features=' +
      '"1:Detect Construction","1:Detect Sliding","1:Detect Slope",' +
      '"1:Detect Traps","1:Determine Depth","1:Dwarf Ability Adjustment",' +
      '"1:Dwarf Dodge","1:Dwarf Enmity",1:Infravision,"1:Resist Magic",' +
      '"1:Resist Poison",1:Slow ' +
    'Languages=' +
      'Common,Dwarf,Gnome,Goblin,Kobold,Orc',
  'Elf':
    'Require=' +
      '"charisma >= 8","constitution >= 8","dexterity >= 7",' +
      '"intelligence >= 8" ' +
    'Features=' +
      '"1:Bow Precision","1:Detect Secret Doors","1:Elf Ability Adjustment",' +
      '1:Infravision,"1:Resist Charm","1:Resist Sleep",1:Stealthy,' +
      '"1:Sword Precision" ' +
    'Languages=' +
      'Common,Elf,Gnoll,Gnome,Goblin,Halfling,Hobgoblin,Orc',
  'Gnome':
    'Require=' +
      '"constitution >= 8","intelligence >= 7","strength >= 6" ' +
    'Features=' +
      '"1:Burrow Tongue","1:Detect Hazard","1:Detect Slope",' +
      '"1:Determine Depth","1:Determine Direction","1:Gnome Dodge",' +
      '"1:Gnome Enmity",1:Infravision,"1:Resist Magic","1:Resist Poison",' +
      '1:Slow ' +
    'Languages=' +
      'Common,Dwarf,Gnome,Goblin,Halfling,Kobold',
  'Half-Elf':
    'Require=' +
      '"constitution >= 6","dexterity >= 6","intelligence >= 4" ' +
    'Features=' +
      '"1:Detect Secret Doors",1:Infravision,"1:Resist Charm",' +
      '"1:Resist Sleep" ' +
    'Languages=' +
      'Common,Elf,Gnoll,Gnome,Goblin,Halfling,Hobgoblin,Orc',
  'Half-Orc':
    'Require=' +
      '"charisma <= 12","constitution >= 13","dexterity <= 17",' +
      '"intelligence <= 17","strength >= 6","wisdom <= 14" ' +
    'Features=' +
      '"1:Half-Orc Ability Adjustment",1:Infravision ' +
    'Languages=' +
      'Common,Orc',
  'Halfling':
    'Require=' +
      '"constitution >= 10","dexterity >= 8","intelligence >= 6",' +
      '"strength >= 6","wisdom <= 17" ' +
    'Features=' +
      '"1:Deadly Aim","1:Halfling Ability Adjustment",1:Infravision,' +
      '"1:Resist Magic","1:Resist Poison",1:Slow,1:Stealthy ' +
    'Languages=' +
      'Common,Dwarf,Gnome,Goblin,Halfling,Orc',
  'Human':
    'Languages=' +
      'Common'
};
OSRIC.SCHOOLS = {
  'Abjuration':'',
  'Alteration':'',
  'Conjuration':'',
  'Divination':'',
  'Enchantment':'',
  'Evocation':'',
  'Illusion':'',
  'Necromancy':'',
  'Possession':''
};
OSRIC.SHIELDS = {
  'None':'AC=0 Weight=0',
  'Large Shield':'AC=-1 Weight=10',
  'Medium Shield':'AC=-1 Weight=8',
  'Small Shield':'AC=-1 Weight=5'
};
OSRIC.SKILLS = {
  'Climb Walls':'Class=Assassin,Thief',
  'Find Traps':'Class=Assassin,Thief',
  'Hear Noise':'Class=Assassin,Thief',
  'Hide In Shadows':'Class=Assassin,Thief',
  'Move Silently':'Class=Assassin,Thief',
  'Open Locks':'Class=Assassin,Thief',
  'Pick Pockets':'Class=Assassin,Thief',
  'Read Languages':'Class=Assassin,Thief'
};
OSRIC.SPELLS = {
  'Aerial Servant':
    'School=Conjuration ' +
    'Level=C6 ' +
    'Description=' +
      '"R10\' Summons a servant to fetch requested items and creatures for %{lvl} dy"',
  'Affect Normal Fires':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description=' +
      '"R%{lvl*5}\' Changes size of up to 1.5\' radius fire from candle flame to 1.5\' radius for %{lvl} rd"',
  'Airy Water':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description="Makes water in a 10\' radius breathable for %{lvl} tn"',
  'Alter Reality':
    'School=Illusion ' +
    'Level=I7 ' +
    'Description="Uses <i>Phantasmal Force</i> to fulfill a limited wish"',
  'Animal Friendship':
    'School=Enchantment ' +
    'Level=D1 ' +
    'Description="R10\' Recruits an animal companion (Save neg)"',
  'Animal Growth':
    'School=Alteration ' +
    'Level=D5,M5 ' +
    'Description=' +
      '"R%{slv==\'M5\'?60:80}\' Doubles (Reverse halves) the size, HD, and damage of 8 animals for %{slv==\'D5\'?lvl*2:lvl} rd"',
  'Animal Summoning I':
    'School=Conjuration ' +
    'Level=D4 ' +
    'Description="R%{lvl*120}\' Calls 8 4 HD animals to assist self"',
  'Animal Summoning II':
    'School=Conjuration ' +
    'Level=D5 ' +
    'Description=' +
      '"R%{lvl*180}\' Calls 6 8 HD or 12 4 HD animals to assist self"',
  'Animal Summoning III':
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description=' +
      '"R%{lvl*240}\' Calls 4 16 HD or 16 4 HD animals to assist self"',
  'Animate Dead':
    'School=Necromancy ' +
    'Level=C3,M5 ' +
    'Description=' +
      '"R10\' Creates from corpses %{lvl} obedient skeletons or zombies"',
  'Animate Object':
    'School=Alteration ' +
    'Level=C6 ' +
    'Description="R30\' Target object obeys self for %{lvl} rd"',
  'Animate Rock':
    'School=Alteration ' +
    'Level=D7 ' +
    'Description="R40\' Target %{lvl*2}\' cu rock obeys self for %{lvl} rd"',
  'Anti-Animal Shell':
    'School=Abjuration ' +
    'Level=D6 ' +
    'Description="10\' radius blocks animal matter for %{lvl} tn"',
  'Anti-Magic Shell':
    'School=Abjuration ' +
    'Level=M6 ' +
    'Description="%{lvl*5}\' radius blocks magic for %{lvl} tn"',
  'Anti-Plant Shell':
    'School=Abjuration ' +
    'Level=D5 ' +
    'Description="80\' radius blocks plant matter for %{lvl} tn"',
  'Antipathy/Sympathy':
    'School=Enchantment ' +
    'Level=M8 ' +
    'Description=' +
      '"R30\' Target %{lvl*10}\' cu or object repels (Reverse attracts) specified creature type or alignment (Save inflicts -1 Dexterity/rd for 4 rd) for %{lvl*2} hr"',
  'Astral Spell':
    'School=Alteration ' +
    'Level=C7,I7,M9 ' +
    'Description="Self and 5 touched leave bodies to travel on the astral plane"',
  'Astral Spell M9':
    'School=Evocation',
  'Atonement':
    'School=Abjuration ' +
    'Level=C5 ' +
    'Description=' +
      '"Relieves touched from the consequences of an unwilling alignment violation"',
  'Audible Glamour':
    'School=Illusion ' +
    'Level=I1,M2 ' +
    'Description=' +
      '"R%{lvl*10+60}\' Creates sounds equivalent to %{(lvl-2)*4} people shouting (Save disbelieve) for %{lvl*(slv==\'I1\'?3:2)} rd"',
  'Augury':
    'School=Divination ' +
    'Level=C2 ' +
    'Description=' +
      '"Gives self a %{lvl+70}% chance to learn the outcome (weal or woe) of a proposed action up to 30 min in the future"',
  'Barkskin':
    'School=Alteration ' +
    'Level=D2 ' +
    'Description="Touched gains +1 AC and non-spell saves for %{lvl+4} rd"',
  'Blade Barrier':
    'School=Evocation ' +
    'Level=C6 ' +
    'Description=' +
      '"R30\' 2\' - 10\' radius blade wall inflicts 8d8 HP for %{lvl*3} rd"',
  'Bless':
    'School=Conjuration ' +
    'Level=C1 ' +
    'Description=' +
      '"R60\' Unengaged allies in a 50\' sq gain +1 attack and morale (Reverse inflicts -1 on foes) for 6 rd"',
  'Blindness':
    'School=Illusion ' +
    'Level=I2 ' +
    'Description="R30\' Blinds target (Save neg)"',
  'Blink':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description=' +
      '"Self teleports randomly 2\'/rd, preventing direct attacks, for %{lvl} rd"',
  'Blur':
    'School=Illusion ' +
    'Level=I2 ' +
    'Description=' +
      '"Self gains +1 saves vs. targeted magic, and foes suffer -4 on first attack on self and -2 on subsequent attacks, for %{lvl+3} rd"',
  'Burning Hands':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="3\' cone inflicts %{lvl} HP"',
  'Cacodemon':
    'School=Conjuration ' +
    'Level=M7 ' +
    'Description="R10\' Summons a named demon or devil"',
  'Call Lightning':
    'School=Alteration ' +
    'Level=D3 ' +
    'Description=' +
      '"R360\' Clouds release a 10\' bolt that inflicts %{lvl+2}d8 HP (Save half) 1/tn for %{lvl} tn"',
  'Call Woodland Beings':
    'School=Conjuration ' +
    'Level=D4 ' +
    'Description=' +
      '"R%{lvl*30+360}\' Summons forest denizens to assist self (Save -4 neg)"',
  'Change Self':
    'School=Illusion ' +
    'Level=I1 ' +
    'Description=' +
      '"Changes self appearance to a different humanoid for 2d6 + %{lvl*2} rd"',
  'Chant':
    'School=Conjuration ' +
    'Level=C2 ' +
    'Description=' +
      '"R30\' Allies gain +1 attack, damage, and saves, and foes -1, as long as chanting continues"',
  'Chaos':
    'School=Enchantment ' +
    'Level=I5 ' +
    'Description=' +
      '"R%{lvl*5}\' Causes creatures in a 40\' sq to: 10% attack self or allies; 10% act normally; 30% babble; 20% wander way; 30% attack nearest creature (Save by illusionists and fighters neg 1 rd), each rd for %{lvl} rd"',
  'Chariot Of Fire':
    'School=Evocation ' +
    'Level=D7 ' +
    'Description=' +
      '"R10\' Creates a flaming chariot and horse pair (each AC 2, HP 30) that drives self and 8 others 240\'/rd or flies 480\'/rd for %{lvl+6} tn"',
  'Charm Monster':
    'School=Enchantment ' +
    'Level=M4 ' +
    'Description=' +
      '"R60\' Target 2d4 HD creatures treat self as a trusted friend (Save neg)"',
  'Charm Person Or Mammal':
    'School=Enchantment ' +
    'Level=D2 ' +
    'Description="R80\' Target treats self as a trusted friend (Save neg)"',
  'Charm Person':
    'School=Enchantment ' +
    'Level=M1 ' +
    'Description="R120\' Target treats self as a trusted friend (Save neg)"',
  'Charm Plants':
    'School=Enchantment ' +
    'Level=M7 ' +
    'Description="R30\' Plants in a 30\'x10\' area obey self (Save neg)"',
  'Clairaudience':
    'School=Divination ' +
    'Level=M3 ' +
    'Description="Self hears a known location for %{lvl} rd"',
  'Clairvoyance':
    'School=Divination ' +
    'Level=M3 ' +
    'Description="Self sees a known location for %{lvl} rd"',
  'Clenched Fist':
    'School=Evocation ' +
    'Level=M8 ' +
    'Description=' +
      '"R%{lvl*5}\' Creates a giant force hand that absorbs attacks (%{hitPoints} HP) and inflicts 1d6 - 4d6 HP for conc up to %{lvl} rd"',
  'Clone':
    'School=Necromancy ' +
    'Level=M8 ' +
    'Description=' +
      '"Grows a copy of target; each must destroy the other or go insane"',
  'Cloudkill':
    'School=Evocation ' +
    'Level=M5 ' +
    'Description=' +
      '"R10\' Creates a poisonous 40\'x20\'x20\' cloud that moves 10\'/rd and kills (5+2 HD Save neg, 4+1 HD -4 Save neg) for %{lvl} rd"',
  'Colour Spray':
    'School=Alteration ' +
    'Level=I1 ' +
    'Description=' +
      '"1d6 targets in a %{lvl*10}\' cone suffer unconsciousness (up to %{lvl} HD), blindness for 1d4 rd (%{lvl+1} - %{lvl+2} HD), or stunning for 2d4 seg (%{lvl+3}+ HD) (Save %{lvl+1} HD+ neg)"',
  'Command':
    'School=Enchantment ' +
    'Level=C1 ' +
    'Description=' +
      '"R10\' Target obeys a single-word command (Save neg for Intelligence 13+ or HD 6+)"',
  'Commune':
    'School=Divination ' +
    'Level=C5 ' +
    'Description="Deity answers %{lvl} yes/no questions"',
  'Commune With Nature':
    'School=Divination ' +
    'Level=D5 ' +
    'Description=' +
      '"Self learns nature info about surrounding %{lvl//2} mile radius"',
  'Comprehend Languages':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description=' +
      '"Self understands all writing and speech for %{lvl*5} rd (Reverse obscures)"',
  'Cone Of Cold':
    'School=Evocation ' +
    'Level=M5 ' +
    'Description="%{lvl*5}\' cone inflicts %{lvl}d4+%{lvl} HP (Save half)"',
  'Confusion':
    'School=Enchantment ' +
    'Level=D7,I4,M4 ' +
    'Description=' +
      '"R%{slv==\'M4\'?120:80}\' Causes 2d%{slv==\'D7\'?4:8} or more creatures in a %{slv==\'D7\'?20:slv==\'I4\'?40:60}\' %{slv==\'D7\'?\'radius\':\'sq\'} to: 10% attack self or allies; 10% act normally; 30% babble; 20% wander way; 30% attack nearest creature (Save neg 1 rd), each rd for %{lvl+(slv==\'M4\'?2:0)} rd"',
  'Conjure Animals':
    'School=Conjuration ' +
    'Level=C6,I6 ' +
    'Description=' +
      '"R30\' Summons %{lvl} HD of animals to fight for %{slv==\'C6\'?lvl*2:lvl} rd"',
  'Conjure Earth Elemental':
    'School=Conjuration ' +
    'Level=D7 ' +
    'Description=' +
      '"R40\' Summons a 16 HD elemental that assists self for %{lvl} tn (Reverse dismisses)"',
  'Conjure Elemental':
    'School=Conjuration ' +
    'Level=M5 ' +
    'Description=' +
      '"R60\' Summons an elemental that obeys self for conc up to %{lvl} tn"',
  'Conjure Fire Elemental':
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description=' +
      '"R80\' Summons a 16 HD elemental that assists self for %{lvl} tn (Reverse dismisses)"',
  'Contact Other Plane':
    'School=Divination ' +
    'Level=M5 ' +
    'Description="Self may ask %{lvl//2} questions of an extraplanar entity"',
  'Continual Darkness':
    'School=Alteration ' +
    'Level=I3 ' +
    'Description="R60\' Suppresses all light in a 30\' radius"',
  'Continual Light':
    'School=Alteration ' +
    'Level=C3,I3,M2 ' +
    'Description=' +
      '"R%{slv==\'C3\'?120:60}\' Target emits light in a 60\' radius (Reverse darkness) until dispelled"',
  "Control Temperature 10' Radius":
    'School=Alteration ' +
    'Level=D4 ' +
    'Description=' +
      '"Changes the temperature in a 10\' radius by %{lvl*9}F for %{lvl+4} tn"',
  'Control Weather':
    'School=Alteration ' +
    'Level=C7,D7,M6 ' +
    'Description=' +
      '"Controls the precipitation, temperature, and wind within 4d%{slv==\'D7\'?8:4} sq miles for %{slv==\'C7\'?\'4d12\':slv==\'D7\'?\'8d12\':\'4d6\'} hr"',
  'Control Winds':
    'School=Alteration ' +
    'Level=D5 ' +
    'Description=' +
      '"Changes the wind speed in a %{lvl*40}\' radius by %{lvl*3} MPH for %{lvl} tn"',
  'Create Food And Water':
    'School=Alteration ' +
    'Level=C3 ' +
    'Description=' +
      '"R10\' Creates sufficient daily food and drink for %{lvl} persons"',
  'Create Water':
    'School=Alteration ' +
    'Level=C1,D2 ' +
    'Description=' +
      '"R10\' Creates (Reverse destroys) %{slv==\'C1\'?lvl*4+\' gallons\':(lvl+\\"\' cu\\")} of potable water"',
  'Creeping Doom':
    'School=Conjuration ' +
    'Level=D7 ' +
    'Description=' +
      '"Bugs erupt and attack as directed w/in an 80\' radius for %{lvl*4} rd"',
  'Crushing Hand':
    'School=Evocation ' +
    'Level=M9 ' +
    'Description=' +
      '"R%{lvl*5}\' Creates a giant force hand that absorbs attacks (%{hitPoints} HP) and inflicts 1d10 - 4d10 HP for conc up to %{lvl} rd"',
  'Cure Blindness':
    'School=Abjuration ' +
    'Level=C3 ' +
    'Description="Touched recovers from blindness (Reverse blinds; Save neg)"',
  'Cure Critical Wounds':
    'School=Necromancy ' +
    'Level=C5,D6 ' +
    'Description="Touched regains 3d8+3 HP (Reverse inflicts)"',
  'Cure Disease':
    'School=Abjuration ' +
    'Level=C3,D3 ' +
    'Description="Touched recovers from disease (Reverse infects; Save neg)"',
  'Cure Disease D3':
    'School=Necromancy',
  'Cure Light Wounds':
    'School=Necromancy ' +
    'Level=C1,D2 ' +
    'Description="Touched regains 1d8 HP (Reverse inflicts)"',
  'Cure Serious Wounds':
    'School=Necromancy ' +
    'Level=C4,D4 ' +
    'Description="Touched regains 2d8+1 HP (Reverse inflicts)"',
  'Dancing Lights':
    'School=Alteration ' +
    'Level=I1,M1 ' +
    'Description=' +
      '"R%{lvl*10+40}\' Creates up to 4 movable lights for %{lvl*2} rd"',
  "Darkness":
    'School=Alteration ' +
    'Level=I1 ' +
    'Description=' +
      '"R%{lvl*10+40}\' Suppresses all light in a 15\' radius for 2d4 + %{lvl} rd"',
  "Darkness 15' Radius":
    'School=Alteration ' +
    'Level=M2 ' +
    'Description=' +
      '"R%{lvl*10}\' Suppresses all light in a 15\' radius for %{lvl+10} rd"',
  'Deafness':
    'School=Illusion ' +
    'Level=I2 ' +
    'Description="R60\' Deafens target (Save neg)"',
  'Death Spell':
    'School=Necromancy ' +
    'Level=M6 ' +
    'Description=' +
      '"R%{lvl*10}\' Kills 4d20 points of creatures w/up to 8 HD in a %{lvl*5}\' sq"',
  'Delayed Blast Fireball':
    'School=Evocation ' +
    'Level=M7 ' +
    'Description=' +
      '"R%{lvl*10+100}\' 20\' radius inflicts %{lvl}d6+%{lvl} HP (Save half) after up to 5 rd"',
  'Demi-Shadow Magic':
    'School=Illusion ' +
    'Level=I6 ' +
    'Description=' +
      '"R%{lvl*10+60}\' Mimics <i>Cloudkill</i> (target dies, Save neg), <i>Cone Of Cold</i> (target suffers %{lvl}d4+%{lvl} HP), <i>Fireball</i> (target suffers %{lvl}d6 HP), <i>Lightning Bolt</i> (target suffers %{lvl}d6 HP), <i>Magic Missile</i> (1d4 + 1 missiles inflict %{(lvl+1)//2} HP each, Save suffers %{lvl*2} HP), <i>Wall Of Fire</i> (inflicts 2d6+%{lvl} HP, Save suffers %{lvl}d4 HP), or <i>Wall Of Ice</i>"',
  'Demi-Shadow Monsters':
    'School=Illusion ' +
    'Level=I5 ' +
    'Description=' +
      '"R30\' Creates monsters with %{lvl} HD total and 40% of normal HP (Save monsters have AC 8 and inflict 40% damage) for %{lvl} rd"',
  'Detect Charm':
    'School=Divination ' +
    'Level=C2 ' +
    'Description=' +
      '"Self discerns 10 charmed creatures in a 30\' radius for 1 tn (Reverse shields 1 target)"',
  'Detect Evil':
    'School=Divination ' +
    'Level=C1,M2 ' +
    'Description=' +
      '"Self discerns evil auras (Reverse good) in a 10\'x%{slv==\'C1\'?120:60}\' path for %{lvl*5+(slv==\'C1\'?10:0)} rd"',
  'Detect Illusion':
    'School=Divination ' +
    'Level=I1 ' +
    'Description=' +
      '"Self discerns illusions in a 10\'x%{lvl*10}\' path, and touching reveals them to others, for %{lvl*2+3} rd"',
  'Detect Invisibility':
    'School=Divination ' +
    'Level=I1,M2 ' +
    'Description=' +
      '"Self discerns invisible objects in a 10\'x%{lvl*10}\' path for %{lvl*5} rd"',
  'Detect Lie':
    'School=Divination ' +
    'Level=C4 ' +
    'Description=' +
      '"R30\' Target discerns lies for %{lvl} rd (Reverse makes lies believable)"',
  'Detect Magic':
    'School=Divination ' +
    'Level=C1,D1,I2,M1 ' +
    'Description=' +
      '"Self discerns magical auras in a 10\'x%{slv==\'C1\'?30:slv==\'D1\'?40:60}\' path for %{slv==\'C1\'?\'1 tn\':slv==\'D1\'?\'12 rd\':(lvl*2+\' rd\')}"',
  'Detect Pits And Snares':
    'School=Divination ' +
    'Level=D1 ' +
    'Description=' +
      '"Self discerns outdoor traps or indoor pits in a 10\'x40\' path for %{lvl*4} rd"',
  'Dig':
    'School=Evocation ' +
    'Level=M4 ' +
    'Description="R30\' Excavates 5\' cu/rd for %{lvl} rd"',
  'Dimension Door':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description="Teleports self %{lvl*30}\'"',
  'Disintegrate':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description="R%{lvl*5}\' Obliterates %{lvl*10}\' sq matter (Save neg)"',
  'Dispel Evil':
    'School=Abjuration ' +
    'Level=C5 ' +
    'Description=' +
      '"Returns touched evil (Reverse good) creatures to home plane for %{lvl} rd (Save neg and inflicts -7 attacks on caster)"',
  'Dispel Exhaustion':
    'School=Illusion ' +
    'Level=I4 ' +
    'Description=' +
      '"4 touched temporarily regain 50% HP and dbl movement speed for %{lvl*3} tn"',
  'Dispel Illusion':
    'School=Abjuration ' +
    'Level=I3 ' +
    'Description=' +
      '"R%{lvl*10}\' Dispels one phantasmal illusion (100% chance) or one other illusion (50% chance +5%/-2% per caster level difference)"',
  'Dispel Magic':
    'School=Abjuration ' +
    'Level=C3,D4,M3 ' +
    'Description=' +
      '"R%{slv==\'C3\'?60:slv==\'D4\'?80:120}\' Extinguishes magic in a %{slv==\'D4\'?lvl*40:30}\' %{slv==\'C3\'?\'radius\':\'cu\'} (50% chance each effect +5%/-2% per caster level difference)"',
  'Dispel Magic C3':
    'School=Alteration',
  'Distance Distortion':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description=' +
      '"R%{lvl*10}\' Doubles or halves travel time through a %{lvl*100}\' sq for %{lvl} tn"',
  'Divination':
    'School=Divination ' +
    'Level=C4 ' +
    'Description=' +
      '"Self has a %{lvl+60}% chance to discern info about a known location"',
  'Duo-Dimension':
    'School=Alteration ' +
    'Level=M7 ' +
    'Description=' +
      '"Self becomes 2D, suffering 3x damage from front or back and becoming invisible and immune to attacks from side, for %{lvl+3} rd"',
  'ESP':
    'School=Divination ' +
    'Level=M2 ' +
    'Description=' +
      '"R%{lvl*5<?90}\' Self may hear surface thoughts for %{lvl} rd"',
  'Earthquake':
    'School=Alteration ' +
    'Level=C7 ' +
    'Description=' +
      '"R120\' Creates intense shaking in a %{lvl*5}\' diameter for 1 rd"',
  'Emotion':
    'School=Enchantment ' +
    'Level=I4 ' +
    'Description=' +
      '"R%{lvl*10}\' Targets in a 40\' sq experience fear (flee), hate (+2 save/attack/damage), hopelessness (walk away or surrender), or rage (+1 attack, +3 damage, +5 HP) for conc"',
  'Enchant An Item':
    'School=Conjuration ' +
    'Level=M6 ' +
    'Description="Touched item becomes magical"',
  'Enchanted Weapon':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description=' +
      '"Touched weapon becomes magical (but w/no attack bonuses) for %{lvl*5} rd or until next hit"',
  'Enlarge':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description=' +
      '"R%{lvl*5}\' Expands (Reverse shrinks) target creature %{lvl*20<?200}% or target object %{lvl*10<?100}% (Save neg) for %{lvl} tn"',
  'Entangle':
    'School=Alteration ' +
    'Level=D1 ' +
    'Description=' +
      '"R80\' Plants in a 20\' radius immobilize passers (Save half movement) for 1 tn"',
  'Erase':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description=' +
      '"R30\' Erases magical (%{lvl*2+50}% chance) or normal (%{lvl*4+50}% chance) writing from a 2-page area (Save neg)"',
  'Exorcise':
    'School=Abjuration ' +
    'Level=C4 ' +
    'Description=' +
      '"R10\' Relieves target from supernatural inhabitants and influence"',
  'Explosive Runes':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description=' +
      '"Runes inflict 6d4+6 HP in a 10\' radius when read (Save half for those other than the reader)"',
  'Extension I':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description="Increases duration of an existing level 1-3 spell 50%"',
  'Extension II':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description="Increases duration of an existing level 1-4 spell 50%"',
  'Extension III':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description=' +
      '"Increases duration of an existing level 1-3 spell 100% or level 4-5 spell 50%"',
  'Faerie Fire':
    'School=Alteration ' +
    'Level=D1 ' +
    'Description=' +
      '"R80\' Outlines targets in light, giving foes +2 attack, for %{lvl*4} rd"',
  'False Trap':
    'School=Illusion ' +
    'Level=M2 ' +
    'Description="Makes touched object appear to be trapped (Save disbelieve)"',
  'Fear':
    'School=Illusion ' +
    'Level=I3,M4 ' +
    'Description="Creatures in a 60\' cone flee for %{lvl} rd (Save neg)"',
  'Feather Fall':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description=' +
      '"R%{lvl*10}\' Falling objects in a 10\' cu slow to 2\'/sec for %{lvl*6} secs"',
  'Feeblemind':
    'School=Enchantment ' +
    'Level=D6,M5 ' +
    'Description=' +
      '"R%{slv==\'M5\'?lvl*10:40}\' Reduces target Intelligence to 2 (Save Cleric +1, Druid -1, MU -4, Illusionist -4 neg)"',
  'Feign Death':
    'School=Necromancy ' +
    'Level=C3,D2,M3 ' +
    'Description=' +
      '"Willing touched appears dead, takes half damage, and gains immunity to draining for %{slv==\'C3\'?lvl+10:slv==\'D2\'?lvl*2+4:(lvl+6)} rd"',
  'Find Familiar':
    'School=Conjuration ' +
    'Level=M1 ' +
    'Description="Summons beast (HP 1d3+1, AC 7) to serve self"',
  'Find The Path':
    'School=Divination ' +
    'Level=C6 ' +
    'Description=' +
      '"Touched discerns shortest route into and out of chosen location for %{lvl} tn (Reverse causes indirection)"',
  'Find Traps':
    'School=Divination ' +
    'Level=C2 ' +
    'Description="Self discerns traps in a 10\'x30\' path for 3 tn"',
  'Finger Of Death':
    'School=Enchantment ' +
    'Level=D7 ' +
    'Description="R60\' Target dies (Save neg)"',
  'Fire Charm':
    'School=Enchantment ' +
    'Level=M4 ' +
    'Description=' +
      '"R10\' Fire mesmerizes viewers (Save neg) in a 15\' radius and makes them suggestible (Save -3 neg) for %{lvl*2} rd"',
  'Fire Seeds':
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description=' +
      '"R40\' 4 acorn grenades inflict 2d8 HP in a 5\' radius, or 8 holly berry bombs detonate on command to inflict 1d8 in a 5\' radius (Save half), for %{lvl} tn"',
  'Fire Shield':
    'School=Evocation ' +
    'Level=M4 ' +
    'Description=' +
      '"Self gains +2 save and half damage vs. fire (Reverse cold) and suffers dbl damage vs. cold (Reverse fire) for %{lvl+2} rd"',
  'Fire Storm':
    'School=Evocation ' +
    'Level=D7 ' +
    'Description=' +
      '"R150\' Fire in a %{lvl*20}\' cu inflicts 2d8 HP (Save half) for 1 rd (Reverse extinguishes)"',
  'Fire Trap':
    'School=Evocation ' +
    'Level=D2,M4 ' +
    'Description=' +
      '"Opening touched object inflicts 1d4+%{lvl} HP in a 5\' radius (Save half)"',
  'Fireball':
    'School=Evocation ' +
    'Level=M3 ' +
    'Description=' +
      '"R%{lvl*10+100}\' 20\' radius inflicts %{lvl}d6 HP (Save half)"',
  'Flame Arrow':
    'School=Evocation ' +
    'Level=M3 ' +
    'Description=' +
      '"Touched arrows or bolts inflict +1 HP and disintegrate after 1 rd"',
  'Flame Strike':
    'School=Evocation ' +
    'Level=C5 ' +
    'Description="R60\' 5\' radius inflicts 6d8 HP (Save half)"',
  'Floating Disk':
    'School=Evocation ' +
    'Level=M1 ' +
    'Description="R20\' 3\' diameter x 1\\" thick force disk follows self and holds %{lvl*100} lbs for %{lvl+3} tn"',
  'Fly':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description="Touched may fly 120\'/rd for 1d6 + %{lvl*6} tn"',
  'Fog Cloud':
    'School=Alteration ' +
    'Level=I2 ' +
    'Description="R10\' Creates fog in a 40\'x20\'x20\' area that obscures vision and moves away 10\'/rd for %{lvl+4} rd"',
  "Fool's Gold":
    'School=Alteration ' +
    'Level=M2 ' +
    'Description=' +
     '"R10\' Changes copper and brass to gold for %{lvl} hr (Intelligence Save disbelieve)"',
  'Forceful Hand':
    'School=Evocation ' +
    'Level=M6 ' +
    'Description=' +
      '"R%{lvl*10}\' Creates a giant force hand that absorbs attacks (%{hitPoints} HP) and pushes away for conc up to %{lvl} rd"',
  'Forget':
    'School=Enchantment ' +
    'Level=M2 ' +
    'Description=' +
      '"R30\' 4 targets in a 20\' sq forget the prior %{(lvl+3)//3} rd (Save neg)"',
  'Freezing Sphere':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description=' +
      '"Freezes %{lvl*10}\' sq water for %{lvl} rd, emits a R%{lvl*10}\' cold ray that inflicts %{lvl*4} HP (Save neg), or creates a cold grenade that inflicts 4d6 HP (Save half) in a 10\' radius"',
  'Friends':
    'School=Enchantment ' +
    'Level=M1 ' +
    'Description=' +
      '"R%{lvl*10+10}\' Self gains +2d4 Charisma (Save self suffers -1d4 Charisma) for %{lvl} rd"',
  'Fumble':
    'School=Enchantment ' +
    'Level=M4 ' +
    'Description=' +
      '"R%{lvl*10}\' Target falls and drops anything carried (Save slowed) for %{lvl} rd"',
  'Gate':
    'School=Conjuration ' +
    'Level=C7,M9 ' +
    'Description="R30\' Summons a named extraplanar creature"',
  'Gaze Reflection':
    'School=Alteration ' +
    'Level=I1 ' +
    'Description="Reflects gaze attacks for 1 rd"',
  'Geas':
    'School=Enchantment ' +
    'Level=M6 ' +
    'Description="Touched sickens and dies in 1d4 wk unless quest is pursued"',
  'Glass-steel':
    'School=Alteration ' +
    'Level=M8 ' +
    'Description="Touched %{lvl*10} lb glass gains steel strength"',
  'Glasseye':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description="Touched 3\'x2\' area becomes transparent for %{lvl} rd"',
  'Globe Of Invulnerability':
    'School=Abjuration ' +
    'Level=M6 ' +
    'Description="5\' radius blocks spells of level 1-4 for %{lvl} rd"',
  'Glyph Of Warding':
    'School=Abjuration ' +
    'Level=C3 ' +
    'Description=' +
      '"%{lvl*25}\' sq inflicts %{lvl*2} HP (Save half) when touched"',
  'Grasping Hand':
    'School=Evocation ' +
    'Level=M7 ' +
    'Description=' +
      '"R%{lvl*10}\' Creates a giant force hand that absorbs attacks (%{hitPoints} HP) and restrains for %{lvl} rd"',
  'Guards And Wards':
    'School=Abjuration ' +
    'Level=M6 ' +
    'Description=' +
      '"Creates multiple effects that protect a %{lvl*200}\' sq for %{lvl*2} hr"',
  'Gust Of Wind':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description=' +
      '"Wind in a 10\'x%{lvl*10}\' path extinguishes flames and moves small objects for 6 secs"',
  'Hallucinatory Forest':
    'School=Illusion ' +
    'Level=D4 ' +
    'Description="R80\' Creates an illusionary, %{lvl*40}\' sq forest"',
  'Hallucinatory Terrain':
    'School=Illusion ' +
    'Level=I3,M4 ' +
    'Description=' +
      '"R%{lvl*20+(slv==\'I3\'?20:0)}\' %{lvl*10+(slv==\'I3\'?40:0)}\' sq mimics a different terrain until touched"',
  'Haste':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description=' +
      '"R60\' %{lvl} targets in a 40\' sq gain dbl speed for %{lvl+3} rd"',
  'Heal':
    'School=Necromancy ' +
    'Level=C6 ' +
    'Description=' +
      '"Touched regains all but 1d4 HP and recovers from blindness, disease, and feeblemind (Reverse causes disease and drains all but 1d4 HP)"',
  'Heat Metal':
    'School=Necromancy ' +
    'Level=D2 ' +
    'Description=' +
      '"R40\' Metal on %{lvl} creatures inflicts 0/1d4/2d4/2d4/2d4/1d4/0 HP for 7 rd (Reverse chills, inflicting half)"',
  'Hold Animal':
    'School=Enchantment ' +
    'Level=D3 ' +
    'Description="R80\' Immobilizes 4 animals for %{lvl*2} rd (Save neg)"',
  'Hold Monster':
    'School=Enchantment ' +
    'Level=M5 ' +
    'Description=' +
      '"R%{lvl*5}\' Immobilizes 4 creatures for %{lvl} rd (Save neg)"',
  'Hold Person':
    'School=Enchantment ' +
    'Level=C2,M3 ' +
    'Description=' +
      '"R%{slv==\'C2\'?60:120}\' Immobilizes 1-%{slv==\'C2\'?3:4} medium targets for %{slv==\'C2\'?lvl+4:(lvl*2)} rd (Save neg)"',
  'Hold Plant':
    'School=Enchantment ' +
    'Level=D4 ' +
    'Description=' +
      '"R80\' Immobilizes plants in 16 sq yd for %{lvl} rd (Save neg)"',
  'Hold Portal':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description=' +
      '"R%{lvl*20}\' Holds shut target door, gate, or window for %{lvl} rd"',
  'Holy Word':
    'School=Conjuration ' +
    'Level=C7 ' +
    'Description=' +
      '"30\' radius banishes evil extraplanar creatures and kills (fewer than 4 HD), paralyzes 1d4x10 rd (4-7 HD), stuns 2d4 rd (8-11 HD), or deafens 1d4 rd (greater than 11 HD) non-good creatures (Reverse good creatures)"',
  'Hypnotic Pattern':
    'School=Illusion ' +
    'Level=I2 ' +
    'Description=' +
      '"Transfixes 25 HD of viewers in a 30\' sq for conc (Save neg)"',
  'Hypnotism':
    'School=Enchantment ' +
    'Level=I1 ' +
    'Description="R30\' 1d6 targets follow self suggestions for %{lvl+1} rd"',
  'Ice Storm':
    'School=Evocation ' +
    'Level=M4 ' +
    'Description=' +
      '"R%{lvl*10}\' Hail in a 40\' sq inflicts 3d10 HP, or sleet in a 80\' sq blinds, slows, and causes falls, for 1 rd"',
  'Identify':
    'School=Divination ' +
    'Level=M1 ' +
    'Description=' +
      '"Self may determine any magical properties of touched w/in %{lvl} hr of discovery (%{lvl*5+15}% chance) (Save neg or mislead); requires rest afterward"',
  'Illusory Script':
    'School=Illusion ' +
    'Level=I3 ' +
    'Description=' +
      '"Obscured writing inflicts 5d4 rd confusion (Save neg) on unauthorized readers"',
  'Imprisonment':
    'School=Abjuration ' +
    'Level=M9 ' +
    'Description=' +
      '"Touched creature safely trapped underground permanently (Reverse frees)"',
  'Improved Invisibility':
    'School=Illusion ' +
    'Level=I4 ' +
    'Description="Touched becomes invisible for %{lvl+4} rd"',
  'Improved Phantasmal Force':
    'School=Illusion ' +
    'Level=I2 ' +
    'Description=' +
      '"R%{lvl*10+60}\' Creates a %{lvl*10+40}\' sq sight and sound illusion for conc + 2 rd"',
  'Incendiary Cloud':
    'School=Evocation ' +
    'Level=M8 ' +
    'Description=' +
      '"R30\' 20\' radius smoke cloud lasts for 1d6 + 4 rd, inflicting %{lvl//2}/%{lvl}/%{lvl//2} HP on rd 3/4/5 (Save half)"',
  'Infravision':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description="Touched sees 60\' in darkness for %{lvl+2} hr"',
  'Insect Plague':
    'School=Conjuration ' +
    'Level=C5,D5 ' +
    'Description=' +
      '"R%{slv==\'D5\'?320:360}\' Stinging insects fill a %{slv==\'D5\'?160:180}\' radius, inflicting 1 HP/rd for %{lvl} tn; creatures w/fewer than 2 HD flee, 3-4 HD check morale"',
  'Instant Summons':
    'School=Conjuration ' +
    'Level=M7 ' +
    'Description="Prepared object appears in self hand"',
  'Interposing Hand':
    'School=Evocation ' +
    'Level=M5 ' +
    'Description=' +
      '"R%{lvl*10}\' Creates a giant force hand that absorbs attacks (%{hitPoints} HP) and blocks passage for %{lvl} rd"',
  'Invisibility':
    'School=Illusion ' +
    'Level=I2,M2 ' +
    'Description="Touched becomes invisible; attacking ends"',
  "Invisibility 10' Radius":
    'School=Illusion ' +
    'Level=I3,M3 ' +
    'Description=' +
      '"Creatures in a 10\' radius around touched become invisible; attacking or moving out of radius ends for each"',
  'Invisibility To Animals':
    'School=Alteration ' +
    'Level=D1 ' +
    'Description="Touched becomes invisible to animals for %{lvl+10} rd"',
  'Invisible Stalker':
    'School=Conjuration ' +
    'Level=M6 ' +
    'Description="R10\' Conjures an 8 HD invisible creature to perform a task"',
  'Irresistible Dance':
    'School=Enchantment ' +
    'Level=M8 ' +
    'Description="Touched suffers -4 AC and fails all saves for 1d4 + 1 rd"',
  'Jump':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description=' +
      '"Touched may jump 30\' forward, 10\' back, or 10\' up %{(lvl+2)//3} times"',
  'Knock':
    'School=Alteration ' +
    'Level=M2 ' +
    'Description=' +
      '"R60\' Opens stuck, barred, locked, or magically held door, chest, or shackle"',
  'Know Alignment':
    'School=Divination ' +
    'Level=C2 ' +
    'Description=' +
      '"Self discerns alignment auras of 10 touched for 1 tn (Reverse obscures)"',
  'Legend Lore':
    'School=Divination ' +
    'Level=M6 ' +
    'Description="Self gains info about a specified object, person, or place"',
  'Levitate':
    'School=Alteration ' +
    'Level=M2 ' +
    'Description=' +
      '"R%{lvl*20}\' Self may move %{lvl*100} lb target up and down 10\'/rd, or self 20\'/rd, for %{lvl} tn (Save neg)"',
  'Light':
    'School=Alteration ' +
    'Level=C1,I1,M1 ' +
    'Description=' +
      '"R%{slv==\'C1\'?120:60}\' Target spot emits a 20\' radius light for %{lvl+(slv==\'C1\'?6:0)} tn (Reverse darkness half duration)"',
  'Lightning Bolt':
    'School=Evocation ' +
    'Level=M3 ' +
    'Description=' +
      '"R%{lvl*10+40}\' 10\'x40\' or 5\'x80\' bolt inflicts %{lvl}d6 HP (Save half)"',
  'Limited Wish':
    'School=Conjuration ' +
    'Level=M7 ' +
    'Description="Alters reality within limits"',
  'Locate Animals':
    'School=Divination ' +
    'Level=D1 ' +
    'Description=' +
      '"Self discerns animals in a 20\'x%{lvl*20}\' path for %{lvl} rd"',
  'Locate Object':
    'School=Divination ' +
    'Level=C3,M2 ' +
    'Description=' +
      '"R%{slv==\'C3\'?lvl*10+60:(lvl*20)}\' Self discerns location of desired object for %{lvl} rd (Reverse obscures)"',
  'Locate Plants':
    'School=Divination ' +
    'Level=D2 ' +
    'Description="Self discerns plants in a %{lvl*5}\' radius for %{lvl} tn"',
  'Lower Water':
    'School=Alteration ' +
    'Level=C4,M6 ' +
    'Description=' +
      '"R%{slv==\'C4\'?120:80}\' %{lvl*(slv==\'C4\'?10:5)}\' sq fluid subsides by %{lvl*5}% for %{slv==\'C4\'?lvl+\' tn\':(lvl*5+\' rd\')} (Reverse raises)"',
  "Mage's Faithful Hound":
    'School=Conjuration ' +
    'Level=M5 ' +
    'Description=' +
      '"R10\' Create an invisible dog that howls at intruders in a 30\' radius and attacks (10 HD, inflicts 3d6 HP) for %{lvl*2} rd"',
  "Mage's Sword":
    'School=Evocation ' +
    'Level=M7 ' +
    'Description=' +
      '"R30\' Creates a magic sword that self may use remotely as a Fighter %{lvl//2} (19-20 always hits, inflicts 5d4 HP) for %{lvl} rd"',
  'Magic Aura':
    'School=Illusion ' +
    'Level=M1 ' +
    'Description=' +
      '"Touched item responds to <i>Detect Magic</i> for %{lvl} dy (Save disbelieve)"',
  'Magic Jar':
    'School=Possession ' +
    'Level=M5 ' +
    'Description=' +
      '"R%{lvl*10}\' Self traps target\'s soul and possesses target\'s body (Save neg)"',
  'Magic Missile':
    'School=Evocation ' +
    'Level=M1 ' +
    'Description=' +
      '"R%{lvl*10+60}\' %{(lvl+1)//2} energy darts inflict 1d4+1 HP each in a 10\' sq"',
  'Magic Mouth':
    'School=Alteration ' +
    'Level=I2,M2 ' +
    'Description=' +
      '"Touched object responds to a specified trigger by reciting up to 25 words"',
  'Major Creation':
    'School=Alteration ' +
    'Level=I5 ' +
    'Description=' +
      '"R10\' Creates a %{lvl}\' cu object from component plant or mineral material for %{lvl} hr"',
  'Mass Charm':
    'School=Enchantment ' +
    'Level=M8 ' +
    'Description=' +
      '"R%{lvl*5}\' %{lvl*2} HD of creatures in a 30\' sq treat self as a trusted friend (Save neg)"',
  'Mass Invisibility':
    'School=Illusion ' +
    'Level=M7 ' +
    'Description=' +
      '"R%{lvl*10}\' All in a 30\' radius become invisible; attacking ends for each"',
  'Mass Suggestion':
    'School=Enchantment ' +
    'Level=I6 ' +
    'Description=' +
      '"R%{lvl*10}\' %{lvl} targets follow reasonable suggestions for %{lvl*4+4} tn"',
  'Massmorph':
    'School=Illusion ' +
    'Level=I4,M4 ' +
    'Description="R%{lvl*10}\' 10 willing creatures look like trees"',
  'Maze':
    'School=Conjuration ' +
    'Level=I5,M8 ' +
    'Description=' +
      '"R%{lvl*5}\' Target becomes lost in an extradimensional maze for d4 rd - 2d4 tn, depending on Intelligence"',
  'Mending':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="R30\' Repairs minor damage to target object"',
  'Message':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description=' +
      '"R%{lvl*10+60}\' Self may hold a whispered dialogue w/target for %{(lvl+5)*6} secs"',
  'Meteor Swarm':
    'School=Evocation ' +
    'Level=M9 ' +
    'Description=' +
      '"R%{lvl*10+40}\' 4 large meteors inflict 10d4 HP in a 15\' radius on contact, or 8 small meteors inflict 5d4 HP in a 7.5\' radius (collateral Save half)"',
  'Mind Blank':
    'School=Abjuration ' +
    'Level=M8 ' +
    'Description="R30\' Target gains immunity to divination for 1 dy"',
  'Minor Creation':
    'School=Alteration ' +
    'Level=I4 ' +
    'Description=' +
      '"Creates a %{lvl}\' cu object from component plant material for %{lvl} hr"',
  'Minor Globe Of Invulnerability':
    'School=Abjuration ' +
    'Level=M4 ' +
    'Description="5\' radius blocks spells level 1-3 for %{lvl} rd"',
  'Mirror Image':
    'School=Illusion ' +
    'Level=I2,M2 ' +
    'Description=' +
      '"1d4%{slv==\'I2\'?\' + 1\':\'\'} copies of self misdirect attacks on self for %{lvl*(slv==\'M2\'?2:3)} rd"',
  'Misdirection':
    'School=Illusion ' +
    'Level=I2 ' +
    'Description=' +
      '"R30\' Divination spells cast on target return false info for %{lvl} rd"',
  'Mnemonic Enhancer':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description=' +
      '"Self may memorize +3 spell levels or retain just-cast spell up to 3rd level for 1 dy"',
  'Monster Summoning I':
    'School=Conjuration ' +
    'Level=M3 ' +
    'Description=' +
      '"R30\' 2d4 1 HD creatures appear and assist self for %{lvl+2} rd"',
  'Monster Summoning II':
    'School=Conjuration ' +
    'Level=M4 ' +
    'Description=' +
      '"R40\' 1d6 2 HD creatures appear and assist self for %{lvl+3} rd"',
  'Monster Summoning III':
    'School=Conjuration ' +
    'Level=M5 ' +
    'Description=' +
      '"R50\' 1d4 3 HD creatures appear and assist self for %{lvl+4} rd"',
  'Monster Summoning IV':
    'School=Conjuration ' +
    'Level=M6 ' +
    'Description=' +
      '"R60\' 1d4 4 HD creatures appear and assist self for %{lvl+5} rd"',
  'Monster Summoning V':
    'School=Conjuration ' +
    'Level=M7 ' +
    'Description=' +
      '"R70\' 1d2 5 HD creatures appear and assist self for %{lvl+6} rd"',
  'Monster Summoning VI':
    'School=Conjuration ' +
    'Level=M8 ' +
    'Description=' +
      '"R80\' 1d2 6 HD creatures appear and assist self for %{lvl+7} rd"',
  'Monster Summoning VII':
    'School=Conjuration ' +
    'Level=M9 ' +
    'Description=' +
      '"R90\' 1d2 7 HD creatures appear and assist self for %{lvl+8} rd"',
  'Move Earth':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description="R%{lvl*10}\' Excavates 40\' cu/tn for conc"',
  'Neutralize Poison':
    'School=Alteration ' +
    'Level=C4,D3 ' +
    'Description="Detoxifies touched (Reverse lethally poisons; Save neg)"',
  'Non-Detection':
    'School=Abjuration ' +
    'Level=I3 ' +
    'Description="Self becomes immune to divination for %{lvl} tn"',
  'Obscurement':
    'School=Alteration ' +
    'Level=D2 ' +
    'Description=' +
      '"Creates a mist that limits vision in %{lvl*10}\' cu for %{lvl*4} rd"',
  'Paralysation':
    'School=Illusion ' +
    'Level=I3 ' +
    'Description=' +
      '"R%{lvl*10}\' Immobilizes %{lvl*2} HD of creatures in a 20\' sq"',
  'Part Water':
    'School=Alteration ' +
    'Level=C6,M6 ' +
    'Description=' +
      '"R%{lvl*(slv==\'C6\'?20:10)}\' Forms a 20\'x%{lvl*30}\'x3\' water trench for %{slv==\'C6\'?lvl+\' tn\':(lvl*5+\' rd\')}"',
  'Pass Plant':
    'School=Alteration ' +
    'Level=D5 ' +
    'Description=' +
      '"Self may teleport up to 600 yd between trees of the same species"',
  'Pass Without Trace':
    'School=Enchantment ' +
    'Level=D1 ' +
    'Description="Touched leaves no tracks or scent for %{lvl} tn"',
  'Passwall':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description=' +
      '"R30\' Creates a 5\'x10\'x10\' passage through dirt and rock for %{lvl+6} tn"',
  'Permanency':
    'School=Alteration ' +
    'Level=M8 ' +
    'Description=' +
      '"Makes certain spells permanent and inflicts -1 Constitution on self"',
  'Permanent Illusion':
    'School=Illusion ' +
    'Level=I6 ' +
    'Description=' +
      '"R30\' Creates a %{lvl*10+40}\' sq sight, sound, smell, and temperature illusion"',
  'Phantasmal Force':
    'School=Illusion ' +
    'Level=I1,M3 ' +
    'Description=' +
      '"R%{lvl*10+(slv==\'M3\'?80:60)}\' Creates a %{lvl*10+(slv==\'M3\'?80:40)}\' sq illusion for conc or until struck (Save disbelieve)"',
  'Phantasmal Killer':
    'School=Illusion ' +
    'Level=I4 ' +
    'Description=' +
      '"R%{lvl*5}\' Nightmare illusion attacks target as a HD 4 creature, killing on a hit, for %{lvl} rd (Intelligence Save neg)"',
  'Phase Door':
    'School=Alteration ' +
    'Level=M7 ' +
    'Description="Self may pass twice through touched 10\' solid"',
  'Plane Shift':
    'School=Alteration ' +
    'Level=C5 ' +
    'Description="Self plus 7 touched travel to another plane (Save neg)"',
  'Plant Door':
    'School=Alteration ' +
    'Level=D4 ' +
    'Description="Self may move effortlessly through vegetation for %{lvl} tn"',
  'Plant Growth':
    'School=Alteration ' +
    'Level=D3,M4 ' +
    'Description=' +
      '"R%{slv==\'M4\'?lvl*10:160}\' Vegetation in a %{lvl*(slv==\'D3\'?20:10)}\' sq becomes thick and entangled"',
  'Polymorph Object':
    'School=Alteration ' +
    'Level=M8 ' +
    'Description=' +
      '"R%{lvl*5}\' Target object or creature becomes something else (Save -4 neg)"',
  'Polymorph Other':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description=' +
      '"R%{lvl*5}\' Target creature transforms into named creature (Save neg) and dies (system shock neg); must succeed on an Intelligence * 5% test each dy to retain mind"',
  'Polymorph Self':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description=' +
      '"Self may transform into a different creature up to 2000 lb 2/min for %{lvl*2} tn"',
  'Power Word Blind':
    'School=Conjuration ' +
    'Level=M8 ' +
    'Description=' +
      '"R%{lvl*5}\' Blinds creatures in a 15\' radius for 1d4 + 1 rd or 1d4 + 1 tn"',
  'Power Word Kill':
    'School=Conjuration ' +
    'Level=M9 ' +
    'Description=' +
      '"R%{lvl*10//4}\' Slays 1 60 HP target or 12 10 HP targets in a 10\' radius"',
  'Power Word Stun':
    'School=Conjuration ' +
    'Level=M7 ' +
    'Description="R%{lvl*5}\' Stuns target for up to 4d4 rd"',
  'Prayer':
    'School=Conjuration ' +
    'Level=C3 ' +
    'Description=' +
      '"R60\' Gives allies +1 attack, damage, and saves, and inflicts -1 on foes, for %{lvl} rd"',
  'Predict Weather':
    'School=Divination ' +
    'Level=D1 ' +
    'Description=' +
      '"Forecasts weather in a 9 sq mile radius for the next %{lvl*2} hr"',
  'Prismatic Sphere':
    'School=Conjuration ' +
    'Level=M9 ' +
    'Description=' +
      '"10\' sphere blocks passage, harms attackers, and blinds for 2d4 rd viewers w/up to 7 HD w/in 20\', for %{lvl} tn"',
  'Prismatic Spray':
    'School=Abjuration ' +
    'Level=I7 ' +
    'Description=' +
      '"Targets in a 70\'x15\'x5\' area suffer one of 20, 40, or 80 HP (Save half), fatal poison, turning to stone, insanity, or planar teleport (Save neg)"',
  'Prismatic Wall':
    'School=Abjuration ' +
    'Level=I7 ' +
    'Description=' +
      '"R10\' %{lvl*40}\'x%{lvl*20}\' wall blocks passage, harms attackers, and blinds for 2d4 rd viewers w/up to 7 HD w/in 20\', for %{lvl} tn"',
  'Produce Fire':
    'School=Alteration ' +
    'Level=D4 ' +
    'Description="R40\' Creates fire in a 60\' radius that inflicts 1d4 HP for 1 rd (Reverse extinguishes)"',
  'Produce Flame':
    'School=Alteration ' +
    'Level=D2 ' +
    'Description="R40\' Creates a flame that ignites combustables and may be thrown to burn a 15\' radius for %{lvl*2} rd"',
  'Programmed Illusion':
    'School=Illusion ' +
    'Level=I6 ' +
    'Description=' +
      '"R%{lvl*10}\' Target shows a %{lvl*10+40}\' sq scene for %{lvl} rd when triggered"',
  'Project Image':
    'School=Illusion ' +
    'Level=I5,M6 ' +
    'Description=' +
      '"R%{lvl*(slv==\'I5\'?5:10)}\' Self may cast through an illusory double for %{lvl} rd"',
  'Protection From Evil':
    'School=Abjuration ' +
    'Level=C1,M1 ' +
    'Description=' +
      '"Touched becomes untouchable by summoned and conjured creatures and gains +2 saves vs. evil, and evil foes suffer -2 attacks, for %{lvl*(slv==\'C1\'?3:2)} rd (Reverse good)"',
  "Protection From Evil 10' Radius":
    'School=Abjuration ' +
    'Level=C4,M3 ' +
    'Description=' +
      '"Creatures in a 10\' radius of touched become untouchable by evil outsiders and gain +2 saves vs. evil, and evil foes suffer -2 attacks, for %{slv==\'C4\'?lvl+\' tn\':(lvl*2+\' rd\')} (Reverse good)"',
  'Protection From Fire':
    'School=Abjuration ' +
    'Level=D3 ' +
    'Description=' +
      '"Touched gains immunity to normal fire and +4 saves and half damage from magical fire (immunity to magical fire if cast on self) for %{lvl*12} HP"',
  'Protection From Lightning':
    'School=Abjuration ' +
    'Level=D4 ' +
    'Description=' +
      '"Touched gains immunity to normal lightning and +4 saves and half damage from magical lightning (immunity to magical lightning if cast on self) for %{lvl*12} HP"',
  'Protection From Normal Missiles':
    'School=Abjuration ' +
    'Level=M3 ' +
    'Description=' +
      '"Touched becomes invulnerable to arrows and bolts for %{lvl} tn"',
  'Purify Food And Drink':
    'School=Alteration ' +
    'Level=C1 ' +
    'Description=' +
      '"R30\' Decontaminates (Reverse contaminates) consumables in %{lvl}\' cu"',
  'Purify Water':
    'School=Alteration ' +
    'Level=D1 ' +
    'Description=' +
      '"R40\' Decontaminates (Reverse contaminates) %{lvl}\' cu water"',
  'Push':
    'School=Conjuration ' +
    'Level=M1 ' +
    'Description=' +
      '"R%{lvl*3+10}\' Target %{lvl} lb object moves away from self 10\'"',
  'Pyrotechnics':
    'School=Alteration ' +
    'Level=D3,M2 ' +
    'Description=' +
      '"R%{slv==\'D3\'?160:120}\' Target fire emits fireworks (inflicts blindness for 1d4 + 1 rd in a 120\' radius) or obscuring smoke"',
  'Quest':
    'School=Enchantment ' +
    'Level=C5 ' +
    'Description=' +
      '"R60\' Target suffers -1 saves each dy until quest is pursued (Save neg)"',
  'Raise Dead':
    'School=Necromancy ' +
    'Level=C5 ' +
    'Description=' +
      '"R30\' Restores life to a corpse dead up to %{lvl} dy or destroys corporeal undead (Save 2d8+1 HP) (Reverse slays)"',
  'Ray Of Enfeeblement':
    'School=Enchantment ' +
    'Level=M2 ' +
    'Description=' +
      '"R%{lvl*3+10}\' Target suffers -%{lvl*2+19}% Strength for %{lvl} rd (Save neg)"',
  'Read Magic':
    'School=Divination ' +
    'Level=M1 ' +
    'Description=' +
      '"Self understands magical writing for %{lvl*2} rd (Reverse obscures)"',
  'Regenerate':
    'School=Necromancy ' +
    'Level=C7 ' +
    'Description=' +
      '"Touched reattaches or regrows appendages in 2d4 tn (Reverse withers)"',
  'Reincarnate':
    'School=Necromancy ' +
    'Level=D7 ' +
    'Description="Soul dead up to 7 dy inhabits a new body"',
  'Reincarnation':
    'School=Necromancy ' +
    'Level=M6 ' +
    'Description="Soul dead up to %{lvl} dy inhabits new body"',
  'Remove Curse':
    'School=Abjuration ' +
    'Level=C3,M4 ' +
    'Description=' +
      '"Touched recovers from all curses (Reverse curses for %{lvl} tn)"',
  'Remove Fear':
    'School=Abjuration ' +
    'Level=C1 ' +
    'Description=' +
      '"Touched gains +4 vs. fear for 1 tn or a new +%{lvl} save if already fearful (Reverse cause fear)"',
  'Repel Insects':
    'School=Abjuration ' +
    'Level=D4 ' +
    'Description=' +
      '"10\' radius expels normal insects and wards against giant ones (Save inflicts 1d6 HP) for %{lvl} tn"',
  'Repulsion':
    'School=Abjuration ' +
    'Level=M6 ' +
    'Description=' +
      '"Creatures in a 10\'x%{lvl*10}\' path move away for %{lvl//2} rd"',
  'Resist Cold':
    'School=Alteration ' +
    'Level=C1 ' +
    'Description=' +
      '"Touched feels comfortable to 0F, gains +3 saves vs. magical cold, and suffers 1/4 or 1/2 damage from magical cold for %{lvl} tn"',
  'Resist Fire':
    'School=Alteration ' +
    'Level=C2 ' +
    'Description=' +
      '"Touched feels comfortable to 212F, gains +3 saves vs. magical fire, and suffers 1/4 or 1/2 damage from magical fire for %{lvl} tn"',
  'Restoration':
    'School=Necromancy ' +
    'Level=C7 ' +
    'Description=' +
      '"Touched regains levels and abilities lost in prior %{lvl} dy (Reverse drains)"',
  'Resurrection':
    'School=Necromancy ' +
    'Level=C7 ' +
    'Description=' +
      '"Restores life to a corpse dead up to %{lvl*10} yr (Reverse slays and disintegrates)"',
  'Reverse Gravity':
    'School=Alteration ' +
    'Level=M7 ' +
    'Description="R%{lvl*5}\' Items in a 30\' sq area fall up for 1 sec"',
  'Rope Trick':
    'School=Alteration ' +
    'Level=I3,M2 ' +
    'Description=' +
      '"Touched rope leads to an interdimensional space that holds 6 creatures for %{lvl*2} tn"',
  'Sanctuary':
    'School=Abjuration ' +
    'Level=C1 ' +
    'Description="Foes cannot attack self for %{lvl+2} rd (Save neg)"',
  'Scare':
    'School=Enchantment ' +
    'Level=M2 ' +
    'Description=' +
      '"R10\' Target w/up to 5 HD becomes frozen w/terror (Save neg) for 3d4 rd"',
  'Secret Chest':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description="Self can summon a 12\' cu aethereal chest at will for 60 dy"',
  'Shades':
    'School=Illusion ' +
    'Level=I6 ' +
    'Description="R30\' Creates monsters with %{lvl} HD total and 60% of normal HP (Save monsters have AC 6 and inflict 60% damage) for %{lvl} rd"',
  'Shadow Door':
    'School=Illusion ' +
    'Level=I5 ' +
    'Description=' +
      '"R10\' Creates an illusionary door that makes self invisible for %{lvl} rd"',
  'Shadow Magic':
    'School=Illusion ' +
    'Level=I5 ' +
    'Description=' +
      '"R%{lvl*10+50}\' Mimics <i>Cone Of Cold</i> (inflicts %{lvl}d4+%{lvl} HP), <i>Fireball</i> (inflicts %{lvl}d6 HP), <i>Lightning Bolt</i> (inflicts %{lvl}d6 HP), or <i>Magic Missile</i> (1d4 + 1 missiles inflict %{(lvl+1)//2} HP each) (Save %{lvl} HP)"',
  'Shadow Monsters':
    'School=Illusion ' +
    'Level=I4 ' +
    'Description=' +
      '"R30\' Creates monsters with %{lvl} HD total and 20% of normal HP (Save monsters have AC 10 and inflict 20% damage) for %{lvl} rd"',
  'Shape Change':
    'School=Alteration ' +
    'Level=M9 ' +
    'Description="Self may polymorph freely for %{lvl} tn"',
  'Shatter':
    'School=Alteration ' +
    'Level=M2 ' +
    'Description=' +
      '"R60\' Target %{lvl*10} lb object made of brittle material shatters (Save neg)"',
  'Shield':
    'School=Evocation ' +
    'Level=M1 ' +
    'Description=' +
      '"Self gains frontal AC 2 vs. thrown, AC 3 vs. arrows and bolts, AC 4 vs. melee attacks, and +1 saves for %{lvl*5} rd"',
  'Shillelagh':
    'School=Alteration ' +
    'Level=D1 ' +
    'Description=' +
      '"Touched club gains +1 attack and inflicts 2d4 HP for %{lvl} rd"',
  'Shocking Grasp':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="Touched suffers 1d8+%{lvl} HP"',
  "Silence 15' Radius":
    'School=Alteration ' +
    'Level=C2 ' +
    'Description="R120\' Bars sound in a 15\' radius for %{lvl*2} rd"',
  'Simulacrum':
    'School=Illusion ' +
    'Level=M7 ' +
    'Description="Self controls a half-strength copy of another creature"',
  'Sleep':
    'School=Enchantment ' +
    'Level=M1 ' +
    'Description=' +
      '"R%{lvl*10+30}\' Creatures up to 4+4 HD in a 15\' radius sleep for %{lvl*5} rd"',
  'Slow':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description=' +
      '"R%{lvl*10+90}\' %{lvl} targets in a 40\' sq move at half speed for %{lvl+3} rd"',
  'Slow Poison':
    'School=Necromancy ' +
    'Level=C2 ' +
    'Description=' +
      '"Reduces poison damage in touched to 1 HP/tn and prevents death from poison for %{lvl*2} rd"',
  'Snake Charm':
    'School=Enchantment ' +
    'Level=C2 ' +
    'Description=' +
      '"R30\' Charms angry snakes up to %{hitPoints} HP for 1d4 + 4 rd"',
  'Snare':
    'School=Enchantment ' +
    'Level=D3 ' +
    'Description="Touched snare becomes 90% undetectable until triggered"',
  'Speak With Animals':
    'School=Alteration ' +
    'Level=C2,D1 ' +
    'Description=' +
      '"R%{slv==\'D1\'?40:30}\' Self may converse w/chosen type of animal for %{lvl*2} rd"',
  'Speak With Dead':
    'School=Necromancy ' +
    'Level=C3 ' +
    'Description=' +
      '"R10\' Self may ask a corpse %{lvl<7?2:lvl<9?3:lvl<13?4:lvl<16?5:lvl<21?6:7} questions"',
  'Speak With Monsters':
    'School=Alteration ' +
    'Level=C6 ' +
    'Description=' +
      '"R30\' Self may converse w/intelligent creatures for %{lvl} rd"',
  'Speak With Plants':
    'School=Alteration ' +
    'Level=C4,D4 ' +
    'Description=' +
      '"R%{slv==\'D4\'?40:30}\' Self may converse w/plants for %{lvl*(slv==\'D4\'?2:1)} rd"',
  'Spectral Force':
    'School=Illusion ' +
    'Level=I3 ' +
    'Description=' +
      '"R%{lvl*10+60}\' Creates a %{lvl*10+40}\' sq sight, sound, smell, and temperature illusion for conc + 3 rd"',
  'Spell Immunity':
    'School=Abjuration ' +
    'Level=M8 ' +
    'Description=' +
      '"%{lvl//4} touched divide %{lvl} tn of +8 saves vs. mind spells"',
  'Spider Climb':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description=' +
      '"Touched may move 30\'/rd on walls and ceilings for %{lvl+1} rd"',
  'Spirit-Rack':
    'School=Abjuration ' +
    'Level=M6 ' +
    'Description=' +
      '"R%{lvl+10}\' Painfully banishes a named extraplanar creature for %{lvl} yr"',
  'Spiritual Weapon':
    'School=Evocation ' +
    'Level=C2 ' +
    'Description=' +
      '"R30\' Self may attack w/a magical force for conc up to %{lvl} rd"',
  'Statue':
    'School=Alteration ' +
    'Level=M7 ' +
    'Description="Touched may become stone at will for %{lvl} hr"',
  'Sticks To Snakes':
    'School=Alteration ' +
    'Level=C4,D5 ' +
    'Description=' +
      '"R%{slv==\'D5\'?40:30}\' Turns %{lvl} sticks in a %{slv==\'D5\'?\\"5\' radius\\":\\"10\' cu\\"} to snakes (%{lvl*5}% venomous) (Reverse turns snakes to sticks) for %{lvl*2} rd"',
  'Stinking Cloud':
    'School=Evocation ' +
    'Level=M2 ' +
    'Description=' +
      '"R30\' Creatures in a 20\' radius retch for 1d4 + 1 rd (Save neg) for %{lvl} rd"',
  'Stone Shape':
    'School=Alteration ' +
    'Level=D3,M5 ' +
    'Description="Reshapes %{lvl+(slv==\'D3\'?3:0)}\' cu of stone"',
  'Stone Tell':
    'School=Divination ' +
    'Level=C6 ' +
    'Description="Self may converse w/3\' cu rock for 1 tn"',
  'Stone To Flesh':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description=' +
      '"R%{lvl*10}\' Restores stoned creature (system shock required) or converts %{lvl*9}\' cu stone to flesh (Reverse flesh becomes stone (Save neg))"',
  'Strength':
    'School=Alteration ' +
    'Level=M2 ' +
    'Description=' +
      '"Touched gains +1d6 Strength (warriors an additional +1) for %{lvl} hr"',
  'Suggestion':
    'School=Enchantment ' +
    'Level=I3,M3 ' +
    'Description=' +
      '"R30\' Target follows reasonable suggestions for %{slv==\'I3\'?lvl*4+4+\' tn\':(lvl+1+\' hr\')} (Save neg)"',
  'Summon Insects':
    'School=Conjuration ' +
    'Level=D3 ' +
    'Description=' +
      '"R30\' Covers target w/insects, inflicting 2 HP/rd, for %{lvl} rd"',
  'Summon Shadow':
    'School=Conjuration ' +
    'Level=I5 ' +
    'Description="R10\' %{lvl} obedient shadows appear for %{lvl+1} rd"',
  'Symbol':
    'School=Conjuration ' +
    'Level=C7,M8 ' +
    'Description=' +
      '"Glowing symbol causes death, discord 5d4 rd, fear (Save -4 neg), hopelessness 3d4 tn, insanity, pain 2d10 tn, sleep 4d4 + 1 tn, or stunning 3d4 rd"',
  'Symbol C7':
    'Description=' +
      '"Glowing symbol causes hopelessness, pain, or persuasion for %{lvl} tn"',
  'Telekinesis':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description="R%{lvl*10}\' Moves %{lvl*25} lb object for %{lvl+2} rd"',
  'Teleport':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description=' +
      '"Transports self and %{(lvl-10>?0)*15+250} lb carried weight to a familiar location"',
  'Temporal Stasis':
    'School=Alteration ' +
    'Level=M9 ' +
    'Description=' +
      '"R10\' Places target into permanent suspended animation (Reverse awakens)"',
  'Time Stop':
    'School=Alteration ' +
    'Level=M9 ' +
    'Description=' +
      '"Self may perform extra actions in a 15\' radius for 1d8 + %{lvl//2} segs"',
  'Tiny Hut':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description="5\' radius shields from view and elements for %{lvl} hr"',
  'Tongues':
    'School=Alteration ' +
    'Level=C4,M3 ' +
    'Description=' +
      '"R30\' Self may converse in any language (Reverse muddles) for %{slv==\'C4\'?\'1 tn\':(lvl+\' rd\')}"',
  'Transformation':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description=' +
      '"Self becomes a warrior (dbl HP, AC +4, 2/rd dagger +2 damage) for %{lvl} rd"',
  'Transmute Metal To Wood':
    'School=Alteration ' +
    'Level=D7 ' +
    'Description="R80\' %{lvl*8} lb metal object becomes wood"',
  'Transmute Rock To Mud':
    'School=Alteration ' +
    'Level=D5,M5 ' +
    'Description=' +
      '"R%{slv==\'M5\'?lvl*10:160}\' %{lvl*20}\' cu rock becomes mud (Reverse mud becomes rock)"',
  'Transport Via Plants':
    'School=Alteration ' +
    'Level=D6 ' +
    'Description=' +
      '"Self may teleport any distance between plants of the same species"',
  'Trap The Soul':
    'School=Conjuration ' +
    'Level=M8 ' +
    'Description="R10\' Traps target soul in a gem (Save neg)"',
  'Tree':
    'School=Alteration ' +
    'Level=D3 ' +
    'Description="Self polymorphs into a tree for %{lvl+6} tn"',
  'Trip':
    'School=Enchantment ' +
    'Level=D2 ' +
    'Description=' +
      '"Touched trips passers, inflicting 1d6 HP and stunning, for 1d4 + 1 rd (Save neg) for %{lvl} tn"',
  'True Seeing':
    'School=Divination ' +
    'Level=C5 ' +
    'Description=' +
     '"Touched discerns deceptions and alignment auras in a 120\' radius for %{lvl} rd (Reverse obscures)"',
  'True Sight':
    'School=Divination ' +
    'Level=I6 ' +
    'Description="Touched discerns deceptions in a 60\' radius for %{lvl} rd"',
  'Turn Wood':
    'School=Alteration ' +
    'Level=D6 ' +
    'Description="Repels wood in a 120\'x%{lvl*20}\' path for %{lvl*4} rd"',
  'Unseen Servant':
    'School=Conjuration ' +
    'Level=M1 ' +
    'Description=' +
      '"Creates an invisible force that performs simple tasks in a 30\' radius for %{lvl+6} tn"',
  'Vanish':
    'School=Alteration ' +
    'Level=M7 ' +
    'Description=' +
      '"Teleports or sends to the aethereal plane a touched %{lvl*50} lb object"',
  'Veil':
    'School=Illusion ' +
    'Level=I6 ' +
    'Description=' +
      '"R%{lvl*10}\' Creates an illusionary %{lvl*20}\' sq terrain for %{lvl} tn"',
  'Ventriloquism':
    'School=Illusion ' +
    'Level=I2,M1 ' +
    'Description=' +
      '"R%{lvl*10<?(slv==\'I2\'?90:60)}\' Self may throw voice for %{lvl+(slv==\'M1\'?2:4)} rd ((Intelligence - 12) * 10% disbelieve)"',
  'Vision':
    'School=Divination ' +
    'Level=I7 ' +
    'Description="Self seeks the answer to a question; may suffer geas"',
  'Wall Of Fire':
    'School=Evocation ' +
    'Level=D5,M4 ' +
    'Description=' +
      '"R%{slv==\'M4\'?60:80}\' Creates a %{lvl*20}\' sq wall or %{slv==\'M4\'?lvl*3+10:(lvl*5)}\' radius circle that inflicts %{slv==\'M4\'?\'2d6\':\'4d4\'}+%{lvl} HP to passers, 2d4 HP to creatures w/in 10\', and 1d4 to creatures w/in 20\', for conc + %{lvl} rd"',
  'Wall Of Fog':
    'School=Alteration ' +
    'Level=I1 ' +
    'Description=' +
      '"R30\' Creates fog in a %{lvl*20}\' cu that obscures sight for 2d4 + %{lvl} rd"',
  'Wall Of Force':
    'School=Evocation ' +
    'Level=M5 ' +
    'Description=' +
      '"R30\' Creates an invisible, impenetrable %{lvl*20}\' sq wall for %{lvl+1} tn"',
  'Wall Of Ice':
    'School=Evocation ' +
    'Level=M4 ' +
    'Description=' +
      '"R%{lvl*10}\' Creates a %{lvl*100}\' sq ice wall for %{lvl} tn"',
  'Wall Of Iron':
    'School=Evocation ' +
    'Level=M5 ' +
    'Description=' +
      '"R%{lvl*5}\' Creates a %{lvl/4}\\" thick, %{lvl*15}\' sq metal wall"',
  'Wall Of Stone':
    'School=Evocation ' +
    'Level=M5 ' +
    'Description=' +
      '"R%{lvl*5}\' Extends from existing stone a %{lvl/4}\\" thick, %{lvl*20}\' sq wall"',
  'Wall Of Thorns':
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description=' +
      '"R80\' Creates briars in a %{lvl*100}\' cu that inflict 8 + AC HP for %{lvl} tn"',
  'Warp Wood':
    'School=Alteration ' +
    'Level=D2 ' +
    'Description="R%{lvl*10}\' Bends %{lvl}\\"x%{lvl*15}\\" wood"',
  'Water Breathing':
    'School=Alteration ' +
    'Level=D3,M3 ' +
    'Description=' +
      '"Touched may breathe water (Reverse may breathe air) for %{lvl+(slv==\'D3\'?\' hr\':\' rd\')}"',
  'Weather Summoning':
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description=' +
      '"Controls precipitation, temperature, and wind within d100 sq miles for 4d12 hr"',
  'Web':
    'School=Evocation ' +
    'Level=M2 ' +
    'Description=' +
      '"R%{lvl*5}\' Creates a 80\' cu sticky web that spans anchor points for %{lvl*2} tn"',
  'Wind Walk':
    'School=Alteration ' +
    'Level=C7 ' +
    'Description=' +
      '"Self and %{lvl//8} others become insubstantial; may travel 600\'/tn for %{lvl} hr"',
  'Wish':
    'School=Conjuration ' +
    'Level=M9 ' +
    'Description="Performs a major alteration of reality"',
  'Wizard Eye':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description=' +
      '"Self may see through and move 30\'/rd an invisible eye w/600\' vision and 100\' infravision for %{lvl} rd"',
  'Wizard Lock':
    'School=Alteration ' +
    'Level=M2 ' +
    'Description="Holds shut touched door, gate, or window"',
  'Word Of Recall':
    'School=Alteration ' +
    'Level=C6 ' +
    'Description="Self returns to a designated place"',
  'Write':
    'School=Evocation ' +
    'Level=M1 ' +
    'Description=' +
      '"Self may copy spells that are too powerful to learn (Save vs. spell; fail inflicts 1d4 HP/spell level and unconsciousness) for %{lvl} hr"'
};
OSRIC.VIEWERS = SRD35.VIEWERS.filter(x => x != 'Stat Block');
OSRIC.WEAPONS = {
  'Bastard Sword':'Category=Two-Handed Damage=2d4',
  'Battle Axe':'Category=One-Handed Damage=d8',
  'Broad Sword':'Category=One-Handed Damage=2d4', // Best guess on category
  'Club':'Category=One-Handed Damage=d4 Range=10',
  'Composite Long Bow':'Category=Ranged Damage=d6 Range=60',
  'Composite Short Bow':'Category=Ranged Damage=d6 Range=50',
  'Dagger':'Category=Light Damage=d4 Range=10',
  'Dart':'Category=Ranged Damage=d3 Range=15',
  'Halberd':'Category=Two-Handed Damage=d10',
  'Hammer':'Category=Light Damage=d4+1 Range=10',
  'Hand Axe':'Category=Light Damage=d6 Range=10',
  'Heavy Crossbow':'Category=Ranged Damage=d6+1 Range=60',
  'Heavy Flail':'Category=Two-Handed Damage=d6+1',
  'Heavy Mace':'Category=One-Handed Damage=d6+1',
  'Heavy Pick':'Category=One-Handed Damage=d6+1',
  'Heavy War Hammer':'Category=One-Handed Damage=d6+1', // Best guess on category
  'Javelin':'Category=Ranged Damage=d6 Range=20',
  'Lance':'Category=Two-Handed Damage=2d4+1',
  'Light Crossbow':'Category=Ranged Damage=d4+1 Range=60',
  'Light Flail':'Category=One-Handed Damage=d4+1',
  'Light Mace':'Category=Light Damage=d4+1',
  'Light Pick':'Category=Light Damage=d4+1',
  'Light War Hammer':'Category=Light Damage=d4+1',
  'Long Bow':'Category=Ranged Damage=d6 Range=70',
  'Long Sword':'Category=One-Handed Damage=d8',
  'Morning Star':'Category=One-Handed Damage=2d4',
  'Pole Arm':'Category=Two-Handed Damage=d6+1',
  'Scimitar':'Category=One-Handed Damage=d8',
  'Short Bow':'Category=Ranged Damage=d6 Range=50',
  'Short Sword':'Category=Light Damage=d6',
  'Sling':'Category=Ranged Damage=d4+1 Range=35',
  'Spear':'Category=Two-Handed Damage=d6 Range=15',
  'Staff':'Category=Two-Handed Damage=d6',
  'Trident':'Category=One-Handed Damage=d6+1',
  'Two-Handed Sword':'Category=Two-Handed Damage=d10',
  'Unarmed':'Category=Unarmed Damage=d2'
};

/* Defines rules related to character abilities. */
OSRIC.abilityRules = function(rules) {

  // Charisma
  rules.defineRule('abilityNotes.charismaLoyaltyAdjustment',
    'charisma', '=',
    'source <= 8 ? source * 5 - 45 : source <= 13 ? null : ' +
    'source <= 15 ? source * 10 - 135 : (source * 10 - 140)'
  );
  rules.defineRule('maximumHenchmen',
    'charisma', '=',
    'source<=10 ? Math.floor((source-1)/2) : source<=12 ? (source-7) : ' +
    'source<=16 ? (source-8) : ((source-15)* 5)'
  );
  rules.defineRule('abilityNotes.charismaReactionAdjustment',
    'charisma', '=',
    'source <= 7 ? (source * 5 - 40) : source <= 12 ? null : ' +
    'source <= 15 ? source * 5 - 60 : (source * 5 - 55)'
  );

  // Constitution
  rules.defineRule('conHPAdjPerDie',
    'constitution', '=',
      'source<=3 ? -2 : source<=6 ? -1 : source<=14 ? null : (source - 14)',
    'warriorLevel', 'v', 'source == 0 ? 2 : null'
  );
  rules.defineRule('surviveResurrection',
    'constitution', '=',
    'source <= 13 ? source * 5 + 25 : source <= 18 ? source * 2 + 64 : 100'
  );
  rules.defineRule('surviveSystemShock',
    'constitution', '=',
    'source <= 13 ? source * 5 + 20 : source == 16 ? 95 : ' +
    'source <= 17 ? source * 3 + 46 : 99'
  );
  rules.defineRule('combatNotes.constitutionHitPointsAdjustment',
    'conHPAdjPerDie', '=', null,
    'hitDice', '*', null
  );
  rules.defineRule('hitPoints',
    'combatNotes.constitutionHitPointsAdjustment', '+', null,
    'hitDice', '^', null
  );

  // Dexterity
  rules.defineRule('combatNotes.dexterityArmorClassAdjustment',
    'dexterity', '=',
    'source <= 6 ? (7 - source) : source <= 14 ? null : ' +
    'source <= 18 ? 14 - source : -4'
  );
  rules.defineRule('combatNotes.dexterityAttackAdjustment',
    'dexterity', '=',
    'source <= 5 ? (source - 6) : source <= 15 ? null : ' +
    'source <= 18 ? source - 15 : 3'
  );
  rules.defineRule('combatNotes.dexteritySurpriseAdjustment',
    'dexterity', '=',
    'source <= 5 ? (source - 6) : source <= 15 ? null : ' +
    'source <= 18 ? source - 15 : 3'
  );
  rules.defineRule('skillNotes.dexteritySkillModifiers',
    'dexterity', '=',
      '[' +
        'source<12 ? (source - 12) * 5 + "% Find Traps" : "",' +
        'source>16 ? "+" + (source - 16) * 5 + "% Find Traps" : "",' +
        'source<11 ? (source - 11) * 5 + "% Hide In Shadows" : "",' +
        'source>16 ? "+" + (source - 16) * 5 + "% Hide In Shadows" : "",' +
        'source<13 ? (source - 13) * 5 + "% Move Silently" : "",' +
        'source>16 ? "+" + (source - 16) * 5 + "% Move Silently" : "",' +
        'source<11 ? (source - 11) * 5 + "% Open Locks" : "",' +
        'source>15 ? "+" + (source - 15) * 5 + "% Open Locks" : "",' +
        'source<12 ? (source - 12) * 5 + "% Pick Pockets" : "",' +
        'source>17 ? "+" + ((source - 17) * 10 - 5) + "% Pick Pockets" : "",' +
      '].filter(x => x != "").join("/")'
  );
  rules.defineRule
    ('skillNotes.dexteritySkillModifiers', 'sumThiefSkills', '?', null);

  // Intelligence
  rules.defineRule('skillNotes.intelligenceLanguageBonus',
    '', '^', '0',
    'intelligence', '=',
      'source<=7 ? null : source<=15 ? Math.floor((source-6)/2) : (source-11)'
  );
  rules.defineRule
    ('languageCount', 'skillNotes.intelligenceLanguageBonus', '+', null);
  rules.defineChoice
    ('notes', 'skillNotes.intelligenceLanguageBonus:+%V Language Count');

  // Strength
  rules.defineRule('combatNotes.strengthAttackAdjustment',
    'strengthRow', '=', 'source <= 2 ? (source - 3) : ' +
                        'source <= 7 ? 0 : Math.floor((source - 5) / 3)'
  );
  rules.defineRule('combatNotes.strengthDamageAdjustment',
    'strengthRow', '=', 'source <= 1 ? -1 : source <= 6 ? 0 : ' +
                        'source == 7 ? 1 : (source - (source >= 11 ? 8 : 7))'
  );
  rules.defineRule('loadLight',
    'strengthRow', '=', '[0, 10, 20, 35, 35, 45, 55, 70, 85, 110, 135, 160, 185, 235, 335][source]'
  );
  rules.defineRule('loadMedium', 'loadLight', '=', 'source + 35');
  rules.defineRule('loadMax', 'loadMedium', '=', 'source + 35');
  rules.defineRule('speed',
    '', '=', '120',
    'abilityNotes.armorSpeedLimit', 'v', null
  );
  rules.defineRule('strengthMajorTest',
    'strengthRow', '=', 'source <= 2 ? 0 : ' +
                        'source <= 5 ? Math.pow(2, source - 3) : ' +
                        'source <= 9 ? source * 3 - 11 : (source * 5 - 30)'
  );
  rules.defineRule('strengthMinorTest',
    'strengthRow', '=', 'source == 14 ? 5 : Math.floor((source + 5) / 4)'
  );
  rules.defineRule('strengthRow',
    'strength', '=', 'source >= 16 ? source - 9 : Math.floor((source - 2) / 2)',
    'extraStrength', '+', 'source <= 50 ? 1 : source <= 75 ? 2 : ' +
                          'source <= 90 ? 3 : source <= 99 ? 4 : 5'
  );
  rules.defineChoice('notes',
    'validationNotes.extraStrength:Characters with strength less than 18 cannot have extra strength',
    'validationNotes.extraStrengthClass:Only fighters, paladins, and rangers may have extra strength',
    'validationNotes.extraStrengthRange:Extra strength value must be in the range 1..100'
  );
  rules.defineRule('validationNotes.extraStrength',
    'extraStrength', '?', null,
    'strength', '=', 'source==18 ? null : 1'
  );
  rules.defineRule('validationNotes.extraStrengthClass',
    'extraStrength', '=', '1',
    'levels.Fighter', 'v', '0',
    'levels.Paladin', 'v', '0',
    'levels.Ranger', 'v', '0'
  );
  rules.defineRule('validationNotes.extraStrengthRange',
    'extraStrength', '=', 'source>=1 && source<=100 ? null : 1'
  );

  // Wisdom
  rules.defineRule('saveNotes.wisdomMentalSavingThrowAdjustment',
    'wisdom', '=',
      'source<=5 ? (source-6) : source<=7 ? -1 : source<=14 ? null : ' +
      'Math.min(source-14, 5)'
  );

  // Add items to the character sheet
  rules.defineSheetElement('Strength');
  rules.defineSheetElement
    ('StrengthInfo', 'Dexterity', '<b>Strength</b>: %V', '.');
  rules.defineSheetElement('Strength', 'StrengthInfo/', '%V');
  rules.defineSheetElement('Extra Strength', 'StrengthInfo/', '%V');
  rules.defineSheetElement
    ('Experience Points', 'Level', '<b>Experience</b>: %V', '; ');
  rules.defineSheetElement('SpeedInfo');
  rules.defineSheetElement('Speed', 'LoadInfo', '<b>%N</b>: %V');
  rules.defineSheetElement('StrengthTests', 'LoadInfo', '%V', '');
  rules.defineSheetElement
    ('Strength Minor Test', 'StrengthTests/',
     '<b>Strength Minor/Major Test</b>: %Vin6');
  rules.defineSheetElement('Strength Major Test', 'StrengthTests/', '/%V%');
  rules.defineSheetElement('Maximum Henchmen', 'Alignment');
  rules.defineSheetElement('Survive System Shock', 'Save+', '<b>%N</b>: %V%');
  rules.defineSheetElement('Survive Resurrection', 'Save+', '<b>%N</b>: %V%');

};

/* Defines rules related to combat. */
OSRIC.combatRules = function(rules, armors, shields, weapons) {

  QuilvynUtils.checkAttrTable(armors, ['AC', 'Move', 'Weight']);
  QuilvynUtils.checkAttrTable(shields, ['AC', 'Weight']);
  QuilvynUtils.checkAttrTable(weapons, ['Category', 'Damage', 'Range']);

  for(let a in armors)
    rules.choiceRules(rules, 'Armor', a, armors[a]);
  for(let s in shields)
    rules.choiceRules(rules, 'Shield', s, shields[s]);
  for(let w in weapons) {
    let pattern = w.replace(/  */g, '\\s+');
    let prefix = w.charAt(0).toLowerCase() + w.substring(1).replaceAll(' ', '');
    rules.choiceRules(rules, 'Goody', w,
      // To avoid triggering additional weapons with a common suffix (e.g.,
      // "* punching dagger +2" also makes regular dagger +2), require that
      // weapon goodies with a trailing value have no preceding word or be
      // enclosed in parentheses.
      'Pattern="([-+]\\d)\\s+' + pattern + '|(?:^\\W*|\\()' + pattern + '\\s+([-+]\\d)" ' +
      'Effect=add ' +
      'Attribute=' + prefix + 'AttackModifier,' + prefix + 'DamageModifier ' +
      'Value="$1 || $2" ' +
      'Section=combat Note="%V Attack and damage"'
    );
    rules.choiceRules(rules, 'Weapon', w, weapons[w]);
  }

  rules.defineRule
    ('armorClass', 'combatNotes.dexterityArmorClassAdjustment', '+', null);
  rules.defineRule('attacksPerRound', '', '=', '1');
  rules.defineRule('features.Armor Speed Limit', 'armor', '=', '1');
  rules.defineRule('features.Double Specialization',
    'weaponSpecialization', '?', 'source != "None"',
    'doubleSpecialization', '=', null
  );
  rules.defineRule('features.Weapon Specialization',
    'weaponSpecialization', '=', 'source == "None" ? null : source'
  );
  rules.defineRule('thac0Melee',
    'thac10Base', '=', 'Math.min(source + 10, 20)',
    'combatNotes.strengthAttackAdjustment', '+', '-source'
  );
  rules.defineRule('thac0Ranged',
    'thac10Base', '=', 'Math.min(source + 10, 20)',
    'combatNotes.dexterityAttackAdjustment', '+', '-source'
  );
  rules.defineRule('thac10Melee',
    'thac10Base', '=', null,
    'combatNotes.strengthAttackAdjustment', '+', '-source'
  );
  rules.defineRule('thac10Ranged',
    'thac10Base', '=', null,
    'combatNotes.dexterityAttackAdjustment', '+', '-source'
  );
  rules.defineRule('turnUndeadColumn',
    'turningLevel', '=',
    'source <= 8 ? source - 1 : source <= 13 ? 8 : source <= 18 ? 9 : 10'
  );
  let turningTable = {
    'skeleton':'10:7 :4 :T :T :D :D :D :D :D :D',
    'zombie'  :'13:10:7 :T :T :D :D :D :D :D :D',
    'ghoul'   :'16:13:10:4 :T :T :D :D :D :D :D',
    'shadow'  :'19:16:13:7 :4 :T :T :D :D :D :D',
    'wight'   :'20:19:16:10:7 :4 :T :T :D :D :D',
    'ghast'   :'- :20:19:13:10:7 :4 :T :T :D :D',
    'wraith'  :'- :- :20:16:13:10:7 :4 :T :T :D',
    'mummy'   :'- :- :- :19:16:13:10:7 :4 :T :D',
    'spectre' :'- :- :- :20:19:16:13:10:7 :T :T',
    'vampire' :'- :- :- :- :20:19:16:13:10:7 :4',
    'ghost'   :'- :- :- :- :- :20:19:16:13:10:7',
    'lich'    :'- :- :- :- :- :- :20:19:16:13:10',
    'fiend'   :'- :- :- :- :- :- :- :20:19:16:13'
  };
  for(let u in turningTable) {
    rules.defineRule('turnUndead.' + u,
      'turnUndeadColumn', '=', '"' + turningTable[u] +'".split(":")[source].trim()'
    );
  }
  // Replace SRD35's two-handedWeapon validation note
  delete rules.choices.notes['validationNotes.two-handedWeapon'];
  rules.defineChoice
    ('notes', 'validationNotes.two-handedWeapon:Requires shield == "None"');
  rules.defineRule('weapons.Unarmed', '', '=', '1');
  rules.defineRule('weaponProficiencyCount', 'weapons.Unarmed', '=', '1');
  rules.defineRule('weaponProficiency.Unarmed', 'weapons.Unarmed', '=', '1');

  // Add items to character sheet
  rules.defineSheetElement('EquipmentInfo', 'Combat Notes', null);
  rules.defineSheetElement('Weapon Proficiency Count', 'EquipmentInfo/');
  rules.defineSheetElement
    ('Weapon Proficiency', 'EquipmentInfo/', null, '; ');
  rules.defineSheetElement
    ('Thac0Info', 'CombatStats/', '<b>THAC0 Melee/Ranged</b>: %V', '/');
  rules.defineSheetElement('Thac0 Melee', 'Thac0Info/', '%V');
  rules.defineSheetElement('Thac0 Ranged', 'Thac0Info/', '%V');
  rules.defineSheetElement
    ('Thac10Info', 'CombatStats/', '<b>THAC10 Melee/Ranged</b>: %V', '/');
  rules.defineSheetElement('Thac10 Melee', 'Thac10Info/', '%V');
  rules.defineSheetElement('Thac10 Ranged', 'Thac10Info/', '%V');
  rules.defineSheetElement('AttackInfo');
  rules.defineSheetElement('Turn Undead', 'Combat Notes', null);
};

/* Defines rules related to basic character identity. */
OSRIC.identityRules = function(rules, alignments, classes, races) {

  QuilvynUtils.checkAttrTable(alignments, []);
  QuilvynUtils.checkAttrTable(
    classes, [
      'Require', 'Experience', 'HitDie', 'THAC10', 'Breath', 'Death',
      'Petrification', 'Spell', 'Wand', 'Features', 'WeaponProficiency',
      'NonweaponProficiency', 'NonproficientPenalty', 'SpellSlots'
    ]
  );
  QuilvynUtils.checkAttrTable(races, ['Require', 'Features', 'Languages']);

  for(let a in alignments)
    rules.choiceRules(rules, 'Alignment', a, alignments[a]);
  for(let c in classes)
    rules.choiceRules(rules, 'Class', c, classes[c]);
  for(let r in races)
    rules.choiceRules(rules, 'Race', r, races[r]);

  // Rules that apply to multiple classes or races
  rules.defineRule('level', /^levels\./, '+=', null);
  rules.defineRule('warriorLevel', '', '=', '0');
  QuilvynRules.validAllocationRules
    (rules, 'weaponProficiency', 'weaponProficiencyCount', 'Sum "^weaponProficiency\\."');
  rules.defineRule('validationNotes.weaponProficiencyAllocation.2',
    'weaponSpecialization', '+', 'source == "None" ? null : 1',
    'doubleSpecialization', '+', 'source ? 1 : null'
  );

};

/* Defines rules related to magic use. */
OSRIC.magicRules = function(rules, schools, spells) {

  QuilvynUtils.checkAttrTable(schools, []);
  QuilvynUtils.checkAttrTable
    (spells, ['School', 'Level', 'Description', 'Effect', 'Duration', 'Range']);

  for(let s in schools)
    rules.choiceRules(rules, 'School', s, schools[s]);
  for(let s in spells) {
    if(s.match(/\s[A-Z]\d$/))
      continue;
    let groupLevels = QuilvynUtils.getAttrValueArray(spells[s], 'Level');
    for(let i = 0; i < groupLevels.length; i++) {
      let groupLevel = groupLevels[i];
      let attrs = spells[s] + ' ' + (spells[s + ' ' + groupLevel] || '');
      rules.choiceRules(rules, 'Spell', s, attrs + ' Level=' + groupLevel);
    }
  }

};

/* Defines rules related to character aptitudes. */
OSRIC.talentRules = function(rules, features, goodies, languages, skills) {

  QuilvynUtils.checkAttrTable(features, ['Section', 'Note']);
  QuilvynUtils.checkAttrTable
    (goodies, ['Pattern', 'Effect', 'Value', 'Attribute', 'Section', 'Note']);
  QuilvynUtils.checkAttrTable(languages, []);
  QuilvynUtils.checkAttrTable(skills, ['Ability', 'Class']);

  for(let f in features)
    rules.choiceRules(rules, 'Feature', f, features[f]);
  for(let g in goodies)
    rules.choiceRules(rules, 'Goody', g, goodies[g]);
  for(let l in languages)
    rules.choiceRules(rules, 'Language', l, languages[l]);
  for(let s in skills) {
    rules.choiceRules(rules, 'Goody', s,
      'Pattern="([-+]\\d).*\\s+' + s + '\\s+Skill|' + s + '\\s+skill\\s+([-+]\\d)"' +
      'Effect=add ' +
      'Value="$1 || $2" ' +
      'Attribute="skillModifier.' + s + '" ' +
      'Section=skill Note="%V ' + s + '"'
    );
    rules.choiceRules(rules, 'Skill', s, skills[s]);
  }
  QuilvynRules.validAllocationRules
    (rules, 'language', 'languageCount', 'Sum "^languages\\."');

};

/*
 * Adds #name# as a possible user #type# choice and parses #attrs# to add rules
 * related to selecting that choice.
 */
OSRIC.choiceRules = function(rules, type, name, attrs) {
  if(type == 'Alignment')
    OSRIC.alignmentRules(rules, name);
  else if(type == 'Armor')
    OSRIC.armorRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Move'),
      QuilvynUtils.getAttrValue(attrs, 'Weight')
    );
  else if(type == 'Class') {
    OSRIC.classRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValue(attrs, 'Experience'),
      QuilvynUtils.getAttrValueArray(attrs, 'HitDie'),
      QuilvynUtils.getAttrValue(attrs, 'THAC10'),
      QuilvynUtils.getAttrValue(attrs, 'Breath'),
      QuilvynUtils.getAttrValue(attrs, 'Death'),
      QuilvynUtils.getAttrValue(attrs, 'Petrification'),
      QuilvynUtils.getAttrValue(attrs, 'Spell'),
      QuilvynUtils.getAttrValue(attrs, 'Wand'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValue(attrs, 'WeaponProficiency'),
      QuilvynUtils.getAttrValue(attrs, 'NonproficientPenalty'),
      QuilvynUtils.getAttrValueArray(attrs, 'SpellSlots')
    );
    OSRIC.classRulesExtra(rules, name);
  } else if(type == 'Feature')
    OSRIC.featureRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Section'),
      QuilvynUtils.getAttrValueArray(attrs, 'Note')
    );
  else if(type == 'Goody')
    OSRIC.goodyRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Pattern'),
      QuilvynUtils.getAttrValue(attrs, 'Effect'),
      QuilvynUtils.getAttrValue(attrs, 'Value'),
      QuilvynUtils.getAttrValueArray(attrs, 'Attribute'),
      QuilvynUtils.getAttrValueArray(attrs, 'Section'),
      QuilvynUtils.getAttrValueArray(attrs, 'Note')
    );
  else if(type == 'Language')
    OSRIC.languageRules(rules, name);
  else if(type == 'Race') {
    OSRIC.raceRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Languages')
    );
    OSRIC.raceRulesExtra(rules, name);
  } else if(type == 'School')
    OSRIC.schoolRules(rules, name);
  else if(type == 'Shield')
    OSRIC.shieldRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Weight')
    );
  else if(type == 'Skill') {
    OSRIC.skillRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Ability'),
      QuilvynUtils.getAttrValueArray(attrs, 'Class')
    );
    OSRIC.skillRulesExtra(rules, name);
  } else if(type == 'Spell') {
    let description = QuilvynUtils.getAttrValue(attrs, 'Description');
    let groupLevels = QuilvynUtils.getAttrValueArray(attrs, 'Level');
    let school = QuilvynUtils.getAttrValue(attrs, 'School');
    let schoolAbbr = school.substring(0, 4);
    for(let i = 0; i < groupLevels.length; i++) {
      let matchInfo = groupLevels[i].match(/^(\D+)(\d+)$/);
      if(!matchInfo) {
        console.log('Bad level "' + groupLevels[i] + '" for spell ' + name);
        continue;
      }
      let group = matchInfo[1];
      let level = matchInfo[2] * 1;
      let fullName = name + '(' + group + level + ' ' + schoolAbbr + ')';
      OSRIC.spellRules(rules, fullName, school, group, level, description);
      rules.addChoice('spells', fullName, attrs);
    }
  } else if(type == 'Weapon')
    OSRIC.weaponRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Category'),
      QuilvynUtils.getAttrValue(attrs, 'Damage'),
      QuilvynUtils.getAttrValue(attrs, 'Range')
    );
  else {
    console.log('Unknown choice type "' + type + '"');
    return;
  }
  if(type != 'Spell') {
    type = type == 'Class' ? 'levels' :
    (type.substring(0,1).toLowerCase() + type.substring(1).replaceAll(' ', '') + 's');
    rules.addChoice(type, name, attrs);
  }
};

/*
 * Removes #name# from the set of user #type# choices, reversing the effects of
 * choiceRules.
 */
OSRIC.removeChoice = SRD35.removeChoice;

/* Defines in #rules# the rules associated with alignment #name#. */
OSRIC.alignmentRules = function(rules, name) {
  if(!name) {
    console.log('Empty alignment name');
    return;
  }
  // No rules pertain to alignment
};

/*
 * Defines in #rules# the rules associated with armor #name#, which adds #ac#
 * to the character's armor class, imposes a maximum movement speed of
 * #maxMove#, and weighs #weight# pounds.
 */
OSRIC.armorRules = function(rules, name, ac, maxMove, weight) {

  if(!name) {
    console.log('Empty armor name');
    return;
  }
  if(typeof ac != 'number') {
    console.log('Bad ac "' + ac + '" for armor ' + name);
    return;
  }
  if(typeof maxMove != 'number') {
    console.log('Bad maxMove "' + maxMove + '" for armor ' + name);
    return;
  }
  if(typeof weight != 'number') {
    console.log('Bad weight "' + weight + '" for armor ' + name);
    return;
  }

  if(rules.armorStats == null) {
    rules.armorStats = {
      ac:{},
      move:{},
      weight:{}
    };
  }
  rules.armorStats.ac[name] = ac;
  rules.armorStats.move[name] = maxMove;
  rules.armorStats.weight[name] = weight;

  rules.defineRule('abilityNotes.armorSpeedLimit',
    'armor', '=', '(' + QuilvynUtils.dictLit(rules.armorStats.move) + '[source]||120) == 120 ? null : ' + QuilvynUtils.dictLit(rules.armorStats.move) + '[source]'
  );
  rules.defineRule('armorClass',
    '', '=', '10',
    'armor', '+', QuilvynUtils.dictLit(rules.armorStats.ac) + '[source]'
  );
  rules.defineRule('armorWeight',
    'armor', '=', QuilvynUtils.dictLit(rules.armorStats.weight) + '[source]'
  );

};

/*
 * Defines in #rules# the rules associated with class #name#, which has the
 * list of hard prerequisites #requires#. #experience# lists the experience
 * point progression required to advance levels in the class. #hitDie# is a
 * triplet indicating the additional hit points granted with each level
 * advance--the first element (format [n]'d'n) specifies the number of sides on
 * each die, the second the maximum number of hit dice for the class, and the
 * third the number of points added each level after the maximum hit dice are
 * reached. #thac10# is a progression that lists the values needed by a
 * character of this class to hit AC 10. Similarly, #saveBreath#, #saveDeath#,
 * #savePetrification#, #saveSpell#, and #saveWand# are each progressions
 * indicating the value needed for each type of saving throw on each level.
 * #features# lists the features acquired as the character advances in class
 * level. #weaponProficiency# is a progression indicating the number of weapon
 * proficiencies the class grants at each level, and #nonproficientPenalty# the
 * attack penalty assessed by the class when using a non-proficient weapon. If
 * the class grants spell slots, #spellSlots# lists the number of spells per
 * level per day granted.
 */
OSRIC.classRules = function(
  rules, name, requires, experience, hitDie, thac10, saveBreath, saveDeath,
  savePetrification, saveSpell, saveWand, features, weaponProficiency,
  nonproficientPenalty, spellSlots
) {

  if(!name) {
    console.log('Empty class name');
    return;
  }
  if(!Array.isArray(requires)) {
    console.log('Bad requires list "' + requires + '" for class ' + name);
    return;
  }
  if(typeof(experience) != 'string') {
    console.log('Bad experience "' + experience + '" for class ' + name);
    return;
  }
  if(!Array.isArray(hitDie) || hitDie.length != 3) {
    console.log('Bad hitDie "' + hitDie + '" for class ' + name);
    return;
  }
  if(typeof(thac10) != 'string') {
    console.log('Bad thac10 "' + thac10 + '" for class ' + name);
    return;
  }
  if(typeof(saveBreath) != 'string') {
    console.log('Bad saveBreath "' + saveBreath + '" for class ' + name);
    return;
  }
  if(typeof(saveDeath) != 'string') {
    console.log('Bad saveDeath "' + saveDeath + '" for class ' + name);
    return;
  }
  if(typeof(savePetrification) != 'string') {
    console.log('Bad savePetrification "' + savePetrification + '" for class ' + name);
    return;
  }
  if(typeof(saveSpell) != 'string') {
    console.log('Bad saveSpell "' + saveSpell + '" for class ' + name);
    return;
  }
  if(typeof(saveWand) != 'string') {
    console.log('Bad saveWand "' + saveWand + '" for class ' + name);
    return;
  }
  if(!Array.isArray(features)) {
    console.log('Bad features list "' + features + '" for class ' + name);
    return;
  }
  if(typeof(weaponProficiency) != 'string') {
    console.log('Bad weaponProficiency "' + weaponProficiency + '" for class ' + name);
    return;
  }
  if(typeof(nonproficientPenalty) != 'number') {
    console.log('Bad nonproficientPenalty "' + nonproficientPenalty + '" for class ' + name);
    return;
  }
  if(!Array.isArray(spellSlots)) {
    console.log('Bad spellSlots list "' + spellSlots + '" for class ' + name);
    return;
  }

  let classLevel = 'levels.' + name;
  let prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '');

  if(requires.length > 0)
    QuilvynRules.prerequisiteRules
      (rules, 'validation', prefix + 'Class', classLevel, requires);

  rules.defineChoice('notes', 'experiencePoints.' + name + ':%V/%1');
  experience = OSRIC.progressTable(experience);
  rules.defineRule('experiencePoints.' + name + '.1',
    classLevel, '=',  'source<' + (experience.length - 1) + ' ? [' + experience + '][source + 1] : "-"'
  );
  rules.defineRule(classLevel,
    'experiencePoints.' + name, '=', 'source<' + experience[experience.length - 1] + ' ? ' + '[' + experience + '].findIndex(item => item>source) - 1 : ' + (experience.length - 1)
  );

  let thac10Progress = OSRIC.progressTable(thac10);
  rules.defineRule('thac10Base',
    classLevel, 'v=', 'source<' + thac10Progress.length + ' ? [' + thac10Progress.join(',') + '][source] : ' + thac10Progress[thac10Progress.length - 1]
  );

  let extraHitDie = (hitDie[0] + '').startsWith('2');
  rules.defineRule('hitDice',
    classLevel, '^=',
      'Math.min(source' + (extraHitDie ? ' + 1' : '') + ', ' + hitDie[1] + ')'
  );

  let saves = {
    'Breath':saveBreath, 'Death':saveDeath, 'Petrification':savePetrification,
    'Spell':saveSpell, 'Wand':saveWand
  };
  for(let s in saves) {
    let saveProgress = OSRIC.progressTable(saves[s]);
    rules.defineRule('class' + name + s + 'Save',
      classLevel, 'v=', 'source<' + saveProgress.length + ' ? [' + saveProgress.join(',') + '][source] : ' + saveProgress[saveProgress.length - 1]
    );
    rules.defineRule
      ('save.' + s, 'class' + name + s + 'Save', 'v=', null);
  }

  features.forEach(f => {
    let m;
    if((m = f.match(/((\d+):)?Bonus Attacks/)) != null) {
      let level = +m[2] || 1;
      rules.defineRule
        ('attacksPerRound', 'combatNotes.bonusAttacks', '+', null);
      rules.defineRule('combatNotes.bonusAttacks',
        classLevel, '^=', 'source<' + level + ' ? null : source<' + (level * 2 - 1) + ' ? 0.5 : 1'
      );
    } else if(f.includes('Bonus Spells') && spellSlots.length > 0) {
      // The rule engine doesn't support building results via concatenation or
      // arrays, so we have to go through some contortions to list all of the
      // character's slot bonuses. We cache the spell types subject to bonuses
      // in the OSRIC.BonusSpellTypes global and compute a bit map indicating
      // which of these the character possesses. This is then combined with a
      // template constructed from the character's wisdom score to produce the
      // final list of bonus spell levels.
      let t = spellSlots[0].charAt(0);
      if(!OSRIC.BonusSpellTypes)
        OSRIC.BonusSpellTypes = [];
      OSRIC.BonusSpellTypes.push(t);
      rules.defineRule('bonusSpellBitMap',
        'features.Bonus Spells', '?', null,
        '', '=', '0',
        classLevel, '+', Math.pow(2, OSRIC.BonusSpellTypes.length - 1)
      );
      rules.defineRule('bonusSpellTemplate',
        'features.Bonus Spells', '?', null,
        'wisdom', '=',
          'source>=19 ? "t1x3, t2x2, t3, t4" : ' +
          'source==18 ? "t1x2, t2x2, t3, t4" : ' +
          'source==17 ? "t1x2, t2x2, t3" : ' +
          'source==16 ? "t1x2, t2x2" : ' +
          'source==15 ? "t1x2, t2" : ' +
          'source==14 ? "t1x2" : "t1"'
      );
      rules.defineRule('magicNotes.bonusSpells',
        // Bonus spell template is used in the second rule, taken from the dict
        // param to the function. The first rule ensures that bST has been
        // computed before the second rule is evaluated.
        'bonusSpellTemplate', '?', null,
        'bonusSpellBitMap', '=', 'OSRIC.BonusSpellTypes.map(x => dict.bonusSpellTemplate.replaceAll("t", x)).filter((x, index) => source & Math.pow(2, index)).join(", ")'
      );
      for(let level = 1; level <= 4; level++) {
        rules.defineRule('spellSlots.' + t + level,
          'magicNotes.bonusSpells', '+', 'source.match(/' + t + level + 'x3/) ? 3 : source.match(/' + t + level + 'x2/) ? 2 : source.match(/' + t + level + '/) ? 1 : null'
        );
      }
    } else if(f.includes('Fighting The Unskilled')) {
      rules.defineRule('warriorLevel', classLevel, '^=', null);
    } else if((m = f.match(/((\d+):)?Turn Undead/)) != null) {
      rules.defineRule('turningLevel',
        classLevel, '^=', m[2] && m[2] != '1' ? 'source>=' + m[2] + ' ? source - ' + (+m[2] - 1) + ' : null' : 'source'
      );
    }
  });

  QuilvynRules.featureListRules(rules, features, name, classLevel, false);
  rules.defineSheetElement(name + ' Features', 'Feats+', null, '; ');
  rules.defineChoice('extras', prefix + 'Features');

  let weaponProgress = OSRIC.progressTable(weaponProficiency);
  rules.defineRule('weaponProficiencyCount',
    classLevel, '+', 'source<' + weaponProgress.length + ' ? [' + weaponProgress.join(',') + '][source] : ' + weaponProgress[weaponProgress.length - 1]
  );
  rules.defineRule
    ('weaponNonProficiencyPenalty', classLevel, '^=', nonproficientPenalty);

  if(spellSlots.length > 0) {
    QuilvynRules.spellSlotRules(rules, classLevel, spellSlots);
    spellSlots.forEach(x => {
      let t = x.replace(/\d.*/, '');
      rules.defineRule('casterLevels.' + t, classLevel, '^=', null);
    });
  }

};

/*
 * Defines in #rules# the rules associated with class #name# that cannot be
 * derived directly from the abilities passed to classRules.
 */
OSRIC.classRulesExtra = function(rules, name) {

  let classLevel = 'levels.' + name;

  if(name == 'Assassin') {

    // Remove Limited Henchmen Classes note once level 12 is reached
    rules.defineRule('assassinFeatures.Limited Henchmen Classes',
      classLevel, '=', 'source>=4 && source<12 ? 1 : null'
    );
    rules.defineRule('maximumHenchmen', classLevel, 'v', 'source<4 ? 0 : null');
    rules.defineRule('assassinFeatures.Thief Skills', classLevel, '=', '1');
    let skillLevel = 'source>2 ? source - 2 : 1';
    rules.defineRule('skillLevel.Climb Walls', classLevel, '+=', skillLevel);
    rules.defineRule('skillLevel.Find Traps', classLevel, '+=', skillLevel);
    rules.defineRule('skillLevel.Hear Noise', classLevel, '+=', skillLevel);
    rules.defineRule
      ('skillLevel.Hide In Shadows', classLevel, '+=', skillLevel);
    rules.defineRule('skillLevel.Move Silently', classLevel, '+=', skillLevel);
    rules.defineRule('skillLevel.Open Locks', classLevel, '+=', skillLevel);
    rules.defineRule('skillLevel.Pick Pockets', classLevel, '+=', skillLevel);
    rules.defineRule('skillLevel.Read Languages', classLevel, '+=', skillLevel);

  } else if(name == 'Paladin') {

    // Override casterLevel calculations from classRules
    rules.defineRule('casterLevel.C',
      classLevel, '^=', 'source<9 ? null : Math.min(source - 8, 8)'
    );

  } else if(name == 'Ranger') {

    // Override casterLevel calculations from classRules
    rules.defineRule('casterLevel.D',
      classLevel, '^=', 'source<9 ? null : Math.min(Math.floor((source - 6) / 2), 6)'
    );
    rules.defineRule('casterLevel.M',
      classLevel, '^=', 'source<9 ? null : Math.min(Math.floor((source - 6) / 2), 6)'
    );
    rules.defineRule('maximumHenchmen',
      // Noop to show Delayed Henchmen note in italics
      'abilityNotes.delayedHenchmen', '+', 'null',
      classLevel, 'v', 'source<8 ? 0 : null'
    );

  } else if(name == 'Thief') {

    rules.defineRule('skillLevel.Climb Walls', classLevel, '+=', null);
    rules.defineRule('skillLevel.Find Traps', classLevel, '+=', null);
    rules.defineRule('skillLevel.Hear Noise', classLevel, '+=', null);
    rules.defineRule('skillLevel.Hide In Shadows', classLevel, '+=', null);
    rules.defineRule('skillLevel.Move Silently', classLevel, '+=', null);
    rules.defineRule('skillLevel.Open Locks', classLevel, '+=', null);
    rules.defineRule('skillLevel.Pick Pockets', classLevel, '+=', null);
    rules.defineRule('skillLevel.Read Languages', classLevel, '+=', null);

  }

};

/*
 * Defines in #rules# the rules associated with feature #name#. #sections# lists
 * the sections of the notes related to the feature and #notes# the note texts;
 * the two must have the same number of elements.
 */
OSRIC.featureRules = function(rules, name, sections, notes) {
  SRD35.featureRules(rules, name, sections, notes);
  if(name.match(/ Cant$/)) {
    let note =
      sections[0] + 'Notes.' + name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '');
    rules.defineRule('languageCount', note, '+', '1');
    rules.defineRule('languages.' + name, 'features.' + name, '=', '1');
  }
};

/*
 * Defines in #rules# the rules associated with goody #name#, triggered by
 * a starred line in the character notes that matches #pattern#. #effect#
 * specifies the effect of the goody on each attribute in list #attributes#.
 * This is one of "increment" (adds #value# to the attribute), "set" (replaces
 * the value of the attribute by #value#), "lower" (decreases the value to
 * #value#), or "raise" (increases the value to #value#). #value#, if null,
 * defaults to 1; occurrences of $1, $2, ... in #value# reference capture
 * groups in #pattern#. #sections# and #notes# list the note sections
 * ("attribute", "combat", "companion", "feature", "magic", "save", or "skill")
 * and formats that show the effects of the goody on the character sheet.
 */
OSRIC.goodyRules = function(
  rules, name, pattern, effect, value, attributes, sections, notes
) {
  QuilvynRules.goodyRules
    (rules, name, pattern, effect, value, attributes, sections, notes);
};

/* Defines in #rules# the rules associated with language #name#. */
OSRIC.languageRules = function(rules, name) {
  if(!name) {
    console.log('Empty language name');
    return;
  }
  // No rules pertain to language
};

/*
 * Defines in #rules# the rules associated with race #name#, which has the list
 * of hard prerequisites #requires#. #features# lists associated features and
 * #languages# any automatic languages.
 */
OSRIC.raceRules = function(rules, name, requires, features, languages) {

  if(!name) {
    console.log('Empty race name');
    return;
  }
  if(!Array.isArray(requires)) {
    console.log('Bad requires list "' + requires + '" for race ' + name);
    return;
  }
  if(!Array.isArray(features)) {
    console.log('Bad features list "' + features + '" for race ' + name);
    return;
  }
  if(!Array.isArray(languages)) {
    console.log('Bad languages list "' + languages + '" for race ' + name);
    return;
  }
  if(rules.getChoices('languages')) {
    languages.forEach(l => {
      if(l != 'any' && !(l in rules.getChoices('languages'))) {
        console.log('Bad language "' + l + '" for race ' + name);
        // Warning only - not critical to definition
      }
    });
  }

  let prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '');
  let raceLevel = prefix + 'Level';

  rules.defineRule(raceLevel,
    'race', '?', 'source == "' + name + '"',
    'level', '=', null
  );

  if(requires.length > 0)
    QuilvynRules.prerequisiteRules
      (rules, 'validation', prefix + 'Race', raceLevel, requires);

  QuilvynRules.featureListRules(rules, features, name, raceLevel, false);
  rules.defineSheetElement(name + ' Features', 'Feats+', null, '; ');
  rules.defineChoice('extras', prefix + 'Features');

  if(languages.length > 0) {
    rules.defineRule('languageCount', raceLevel, '=', languages.length);
    languages.forEach(l => {
      if(l != 'any')
        rules.defineRule('languages.' + l, raceLevel, '=', '1');
    });
  }

  rules.defineRule
    ('skillNotes.raceSkillModifiers', 'sumThiefSkills', '?', null);

};

/*
 * Defines in #rules# the rules associated with race #name# that cannot be
 * derived directly from the abilities passed to raceRules.
 */
OSRIC.raceRulesExtra = function(rules, name) {

  let raceLevel =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '') + 'Level';

  if(name == 'Dwarf') {
    rules.defineRule
      ('skillNotes.intelligenceLanguageBonus', raceLevel, 'v', '2');
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=',
        '"-10% Climb Walls/+15% Find Traps/-5% Move Silently/+15% Open Locks/-5% Read Languages"'
    );
  } else if(name == 'Elf') {
    rules.defineRule
      ('skillNotes.intelligenceLanguageBonus', raceLevel, '+', '-4');
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=',
        '"-5% Climb Walls/+5% Find Traps/+5% Hear Noise/+10% Hide In Shadows/+5% Move Silently/-5% Open Locks/+5% Pick Pockets/+10% Read Languages"'
    );
  } else if(name == 'Gnome') {
    rules.defineRule
      ('skillNotes.intelligenceLanguageBonus', raceLevel, 'v', '2');
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=', '"-15% Climb Walls/+5% Hear Noise/+10% Open Locks"'
    );
  } else if(name == 'Half-Elf') {
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=', '"+5% Hide In Shadows/+10% Pick Pockets"'
    );
  } else if(name == 'Half-Orc') {
    rules.defineRule
      ('skillNotes.intelligenceLanguageBonus', raceLevel, 'v', '2');
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=',
        '"+5% Climb Walls/+5% Find Traps/+5% Hear Noise/+5% Open Locks/-5% Pick Pockets/-10% Read Languages"'
    );
  } else if(name == 'Halfling') {
    rules.defineRule
      ('skillNotes.intelligenceLanguageBonus', raceLevel, '+', '-5');
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=',
        '"-15% Climb Walls/+5% Hear Noise/+15% Hide In Shadows/+15% Move Silently/+5% Pick Pockets/-5% Read Languages"'
    );
  } else if(name == 'Human') {
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=', '"+5% Climb Walls/+5% Open Locks"'
    );
  }

};

/* Defines in #rules# the rules associated with magic school #name#. */
OSRIC.schoolRules = function(rules, name) {
  if(!name) {
    console.log('Empty school name');
    return;
  }
  // No rules pertain to school
};

/*
 * Defines in #rules# the rules associated with shield #name#, which adds #ac#
 * to the character's armor class and weight #weight# pounds
 */
OSRIC.shieldRules = function(rules, name, ac, weight) {

  if(!name) {
    console.log('Empty shield name');
    return;
  }
  if(typeof ac != 'number') {
    console.log('Bad ac "' + ac + '" for shield ' + name);
    return;
  }
  if(typeof weight != 'number') {
    console.log('Bad weight "' + weight + '" for shield ' + name);
    return;
  }

  if(rules.shieldStats == null) {
    rules.shieldStats = {
      ac:{},
      weight:{}
    };
  }
  rules.shieldStats.ac[name] = ac;
  rules.shieldStats.weight[name] = weight;

  rules.defineRule('armorClass',
    'shield', '+', QuilvynUtils.dictLit(rules.shieldStats.ac) + '[source]'
  );
  rules.defineRule('armorWeight',
    'shield', '+', QuilvynUtils.dictLit(rules.shieldStats.weight) + '[source]'
  );

};

/*
 * Defines in #rules# the rules associated with skill #name#, associated with
 * basic ability #ability#.  #classes# lists the classes for which this is a
 * class skill; a value of "all" indicates that this is a class skill for all
 * classes.
 */
OSRIC.skillRules = function(rules, name, ability, classes) {

  if(!name) {
    console.log('Empty skill name');
    return;
  }
  if(ability) {
    ability = ability.toLowerCase();
    if(!(ability in OSRIC.ABILITIES) && ability != 'n/a') {
      console.log('Bad ability "' + ability + '" for skill ' + name);
      return;
    }
  }
  if(!Array.isArray(classes)) {
    console.log('Bad classes list "' + classes + '" for skill ' + name);
    return;
  }

  for(let i = 0; i < classes.length; i++) {
    let clas = classes[i];
    if(clas == 'all')
      rules.defineRule('classSkill.' + name, 'level', '=', '1');
    else
      rules.defineRule('classSkill.' + name, 'levels.' + clas, '=', '1');
  }
  rules.defineRule('skillModifier.' + name,
    'skills.' + name, '=', null,
    'skillNotes.dexteritySkillModifiers', '+',
      'source.match(/' + name + '/) ? source.match(/([-+]\\d+)% ' + name + '/)[1] * 1 : null',
    'skillNotes.raceSkillModifiers', '+',
      'source.match(/' + name + '/) ? source.match(/([-+]\\d+)% ' + name + '/)[1] * 1 : null'
  );
  if(ability)
    rules.defineRule('sumNonThiefSkills', 'skills.' + name, '+=', null);
  else
    rules.defineRule('sumThiefSkills', 'skills.' + name, '+=', null);
  if(ability) {
    rules.defineChoice
      ('notes', 'skills.' + name + ': (' + ability.substring(0, 3) + ') %V (%1)');
    if(ability != 'n/a')
      rules.defineRule('skillModifier.' + name, ability, '+', null);
  } else {
    rules.defineChoice('notes', 'skills.' + name + ':%1%');
  }
  rules.defineRule('skills.' + name + '.1', 'skillModifier.' + name, '=', null);

};

/*
 * Defines in #rules# the rules associated with skill #name# that cannot be
 * derived directly from the abilities passed to skillRules.
 */
OSRIC.skillRulesExtra = function(rules, name) {
  if(name == 'Climb Walls') {
    rules.defineRule('skills.Climb Walls',
      'skillLevel.Climb Walls', '+=',
        'source<7 ? 2 * source + 78 : Math.min(source + 84, 99)'
    );
  } else if(name == 'Find Traps') {
    rules.defineRule('skills.Find Traps',
      'skillLevel.Find Traps', '+=',
        'source<18 ? 4 * source + 21 : Math.min(2 * source + 55, 99)'
    );
  } else if(name == 'Hear Noise') {
    rules.defineRule('skills.Hear Noise',
      'skillLevel.Hear Noise', '+=', '3 * source + 7'
    );
  } else if(name == 'Hide In Shadows') {
    rules.defineRule('skills.Hide In Shadows',
      'skillLevel.Hide In Shadows', '+=',
        'source<16 ? 5 * source + 15 : (source + 75)'
    );
  } else if(name == 'Move Silently') {
    rules.defineRule('skills.Move Silently',
      'skillLevel.Move Silently', '+=',
        'source<16 ? 5 * source + 15 : (source + 75)'
    );
  } else if(name == 'Open Locks') {
    rules.defineRule('skills.Open Locks',
      'skillLevel.Open Locks', '+=',
        'source<17 ? 4 * source + 26 : (source + 75)'
    );
  } else if(name == 'Pick Pockets') {
    rules.defineRule('skills.Pick Pockets',
      'skillLevel.Pick Pockets', '+=',
        'source<15 ? 4 * source + 31 : (source + 75)'
    );
  } else if(name == 'Read Languages') {
    rules.defineRule('skills.Read Languages',
      'skillLevel.Read Languages', '+=',
        'source<20 ? Math.max(5 * source - 5, 1) : ' +
        'Math.min(2 * source + 52, 99)'
    );
  }
};

/*
 * Defines in #rules# the rules associated with spell #name#, which is from
 * magic school #school#. #casterGroup# and #level# are used to compute any
 * saving throw value required by the spell. #description# is a verbose
 * description of the spell's effects.
 */
OSRIC.spellRules = function(
  rules, name, school, casterGroup, level, description
) {
  description = description.replaceAll('slv', '"' + casterGroup + level + '"');
  SRD35.spellRules
    (rules, name, school, casterGroup, level, description, false, []);
  // No changes needed to the rules defined by SRD35 method
};

/*
 * Defines in #rules# the rules associated with weapon #name#, which belongs to
 * weapon category #category# (one of '1h', '2h', 'Li', 'R', 'Un' or their
 * spelled-out equivalents). The weapon does #damage# HP on a successful attack.
 * If specified, the weapon can be used as a ranged weapon with a range
 * increment of #range# feet.
 */
OSRIC.weaponRules = function(rules, name, category, damage, range) {
  let prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '');
  SRD35.weaponRules(rules, name, 'Unarmed', category, damage, 20, 2, range);
  delete rules.getChoices('notes')['weapons.' + name];
  rules.defineChoice
    ('notes', 'weapons.' + name + ':%V (%1 %2%3' + (range ? ' R%5\')' : ')'));
  rules.defineRule(prefix + 'AttackModifier',
    '', '=', '0',
    'combatNotes.weaponSpecialization', '+', 'source=="' + name + '" ? 1 : null'
  );
  if(name.match(/Bow/)) {
    rules.defineRule
      (prefix + 'AttackModifier', 'combatNotes.bowPrecision', '+', '1');
  }
  if(name == 'Long Sword' || name == 'Short Sword') {
    rules.defineRule
      (prefix + 'AttackModifier', 'combatNotes.swordPrecision', '+', '1');
  }
  if(name.match(/Bow|Sling/)) {
    rules.defineRule
      (prefix + 'AttackModifier', 'combatNotes.deadlyAim', '+', '3');
  }
  rules.defineRule(prefix + 'DamageModifier',
    'combatNotes.weaponSpecialization', '+', 'source=="' + name + '" ? 2 : null'
  );
  rules.defineRule('combatNotes.nonproficientWeaponPenalty.' + name,
    'weapons.' + name, '?', null,
    'weaponProficiencyLevelShortfall.' + name, '?', 'source > 0',
    'weaponNonProficiencyPenalty', '=', null
  );
  rules.defineRule('weaponProficiencyLevelShortfall.' + name,
    'weapons.' + name, '?', null,
    'weaponNonProficiencyPenalty', '=', '1',
    'weaponProficiency.' + name, 'v', '0'
  );
};

/*
 * TODO
 */
OSRIC.progressTable = function(steps) {
  let mostRecentRun = 1;
  let mostRecentStep = 0;
  let result = [0];
  steps = steps.replace(/\s*\.\.\.\s*/g, ' ...').split(/[\s;]+/);
  for(let i = 0; i < steps.length; i++) {
    let m = (steps[i] + '').match(/^(\.\.\.)?(-?\d+(\.\d+)?)(@(\d+))?$/);
    if(!m) {
      console.log('Malformed progress step "' + steps[i] + '"');
      break;
    }
    let nextLevel = m[5] ? +m[5] : result.length;
    let currentRun = nextLevel - result.length + 1;
    let currentStep = +m[2] - result[result.length - 1];
    let repeating = m[1] != null;
    if(repeating) {
      for(let j = 0; j < mostRecentRun - 1 && result.length < nextLevel; j++)
        result.push(result[result.length - 1]);
    }
    while(result.length < nextLevel) {
      if(repeating) {
        let nextValue = result[result.length - 1] + mostRecentStep;
        for(let j = 0; j < mostRecentRun && result.length < nextLevel; j++)
          result.push(nextValue);
      } else {
        result.push(result[result.length - 1]);
      }
    }
    result.push(+m[2]);
    mostRecentRun = currentRun;
    mostRecentStep = currentStep;
  }
  return result;
};

/*
 * Returns an object that contains all the choices for #name# previously
 * defined for this rule set via addChoice.
 */
OSRIC.getChoices = function(name) {
  return this.choices[name == 'classs' ? 'levels' : name];
};

/*
 * Returns the dictionary of attribute formats associated with character sheet
 * format #viewer# in #rules#.
 */
OSRIC.getFormats = SRD35.getFormats;

/* Returns an ObjectViewer loaded with the available character sheet formats. */
OSRIC.createViewers = SRD35.createViewers;

/*
 * Returns the list of editing elements needed by #choiceRules# to add a #type#
 * item to #rules#.
 */
OSRIC.choiceEditorElements = function(rules, type) {
  let result = [];
  if(type == 'Armor')
    result.push(
      ['AC', 'AC Bonus', 'select-one',
       [0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10]],
      ['Move', 'Max Movement', 'select-one', [120, 90, 60]]
    );
  else if(type == 'Class')
    result.push(
      ['Require', 'Prerequisites', 'text', [40]],
      ['Experience', 'Experience Required', 'text', [40]],
      ['HitDie', 'Hit Dice', 'text', [15]],
      ['THAC10', 'To Hit AC 10', 'text', [40]],
      ['Breath', 'Breath Save', 'text', [20]],
      ['Death', 'Death Save', 'text', [20]],
      ['Petrification', 'Petrification Save', 'text', [20]],
      ['Spell', 'Spell Save', 'text', [20]],
      ['Wand', 'Wand Save', 'text', [20]],
      ['Features', 'Features', 'text', [40]],
      ['WeaponProficiency', 'Weapon Proficiency', 'text', [20]],
      ['NonproficientPenalty', 'Penalty for Non-Proficiency', 'select-one', [-5, -4, -3, -2, -1, 0]],
      ['SpellSlots', 'Spell Slots', 'text', [40]]
    );
  else if(type == 'Feature')
    result.push(
      ['Section', 'Section', 'text', [40]],
      ['Note', 'Note', 'text', [60]]
    );
  else if(type == 'Language')
    result.push(
      // empty
    );
  else if(type == 'Race')
    result.push(
      ['Require', 'Prerequisite', 'text', [40]],
      ['Features', 'Features', 'text', [40]],
      ['Languages', 'Languages', 'text', [30]]
    );
  else if(type == 'Shield')
    result.push(
      ['AC', 'AC Bonus', 'select-one',
       [0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10]]
    );
  else if(type == 'Spell')
    result.push(
      ['School', 'Type', 'select-one', QuilvynUtils.getKeys(rules.getChoices('schools'))],
      ['Level', 'Caster Group and Level', 'text', [15]],
      ['Description', 'Description', 'text', [60]]
    );
  else if(type == 'Weapon') {
    let zeroToOneFifty =
     [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
    result.push(
      ['Category', 'Category', 'select-one',
       ['Unarmed', 'Light', 'One-Handed', 'Two-Handed', 'Ranged']],
      ['Damage', 'Damage', 'select-one',
       QuilvynUtils.getKeys(SRD35.LARGE_DAMAGE)],
      ['Range', 'Range in Feet', 'select-one', zeroToOneFifty]
    );
  }
  return result;
};

/* Returns the elements in a basic OSRIC character editor. */
OSRIC.initialEditorElements = function() {
  let abilityChoices = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
  ];
  let editorElements = [
    ['name', 'Name', 'text', [20]],
    ['imageUrl', 'Image URL', 'text', [20]],
    ['strength', 'Strength', 'select-one', abilityChoices],
    ['extraStrength', 'Extra Strength', 'text', [4, '(\\+?[0-9]+)?']],
    ['dexterity', 'Dexterity', 'select-one', abilityChoices],
    ['constitution', 'Constitution', 'select-one', abilityChoices],
    ['intelligence', 'Intelligence', 'select-one', abilityChoices],
    ['wisdom', 'Wisdom', 'select-one', abilityChoices],
    ['charisma', 'Charisma', 'select-one', abilityChoices],
    ['gender', 'Gender', 'text', [10]],
    ['race', 'Race', 'select-one', 'races'],
    ['experiencePoints', 'Experience', 'bag', 'levels'],
    ['alignment', 'Alignment', 'select-one', 'alignments'],
    ['origin', 'Origin', 'text', [20]],
    ['player', 'Player', 'text', [20]],
    ['languages', 'Languages', 'set', 'languages'],
    ['hitPoints', 'Hit Points', 'text', [4, '(\\+?\\d+)']],
    ['armor', 'Armor', 'select-one', 'armors'],
    ['shield', 'Shield', 'select-one', 'shields'],
    ['weapons', 'Weapons', 'setbag', 'weapons'],
    ['weaponProficiency', 'Weapon Proficiency', 'set', 'weapons'],
    ['weaponSpecialization', 'Specialization', 'select-one',
     ['None'].concat(QuilvynUtils.getKeys(OSRIC.WEAPONS))],
    ['doubleSpecialization', '', 'checkbox', ['Doubled']],
    ['spells', 'Spells', 'fset', 'spells'],
    ['scrolls', 'Scrolls', 'bag', 'spells'],
    ['notes', 'Notes', 'textarea', [40,10]],
    ['hiddenNotes', 'Hidden Notes', 'textarea', [40,10]]
  ];
  return editorElements;
};

/* Sets #attributes#'s #attribute# attribute to a random value. */
OSRIC.randomizeOneAttribute = function(attributes, attribute) {
  let attr;
  let attrs;
  let choices;
  let howMany;
  let matchInfo;
  if(attribute == 'armor') {
    attrs = this.applyRules(attributes);
    choices = [];
    for(attr in this.getChoices('armors')) {
      if(attr == 'None' ||
         attrs['features.Armor Proficiency (All)'] != null ||
         attrs['features.Armor Proficiency (' + attr + ')'] != null) {
        choices.push(attr);
      }
    }
    attributes.armor = choices.length == 0 ? 'None' :
      choices[QuilvynUtils.random(0, choices.length - 1)];
  } else if(attribute == 'hitPoints') {
    // Differs from 3.5 in that per-class level is computed, not chosen,
    // characters don't automatically get full HP at level 1, and most classes
    // have a cap on HD after which they receive fixed HP each level.
    attributes.hitPoints = 0;
    let allClasses = this.getChoices('levels');
    let classCount = 0;
    attrs = this.applyRules(attributes);
    for(let clas in allClasses) {
      if((attr = attrs['levels.' + clas]) != null)
        classCount++;
    }
    if(attributes.race == 'Human')
      classCount = 1; // Dual class HD aren't divided
    for(let clas in allClasses) {
      if((attr = attrs['levels.' + clas]) == null)
        continue;
      let hitDie = QuilvynUtils.getAttrValueArray(allClasses[clas], 'HitDie');
      matchInfo = hitDie[0].match(/(^|d)(\d+)$/);
      let sides = matchInfo == null ? 6 : (matchInfo[2] * 1);
      for( ; attr > hitDie[1]; attr--)
        attributes.hitPoints += Math.floor(hitDie[2] / classCount);
      for( ; attr > 0; attr--)
        attributes.hitPoints +=
          Math.floor(QuilvynUtils.random(1, sides) / classCount);
      if((hitDie[0] + '').startsWith('2'))
        attributes.hitPoints +=
          Math.floor(QuilvynUtils.random(1, sides) / classCount);
    }
  } else if(attribute == 'levels') {
    let classes = this.getChoices('levels');
    let classAttrSet = false;
    for(attr in classes) {
      if('levels.' + attr in attributes)
        classAttrSet = true;
    }
    if(!classAttrSet) {
      // Add a random class of level 1..4
      attributes['levels.' + QuilvynUtils.randomKey(classes)] =
        QuilvynUtils.random(1, 4);
    }
    for(attr in classes) {
      if(!('levels.' + attr in attributes))
        continue;
      // Calculate experience needed for this and prior levels to assign a
      // random experience value that will yield this level.
      attrs = this.applyRules(attributes);
      let max = attrs['experiencePoints.' + attr + '.1'];
      let min;
      do {
        attributes['levels.' + attr]--;
        attrs = this.applyRules(attributes);
        min = attrs['experiencePoints.' + attr + '.1'];
      } while(min == '-');
      max = max != '-' ? max - 1 : (min + 1);
      delete attributes['levels.' + attr];
      attributes['experiencePoints.' + attr] = QuilvynUtils.random(min, max);
    }
  } else if(attribute == 'proficiencies') {
    // Weapon proficiencies
    attrs = this.applyRules(attributes);
    choices = [];
    howMany = attrs.weaponProficiencyCount;
    for(attr in this.getChoices('weapons')) {
      if(attrs['weaponProficiency.' + attr] != null)
        howMany--;
      else
        choices.push(attr);
    }
    for( ; howMany > 0; howMany--) {
      let which = QuilvynUtils.random(0, choices.length - 1);
      attributes['weaponProficiency.' + choices[which]] = 1;
      choices = choices.slice(0, which).concat(choices.slice(which + 1));
    }
  } else if(attribute == 'shield') {
    attrs = this.applyRules(attributes);
    choices = [];
    for(attr in this.getChoices('shields')) {
      if(attr == 'None' ||
         attrs['features.Shield Proficiency (All)'] != null ||
         attrs['features.Shield Proficiency (' + attr + ')'] != null) {
        choices.push(attr);
      }
    }
    attributes.shield = choices.length == 0 ? 'None' :
      choices[QuilvynUtils.random(0, choices.length - 1)];
  } else if(attribute == 'skills') {
    // Nonweapon proficiencies
    attrs = this.applyRules(attributes);
    choices = [];
    howMany = attrs.nonweaponProficiencyCount || 0;
    let allSkills = this.getChoices('skills');
    for(attr in allSkills) {
      if(!allSkills[attr].match(/Ability/))
        continue; // Thief skill
      if(attributes['skills.' + attr] != null)
        howMany -= attrs['skills.' + attr];
      else
        choices.push(attr);
    }
    for( ; howMany > 0; howMany--) {
      let which = QuilvynUtils.random(0, choices.length - 1);
      attributes['skills.' + choices[which]] = 1;
      choices = choices.slice(0, which).concat(choices.slice(which + 1));
    }
    // Thief skills
    choices = [];
    howMany = attrs.skillPoints || 0;
    for(attr in allSkills) {
      if(allSkills[attr].match(/Ability/))
        continue; // Nonweapon proficiency
      if(attributes['skills.' + attr] != null)
        howMany -= attrs['skills.' + attr];
      choices.push(attr);
    }
    for( ; howMany > 0; howMany--) {
      let which = QuilvynUtils.random(0, choices.length - 1);
      if(!attributes['skills.' + choices[which]])
        attributes['skills.' + choices[which]] = 0;
      attributes['skills.' + choices[which]]++;
    }
  } else if(attribute == 'weapons') {
    howMany = 3;
    attrs = this.applyRules(attributes);
    choices = [];
    for(attr in this.getChoices('weapons')) {
      if(attrs['weapons.' + attr] != null) {
        howMany--;
      } else if(attrs['weaponProficiency.' + attr] != null) {
        choices.push(attr);
      }
    }
    if(howMany > choices.length)
      howMany = choices.length;
    for(let i = 0; i < howMany; i++) {
      let index = QuilvynUtils.random(0, choices.length - 1);
      attributes['weapons.' + choices[index]] = 1;
      choices.splice(index, 1);
    }
  } else {
    SRD35.randomizeOneAttribute.apply(this, [attributes, attribute]);
  }
};

/* Fixes as many validation errors in #attributes# as possible. */
OSRIC.makeValid = SRD35.makeValid;

/* Returns an array of plugins upon which this one depends. */
OSRIC.getPlugins = function() {
  return [SRD35];
};

/* Returns HTML body content for user notes associated with this rule set. */
OSRIC.ruleNotes = function() {
  return '' +
    '<h2>Quilvyn OSRIC Rule Set Notes</h2>\n' +
    '<p>\n' +
    'Quilvyn OSRIC Rule Set Version ' + OSRIC.VERSION + '\n' +
    '</p>\n' +
    '<h3>Usage Notes</h3>\n' +
    '<ul>\n' +
    '  <li>\n' +
    '  For convenience, Quilvyn reports THAC0 values for OSRIC characters. It' +
    '  also reports THAC10 ("To Hit Armor Class 10"), which can be more' +
    '  useful with characters who need a 20 to hit AC 0.\n'+
    '  </li><li>\n' +
    '  The OSRIC rules discuss illusionist scrolls, but do not give the' +
    '  minimum level required to create them. Quilvyn uses the 1E PHB limit' +
    '  of level 10.\n' +
    '  </li><li>\n' +
    '  The OSRIC rules mention that Magic Users of levels 7 through 10 can' +
    '  create scrolls and potions only with the aid of an alchemist; at level' +
    '  11 they can do such crafting unaided.\n' +
    '  </li><li>\n' +
    '  The OSRIC rules are unclear as to whether or not the Fighting the' +
    '  Unskilled feature applies to Paladins and Rangers. Quilvyn assumes' +
    '  that it does.\n' +
    '  </li><li>\n' +
    '  Homebrew choices are described in <a href="plugins/homebrew-osric.html">' +
    '  a separate document</a>.\n' +
    '  </li>\n' +
    '</ul>\n' +
    '\n' +
    '<h3>Limitations</h3>\n' +
    '<ul>\n' +
    '  <li>\n' +
    '  Quilvyn does not note racial restrictions on class and level.\n' +
    '  </li><li>\n' +
    '  Quilvyn does not note class restrictions on weapon choice.\n' +
    '  </li><li>\n' +
    '  Support for character levels 21+ is incomplete.\n' +
    '  </li><li>\n' +
    '  Minimum levels for building strongholds and attracting followers are' +
    '  not reported.\n' +
    '  </li><li>\n' +
    '  Quilvyn does not note Halfling characters with a strength of 18, nor' +
    '  Elf characters with a constitution of 18.\n' +
    '  </li><li>\n' +
    '  Quilvyn does not report the chance of extraordinary success on' +
    '  tests for characters with strength 18/91 and higher.\n' +
    '  </li>\n' +
    '</ul>\n' +
    '<h3>Copyrights and Licensing</h3>\n' +
    '<p>\n' +
    'Quilvyn\'s OSRIC rule set uses Open Game Content released by Stuart ' +
    'Marshall, Inc. under the Open Game License. OSRIC copyright 2006-2008 ' +
    'by Stuart Marshall, adapting material prepared by Matthew J. Finch, ' +
    'based on the System Reference Document, inspired by the works of E. ' +
    'Gary Gygax, Dave Arneson, and many others.\n' +
    '</p><p>\n' +
    'System Reference Document material is Open Game Content released by ' +
    'Wizards of the Coast under the Open Game License. System Reference ' +
    'Document Copyright 2000-2003, Wizards of the Coast, Inc.; Authors ' +
    'Jonathan Tweet, Monte Cook, Skip Williams, Rich Baker, Andy Collins, ' +
    'David Noonan, Rich Redman, Bruce R. Cordell, John D. Rateliff, Thomas ' +
    'Reid, James Wyatt, based on original material by E. Gary Gygax and Dave ' +
    'Arneson.\n' +
    '</p><p>\n' +
    'Open Game License v 1.0a Copyright 2000, Wizards of the Coast, LLC. You ' +
    'should have received a copy of the Open Game License with this program; ' +
    'if not, you can obtain one from ' +
    'https://media.wizards.com/2016/downloads/SRD-OGL_V1.1.pdf. ' +
    '<a href="plugins/ogl-osric.txt">Click here</a> to see the license.<br/>\n'+
    '</p>\n';
};
