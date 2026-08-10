Fellowship Gauntlet - Lord of the Rings
=======================================

An HTML5 Gauntlet-style Game themed around The Lord of the Rings.

Play as members of the Fellowship:

* **Aragorn** (Warrior) – Best armor and heavy melee damage, but moves slowly.
* **Gimli** (Valkyrie) – Well-rounded with strong defense and high armor.
* **Gandalf** (Wizard) – Excels at screen-clearing magic and ranged attacks, but has low defense.
* **Legolas** (Elf) – The fastest character, making it easier to outrun hordes of enemies.

Based on the original [Javascript Gauntlet](https://github.com/jakesgordon/javascript-gauntlet) by Jake Gordon.

Supports local 2-player co-op.

SUPPORTED BROWSERS
==================

 - Chrome 24+
 - Firefox 18+
 - IE 9+

HOW TO PLAY
===========

Serve the folder with any static web server (or open index.html directly in a modern browser) and press 1-4 to choose your hero.

To add a second player: after the game has started, press 1-4 again to join as Player 2 with that character.

CONTROLS
========

Player 1
--------
- Arrow keys – move
- Hold SPACE – fire (hold ~2 seconds to charge Special)
- ENTER – use potion

Player 2
--------
- W A S D – move
- Hold F – fire (hold ~2 seconds to charge Special)
- R – use potion

General
-------
- 1 / 2 / 3 / 4 – select character (menu) or join as Player 2 (during game)
- P – pause / resume (also pauses music)
- ESC – quit to menu

SPECIAL ATTACKS (hold fire for ~2 seconds)
==========================================

- **Aragorn – Andúril's Wrath**  
  Wide circular sword wave. High damage, knockback, temporary speed boost.  
  Voice: “For Gondor!”

- **Gandalf – You Shall Not Pass!**  
  Screen-wide shockwave. Stuns and knocks back all visible enemies.  
  Voice: “You shall not pass!”

- **Legolas – Arrow Storm**  
  Volley of arrows rains across the screen for a short time.  
  Voice: “Arrow storm!”

- **Gimli – Axequake**  
  Wide ground slam. Heavy damage, stun, and knockback.  
  Voice: “And my axe!”

Specials have a short cooldown. The hero glows while charging.

COMBAT DIFFERENCES
==================

- **Aragorn**: 3-hit sword combo (3rd hit hits much harder). Slow but tanky.
- **Gandalf**: Strong ranged bolts; fragile.
- **Legolas**: Fastest; can fire while moving; Elven Grace (chance to dodge hits).
- **Gimli**: Heavy axe blows; Dwarven Resolve (takes less damage while attacking).

STATUS LINES (arcade style)
===========================

When health is critical:
- “Aragorn needs food badly!”
- “Gandalf needs mana badly!”
- “Legolas needs arrows badly!”
- “Gimli needs ale badly!”

On death: “ARAGORN HAS FALLEN!” (and matching lines for the others).

POWER-UPS
=========

- **Roast meat / Lembas** – restore health (Lembas is a large heal)
- **Gold** – score; rare chance of **Mithril** (brief invulnerability)
- Large health pickups can grant short character buffs:
  - Aragorn → Andúril (stronger attacks)
  - Legolas → Elven arrows
  - Gandalf → Wizard’s fire
  - Gimli → Dwarven fury

DEVELOPMENT
===========

The game is 100% client side javascript and css. It should run when served up by any web server.

Attributions
=============

All music is licensed, royalty-free, from [Lucky Lion Studios](http://luckylionstudios.com/) for the original project only. If you re-use this project for your own purposes you must license your own music please.

All sound effects are licensed, royalty-free from [Premium Beat](http://www.premiumbeat.com/sfx) for the original project only. If you re-use this project for your own purposes you must license your own sound effects please.

Background tilesets (walls, floors, doors) are provided by

 - [Ricardo Chirino](ricardochirino.com)
 - [Open Game Art](http://opengameart.org/content/gauntlet-like-tiles)

Entity sprites (players, monsters, treasure, etc) are almost certainly ripped from an old (s)NES console ?

 - [Open Game Art](http://opengameart.org/forumtopic/request-for-tileset-spritesheet-similar-to-gauntlet-ii)

License
=======

[MIT](http://en.wikipedia.org/wiki/MIT_License) license.
