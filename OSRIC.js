/*
Copyright 2021, James J. Hayes

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

  var rules = new QuilvynRules('OSRIC', OSRIC.VERSION);

  rules.defineChoice('choices', OSRIC.CHOICES);
  rules.choiceEditorElements = OSRIC.choiceEditorElements;
  rules.choiceRules = OSRIC.choiceRules;
  rules.editorElements = OSRIC.initialEditorElements();
  rules.getFormats = SRD35.getFormats;
  rules.getPlugins = OSRIC.getPlugins;
  rules.makeValid = SRD35.makeValid;
  rules.randomizeOneAttribute = OSRIC.randomizeOneAttribute;
  rules.defineChoice('random', OSRIC.RANDOMIZABLE_ATTRIBUTES);
  rules.ruleNotes = OSRIC.ruleNotes;

  SRD35.createViewers(rules, SRD35.VIEWERS);
  rules.defineChoice('extras', 'feats', 'sanityNotes', 'validationNotes');
  rules.defineChoice
    ('preset', 'race:Race,select-one,races','levels:Class Levels,bag,levels');

  OSRIC.abilityRules(rules);
  OSRIC.combatRules(rules, OSRIC.ARMORS, OSRIC.SHIELDS, OSRIC.WEAPONS);
  OSRIC.magicRules(rules, OSRIC.SCHOOLS, OSRIC.SPELLS);
  OSRIC.talentRules
    (rules, OSRIC.FEATURES, OSRIC.GOODIES, OSRIC.LANGUAGES, OSRIC.SKILLS);
  OSRIC.identityRules(rules, OSRIC.ALIGNMENTS, OSRIC.CLASSES, OSRIC.RACES);


  // Add additional elements to sheet
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
  rules.defineSheetElement('EquipmentInfo', 'Combat Notes', null);
  rules.defineSheetElement('Weapon Proficiency Count', 'EquipmentInfo/');
  rules.defineSheetElement
    ('Weapon Proficiency', 'EquipmentInfo/', null, '; ');
  rules.defineSheetElement('Nonweapon Proficiency Count', 'SkillStats');
  rules.defineSheetElement
    ('Thac0Info', 'AttackInfo', '<b>THAC0 Melee/Ranged</b>: %V', '/');
  rules.defineSheetElement('Thac0Melee', 'Thac0Info/', '%V');
  rules.defineSheetElement('Thac0Ranged', 'Thac0Info/', '%V');
  rules.defineSheetElement
    ('Thac10Info', 'AttackInfo', '<b>THAC10 Melee/Ranged</b>: %V', '/');
  rules.defineSheetElement('Thac10Melee', 'Thac10Info/', '%V');
  rules.defineSheetElement('Thac10Ranged', 'Thac10Info/', '%V');
  rules.defineSheetElement('AttackInfo');
  rules.defineSheetElement('Turn Undead', 'Combat Notes', null);
  rules.defineSheetElement
    ('Understand Spell', 'Spell Slots', '<b>%N</b>: %V%');
  rules.defineSheetElement('Maximum Spells Per Level', 'Spell Slots');

  Quilvyn.addRuleSet(rules);

}

OSRIC.VERSION = '2.3.1.0';

/* List of items handled by choiceRules method. */
OSRIC.CHOICES = [
  'Alignment', 'Armor', 'Class', 'Feature', 'Language', 'Race', 'School',
  'Shield', 'Spell', 'Weapon'
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
  'None':
    'AC=0 Move=120 Weight=0 ' +
    'Skill="+10% Climb Walls/+5% Hide In Shadows/+10% Move Silently/+5% Pick Pockets"',
  'Banded':'AC=6 Move=90 Weight=35',
  'Chain':
    'AC=5 Move=90 Weight=30 ' +
    'Skill="-25% Climb Walls/-10% Find Traps/-10% Hear Noise/-15% Hide In Shadows/-15% Move Silently/-10% Open Locks/-25% Pick Pockets"',
  'Elven Chain':
    'AC=5 Move=120 Weight=15 ' +
    'Skill="-20% Climb Walls/-5% Find Traps/-5% Hear Noise/-10% Hide In Shadows/-10% Move Silently/-5% Open Locks/-20% Pick Pockets"',
  'Leather':'AC=2 Move=120 Weight=15',
  'Padded':
    'AC=2 Move=90 Weight=10 ' +
    'Skill="-30% Climb Walls/-10% Find Traps/-10% Hear Noise/-20% Hide In Shadows/-20% Move Silently/-10% Open Locks/-30% Pick Pockets"',
  'Plate':'AC=7 Move=60 Weight=45',
  'Ring':'AC=3 Move=90 Weight=35',
  'Scale Mail':'AC=4 Move=60 Weight=40',
  'Splint':'AC=6 Move=60 Weight=40',
  'Studded Leather':
    'AC=3 Move=90 Weight=20 ' +
    'Skill="-30% Climb Walls/-10% Find Traps/-10% Hear Noise/-20% Hide In Shadows/-20% Move Silently/-10% Open Locks/-30% Pick Pockets"'
};
OSRIC.CLASSES = {
  'Assassin':
    'Require=' +
      '"alignment =~ \'Evil\'","constitution >= 6","dexterity >= 12",' +
      '"intelligence >= 11","strength >= 12","wisdom >= 6" ' +
    'HitDie=d6,15,1 Attack=-1,2,4,+1@9 WeaponProficiency=3,4,3 ' +
    'Breath=16,1,4 Death=13,1,4 Petrification=12,1,4 Spell=15,2,4 Wand=14,2,4 '+
    'Features=' +
      '"1:Armor Proficiency (Leather/Studded Leather)",' +
      '"1:Shield Proficiency (All)",' +
      '1:Assassination,1:Backstab,"1:Delayed Henchmen",1:Disguise,' +
      '"1:Poison Use","3:Thief Skills","4:Limited Henchmen Classes",' +
      '"intelligence >= 15 ? 9:Bonus Languages",' +
      '"12:Read Scrolls" ' +
    'Experience=0,1.6,3,5.75,12.25,24.75,50,99,200.5,300,400,600,750,1000,1500',
  'Cleric':
    'Require=' +
      '"charisma >= 6","constitution >= 6","intelligence >= 6",' +
      '"strength >= 6","wisdom >= 9" ' +
    'HitDie=d8,9,2 Attack=0,2,3,-1@19 WeaponProficiency=2,3,3 ' +
    'Breath=16,1,3 Death=10,1,3 Petrification=13,1,3 Spell=15,1,3 Wand=14,1,3 '+
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"1:Turn Undead",' +
      '"wisdom >= 16 ? 1:Bonus Cleric Experience",' +
      '"wisdom >= 13 ? 1:Bonus Cleric Spells",' +
      '"wisdom <= 12 ? 1:Cleric Spell Failure" ' +
    'Experience=' +
      '0,1.55,2.9,6,13.25,27,55,110,220,450,675,900,1125,1350,1575,1800,' +
      '2025,2250,2475,2700,2925,3150,3375,3600 ' +
    'CasterLevelDivine=levels.Cleric ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'C1:1=1;2=2;4=3;9=4;11=5;12=6;15=7;17=8;19=9,' +
      'C2:3=1;4=2;5=3;9=4;12=5;13=6;15=7;17=8;19=9,' +
      'C3:5=1;6=2;8=3;11=4;12=5;13=6;15=7;17=8;19=9,' +
      'C4:7=1;8=2;10=3;13=4;14=5;16=6;18=7;20=8;21=9,' +
      'C5:9=1;10=2;14=3;15=4;16=5;18=6;20=7;21=8;22=9,' +
      'C6:11=1;12=2;16=3;18=4;20=5;21=6;23=7;24=8;26=9,' +
      'C7:16=1;19=2;22=3;25=4;27=5;28=6;29=7',
  'Druid':
    'Require=' +
      '"alignment =~ \'Neutral\'","charisma >= 15","constitution >= 6",' +
      '"dexterity >= 6","intelligence >= 6","strength >= 6","wisdom >= 12" ' +
    'Require=' +
      '"alignment =~ \'Neutral\'","charisma >= 15","wisdom >= 12" ' +
    'HitDie=d8,14,1 Attack=0,2,3,- WeaponProficiency=2,3,4 ' +
    'Breath=16,1,3 Death=10,1,3 Petrification=13,1,3 Spell=15,1,3 Wand=14,1,3 '+
    'Features=' +
      '"1:Armor Proficiency (Leather)","1:Shield Proficiency (All)",' +
      '"charisma >= 16/wisdom >= 16 ? 1:Bonus Druid Experience",' +
      '"wisdom >= 13 ? 1:Bonus Druid Spells",' +
      '"1:Resist Fire","1:Resist Lightning","3:Druid\'s Knowledge",' +
      '"3:Wilderness Movement","7:Immunity To Fey Charm",' +
      '7:Shapeshift ' +
    'Experience=0,2,4,8,12,20,35,60,90,125,200,300,750,1500 ' +
    'CasterLevelDivine=levels.Druid ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'D1:1=2;3=3;4=4;9=5;13=6,' +
      'D2:2=1;3=2;5=3;7=4;11=5;14=6,' +
      'D3:3=1;4=2;7=3;12=4;13=5;14=6,' +
      'D4:6=1;8=2;10=3;12=4;13=5;14=6,' +
      'D5:9=1;10=2;12=3;13=4;14=5,' +
      'D6:11=1;12=2;13=3;14=4,' +
      'D7:12=1;13=2;14=3',
  'Fighter':
    'Require=' +
      '"charisma >= 6","constitution >= 7","dexterity >= 6","strength >= 9",' +
      '"wisdom >= 6" ' +
    'HitDie=d10,9,3 Attack=0,1,1,- WeaponProficiency=4,2,2 ' +
    'Breath=17,1.5,2 Death=14,1.5,2 Petrification=15,1.5,2 Spell=17,1.5,2 Wand=16,1.5,2 ' +
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"strength >= 16 ? 1:Bonus Fighter Experience",' +
      '"1:Fighting The Unskilled","7:Bonus Attacks" ' +
    'Experience=' +
      '0,1.9,4.25,7.75,16,35,75,125,250,500,750,1000,1250,1500,1750,2000,' +
      '2250,2500,2750,3000,3250,3500,3750,4000',
  'Illusionist':
    'Require=' +
      '"charisma >= 6","dexterity >= 16","intelligence >= 15",' +
      '"strength >= 6","wisdom >= 6" ' +
    'HitDie=d4,10,1 Attack=-1,2,5,- WeaponProficiency=1,5,3 ' +
    'Breath=15,2,5 Death=14,1.5,5 Petrification=13,2,5 Spell=12,2,5 Wand=11,2,5 '+
    'Features=' +
      '"10:Eldritch Craft" ' +
    'CasterLevelArcane=levels.Illusionist ' +
    'Experience=' +
      '0,2.5,4.75,9,18,35,60.25,95,144.5,220,440,660,880,1100,1320,1540,' +
      '1760,1980,2200,2420,2640,3080,3300 ' +
    'SpellAbility=intelligence ' +
    'SpellSlots=' +
      'I1:1=1;2=2;4=3;5=4;9=5;17=6,' +
      'I2:3=1;4=2;5=3;10=4;12=5;18=6,' +
      'I3:5=1;6=2;9=3;12=4;16=5;20=6,' +
      'I4:7=1;8=2;11=3;15=4;19=5;21=6,' +
      'I5:10=1;11=2;16=3;18=4;19=5;23=6,' +
      'I6:12=1;13=2;17=3;20=4;22=5;24=6,' +
      'I7:14=1;15=2;21=3;23=4;24=5',
  'Magic User':
    'Require=' +
      '"charisma >= 6","constitution >= 6","dexterity >= 6",' +
      '"intelligence >= 9","wisdom >= 6" ' +
    'HitDie=d4,11,1 Attack=-1,2,5,- WeaponProficiency=1,5,5 ' +
    'Breath=15,2,5 Death=14,1.5,5 Petrification=13,2,5 Spell=12,2,5 ' +
    'Wand=11,2,5 '+
    'Features=' +
      '"intelligence >= 16 ? 1:Bonus Magic User Experience",' +
      '"7:Eldritch Craft","12:Eldritch Power" ' +
    'Experience=' +
      '0,2.4,4.8,10.25,22,40,60,80,140,250,375,750,1125,1500,1875,2250,' +
      '2625,3000,3375,3750,4125,4500,4875,5250 ' +
    'CasterLevelArcane="levels.Magic User" ' +
    'SpellAbility=intelligence ' +
    'SpellSlots=' +
      'M1:1=1;2=2;4=3;5=4;12=5;21=6,' +
      'M2:3=1;4=2;6=3;9=4;13=5;21=6,' +
      'M3:5=1;6=2;8=3;11=4;14=5;22=6,' +
      'M4:7=1;8=2;11=3;14=4;17=5;22=6,' +
      'M5:9=1;10=2;11=3;14=4;17=5;23=6,' +
      'M6:12=1;13=2;15=3;17=4;19=5;23=6,' +
      'M7:14=1;15=2;17=3;19=4;22=5;24=6,' +
      'M8:16=1;17=2;19=3;21=4;24=5,' +
      'M9:18=1;20=2;23=3',
  'Paladin':
    'Require=' +
      '"alignment == \'Lawful Good\'","charisma >= 17","constitution >= 9",' +
      '"dexterity >= 6","intelligence >= 9","strength >= 12","wisdom >= 13" ' +
    'HitDie=d10,9,3 Attack=0,1,1,- WeaponProficiency=3,2,2 ' +
    'Breath=15,1.5,2 Death=12,1.5,2 Petrification=13,1.5,2 Spell=15,1.5,2 '+
    'Wand=14,1.5,2 ' +
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"strength >= 16/wisdom >= 16 ? 1:Bonus Paladin Experience",' +
      '"1:Cure Disease","1:Detect Evil",1:Discriminating,"1:Divine Health",' +
      '"1:Fighting The Unskilled","1:Improved Saving Throws",' +
      '"1:Lay On Hands",1:Non-Materialist,1:Philanthropist,' +
      '"1:Protection From Evil","3:Turn Undead","4:Summon Warhorse",' +
      '"8:Bonus Attacks" ' +
    'Experience=' +
      '0,2.55,5.5,12.5,25,45,95,175,325,600,1000,1350,1700,2050,2400,' +
      '2750,3100,3450,3800,4150,4500,4850,5200,5550 ' +
    'CasterLevelDivine="levels.Paladin >= 9 ? levels.Paladin - 8 : null" ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'C1:9=1;10=2;14=3;21=4,' +
      'C2:11=1;12=2;16=3;22=4,' +
      'C3:13=1;17=2;18=3;23=4,' +
      'C4:15=1;19=2;20=3;24=4',
  'Ranger':
    'Require=' +
      '"alignment =~ \'Good\'","charisma >= 6","constitution >= 14",' +
      '"dexterity >= 6","intelligence >= 13","strength >= 13","wisdom >= 14" ' +
    'HitDie=2d8,10,2 Attack=0,1,1,- WeaponProficiency=3,2,2 ' +
    'Breath=17,1.5,2 Death=14,1.5,2 Petrification=15,1.5,2 Spell=17,1.5,2 ' +
    'Wand=16,1.5,2 ' +
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"strength >= 16/intelligence >= 16/wisdom >= 16 ? 1:Bonus Ranger Experience",' +
      '"1:Alert Against Surprise","1:Damage Bonus","1:Delayed Henchmen",' +
      '"1:Fighting The Unskilled",1:Loner,1:Selective,1:Tracking,' +
      '"1:Travel Light","8:Bonus Attacks","10:Scrying Device Use" ' +
    'Experience=' +
      '0,2.25,4.5,9.5,20,40,90,150,225,325,650,975,1300,1625,1950,2275,' +
      '2600,2925,3250,3575,3900,4225,4550,4875 ' +
    'CasterLevelArcane=' +
      '"levels.Ranger >= 8 ? Math.floor((levels.Ranger - 6) / 2) : null" ' +
    'CasterLevelDivine=' +
      '"levels.Ranger >= 9 ? Math.floor((levels.Ranger - 6) / 2) : null" ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'D1:8=1;10=2;18=3;23=4,' +
      'D2:12=1;14=2;20=3,' +
      'D3:16=1;17=2;22=3,' +
      'M1:9=1;11=2;19=3;24=4,' +
      'M2:13=1;15=2;21=3',
  'Thief':
    'Require=' +
      '"alignment =~ \'Neutral|Evil\'","dexterity >= 9" ' +
    'Require=' +
      '"alignment =~ \'Neutral|Evil\'","charisma >= 6","constitution >= 6",' +
      '"dexterity >= 9","intelligence >= 6","strength >= 6" ' +
    'HitDie=d6,10,2 Attack=-1,2,4,+1@9 WeaponProficiency=2,4,3 ' +
    'Breath=16,1,4 Death=13,1,4 Petrification=12,1,4 Spell=15,2,4 Wand=14,2,4 '+
    'Features=' +
      '"1:Armor Proficiency (Leather/Studded Leather)",' +
      '"dexterity >= 16 ? 1:Bonus Thief Experience",' +
      '1:Backstab,"1:Thief Skills","10:Read Scrolls" ' +
    'Experience=' +
      '0,1.25,2.5,5,10,20,40,70,110,160,220,440,660,880,1100,1320,1540,' +
      '1760,1980,2200,2420,2640,2860,3080'
};
OSRIC.FEATURES = {

  // Class
  'Alert Against Surprise':
    'Section=combat Note="Surprised 1in6, surprise 3in6"',
  'Assassination':
    'Section=combat Note="Strike kills surprised target %V% - 5%/2 foe levels"',
  'Backstab':
    'Section=combat Note="+4 melee attack, x%V damage when surprising"',
  'Bonus Attacks':'Section=combat Note="+%V attacks/rd"',
  'Bonus Cleric Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Bonus Cleric Spells':'Section=magic Note="%V"',
  'Bonus Druid Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Bonus Druid Spells':'Section=magic Note="%V"',
  'Bonus Fighter Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Bonus Languages':
    'Section=skill ' +
    'Note="Can learn %V additional choices from alignment languages, druidic, or thieves\' cant"',
  'Bonus Magic User Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Bonus Paladin Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Bonus Ranger Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Bonus Thief Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Cleric Spell Failure':'Section=magic Note="%V%"',
  'Cure Disease':'Section=magic Note="<i>Cure Disease</i> %V/wk"',
  'Damage Bonus':
    'Section=combat ' +
    'Note="+%V melee damage vs. evil humanoids and giantish foes"',
  'Delayed Henchmen':
    'Section=ability Note="May not hire henchmen until level %V"',
  'Detect Evil':'Section=magic Note="R60\' <i>Detect Evil</i> at will"',
  'Discriminating':
    'Section=feature Note="Must not associate w/non-good characters"',
  'Disguise':'Section=feature Note="92%+ successful disguise"',
  'Divine Health':'Section=save Note="Immune to disease"',
  'Double Specialization':
    'Section=combat Note="+3 %V Attack Modifier/+3 %V Damage Modifier"',
  "Druid's Knowledge":
    'Section=feature ' +
    'Note="Identify plant and animal types, determine water purity"',
  'Eldritch Craft':
    'Section=magic ' +
    'Note="May create magical potions and scrolls and recharge rods, staves, and wands%1"',
  'Eldritch Power':
    'Section=magic ' +
    'Note="May create magical items via <i>Enchant An Item</i> spell"',
  'Fighting The Unskilled':
    'Section=combat Note="%V attacks/rd vs. creatures with w/HD less than 1d8"',
  'Immunity To Fey Charm':'Section=save Note="Immune to fey enchantment"',
  'Lay On Hands':'Section=magic Note="Touch heals %V HP 1/dy"',
  'Limited Henchmen Classes':'Section=ability Note="Henchmen must be %V"',
  'Loner':'Section=feature Note="Will not work with more than 2 other rangers"',
  'Non-Materialist':
    'Section=feature Note="Owns at most 10 magic items w/1 armor suit and 1 shield"',
  'Philanthropist':
    'Section=feature ' +
    'Note="Must donate 10% of income plus 100% after expenses to LG causes"',
  'Poison Use':
    'Section=combat ' +
    'Note="Familiar with ingested poisons and poisoned weapon use"',
  'Protection From Evil':
    'Section=magic Note="Continuous <i>Protection From Evil</i> 10\' radius"',
  'Read Scrolls':'Section=magic Note="%V% cast arcane spell from scroll"',
  'Resist Fire':'Section=save Note="+2 vs. fire"',
  'Resist Lightning':'Section=save Note="+2 vs. lightning"',
  'Scrying Device Use':'Section=magic Note="May use scrying magic items"',
  'Selective':'Section=feature Note="Must employ only good henchmen"',
  'Shapeshift':
    'Section=magic Note="Change into natural animal 3/dy, healing 1d6x10% HP"',
  'Summon Warhorse':
    'Section=feature Note="Call warhorse w/enhanced features"',
  'Thief Skills':
    'Section=skill ' +
    'Note="Climb Walls, Find Traps, Hear Noise, Hide In Shadows, Move Silently, Open Locks, Pick Pockets, Read Languages"',
  'Tracking':
    'Section=feature Note="90% rural, 65%+ urban or dungeon creature tracking"',
  'Travel Light':
    'Section=feature Note="Will not possess more than can be carried"',
  'Turn Undead':
    'Section=combat ' +
    'Note="2d6 undead turned, destroyed (good) or controlled (evil)"',
  'Weapon Specialization':
     'Section=combat ' +
    'Note="+%1 %V Attack Modifier/+%2 %V Damage Modifier/+%3 attacks/rd"',
  'Wilderness Movement':
     'Section=feature Note="Normal, untrackable move through undergrowth"',

  // Race
  'Bow Precision':'Section=combat Note="+1 attack w/bows"',
  'Burrow Tongue':'Section=feature Note="Speak w/burrowing animals"',
  'Deadly Aim':'Section=combat Note="+3 attack w/bows and slings"',
  'Detect Construction':
    'Section=feature Note="R10\' 75% Detect new construction"',
  'Detect Hazard':
    'Section=feature Note="R10\' 70% Detect unsafe wall, ceiling, floor"',
  'Detect Secret Doors':
    'Section=feature Note="1in6 passing, 2in6 searching, 3in6 concealed"',
  'Detect Sliding':'Section=feature Note="R10\' 66% Detect sliding walls"',
  'Detect Slope':'Section=feature Note="R10\' %V% Detect slope and grade"',
  'Detect Traps':'Section=feature Note="R10\' 50% Detect stonework traps"',
  'Determine Depth':
    'Section=feature Note="%V% Determine approximate depth underground"',
  'Determine Direction':
    'Section=feature Note="50% Determine direction underground"',
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
  'Resist Charm':'Section=save Note="%V% vs. charm"',
  'Resist Magic':'Section=save Note="+%V vs. spells and wands"',
  'Resist Poison':'Section=save Note="+%V vs. poison"',
  'Resist Sleep':'Section=save Note="%V% vs. sleep"',
  'Slow':'Section=ability Note="-30 Speed"',
  'Stealthy':
    'Section=combat ' +
    'Note="Surprise 4in6 when traveling quietly, 2in6 when opening doors"',
  'Sword Precision':
    'Section=combat Note="+1 attack w/Long Sword and Short Sword"'

};
OSRIC.GOODIES = {
  'Armor':
    'Pattern="([-+]\\d).*(?:armor(?:\\s+class)?|AC)|(?:armor(?:\\s+class)?|AC)\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=armorClass ' +
    'Section=combat Note="%V Armor Class"',
  'Breath':
    'Pattern="([-+]\\d)\\s+breath\\s+save|breath\\s+save\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=save.Breath ' +
    'Section=save Note="%V Breath"',
  'Charisma':
    'Pattern="([-+]\\d)\\s+cha(?:risma)?|cha(?:risma)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=charisma ' +
    'Section=ability Note="%V Charisma"',
  'Constitution':
    'Pattern="([-+]\\d)\\s+con(?:stitution)?|con(?:stitution)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=constitution ' +
    'Section=ability Note="%V Constitution"',
  'Death':
    'Pattern="([-+]\\d)\\s+death\\s+save|death\\s+save\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=save.Death ' +
    'Section=save Note="%V Death"',
  'Dexterity':
    'Pattern="([-+]\\d)\\s+dex(?:terity)?|dex(?:terity)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=dexterity ' +
    'Section=ability Note="%V Dexterity"',
  'Intelligence':
    'Pattern="([-+]\\d)\\s+int(?:elligence)?|int(?:elligence)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=intelligence ' +
    'Section=ability Note="%V Intelligence"',
  'Petrification':
    'Pattern="([-+]\\d)\\s+petrification\\s+save|petrification\\s+save\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=save.Petrification ' +
    'Section=save Note="%V Petrification"',
  'Protection':
    'Pattern="([-+]\\d).*protection|protection\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=armorClass ' +
    'Section=combat Note="%V Armor Class"',
  'Shield':
    'Pattern="([-+]\\d).*\\s+shield|shield\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=armorClass ' +
    'Section=combat Note="%V Armor Class"',
  'Speed':
    'Pattern="([-+]\\d+).*\\s+speed|speed\\s+([-+]\\d+)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=speed ' +
    'Section=ability Note="%V Speed"',
  'Spell':
    'Pattern="([-+]\\d)\\s+spell\\s+save|spell\\s+save\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=save.Spell ' +
    'Section=save Note="%V Spell"',
  'Strength':
    'Pattern="([-+]\\d)\\s+str(?:ength)?|str(?:ength)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=strength ' +
    'Section=ability Note="%V Strength"',
  'Wand':
    'Pattern="([-+]\\d)\\s+wand\\s+save|wand\\s+save\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="-$1 || -$2" ' +
    'Attribute=save.Wand ' +
    'Section=save Note="%V Wand"',
  'Wisdom':
    'Pattern="([-+]\\d)\\s+wis(?:dom)?|wis(?:dom)?\\s+([-+]\\d)" ' +
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
      '"1:Determine Depth","1:Dwarf Ability Adjustment","1:Dwarf Dodge",' +
      '"1:Dwarf Enmity",1:Infravision,"1:Resist Magic","1:Resist Poison",' +
      '"1:Detect Construction","1:Detect Sliding","1:Detect Slope",' +
      '"1:Detect Traps",1:Slow ' +
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
  'Necromancy':''
};
OSRIC.SHIELDS = {
  'None':'AC=0 Weight=0',
  'Large Shield':'AC=1 Weight=10',
  'Medium Shield':'AC=1 Weight=8',
  'Small Shield':'AC=1 Weight=5'
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
// To support class- and version-based differences in spell description, spell
// attributes may include values for Duration, Effect, and Range that are
// plugged into the $D, $E, and $R placeholders in the description text before
// any level-based variation ($L) is computed.
OSRIC.SPELLS = {
  'Aerial Servant':
    'School=Conjuration ' +
    'Level=C6 ' +
    'Description="R10\' Summoned servant fetches request within $L days"',
  'Affect Normal Fires':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="R$L5\' Change size of up to $E fire from candle flame to $E for $D" ' +
    'Duration="$L rd" ' +
    'Effect="1.5\' radius"',
  'Airy Water':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description="Water in 10\' radius around self breathable for $L tn"',
  'Alter Reality':
    'School=Illusion ' +
    'Level=I7 ' +
    'Description="Use <i>Phantasmal Force</i> to fulfill limited wish"',
  'Animal Friendship':
    'School=Enchantment ' +
    'Level=D1 ' +
    'Description="R10\' Recruit animal companion (save neg)"',
  'Animal Growth':
    'School=Alteration ' +
    'Level=D5,M5 ' +
    'Description="R$R Dbl (rev halve) size, HD, and damage of 8 animals for $D" ' +
    'Duration="$L rd" ' +
    'Range="60\'"',
  'Animal Growth D5':
    'Duration="$L2 rd" ' +
    'Range="80\'"',
  'Animal Summoning I':
    'School=Conjuration ' +
    'Level=D4 ' +
    'Description="R$R Draw 8 4 HD animals to assist" ' +
    'Range="$L120\'"',
  'Animal Summoning II':
    'School=Conjuration ' +
    'Level=D5 ' +
    'Description="R$R Draw 6 8 HD or 12 4 HD animals to assist" ' +
    'Range="$L180\'"',
  'Animal Summoning III':
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description="R$R Draw 4 16 HD, 8 8 HD, or 16 4 HD animals to assist" ' +
    'Range="$L240\'"',
  'Animate Dead':
    'School=Necromancy ' +
    'Level=C3,M5 ' +
    'Description="R10\' Animated humanoid remains totaling $L HD obey simple commands"',
  'Animate Object':
    'School=Alteration ' +
    'Level=C6 ' +
    'Description="R30\' Target object obeys simple commands for $L rd"',
  'Animate Rock':
    'School=Alteration ' +
    'Level=D7 ' +
    'Description="R40\' Target $L2\' cu rock obeys simple commands for $L rd"',
  'Anti-Animal Shell':
    'School=Abjuration ' +
    'Level=D6 ' +
    'Description="Self 10\' radius blocks animal matter for $L tn"',
  'Anti-Magic Shell':
    'School=Abjuration ' +
    'Level=M6 ' +
    'Description="$L5\' radius allows no magic inside, moves with self for $L tn"',
  'Anti-Plant Shell':
    'School=Abjuration ' +
    'Level=D5 ' +
    'Description="Self $R blocks plant matter for $L tn" ' +
    'Range="80\' radius"',
  'Antipathy/Sympathy':
    'School=Enchantment ' +
    'Level=M8 ' +
    'Description="R30\' $L10\' cu or object repels or attracts specified creature type or alignment for $L2 hr (save reduces effect)"',
  'Astral Spell':
    'School=Alteration ' +
    'Level=C7,I7,M9 ' +
    'Description="Self and $E others leave bodies to travel astral plane" ' +
    'Effect="5"',
  'Atonement':
    'School=Abjuration ' +
    'Level=C5 ' +
    'Description="Touched relieved of consequences of unwilling alignment violation"',
  'Audible Glamour':
    'School=Illusion ' +
    'Level=I1,M2 ' +
    'Description="R$L10plus60\' Sounds of ${(lvl-2)*4} shouting for $D (save disbelieve)" ' +
    'Duration="$L3 rd"',
  'Audible Glamour M2':
    'Duration="$L2 rd"',
  'Augury':
    'School=Divination ' +
    'Level=C2 ' +
    'Description="Self $Lplus70% determine weal or woe of action in next 3 tn"',
  'Barkskin':
    'School=Alteration ' +
    'Level=D2 ' +
    'Description="Touched $E for $Lplus4 rd" ' +
    'Effect="+1 AC, non-spell saves"',
  'Blade Barrier':
    'School=Evocation ' +
    'Level=C6 ' +
    'Description="R30\' Whirling blade wall 8d8 HP to passers for $L3 rd"',
  'Bless':
    'School=Conjuration ' +
    'Level=C1 ' +
    'Description="R60\' Unengaged allies in 50\' sq +1 attack and morale (rev foes -1) for 6 rds"',
  'Blindness':
    'School=Illusion ' +
    'Level=I2 ' +
    'Description="R$R Target blinded (save neg)" ' +
    'Range="30\'"',
  'Blink':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description="Self random teleport $E for $L rd" ' +
    'Effect="2\'/rd"',
  'Blur':
    'School=Illusion ' +
    'Level=I2 ' +
    'Description="Self +1 magical saves, foes -4 first attack, -2 thereafter for $Lplus3 rd"',
  'Burning Hands':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="Self $E of flame $L HP" ' +
    'Effect="3\' cone"',
  'Cacodemon':
    'School=Conjuration ' +
    'Level=M7 ' +
    'Description="R10\' Summon demon or devil"',
  'Call Lightning':
    'School=Alteration ' +
    'Level=D3 ' +
    'Description="R360\' Clouds release ${lvl+2}d8 (save half) 10\' bolt 1/tn for $L tn"',
  'Call Woodland Beings':
    'School=Conjuration ' +
    'Level=D4 ' +
    'Description="R$R Draw forest denizens to assist (save neg)" ' +
    'Range="$L30plus360\'"',
  'Change Self':
    'School=Illusion ' +
    'Level=I1 ' +
    'Description="Self take any humanoid appearance for 2d6+$L2 rd"',
  'Chant':
    'School=Conjuration ' +
    'Level=C2 ' +
    'Description="R30\' Allies +1 attack, damage, saves (foes -1) during chant"',
  'Chaos':
    'School=Enchantment ' +
    'Level=I5 ' +
    'Description="R$L5\' Creatures in 40\' sq unpredictable for $L rd (save neg)"',
  'Chariot Of Fire':
    'School=Evocation ' +
    'Level=D7 ' +
    'Description="R10\' Flaming chariot and horse pair (ea AC 2, HP 30) drive self and 8 others 240\'/rd, fly 480\'/rd for $D" ' +
    'Duration="$Lplus6 tn"',
  'Charm Monster':
    'School=Enchantment ' +
    'Level=M4 ' +
    'Description="R60\' Target 2d4 HD creatures treat self as trusted friend (save neg)"',
  'Charm Person Or Mammal':
    'School=Enchantment ' +
    'Level=D2 ' +
    'Description="R80\' Target mammal treats self as trusted friend (save neg)"',
  'Charm Person':
    'School=Enchantment ' +
    'Level=M1 ' +
    'Description="R120\' Target humanoid treats self as trusted friend (save neg)"',
  'Charm Plants':
    'School=Enchantment ' +
    'Level=M7 ' +
    'Description="R30\' Command plants in 30\'x10\' area (save neg)"',
  'Clairaudience':
    'School=Divination ' +
    'Level=M3 ' +
    'Description="Hear remote known location for $L rd"',
  'Clairvoyance':
    'School=Divination ' +
    'Level=M3 ' +
    'Description="See remote known location for $L rd"',
  'Clenched Fist':
    'School=Evocation ' +
    'Level=M8 ' +
    'Description="R$L5\' Force absorbs attacks, strikes foes 1d6-4d6 HP for conc or $L rd"',
  'Clone':
    'School=Necromancy ' +
    'Level=M8 ' +
    'Description="Grow copy of target creature, each destroy the other or insane"',
  'Cloudkill':
    'School=Evocation ' +
    'Level=M5 ' +
    'Description="R10\' Poisonous 40\'x20\'x20\' cloud kills (5+2 HD save, 4+1 HD -4 save neg) moves 10\'/rd for $L rd"',
  'Color Spray':
    'School=Alteration ' +
    'Level=I1 ' +
    'Description=" 6 targets in $E unconscious (fewer than $Lplus1 HD), blinded 1d4 rd ($Lplus1-$Lplus2 HD) or stunned 2d4 seg (greater than $Lplus2 HD) (save neg)" ' +
    'Effect="$L10\' cone"',
  'Command':
    'School=Enchantment ' +
    'Level=C1 ' +
    'Description="R$R Target obeys single-word command (save neg for Int 13+/HD 6+)" ' +
    'Range="10\'"',
  'Commune':
    'School=Divination ' +
    'Level=C5 ' +
    'Description="Self deity answers $L yes/no questions"',
  'Commune With Nature':
    'School=Divination ' +
    'Level=D5 ' +
    'Description="Self discern nature info in $Ldiv2 mi radius"',
  'Comprehend Languages':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="Self understand unknown writing and speech for $L5 rd (rev obscures)"',
  'Cone Of Cold':
    'School=Evocation ' +
    'Level=M5 ' +
    'Description="Self $L5\'-long cone ${lvl}d4+$L HP (save half)"',
  'Confusion':
    'School=Enchantment ' +
    'Level=D7,I4,M4 ' +
    'Description="R$R $E unpredictable for $D (save neg 1 rd)" ' +
    'Duration="$Lplus2 rd" ' +
    'Effect="2d8 or more creatures in 60\' sq" ' +
    'Range="120\'"',
  'Confusion I4':
    'Duration="$L rd" ' +
    'Effect="2d8 or more creatures in 40\' sq" ' +
    'Range="80\'"',
  'Confusion D7':
    'Duration="$L rd" ' +
    'Effect="2d4 or more creatures in 20\' radius" ' +
    'Range="80\'"',
  'Conjure Animals':
    'School=Conjuration ' +
    'Level=C6,I6 ' +
    'Description="R30\' $E of animals appear and fight for $D" ' +
    'Duration="$L rd" ' +
    'Effect="$L HD"',
  'Conjure Animals C6':
    'Duration="$L2 rd"',
  'Conjure Earth Elemental':
    'School=Conjuration ' +
    'Level=D7 ' +
    'Description="R40\' $E assists for $L tn (rev dismisses)" ' +
    'Effect="16 HD elemental"',
  'Conjure Elemental':
    'School=Conjuration ' +
    'Level=M5 ' +
    'Description="R60\' Summoned elemental obeys commands for conc or $L tn"',
  'Conjure Fire Elemental':
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description="R80\' $E assists for $L tn (rev dismisses)" ' +
    'Effect="16 HD elemental"',
  'Contact Other Plane':
    'School=Divination ' +
    'Level=M5 ' +
    'Description="Self gain answers to $Ldiv2 yes/no questions"',
  'Continual Darkness':
    'School=Alteration ' +
    'Level=I3 ' +
    'Description="R60\' 30\' radius opaque"',
  'Continual Light':
    'School=Alteration ' +
    'Level=C3,I3,M2 ' +
    'Description="R$R Target centers 60\' radius light (rev darkness) until dispelled" ' +
    'Range="60\'"',
  'Continual Light C3':
    'Range="120\'"',
  "Control Temperature 10' Radius":
    'School=Alteration ' +
    'Level=D4 ' +
    'Description="Change temperature in 10\' radius by $E for $Lplus4 tn" ' +
    'Effect="${lvl*9}F"',
  'Control Weather':
    'School=Alteration ' +
    'Level=C7,D7,M6 ' +
    'Description="Self controls precipitation, temp, and wind within $E for $D" ' +
    'Duration="4d6 hr" ' +
    'Effect="4d4 mi sq"',
  'Control Weather C7':
    'Duration="4d12 hr"',
  'Control Weather D7':
    'Duration="8d12 hr" ' +
    'Effect="4d8 mi sq"',
  'Control Winds':
    'School=Alteration ' +
    'Level=D5 ' +
    'Description="Winds in $L40\' radius speed or slow for $L tn"',
  'Create Food And Water':
    'School=Alteration ' +
    'Level=C3 ' +
    'Description="R10\' Creates $E food and drink" ' +
    'Effect="$L5 person/day"',
  'Create Water':
    'School=Alteration ' +
    'Level=C1,D2 ' +
    'Description="R$R Creates (rev destroys) $E potable water" ' +
    'Effect="$L4 gallons" ' +
    'Range="10\'"',
  'Create Water D2':
    'Effect="$L\' cu"',
  'Creeping Doom':
    'School=Conjuration ' +
    'Level=D7 ' +
    'Description="Bugs erupt, attack w/in $E for $L4 rd" ' +
    'Effect="80\' radius"',
  'Crushing Hand':
    'School=Evocation ' +
    'Level=M9 ' +
    'Description="R$L5\' Force absorbs attacks, squeezes 1d10-4d10 HP for $L rd"',
  'Cure Blindness':
    'School=Abjuration ' +
    'Level=C3 ' +
    'Description="Touched cured of blindness (rev blinds) (save neg)"',
  'Cure Critical Wounds':
    'School=Necromancy ' +
    'Level=C5,D6 ' +
    'Description="Touched heals 3d8+3 HP (rev inflicts)"',
  'Cure Disease':
    'School=Abjuration ' +
    'Level=C3,D3 ' +
    'Description="Touched cured of disease (rev infects) (save neg)"',
  'Cure Light Wounds':
    'School=Necromancy ' +
    'Level=C1,D2 ' +
    'Description="Touched heals 1d8 HP (rev inflicts)"',
  'Cure Serious Wounds':
    'School=Necromancy ' +
    'Level=C4,D4 ' +
    'Description="Touched heals 2d8+1 HP (rev inflicts)"',
  'Dancing Lights':
    'School=Alteration ' +
    'Level=I1,M1 ' +
    'Description="R$L10plus40\' Up to 4 movable lights for $L2 rd"',
  "Darkness 15' Radius":
    'School=Alteration ' +
    'Level=I1,M2 ' +
    'Description="R$L10\' 15\' radius lightless for $D" ' +
    'Duration="$Lplus10 rd"',
  "Darkness 15' Radius I1":
    'Duration="2d4+$L rd" ' +
    'Range="$L10plus40\'"',
  'Deafness':
    'School=Illusion ' +
    'Level=I2 ' +
    'Description="R60\' Target deafened (save neg)"',
  'Death Spell':
    'School=Conjuration ' +
    'Level=M6 ' +
    'Description="R$L10\' Kills 4d20 points of creatures w/fewer than 9 HD in $E" ' +
    'Effect="$L5\' sq"',
  'Delayed Blast Fireball':
    'School=Evocation ' +
    'Level=M7 ' +
    'Description="R$L10plus100\' ${lvl}d6+$L HP in 20\' radius (save half) after up to 5 rd"',
  'Demi-Shadow Magic':
    'School=Illusion ' +
    'Level=I6 ' +
    'Description="R$L10plus60\' Mimics <i>Cloudkill</i> (die, save neg), <i>Cone Of Cold</i> (${lvl}d4+$L HP), <i>Fireball</i> (${lvl}d6 HP), <i>Lightning Bolt</i> (${lvl}d6 HP), <i>Magic Missile</i> (${Math.floor((lvl+1)/2)}x1d4+1 HP) (ea save $L2 HP), <i>Wall Of Fire</i> (2d6+$L HP, save ${lvl}d4), or <i>Wall Of Ice</i>"',
  'Demi-Shadow Monsters':
    'School=Illusion ' +
    'Level=I5 ' +
    'Description="R30\' Create monsters $L HD total, 40% HP (save AC 8, 40% damage) for $L rd"',
  'Detect Charm':
    'School=Divination ' +
    'Level=C2 ' +
    'Description="Self discern up to 10 charmed creatures in 30\' for 1 tn (rev shields 1 target)"',
  'Detect Evil':
    'School=Divination ' +
    'Level=C1,M2 ' +
    'Description="Self discern evil (rev good) in $R for $D" ' +
    'Duration="$L5 rd" ' +
    'Range="10\'x60\' path"',
  'Detect Evil C1':
    'Duration="$L5plus10 rd" ' +
    'Range="10\'x120\' path"',
  'Detect Illusion':
    'School=Divination ' +
    'Level=I1 ' +
    'Description="Self discern illusions in 10\'x$L10\' path, touching reveals to others for $L2plus3 rd"',
  'Detect Invisibility':
    'School=Divination ' +
    'Level=I1,M2 ' +
    'Description="Self see invisible objects in 10\'x$L10\' path for $L5 rd"',
  'Detect Lie':
    'School=Divination ' +
    'Level=C4 ' +
    'Description="R30\' $E discerns lies for $L rd (rev makes lies believable)" ' +
    'Effect="Target"',
  'Detect Magic':
    'School=Divination ' +
    'Level=C1,D1,I2,M1 ' +
    'Description="Self discern magical auras in $E for $D" ' +
    'Duration="$L2 rd" ' +
    'Effect="10\'x60\' path"',
  'Detect Magic C1':
    'Duration="1 tn" ' +
    'Effect="10\'x30\' path"',
  'Detect Magic D1':
    'Duration="12 rd" ' +
    'Effect="10\'x40\' path"',
  'Detect Pits And Snares':
    'School=Divination ' +
    'Level=D1 ' +
    'Description="Self discern outdoor traps, indoor pits in 10\'x40\' path for $L4 rd"',
  'Dig':
    'School=Evocation ' +
    'Level=M4 ' +
    'Description="R30\' Excavate 5\' cube/rd for $L rd"',
  'Dimension Door':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description="Self teleport $L30\'"',
  'Disintegrate':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description="R$L5\' Obliterates $E matter (save neg)" ' +
    'Effect="$L10\' sq"',
  'Dispel Exhaustion':
    'School=Illusion ' +
    'Level=I4 ' +
    'Description="4 Touched regain 50% HP, dbl speed 1/tn for $L3 tn"',
  'Dispel Evil':
    'School=Abjuration ' +
    'Level=C5 ' +
    'Description="Return evil (rev good) creatures to home plane (save neg, -7 attack caster for $L rd)"',
  'Dispel Illusion':
    'School=Abjuration ' +
    'Level=I3 ' +
    'Description="R$L10\' Dispel one illusion, 50% (+5%/-2% per caster level delta) dispel one magic"',
  'Dispel Magic':
    'School=Abjuration ' +
    'Level=C3,D4,M3 ' +
    'Description="R$R 50% (+5%/-2% per caster level delta) magic in $E extinguished" ' +
    'Effect="30\' cu" ' +
    'Range="120\'"',
  'Dispel Magic C3':
    'Effect="30\' radius" ' +
    'Range="60\'"',
  'Dispel Magic D4':
    'Effect="$L40\' cu" ' +
    'Range="80\'"',
  'Distance Distortion':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description="R$L10\' Travel through $E half or dbl for $D" ' +
    'Duration="$L tn" ' +
    'Effect="$L100\' sq"',
  'Divination':
    'School=Divination ' +
    'Level=C4 ' +
    'Description="Self $Lplus60% discern info about known location"',
  'Duo-Dimension':
    'School=Alteration ' +
    'Level=M7 ' +
    'Description="Self 2D, take 3x damage from front/back, for $Lplus3 rd"',
  'ESP':
    'School=Divination ' +
    'Level=M2 ' +
    'Description="R$L5max90\' Self hear surface thoughts for $L rd"',
  'Earthquake':
    'School=Alteration ' +
    'Level=C7 ' +
    'Description="R120\' Intense shaking in $L5\' diameter for 1 rd"',
  'Emotion':
    'School=Enchantment ' +
    'Level=I4 ' +
    'Description="R$L10\' Targets in 40\' sq experience fear (flee), hate (+2 save/attack/damage), hopelessness (walk away or surrender), or rage (+1 attack, +3 damage, +5 HP) for conc"',
  'Enchant An Item':
    'School=Conjuration ' +
    'Level=M6 ' +
    'Description="Touched item becomes magical"',
  'Enchanted Weapon':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description="Touched weapon magical $E for $L5 rd" ' +
    'Effect="(no bonus)"',
  'Enlarge':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="R$L5\' Creature grows $L20max200% or object $L10max100% for $L tn (rev shrinks, save neg)"',
  'Entangle':
    'School=Alteration ' +
    'Level=D1 ' +
    'Description="R80\' Plants in $E hold passers (save move half) for 1 tn" ' +
    'Effect="20\' radius"',
  'Erase':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="R30\' Erase magical ($L2plus50% chance) or normal ($L4plus50%) writing from 2-page area (save neg)"',
  'Exorcise':
    'School=Abjuration ' +
    'Level=C4 ' +
    'Description="R10\' Target relieved of supernatural inhabitant and influence"',
  'Explosive Runes':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description="Reading runes on touched 6d4+6 HP to reader (no save), 10\' radius (save half)"',
  'Extension I':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description="Existing level 1-3 spell lasts 50% longer"',
  'Extension II':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description="Existing level 1-4 spell lasts 50% longer"',
  'Extension III':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description="Existing level 1-3 spell lasts 100% longer or level 4-5 50%"',
  'Faerie Fire':
    'School=Alteration ' +
    'Level=D1 ' +
    'Description="R80\' Outlines targets, allowing +2 attack, for $L4 rd"',
  'False Trap':
    'School=Illusion ' +
    'Level=M2 ' +
    'Description="Touched appears trapped (save disbelieve)"',
  'Fear':
    'School=Illusion ' +
    'Level=I3,M4 ' +
    'Description="Targets in 60\' cone 65%-5*HD flee for $L rd (save neg)"',
  'Feather Fall':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="R$L10\' Objects in 10\' cu fall 2\'/sec for $D" ' +
    'Duration="$L6 secs"',
  'Feeblemind':
    'School=Enchantment ' +
    'Level=D6,M5 ' +
    'Description="R$R Target Int 2 (save Cleric +1, Druid -1, MU -4, Illusionist -5 and non-human -2 neg)" ' +
    'Range="$L10\'"',
  'Feeblemind D6':
    'Range="40\'"',
  'Feign Death':
    'School=Necromancy ' +
    'Level=C3,D2,M3 ' +
    'Description="Touched appears dead, takes half damage, immune draining for $D" ' +
    'Duration="$Lplus6 rd"',
  'Feign Death C3':
    'Duration="$Lplus10 rd"',
  'Feign Death D2':
    'Duration="$L2plus4 rd"',
  'Find Familiar':
    'School=Conjuration ' +
    'Level=M1 ' +
    'Description="Call beast to serve as familiar (HP 1d3+1, AC 7)"',
  'Find The Path':
    'School=Divination ' +
    'Level=C6 ' +
    'Description="Touched knows shortest route into and out of location for $L tn (rev causes indirection)"',
  'Find Traps':
    'School=Divination ' +
    'Level=C2 ' +
    'Description="Detect traps in 10\'x30\' area for 3 tn"',
  'Finger Of Death':
    'School=Enchantment ' +
    'Level=D7 ' +
    'Description="R60\' Target dies (save neg)"',
  'Fire Charm':
    'School=Enchantment ' +
    'Level=M4 ' +
    'Description="R10\' Fire mesmerizes viewers (save neg) in 15\' radius, makes suggestible for $L2 rd"',
  'Fire Seeds':
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description="R40\' 4 acorn missiles 2d8 HP in 5\' area or 8 holly berries 1d8 in 5\' sq for $L tn (save half)"',
  'Fire Shield':
    'School=Evocation ' +
    'Level=M4 ' +
    'Description="Self +2 save and half damage vs. fire (rev cold), dbl damage vs. cold (rev fire) for $Lplus2 rd"',
  'Fire Storm':
    'School=Evocation ' +
    'Level=D7 ' +
    'Description="R$R Fire in $L20\' cu  area 2d8 HP (save half) for 1 rd (rev extinguishes)" ' +
    'Range="150\'"',
  'Fire Trap':
    'School=Evocation ' +
    'Level=D2,M4 ' +
    'Description="Touched causes 1d4+$L HP (save half) in 5\' radius when opened"',
  'Fireball':
    'School=Evocation ' +
    'Level=M3 ' +
    'Description="R$R $E in 20\' radius (save half)" ' +
    'Effect="${lvl}d6 HP" ' +
    'Range="$L10plus100\'"',
  'Flame Arrow':
    'School=Conjuration ' +
    'Level=M3 ' +
    'Description="Touched arrow or bolt 1 HP fire damage same rd"',
  'Flame Strike':
    'School=Evocation ' +
    'Level=C5 ' +
    'Description="R60\' 5\' radius fire column 6d8 HP (save half)"',
  'Floating Disk':
    'School=Evocation ' +
    'Level=M1 ' +
    'Description="3\' diameter disk holds $L100 lbs, follows self at $R for $Lplus3 tn" ' +
    'Range="20\'"',
  'Fly':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description="Touched can fly $E for $D" ' +
    'Duration="1d6+$L6 tn" ' +
    'Effect="120\'/rd"',
  'Fog Cloud':
    'School=Alteration ' +
    'Level=I2 ' +
    'Description="R10\' Fog in 40\'x20\'x20\' area obscures vision, moves 10\'/rd for $Lplus4 rd"',
  "Fool's Gold":
    'School=Alteration ' +
    'Level=M2 ' +
    'Description="R10\' Copper and brass become gold for $L hr (-$L save disbelieve)"',
  'Forceful Hand':
    'School=Evocation ' +
    'Level=M6 ' +
    'Description="R$L10\' Force absorbs attacks, pushes away for $L rd"',
  'Forget':
    'School=Enchantment ' +
    'Level=M2 ' +
    'Description="R30\' 4 targets in 20\' sq forget last $Lplus3div3 rd (save neg)"',
  'Freezing Sphere':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description="Freeze $L10\' sq water for $L rd, R$L10\' cold ray $L4 HP (save neg), or cold grenade 4d6 HP (save half) in 10\' radius"',
  'Friends':
    'School=Enchantment ' +
    'Level=M1 ' +
    'Description="R$L10plus10\' Self Cha +2d4 (save self Cha -1d4) for $L rd"',
  'Fumble':
    'School=Enchantment ' +
    'Level=M4 ' +
    'Description="R$L10\' $E falls and drops carried (save slowed) for $L rd" ' +
    'Effect="Target"',
  'Gate':
    'School=Conjuration ' +
    'Level=C7,M9 ' +
    'Description="R30\' Summon named extraplanar creature"',
  'Gaze Reflection':
    'School=Alteration ' +
    'Level=I1 ' +
    'Description="Gaze attacks reflected back for $D" ' +
    'Duration="1 rd"',
  'Geas':
    'School=Enchantment ' +
    'Level=M6 ' +
    'Description="$R fulfill quest or sicken and die in 1d4 wk" ' +
    'Range="Touched"',
  'Glass-steel':
    'School=Alteration ' +
    'Level=M8 ' +
    'Description="Touched $L10 lb glass gains steel strength"',
  'Glasseye':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description="Touched 3\'x2\' area becomes transparent for $L rd"',
  'Globe Of Invulnerability':
    'School=Abjuration ' +
    'Level=M6 ' +
    'Description="Self 5\' radius blocks spells level 1-4 for $L rd"',
  'Glyph Of Warding':
    'School=Abjuration ' +
    'Level=C3 ' +
    'Description="Touching $R causes $E energy (save half or neg)" ' +
    'Effect="$L2 HP" ' +
    'Range="$L25\' sq"',
  'Grasping Hand':
    'School=Evocation ' +
    'Level=M7 ' +
    'Description="R$L10\' Force absorbs attacks, restrains for $L rd"',
  'Guards And Wards':
    'School=Evocation ' +
    'Level=M6 ' +
    'Description="Multiple effects protect $E for $D" ' +
    'Duration="$L hr" ' +
    'Duration="$L2 hr" ' +
    'Effect="$L10plus20\' radius"',
  'Gust Of Wind':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description="Wind in 10\'x$L10\' path extinguishes flames, moves small objects for $D" ' +
    'Duration="6 secs"',
  'Hallucinatory Forest':
    'School=Illusion ' +
    'Level=D4 ' +
    'Description="R80\' Illusion of $L40\' sq forest"',
  'Hallucinatory Terrain':
    'School=Illusion ' +
    'Level=I3,M4 ' +
    'Description="R$R $E mimics other terrain $D" ' +
    'Duration="until touched" ' +
    'Effect="$L10plus40\' sq" ' +
    'Range="$L20plus20\'"',
  'Hallucinatory Terrain I3':
    'Effect="$L10\' sq" ' +
    'Range="$L20\'"',
  'Haste':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description="R60\' $L targets in 40\' sq dbl speed for $Lplus3 rd"',
  'Heal':
    'School=Necromancy ' +
    'Level=C6 ' +
    'Description="Touched healed of $E, cured of blindness, disease, feeblemind (rev causes disease and drains all but 1d4 HP)" ' +
    'Effect="all but 1d4 HP"',
  'Heat Metal':
    'School=Necromancy ' +
    'Level=D2 ' +
    'Description="R40\' Metal dangerously hot (rev cold) for 7 rd"',
  'Hold Animal':
    'School=Enchantment ' +
    'Level=D3 ' +
    'Description="R80\' Immobilize 4 animals for $L2 rd"',
  'Hold Monster':
    'School=Enchantment ' +
    'Level=M5 ' +
    'Description="R$L5\' Immobilize 4 creatures (save neg) for $L rd"',
  'Hold Person':
    'School=Enchantment ' +
    'Level=C2,M3 ' +
    'Description="R$R Immobilize 1-4 medium targets (save neg) for $D" ' +
    'Duration="$L2 rd" ' +
    'Range="120\'"',
  'Hold Person C2':
    'Duration="$Lplus4 rd" ' +
    'Range="60\'"',
  'Hold Plant':
    'School=Enchantment ' +
    'Level=D4 ' +
    'Description="R80\' Mobile plants in 16 sq yd immobile for $L rd"',
  'Hold Portal':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="R$L20\' $E item held shut for $L rd" ' +
    'Effect="$L80\' sq"',
  'Holy Word':
    'School=Conjuration ' +
    'Level=C7 ' +
    'Description="30\' radius banishes evil extraplanar, kills (fewer than 4 HD), paralyzes (4-7 HD), stuns (8-11 HD), deafens (greater than 11 HD) non-good creatures (rev good)"',
  'Hypnotic Pattern':
    'School=Illusion ' +
    'Level=I2 ' +
    'Description="Viewers in 30\' sq totaling 24 HD transfixed for conc (save neg)"',
  'Hypnotism':
    'School=Enchantment ' +
    'Level=I1 ' +
    'Description="R$R 1d6 targets subject to suggestion for $Lplus1 rd" ' +
    'Range="30\'"',
  'Ice Storm':
    'School=Evocation ' +
    'Level=M4 ' +
    'Description="R$L10\' Hail in 40\' sq 3d10 HP or sleet in 80\' sq blinds, slows, causes falls for 1 rd"',
  'Identify':
    'School=Divination ' +
    'Level=M1 ' +
    'Description="$E determine magical properties of touched w/in $L hr of discovery (save neg or mislead), requires rest afterward" ' +
    'Effect="$L5plus15%"',
  'Illusory Script':
    'School=Illusion ' +
    'Level=I3 ' +
    'Description="Obscured writing causes 5d4 rd confusion (save neg) for readers other than specified"',
  'Imprisonment':
    'School=Abjuration ' +
    'Level=M9 ' +
    'Description="Touched safely trapped underground permanently (rev frees)"',
  'Improved Invisibility':
    'School=Illusion ' +
    'Level=I4 ' +
    'Description="Touched invisible for $Lplus4 rd"',
  'Improved Phantasmal Force':
    'School=Illusion ' +
    'Level=I2 ' +
    'Description="R$L10plus60\' $E sight and sound illusion for conc + 2 rd" ' +
    'Effect="$L10plus40\' sq"',
  'Incendiary Cloud':
    'School=Alteration ' +
    'Level=M8 ' +
    'Description="R30\' 20\' radius smoke cloud for 1d6+4 rd, $E rd 3, 4, 5 (save half)" ' +
    'Effect="$Ldiv2, $L, $Ldiv2 HP"',
  'Infravision':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description="Touched see 60\' in darkness for $Lplus2 hr"',
  'Insect Plague':
    'School=Conjuration ' +
    'Level=C5,D5 ' +
    'Description="R$R Stinging insects fill $E (targets w/fewer than 2 HD flee, 3-4 HD check morale) for $L tn" ' +
    'Effect="180\' radius" ' +
    'Range="360\'"',
  'Insect Plague D5':
    'Effect="160\' radius" ' +
    'Range="320\'"',
  'Instant Summons':
    'School=Conjuration ' +
    'Level=M7 ' +
    'Description="Prepared, unpossessed 8 lb item called to self hand"',
  'Interposing Hand':
    'School=Evocation ' +
    'Level=M5 ' +
    'Description="R$L10\' Force absorbs attacks, blocks passage for $L rd"',
  'Invisibility':
    'School=Illusion ' +
    'Level=I2,M2 ' +
    'Description="Touched invisible until attacking"',
  "Invisibility 10' Radius":
    'School=Illusion ' +
    'Level=I3,M3 ' +
    'Description="Creatures w/in 10\' of touched invisible until attacking"',
  'Invisibility To Animals':
    'School=Alteration ' +
    'Level=D1 ' +
    'Description="$E undetected by animals for $Lplus10 rd" ' +
    'Effect="Touched"',
  'Invisible Stalker':
    'School=Conjuration ' +
    'Level=M6 ' +
    'Description="R10\' Conjured 8 HD invisible creature performs 1 task"',
  'Irresistible Dance':
    'School=Enchantment ' +
    'Level=M8 ' +
    'Description="Touched -4 AC, fail saves for 1d4+1 rd"',
  'Jump':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="Touched can jump 30\' forward, 10\' back or up $D" ' +
    'Duration="$Lplus2div3 times"',
  'Knock':
    'School=Alteration ' +
    'Level=M2 ' +
    'Description="R60\' Open stuck, locked item"',
  'Know Alignment':
    'School=Divination ' +
    'Level=C2 ' +
    'Description="Self discern aura of $E for 1 tn (rev obscures)" ' +
    'Effect="10 targets"',
  'Legend Lore':
    'School=Divination ' +
    'Level=M6 ' +
    'Description="Self gain info about specified object, person, or place"',
  'Levitate':
    'School=Alteration ' +
    'Level=M2 ' +
    'Description="R$L20\' Self move $L100 lb target up/down 10\'/rd for $L tn (save neg)"',
  'Light':
    'School=Alteration ' +
    'Level=C1,I1,M1 ' +
    'Description="R$R Target spot radiates 20\' radius light for $D (rev darkness half duration)" ' +
    'Duration="$L tn" ' +
    'Range="60\'"',
  'Light C1':
    'Duration="$Lplus6 tn" ' +
    'Range="120\'"',
  'Lightning Bolt':
    'School=Evocation ' +
    'Level=M3 ' +
    'Description="R$L10plus40\' Bolt $E HP (save half)" ' +
    'Effect="${lvl}d6"',
  'Limited Wish':
    'School=Conjuration ' +
    'Level=M7 ' +
    'Description="Minor reshaping of reality"',
  'Locate Animals':
    'School=Divination ' +
    'Level=D1 ' +
    'Description="Self discern animals in 20\'x$L20\' area for $L rd"',
  'Locate Object':
    'School=Divination ' +
    'Level=C3,M2 ' +
    'Description="R$R Self find desired object for $L rd (rev obscures)" ' +
    'Range="$L20\'"',
  'Locate Object C3':
    'Range="$L10plus60\'"',
  'Locate Plants':
    'School=Divination ' +
    'Level=D2 ' +
    'Description="Self discern plants in $L5\' radius for $L tn"',
  'Lower Water':
    'School=Alteration ' +
    'Level=C4,M6 ' +
    'Description="R$R $E fluid subsides by $L5% for $D (rev raises)" ' +
    'Duration="$L5 rd" ' +
    'Effect="$L5\' sq" ' +
    'Range="80\'"',
  'Lower Water C4':
    'Duration="$L tn" ' +
    'Effect="$L10\' sq" ' +
    'Range="120\'"',
  "Mage's Faithful Hound":
    'School=Conjuration ' +
    'Level=M5 ' +
    'Description="R10\' Invisible 10 HD dog guards, attacks 3d6 HP w/in 30\' of self for $D" ' +
    'Duration="$L2 rd"',
  "Mage's Sword":
    'School=Evocation ' +
    'Level=M7 ' +
    'Description="R30\' Control remote magic sword (19-20 hits, 5d4 HP) as F$Ldiv2 for $L rd"',
  'Magic Aura':
    'School=Illusion ' +
    'Level=M1 ' +
    'Description="Touched responds to <i>Detect Magic</i> for $L dy (save disbelieve)"',
  'Magic Jar':
    'School=Necromancy ' +
    'Level=M5 ' +
    'Description="R$L10\' Self trap target soul and possess target body (save neg)"',
  'Magic Missile':
    'School=Evocation ' +
    'Level=M1 ' +
    'Description="R$L10plus60\' $Lplus1div2 energy darts hit targets in 10\' sq 1d4+1 HP ea"',
  'Magic Mouth':
    'School=Alteration ' +
    'Level=I2,M2 ' +
    'Description="$R object responds to trigger by reciting 25 words" ' +
    'Range="Touched"',
  'Major Creation':
    'School=Alteration ' +
    'Level=I5 ' +
    'Description="R10\' Create $L\' cu object from component plant or mineral material for $D" ' +
    'Duration="$L hr"',
  'Mass Charm':
    'School=Enchantment ' +
    'Level=M8 ' +
    'Description="R$L5\' $L2 HD creature(s) in 30\' sq treat self as trusted friend (save neg)"',
  'Mass Invisibility':
    'School=Illusion ' +
    'Level=M7 ' +
    'Description="R$L10\' All in $E invisible until attacking" ' +
    'Effect="30\' sq"',
  'Mass Suggestion':
    'School=Enchantment ' +
    'Level=I6 ' +
    'Description="R$R $L targets carry out reasonable suggestion for $L4plus4 tn" ' +
    'Range="$L10\'"',
  'Massmorph':
    'School=Illusion ' +
    'Level=I4,M4 ' +
    'Description="R$L10\' 10 humanoids look like trees"',
  'Maze':
    'School=Conjuration ' +
    'Level=I5,M8 ' +
    'Description="R$L5\' Target sent to interdimensional maze for amount of time based on Int"',
  'Mending':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="R30\' Repair small break"',
  'Message':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="R$L10plus60\' remote whispering for ${(lvl+5)*6} secs"',
  'Meteor Swarm':
    'School=Evocation ' +
    'Level=M9 ' +
    'Description="R$L10plus40\' 4 meteors 10d4 HP in 30\' diameter or 8 meteors 5d4 HP in 15\' diameter (collateral save half)"',
  'Mind Blank':
    'School=Abjuration ' +
    'Level=M8 ' +
    'Description="R30\' Target immune $E for 1 dy" ' +
    'Effect="divination"',
  'Minor Creation':
    'School=Alteration ' +
    'Level=I4 ' +
    'Description="Create $L\' cu object from component plant material for $L hr"',
  'Minor Globe Of Invulnerability':
    'School=Abjuration ' +
    'Level=M4 ' +
    'Description="Self 5\' radius blocks spells level 1-3 for $L rd"',
  'Mirror Image':
    'School=Illusion ' +
    'Level=I2,M2 ' +
    'Description="Self $E duplicates draw attacks for $D" ' +
    'Duration="$L3 rd" ' +
    'Effect="1d4+1"',
  'Mirror Image M2':
    'Duration="$L2 rd" ' +
    'Effect="1d4"',
  'Misdirection':
    'School=Illusion ' +
    'Level=I2 ' +
    'Description="R30\' Divination spells cast on target return false info for $D" ' +
    'Duration="$L rd"',
  'Mnemonic Enhancer':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description="Self retain 3 additional spell levels for 1 dy"',
  'Monster Summoning I':
    'School=Conjuration ' +
    'Level=M3 ' +
    'Description="R30\' 2d4 1 HD creatures fight for $Lplus2 rd"',
  'Monster Summoning II':
    'School=Conjuration ' +
    'Level=M4 ' +
    'Description="R40\' 1d6 2 HD creatures fight for $Lplus3 rd"',
  'Monster Summoning III':
    'School=Conjuration ' +
    'Level=M5 ' +
    'Description="R50\' 1d4 3 HD creatures fight for $Lplus4 rd"',
  'Monster Summoning IV':
    'School=Conjuration ' +
    'Level=M6 ' +
    'Description="R60\' $E 4 HD creatures fight for $Lplus5 rd" ' +
    'Effect="1d4"',
  'Monster Summoning V':
    'School=Conjuration ' +
    'Level=M7 ' +
    'Description="R70\' $E 5 HD creatures fight for $Lplus6 rd" ' +
    'Effect="1d2"',
  'Monster Summoning VI':
    'School=Conjuration ' +
    'Level=M8 ' +
    'Description="R80\' $E 6 HD creatures fight for $Lplus7 rd" ' +
    'Effect="1d2"',
  'Monster Summoning VII':
    'School=Conjuration ' +
    'Level=M9 ' +
    'Description="R90\' 1d2 7 HD creatures fight for $Lplus8 rd"',
  'Move Earth':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description="R$L10\' Displace $E/tn" ' +
    'Effect="40\' cu"',
  'Neutralize Poison':
    'School=Alteration ' +
    'Level=C4,D3 ' +
    'Description="Touched detoxed (rev lethally poisoned, save neg)"',
  'Non-Detection':
    'School=Abjuration ' +
    'Level=I3 ' +
    'Description="$E invisible to divination for $D" ' +
    'Duration="$L tn" ' +
    'Effect="5\' radius"',
  'Obscurement':
    'School=Alteration ' +
    'Level=D2 ' +
    'Description="Mist limits vision in $L10\' cu for $L4 rd"',
  'Paralyzation':
    'School=Illusion ' +
    'Level=I3 ' +
    'Description="R$L10\' Immobilize $L2 HD creatures in 20\' sq"',
  'Part Water':
    'School=Alteration ' +
    'Level=C6,M6 ' +
    'Description="R$R Form 20\'x$L30\'x3\' water trench for $D" ' +
    'Duration="$L5 rd" ' +
    'Range="$L10\'"',
  'Part Water C6':
    'Duration="$L tn" ' +
    'Range="$L20\'"',
  'Pass Plant':
    'School=Alteration ' +
    'Level=D5 ' +
    'Description="Self teleport between trees"',
  'Pass Without Trace':
    'School=Enchantment ' +
    'Level=D1 ' +
    'Description="Touched leaves no sign of passage for $L tn"',
  'Passwall':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description="R30\' Create 5\'x8\'x10\' passage through dirt and rock for $Lplus6 tn"',
  'Permanency':
    'School=Alteration ' +
    'Level=M8 ' +
    'Description="Effects of spell made permanent, costs 1 Con"',
  'Permanent Illusion':
    'School=Illusion ' +
    'Level=I6 ' +
    'Description="R$R $E sight, sound, smell, temperature illusion" ' +
    'Effect="$L10plus40\' sq" ' +
    'Range="30\'"',
  'Phantasmal Force':
    'School=Illusion ' +
    'Level=I1,M3 ' +
    'Description="R$R $E illusionary object for conc or until struck (save disbelieve)" ' +
    'Effect="$L10plus60\' sq" ' +
    'Range="$L10plus40\'"',
  'Phantasmal Force M3':
    'Effect="$L10plus80\' sq" ' +
    'Range="$L10plus80\'"',
  'Phantasmal Killer':
    'School=Illusion ' +
    'Level=I4 ' +
    'Description="R$L5\' Nightmare illusion attacks target as HD 4, kills on hit for $L rd (Int save neg)"',
  'Phase Door':
    'School=Alteration ' +
    'Level=M7 ' +
    'Description="Self pass through touched 10\' solid $E" ' +
    'Effect="twice"',
  'Plane Shift':
    'School=Alteration ' +
    'Level=C5 ' +
    'Description="Touched plus 7 touching travel to another plane (save neg)"',
  'Plant Door':
    'School=Alteration ' +
    'Level=D4 ' +
    'Description="Self move effortlessly through vegetation for $L tn"',
  'Plant Growth':
    'School=Alteration ' +
    'Level=D3,M4 ' +
    'Description="R$R Vegetation in $E becomes thick and entangled" ' +
    'Effect="$L10\' sq" ' +
    'Range="$L10\'"',
  'Plant Growth D3':
    'Effect="$L20\' sq" ' +
    'Range="160\'"',
  'Polymorph Object':
    'School=Alteration ' +
    'Level=M8 ' +
    'Description="R$L5\' Transform any object (save -4 neg)"',
  'Polymorph Other':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description="R$L5\' Target takes on named creature form and identity (save neg)"',
  'Polymorph Self':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description="Self takes on named creature form for $L2 tn"',
  'Power Word Blind':
    'School=Conjuration ' +
    'Level=M8 ' +
    'Description="R$L5\' Creatures in 15\' radius blinded for 1d4+1 rd or 1d4+1 tn"',
  'Power Word Kill':
    'School=Conjuration ' +
    'Level=M9 ' +
    'Description="R$L10div4\' 1 60 HP target or 12 10 HP targets in 10\' radius die"',
  'Power Word Stun':
    'School=Conjuration ' +
    'Level=M7 ' +
    'Description="R$L5\' Target stunned for 1d4-4d4 rd"',
  'Prayer':
    'School=Conjuration ' +
    'Level=C3 ' +
    'Description="R60\' Allies +1 attack, damage, saves (foes -1) for $L rd"',
  'Predict Weather':
    'School=Divination ' +
    'Level=D1 ' +
    'Description="Discern local weather for next $L2 hr"',
  'Prismatic Sphere':
    'School=Abjuration ' +
    'Level=M9 ' +
    'Description="Self 10\' radius impenetrable for $L tn"',
  'Prismatic Spray':
    'School=Abjuration ' +
    'Level=I7 ' +
    'Description="Targets in 70\'x15\'x5\' area one of 20, 40, 80 HP (save half), fatal poison, stone, insane, planar teleport (save neg)"',
  'Prismatic Wall':
    'School=Abjuration ' +
    'Level=I7 ' +
    'Description="R10\' $L40\'x$L20\' multicolored wall blinds viewers 2d4 rd, blocks attacks for $L tn"',
  'Produce Fire':
    'School=Alteration ' +
    'Level=D4 ' +
    'Description="R40\' Fire in $E 1d4 HP for 1 rd (rev extinguishes)" ' +
    'Effect="60\' radius"',
  'Produce Flame':
    'School=Alteration ' +
    'Level=D2 ' +
    'Description="Flame from burning hand can be thrown 40\' for $D" ' +
    'Duration="$L2 rd"',
  'Programmed Illusion':
    'School=Illusion ' +
    'Level=I6 ' +
    'Description="R$L10\' Target responds to trigger, shows $E scene for $L rd" ' +
    'Effect="$L10plus40\' sq"',
  'Project Image':
    'School=Illusion ' +
    'Level=I5,M6 ' +
    'Description="R$R Self duplicate immune to attacks, can cast spells for $L rd" ' +
    'Range="$L10\'"',
  'Project Image I5':
    'Range="$L5\'"',
  'Protection From Evil':
    'School=Abjuration ' +
    'Level=C1,M1 ' +
    'Description="Touched untouchable by evil outsiders, -2 evil attacks, +2 saves for $D (rev good)" ' +
    'Duration="$L2 rd"',
  'Protection From Evil C1':
    'Duration="$L3 rd"',
  "Protection From Evil 10' Radius":
    'School=Abjuration ' +
    'Level=C4,M3 ' +
    'Description="Touched 10\' radius untouchable by evil outsiders, -2 evil attacks, +2 saves for $D (rev good)" ' +
    'Duration="$L2 rd"',
  "Protection From Evil 10' Radius C4":
    'Duration="$L tn"',
  'Protection From Fire':
    'School=Abjuration ' +
    'Level=D3 ' +
    'Description="Self immune normal, ignore $L12 HP magic fire or touched immune normal, +4 save and half damage vs magic fire for $L tn"',
  'Protection From Lightning':
    'School=Abjuration ' +
    'Level=D4 ' +
    'Description="Self immune normal, ignore $L12 HP magic electricity or touched immune normal, +4 save and half damage vs magic electricity for $L tn"',
  'Protection From Normal Missiles':
    'School=Abjuration ' +
    'Level=M3 ' +
    'Description="Touched invulnerable to arrows and bolts for $L tn"',
  'Purify Food And Drink':
    'School=Alteration ' +
    'Level=C1 ' +
    'Description="R30\' Consumables in $L\' cu uncontaminated (rev contaminates)"',
  'Purify Water':
    'School=Alteration ' +
    'Level=D1 ' +
    'Description="R40\' Decontaminates (rev contaminates) $L\' cu water"',
  'Push':
    'School=Conjuration ' +
    'Level=M1 ' +
    'Description="R$L3plus10\' Target $L lb object moves away from self"',
  'Pyrotechnics':
    'School=Alteration ' +
    'Level=D3,M2 ' +
    'Description="R$R Target fire emits fireworks (blind 1d4+1 rd) or obscuring smoke for $L rd" ' +
    'Range="120\'"',
  'Pyrotechnics D3':
    'Range="160\'"',
  'Quest':
    'School=Enchantment ' +
    'Level=C5 ' +
    'Description="R60\' Target saves -1/dy until fulfill quest (save neg)"',
  'Raise Dead':
    'School=Necromancy ' +
    'Level=C5 ' +
    'Description="R30\' Corpse restored to life w/in $L dy or destroy corporeal undead (rev slays, save 2d8+1 HP)"',
  'Ray Of Enfeeblement':
    'School=Enchantment ' +
    'Level=M2 ' +
    'Description="R$R Target loses $L2plus19% Str for $L rd" ' +
    'Range="$L3plus10\'"',
  'Read Magic':
    'School=Divination ' +
    'Level=M1 ' +
    'Description="Self understand magical writing for $L2 rd (rev obscures)"',
  'Regenerate':
    'School=Necromancy ' +
    'Level=C7 ' +
    'Description="Touched reattach or regrow appendages in 2d4 tn (rev wither)"',
  'Reincarnate':
    'School=Necromancy ' +
    'Level=D7 ' +
    'Description="Soul dead at most 7 dy inhabits new body"',
  'Reincarnation':
    'School=Necromancy ' +
    'Level=M6 ' +
    'Description="Soul dead at most $L dy inhabits new body"',
  'Remove Curse':
    'School=Abjuration ' +
    'Level=C3,M4 ' +
    'Description="Touched uncursed (rev cursed for $L tn)"',
  'Remove Fear':
    'School=Abjuration ' +
    'Level=C1 ' +
    'Description="$E +4 vs. fear for 1 tn, new +$L save if already afraid (rev cause fear)" ' +
    'Effect="Touched"',
  'Repel Insects':
    'School=Abjuration ' +
    'Level=D4 ' +
    'Description="Self 10\' radius expels normal insects, wards giant (save neg) for $L tn"',
  'Repulsion':
    'School=Abjuration ' +
    'Level=M6 ' +
    'Description="R$L10\' Move all in 10\' path away 30\'/rd for $Ldiv2 rd"',
  'Resist Cold':
    'School=Alteration ' +
    'Level=C1 ' +
    'Description="Touched comfortable to 0F, +3 save vs. cold for 1/4 or 1/2 damage for $L tn"',
  'Resist Fire':
    'School=Alteration ' +
    'Level=C2 ' +
    'Description="Touched comfortable to 212F, +3 vs. fire for 1/4 or 1/2 damage for $L tn"',
  'Restoration':
    'School=Necromancy ' +
    'Level=C7 ' +
    'Description="Touched regains levels and abilities lost w/in $L dy (rev drains)"',
  'Resurrection':
    'School=Necromancy ' +
    'Level=C7 ' +
    'Description="Touched restored to life w/in $L10 yr (rev slays)"',
  'Reverse Gravity':
    'School=Alteration ' +
    'Level=M7 ' +
    'Description="R$L5\' Items in 30\' sq fall up for $D" ' +
    'Duration="1 sec"',
  'Rope Trick':
    'School=Alteration ' +
    'Level=I3,M2 ' +
    'Description="Touched rope leads to interdimensional space that holds $E for $L2 tn" ' +
    'Effect="6"',
  'Sanctuary':
    'School=Abjuration ' +
    'Level=C1 ' +
    'Description="$E foes save vs. magic to attack for $Lplus2 rd" ' +
    'Effect="Self"',
  'Scare':
    'School=Enchantment ' +
    'Level=M2 ' +
    'Description="R$R Target w/fewer than 6 HD frozen in terror (save neg) for $D" ' +
    'Duration="3d4 rd" ' +
    'Range="10\'"',
  'Secret Chest':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description="Create 12\' cu ethereal chest for 60 dy"',
  'Shades':
    'School=Illusion ' +
    'Level=I6 ' +
    'Description="R30\' Create monsters $L HD total, 60% HP (save AC 6, 60% damage) for $L rd"',
  'Shadow Door':
    'School=Illusion ' +
    'Level=I5 ' +
    'Description="R10\' Illusionary door makes self invisible for $L rd"',
  'Shadow Magic':
    'School=Illusion ' +
    'Level=I5 ' +
    'Description="R$L10plus50\' Mimics <i>Cone Of Cold</i> (${lvl}d4+$L HP), <i>Fireball</i> (${lvl}d6 HP), <i>Lightning Bolt</i> (${lvl}d6 HP), <i>Magic Missile</i> (${Math.floor((lvl+1)/2)}x1d4+1 HP) (save $L HP)"',
  'Shadow Monsters':
    'School=Illusion ' +
    'Level=I4 ' +
    'Description="R30\' Create monsters $L HD total, 20% HP (save AC 10, 20% damage) for $L rd"',
  'Shape Change':
    'School=Alteration ' +
    'Level=M9 ' +
    'Description="Self polymorph freely for $L tn"',
  'Shatter':
    'School=Alteration ' +
    'Level=M2 ' +
    'Description="R$R $L10 lbs brittle material shatters (save neg)" ' +
    'Range="60\'"',
  'Shield':
    'School=Evocation ' +
    'Level=M1 ' +
    'Description="Self frontal AC 2 vs thrown, AC 3 vs arrow or bolt, AC 4 vs melee, +1 save for $L5 rd"',
  'Shillelagh':
    'School=Alteration ' +
    'Level=D1 ' +
    'Description="Touched club +1 attack, 2d4 damage for $D" ' +
    'Duration="$L rd"',
  'Shocking Grasp':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="Touched 1d8+$L HP"',
  "Silence 15' Radius":
    'School=Alteration ' +
    'Level=C2 ' +
    'Description="R120\' No sound in 15\' radius for $L2 rd"',
  'Simulacrum':
    'School=Illusion ' +
    'Level=M7 ' +
    'Description="Command half-strength copy of another creature"',
  'Sleep':
    'School=Enchantment ' +
    'Level=M1 ' +
    'Description="R$R Creatures up to 4+4 HD in 15\' radius sleep for $L5 rd" ' +
    'Range="$L10plus30\'"',
  'Slow':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description="R$L10plus90\' $L targets in 40\' sq half speed for $Lplus3 rd"',
  'Slow Poison':
    'School=Necromancy ' +
    'Level=C2 ' +
    'Description="Touched takes only 1 HP/tn from poison, protected from death for $L hr"',
  'Snake Charm':
    'School=Enchantment ' +
    'Level=C2 ' +
    'Description="R30\' Charm angry snakes up to self HP 1d4+4 rd"',
  'Snare':
    'School=Enchantment ' +
    'Level=D3 ' +
    'Description="Touched snare 90% undetectable"',
  'Speak With Animals':
    'School=Alteration ' +
    'Level=C2,D1 ' +
    'Description="R$R Self converse w/1 type of animal for $L2 rd" ' +
    'Range="30\'"',
  'Speak With Animals D1':
    'Range="40\'"',
  'Speak With Dead':
    'School=Necromancy ' +
    'Level=C3 ' +
    'Description="R10\' Self question corpse"',
  'Speak With Monsters':
    'School=Alteration ' +
    'Level=C6 ' +
    'Description="R30\' Self converse w/intelligent creatures for $D" ' +
    'Duration="$L rd"',
  'Speak With Plants':
    'School=Alteration ' +
    'Level=C4,D4 ' +
    'Description="Self converse w/plants in $E for $L rd" ' +
    'Duration="$L rd" ' +
    'Effect="30\' radius"',
  'Speak With Plants D4':
    'Duration="$L2 rd" ' +
    'Effect="40\' radius"',
  'Spectral Force':
    'School=Illusion ' +
    'Level=I3 ' +
    'Description="R$R $L10plus40\' sq sight, sound, smell, temperature illusion for conc + 3 rd" ' +
    'Range="$L10plus60\'"',
  'Spell Immunity':
    'School=Abjuration ' +
    'Level=M8 ' +
    'Description="$Ldiv4 touched bonus vs. mind spells for $L tn"',
  'Spider Climb':
    'School=Alteration ' +
    'Level=M1 ' +
    'Description="Touched move 30\'/rd on walls and ceilings for $D" ' +
    'Duration="$Lplus1 rd"',
  'Spirit-rack':
    'School=Abjuration ' +
    'Level=M6 ' +
    'Description="R$Lplus10\' Banish extraplanar for $L yr"',
  'Spiritual Weapon':
    'School=Evocation ' +
    'Level=C2 ' +
    'Description="R$R magical force attacks for conc or $L rd" ' +
    'Duration="$L rd" ' +
    'Range="30\'"',
  'Statue':
    'School=Alteration ' +
    'Level=M7 ' +
    'Description="Touched become stone at will for $L hr"',
  'Sticks To Snakes':
    'School=Alteration ' +
    'Level=C4,D5 ' +
    'Description="R$R $E in 10\' cu become snakes ($L5% venomous) (rev) for $L2 rd" ' +
    'Effect="$L sticks" ' +
    'Range="30\'"',
  'Sticks To Snakes D5':
    'Range="40\'"',
  'Stinking Cloud':
    'School=Evocation ' +
    'Level=M2 ' +
    'Description="R30\' Creatures w/in $E retch for 1d4+1 rd (save neg) for $L rd" ' +
    'Effect="20\' radius"',
  'Stone Shape':
    'School=Alteration ' +
    'Level=D3,M5 ' +
    'Description="Touched $E rock reshaped" ' +
    'Effect="$L\' cu"',
  'Stone Shape D3':
    'Effect="$Lplus3\' cu"',
  'Stone Tell':
    'School=Divination ' +
    'Level=C6 ' +
    'Description="Self converse w/3\' cu rock for 1 tn"',
  'Stone To Flesh':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description="R$L10\' Restore stoned creature or convert $E (rev)" ' +
    'Effect="$L10\' cu"',
  'Strength':
    'School=Alteration ' +
    'Level=M2 ' +
    'Description="Touched Str +1d4 (HD d4), +1d6 (HD d8), or +1d8 (HD d10) for $L hr"',
  'Suggestion':
    'School=Enchantment ' +
    'Level=I3,M3 ' +
    'Description="R30\' Target carries out reasonable suggestion for $D (save neg)" ' +
    'Duration="$Lplus1 hr"',
  'Suggestion I3':
    'Duration="$L4plus4 hr"',
  'Summon Insects':
    'School=Conjuration ' +
    'Level=D3 ' +
    'Description="R30\' Target covered w/insects, 2 HP/rd for $L rd"',
  'Summon Shadow':
    'School=Conjuration ' +
    'Level=I5 ' +
    'Description="R10\' $E shadows obey commands for $Lplus1 rd" ' +
    'Effect="$L"',
  'Symbol':
    'School=Conjuration ' +
    'Level=C7,M8 ' +
    'Description="Glowing symbol causes death, discord 5d4 rd, fear (save -4 neg), hopelessness, insanity, pain 2d10 tn, sleep 4d4+1 tn, or stunning 3d4 rd"',
  'Symbol C7':
    'Description="Glowing symbol causes hopelessness, pain, or persuasion for $L tn"',
  'Telekinesis':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description="R$L10\' Move $L25 lb for $Lplus2 rd"',
  'Teleport':
    'School=Alteration ' +
    'Level=M5 ' +
    'Description="Instantly transport self + ${250+Math.max(lvl-10,0)*150} lb to known location"',
  'Temporal Stasis':
    'School=Alteration ' +
    'Level=M9 ' +
    'Description="R10\' Target suspended animation permanently (rev wakens)"',
  'Time Stop':
    'School=Alteration ' +
    'Level=M9 ' +
    'Description="Self 15\' radius gains $D" ' +
    'Duration="1d8+$Ldiv2 x 6 secs"',
  'Tiny Hut':
    'School=Alteration ' +
    'Level=M3 ' +
    'Description="$E protects against view, elements for $D" ' +
    'Duration="$L hr" ' +
    'Effect="5\' radius"',
  'Tongues':
    'School=Alteration ' +
    'Level=C4,M3 ' +
    'Description="Self understand any speech (rev muddle) in 30\' radius for $D" ' +
    'Duration="$L rd"',
  'Tongues C4':
    'Duration="1 tn"',
  'Transformation':
    'School=Alteration ' +
    'Level=M6 ' +
    'Description="Self become warrior (HP x2, AC +4, 2/rd dagger +2 damage) for $L rd"',
  'Transmute Metal To Wood':
    'School=Alteration ' +
    'Level=D7 ' +
    'Description="R80\' $E object becomes wood" ' +
    'Effect="$L8 lb"',
  'Transmute Rock To Mud':
    'School=Alteration ' +
    'Level=D5,M5 ' +
    'Description="R$R $L20\' cu rock becomes mud (rev)" ' +
    'Range="$L10\'"',
  'Transmute Rock To Mud D5':
    'Range="160\'"',
  'Transport Via Plants':
    'School=Alteration ' +
    'Level=D6 ' +
    'Description="Self teleport between plants"',
  'Trap The Soul':
    'School=Conjuration ' +
    'Level=M8 ' +
    'Description="R10\' Target soul trapped in gem (save neg)"',
  'Tree':
    'School=Alteration ' +
    'Level=D3 ' +
    'Description="Self polymorph into tree for $Lplus6 tn"',
  'Trip':
    'School=Enchantment ' +
    'Level=D2 ' +
    'Description="Touched trips passers (save neg), $E damage, stunned 1d4+1 rd for $L tn" ' +
    'Effect="1d6 HP"',
  'True Seeing':
    'School=Divination ' +
    'Level=C5 ' +
    'Description="Touched sees past deceptions$E w/in $R for $L rd (rev obscures)" ' +
    'Effect=", alignment auras" ' +
    'Range="120\'"',
  'True Sight':
    'School=Divination ' +
    'Level=I6 ' +
    'Description="Touched sees through deceptions w/in 60\' for $L rd"',
  'Turn Wood':
    'School=Alteration ' +
    'Level=D6 ' +
    'Description="Wood in 120\'x$L20\' area forced away for $L4 rd" ' +
    'Duration="$L4 rd"',
  'Unseen Servant':
    'School=Conjuration ' +
    'Level=M1 ' +
    'Description="Invisible force does simple tasks w/in 30\' for $Lplus6 tn"',
  'Vanish':
    'School=Alteration ' +
    'Level=M7 ' +
    'Description="Touched teleported or replaced by stone"',
  'Veil':
    'School=Illusion ' +
    'Level=I6 ' +
    'Description="R$L10\' $L20\' sq mimics other terrain for $L tn"',
  'Ventriloquism':
    'School=Illusion ' +
    'Level=I2,M1 ' +
    'Description="R$R Self throw voice for $D ((Int - 12) * 10% disbelieve)" ' +
    'Duration="$Lplus4 rd" ' +
    'Range="$L10max90\'"',
  'Ventriloquism M1':
    'Duration="$Lplus2 rd" ' +
    'Range="$L10max60\'"',
  'Vision':
    'School=Divination ' +
    'Level=I7 ' +
    'Description="Self seek answer to question, may cause geas"',
  'Wall Of Fire':
    'School=Evocation ' +
    'Level=D5,M4 ' +
    'Description="R$R $E 4d4+$L HP to passers, 2d4 w/in 10\', 1d4 w/in 20\' for conc or $L rd" ' +
    'Effect="$L20\' sq wall or $L5\' radius circle" ' +
    'Range="80\'"',
  'Wall Of Fire M4':
    'Description="R60\' $L20\' sq wall or $Lplus3\' radius circle 2d6+$L HP to passers, 2d6 w/in 10\', 1d6 w/in 20\' for conc or $L rd"',
  'Wall Of Fog':
    'School=Alteration ' +
    'Level=I1 ' +
    'Description="R30\' Fog in $E obscures for 2d4+$L rd" ' +
    'Effect="$L20\' cu"',
  'Wall Of Force':
    'School=Evocation ' +
    'Level=M5 ' +
    'Description="R30\' Invisible $E wall impenetrable for $D" ' +
    'Duration="$Lplus1 tn" ' +
    'Effect="$L20\' sq"',
  'Wall Of Ice':
    'School=Evocation ' +
    'Level=M4 ' +
    'Description="R$L10\' Create $L10\' sq ice wall for $L tn"',
  'Wall Of Iron':
    'School=Evocation ' +
    'Level=M5 ' +
    'Description="R$L5\' Create ${lvl/4} in thick, $L15\' sq wall"',
  'Wall Of Stone':
    'School=Evocation ' +
    'Level=M5 ' +
    'Description="R$L5\' ${lvl/4} in thick, $L20\' sq wall emerges from stone"',
  'Wall Of Thorns':
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description="R80\' Briars in $E 8 + AC HP for $L tn" ' +
    'Effect="$L100\' cu"',
  'Warp Wood':
    'School=Alteration ' +
    'Level=D2 ' +
    'Description="R$L10\' Bends $L in x $L15 in wood"',
  'Water Breathing':
    'School=Alteration ' +
    'Level=D3,M3 ' +
    'Description="Touched breathe water (rev air) for $D" ' +
    'Duration="$L rd"',
  'Water Breathing D3':
    'Duration="$L hr"',
  'Weather Summoning':
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description="Self directs precipitation, temp, and wind within d100 mi sq"',
  'Web':
    'School=Evocation ' +
    'Level=M2 ' +
    'Description="R$L5\' 80\' cu webbing for $L2 tn"',
  'Wind Walk':
    'School=Alteration ' +
    'Level=C7 ' +
    'Description="Self and $Ldiv8 others insubstantial, travel 600\'/tn for $L hr"',
  'Wish':
    'School=Conjuration ' +
    'Level=M9 ' +
    'Description="Major reshaping of reality"',
  'Wizard Eye':
    'School=Alteration ' +
    'Level=M4 ' +
    'Description="Self see through invisible eye w/60\' vision, 10\' infravision, moves 30\'/rd for $L rd"',
  'Wizard Lock':
    'School=Alteration ' +
    'Level=M2 ' +
    'Description="Touched $L30\' sq item held closed"',
  'Word Of Recall':
    'School=Alteration ' +
    'Level=C6 ' +
    'Description="Self instant teleport to prepared sanctuary"',
  'Write':
    'School=Evocation ' +
    'Level=M1 ' +
    'Description="Self copy unknown spell (save vs spell, fail damage and unconsciousness) for $L hr"'
};
OSRIC.WEAPONS = {
  'Bastard Sword':'Category=2h Damage=2d4',
  'Battle Axe':'Category=1h Damage=d8',
  'Broad Sword':'Category=1h Damage=2d4', // Best guess on category
  'Club':'Category=1h Damage=d4 Range=10',
  'Composite Long Bow':'Category=R Damage=d6 Range=60',
  'Composite Short Bow':'Category=R Damage=d6 Range=50',
  'Dagger':'Category=Li Damage=d4 Range=10',
  'Dart':'Category=R Damage=d3 Range=15',
  'Halberd':'Category=2h Damage=d10',
  'Hammer':'Category=Li Damage=d4+1 Range=10',
  'Hand Axe':'Category=Li Damage=d6 Range=10',
  'Heavy Crossbow':'Category=R Damage=d6+1 Range=60',
  'Heavy Flail':'Category=2h Damage=d6+1',
  'Heavy Mace':'Category=1h Damage=d6+1',
  'Heavy Pick':'Category=1h Damage=d6+1',
  'Heavy War Hammer':'Category=1h Damage=d6+1', // Best guess on category
  'Javelin':'Category=R Damage=d6 Range=20',
  'Lance':'Category=2h Damage=2d4+1',
  'Light Crossbow':'Category=R Damage=d4+1 Range=60',
  'Light Flail':'Category=1h Damage=d4+1',
  'Light Mace':'Category=Li Damage=d4+1',
  'Light Pick':'Category=Li Damage=d4+1',
  'Light War Hammer':'Category=Li Damage=d4+1',
  'Long Bow':'Category=R Damage=d6 Range=70',
  'Long Sword':'Category=1h Damage=d8',
  'Morning Star':'Category=1h Damage=2d4',
  'Pole Arm':'Category=2h Damage=d6+1',
  'Scimitar':'Category=1h Damage=d8',
  'Short Bow':'Category=R Damage=d6 Range=50',
  'Short Sword':'Category=Li Damage=d6',
  'Sling':'Category=R Damage=d4+1 Range=35',
  'Spear':'Category=2h Damage=d6 Range=15',
  'Staff':'Category=2h Damage=d6',
  'Trident':'Category=1h Damage=d6+1',
  'Two-Handed Sword':'Category=2h Damage=d10',
  'Unarmed':'Category=Un Damage=d2'
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
    ('skillNotes.dexteritySkillModifiers', 'sumThiefSkills', '?', '1');

  // Intelligence
  rules.defineRule('skillNotes.intelligenceLanguageBonus',
    'intelligence', '=',
      'source<=7 ? null : source<=15 ? Math.floor((source-6)/2) : (source-11)'
  );
  rules.defineRule
    ('languageCount', 'skillNotes.intelligenceLanguageBonus', '+', null);


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
    'abilityNotes.armorSpeedMaximum', 'v', null
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

};

/* Defines rules related to combat. */
OSRIC.combatRules = function(rules, armors, shields, weapons) {

  QuilvynUtils.checkAttrTable(armors, ['AC', 'Move', 'Weight', 'Skill']);
  QuilvynUtils.checkAttrTable(shields, ['AC', 'Weight']);
  QuilvynUtils.checkAttrTable(weapons, ['Category', 'Damage', 'Range']);

  for(var armor in armors) {
    rules.choiceRules(rules, 'Armor', armor, armors[armor]);
  }
  for(var shield in shields) {
    rules.choiceRules(rules, 'Shield', shield, shields[shield]);
  }
  for(var weapon in weapons) {
    var pattern = weapon.replace(/  */g, '\\s+');
    var prefix =
      weapon.charAt(0).toLowerCase() + weapon.substring(1).replaceAll(' ', '');
    rules.choiceRules(rules, 'Goody', weapon,
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
    rules.choiceRules(rules, 'Weapon', weapon, weapons[weapon]);
  }

  rules.defineRule
    ('armorClass', 'combatNotes.dexterityArmorClassAdjustment', '+', null);
  rules.defineRule('attacksPerRound', '', '=', '1');
  rules.defineRule('combatNotes.weaponSpecialization',
    'weaponSpecialization', '=', 'source == "None" ? null : source'
  );
  rules.defineRule
    ('combatNotes.weaponSpecialization.1', 'weaponSpecialization', '=', '1');
  rules.defineRule
    ('combatNotes.weaponSpecialization.2', 'weaponSpecialization', '=', '2');
  rules.defineRule('combatNotes.weaponSpecialization.3',
    'weaponSpecialization', '?', 'source != "None"',
    'level', '=', 'Math.floor(source / 2)'
  );
  rules.defineRule('combatNotes.doubleSpecialization',
    'doubleSpecialization', '?', null,
    'weaponSpecialization', '=', 'source == "None" ? null : source'
  );
  rules.defineRule
    ('features.Double Specialization', 'doubleSpecialization', '=', null);
  rules.defineRule
    ('features.Weapon Specialization', 'weaponSpecialization', '=', null);
  // Initial baseAttack value for classless characters, set lower than the
  // level 1 base attack value for any class.
  rules.defineRule('baseAttack', '', '=', '-2');
  rules.defineRule('meleeAttack', 'baseAttack', '=', null);
  rules.defineRule('rangedAttack', 'baseAttack', '=', null);
  rules.defineRule('thac0Melee',
    'meleeAttack', '=', 'Math.min(20 - source, 20)',
    'combatNotes.strengthAttackAdjustment', '+', '-source'
  );
  rules.defineRule('thac0Ranged',
    'rangedAttack', '=', 'Math.min(20 - source, 20)',
    'combatNotes.dexterityAttackAdjustment', '+', '-source'
  );
  rules.defineRule('thac10Melee',
    'meleeAttack', '=', '10 - source',
    'combatNotes.strengthAttackAdjustment', '+', '-source'
  );
  rules.defineRule('thac10Ranged',
    'rangedAttack', '=', '10 - source',
    'combatNotes.dexterityAttackAdjustment', '+', '-source'
  );
  rules.defineRule('turnUndeadColumn',
    'turningLevel', '=',
    'source <= 8 ? source : source <= 13 ? 9 : source <= 18 ? 10 : 11'
  );
  var turningTable = [
    'skeleton:10:7 :4 :T :T :D :D :D :D :D :D',
    'zombie  :13:10:7 :T :T :D :D :D :D :D :D',
    'ghoul   :16:13:10:4 :T :T :D :D :D :D :D',
    'shadow  :19:16:13:7 :4 :T :T :D :D :D :D',
    'wight   :20:19:16:10:7 :4 :T :T :D :D :D',
    'ghast   :- :20:19:13:10:7 :4 :T :T :D :D',
    'wraith  :- :- :20:16:13:10:7 :4 :T :T :D',
    'mummy   :- :- :- :19:16:13:10:7 :4 :T :D',
    'spectre :- :- :- :20:19:16:13:10:7 :T :T',
    'vampire :- :- :- :- :20:19:16:13:10:7 :4',
    'ghost   :- :- :- :- :- :20:19:16:13:10:7',
    'lich    :- :- :- :- :- :- :20:19:16:13:10',
    'fiend   :- :- :- :- :- :- :- :20:19:16:13'
  ];
  for(var i = 0; i < turningTable.length; i++) {
    rules.defineRule('turnUndead.' + turningTable[i].split(':')[0].trim(),
      'turnUndeadColumn', '=', '"' + turningTable[i] +'".split(":")[source].trim()'
    );
  }
  rules.defineRule
    ('skillNotes.armorSkillModifiers', 'sumThiefSkills', '?', '1');
  // Replace SRD35's two-handedWeapon validation note
  delete rules.choices.notes['validationNotes.two-handedWeapon'];
  rules.defineChoice
    ('notes', 'validationNotes.two-handedWeapon:Requires shield == "None"');
  rules.defineRule('weapons.Unarmed', '', '=', '1');
  rules.defineRule('weaponProficiencyCount', 'weapons.Unarmed', '=', '1');
  rules.defineRule('weaponProficiency.Unarmed', 'weapons.Unarmed', '=', '1');

};

/* Defines rules related to basic character identity. */
OSRIC.identityRules = function(rules, alignments, classes, races) {

  QuilvynUtils.checkAttrTable(alignments, []);
  QuilvynUtils.checkAttrTable
    (classes, ['Require', 'HitDie', 'Attack', 'WeaponProficiency', 'NonweaponProficiency', 'Breath', 'Death', 'Petrification', 'Spell', 'Wand', 'Features', 'Selectables', 'Experience', 'CasterLevelArcane', 'CasterLevelDivine', 'SpellAbility', 'SpellSlots']);
  QuilvynUtils.checkAttrTable(races, ['Require', 'Features', 'Selectables', 'Languages']);

  for(var alignment in alignments) {
    rules.choiceRules(rules, 'Alignment', alignment, alignments[alignment]);
  }
  for(var clas in classes) {
    rules.choiceRules(rules, 'Class', clas, classes[clas]);
  }
  for(var race in races) {
    rules.choiceRules(rules, 'Race', race, races[race]);
  }

  // Rules that apply to multiple classes or races
  rules.defineRule('casterLevel',
    'casterLevelArcane', '=', null,
    'casterLevelDivine', '+=', null
  );
  rules.defineRule
    ('combatNotes.fightingTheUnskilled', 'warriorLevel', '+=', null);
  rules.defineRule('level', /^levels\./, '+=', null);
  rules.defineRule
    ('saveNotes.resistMagic', 'constitution', '=', 'Math.floor(source / 3.5)');
  rules.defineRule
    ('saveNotes.resistPoison', 'constitution', '=', 'Math.floor(source / 3.5)');
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

  QuilvynUtils.checkAttrTable(schools, ['Features']);
  QuilvynUtils.checkAttrTable
    (spells, ['School', 'Level', 'Description', 'Effect', 'Duration', 'Range']);

  for(var school in schools) {
    rules.choiceRules(rules, 'School', school, schools[school]);
  }
  for(var level = 1; level <= 9; level++) {
    rules.defineRule
      ('spellSlots.W' + level, 'magicNotes.schoolSpecialization', '+', '1');
  }
  for(var spell in spells) {
    if(spell.match(/\s[A-Z]\d$/))
      continue;
    var groupLevels = QuilvynUtils.getAttrValueArray(spells[spell], 'Level');
    for(var i = 0; i < groupLevels.length; i++) {
      var groupLevel = groupLevels[i];
      var attrs =
        spells[spell] + ' ' + (spells[spell + ' ' + groupLevel] || '');
      rules.choiceRules(rules, 'Spell', spell, attrs + ' Level=' + groupLevel);
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

  for(var feature in features) {
    rules.choiceRules(rules, 'Feature', feature, features[feature]);
  }
  for(var goody in goodies) {
    rules.choiceRules(rules, 'Goody', goody, goodies[goody]);
  }
  for(var language in languages) {
    rules.choiceRules(rules, 'Language', language, languages[language]);
  }
  for(var skill in skills) {
    rules.choiceRules(rules, 'Goody', skill,
      'Pattern="([-+]\\d).*\\s+' + skill + '\\s+Skill|' + skill + '\\s+skill\\s+([-+]\\d)"' +
      'Effect=add ' +
      'Value="$1 || $2" ' +
      'Attribute="skillModifier.' + skill + '" ' +
      'Section=skill Note="%V ' + skill + '"'
    );
    rules.choiceRules(rules, 'Skill', skill, skills[skill]);
  }
  QuilvynRules.validAllocationRules
    (rules, 'language', 'languageCount', 'Sum "^languages\\."');
  QuilvynRules.validAllocationRules
    (rules, 'nonweaponProficiency', 'nonweaponProficiencyCount', 'sumNonThiefSkills');

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
      QuilvynUtils.getAttrValue(attrs, 'Weight'),
      QuilvynUtils.getAttrValue(attrs, 'Skill')
    );
  else if(type == 'Class') {
    OSRIC.classRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Experience'),
      QuilvynUtils.getAttrValueArray(attrs, 'HitDie'),
      QuilvynUtils.getAttrValueArray(attrs, 'Attack'),
      QuilvynUtils.getAttrValueArray(attrs, 'Breath'),
      QuilvynUtils.getAttrValueArray(attrs, 'Death'),
      QuilvynUtils.getAttrValueArray(attrs, 'Petrification'),
      QuilvynUtils.getAttrValueArray(attrs, 'Spell'),
      QuilvynUtils.getAttrValueArray(attrs, 'Wand'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Selectables'),
      QuilvynUtils.getAttrValueArray(attrs, 'Languages'),
      QuilvynUtils.getAttrValueArray(attrs, 'WeaponProficiency'),
      QuilvynUtils.getAttrValueArray(attrs, 'NonweaponProficiency'),
      QuilvynUtils.getAttrValue(attrs, 'CasterLevelArcane'),
      QuilvynUtils.getAttrValue(attrs, 'CasterLevelDivine'),
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
      QuilvynUtils.getAttrValueArray(attrs, 'Selectables'),
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
    var description = QuilvynUtils.getAttrValue(attrs, 'Description');
    var duration = QuilvynUtils.getAttrValue(attrs, 'Duration');
    var effect =  QuilvynUtils.getAttrValue(attrs, 'Effect');
    var groupLevels = QuilvynUtils.getAttrValueArray(attrs, 'Level');
    var range = QuilvynUtils.getAttrValue(attrs, 'Range');
    var school = QuilvynUtils.getAttrValue(attrs, 'School');
    var schoolAbbr = school.substring(0, 4);
    for(var i = 0; i < groupLevels.length; i++) {
      var matchInfo = groupLevels[i].match(/^(\D+)(\d+)$/);
      if(!matchInfo) {
        console.log('Bad level "' + groupLevels[i] + '" for spell ' + name);
        continue;
      }
      var group = matchInfo[1];
      var level = matchInfo[2] * 1;
      var fullName = name + '(' + group + level + ' ' + schoolAbbr + ')';
      OSRIC.spellRules
        (rules, fullName, school, group, level, description, duration, effect,
         range);
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
  if(type != 'Feature' && type != 'Spell') {
    type = type == 'Class' ? 'levels' :
    (type.substring(0,1).toLowerCase() + type.substring(1).replaceAll(' ', '') + 's');
    rules.addChoice(type, name, attrs);
  }
};

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
 * #maxMove#, weighs #weight# pounds, and modifies skills as specified in
 * #skill#.
 */
OSRIC.armorRules = function(rules, name, ac, maxMove, weight, skill) {

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
  if(skill && typeof skill != 'string') {
    console.log('Bad skill "' + skill + '" for armor ' + name);
    return;
  }

  if(rules.armorStats == null) {
    rules.armorStats = {
      ac:{},
      move:{},
      weight:{},
      skill:{}
    };
  }
  rules.armorStats.ac[name] = ac;
  rules.armorStats.move[name] = maxMove;
  rules.armorStats.weight[name] = weight;
  rules.armorStats.skill[name] = skill;

  rules.defineRule('abilityNotes.armorSpeedMaximum',
    'armor', '+', QuilvynUtils.dictLit(rules.armorStats.move) + '[source]'
  );
  rules.defineRule('armorClass',
    '', '=', '10',
    'armor', '+', '-' + QuilvynUtils.dictLit(rules.armorStats.ac) + '[source]'
  );
  rules.defineRule('armorWeight',
    'armor', '=', QuilvynUtils.dictLit(rules.armorStats.weight) + '[source]'
  );

};

/*
 * Defines in #rules# the rules associated with class #name#, which has the list
 * of hard prerequisites #requires#. #experience# lists the experience point
 * progression required to advance levels in the class. #hitDie# is a triplet
 * indicating the additional hit points granted with each level advance--the
 * first element (format [n]'d'n) specifies the number of side on each die,
 * the second the maximum number of hit dice for the class, and the third the
 * number of points added each level after the maximum hit dice are reached.
 * #hitDie# (format [n]'d'n) additional hit points with each level advance.
 * #attack# is a quadruplet indicating: the attack bonus for a level 1
 * character; the amount this increases as the character gains levels; the
 * number of levels between increases; any adjustment in this pattern at a
 * specific level. Similarly, #saveBreath#, #saveDeath#, #savePetrification#,
 * #saveSpell#, and #saveWand# are each triplets indicating: the saving throw
 * for a level 1 character; the amount this decreases as the character gains
 * levels; the number of levels between decreases. #features# and #selectables#
 * list the fixed and selectable features acquired as the character advances in
 * class level, and #languages# lists any automatic languages for the class.
 * #weaponProficiency# is a triplet indicating: the number of weapon
 * proficiencies for a level 1 character; the number of levels between
 * increments of weapon proficiencies; the penalty for using a non-proficient
 * weapon. #weaponProficiency# is a pair indicating the number of nonweapon
 * proficiencies for a level 1 character and the number of levels between
 * increments of nonweapon proficiencies. #casterLevelArcane# and
 * #casterLevelDivine#, if specified, give the Javascript expression for
 * determining the caster level for the class; these can incorporate a class
 * level attribute (e.g., 'levels.Cleric') or the character level attribute
 * 'level'. If the class grants spell slots, #spellSlots# lists the number of
 * spells per level per day granted.
 */
OSRIC.classRules = function(
  rules, name, requires, experience, hitDie, attack, saveBreath, saveDeath,
  savePetrification, saveSpell, saveWand, features, selectables, languages,
  weaponProficiency, nonweaponProficiency, casterLevelArcane,
  casterLevelDivine, spellSlots
) {

  if(!name) {
    console.log('Empty class name');
    return;
  }
  if(!Array.isArray(requires)) {
    console.log('Bad requires list "' + requires + '" for class ' + name);
    return;
  }
  if(!Array.isArray(experience)) {
    console.log('Bad experience "' + experience + '" for class ' + name);
    return;
  }
  if(!Array.isArray(hitDie) || hitDie.length != 3) {
    console.log('Bad hitDie "' + hitDie + '" for class ' + name);
    return;
  }
  if(!Array.isArray(attack) || attack.length != 4) {
    console.log('Bad attack "' + attack + '" for class ' + name);
    return;
  }
  if(!Array.isArray(saveBreath) || saveBreath.length != 3 ||
     typeof saveBreath[0] != 'number' ||
     !(saveBreath[1] + '').match(/^\d+(\.\d+)?$/)) {
    console.log('Bad saveBreath "' + saveBreath + '" for class ' + name);
    return;
  }
  if(!Array.isArray(saveDeath) || saveDeath.length != 3 ||
     typeof saveDeath[0] != 'number' ||
    !(saveDeath[1] + '').match(/^\d+(\.\d+)?$/)) {
    console.log('Bad saveDeath "' + saveDeath + '" for class ' + name);
    return;
  }
  if(!Array.isArray(savePetrification) || savePetrification.length != 3 ||
     typeof savePetrification[0] != 'number' ||
     !(savePetrification[1] + '').match(/^\d+(\.\d+)?$/)) {
    console.log('Bad savePetrification "' + savePetrification + '" for class ' + name);
    return;
  }
  if(!Array.isArray(saveSpell) || saveSpell.length != 3 ||
     typeof saveSpell[0] != 'number' ||
     !(saveSpell[1] + '').match(/^\d+(\.\d+)?$/)) {
    console.log('Bad saveSpell "' + saveSpell + '" for class ' + name);
    return;
  }
  if(!Array.isArray(saveWand) || saveWand.length != 3 ||
     typeof saveWand[0] != 'number' ||
     !(saveWand[1] + '').match(/^\d+(\.\d+)?$/)) {
    console.log('Bad saveWand "' + saveWand + '" for class ' + name);
    return;
  }
  if(!Array.isArray(features)) {
    console.log('Bad features list "' + features + '" for class ' + name);
    return;
  }
  if(!Array.isArray(selectables)) {
    console.log('Bad selectables list "' + selectables + '" for class ' + name);
    return;
  }
  if(!Array.isArray(languages)) {
    console.log('Bad languages list "' + languages + '" for class ' + name);
    return;
  }
  if(!Array.isArray(weaponProficiency) || weaponProficiency.length != 3) {
    console.log('Bad weaponProficiency "' + weaponProficiency + '" for class ' + name);
    return;
  }
  if(!Array.isArray(nonweaponProficiency) ||
     (nonweaponProficiency.length != 2 && nonweaponProficiency.length != 0)) {
    console.log('Bad nonweaponProficiency "' + nonweaponProficiency + '" for class ' + name);
    return;
  }
  if(!Array.isArray(spellSlots)) {
    console.log('Bad spellSlots list "' + spellSlots + '" for class ' + name);
    return;
  }

  var classLevel = 'levels.' + name;
  var prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '');

  if(requires.length > 0)
    QuilvynRules.prerequisiteRules
      (rules, 'validation', prefix + 'Class', classLevel, requires);

  rules.defineChoice('notes', 'experiencePoints.' + name + ':%V/%1');
  for(var i = 0; i < experience.length; i++) {
    experience[i] *= 1000;
  }
  rules.defineRule('experiencePoints.' + name + '.1',
    classLevel, '=', 'source < ' + experience.length + ' ? [' + experience + '][source] : "-"'
  );
  rules.defineRule(classLevel,
    'experiencePoints.' + name, '=', 'source >= ' + experience[experience.length - 1] + ' ? ' + experience.length + ' : [' + experience + '].findIndex(item => item > source)'
  );

  var attackStep = '';
  if(attack[3].includes('@')) {
    attackStep = attack[3].split('@');
    attackStep =
      ' + (source>=' + attackStep[1] + ' ? ' + attackStep[0] + ' : 0)';
  }
  rules.defineRule('baseAttack',
    classLevel, '^=', attack[0] + ' + Math.floor((source - 1) / ' + attack[2] + ') * ' + attack[1] + attackStep
  );

  var extraHitDie = (hitDie[0] + '').startsWith('2');
  rules.defineRule('hitDice',
    classLevel, '^=',
      'Math.min(source' + (extraHitDie ? ' + 1' : '') + ', ' + hitDie[1] + ')'
  );

  var saves = {
    'Breath':saveBreath, 'Death':saveDeath, 'Petrification':savePetrification,
    'Spell':saveSpell, 'Wand':saveWand
  };
  for(var save in saves) {
    rules.defineRule('class' + name + save + 'Save',
      classLevel, '=', saves[save][0] + ' - Math.floor(Math.floor((source - 1) / ' + saves[save][2] + ') * ' + saves[save][1] + ')',
      'class' + name + 'SaveAdjustment', '+', null
    );
    rules.defineRule
      ('save.' + save, 'class' + name + save + 'Save', 'v=', null);
  }
  rules.defineRule('class' + name + 'BreathSave',
    'class' + name + 'BreathSaveAdjustment', '+', null
  );

  QuilvynRules.featureListRules(rules, features, name, classLevel, false);
  rules.defineSheetElement(name + ' Features', 'Feats+', null, '; ');
  rules.defineChoice('extras', prefix + 'Features');

  if(languages.length > 0)
    rules.defineRule('languageCount', classLevel, '+', languages.length);
  for(var i = 0; i < languages.length; i++) {
    if(languages[i] != 'any')
      rules.defineRule('languages.' + languages[i], classLevel, '=', '1');
  }

  rules.defineRule('weaponProficiencyCount',
    'levels.' + name, '+', weaponProficiency[0] + ' + Math.floor(source / ' + weaponProficiency[1] + ')'
  );
  rules.defineRule('weaponNonProficiencyPenalty',
    'levels.' + name, '^=', weaponProficiency[2]
  );
  if(nonweaponProficiency.length == 2)
    rules.defineRule('nonweaponProficiencyCount',
      'levels.' + name, '+=', nonweaponProficiency[0] + ' + Math.floor(source / ' + nonweaponProficiency[1] + ')'
    );

  if(spellSlots.length > 0) {
    var casterLevelExpr = casterLevelArcane || casterLevelDivine || classLevel;
    if(casterLevelExpr.match(new RegExp('\\b' + classLevel + '\\b', 'i'))) {
      rules.defineRule('casterLevels.' + name,
        classLevel, '=', casterLevelExpr.replace(new RegExp('\\b' + classLevel + '\\b', 'gi'), 'source')
      );
    } else {
      rules.defineRule('casterLevels.' + name,
        classLevel, '?', null,
        'level', '=', casterLevelExpr.replace(new RegExp('\\blevel\\b', 'gi'), 'source')
      );
    }
    if(casterLevelArcane)
      rules.defineRule('casterLevelArcane', 'casterLevels.' + name, '+=', null);
    if(casterLevelDivine)
      rules.defineRule('casterLevelDivine', 'casterLevels.' + name, '+=', null);
    QuilvynRules.spellSlotRules(rules, classLevel, spellSlots);
    for(var j = 0; j < spellSlots.length; j++) {
      var spellTypeAndLevel = spellSlots[j].split(/:/)[0];
      var spellType = spellTypeAndLevel.replace(/\d+/, '');
      if(spellType != name)
        rules.defineRule('casterLevels.' + spellType,
          'casterLevels.' + name, '=', null
        );
    }
  }

};

/*
 * Defines in #rules# the rules associated with class #name# that cannot be
 * derived directly from the abilities passed to classRules.
 */
OSRIC.classRulesExtra = function(rules, name) {

  var classLevel = 'levels.' + name;

  if(name == 'Assassin') {

    rules.defineRule('abilityNotes.limitedHenchmenClasses',
      classLevel, '=', 'source<8 ? "assassins" : source<12 ? "assassins and thieves" : "any class"'
    );
    rules.defineRule('abilityNotes.delayedHenchmen', classLevel, '=', '4');
    rules.defineRule
      ('combatNotes.assassination', classLevel, '=', '5 * source + 50');
    rules.defineRule('combatNotes.backstab',
      classLevel, '+=', 'Math.min(Math.ceil(source / 4) + 1, 5)'
    );
    rules.defineRule('maximumHenchmen', classLevel, 'v', 'source<4 ? 0 : null');
    rules.defineRule('skillNotes.bonusLanguages',
      'intelligence', '=', 'source>14 ? source - 14 : null',
      classLevel, 'v', 'Math.min(source - 8, 4)'
    );
    rules.defineRule('assassinFeatures.Thief Skills', classLevel, '=', '1');
    // Unclear whether Assassins have same chance of failure as Thieves
    rules.defineRule
      ('magicNotes.readScrolls', 'intelligence', '=', 'source * 5 - 10');
    var skillLevel = 'source>2 ? source - 2 : 1';
    rules.defineRule('skillLevel.Climb Walls', classLevel, '+=', skillLevel);
    rules.defineRule('skillLevel.Find Traps', classLevel, '+=', skillLevel);
    rules.defineRule('skillLevel.Hear Noise', classLevel, '+=', skillLevel);
    rules.defineRule
      ('skillLevel.Hide In Shadows', classLevel, '+=', skillLevel);
    rules.defineRule('skillLevel.Move Silently', classLevel, '+=', skillLevel);
    rules.defineRule('skillLevel.Open Locks', classLevel, '+=', skillLevel);
    rules.defineRule('skillLevel.Pick Pockets', classLevel, '+=', skillLevel);
    rules.defineRule('skillLevel.Read Languages', classLevel, '+=', skillLevel);

  } else if(name == 'Cleric') {

    var t = 'C';

    rules.defineRule('classClericSaveAdjustment',
      classLevel, '=', 'source>=19 ? -2 : source>=7 ? -1 : null'
    );
    rules.defineRule('magicNotes.bonusClericSpells',
      'wisdom', '=',
       '"Spell level ' + t + '1" + ' +
       '(source>=14 ? source>=19 ? "x3" : "x2" : "") + ' +
       '(source>=15 ? ", ' + t + '2" : "") + ' +
       '(source>=16 ? "x2"  : "") + ' +
       '(source>=17 ? ", ' + t + '3" : "") + ' +
       '(source>=18 ? ", ' + t + '4" : "")'
    );
    rules.defineRule('magicNotes.clericSpellFailure',
      'wisdom', '=', 'Math.max((12 - source) * 5, 1)'
    );
    for(var level = 1; level <= 4; level++) {
      rules.defineRule('spellSlots.' + t + level,
        'magicNotes.bonusClericSpells', '+', 'source.match(/' + t + level + 'x3/) ? 3 : source.match(/' + t + level + 'x2/) ? 2 : source.match(/' + t + level + '/) ? 1 : 0'
      );
    }
    rules.defineRule('turningLevel', classLevel, '+=', null);

  } else if(name == 'Druid') {

    var t = 'D';

    rules.defineRule('classDruidSaveAdjustment',
      classLevel, '=', 'source>=19 ? -2 : source>=7 ? -1 : null'
    );
    rules.defineRule('languageCount', classLevel, '+', '1');
    rules.defineRule("languages.Druids' Cant", classLevel, '=', '1');
    rules.defineRule('magicNotes.bonusDruidSpells',
      'wisdom', '=',
       '"Spell level ' + t + '1" + ' +
       '(source>=14 ? source>=19 ? "x3" : "x2" : "") + ' +
       '(source>=15 ? ", ' + t + '2" : "") + ' +
       '(source>=16 ? "x2"  : "") + ' +
       '(source>=17 ? ", ' + t + '3" : "") + ' +
       '(source>=18 ? ", ' + t + '4" : "")'
    );
    for(var level = 1; level <= 4; level++) {
      rules.defineRule('spellSlots.' + t + level,
        'magicNotes.bonusDruidSpells', '+', 'source.match(/' + t + level + 'x3/) ? 3 : source.match(/' + t + level + 'x2/) ? 2 : source.match(/' + t + level + '/) ? 1 : 0'
      );
    }

  } else if(name == 'Fighter') {

    rules.defineRule('attacksPerRound', 'combatNotes.bonusAttacks', '+', null);
    rules.defineRule('classFighterBreathSaveAdjustment',
      classLevel, '=', 'source>=17 ? -2 : -Math.floor((source - 1) / 4)'
    );
    rules.defineRule
      ('classFighterSaveAdjustment', classLevel, '=', 'source<17 ? null : 1');
    rules.defineRule('combatNotes.bonusAttacks',
      classLevel, '+=', 'source<7 ? null : source<13 ? 0.5 : 1'
    );
    rules.defineRule('warriorLevel', classLevel, '+', null);

  } else if(name == 'Illusionist') {

    rules.defineRule('wizardLevel', classLevel, '+=', null);

  } else if(name == 'Magic User') {

    rules.defineRule('wizardLevel', classLevel, '+=', null);
    rules.defineRule('maximumSpellsPerLevel',
      'wizardLevel', '?', null,
      'intelligence', '=',
        'source==9 ? 6 : source<=12 ? 7 : source<=14 ? 9 : source<=16 ? 11 : ' +
        'source==17 ? 14 : source==18 ? 18 : 22'
    );
    rules.defineRule('understandSpell',
      'wizardLevel', '?', null,
      'intelligence', '=',
        'source>=19 ? 90 : ' +
          'source==18 ? 85 : source==17 ? 75 : source>=15 ? 65 : ' +
          'source>=13 ? 55 : source>=10 ? 45 : 35'
    );
    rules.defineRule('magicNotes.eldritchCraft.1', '', '=', '""');
    rules.defineRule('magicNotes.eldritchCraft.1',
      classLevel, '=', 'source<11 ? " with aid of an alchemist" : null'
    );

  } else if(name == 'Paladin') {

    rules.defineRule('attacksPerRound', 'combatNotes.bonusAttacks', '+', null);
    rules.defineRule('combatNotes.bonusAttacks',
      classLevel, '+=', 'source<8 ? null : source<15 ? 0.5 : 1'
    );
    rules.defineRule('paladinSaveMin', classLevel, '=', '2');
    rules.defineRule('save.Breath', 'paladinSaveMin', '^', null);
    rules.defineRule('save.Death', 'paladinSaveMin', '^', null);
    rules.defineRule('save.Petrification', 'paladinSaveMin', '^', null);
    rules.defineRule('classPaladinBreathSaveAdjustment',
      classLevel, '=', 'source>=17 ? -2 : -Math.floor((source - 1) / 4)'
    );
    rules.defineRule
      ('classPaladinSaveAdjustment', classLevel, '=', 'source<17 ? null : 1');
    rules.defineRule
      ('magicNotes.cureDisease', classLevel, '=', 'Math.ceil(source / 5)');
    rules.defineRule('magicNotes.layOnHands', classLevel, '=', '2 * source');
    rules.defineRule
      ('turningLevel', classLevel, '+=', 'source>2 ? source - 2 : null');
    rules.defineRule('warriorLevel', classLevel, '+', null);

  } else if(name == 'Ranger') {

    rules.defineRule('attacksPerRound', 'combatNotes.bonusAttacks', '+', null);
    rules.defineRule('combatNotes.bonusAttacks',
      classLevel, '+=', 'source<8 ? null : source<15 ? 0.5 : 1'
    );
    rules.defineRule('combatNotes.damageBonus', classLevel, '=', null);
    rules.defineRule('abilityNotes.delayedHenchmen', classLevel, '=', '8');
    rules.defineRule('classRangerBreathSaveAdjustment',
      classLevel, '=', 'source>=17 ? -2 : -Math.floor((source - 1) / 4)'
    );
    rules.defineRule
      ('classRangerSaveAdjustment', classLevel, '=', 'source<17 ? null : 1');
    rules.defineRule('maximumHenchmen',
      // Noop to show Delayed Henchmen note in italics
      'abilityNotes.delayedHenchmen', '+', 'null',
      classLevel, 'v', 'source<8 ? 0 : null'
    );
    rules.defineRule('warriorLevel', classLevel, '+', null);

  } else if(name == 'Thief') {

    rules.defineRule('combatNotes.backstab',
      classLevel, '+=', 'Math.min(Math.ceil(source / 4) + 1, 5)'
    );
    rules.defineRule('languageCount', classLevel, '+', '1');
    rules.defineRule("languages.Thieves' Cant", classLevel, '=', '1');
    rules.defineRule
      ('magicNotes.readScrolls', 'intelligence', '=', 'source * 5 - 10');

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
  // No changes needed to the rules defined by SRD35 method
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
 * of hard prerequisites #requires#. #features# and #selectables# list
 * associated features and #languages# any automatic languages.
 */
OSRIC.raceRules = function(
  rules, name, requires, features, selectables, languages
) {
  SRD35.raceRules(
    rules, name, requires, features, selectables, languages, null, [], [], null
  );
  // No changes needed to the rules defined by SRD35 method
  rules.defineRule
    ('skillNotes.raceSkillModifiers', 'sumThiefSkills', '?', '1');
};

/*
 * Defines in #rules# the rules associated with race #name# that cannot be
 * derived directly from the abilities passed to raceRules.
 */
OSRIC.raceRulesExtra = function(rules, name) {

  var raceLevel =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '') + 'Level';

  if(name == 'Dwarf') {
    rules.defineRule('featureNotes.detectSlope', raceLevel, '+=', '75');
    rules.defineRule('featureNotes.determineDepth', raceLevel, '+=', '50');
    rules.defineRule('skillNotes.intelligenceLanguageBonus',
      raceLevel, 'v', '2',
      '', '^', '0'
    );
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=',
        '"-10% Climb Walls/+15% Find Traps/-5% Move Silently/+15% Open Locks/-5% Read Languages"'
    );
  } else if(name == 'Elf') {
    rules.defineRule('saveNotes.resistCharm', raceLevel, '+=', '90');
    rules.defineRule('saveNotes.resistSleep', raceLevel, '+=', '90');
    rules.defineRule('skillNotes.intelligenceLanguageBonus',
      raceLevel, '+', '-4',
      '', '^', '0'
    );
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=',
        '"-5% Climb Walls/+5% Find Traps/+5% Hear Noise/+10% Hide In Shadows/+5% Move Silently/-5% Open Locks/+5% Pick Pockets/+10% Read Languages"'
    );
  } else if(name == 'Gnome') {
    rules.defineRule('featureNotes.detectSlope', raceLevel, '+=', '80');
    rules.defineRule('featureNotes.determineDepth', raceLevel, '+=', '60');
    rules.defineRule('skillNotes.intelligenceLanguageBonus',
      raceLevel, 'v', '2',
      '', '^', '0'
    );
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=', '"-15% Climb Walls/+5% Hear Noise/+10% Open Locks"'
    );
  } else if(name == 'Half-Elf') {
    rules.defineRule('saveNotes.resistCharm', raceLevel, '+=', '30');
    rules.defineRule('saveNotes.resistSleep', raceLevel, '+=', '30');
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=', '"+5% Hide In Shadows/+10% Pick Pockets"'
    );
  } else if(name == 'Half-Orc') {
    rules.defineRule('skillNotes.intelligenceLanguageBonus',
      raceLevel, 'v', '2',
      '', '^', '0'
    );
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=',
        '"+5% Climb Walls/+5% Find Traps/+5% Hear Noise/+5% Open Locks/-5% Pick Pockets/-10% Read Languages"'
    );
  } else if(name == 'Halfling') {
    rules.defineRule('featureNotes.detectSlope', raceLevel, '+=', '75');
    rules.defineRule('skillNotes.intelligenceLanguageBonus',
      raceLevel, '+', '-5',
      '', '^', '0'
    );
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=',
        '"-15% Climb Walls/+5% Hear Noise/+15% Hide In Shadows/+15% Move Silently/+5% Pick Pockets/-5% Read Languages"'
    );
  } else if(name == 'Human') {
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=', '"+5% Climb Walls/+5% Open Locks"',
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
    'shield', '+', '-' + QuilvynUtils.dictLit(rules.shieldStats.ac) + '[source]'
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

  for(var i = 0; i < classes.length; i++) {
    var clas = classes[i];
    if(clas == 'all')
      rules.defineRule('classSkill.' + name, 'level', '=', '1');
    else
      rules.defineRule('classSkill.' + name, 'levels.' + clas, '=', '1');
  }
  rules.defineRule('skillModifier.' + name,
    'skills.' + name, '=', null,
    'skillNotes.armorSkillModifiers', '+',
      'source.match(/' + name + '/) ? source.match(/([-+]\\d+)% ' + name + '/)[1] * 1 : null',
    'skillNotes.raceSkillModifiers', '+',
      'source.match(/' + name + '/) ? source.match(/([-+]\\d+)% ' + name + '/)[1] * 1 : null',
    'skillNotes.dexteritySkillModifiers', '+',
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
  rules, name, school, casterGroup, level, description, duration, effect, range
) {
  if(duration != null)
    description = description.replaceAll('$D', duration);
  if(effect != null)
    description = description.replaceAll('$E', effect);
  if(range != null)
    description = description.replaceAll('$R', range);
  if(school == 'All') // Cantrip spell
    school = 'Conjuration';
  SRD35.spellRules(rules, name, school, casterGroup, level, description, false);
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
  var prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '');
  SRD35.weaponRules(rules, name, 0, category, damage, 20, 2, range);
  // Override effect of melee/rangedAttack, since those values are incorporated
  // into THACO/THAc10.
  if(category.match(/^R/i))
    rules.defineRule(prefix + 'AttackModifier', 'rangedAttack', '=', '0');
  else
    rules.defineRule(prefix + 'AttackModifier', 'meleeAttack', '=', '0');
  delete rules.getChoices('notes')['weapons.' + name];
  rules.defineChoice
    ('notes', 'weapons.' + name + ':%V (%1 %2%3' + (range ? ' R%5\')' : ')'));
  var specializationAttackBonus = 1;
  var specializationDamageBonus = 2
  rules.defineRule(prefix + 'AttackModifier',
    'combatNotes.weaponSpecialization', '+',
      'source == "' + name + '" ? ' + specializationAttackBonus + ' : null'
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
    'combatNotes.weaponSpecialization', '+',
      'source == "' + name + '" ? ' + specializationDamageBonus + ' : null'
  );
  rules.defineRule('combatNotes.nonproficientWeaponPenalty.' + name,
    'weapons.' + name, '?', null,
    'weaponProficiencyLevelShortfall.' + name, '?', 'source > 0',
    'weaponNonProficiencyPenalty', '=', '-source'
  );
  rules.defineRule('weaponProficiencyLevelShortfall.' + name,
    'weapons.' + name, '?', null,
    'weaponNonProficiencyPenalty', '=', '1',
    'weaponProficiency.' + name, 'v', '0'
  );
};

/*
 * Returns the list of editing elements needed by #choiceRules# to add a #type#
 * item to #rules#.
 */
OSRIC.choiceEditorElements = function(rules, type) {
  var result = [];
  if(type == 'Armor' || type == 'Shield')
    result.push(
      ['AC', 'AC Bonus', 'select-one', [0, 1, 2, 3, 4, 5]],
      ['Move', 'Max Movement', 'select-one', [60, 90, 120]]
    );
  else if(type == 'Class')
    result.push(
      ['Require', 'Prerequisites', 'text', [40]],
      ['HitDie', 'Hit Die', 'select-one', ['d4', 'd6', 'd8', 'd10', 'd12']],
      ['Attack', 'Base Attack', 'text', [20]],
      ['WeaponProficiency', 'Weapon Proficiency', 'text', [20]],
      ['Breath', 'Breath Save', 'text', [20]],
      ['Death', 'Death Save', 'text', [20]],
      ['Petrification', 'Petrification Save', 'text', [20]],
      ['Spell', 'Spell Save', 'text', [20]],
      ['Wand', 'Wand Save', 'text', [20]],
      ['Features', 'Features', 'text', [40]],
      ['Languages', 'Languages', 'text', [30]],
      ['CasterLevelArcane', 'Arcane Level', 'text', [10]],
      ['CasterLevelDivine', 'Divine Level', 'text', [10]],
      ['SpellAbility', 'Spell Ability', 'select-one', ['charisma', 'constitution', 'dexterity', 'intelligence', 'strength', 'wisdom']],
      ['SpellSlots', 'Spell Slots', 'text', [40]],
      ['Spells', 'Spells', 'text', [40]]
    );
  else if(type == 'Weapon') {
    var zeroToOneFifty =
     [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
    result.push(
      ['Category', 'Category', 'select-one',
       ['Unarmed', 'Light', 'One-Handed', 'Two-Handed', 'Ranged']],
      ['Damage', 'Damage', 'select-one',
       QuilvynUtils.getKeys(SRD35.LARGE_DAMAGE)],
      ['Range', 'Range in Feet', 'select-one', zeroToOneFifty]
    );
  } else
    result = SRD35.choiceEditorElements(rules, type);
  return result;
};

/* Returns the elements in a basic OSRIC character editor. */
OSRIC.initialEditorElements = function() {
  var abilityChoices = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
  ];
  var editorElements = [
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
    ['weapons', 'Weapons', 'bag', 'weapons'],
    ['weaponProficiency', 'Weapon Proficiency', 'set', 'weapons'],
    ['weaponSpecialization', 'Specialization', 'select-one',
     ['None'].concat(QuilvynUtils.getKeys(OSRIC.WEAPONS))],
    ['doubleSpecialization', '', 'checkbox', ['Doubled']],
    ['spells', 'Spells', 'fset', 'spells'],
    ['notes', 'Notes', 'textarea', [40,10]],
    ['hiddenNotes', 'Hidden Notes', 'textarea', [40,10]]
  ];
  return editorElements;
};

/* Sets #attributes#'s #attribute# attribute to a random value. */
OSRIC.randomizeOneAttribute = function(attributes, attribute) {
  var attr;
  var attrs;
  var choices;
  var howMany;
  var matchInfo;
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
    var allClasses = this.getChoices('levels');
    var classCount = 0;
    attrs = this.applyRules(attributes);
    for(var clas in allClasses) {
      if((attr = attrs['levels.' + clas]) != null)
        classCount++;
    }
    if(attributes.race == 'Human')
      classCount = 1; // Dual class HD aren't divided
    for(var clas in allClasses) {
      if((attr = attrs['levels.' + clas]) == null)
        continue;
      var hitDie = QuilvynUtils.getAttrValueArray(allClasses[clas], 'HitDie');
      matchInfo = hitDie[0].match(/(^|d)(\d+)$/);
      var sides = matchInfo == null ? 6 : (matchInfo[2] * 1);
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
    var classes = this.getChoices('levels');
    var classAttrSet = false;
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
      var max = attrs['experiencePoints.' + attr + '.1'];
      var min;
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
      var which = QuilvynUtils.random(0, choices.length - 1);
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
    var allSkills = this.getChoices('skills');
    for(attr in allSkills) {
      if(!allSkills[attr].match(/Ability/))
        continue; // Thief skill
      if(attributes['skills.' + attr] != null)
        howMany -= attrs['skills.' + attr];
      else
        choices.push(attr);
    }
    for( ; howMany > 0; howMany--) {
      var which = QuilvynUtils.random(0, choices.length - 1);
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
      var which = QuilvynUtils.random(0, choices.length - 1);
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
    for(var i = 0; i < howMany; i++) {
      var index = QuilvynUtils.random(0, choices.length - 1);
      attributes['weapons.' + choices[index]] = 1;
      choices.splice(index, 1);
    }
  } else {
    SRD35.randomizeOneAttribute.apply(this, [attributes, attribute]);
  }
};

/* Returns an array of plugins upon which this one depends. */
OSRIC.getPlugins = function() {
  return [SRD35];
};

/* Returns HTML body content for user notes associated with this rule set. */
OSRIC.ruleNotes = function() {
  return '' +
    '<h2>OSRIC Quilvyn Plugin Notes</h2>\n' +
    'OSRIC Quilvyn Plugin Version ' + OSRIC.VERSION + '\n' +
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
    '</p>\n' +
    '<h3>Usage Notes</h3>\n' +
    '<ul>\n' +
    '  <li>\n' +
    '    For convenience, Quilvyn reports THAC0 values for OSRIC ' +
    '    characters. It also reports THAC10 ("To Hit Armor Class 10"), ' +
    '    which can be more useful with characters who need a 20 to hit AC 0.\n'+
    '  </li><li>\n' +
    '    The OSRIC rules discuss illusionist scrolls, but does not give\n' +
    '    the minimum level required to create them. Quilvyn uses the 1E PHB\n' +
    '    limit of level 10.\n' +
    '  </li><li>\n' +
    '    The OSRIC rules mention that Magic Users of levels 7 through 10 can ' +
    '    create scrolls and potions only with the aid of an alchemist; at ' +
    '    level 11 they can do such crafting unaided.\n' +
    '  </li><li>\n' +
    '    The OSRIC rules are unclear as to whether or not the Fighting the\n' +
    '    Unskilled feature applies to Paladins and Rangers. Quilvyn assumes\n' +
    '    that it does.\n' +
    '  </li><li>\n' +
    '    Quilvyn uses American word spellings.\n' +
    '  </li>\n' +
    '</ul>\n' +
    '\n' +
    '<h3>Limitations</h3>\n' +
    '<ul>\n' +
    '  <li>\n' +
    '    Quilvyn does not note racial restrictions on class and level.\n' +
    '  </li><li>\n' +
    '    Quilvyn does not note class restrictions on weapon choice.\n' +
    '  </li><li>\n' +
    '    Support for character levels 21+ is incomplete.\n' +
    '  </li><li>\n' +
    '    Minimum levels for building strongholds and attracting followers\n' +
    '    are not reported.\n' +
    '  </li><li>\n' +
    '    Quilvyn does not note Halfling characters with a strength of 18,\n' +
    '    nor Elf characters with a constitution of 18.\n' +
    '  </li><li>\n' +
    '    Quilvyn does not report the chance of extraordinary success on\n' +
    '    strength tests for characters with strength 18/91 and higher.\n' +
    '  </li>\n' +
    '</ul>\n';
};
