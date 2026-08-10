Gauntlet = function() {

  'use strict';

  //===========================================================================
  // CONFIGURATION CONSTANTS and ENUM's
  //===========================================================================

  var VERSION  = "1.0.0",
      FPS      = 60,
      TILE     = 32,
      STILE    = 32,
      VIEWPORT = { TW: 24, TH: 24 },
      DIR      = { UP: 0, UPRIGHT: 1, RIGHT: 2, DOWNRIGHT: 3, DOWN: 4, DOWNLEFT: 5, LEFT: 6, UPLEFT: 7 },
      PLAYER = {
        WARRIOR:  { sx: 0, sy: 1, frames: 3, fpf: FPS/10, health: 500, speed: 200/FPS, damage: 50/FPS, armor: 3, magic: 16, weapon: { speed: 600/FPS, reload: 0.40*FPS, damage: 4, rotate: true,  sx: 24, sy: 1, fpf: FPS/10, player: true }, sex: "male",   name: "aragorn",
          displayName: "Aragorn", weakMsg: "Aragorn needs food badly!", deathMsg: "ARAGORN HAS FALLEN!",
          // 3-hit sword combo: hits 1-2 normal, hit 3 heavier
          combo: true, fireWhileMoving: false, dodgeChance: 0, resolve: false,
          special: { id: 'anduril', name: "Anduril's Wrath", charge: 2*FPS, cooldown: 2.5*FPS, phrase: "For Gondor!", radius: 9*TILE, damage: 14, knockback: 28, speedBoost: 1.5, speedBoostTime: 3*FPS } },
        VALKYRIE: { sx: 0, sy: 0, frames: 3, fpf: FPS/10, health: 500, speed: 220/FPS, damage: 40/FPS, armor: 2, magic: 16, weapon: { speed: 580/FPS, reload: 0.38*FPS, damage: 5, rotate: false, sx: 24, sy: 0, fpf: FPS/10, player: true }, sex: "male",   name: "gimli",
          displayName: "Gimli", weakMsg: "Gimli needs ale badly!", deathMsg: "GIMLI HAS FALLEN!",
          // Dwarven Resolve: harder to interrupt / reduced damage while attacking
          combo: false, fireWhileMoving: false, dodgeChance: 0, resolve: true,
          special: { id: 'axequake', name: "Axequake", charge: 2*FPS, cooldown: 2.5*FPS, phrase: "And my axe!", radius: 12*TILE, damage: 16, knockback: 22, stun: 2.5*FPS } },
        WIZARD:   { sx: 0, sy: 2, frames: 3, fpf: FPS/10, health: 500, speed: 240/FPS, damage: 30/FPS, armor: 1, magic: 32, weapon: { speed: 640/FPS, reload: 0.30*FPS, damage: 6, rotate: false, sx: 24, sy: 2, fpf: FPS/10, player: true }, sex: "male",   name: "gandalf",
          displayName: "Gandalf", weakMsg: "Gandalf needs mana badly!", deathMsg: "GANDALF HAS FALLEN!",
          combo: false, fireWhileMoving: false, dodgeChance: 0, resolve: false,
          special: { id: 'shallnotpass', name: "You Shall Not Pass!", charge: 2*FPS, cooldown: 3*FPS, phrase: "You shall not pass!", radius: 9999, damage: 10, knockback: 48, stun: 3.5*FPS, screenwide: true } },
        ELF:      { sx: 0, sy: 3, frames: 3, fpf: FPS/10, health: 500, speed: 260/FPS, damage: 20/FPS, armor: 1, magic: 24, weapon: { speed: 700/FPS, reload: 0.20*FPS, damage: 5, rotate: false, sx: 24, sy: 3, fpf: FPS/10, player: true }, sex: "male",   name: "legolas",
          displayName: "Legolas", weakMsg: "Legolas needs arrows badly!", deathMsg: "LEGOLAS HAS FALLEN!",
          // Elven Grace: dodge chance; fire while moving
          combo: false, fireWhileMoving: true, dodgeChance: 0.25, resolve: false,
          special: { id: 'arrowstorm', name: "Arrow Storm", charge: 2*FPS, cooldown: 2.5*FPS, phrase: "Arrow storm!", radius: 9999, damage: 6, stun: 1*FPS, screenwide: true, duration: 2*FPS } }
      },
      MONSTER = {
        GHOST:  { sx: 0, sy: 4, frames: 3, fpf: FPS/10, score:  10, health:  4, speed: 140/FPS, damage: 100/FPS, selfharm: 30/FPS, canbeshot: true,  canbehit: false, invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health:  8, speed: 2.5*FPS, max: 40, score: 100, sx: 32, sy: 4 }, name: "ghost",  weapon: null                                                                                     },
        DEMON:  { sx: 0, sy: 5, frames: 3, fpf: FPS/10, score:  20, health:  4, speed:  80/FPS, damage:  60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 16, speed: 3.0*FPS, max: 40, score: 200, sx: 32, sy: 5 }, name: "demon",  weapon: { speed: 240/FPS, reload: 2*FPS, damage: 10, sx: 24, sy: 5, fpf: FPS/10, monster: true } },
        GRUNT:  { sx: 0, sy: 6, frames: 3, fpf: FPS/10, score:  30, health:  8, speed: 120/FPS, damage:  60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 16, speed: 3.5*FPS, max: 40, score: 300, sx: 32, sy: 6 }, name: "grunt",  weapon: null                                                                                     },
        WIZARD: { sx: 0, sy: 7, frames: 3, fpf: FPS/10, score:  30, health:  8, speed: 120/FPS, damage:  60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: { on: 3*FPS, off: 6*FPS }, travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 24, speed: 4.0*FPS, max: 20, score: 400, sx: 32, sy: 8 }, name: "wizard", weapon: null                                                                                     },
        DEATH:  { sx: 0, sy: 8, frames: 3, fpf: FPS/10, score: 500, health: 12, speed: 180/FPS, damage: 120/FPS, selfharm: 6/FPS,  canbeshot: false, canbehit: false, invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 16, speed: 5.0*FPS, max: 10, score: 500, sx: 32, sy: 9 }, name: "death",  weapon: null                                                                                     },
        // Boss templates (sprite reuse; flagged boss for special AI)
        // weakTo: damage multiplier by hero type.name
        BLACKRIDER: { sx: 0, sy: 8, frames: 3, fpf: FPS/8, score: 1500, health: 50, speed: 150/FPS, damage: 90/FPS, selfharm: 0, canbeshot: true, canbehit: true, invisibility: false, travelling: 0.3*FPS, thinking: 0.3*FPS, generator: null, name: "death", boss: true, bossId: 'blackrider', displayName: 'Black Rider', phases: 2,
          weakTo: { gandalf: 1.5, aragorn: 1.35, legolas: 1.1, gimli: 1.0 } },
        NAZGUL:     { sx: 0, sy: 8, frames: 3, fpf: FPS/8, score: 1800, health: 65, speed: 155/FPS, damage: 95/FPS, selfharm: 0, canbeshot: true, canbehit: true, invisibility: false, travelling: 0.3*FPS, thinking: 0.25*FPS, generator: null, name: "death", boss: true, bossId: 'nazgul', displayName: 'Nazgûl', phases: 2,
          weakTo: { gandalf: 1.6, aragorn: 1.4, legolas: 1.15, gimli: 1.0 } },
        WITCHKING: { sx: 0, sy: 8, frames: 3, fpf: FPS/8,  score: 2500, health: 100, speed: 160/FPS, damage: 110/FPS, selfharm: 0, canbeshot: true, canbehit: true, invisibility: false, travelling: 0.3*FPS, thinking: 0.25*FPS, generator: null, name: "death", boss: true, bossId: 'witchking', displayName: 'Witch-king of Angmar', phases: 3,
          weakTo: { gandalf: 1.75, aragorn: 1.5, legolas: 1.1, gimli: 1.0 } },
        BALROG:    { sx: 0, sy: 5, frames: 3, fpf: FPS/8,  score: 4000, health: 140, speed: 100/FPS, damage: 150/FPS, selfharm: 0, canbeshot: true, canbehit: true, invisibility: false, travelling: 0.4*FPS, thinking: 0.3*FPS, generator: null, name: "demon", boss: true, bossId: 'balrog', displayName: 'Durin\'s Bane — the Balrog', phases: 3, weapon: { speed: 280/FPS, reload: 1.2*FPS, damage: 14, sx: 24, sy: 5, fpf: FPS/10, monster: true },
          weakTo: { gandalf: 2.5, aragorn: 1.1, legolas: 0.9, gimli: 1.2 } },
        LURTZ:      { sx: 0, sy: 6, frames: 3, fpf: FPS/8,  score: 2800, health: 100, speed: 150/FPS, damage: 115/FPS, selfharm: 0, canbeshot: true, canbehit: true, invisibility: false, travelling: 0.35*FPS, thinking: 0.25*FPS, generator: null, name: "grunt", boss: true, bossId: 'lurtz', displayName: 'Lurtz', phases: 2,
          weakTo: { gandalf: 1.1, aragorn: 1.6, legolas: 1.4, gimli: 1.35 } },
        SAURON:    { sx: 0, sy: 8, frames: 3, fpf: FPS/7,  score: 8000, health: 280, speed: 130/FPS, damage: 140/FPS, selfharm: 0, canbeshot: true, canbehit: true, invisibility: false, travelling: 0.25*FPS, thinking: 0.2*FPS, generator: null, name: "death", boss: true, bossId: 'sauron', displayName: 'Sauron, the Dark Lord', phases: 4,
          weakTo: { gandalf: 1.4, aragorn: 1.5, legolas: 1.2, gimli: 1.15 },
          // Phase 1 attack timings (frames)
          maceCd: 3.5*FPS, shockCd: 5*FPS, summonCd: 8*FPS,
          maceRadius: 5*TILE, maceDamage: 18,
          shockRadius: 9*TILE, shockDamage: 12,
          summonCount: 6 },
        // Phase 2 — The Nine (elite ringwraiths; not full bosses)
        THE_NINE: { sx: 0, sy: 8, frames: 3, fpf: FPS/8, score: 250, health: 22, speed: 165/FPS, damage: 85/FPS, selfharm: 0,
          canbeshot: true, canbehit: true, invisibility: false, travelling: 0.35*FPS, thinking: 0.3*FPS, generator: null,
          name: "death", isNine: true, displayName: 'Nazgûl' }
      },
      TREASURE = {
        HEALTH:  { sx: 0, sy: 9, frames: 1, fpf: FPS/10, score:  10, health:  50,   sound: 'potion', label: 'Mithril tonic' },
        POISON:  { sx: 1, sy: 9, frames: 1, fpf: FPS/10, score:   0, damage:  50,   sound: 'potion', label: 'Poison' },
        FOOD1:   { sx: 2, sy: 9, frames: 1, fpf: FPS/10, score:  10, health:  25,   sound: 'food',   label: 'Roast meat' },
        FOOD2:   { sx: 3, sy: 9, frames: 1, fpf: FPS/10, score:  15, health:  45,   sound: 'food',   label: 'Potatoes', potato: true },
        FOOD3:   { sx: 4, sy: 9, frames: 1, fpf: FPS/10, score:  15, health:  80,   sound: 'food',   label: 'Lembas', leembas: true },
        // Random potato drops (same sprite row as food; spawned via chance in addTreasure)
        POTATO:  { sx: 3, sy: 9, frames: 1, fpf: FPS/10, score:  20, health:  55,   sound: 'food',   label: 'Potatoes', potato: true },
        KEY:     { sx: 5, sy: 9, frames: 1, fpf: FPS/10, score:  20, key:    true,  sound: 'key',    label: 'Key' },
        POTION:  { sx: 6, sy: 9, frames: 1, fpf: FPS/10, score:  50, potion: true,  sound: 'potion', label: 'Potion' },
        GOLD:    { sx: 7, sy: 9, frames: 3, fpf: FPS/10, score: 100,                sound: 'gold',   label: 'Gold', mithrilChance: 0.12 }
      },
      DOOR = {
        HORIZONTAL: { sx: 10, sy: 9, speed: 0.05*FPS, horizontal: true,  vertical: false, dx: 2, dy: 0 },
        VERTICAL:   { sx: 11, sy: 9, speed: 0.05*FPS, horizontal: false, vertical: true,  dx: 0, dy: 8 },
        EXIT:       { sx: 12, sy: 9, speed: 3*FPS, fpf: FPS/30 },
      },
      FX = {
        GENERATOR_DEATH: { sx: 13, sy: 9, frames: 6, fpf: FPS/10 },
        MONSTER_DEATH:   { sx: 13, sy: 9, frames: 6, fpf: FPS/20 },
        WEAPON_HIT:      { sx: 19, sy: 9, frames: 2, fpf: FPS/20 },
        PLAYER_GLOW:     { frames: FPS/2, border: 5 }
      },
      PLAYERS   = [ PLAYER.WARRIOR, PLAYER.VALKYRIE, PLAYER.WIZARD, PLAYER.ELF ],
      MONSTERS  = [ MONSTER.GHOST, MONSTER.DEMON, MONSTER.GRUNT, MONSTER.WIZARD, MONSTER.DEATH ],
      TREASURES = [ TREASURE.HEALTH, TREASURE.POISON, TREASURE.FOOD1, TREASURE.FOOD2, TREASURE.FOOD3, TREASURE.KEY, TREASURE.POTION, TREASURE.GOLD ],
      CBOX = {
        FULL:    { x: 0,      y: 0,      w: TILE,   h: TILE          },
        PLAYER:  { x: TILE/4, y: TILE/4, w: TILE/2, h: TILE - TILE/4 },
        WEAPON:  { x: TILE/3, y: TILE/3, w: TILE/3, h: TILE/3        },
        MONSTER: { x: 1,      y: 1,      w: TILE-2, h: TILE-2        }, // give monsters 1px wiggle room to get through tight corridors
      },
      PIXEL = {
        NOTHING:        0x000000, // BLACK
        DOOR:           0xC0C000, // YELLOW
        WALL:           0x404000, // DARK YELLOW
        GENERATOR:      0xF00000, // RED
        MONSTER:        0x400000, // DARK RED
        START:          0x00F000, // GREEN
        TREASURE:       0x008000, // MEDIUM GREEN
        EXIT:           0x004000, // DARK GREEN
        MASK: {
          TYPE:         0xFFFF00,
          EXHIGH:       0x0000F0,
          EXLOW:        0x00000F
        }
      },
      FLOOR = { BROWN_BOARDS: 1, LIGHBROWN_BOARDS: 2, GREEN_BOARDS: 3, GREY_BOARDS: 4, WOOD: 5, LIGHT_STONE: 6, DARK_STONE: 7, BROWN_LAMINATE: 8, PURPLE_LAMINATE: 9, MIN: 1, MAX: 9 },
      WALL  = { BLUE: 1, BLUE_BRICK: 2, PURPLE_TILE: 3, BLUE_COBBLE: 4, PURPLE_COBBLE: 5, CONCRETE: 6, MIN: 1, MAX: 6 },
      EVENT = {
        START_LEVEL:         0,
        PLAYER_JOIN:         1,
        PLAYER_LEAVE:        2,
        PLAYER_EXITING:      3,
        PLAYER_EXIT:         4,
        PLAYER_DEATH:        5,
        PLAYER_NUKE:         6,
        PLAYER_FIRE:         7,
        PLAYER_HURT:         8,
        PLAYER_HEAL:         9,
        MONSTER_DEATH:      10,
        MONSTER_FIRE:       11,
        GENERATOR_DEATH:    12,
        DOOR_OPENING:       13,
        DOOR_OPEN:          14,
        TREASURE_COLLECTED: 15,
        PLAYER_COLLIDE:     16,
        MONSTER_COLLIDE:    17,
        WEAPON_COLLIDE:     18,
        FX_FINISHED:        19,
        HIGH_SCORE:         20,
        PLAYER_SPECIAL:     21,
        PLAYER_WEAK:        22,
        PLAYER_REVIVE:      23
      },
      STORAGE = {
        VERSION: "gauntlet.version",
        NLEVEL:  "gauntlet.nlevel",
        SCORE:   "gauntlet.score",
        WHO:     "gauntlet.who",
        SAVES:   "gauntlet.saves3"  // JSON array of up to 3 manual save slots
      },
      DEBUG = {
        RESET:      Game.qsBool("reset"),
        GRID:       Game.qsBool("grid"),
        NOMONSTERS: Game.qsBool("nomonsters"),
        NODAMAGE:   Game.qsBool("nodamage"),
        NOAUTOHURT: Game.qsBool("noautohurt"),
        POTIONS:    Game.qsNumber("potions"),
        KEYS:       Game.qsNumber("keys"),
        LEVEL:      Game.qsNumber("level"),
        PLAYER:     (Game.qsValue("player") || "aragorn").toUpperCase(),
        WALL:       Game.qsNumber("wall"),
        FLOOR:      Game.qsNumber("floor"),
        MUSIC:      Game.qsValue("music"),
        HEAP:       Game.qsBool("heap")
      };

  //---------------------------------------------------------------------------

  var PREFERRED_DIRECTIONS = {};
  PREFERRED_DIRECTIONS[DIR.UPLEFT]    = [ DIR.UPLEFT,    DIR.LEFT,     DIR.UP,        DIR.UPRIGHT,  DIR.DOWNLEFT  ];
  PREFERRED_DIRECTIONS[DIR.UPRIGHT]   = [ DIR.UPRIGHT,   DIR.RIGHT,    DIR.UP,        DIR.UPLEFT,   DIR.DOWNRIGHT ];
  PREFERRED_DIRECTIONS[DIR.DOWNLEFT]  = [ DIR.DOWNLEFT,  DIR.LEFT,     DIR.DOWN,      DIR.UPLEFT,   DIR.DOWNRIGHT ];
  PREFERRED_DIRECTIONS[DIR.DOWNRIGHT] = [ DIR.DOWNRIGHT, DIR.RIGHT,    DIR.DOWN,      DIR.DOWNLEFT, DIR.UPRIGHT   ];
  PREFERRED_DIRECTIONS[DIR.UP]        = [ DIR.UP,        DIR.UPLEFT,   DIR.UPRIGHT,   DIR.LEFT,     DIR.RIGHT     ];
  PREFERRED_DIRECTIONS[DIR.DOWN]      = [ DIR.DOWN,      DIR.DOWNLEFT, DIR.DOWNRIGHT, DIR.LEFT,     DIR.RIGHT     ];
  PREFERRED_DIRECTIONS[DIR.LEFT]      = [ DIR.LEFT,      DIR.UPLEFT,   DIR.DOWNLEFT,  DIR.UP,       DIR.DOWN      ];
  PREFERRED_DIRECTIONS[DIR.RIGHT]     = [ DIR.RIGHT,     DIR.UPRIGHT,  DIR.DOWNRIGHT, DIR.UP,       DIR.DOWN      ];

  var SLIDE_DIRECTIONS = {};
  SLIDE_DIRECTIONS[DIR.UPLEFT]    = [ DIR.UPLEFT,    DIR.UP,   DIR.LEFT  ];
  SLIDE_DIRECTIONS[DIR.UPRIGHT]   = [ DIR.UPRIGHT,   DIR.UP,   DIR.RIGHT ];
  SLIDE_DIRECTIONS[DIR.DOWNLEFT]  = [ DIR.DOWNLEFT,  DIR.DOWN, DIR.LEFT  ];
  SLIDE_DIRECTIONS[DIR.DOWNRIGHT] = [ DIR.DOWNRIGHT, DIR.DOWN, DIR.RIGHT ];
  SLIDE_DIRECTIONS[DIR.UP]        = [ DIR.UP    ];
  SLIDE_DIRECTIONS[DIR.DOWN]      = [ DIR.DOWN  ];
  SLIDE_DIRECTIONS[DIR.LEFT]      = [ DIR.LEFT  ];
  SLIDE_DIRECTIONS[DIR.RIGHT]     = [ DIR.RIGHT ];

  //===========================================================================
  // CONFIGURATION
  //===========================================================================

  var cfg = {

    runner: {
      fps:   FPS,
      stats: true
    },

    state: {
      initial: 'booting',
      events: [
        { name: 'ready',  from: 'booting',               to: 'menu'     }, // initial page loads images and sounds then transitions to 'menu'
        { name: 'start',  from: 'menu',                  to: 'starting' }, // start a new game from the menu
        { name: 'load',   from: ['starting', 'playing'], to: 'loading'  }, // start loading a new level (either to start a new game, or next level while playing)
        { name: 'play',   from: 'loading',               to: 'playing'  }, // play the level after loading it
        { name: 'help',   from: ['loading', 'playing'],  to: 'help'     }, // pause the game to show a help topic
        { name: 'resume', from: 'help',                  to: 'playing'  }, // resume playing after showing a help topic
        { name: 'lose',     from: 'playing',               to: 'lost'     }, // player died
        { name: 'quit',     from: 'playing',               to: 'lost'     }, // player quit
        { name: 'win',      from: 'playing',               to: 'won'      }, // player won
        { name: 'continue', from: 'lost',                  to: 'loading'  }, // continue after death
        { name: 'finish',   from: ['won', 'lost', 'loading', 'playing'], to: 'menu' }  // back to menu (ESC safety)
      ]
    },

    pubsub: [
      { event: EVENT.MONSTER_DEATH,      action: function(monster, by, nuke) { this.onMonsterDeath(monster, by, nuke);     } },
      { event: EVENT.GENERATOR_DEATH,    action: function(generator, by)     { this.onGeneratorDeath(generator, by);       } },
      { event: EVENT.DOOR_OPENING,       action: function(door, speed)       { this.onDoorOpening(door, speed);            } },
      { event: EVENT.DOOR_OPEN,          action: function(door)              { this.onDoorOpen(door);                      } },
      { event: EVENT.TREASURE_COLLECTED, action: function(treasure, player)  { this.onTreasureCollected(treasure, player); } },
      { event: EVENT.WEAPON_COLLIDE,     action: function(weapon, entity)    { this.onWeaponCollide(weapon, entity);       } },
      { event: EVENT.PLAYER_COLLIDE,     action: function(player, entity)    { this.onPlayerCollide(player, entity);       } },
      { event: EVENT.MONSTER_COLLIDE,    action: function(monster, entity)   { this.onMonsterCollide(monster, entity);     } },
      { event: EVENT.PLAYER_NUKE,        action: function(player)            { this.onPlayerNuke(player);                  } },
      { event: EVENT.PLAYER_FIRE,        action: function(player)            { this.onPlayerFire(player);                  } },
      { event: EVENT.PLAYER_SPECIAL,     action: function(player)            { this.onPlayerSpecial(player);               } },
      { event: EVENT.MONSTER_FIRE,       action: function(monster)           { this.onMonsterFire(monster);                } },
      { event: EVENT.PLAYER_EXITING,     action: function(player, exit)      { this.onPlayerExiting(player, exit);         } },
      { event: EVENT.PLAYER_EXIT,        action: function(player)            { this.onPlayerExit(player);                  } },
      { event: EVENT.FX_FINISHED,        action: function(fx)                { this.onFxFinished(fx);                      } },
      { event: EVENT.PLAYER_DEATH,       action: function(player)            { this.onPlayerDeath(player);                 } }
    ],

    images: [
      { id: 'backgrounds', url: "images/backgrounds.png" }, // http://opengameart.org/content/gauntlet-like-tiles
      { id: 'entities',    url: "images/entities.png"    }  // http://opengameart.org/forumtopic/request-for-tileset-spritesheet-similar-to-gauntlet-ii 
    ],

    sounds: [
      { id: 'lostcorridors',   name: 'sounds/music.lostcorridors',   formats: ['mp3', 'ogg'], volume: 1.0, loop: true             }, // http://luckylionstudios.com/
      { id: 'bloodyhalo',      name: 'sounds/music.bloodyhalo',      formats: ['mp3', 'ogg'], volume: 0.5, loop: true             }, // (ditto)
      { id: 'citrinitas',      name: 'sounds/music.citrinitas',      formats: ['mp3', 'ogg'], volume: 0.5, loop: true             }, //
      { id: 'fleshandsteel',   name: 'sounds/music.fleshandsteel',   formats: ['mp3', 'ogg'], volume: 0.5, loop: true             }, //
      { id: 'mountingassault', name: 'sounds/music.mountingassault', formats: ['mp3', 'ogg'], volume: 0.5, loop: true             }, //
      { id: 'phantomdrone',    name: 'sounds/music.phantomdrone',    formats: ['mp3', 'ogg'], volume: 0.5, loop: true             }, //
      { id: 'thebeginning',    name: 'sounds/music.thebeginning',    formats: ['mp3', 'ogg'], volume: 0.5, loop: true             }, //
      { id: 'warbringer',      name: 'sounds/music.warbringer',      formats: ['mp3', 'ogg'], volume: 0.5, loop: true             }, //
      { id: 'gameover',        name: 'sounds/gameover',              formats: ['mp3', 'ogg'], volume: 0.5                         }, //
      { id: 'victory',         name: 'sounds/victory',               formats: ['mp3', 'ogg'], volume: 1.0                         }, //
      { id: 'femalepain1',     name: 'sounds/femalepain1',           formats: ['mp3', 'ogg'], volume: 0.3                         }, // http://www.premiumbeat.com/sfx/
      { id: 'femalepain2',     name: 'sounds/femalepain2',           formats: ['mp3', 'ogg'], volume: 0.3                         }, // (ditto)
      { id: 'malepain1',       name: 'sounds/malepain1',             formats: ['mp3', 'ogg'], volume: 0.3                         }, //
      { id: 'malepain2',       name: 'sounds/malepain2',             formats: ['mp3', 'ogg'], volume: 0.3                         }, //
      { id: 'exitlevel',       name: 'sounds/exitlevel',             formats: ['mp3', 'ogg'], volume: 1.0,                        }, //
      { id: 'highscore',       name: 'sounds/highscore',             formats: ['mp3', 'ogg'], volume: 1.0,                        }, //
      { id: 'firearagorn',     name: 'sounds/firearagorn',           formats: ['mp3', 'ogg'], volume: 0.3, pool: ua.is.ie ? 2 : 4 }, //   NOTE: ie has limit of 40 <audio> so be careful with pool amounts
      { id: 'firegimli',       name: 'sounds/firegimli',             formats: ['mp3', 'ogg'], volume: 0.3, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'firegandalf',     name: 'sounds/firegandalf',           formats: ['mp3', 'ogg'], volume: 0.3, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'firelegolas',     name: 'sounds/firelegolas',           formats: ['mp3', 'ogg'], volume: 0.3, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'collectgold',     name: 'sounds/collectgold',           formats: ['mp3', 'ogg'], volume: 0.5, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'collectpotion',   name: 'sounds/collectpotion',         formats: ['mp3', 'ogg'], volume: 0.5, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'collectkey',      name: 'sounds/collectkey',            formats: ['mp3', 'ogg'], volume: 0.5, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'collectfood',     name: 'sounds/collectfood',           formats: ['mp3', 'ogg'], volume: 0.5, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'generatordeath',  name: 'sounds/generatordeath',        formats: ['mp3', 'ogg'], volume: 0.3, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'monsterdeath1',   name: 'sounds/monsterdeath1',         formats: ['mp3', 'ogg'], volume: 0.3, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'monsterdeath2',   name: 'sounds/monsterdeath2',         formats: ['mp3', 'ogg'], volume: 0.3, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'monsterdeath3',   name: 'sounds/monsterdeath3',         formats: ['mp3', 'ogg'], volume: 0.3, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'weak',            name: 'sounds/weak',                  formats: ['mp3', 'ogg'], volume: 0.6, pool: 1                 }, //
      { id: 'opendoor',        name: 'sounds/opendoor',              formats: ['mp3', 'ogg'], volume: 0.3, pool: ua.is.ie ? 2 : 4 } //
    ],

    levels: [
      // ===== ACT I — THE SHIRE =====
      { act: 1, name: 'I-1 Hobbiton',           url: "levels/trainer1.png",  floor: FLOOR.LIGHT_STONE,     wall: WALL.BLUE_COBBLE,   music: 'bloodyhalo',      score:  1000,
        help: "<b>ACT I — The Shire</b><br><br>Frodo has the Ring. Sam refuses to leave his side.<br>Clear the lane and find the exit." },
      { act: 1, name: 'I-2 Road to Bucklebury',  url: "levels/trainer2.png",  floor: FLOOR.LIGHT_STONE,     wall: WALL.BLUE_COBBLE,   music: 'bloodyhalo',      score:  1000,
        help: "Black Riders are on the road.<br>Keep Frodo and Sam moving — watch for demon fire!" },
      { act: 1, name: 'I-3 The Old Forest',      url: "levels/trainer3.png",  floor: FLOOR.LIGHT_STONE,     wall: WALL.BLUE_COBBLE,   music: 'bloodyhalo',      score:  1200,
        boss: 'blackrider', bossFinale: true,
        help: "<b>ACT I BOSS</b><br>A <b>Black Rider</b> has found the Shire road!<br>Defeat it before Frodo and Sam are taken." },

      // ===== ACT II — BREE =====
      { act: 2, name: 'II-1 Road to Bree',       url: "levels/trainer4.png",  floor: FLOOR.LIGHT_STONE,     wall: WALL.BLUE_COBBLE,   music: 'bloodyhalo',      score:  1500,
        help: "<b>ACT II — Bree</b><br><br>Eat when you can. The journey is long.<br>Frodo grows quieter with every mile." },
      { act: 2, name: 'II-2 Bree Streets',       url: "levels/trainer5.png",  floor: FLOOR.LIGHT_STONE,     wall: WALL.BLUE_COBBLE,   music: 'citrinitas',      score:  1500,
        help: "Trouble in Bree. Collect what you need.<br>Sam: <i>\"I told you not to go wearing it!\"</i>" },
      { act: 2, name: 'II-3 Prancing Pony',      url: "levels/trainer6.png",  floor: FLOOR.WOOD,            wall: WALL.CONCRETE,      music: 'citrinitas',      score:  2000,
        boss: 'nazgul', bossFinale: true,
        help: "<b>ACT II BOSS</b><br>A <b>Nazgûl</b> stalks the Prancing Pony!<br>Clear the inn and strike it down." },

      // ===== ACT III — WEATHERTOP =====
      { act: 3, name: 'III-1 Trollshaws',        url: "levels/trainer7.png",  floor: FLOOR.WOOD,            wall: WALL.CONCRETE,      music: 'citrinitas',      score:  2000,
        help: "<b>ACT III — Weathertop</b><br><br>Use potions when surrounded.<br>Frodo is fading. Sam will not abandon him." },
      { act: 3, name: 'III-2 Weathertop',        url: "levels/level1.png",    floor: FLOOR.DARK_STONE,      wall: WALL.BLUE,          music: 'fleshandsteel',   score:  2500,
        escort: true,
        help: "Night falls on Weathertop.<br>Defend Frodo — something worse is coming..." },
      { act: 3, name: 'III-3 Nazgul Ambush',     url: "levels/level2.png",    floor: FLOOR.DARK_STONE,      wall: WALL.BLUE,          music: 'fleshandsteel',   score:  3000,
        boss: 'witchking', bossFinale: true, escort: true, hazard: 'fear',
        help: "<b>ACT III BOSS</b><br>The <b>Witch-king of Angmar</b> leads the Nine!<br>Gandalf and Aragorn strike hardest." },

      // ===== ACT IV — RIVENDELL =====
      { act: 4, name: 'IV-1 To Rivendell',       url: "levels/level3.png",    floor: FLOOR.DARK_STONE,      wall: WALL.BLUE,          music: 'fleshandsteel',   score:  3000,
        escort: true,
        help: "<b>ACT IV — Rivendell</b><br><br>Frodo is wounded. Race for the ford!<br>Sam: <i>\"Stay with me, Mr. Frodo!\"</i>" },
      { act: 4, name: 'IV-2 Bruinen Ford',       url: "levels/level4.png",    floor: FLOOR.BROWN_LAMINATE,  wall: WALL.CONCRETE,      music: 'phantomdrone',    score:  3500,
        hazard: 'flood',
        help: "The river rises. Drive the Riders toward the ford!" },
      { act: 4, name: 'IV-3 Council Halls',      url: "levels/level5.png",    floor: FLOOR.BROWN_LAMINATE,  wall: WALL.CONCRETE,      music: 'phantomdrone',    score:  4000,
        boss: 'witchking', bossFinale: true,
        help: "<b>ACT IV BOSS</b><br>Even at the threshold of Rivendell the <b>Witch-king</b> presses!<br>Break his will." },

      // ===== ACT V — MORIA =====
      { act: 5, name: 'V-1 Doors of Durin',      url: "levels/level6.png",    floor: FLOOR.BROWN_LAMINATE,  wall: WALL.CONCRETE,      music: 'phantomdrone',    score:  4500,
        help: "<b>ACT V — Moria</b><br><br><i>\"Speak, friend, and enter.\"</i><br>The mines are not empty..." },
      { act: 5, name: 'V-2 Goblin Tunnels',      url: "levels/level7.png",    floor: FLOOR.PURPLE_LAMINATE, wall: WALL.PURPLE_COBBLE, music: 'thebeginning',    score:  5000,
        escort: true,
        help: "Drums in the deep.<br>Protect Frodo and Sam in the crush of goblins!" },
      { act: 5, name: 'V-3 Bridge of Khazad-dum',url: "levels/level8.png",    floor: FLOOR.WOOD,            wall: WALL.BLUE_BRICK,    music: 'mountingassault', score:  6000,
        boss: 'balrog', bossFinale: true, escort: true, hazard: 'bridge',
        help: "<b>ACT V BOSS — YOU SHALL NOT PASS!</b><br><b>Durin's Bane, the Balrog</b> rises.<br>Gandalf deals massive damage — others struggle." },

      // ===== ACT VI — TOWARD THE END =====
      { act: 6, name: 'VI-1 Lothlorien',         url: "levels/level9.png",    floor: FLOOR.PURPLE_LAMINATE, wall: WALL.CONCRETE,      music: 'fleshandsteel',   score:  7000,
        help: "<b>ACT VI — Lothlórien</b><br><br>Galadriel's gift: Lembas for Frodo and Sam.<br>Rest is brief. The quest continues." },
      { act: 6, name: 'VI-2 Amon Hen',           url: "levels/level10.png",   floor: FLOOR.WOOD,            wall: WALL.BLUE_BRICK,    music: 'warbringer',      score:  8000,
        boss: 'lurtz', bossFinale: true, escort: true,
        help: "<b>ACT VI BOSS</b><br><b>Lurtz</b> hunts the Ringbearer.<br>Aragorn, Legolas, and Gimli hit hardest." },

      // ===== ACT VII =====
      { act: 7, name: 'VII-1 Emyn Muil',         url: "levels/level3.png",    floor: FLOOR.DARK_STONE,      wall: WALL.BLUE,          music: 'warbringer',      score:  9000,
        help: "<b>ACT VII — Emyn Muil</b><br><br>Frodo and Sam are lost in the rocks.<br>Something Gollum-shaped follows..." },
      { act: 7, name: 'VII-2 Dead Marshes',      url: "levels/level6.png",    floor: FLOOR.PURPLE_LAMINATE, wall: WALL.PURPLE_COBBLE, music: 'phantomdrone',    score: 10000,
        hazard: 'marsh', escort: true,
        help: "Lights in the water. Do not follow them.<br><b>Hazard: marsh drains health if you stand still.</b>" },
      { act: 7, name: 'VII-3 The Cracks of Doom', url: "levels/level10.png",   floor: FLOOR.WOOD,            wall: WALL.BLUE_BRICK,    music: 'warbringer',      score: 12000,
        boss: 'sauron', bossFinale: true, escort: true, hazard: 'fear',
        help: "<b>FINAL BATTLE</b><br>The Cracks of Doom.<br>Sauron takes form — dodge the <b>Mace</b>, survive the <b>Shockwave</b>, and clear the <b>Legion</b>!" }
    ],

    keys: [
      // MENU: 1-4 always start a New Game from I-1. L opens Load from 3 save slots.
      { key: Game.Key.ONE,    mode: 'up',   state: 'menu',    action: function()    { this.startNewGame(PLAYER.WARRIOR);  } },
      { key: Game.Key.TWO,    mode: 'up',   state: 'menu',    action: function()    { this.startNewGame(PLAYER.VALKYRIE); } },
      { key: Game.Key.THREE,  mode: 'up',   state: 'menu',    action: function()    { this.startNewGame(PLAYER.WIZARD);   } },
      { key: Game.Key.FOUR,   mode: 'up',   state: 'menu',    action: function()    { this.startNewGame(PLAYER.ELF);      } },
      { key: Game.Key.L,      mode: 'up',   state: 'menu',    action: function()    { this.openLoadMenu(); } },
      { key: Game.Key.UP,     mode: 'up',   state: 'menu',    action: function()    { if (this.saveMenu) this.saveMenuMove(-1); } },
      { key: Game.Key.DOWN,   mode: 'up',   state: 'menu',    action: function()    { if (this.saveMenu) this.saveMenuMove(1);  } },
      { key: Game.Key.W,      mode: 'up',   state: 'menu',    action: function()    { if (this.saveMenu) this.saveMenuMove(-1); } },
      { key: Game.Key.S,      mode: 'up',   state: 'menu',    action: function()    { if (this.saveMenu) this.saveMenuMove(1);  } },
      { key: Game.Key.RETURN, mode: 'up',   state: 'menu',    action: function()    { if (this.saveMenu) this.saveMenuConfirm(); } },
      { key: Game.Key.ESC,    mode: 'up',   state: 'menu',    action: function()    { if (this.saveMenu) this.closeSaveMenu(); } },
      // Allow joining a second player during play by pressing 1-4
      { key: Game.Key.ONE,    mode: 'up',   state: 'playing', action: function()    { if (this.saveMenu) return; this.joinSecond(PLAYER.WARRIOR);   } },
      { key: Game.Key.TWO,    mode: 'up',   state: 'playing', action: function()    { if (this.saveMenu) return; this.joinSecond(PLAYER.VALKYRIE);  } },
      { key: Game.Key.THREE,  mode: 'up',   state: 'playing', action: function()    { if (this.saveMenu) return; this.joinSecond(PLAYER.WIZARD);    } },
      { key: Game.Key.FOUR,   mode: 'up',   state: 'playing', action: function()    { if (this.saveMenu) return; this.joinSecond(PLAYER.ELF);       } },
      { key: Game.Key.ESC,    mode: 'up',   state: 'playing', action: function()    {
        if (this._ending) {
          // Skip to final card
          this._ending.step = Math.max(this._ending.step, this._ending.cards.length - 1);
          this._ending.hold = this._ending.minHold;
          return;
        }
        if (this.saveMenu) { this.closeSaveMenu(); return; }
        this.quit();
      } },
      { key: Game.Key.P,      mode: 'up',   state: 'playing', action: function()    { if (this._ending || this.saveMenu) return; this.togglePause(); } },
      // Save menu: K opens (P1 or P2). Arrows move selection, Enter confirms.
      { key: Game.Key.K,      mode: 'up',   state: 'playing', action: function()    { if (this._ending) return; this.openSaveMenu(); } },
      { key: Game.Key.RETURN, mode: 'up',   state: 'playing', action: function()    {
        if (this._ending) { this.endingAdvance(); return; }
        if (this.saveMenu) { this.saveMenuConfirm(); return; }
        if (!this.paused && this.players[0]) this.players[0].nuke();
      } },
      // Player 1 controls — blocked while save menu open; up/down also navigate save menu
      { key: Game.Key.LEFT,   mode: 'down', state: 'playing', action: function()    { if (!this.paused && !this.saveMenu && this.players[0]) this.players[0].moveLeft(true);   } },
      { key: Game.Key.RIGHT,  mode: 'down', state: 'playing', action: function()    { if (!this.paused && !this.saveMenu && this.players[0]) this.players[0].moveRight(true);  } },
      { key: Game.Key.UP,     mode: 'down', state: 'playing', action: function()    {
        if (this.saveMenu) { this.saveMenuMove(-1); return; }
        if (!this.paused && this.players[0]) this.players[0].moveUp(true);
      } },
      { key: Game.Key.DOWN,   mode: 'down', state: 'playing', action: function()    {
        if (this.saveMenu) { this.saveMenuMove(1); return; }
        if (!this.paused && this.players[0]) this.players[0].moveDown(true);
      } },
      { key: Game.Key.LEFT,   mode: 'up',   state: 'playing', action: function()    { if (this.players[0]) this.players[0].moveLeft(false);  } },
      { key: Game.Key.RIGHT,  mode: 'up',   state: 'playing', action: function()    { if (this.players[0]) this.players[0].moveRight(false); } },
      { key: Game.Key.UP,     mode: 'up',   state: 'playing', action: function()    { if (this.players[0]) this.players[0].moveUp(false);    } },
      { key: Game.Key.DOWN,   mode: 'up',   state: 'playing', action: function()    { if (this.players[0]) this.players[0].moveDown(false);  } },
      { key: Game.Key.SPACE,  mode: 'down', state: 'playing', action: function()    {
        if (this._ending) return;
        if (!this.paused && !this.saveMenu && this.players[0]) this.players[0].fire(true);
      } },
      { key: Game.Key.SPACE,  mode: 'up',   state: 'playing', action: function()    {
        if (this._ending) { this.endingAdvance(); return; }
        if (this.players[0]) this.players[0].fire(false);
      } },
      // Player 2 controls
      { key: Game.Key.A,      mode: 'down', state: 'playing', action: function()    { if (!this.paused && !this.saveMenu && this.players[1]) this.players[1].moveLeft(true);   } },
      { key: Game.Key.D,      mode: 'down', state: 'playing', action: function()    { if (!this.paused && !this.saveMenu && this.players[1]) this.players[1].moveRight(true);  } },
      { key: Game.Key.W,      mode: 'down', state: 'playing', action: function()    {
        if (this.saveMenu) { this.saveMenuMove(-1); return; }
        if (!this.paused && this.players[1]) this.players[1].moveUp(true);
      } },
      { key: Game.Key.S,      mode: 'down', state: 'playing', action: function()    {
        if (this.saveMenu) { this.saveMenuMove(1); return; }
        if (!this.paused && this.players[1]) this.players[1].moveDown(true);
      } },
      { key: Game.Key.A,      mode: 'up',   state: 'playing', action: function()    { if (this.players[1]) this.players[1].moveLeft(false);  } },
      { key: Game.Key.D,      mode: 'up',   state: 'playing', action: function()    { if (this.players[1]) this.players[1].moveRight(false); } },
      { key: Game.Key.W,      mode: 'up',   state: 'playing', action: function()    { if (this.players[1]) this.players[1].moveUp(false);    } },
      { key: Game.Key.S,      mode: 'up',   state: 'playing', action: function()    { if (this.players[1]) this.players[1].moveDown(false);  } },
      { key: Game.Key.F,      mode: 'down', state: 'playing', action: function()    { if (!this.paused && !this.saveMenu && this.players[1]) this.players[1].fire(true);       } },
      { key: Game.Key.F,      mode: 'up',   state: 'playing', action: function()    { if (this.players[1]) this.players[1].fire(false);      } },
      { key: Game.Key.R,      mode: 'up',   state: 'playing', action: function()    { if (!this.paused && !this.saveMenu && this.players[1]) this.players[1].nuke();           } },
      { key: Game.Key.ESC,    mode: 'up',   state: 'help',    action: function()    { this.resume();                   } },
      { key: Game.Key.RETURN, mode: 'up',   state: 'help',    action: function()    { this.resume();                   } },
      { key: Game.Key.SPACE,  mode: 'up',   state: 'help',    action: function()    { this.resume();                   } },
      // Continue screen (after party wipe)
      { key: Game.Key.SPACE,  mode: 'up',   state: 'lost',    action: function()    { this.tryContinue();              } },
      { key: Game.Key.F,      mode: 'up',   state: 'lost',    action: function()    { this.tryContinue();              } },
      { key: Game.Key.RETURN, mode: 'up',   state: 'lost',    action: function()    { this.tryContinue();              } },
      { key: Game.Key.ESC,    mode: 'up',   state: 'lost',    action: function()    { this.abortContinue();            } },
      // Emergency bail during level load
      { key: Game.Key.ESC,    mode: 'up',   state: 'loading', action: function()    { this.emergencyMenu();            } }
    ]

  };

  //===========================================================================
  // UTILITY METHODS
  //===========================================================================

  function publish()   { game.publish.apply(game, arguments);   } // cosmetic short-hand
  function subscribe() { game.subscribe.apply(game, arguments); } // cosmetic short-hand

  function p2t(n) { return Math.floor(n/TILE); }; // pixel-to-tile conversion
  function t2p(n) { return (n * TILE);         }; // tile-to-pixel conversion

  function countdown(n, dn)  { return n ? Math.max(0, n - (dn || 1)) : 0; } // decrement by 1, but always stop at zero, even for floating point numbers

  function isUp(dir)         { return (dir === DIR.UP)     || (dir === DIR.UPLEFT)   || (dir === DIR.UPRIGHT);   };
  function isDown(dir)       { return (dir === DIR.DOWN)   || (dir === DIR.DOWNLEFT) || (dir === DIR.DOWNRIGHT); };
  function isLeft(dir)       { return (dir === DIR.LEFT)   || (dir === DIR.UPLEFT)   || (dir === DIR.DOWNLEFT);  };
  function isRight(dir)      { return (dir === DIR.RIGHT)  || (dir === DIR.UPRIGHT)  || (dir === DIR.DOWNRIGHT); };
  function isHorizontal(dir) { return (dir === DIR.LEFT)   || (dir === DIR.RIGHT);                               };
  function isVertical(dir)   { return (dir === DIR.UP)     || (dir === DIR.DOWN);                                };
  function isDiagonal(dir)   { return (dir === DIR.UPLEFT) || (dir === DIR.UPRIGHT) || (dir === DIR.DOWNLEFT) || (dir === DIR.DOWNRIGHT); };

  function animate(frame, fpf, frames) { return Math.round(frame/fpf)%frames; }

  function overlapEntity(x, y, w, h, entity) {
    return Game.Math.overlap(x, y, w, h, entity.x + entity.cbox.x,
                                         entity.y + entity.cbox.y,
                                         entity.cbox.w,
                                         entity.cbox.h);
  }

  //=========================================================================
  // PERFORMANCE - using arrays for (small) sets
  //=========================================================================

  function set_contains(arr, entity) { return arr.indexOf(entity) >= 0;    }
  function set_add(arr, entity)      { arr.push(entity);                   }
  function set_remove(arr, entity)   { arr.splice(arr.indexOf(entity), 1); }
  function set_clear(arr)            { arr.length = 0;                     }
  function set_copy(arr, source) {
    set_clear(arr);
    for(var n = 0, max = source.length ; n < max ; n++)
      arr.push(source[n]);
  }

  //=========================================================================
  // MINIMIZE GARBAGE COLLECTION
  //  - as long as its either self contained within a single method, or the
  //    caller doesn't hold onto a reference, we can re-use the same array
  //    repeatedly for the results of frequently called helper methods
  //=========================================================================

  var _overlappingCells = { cells:   [], getcells:   function() { set_clear(this.cells);   return this.cells;   } },
      _occupied         = { checked: [], getchecked: function() { set_clear(this.checked); return this.checked; } };

  //===========================================================================
  // THE GAME ENGINE
  //===========================================================================

  var game = {

    cfg: cfg,

    run: function(runner) {

      StateMachine.create(cfg.state, this);
      Game.PubSub.enable(cfg.pubsub, this);
      Game.Key.map(cfg.keys, this);

      Game.loadResources(cfg.images, cfg.sounds, function(resources) {
        this.runner      = runner;
        this.storage     = this.clean(Game.storage());
        this.images      = resources.images;
        this.players     = [];          // up to 2 active players for local co-op
        this.player      = null;     // convenience alias for players[0]
        this.viewport    = new Viewport();
        this.scoreboard  = new Scoreboard(cfg.levels[this.loadLevel()], this.loadHighScore(), this.loadHighWho());
        this.render      = new Render(resources.images);
        this.sounds      = new Sounds(resources.sounds);
        this.ready();
      }.bind(this));

    },

    //---------------------------
    // STATE MACHINE TRANSITIONS
    //---------------------------

    onready: function() {
      $('booting').hide();
      this.runner.start();
      if (Game.Math.between(DEBUG.LEVEL, 0, cfg.levels.length-1))
        this.start(PLAYER[DEBUG.PLAYER], DEBUG.LEVEL); 
    },

    onmenu: function(event, previous, current) {
      this.sounds.playMenuMusic();
      this.clearExitTimer();
      this.paused = false;
      this.saveMenu = null;
      this.updateMenuHint();
    },

    updateMenuHint: function() {
      var slots = this.readSaveSlots();
      var lines = ["<b>FELLOWSHIP GAUNTLET</b>", "",
        "<b>1–4</b> — New Game (from I-1 Hobbiton)",
        "<b>L</b> — Load a saved game",
        ""];
      var i, s, label;
      for (i = 0; i < 3; i++) {
        s = slots[i];
        if (s && s.nlevel != null) {
          label = (cfg.levels[s.nlevel] && cfg.levels[s.nlevel].name) || ('Level ' + s.nlevel);
          lines.push("Slot " + (i + 1) + ": " + label + " — " + (s.heroName || s.hero || '?') + " (" + (s.score || 0) + ")");
        } else {
          lines.push("Slot " + (i + 1) + ": <i>empty</i>");
        }
      }
      try { $('help').update(lines.join("<br>")).show(); } catch (e) {}
    },

    // ---- 3-slot save system ----
    readSaveSlots: function() {
      var raw = this.storage[STORAGE.SAVES], arr = null;
      try { arr = raw ? JSON.parse(raw) : null; } catch (e) { arr = null; }
      if (!arr || !arr.length) arr = [null, null, null];
      while (arr.length < 3) arr.push(null);
      return arr.slice(0, 3);
    },

    writeSaveSlots: function(arr) {
      try { this.storage[STORAGE.SAVES] = JSON.stringify(arr); } catch (e) {}
    },

    snapshotSave: function() {
      var p = this.players && this.players[0];
      if (!p || !this.map) return null;
      return {
        nlevel: this.map.nlevel,
        hero: p.type.name,
        heroName: p.type.displayName || p.type.name,
        score: p.score || 0,
        health: Math.floor(p.health || 0),
        potions: p.potions || 0,
        keys: p.keys || 0,
        when: new Date().toLocaleString()
      };
    },

    openSaveMenu: function() {
      if (!this.is('playing') || !this.map) return;
      if (this.saveMenu && this.saveMenu.mode === 'save') {
        this.closeSaveMenu();
        return;
      }
      this.saveMenu = { mode: 'save', index: 0 };
      this.paused = true;
      this.renderSaveMenu();
    },

    openLoadMenu: function() {
      // From title screen
      this.saveMenu = { mode: 'load', index: 0 };
      this.renderSaveMenu();
    },

    closeSaveMenu: function() {
      this.saveMenu = null;
      if (this.is('playing')) {
        this.paused = false;
        try { $('help').hide(); } catch (e) {}
      } else if (this.is('menu')) {
        this.updateMenuHint();
      }
    },

    saveMenuMove: function(delta) {
      if (!this.saveMenu) return;
      this.saveMenu.index = (this.saveMenu.index + delta + 3) % 3;
      this.renderSaveMenu();
    },

    renderSaveMenu: function() {
      if (!this.saveMenu) return;
      var slots = this.readSaveSlots();
      var mode = this.saveMenu.mode;
      var title = mode === 'save' ? 'SAVE GAME' : 'LOAD GAME';
      var lines = ["<b>" + title + "</b>", "↑↓ select &nbsp; Enter confirm &nbsp; Esc cancel", ""];
      var i, s, mark, body;
      for (i = 0; i < 3; i++) {
        mark = (i === this.saveMenu.index) ? "▶ " : "&nbsp;&nbsp;";
        s = slots[i];
        if (s && s.nlevel != null) {
          body = ((cfg.levels[s.nlevel] && cfg.levels[s.nlevel].name) || ('Level ' + s.nlevel)) +
            "<br>&nbsp;&nbsp;&nbsp;" + (s.heroName || s.hero || '?') + " — score " + (s.score || 0) +
            (s.when ? "<br>&nbsp;&nbsp;&nbsp;<span style='opacity:0.7'>" + s.when + "</span>" : "");
        } else {
          body = "<i>empty</i>";
        }
        lines.push(mark + "<b>Slot " + (i + 1) + "</b> — " + body);
      }
      try { $('help').update(lines.join("<br>")).show(); } catch (e) {}
    },

    saveMenuConfirm: function() {
      if (!this.saveMenu) return;
      var idx = this.saveMenu.index;
      var slots = this.readSaveSlots();
      if (this.saveMenu.mode === 'save') {
        var snap = this.snapshotSave();
        if (!snap) { this.closeSaveMenu(); return; }
        slots[idx] = snap;
        this.writeSaveSlots(slots);
        // also update auto checkpoint
        this.saveLevel(snap.nlevel);
        this.closeSaveMenu();
        try {
          $('help').update("<b>Saved</b> to Slot " + (idx + 1) + "!").show();
          setTimeout(function() { try { $('help').hide(); } catch (e) {} }, 1200);
        } catch (e) {}
      } else {
        // Load from menu
        var slot = slots[idx];
        if (!slot || slot.nlevel == null) return; // empty — stay on menu
        this.closeSaveMenu();
        this.loadFromSlot(slot);
      }
    },

    loadFromSlot: function(slot) {
      var heroKey = (slot.hero || 'aragorn').toLowerCase();
      var type = PLAYER.WARRIOR;
      if (heroKey === 'gimli') type = PLAYER.VALKYRIE;
      else if (heroKey === 'gandalf') type = PLAYER.WIZARD;
      else if (heroKey === 'legolas') type = PLAYER.ELF;
      else type = PLAYER.WARRIOR;

      this._loadSlot = slot;
      this._startFromBeginning = false;
      this.saveLevel(slot.nlevel);
      this.start(type, slot.nlevel);
    },

    startNewGame: function(type) {
      this._loadSlot = null;
      this._startFromBeginning = true;
      this.saveLevel(0);
      this.start(type || PLAYER.WARRIOR, 0);
    },

    startOrJoin: function(type) {
      this.startNewGame(type);
    },

    joinSecond: function(type) {
      if (this.paused || this.players.length >= 2) return;
      // Don't allow the same character type twice
      if (this.players.length === 1 && this.players[0].type === type) return;
      var p = new Player();
      p.join(type);
      // Place near player 1 (offset by one tile) or at map start
      if (this.map) {
        var ref = this.players[0] || this.map.start;
        var sx = (ref.x != null ? ref.x : this.map.start.x) + TILE;
        var sy = (ref.y != null ? ref.y : this.map.start.y);
        // Keep inside map bounds
        if (sx > this.map.w - TILE) sx = (ref.x != null ? ref.x : this.map.start.x) - TILE;
        if (sx < 0) sx = this.map.start.x;
        this.map.occupy(sx, sy, p);
      }
      this.players.push(p);
      this.player = this.players[0];
    },

    onstart: function(event, previous, current, type, nlevel) {
      // Reset players for a new game
      this.clearExitTimer();
      this.paused = false;
      this.saveMenu = null;
      try { $('help').hide(); } catch (e) {}
      this.players = [];
      var p = new Player();
      p.join(type);
      // Apply loaded slot stats if present
      if (this._loadSlot) {
        if (this._loadSlot.score != null) p.score = this._loadSlot.score;
        if (this._loadSlot.health != null) p.health = this._loadSlot.health;
        if (this._loadSlot.potions != null) p.potions = this._loadSlot.potions;
        if (this._loadSlot.keys != null) p.keys = this._loadSlot.keys;
        this._loadSlot = null;
      }
      this.players.push(p);
      this.player = p;
      var startLevel = (nlevel !== undefined && nlevel !== null) ? to.number(nlevel, null) : null;
      if (startLevel == null) {
        startLevel = this._startFromBeginning ? 0 : this.loadLevel();
      }
      // Levels are 0-indexed (0 = I-1 Hobbiton). Do NOT use `x || 1` — that turns 0 into 1.
      startLevel = Math.floor(Number(startLevel));
      if (isNaN(startLevel) || startLevel < 0 || startLevel >= cfg.levels.length)
        startLevel = 0;
      this._startFromBeginning = false;
      this.load(startLevel);
    },

    onload: function(event, previous, current, nlevel) {
      var level    = cfg.levels[nlevel],
          self     = this,
          onloaded = function() { $('booting').hide(); self.play(new Map(nlevel)); };
      if (level.source) {
        onloaded();
      }
      else {
        $('booting').show();
        level.source = Game.createImage(level.url + "?cachebuster=" + VERSION , { onload: onloaded });
      }
    },

    onplay: function(event, previous, current, map) {
      this.map = map;
      this._levelTransitioning = false;
      this.clearExitTimer();
      // Galadriel revive is available once per Sauron attempt
      this._galadrielUsed = false;
      // Prevent instant exit if spawn is near an exit (especially after Continue)
      this._exitGraceUntil = Date.now() + 3000;
      this.saveLevel(map.nlevel);
      this.saveHighScore(); // a convenient place to save in-progress high scores without writing to local storage at 60fps
      publish(EVENT.START_LEVEL, map);
      if (map.level.help)
        this.help(map.level.help);
      // Call out the boss by name when a finale starts
      if (map.bossEntity && map.bossName) {
        var self = this;
        setTimeout(function() {
          var line = 'BOSS: ' + map.bossName + '!';
          if (self.sounds) self.sounds.speak(line, { rate: 0.95, pitch: 0.8 });
          if (self.players) {
            for (var i = 0; i < self.players.length; i++) {
              if (self.players[i] && self.players[i].say)
                self.players[i].say(line, 3.5 * FPS);
            }
          }
        }, 1200);
      }
    },

    clearExitTimer: function() {
      if (this._exitTimer) {
        clearTimeout(this._exitTimer);
        this._exitTimer = null;
      }
      this._levelTransitioning = false;
    },

    onwin:  function(event, previous, current) {
      this.winlosefade(15000);
      // After victory, next new game can start near the end; clamp to last real index
      this.saveLevel(Math.max(0, cfg.levels.length - 3));
    },
    onlose: function(event, previous, current) {
      // Cancel any pending level advances so Continue doesn't chain stages
      this.clearExitTimer();
      // Arcade continue: slow 10-second countdown; FIRE to continue
      this.startContinueCountdown();
    },

    winlosefade: function(duration) {
      var finish   = function()      { game.runner.canvas.fade(1);  game.finish(); },
          animate  = function(value) { game.runner.canvas.fade(1 - value);         },
          animator = new Animator({ duration: duration, transition: Animator.tx.easeOut, onComplete: finish }).addSubject(animate);
      animator.play();
      game.viewport.zoomout(true);
    },

    startContinueCountdown: function() {
      this._continueTimer = null;
      this._continueSeconds = 10;
      this._continueActive = true;
      // Remember who was playing so we can restore them
      this._continueTypes = [];
      this._continueScores = [];
      this._continueLevel = this.map ? this.map.nlevel : this.loadLevel();
      var i, p;
      for (i = 0; i < this.players.length; i++) {
        p = this.players[i];
        if (p && p.type) {
          this._continueTypes.push(p.type);
          this._continueScores.push(p.score || 0);
        }
      }
      if (this._continueTypes.length === 0 && this.player && this.player.type) {
        this._continueTypes.push(this.player.type);
        this._continueScores.push(this.player.score || 0);
      }

      this.showContinueScreen();
      var self = this;
      this._continueTimer = setInterval(function() {
        if (!self._continueActive) return;
        self._continueSeconds -= 1;
        if (self._continueSeconds <= 0) {
          self.abortContinue();
        } else {
          self.showContinueScreen();
        }
      }, 1000); // slow 1-second ticks
    },

    showContinueScreen: function() {
      var n = this._continueSeconds;
      $('help').update(
        "<b>CONTINUE?</b><br><br>" +
        "<span style='font-size:2.2em'>" + n + "</span><br><br>" +
        "Press <b>FIRE</b> to continue<br>" +
        "<span style='font-size:0.7em;opacity:0.7'>ESC to quit to menu</span>"
      ).show();
    },

    tryContinue: function() {
      if (!this._continueActive || !this.is('lost')) return;
      this._continueActive = false;
      if (this._continueTimer) {
        clearInterval(this._continueTimer);
        this._continueTimer = null;
      }
      // Kill any pending level-advance timers from the previous life
      this.clearExitTimer();
      this._exitGraceUntil = Date.now() + 4000;
      this.paused = false;
      $('help').hide();
      if (game.runner && game.runner.canvas) game.runner.canvas.fade(1);

      // Rebuild party from remembered types — fully reset control state
      var types = this._continueTypes || [];
      var scores = this._continueScores || [];
      var nlevel = this._continueLevel;
      if (nlevel == null || nlevel < 0 || nlevel >= cfg.levels.length)
        nlevel = this.loadLevel();
      // Never skip ahead past the level you died on
      nlevel = Math.min(nlevel, this._continueLevel != null ? this._continueLevel : nlevel);

      var i;
      for (i = 0; i < this.players.length; i++) {
        if (this.players[i]) {
          this.players[i].exiting = false;
          this.players[i].firing = false;
          this.players[i].leave();
        }
      }
      this.players = [];
      this.player = null;
      for (i = 0; i < types.length; i++) {
        var p = new Player();
        p.join(types[i]);
        p.health = Math.max(200, Math.floor(types[i].health * 0.6));
        p.score = scores[i] || 0;
        // Critical: clear stuck fire/move so the player can walk after Continue
        p.firing = false;
        p.chargingSpecial = false;
        p.chargeTime = 0;
        p.exiting = false;
        p.dead = false;
        p.moving = {};
        p.dir = DIR.UP;
        this.players.push(p);
      }
      if (this.players[0]) this.player = this.players[0];

      this.continue(nlevel); // FSM: lost -> loading
    },

    oncontinue: function(event, previous, current, nlevel) {
      // Already transitioned to 'loading' via the continue event — load the level image/map here
      nlevel = to.number(nlevel, this.loadLevel());
      var level = cfg.levels[nlevel],
          self  = this,
          onloaded = function() { $('booting').hide(); self.play(new Map(nlevel)); };
      if (level && level.source) {
        onloaded();
      } else if (level) {
        $('booting').show();
        level.source = Game.createImage(level.url + "?cachebuster=" + VERSION, { onload: onloaded });
      } else {
        // Fallback: training level 1
        this.play(new Map(1));
      }
    },

    abortContinue: function() {
      if (!this._continueActive && !this.is('lost')) return;
      this._continueActive = false;
      if (this._continueTimer) {
        clearInterval(this._continueTimer);
        this._continueTimer = null;
      }
      this.clearExitTimer();
      $('help').hide();
      if (this.is('lost')) {
        this.winlosefade(1500);
      }
    },

    emergencyMenu: function() {
      // Stop runaway level loading and return to menu
      this.clearExitTimer();
      this._continueActive = false;
      if (this._continueTimer) {
        clearInterval(this._continueTimer);
        this._continueTimer = null;
      }
      $('help').hide();
      if (game.runner && game.runner.canvas) game.runner.canvas.fade(1);
      try { this.finish(); } catch (e) { /* ignore */ }
    },

    onbeforequit: function(event, previous, current) {
      if (!confirm('Quit Game?'))
        return false;
    },

    onquit: function(event, previous, current) {
      this.paused = false;
      this.finish();
    },

    togglePause: function() {
      this.paused = !this.paused;
      if (this.paused) {
        if (this.sounds) this.sounds.stopAllMusic();
        // simple visual indicator via help overlay
        $('help').update("<b>PAUSED</b><br>Press <b>P</b> to resume").show();
      } else {
        $('help').hide();
        if (this.sounds && this.map && this.map.level) {
          this.sounds.playGameMusic(this.sounds[this.map.level.music] || this.sounds.game);
        }
      }
    },

    onfinish: function(event, previous, current) {
      this.paused = false;
      this.saveHighScore();
      var i;
      for (i = 0; i < this.players.length; i++) {
        if (this.players[i]) this.players[i].leave();
      }
      this.players = [];
      this.player = null;
    },

    onenterhelp: function(event, previous, current, msg) { $('help').update(msg).show(); setTimeout(this.autoresume.bind(this), 4000); },
    onleavehelp: function(event, previous, current)      { $('help').hide();                                                           },

    autoresume: function() {
      if (this.is('help'))
        this.resume();
    },

    onenterstate: function(event, previous, current) {
      $('gauntlet').setClassName(current); // allow css switching based on FSM state
      this.canUpdate = this.is('playing') || this.is('lost') || this.is('won');
      this.canDraw   = this.is('playing') || this.is('lost') || this.is('won') || this.is('help');
    },

    //-----------------------
    // UPDATE/DRAW GAME LOOP
    //-----------------------

    update: function(frame) {
      try { this.pollGamepads(frame); } catch (e) {}
      if (this._ending) {
        this.updateEnding(frame);
        return;
      }
      if (this.canUpdate && !this.paused) {
        try {
          var i, p, ref = null;
          if (!this.players) return;
          for (i = 0; i < this.players.length; i++) {
            p = this.players[i];
            // Must still update exiting players so the exit animation can finish
            if (p && !p.dead) {
              p.update(frame, p, this.map, this.viewport);
              if (p.active && p.active() && !ref) ref = p; // first living non-exiting player for AI
            }
          }
          if (!ref) {
            for (i = 0; i < this.players.length; i++) {
              if (this.players[i] && !this.players[i].dead) { ref = this.players[i]; break; }
            }
          }
          if (ref && this.map) {
            this.map.update(frame, ref, this.map, this.viewport);
            this.viewport.update(frame, this.players, this.map, this.viewport);
            this.updateBossCelebration(frame);
          }
        } catch (err) {
          // Never let a single frame error freeze the whole game
          if (window.console && console.error) console.error('update error', err);
        }
      }
    },


    //=========================================================================
    // USB / SNES-style gamepad support (Gamepad API)
    // Controller 0 → Player 1, Controller 1 → Player 2
    // D-pad / left stick: move
    // B or A (btn 0/1): fire (hold ~2s = special)
    // Y or X (btn 2/3): potion
    // Start (9): pause  |  Select (8): save menu
    // Menu: B=Aragorn A=Gimli Y=Gandalf X=Legolas, Select=Load
    //=========================================================================
    pollGamepads: function(frame) {
      if (!navigator.getGamepads) return;
      var pads = navigator.getGamepads();
      if (!pads) return;
      if (!this._padPrev) this._padPrev = [{}, {}];

      var pi, pad, prev;
      for (pi = 0; pi < 2; pi++) {
        pad = pads[pi];
        if (!pad) continue;
        prev = this._padPrev[pi] || {};
        var pressed = function(idx) {
          return !!(pad.buttons[idx] && (pad.buttons[idx].pressed || pad.buttons[idx].value > 0.5));
        };
        var was = function(idx) { return !!prev['b' + idx]; };

        var ax = (pad.axes && pad.axes.length) ? pad.axes[0] : 0;
        var ay = (pad.axes && pad.axes.length > 1) ? pad.axes[1] : 0;
        var dead = 0.35;
        var left  = ax < -dead || pressed(14);
        var right = ax >  dead || pressed(15);
        var up    = ay < -dead || pressed(12);
        var down  = ay >  dead || pressed(13);

        var fireBtn = pressed(0) || pressed(1);
        var potionBtn = pressed(2) || pressed(3);
        var startBtn = pressed(9);
        var selectBtn = pressed(8);

        if (this.is('menu')) {
          if (this.saveMenu) {
            if (up && !prev.up) this.saveMenuMove(-1);
            if (down && !prev.down) this.saveMenuMove(1);
            if (fireBtn && !was(0) && !was(1)) this.saveMenuConfirm();
            if (startBtn && !was(9)) this.saveMenuConfirm();
            if (selectBtn && !was(8)) this.closeSaveMenu();
          } else {
            if (selectBtn && !was(8)) this.openLoadMenu();
            if (pressed(0) && !was(0)) this.startNewGame(PLAYER.WARRIOR);
            if (pressed(1) && !was(1)) this.startNewGame(PLAYER.VALKYRIE);
            if (pressed(2) && !was(2)) this.startNewGame(PLAYER.WIZARD);
            if (pressed(3) && !was(3)) this.startNewGame(PLAYER.ELF);
            if (startBtn && !was(9)) this.startNewGame(PLAYER.WARRIOR);
          }
        }

        if (this.is('lost')) {
          if ((fireBtn && !was(0) && !was(1)) || (startBtn && !was(9))) this.tryContinue();
          if (selectBtn && !was(8)) this.abortContinue();
        }

        if (this.is('playing')) {
          if (this._ending) {
            if ((fireBtn && !was(0) && !was(1)) || (startBtn && !was(9))) this.endingAdvance();
            if (selectBtn && !was(8)) {
              this._ending.step = Math.max(this._ending.step, this._ending.cards.length - 1);
              this._ending.hold = this._ending.minHold;
            }
            continue;
          }
          if (startBtn && !was(9)) {
            if (this.saveMenu) this.closeSaveMenu();
            else this.togglePause();
          }
          if (selectBtn && !was(8)) this.openSaveMenu();

          if (this.saveMenu) {
            if (up && !prev.up) this.saveMenuMove(-1);
            if (down && !prev.down) this.saveMenuMove(1);
            if (fireBtn && !was(0) && !was(1)) this.saveMenuConfirm();
          } else if (!this.paused) {
            var player = this.players && this.players[pi];
            if (player) {
              player.moveLeft(!!left);
              player.moveRight(!!right);
              player.moveUp(!!up);
              player.moveDown(!!down);
              player.fire(!!fireBtn);
              if (potionBtn && !was(2) && !was(3)) player.nuke();
            }
          }
        }

        this._padPrev[pi] = {
          up: !!up, down: !!down, left: !!left, right: !!right,
          b0: pressed(0), b1: pressed(1), b2: pressed(2), b3: pressed(3),
          b8: !!selectBtn, b9: !!startBtn
        };
      }
    },

    draw: function(ctx, frame) {
      try {
        if (this.canDraw && this.map && this.render) {
          var shaking = this.viewport && (this.viewport.shakeTime > 0);
          if (shaking) {
            ctx.save();
            ctx.translate(this.viewport.shakeOx || 0, this.viewport.shakeOy || 0);
          }
          this.render.map(     ctx, frame, this.viewport, this.map);
          this.render.entities(ctx, frame, this.viewport, this.map.entities);
          var i, p;
          if (this.players) {
            for (i = 0; i < this.players.length; i++) {
              p = this.players[i];
              if (p && p.dead) this.render.player(ctx, frame, this.viewport, p);
            }
            for (i = 0; i < this.players.length; i++) {
              p = this.players[i];
              if (p && !p.dead) this.render.player(ctx, frame, this.viewport, p);
            }
            for (i = 0; i < this.players.length; i++) {
              p = this.players[i];
              if (p && p.dead && p.reviveProgress > 0) {
                var px = p.x - this.viewport.x, py = p.y - this.viewport.y - 6;
                var pct = Math.min(1, p.reviveProgress / (2 * FPS));
                ctx.fillStyle = '#222';
                ctx.fillRect(px, py, TILE, 4);
                ctx.fillStyle = '#4f4';
                ctx.fillRect(px, py, TILE * pct, 4);
              }
            }
            if (this.scoreboard) {
              for (i = 0; i < this.players.length; i++) {
                if (this.players[i]) this.scoreboard.refreshPlayer(this.players[i]);
              }
              this.scoreboard.refreshBossPanel();
            }
            // On-canvas boss energy bar
            if (this.map && this.map.bossEntity && this.map.bossEntity.active && this.render.bossBar)
              this.render.bossBar(ctx, this.viewport, this.map.bossEntity);
            // Phase 4: The Ring marker + destroy progress
            if (this.map && this.map.theRing && !this.map.theRing.done && this.render.drawTheRing)
              this.render.drawTheRing(ctx, this.viewport, this.map.theRing, frame);
          }
          if (shaking) ctx.restore();
        }
        if (this._ending)
          this.drawEnding(ctx);
      } catch (err) {
        if (window.console && console.error) console.error('draw error', err);
      }
      this.debugHeap(frame);
    },

    //------------------------
    // PUB/SUB EVENT HANDLING
    //------------------------

    onPlayerDeath:  function(player) {
      // Only end the game when every joined player is dead
      var i, anyAlive = false;
      for (i = 0; i < this.players.length; i++) {
        if (this.players[i] && !this.players[i].dead) anyAlive = true;
      }
      if (!anyAlive) {
        // Final Sauron battle: Lady Galadriel revives the party once
        if (this.tryGaladrielRevive())
          return;
        this.lose();
      }
    },

    // Potions are healing items (+200 energy)
    onPlayerNuke: function(player) {
      if (!player) return;
      player.heal(200);
      if (player.say) player.say("+200 energy!", 1.5 * FPS);
      if (this.map)
        this.map.addMultipleFx(6, player, FX.GENERATOR_DEATH, TILE, FPS/4);
    },

    // One-time full party revive on the Sauron finale
    tryGaladrielRevive: function() {
      if (!this.map || !this.map.level || this.map.level.boss !== 'sauron')
        return false;
      if (this._galadrielUsed) return false;
      this._galadrielUsed = true;

      var i, p;
      for (i = 0; i < this.players.length; i++) {
        p = this.players[i];
        if (!p) continue;
        p.dead = false;
        p.exiting = false;
        p.firing = false;
        p.chargingSpecial = false;
        p.chargeTime = 0;
        p.reviveProgress = 0;
        p.health = p.type.health;
        p.weakAnnounced = false;
        p.hurting = 0;
        p.healing = FX.PLAYER_GLOW.frames;
        if (this.map && this.map.start)
          this.map.occupy(this.map.start.x + (i * TILE), this.map.start.y, p);
        this.map.addMultipleFx(12, p, FX.GENERATOR_DEATH, TILE * 2, FPS/3);
      }

      var line = "Lady Galadriel: Rise, heroes of Middle-earth! Fight on!";
      if (this.players[0] && this.players[0].say)
        this.players[0].say(line, 5 * FPS);
      if (this.sounds && this.sounds.speak)
        this.sounds.speak("Rise, heroes of Middle-earth. Fight on for Middle-earth.", { rate: 0.9, pitch: 1.15 });
      try {
        this.help("<b>LADY GALADRIEL</b><br><br>A flash of light restores the Fellowship.<br><i>\"Continue the fight for Middle-earth!\"</i>");
      } catch (e) {}
      return true;
    },
    onPlayerSpecial: function(player) {
      if (!this.map || !player || !player.type.special) return;
      this.map.castSpecial(this.viewport, player);
    },
    onFxFinished:   function(fx)     { this.map.remove(fx); },

    onPlayerFire: function(player) {
      this.map.addWeapon(player.x, player.y, player.type.weapon, player.dir, player);
    },

    onMonsterFire: function(monster) {
      this.map.addWeapon(monster.x, monster.y, monster.type.weapon, monster.dir, monster);
    },

    onPlayerExiting: function(player, exit) {
      if (this._levelTransitioning) return;
      if (player && this.map && this.map.level)
        player.addscore(this.map.level.score);
      // Final stage: credits after the Fellowship takes the Exit (not mid-celebration)
      if (this.map && this.map.last && this.allLivingPlayersExiting()) {
        if (this._awaitingFinaleExit || (this.map.level && this.map.level.boss === 'sauron')) {
          this._awaitingFinaleExit = false;
          this.startEndingCinematic();
          return;
        }
        this.win();
      }
    },

    // True when every non-dead joined player is in the exit animation (or already finished it)
    allLivingPlayersExiting: function() {
      var i, p, any = false;
      if (!this.players || !this.players.length) return true;
      for (i = 0; i < this.players.length; i++) {
        p = this.players[i];
        if (!p || p.dead) continue;
        any = true;
        if (!p.exiting) return false;
      }
      return any;
    },

    onPlayerExit: function(player) {
      // Guard: only advance once per level; ignore stale timeouts after Continue
      if (!this.map || this.map.last || this._levelTransitioning)
        return;
      if (this._exitGraceUntil && Date.now() < this._exitGraceUntil)
        return;

      // Co-op: do NOT advance until every living player has reached the exit.
      // (One player touching the exit used to skip stages while the other was still fighting.)
      if (!this.allLivingPlayersExiting()) {
        if (player && player.say)
          player.say("Waiting for your companion...", 2 * FPS);
        return;
      }

      // Capture the level we're leaving so a later timeout can't skip many stages
      var fromLevel = this.map.nlevel;
      this.clearExitTimer();
      this._levelTransitioning = true;
      var self = this;
      this._exitTimer = setTimeout(function() {
        self._exitTimer = null;
        // Only advance if we're still on the same level that was exited
        if (!self.is('playing') || !self.map || self.map.nlevel !== fromLevel) {
          self._levelTransitioning = false;
          return;
        }
        // Re-check co-op condition at fire time
        if (!self.allLivingPlayersExiting()) {
          self._levelTransitioning = false;
          return;
        }
        self._levelTransitioning = false;
        self.nextLevel();
      }, 300);
    },

    onDoorOpening: function(door, speed) {
      var nextdoor;
      if (nextdoor = this.map.door(door.x-TILE, door.y))
        nextdoor.open(speed);
      if (nextdoor = this.map.door(door.x+TILE, door.y))
        nextdoor.open(speed);
      if (nextdoor = this.map.door(door.x, door.y-TILE))
        nextdoor.open(speed);
      if (nextdoor = this.map.door(door.x, door.y+TILE))
        nextdoor.open(speed);
    },

    onDoorOpen: function(door) {
      this.map.remove(door);
    },

    onTreasureCollected: function(treasure, player) {
      this.map.remove(treasure);
    },

    onWeaponCollide: function(weapon, entity) {
      var x = weapon.x + (entity.x ? (entity.x - weapon.x)/2 : 0),
          y = weapon.y + (entity.y ? (entity.y - weapon.y)/2 : 0),
          dmg = weapon.type.damage;

      // Apply owner damage multipliers (combo / power-ups)
      if (weapon.type.player && weapon.owner && weapon.owner.weaponDamageMul)
        dmg = dmg * weapon.owner.weaponDamageMul;

      // Boss weaknesses: some heroes hit certain bosses harder
      if (weapon.type.player && weapon.owner && entity.monster && entity.type && entity.type.boss && entity.type.weakTo) {
        var hero = weapon.owner.type && weapon.owner.type.name;
        if (hero && entity.type.weakTo[hero])
          dmg = dmg * entity.type.weakTo[hero];
      }

      if (weapon.type.player && (entity.monster || entity.generator))
        entity.hurt(dmg, weapon);
      else if (weapon.type.monster && entity.player)
        entity.hurt(dmg, weapon);
      else if (weapon.type.monster && entity.monster)
        entity.hurt(1, weapon);

      this.map.addFx(x, y, FX.WEAPON_HIT);
      this.map.remove(weapon);
    },

    onPlayerCollide: function(player, entity) {
      if (!entity || entity === true) return; // wall
      // Never treat another player as an exit (Player.exit is a function → was truthy!)
      if (entity.player) return;
      if (entity.monster || entity.generator)
        entity.hurt(player.type.damage, player);
      else if (entity.treasure)
        player.collect(entity);
      else if (entity.door && player.keys && entity.open())
        player.keys--;
      else if (entity.exit === true)
        player.exit(entity);
    },

    onMonsterCollide: function(monster, entity) {
      if (entity.player) {
        entity.hurt(monster.type.damage, monster);
        if (monster.type.selfharm)
          monster.hurt(monster.type.selfharm, monster);
      }
    },

    onMonsterDeath: function(monster, by, nuke) {
      if (by)
        by.addscore(monster.type.score);
      this.map.addMultipleFx(3, monster, FX.MONSTER_DEATH, TILE/2, nuke ? FPS/2 : FPS/6);
      if (monster.type && monster.type.boss) {
        this.startBossCelebration(monster, by);
        if (this.map) {
          this.map.bossEntity = null;
          this.map.bossDefeated = true;
        }
      }
      this.map.remove(monster);
    },

    startBossCelebration: function(monster, by) {
      var id = monster.type.bossId;
      var name = monster.type.displayName || 'Boss';
      var line = 'The ' + name + ' is defeated!';
      if (id === 'witchking') line = 'The Witch-king of Angmar is defeated!';
      else if (id === 'balrog') line = "Durin's Bane is defeated!";
      else if (id === 'lurtz') line = 'Lurtz is defeated!';
      else if (id === 'blackrider') line = 'The Black Rider is defeated!';
      else if (id === 'nazgul') line = 'The Nazgûl is defeated!';
      else if (id === 'sauron') line = 'The Shadow of Sauron is defeated!';

      var speaker = (by && by.say) ? by : (this.players && this.players[0]);
      if (speaker && speaker.say) speaker.say(line, id === 'sauron' ? 10 * FPS : 3.5 * FPS);
      if (this.sounds && this.sounds.speak) this.sounds.speak(line, { rate: 0.9, pitch: 0.85 });

      // Immediate big explosion
      this.map.addMultipleFx(24, monster, FX.GENERATOR_DEATH, TILE * 3, FPS/2);
      this.map.addMultipleFx(12, monster, FX.MONSTER_DEATH, TILE * 2, FPS/3);

      var isFinal = (id === 'sauron');
      var duration = isFinal ? 11 * FPS : 2.5 * FPS;
      var shakeMag = isFinal ? 10 : 4;

      if (this.viewport && this.viewport.shake)
        this.viewport.shake(duration, shakeMag);

      // Timed secondary blasts for 2–3s (or longer for Sauron)
      this._bossCelebrate = {
        x: monster.x,
        y: monster.y,
        framesLeft: duration,
        isFinal: isFinal,
        tick: 0
      };
    },

    updateBossCelebration: function(frame) {
      var c = this._bossCelebrate;
      if (!c || !this.map) return;
      c.framesLeft--;
      c.tick++;
      // Pulse explosions every ~8 frames
      if (c.tick % 8 === 0 && c.framesLeft > 0) {
        var target = { x: c.x + Game.Math.randomInt(-TILE * 2, TILE * 2),
                       y: c.y + Game.Math.randomInt(-TILE * 2, TILE * 2) };
        var amount = c.isFinal ? 10 : 6;
        this.map.addMultipleFx(amount, target, FX.GENERATOR_DEATH, TILE * (c.isFinal ? 3 : 2), FPS/4);
        if (c.isFinal && c.tick % 16 === 0)
          this.map.addMultipleFx(6, target, FX.MONSTER_DEATH, TILE * 2, FPS/5);
      }
      if (c.framesLeft <= 0) {
        var wasFinal = c.isFinal;
        this._bossCelebrate = null;
        // Final boss: clear the field, stop drain — credits wait for Exit
        if (wasFinal)
          this.onSauronDefeatedCleanup();
      }
    },

    // After Sauron dies: wipe remaining foes, stop energy drain, prompt Exit
    onSauronDefeatedCleanup: function() {
      var map = this.map, i, e, p;
      if (!map) return;
      map.bossDefeated = true;
      map.hazard = null;
      map.lavaPools = [];
      map.fallingRocks = [];
      map.generatorsPaused = true;
      // Kill all remaining monsters / generators (heroes stay standing)
      for (i = map.entities.length - 1; i >= 0; i--) {
        e = map.entities[i];
        if (!e || !e.active) continue;
        if (e.monster || e.generator) {
          e.active = false;
          try { map.remove(e); } catch (err) {}
        }
      }
      // Heroes: stop time-drain / hazards; brief invuln glow
      if (this.players) {
        for (i = 0; i < this.players.length; i++) {
          p = this.players[i];
          if (!p || p.dead) continue;
          p._noAutohurt = true;
          p.mithril = Math.max(p.mithril || 0, 5 * FPS);
          p.healing = FX.PLAYER_GLOW.frames;
        }
      }
      this._awaitingFinaleExit = true;
      if (this.players && this.players[0] && this.players[0].say)
        this.players[0].say("Reach the Exit!", 4 * FPS);
      try {
        if (this.help)
          this.help("<b>VICTORY IS NEAR</b><br><br>Sauron is defeated. The host is scattered.<br><b>Walk into the Exit</b> for the ending.");
      } catch (err) {}
    },

    //=========================================================================
    // ENDING CINEMATIC (after Sauron / Ring)
    // FIRE / ENTER / ESC / Start skips to next card, then title
    //=========================================================================
    startEndingCinematic: function() {
      if (this._ending) return;
      var scores = [], names = [], i, p;
      for (i = 0; i < (this.players || []).length; i++) {
        p = this.players[i];
        if (p && p.type) {
          names.push((p.type.name || 'hero').toUpperCase());
          scores.push(p.score || 0);
        }
      }
      this._ending = {
        step: 0,
        hold: 0,
        minHold: Math.floor(1.2 * FPS),
        cards: [
          { title: 'THE DARK LORD HAS FALLEN', body: 'Sauron\'s armor crumbles to ash.\nHis mace falls silent.' },
          { title: 'THE EYE IS SHATTERED', body: 'High above Mordor the great Eye\nwidens — then breaks.\nA shockwave tears across the land.' },
          { title: 'THE RING IS DESTROYED', body: 'Fire takes the Ring.\nThe Shadow is broken.' },
          { title: 'MIDDLE-EARTH IS FREE', body: 'The sky turns blue.\nFor the first time, the field is quiet.' },
          { title: 'MORDOR', body: 'The Black Gate collapses.\nOrcs cast down their weapons and flee.\nThe fires of Mount Doom die.' },
          { title: 'MINAS TIRITH', body: 'The people emerge.\nThe White Tree blooms again.\nBells ring through the city.' },
          { title: 'ROHAN & ISENGARD', body: 'Riders gallop the plains in joy.\nIsengard\'s towers crumble;\ntrees reclaim the land.' },
          { title: 'THE SHIRE', body: 'Hobbits walk the fields.\nChildren play.\nFour figures crest a distant hill.' },
          { title: 'THE FELLOWSHIP', body:
              (names.length ? names.join('  ·  ') : 'ARAGORN  ·  GANDALF  ·  LEGOLAS  ·  GIMLI') +
              '\n\nThey are battered. They are smiling.\n\nGimli: \"I could use a drink.\"\nLegolas: \"You could use a bath.\"' },
          { title: 'THE JOURNEY IS OVER', body: 'THE DARK LORD HAS FALLEN.\nTHE RING IS DESTROYED.\nMIDDLE-EARTH IS FREE.' },
          { title: 'CONGRATULATIONS, HEROES!', body:
              (scores.length ? scores.map(function(s, idx) {
                return (names[idx] || ('P' + (idx + 1))) + '  —  ' + s + ' pts';
              }).join('\n') : '') +
              '\n\nMIDDLE-EARTH HAS BEEN SAVED.\n\nPress FIRE to continue' }
        ]
      };
      this.paused = true; // freeze gameplay under the cards
      if (this.sounds && this.sounds.speak)
        this.sounds.speak('The Dark Lord has fallen. Middle-earth is free.', { rate: 0.9, pitch: 0.9 });
      try {
        if (this.help)
          this.help("<b>VICTORY</b><br><br>Press <b>FIRE</b> to advance the ending.<br>ESC skips to the final card.");
      } catch (e) {}
    },

    endingAdvance: function() {
      if (!this._ending) return;
      if (this._ending.hold < this._ending.minHold) return; // prevent accidental skip
      this._ending.step++;
      this._ending.hold = 0;
      if (this._ending.step >= this._ending.cards.length) {
        this.finishEndingCinematic();
        return;
      }
      var card = this._ending.cards[this._ending.step];
      if (card && this.sounds && this.sounds.speak && this._ending.step < 4)
        this.sounds.speak(card.title, { rate: 0.95, pitch: 0.95 });
    },

    finishEndingCinematic: function() {
      this._ending = null;
      this.paused = false;
      // Soft fade into win / return toward title
      try { this.win(); } catch (e) {
        try { this.finish(); } catch (e2) {}
      }
    },

    updateEnding: function(frame) {
      if (!this._ending) return;
      this._ending.hold++;
      // Auto-advance slowly so it plays even without input
      var autoAfter = (this._ending.step >= this._ending.cards.length - 1) ? 8 * FPS : 4.5 * FPS;
      if (this._ending.hold >= autoAfter)
        this.endingAdvance();
    },

    drawEnding: function(ctx) {
      var e = this._ending;
      if (!e || !e.cards[e.step]) return;
      var card = e.cards[e.step];
      var w = ctx.canvas.width, h = ctx.canvas.height;
      ctx.save();
      // Dim / white-flash feel on first cards
      var alpha = e.step === 0 ? 0.82 : 0.78;
      ctx.fillStyle = 'rgba(0,0,0,' + alpha + ')';
      ctx.fillRect(0, 0, w, h);
      if (e.step <= 2) {
        ctx.fillStyle = 'rgba(255,255,255,' + (0.08 + 0.05 * Math.sin(e.hold / 8)) + ')';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f5e6a3';
      ctx.font = 'bold 22px Tahoma, serif';
      ctx.fillText(card.title, w / 2, h * 0.28);
      ctx.fillStyle = '#ddd';
      ctx.font = '14px Tahoma, sans-serif';
      var lines = (card.body || '').split('\n'), li;
      for (li = 0; li < lines.length; li++)
        ctx.fillText(lines[li], w / 2, h * 0.38 + li * 20);
      ctx.fillStyle = 'rgba(200,200,200,0.7)';
      ctx.font = '11px Tahoma, sans-serif';
      ctx.fillText('FIRE = next   ·   ESC = skip to end', w / 2, h * 0.92);
      ctx.restore();
    },

    onGeneratorDeath: function(generator, by) {
      if (by)
        by.addscore(generator.type.score);
      this.map.addMultipleFx(20, generator, FX.GENERATOR_DEATH, TILE, FPS/2);
      this.map.remove(generator);
    },

    //------
    // MISC
    //------

    saveLevel: function(nlevel) { this.storage[STORAGE.NLEVEL] = nlevel;             },
    loadLevel: function()       { var n = to.number(this.storage[STORAGE.NLEVEL], 0); if (n < 0 || n >= cfg.levels.length) n = 0; return n; },
    nextLevel: function() {
      if (!this.map || this._levelTransitioning) return;
      var n = this.map.nlevel + 1;
      this.clearExitTimer();
      this._exitGraceUntil = Date.now() + 3000;
      this.load(n >= cfg.levels.length ? 0 : n);
    },
    prevLevel: function()       { var n = this.map.nlevel - 1; this.load(n <= 0                 ? cfg.levels.length - 1 : n); },

    loadHighScore: function() { return to.number(this.storage[STORAGE.SCORE], 10000); },
    loadHighWho:   function() { return this.storage[STORAGE.WHO];                     },

    saveHighScore: function() {
      var i, best = 0, who = null, p;
      for (i = 0; i < this.players.length; i++) {
        p = this.players[i];
        if (p && p.score > best) {
          best = p.score;
          who = p.type.name;
        }
      }
      if (best > this.loadHighScore()) {
        this.storage[STORAGE.SCORE] = best;
        this.storage[STORAGE.WHO]   = who;
      }
    },

    debugWall:  function(back) { DEBUG.WALL  = (DEBUG.WALL  || this.map.level.wall)  + (back ? -1 : 1); if (DEBUG.WALL  > WALL.MAX)  DEBUG.WALL  = WALL.MIN;  if (DEBUG.WALL  < WALL.MIN)  DEBUG.WALL  = WALL.MAX;  console.log("WALL = "  + DEBUG.WALL);  this.map.background = null; },
    debugFloor: function(back) { DEBUG.FLOOR = (DEBUG.FLOOR || this.map.level.floor) + (back ? -1 : 1); if (DEBUG.FLOOR > FLOOR.MAX) DEBUG.FLOOR = FLOOR.MIN; if (DEBUG.FLOOR < FLOOR.MIN) DEBUG.FLOOR = FLOOR.MAX; console.log("FLOOR = " + DEBUG.FLOOR); this.map.background = null; },
    debugGrid:  function()     { DEBUG.GRID = !DEBUG.GRID;  this.map.background = null; },

    debugHeap: function(frame) {
      if (DEBUG.HEAP && window.performance && window.performance.memory && window.performance.memory.usedJSHeapSize) {
        var mb = Math.round(window.performance.memory.usedJSHeapSize/(1024*1024));
        if (mb < this.lastmb) {
          console.log("garbage collected from " + this.lastmb + " to " + mb + " = " + (this.lastmb - mb) + " MB in " + (frame - (this.lastgb||0)) + " frames");
          this.lastgb = frame;
        }
        this.lastmb = mb;
      }
    },

    clean: function(storage) {
      if (DEBUG.RESET || (storage[STORAGE.VERSION] != VERSION)) {
        for(var key in STORAGE)
          delete storage[STORAGE[key]];
        storage[STORAGE.VERSION] = VERSION;
      }
      return storage;
    }

  };

  //===========================================================================
  // THE MAP
  //===========================================================================

  var Map = Class.create({

    initialize: function(nlevel) {
      this.setupLevel(nlevel);
    },

    cell: function(x, y) {
      return this.cells[p2t(x) + (p2t(y) * this.tw)];
    },

    door: function(x, y) {
      var cell = this.cell(x, y);
      if (!cell || !cell.occupied) return null;
      var obj = cell.occupied[0];  // optimization - we know doors will always be first (and only) entity in a cell
      return obj && obj.door ? obj : null;
    },

    tpos: { }, // a persistent intermediate object to avoid GC allocations (caller is responsible for using result immediately and not hanging on to a reference)

    trymove: function(entity, dir, speed, ignore, dryrun) {
      var collision;
      this.tpos.x = entity.x + (isLeft(dir) ? -speed : isRight(dir) ? speed : 0);
      this.tpos.y = entity.y + (isUp(dir)   ? -speed : isDown(dir)  ? speed : 0);
      collision = this.occupied(this.tpos.x + entity.cbox.x, this.tpos.y + entity.cbox.y, entity.cbox.w, entity.cbox.h, ignore || entity);
      if (!collision && !dryrun) {
        this.occupy(this.tpos.x, this.tpos.y, entity);
      }
      return collision;
    },

    canmove: function(entity, dir, speed, ignore) {
      if (false === this.trymove(entity, dir, speed, ignore, true))
        return this.tpos; // caller is responsible for using result immediately and NOT holding a reference to the object
      else
        return false;
    },

    occupy: function(x, y, obj) {

      // always move, assume caller took care to avoid collisions
      obj.x = x;
      obj.y = y;

      // for temporal objects (weapons, fx, etc) that dont need collision detection we're done.
      if (obj.temporal)
        return;

      var c, max, cell, before = obj.cells, after = this.overlappingCells(x, y, TILE, TILE);

      // optimization - if overlapping cells are same as they were before then bail out early
      if ((before.length === after.length)                  && 
          (                       (before[0] === after[0])) &&
          ((before.length < 2) || (before[1] === after[1])) &&
          ((before.length < 3) || (before[2] === after[2])) &&
          ((before.length < 4) || (before[3] === after[3]))) {
        return;
      }

      // otherwise remove object from previous cells that are no longer occupied
      for(c = 0, max = before.length ; c < max ; c++) {
        cell = before[c];
        if (!set_contains(after, cell))
          set_remove(cell.occupied, obj);
      }

      // and add object to new cells that were not previously occupied
      for(c = 0, max = after.length ; c < max ; c++) {
        cell = after[c];
        if (!set_contains(before, cell))
          set_add(cell.occupied, obj);
      }

      // and remember for next time
      set_copy(before, after);

      return obj;
    },

    overlappingCells: function(x, y, w, h) {

      var cells = _overlappingCells.getcells();

      if ((x === null) || (y === null))
        return cells;

      x = Math.floor(x); // ensure working in integer math in this function to avoid floating point errors giving us the wrong cells
      y = Math.floor(y);

      var nx = ((x%TILE) + w) > TILE ? 1 : 0,
          ny = ((y%TILE) + h) > TILE ? 1 : 0;

      var c0 = this.cell(x, y);
      if (c0) set_add(cells, c0);
      if (nx > 0) {
        c0 = this.cell(x + TILE, y);
        if (c0) set_add(cells, c0);
      }
      if (ny > 0) {
        c0 = this.cell(x, y + TILE);
        if (c0) set_add(cells, c0);
      }
      if ((nx > 0) && (ny > 0)) {
        c0 = this.cell(x + TILE, y + TILE);
        if (c0) set_add(cells, c0);
      }

      return cells;

    },

    occupied: function(x, y, w, h, ignore) {

      var cells   = this.overlappingCells(x, y, w, h),
          checked = _occupied.getchecked(), // avoid checking against the same item multiple times (if that item spans multiple cells)
          cell, item,
          c, nc = cells.length,
          i, ni, p, players;

      // have to check for any player FIRST, so even if player is near a wall or other monster he will still get hit
      // (otherwise its possible to use monsters as semi-shields against other monsters).
      // Support multiple local players. Players do not block each other — only monsters/weapons care about players here.
      players = game.players || (game.player ? [game.player] : []);
      var moverIsPlayer = ignore && ignore.player;
      for (i = 0; i < players.length; i++) {
        p = players[i];
        if (p && p !== ignore && p.active && p.active() && overlapEntity(x, y, w, h, p)) {
          if (moverIsPlayer)
            continue; // friendly — players walk through each other
          return p;
        }
      }

      // now loop again checking for walls and other entities
      for(c = 0 ; c < nc ; c++) {
        cell = cells[c];
        if (!cell) continue; // out-of-bounds / invalid cell — never crash
        if (cell.wall !== undefined)
          return true;
        if (!cell.occupied) continue;
        for(i = 0, ni = cell.occupied.length ; i < ni ; i++) {
          item = cell.occupied[i];
          if ((item != ignore) && !set_contains(checked, item)) {
            set_add(checked, item);
            // Players never block each other via the occupied grid either
            if (moverIsPlayer && item && item.player)
              continue;
            if (overlapEntity(x, y, w, h, item))
              return item;
          }
        }
      }

      return false;
    },

    //-------------------------------------------------------------------------

    nuke: function(viewport, player) {
      var n, max, entity, distance, limit = TILE*player.type.magic;
      for(n = 0, max = this.entities.length ; n < max ; n++) {
        entity = this.entities[n];
        if (entity.monster && entity.active) {
          distance = Math.max(Math.abs(player.x - entity.x), Math.abs(player.y - entity.y)); // rough, but fast, approximation for slower, sqrt(x*x + y*y)
          if (distance < limit)
            entity.hurt(player.type.magic * (1 - distance/limit), player, true);
        }
      }
    },

    // Character special attacks (hold fire ~2 seconds)
    castSpecial: function(viewport, player) {
      if (!player || !player.type || !player.type.special || !this.entities) return;
      var sp = player.type.special, n, max, entity, distance, dx, dy, len, force,
          limit = sp.screenwide ? 99999 : sp.radius;

      try {
        // Visual FX around the caster
        this.addMultipleFx(sp.screenwide ? 12 : 8, player, FX.GENERATOR_DEATH, TILE * (sp.screenwide ? 3 : 1.5), FPS/3);

        // Snapshot length so removals mid-loop don't scramble iteration
        max = this.entities.length;
        for (n = 0; n < max; n++) {
          entity = this.entities[n];
          if (!entity || !entity.active) continue;
          if (!(entity.monster || entity.generator)) continue;

          // Screen-wide specials only hit what's on screen
          if (sp.screenwide && viewport && viewport.outside(entity.x, entity.y, TILE, TILE))
            continue;

          distance = Math.max(Math.abs(player.x - entity.x), Math.abs(player.y - entity.y));
          if (distance > limit) continue;

          // Damage (falloff for non-screenwide) + boss weakness
          var dmg = sp.screenwide ? sp.damage : sp.damage * (1 - distance / (limit || 1));
          if (entity.type && entity.type.boss && entity.type.weakTo && player.type && entity.type.weakTo[player.type.name])
            dmg = dmg * entity.type.weakTo[player.type.name];
          if (entity.hurt) entity.hurt(Math.max(1, dmg), player, true);

          // Stun
          if (sp.stun && entity.monster)
            entity.stunned = Math.max(entity.stunned || 0, sp.stun);

          // Knockback away from player — only onto open floor (never into walls)
          if (sp.knockback && entity.monster && entity.active) {
            dx = entity.x - player.x;
            dy = entity.y - player.y;
            len = Math.sqrt(dx * dx + dy * dy) || 1;
            force = sp.knockback * (sp.screenwide ? 1 : Math.max(0.2, 1 - distance / (limit || 1)));
            var nx = entity.x + (dx / len) * force;
            var ny = entity.y + (dy / len) * force;
            nx = Math.max(TILE, Math.min(nx, this.w - TILE * 2));
            ny = Math.max(TILE, Math.min(ny, this.h - TILE * 2));
            var cell = this.cell(nx, ny);
            if (cell && cell.wall === undefined && !cell.nothing)
              this.occupy(nx, ny, entity);
            // else leave them where they are — better than wall-clipping
          }
        }

        // Arrow Storm lingering rain
        if (sp.id === 'arrowstorm')
          player.arrowStorm = sp.duration || (2 * FPS);
        // Aragorn speed boost
        if (sp.id === 'anduril' && sp.speedBoost) {
          player.speedBoost = sp.speedBoost;
          player.speedBoostTime = sp.speedBoostTime || (3 * FPS);
        }
      } catch (err) {
        if (window.console && console.error) console.error('castSpecial error', err);
      }
    },

    //-------------------------------------------------------------------------

    update: function(frame, player, map, viewport) {
      var n, max, entity;
      for(n = 0, max = this.entities.length ; n < max ; n++) {
        entity = this.entities[n];
        if (entity.active && entity.update)
          entity.update(frame, player, map, viewport);
      }
      // Boss stages: after main enemies die, bring the boss in
      this.trySpawnPendingBoss();
    },

    //-------------------------------------------------------------------------

    setupLevel: function(nlevel) {

      var level  = cfg.levels[nlevel],
          source = level.source,
          tw     = source.width,
          th     = source.height,
          self   = this;

      this.nlevel   = nlevel;
      this.level    = level;
      this.last     = nlevel === (cfg.levels.length-1);
      this.tw       = tw;
      this.th       = th;
      this.w        = tw * TILE;
      this.h        = th * TILE;
      this.start    = null;
      this.cells    = [];
      this.entities = [];
      this.pool     = { weapons: [], monsters: [], fx: [] }

      function is(pixel, type) { return ((pixel & PIXEL.MASK.TYPE) === type); };
      function type(pixel)     { return  (pixel & PIXEL.MASK.EXHIGH) >> 4;    };

      function isnothing(pixel)      { return is(pixel, PIXEL.NOTHING);   };
      function iswall(pixel)         { return is(pixel, PIXEL.WALL);      };
      function isstart(pixel)        { return is(pixel, PIXEL.START);     };
      function isdoor(pixel)         { return is(pixel, PIXEL.DOOR);      }; 
      function isexit(pixel)         { return is(pixel, PIXEL.EXIT);      };
      function isgenerator(pixel)    { return is(pixel, PIXEL.GENERATOR); };
      function ismonster(pixel)      { return is(pixel, PIXEL.MONSTER);   };
      function istreasure(pixel)     { return is(pixel, PIXEL.TREASURE);  };
      function walltype(tx,ty,map)   { return (iswall(map.pixel(tx,   ty-1)) ? 1 : 0) | (iswall(map.pixel(tx+1, ty))   ? 2 : 0) | (iswall(map.pixel(tx,   ty+1)) ? 4 : 0) | (iswall(map.pixel(tx-1, ty))   ? 8 : 0); };
      function shadowtype(tx,ty,map) { return (iswall(map.pixel(tx-1, ty))   ? 1 : 0) | (iswall(map.pixel(tx-1, ty+1)) ? 2 : 0) | (iswall(map.pixel(tx,   ty+1)) ? 4 : 0); };
      function doortype(tx,ty,map)   { return iswall(map.pixel(tx, ty-1)) || isdoor(map.pixel(tx, ty-1)) ? DOOR.VERTICAL : DOOR.HORIZONTAL; };

      Game.parseImage(source, function(tx, ty, pixel, map) {

        var cell, x = t2p(tx),
                  y = t2p(ty),
                  n = tx + (ty * tw);

        self.cells[n] = cell = { occupied: [] };

        if (isstart(pixel))
          self.start = { x: x, y: y }

        if (iswall(pixel))
          cell.wall = walltype(tx, ty, map);
        else if (isnothing(pixel))
          cell.nothing = true;
        else
          cell.shadow = shadowtype(tx, ty, map);

        if (isexit(pixel))
          self.addExit(x, y, DOOR.EXIT);
        else if (isdoor(pixel))
          self.addDoor(x, y, doortype(tx,ty,map));
        else if (isgenerator(pixel))
          self.addGenerator(x, y, MONSTERS[type(pixel) < MONSTERS.length ? type(pixel) : 0]);
        else if (istreasure(pixel))
          self.addTreasure(x, y, TREASURES[type(pixel) < TREASURES.length ? type(pixel) : 0]);
        else if (ismonster(pixel))
          self.addMonster(x, y, MONSTERS[type(pixel) < MONSTERS.length ? type(pixel) : 0]);
      });

      // Phase 4/5: bosses wait until the stage's main enemies are cleared
      this.hazard = level.hazard || null;
      this.escort = !!level.escort;
      this.bossEntity = null;
      this.bossName = null;
      this.pendingBossType = null;
      this.bossDefeated = !level.boss; // non-boss stages are already "clear"
      this.generatorsPaused = false;
      this.bossSpawnGrace = 0;
      if (level.boss) {
        var bossType = null;
        if (level.boss === 'blackrider') bossType = MONSTER.BLACKRIDER;
        else if (level.boss === 'nazgul') bossType = MONSTER.NAZGUL;
        else if (level.boss === 'witchking') bossType = MONSTER.WITCHKING;
        else if (level.boss === 'balrog') bossType = MONSTER.BALROG;
        else if (level.boss === 'lurtz') bossType = MONSTER.LURTZ;
        else if (level.boss === 'sauron') bossType = MONSTER.SAURON;
        if (bossType) {
          this.pendingBossType = bossType;
          this.bossName = bossType.displayName || level.boss;
          this.bossDefeated = false;
          this.bossSpawnGrace = 2 * FPS;
          // Generators stay active so enemies spawn; boss waits until room is cleared
          this.generatorsPaused = false;
        }
      }
    },

    // True while any non-boss monster OR generator is still alive
    hasActiveMainEnemies: function() {
      var n, e;
      for (n = 0; n < this.entities.length; n++) {
        e = this.entities[n];
        if (!e || !e.active) continue;
        if (e.monster && !(e.type && e.type.boss))
          return true;
        if (e.generator)
          return true;
      }
      return false;
    },

    // Spawn the pending boss once the stage is cleared of main enemies + generators
    trySpawnPendingBoss: function() {
      if (!this.pendingBossType || this.bossEntity || this.bossDefeated) return;
      // Grace period so we never spawn on frame 0 of a nearly-empty map
      if (this.bossSpawnGrace == null) this.bossSpawnGrace = 2 * FPS;
      if (this.bossSpawnGrace > 0) {
        this.bossSpawnGrace--;
        return;
      }
      if (this.hasActiveMainEnemies()) return;
      var cx = this.start ? this.start.x : TILE * 4;
      var cy = this.start ? this.start.y : TILE * 4;
      if (game.players && game.players[0] && !game.players[0].dead) {
        cx = game.players[0].x;
        cy = game.players[0].y;
      }
      var pos = this.findOpenSpawn(cx, cy, 2, 14);
      this.bossEntity = this.addMonster(pos.x, pos.y, this.pendingBossType);
      this.pendingBossType = null;
      this.generatorsPaused = false; // waves can resume during the boss fight
      if (this.bossEntity) {
        this.bossEntity.bossPhase = 1;
        this.bossEntity.bossAnnounced = false;
        this.bossEntity.maxHealth = this.bossEntity.type.health;
        this.bossEntity.maceTimer = 2 * FPS;     // first mace after short delay
        this.bossEntity.shockTimer = 4 * FPS;
        this.bossEntity.summonTimer = 3 * FPS;
        this.bossEntity.sauronPhase1Intro = (this.bossEntity.type.bossId === 'sauron') ? 2.5 * FPS : 0;
        // Bosses stay visible — no flickering invisibility while fighting
        if (this.bossEntity.type)
          this.bossEntity.type = Object.assign({}, this.bossEntity.type, { invisibility: false });
        // Sauron is twice as large on screen
        if (this.bossEntity.type.bossId === 'sauron') {
          this.bossEntity.dw = TILE;
          this.bossEntity.dh = TILE;
          this.bossEntity.dx = -TILE / 2;
          this.bossEntity.dy = -TILE / 2;
        }
        this.addMultipleFx(10, this.bossEntity, FX.GENERATOR_DEATH, TILE * 2, FPS/3);

        // Ensure stage music is audible when the boss appears
        if (game.sounds && this.level && this.level.music) {
          try {
            game.sounds.playGameMusic(game.sounds.sounds[this.level.music] || game.sounds.sounds.warbringer || game.sounds.sounds.game);
          } catch (err) {}
        }

        // Sauron Phase 1 entrance — cinematic beat, then combat
        if (this.bossEntity.type.bossId === 'sauron') {
          if (game.viewport && game.viewport.shake)
            game.viewport.shake(3 * FPS, 8);
          var boom = 'YOU HAVE COME TOO FAR.';
          if (game.players && game.players[0] && game.players[0].say)
            game.players[0].say(boom, 3.5 * FPS);
          if (game.sounds && game.sounds.speak)
            game.sounds.speak(boom, { rate: 0.75, pitch: 0.55 });
          try {
            if (game.help)
              game.help("<b>SAURON, THE DARK LORD</b><br><br>Phase 1 — The Dark Lord<br>Dodge the Mace. Survive the Shockwave. Clear the Legion!");
          } catch (e) {}
          setTimeout(function() {
            if (game.players && game.players[0] && game.players[0].say)
              game.players[0].say('Sauron takes form!', 2.5 * FPS);
          }, 2800);
        } else if (game.players && game.players[0] && game.players[0].say) {
          var line = 'BOSS: ' + (this.bossName || 'Boss') + '!';
          game.players[0].say(line, 3.5 * FPS);
          if (game.sounds && game.sounds.speak)
            game.sounds.speak(line, { rate: 0.95, pitch: 0.8 });
        }
      }
    },

    // Find a walkable floor tile near (cx,cy) — never inside a wall
    findOpenSpawn: function(cx, cy, minDist, maxDist) {
      minDist = minDist || 2;
      maxDist = maxDist || 12;
      // Snap to tile grid so we never land half-in a wall
      cx = Math.floor(cx / TILE) * TILE;
      cy = Math.floor(cy / TILE) * TILE;
      var r, dx, dy, x, y, cell, candidates = [];
      for (r = minDist; r <= maxDist; r++) {
        candidates = [];
        for (dx = -r; dx <= r; dx++) {
          for (dy = -r; dy <= r; dy++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            x = cx + dx * TILE;
            y = cy + dy * TILE;
            if (x < TILE || y < TILE || x > this.w - TILE * 2 || y > this.h - TILE * 2) continue;
            if (this.isFloorOpen(x, y))
              candidates.push({ x: x, y: y });
          }
        }
        if (candidates.length)
          return candidates[Game.Math.randomInt(0, candidates.length - 1)];
      }
      // Fallback: start tile, or any open scan near map center
      if (this.start && this.isFloorOpen(this.start.x, this.start.y))
        return { x: this.start.x, y: this.start.y };
      return { x: cx, y: cy };
    },

    isFloorOpen: function(x, y) {
      // Center-sample only — avoids false "in wall" during normal sub-tile movement
      var cell = this.cell(x + TILE / 2, y + TILE / 2);
      return !!(cell && cell.wall === undefined && !cell.nothing);
    },

    findExitEntity: function() {
      var n, e;
      for (n = 0; n < this.entities.length; n++) {
        e = this.entities[n];
        if (e && e.active && e.exit === true) return e;
      }
      return null;
    },

    //-------------------------------------------------------------------------

    addGenerator: function(x, y, type)             { return DEBUG.NOGENERATORS ? null : this.add(x, y, Generator, null,               type);             },
    addTreasure:  function(x, y, type) {
      if (DEBUG.NOTREASURE) return null;
      // Random potatoes among food pickups
      if (type && (type === TREASURE.FOOD1 || type === TREASURE.FOOD2 || type === TREASURE.FOOD3) && Math.random() < 0.28)
        type = TREASURE.POTATO;
      return this.add(x, y, Treasure, null, type);
    },
    addDoor:      function(x, y, type)             { return DEBUG.NODOORS      ? null : this.add(x, y, Door,      null,               type);             },
    addExit:      function(x, y, type)             { return DEBUG.NOEXITS      ? null : this.add(x, y, Exit,      null,               type);             },
    addWeapon:    function(x, y, type, dir, owner) { return DEBUG.NOWEAPONS    ? null : this.add(x, y, Weapon,    this.pool.weapons,  type, dir, owner); },
    addMonster:   function(x, y, type, generator)  { return DEBUG.NOMONSTERS   ? null : this.add(x, y, Monster,   this.pool.monsters, type, generator);  },
    addFx:        function(x, y, type, delay)      { return DEBUG.NOFX         ? null : this.add(x, y, Fx,        this.pool.fx,       type, delay);      },

    add: function(x, y, klass, pool) {
      var cfunc, entity, args = [].slice.call(arguments, 4);
      if (pool && pool.length) {
        entity = pool.pop();
        entity.initialize.apply(entity, args);
      }
      else {
        cfunc  = klass.bind.apply(klass, [null].concat(args)); // sneaky way to use Function.apply(args) on a constructor
        entity = new cfunc();
        entity.pool  = pool;           // entities track which pool they belong to (if any)
        entity.cells = [];             // entities track which cells they currently occupy
        this.entities.push(entity);
      }
      this.occupy(x, y, entity);
      entity.active = true;
      return entity;
    },

    remove: function(obj) {
      obj.active = false;
      this.occupy(null, null, obj);
      if (obj.pool)
        obj.pool.push(obj);
    },

    addMultipleFx: function(count, target, type, d, dt) {
      var n, x, y, collision;
      this.addFx(target.x, target.y, type);
      for(n = 0 ; n < 1000 ; n++) {
        x = target.x + Game.Math.randomInt(-d, d);
        y = target.y + Game.Math.randomInt(-d, d);
        collision = this.occupied(x, y, TILE, TILE, target);
        if (collision !== true) { // allow it unless its explicitly a wall
          this.addFx(x, y, type, Game.Math.randomInt(0, dt));
          if (--count === 0)
            break;
        }
      }
    }

  }); // Map

  //===========================================================================
  // MONSTERS
  //===========================================================================

  var Monster = Class.create({

    initialize: function(type, generator) {
      this.generator  = generator;
      this.type       = type;
      this.dir        = Game.Math.randomInt(0, 7); // start off in random direction, will quickly target player instead
      this.health     = type.health;
      this.thinking   = 0;
      this.travelling = 0;
      this.reloading  = 0;
      this.dx         = Game.Math.randomInt(-2, 2);  // a little random offset to break up lines of monsters
      this.dy         = Game.Math.randomInt(-4, 0);  // (ditto)
      this.df         = Game.Math.randomInt(0, 100); // a little random frame offset to keep monster animations out-of-sync
    },

    monster: true,
    cbox:    CBOX.MONSTER,

    update: function(frame, player, map, viewport) {

      // dont bother trying to update monsters that are far away (a double viewport away)
      if (viewport.outside(this.x - viewport.w, this.y - viewport.h, 2*viewport.w, 2*viewport.h))
        return;

      // Stunned by specials (You Shall Not Pass, Axequake, etc.)
      if (this.stunned && this.stunned > 0) {
        this.stunned = countdown(this.stunned);
        return;
      }

      // Boss multi-phase behavior
      if (this.type.boss) {
        this.updateBoss(frame, player, map, viewport);
      }

      // Invulnerable bosses (Sauron during The Nine) hold still
      if (this.invulnerable)
        return;

      // keep reloading (if applicable)
      this.reloading = countdown(this.reloading);

      // dont bother trying to update a monster that is still 'thinking'
      if (this.thinking && --this.thinking)
        return;

      // am i going towards a live player, or AWAY from a dead one, if away, my speed should be slow (the player is dead, I'm no longer interested in him)
      var away  = !player.active(),
          speed = away ? 1 : this.type.speed;
      if (this.type.boss && this.bossPhase >= 2)
        speed = speed * 1.35;
      if (this.type.boss && this.bossPhase >= 3)
        speed = speed * 1.15;
      // Phase 3 Fury — Sauron becomes much faster
      if (this.type.bossId === 'sauron' && this.furyActive)
        speed = speed * 1.45;

      // let travelling monsters travel
      if (this.travelling > 0)
        return this.step(map, player, this.dir, speed, countdown(this.travelling), !away);

      // otherwise find a new direction
      var dirs, n, max;
      dirs = PREFERRED_DIRECTIONS[this.directionTo(player, away)];
      for(n = 0, max = dirs.length ; n < max ; n++) {
        if (this.step(map, player, dirs[n], speed, n < 2 ? 0 : this.type.travelling * (n-2), !away))
          return;
      }

    },

    updateBoss: function(frame, player, map, viewport) {
      // Sauron has dedicated multi-phase AI (Phase 1 implemented)
      if (this.type.bossId === 'sauron') {
        this.updateSauron(frame, player, map, viewport);
        return;
      }

      var maxH = this.type.health || 1;
      var pct = this.health / maxH;
      var phase = 1;
      if (pct < 0.66) phase = 2;
      if (pct < 0.33) phase = 3;
      if (phase !== this.bossPhase) {
        this.bossPhase = phase;
        // Teleport only onto verified open floor near the player
        if (map && player) {
          var pos = map.findOpenSpawn(player.x, player.y, 2, 8);
          if (pos) map.occupy(pos.x, pos.y, this);
          map.addMultipleFx(6, this, FX.GENERATOR_DEATH, TILE, FPS/4);
        }
        // Spawn minions on open tiles near the boss
        if (map && phase >= 2) {
          var i, mpos, minion, mtype;
          for (i = 0; i < (phase === 3 ? 4 : 2); i++) {
            mpos = map.findOpenSpawn(this.x, this.y, 1, 5);
            mtype = phase >= 3 ? MONSTER.DEMON : MONSTER.GHOST;
            minion = map.addMonster(mpos.x, mpos.y, mtype);
          }
        }
        if (game.players && game.players[0] && game.players[0].say) {
          var line = 'Boss enraged!';
          if (this.type.bossId === 'witchking') line = phase === 2 ? 'The Witch-king vanishes!' : 'The Witch-king returns stronger!';
          else if (this.type.bossId === 'balrog') line = phase === 2 ? 'The Balrog roars!' : 'Shadow and flame!';
          else if (this.type.bossId === 'lurtz') line = 'Lurtz presses the attack!';
          else if (this.type.bossId === 'blackrider') line = phase === 2 ? 'The Black Rider circles!' : 'The Black Rider strikes!';
          game.players[0].say(line, 2.5 * FPS);
        }
      }
      if (this.type.bossId === 'balrog' && this.bossPhase >= 3 && this.type.weapon)
        this.reloading = Math.min(this.reloading, this.type.weapon.reload * 0.5);
    },

    //--------------------------------------------------------------------
    // SAURON — multi-phase finale
    // Phase 1: Mace / Shockwave / Legion
    // Phase 2: The Nine (invulnerable until all nine fall)
    // Phase 3: Sauron's Fury (speed + lava + rocks + denser attacks)
    // Phase 4: The Ring (hold fire on the Ring to destroy it)
    //--------------------------------------------------------------------
    updateSauron: function(frame, player, map, viewport) {
      if (!map) return;
      var maxH = this.maxHealth || this.type.health || 1;
      var pct = this.health / maxH;

      // Phase 2 interlude runs until The Nine are cleared (health gated only to ENTER)
      if (this.ninePhase) {
        this.updateSauronNine(map);
        return;
      }

      // Health thresholds — Phase 2 locks until the Nine are done
      var phase = 1;
      if (pct < 0.75) phase = 2;
      if (pct < 0.50 && this.nineCleared) phase = 3;
      if (pct < 0.25 && this.nineCleared) phase = 4;

      if (phase !== this.bossPhase) {
        var prev = this.bossPhase;
        this.bossPhase = phase;
        if (prev === 1 && phase >= 2 && !this.nineCleared) {
          this.startSauronNine(map);
          return;
        }
        if (prev < 3 && phase >= 3 && phase < 4) {
          this.startSauronFury(map);
        }
        if (prev < 4 && phase >= 4) {
          this.startSauronRing(map);
          return;
        }
      }

      // Phase 4: Ring objective (Sauron harasses but cannot be finished by DPS)
      if (this.ringPhase) {
        this.updateSauronRing(frame, map, player);
        return;
      }

      // Brief intro lock — still visible, limited attacks
      if (this.sauronPhase1Intro && this.sauronPhase1Intro > 0) {
        this.sauronPhase1Intro--;
        return;
      }

      // Phase 3+ arena collapse hazards
      if (this.bossPhase >= 3)
        this.updateSauronFury(frame, map, player);

      // Armor cracking flavor near end of Phase 3
      if (this.bossPhase >= 3 && pct < 0.35 && !this.armorCracked) {
        this.armorCracked = true;
        if (game.players && game.players[0] && game.players[0].say)
          game.players[0].say("His armor cracks!", 2.5 * FPS);
        map.addMultipleFx(12, this, FX.GENERATOR_DEATH, TILE * 2, FPS/3);
        if (game.viewport && game.viewport.shake)
          game.viewport.shake(1 * FPS, 5);
      }

      // --- Phase 1 attacks (intensified in Phase 3+) ---
      var t = this.type;
      var maceCd = t.maceCd || (3.5 * FPS);
      var shockCd = t.shockCd || (5 * FPS);
      var summonCd = t.summonCd || (8 * FPS);
      if (this.bossPhase >= 3) { maceCd *= 0.65; shockCd *= 0.7; summonCd *= 0.55; }

      this.maceTimer = (this.maceTimer == null) ? maceCd : this.maceTimer - 1;
      this.shockTimer = (this.shockTimer == null) ? shockCd : this.shockTimer - 1;
      this.summonTimer = (this.summonTimer == null) ? summonCd : this.summonTimer - 1;

      if (this.maceTimer <= 0) {
        this.sauronMace(map, player);
        this.maceTimer = maceCd;
      }
      if (this.shockTimer <= 0) {
        this.sauronShockwave(map, player);
        this.shockTimer = shockCd;
      }
      if (this.summonTimer <= 0) {
        this.sauronSummonLegion(map);
        this.summonTimer = summonCd;
      }
    },

    // Enter Phase 4 — The Ring must be destroyed
    startSauronRing: function(map) {
      this.ringPhase = true;
      this.invulnerable = true; // DPS no longer wins — only the Ring
      this.furyActive = true;
      map.lavaPools = map.lavaPools || [];
      map.fallingRocks = map.fallingRocks || [];

      // Place the Ring a few tiles BELOW the exit (not on top of it)
      var exit = map.findExitEntity && map.findExitEntity();
      var cx = exit ? exit.x : (map.start ? map.start.x : this.x);
      var cy = exit ? (exit.y + 4 * TILE) : (map.start ? map.start.y : this.y);
      var pos = map.findOpenSpawn(cx, cy, 0, 6);
      if (!pos || (exit && Math.abs(pos.y - exit.y) < 2 * TILE)) {
        // Prefer below exit; walk downward searching for open floor
        var tryY, found = null;
        for (tryY = 3; tryY <= 8; tryY++) {
          found = map.findOpenSpawn(cx, (exit ? exit.y : cy) + tryY * TILE, 0, 4);
          if (found) break;
        }
        pos = found || pos || { x: cx, y: cy };
      }

      map.theRing = {
        x: pos.x,
        y: pos.y,
        r: 2.5 * TILE,
        progress: 0,
        needed: 5 * FPS, // ~5s solo; scales faster with more holders
        done: false
      };

      if (game.viewport && game.viewport.shake)
        game.viewport.shake(2 * FPS, 8);
      map.addMultipleFx(16, map.theRing, FX.GENERATOR_DEATH, TILE * 2, FPS/3);

      if (game.players && game.players[0] && game.players[0].say)
        game.players[0].say("DESTROY THE RING!", 4 * FPS);
      if (game.sounds && game.sounds.speak)
        game.sounds.speak("Destroy the Ring near the exit! Hold fire on the Ring!", { rate: 0.95, pitch: 0.9 });
      try {
        if (game.help)
          game.help("<b>PHASE 4 — THE RING</b><br><br>The Ring appears <b>near the Exit</b>.<br><b>Hold FIRE</b> on it to destroy it, then <b>leave through the Exit</b>.");
      } catch (e) {}

      // Soft reset attack timers — he still harasses
      this.maceTimer = 2 * FPS;
      this.shockTimer = 3 * FPS;
      this.summonTimer = 5 * FPS;
      this.lavaTimer = 1.5 * FPS;
      this.rockTimer = 1.2 * FPS;
    },

    updateSauronRing: function(frame, map, player) {
      if (!map || !map.theRing || map.theRing.done) return;
      var ring = map.theRing;

      // Keep hazards + pressure attacks going
      this.updateSauronFury(frame, map, player);

      var t = this.type;
      var maceCd = (t.maceCd || 3.5 * FPS) * 0.75;
      var shockCd = (t.shockCd || 5 * FPS) * 0.8;
      var summonCd = (t.summonCd || 8 * FPS) * 0.9;
      this.maceTimer = (this.maceTimer == null) ? maceCd : this.maceTimer - 1;
      this.shockTimer = (this.shockTimer == null) ? shockCd : this.shockTimer - 1;
      this.summonTimer = (this.summonTimer == null) ? summonCd : this.summonTimer - 1;
      if (this.maceTimer <= 0) { this.sauronMace(map, player); this.maceTimer = maceCd; }
      if (this.shockTimer <= 0) { this.sauronShockwave(map, player); this.shockTimer = shockCd; }
      if (this.summonTimer <= 0) { this.sauronSummonLegion(map); this.summonTimer = summonCd; }

      // Ring FX pulse
      if (frame % 10 === 0)
        map.addMultipleFx(2, ring, FX.MONSTER_DEATH, TILE, FPS/6);

      // Hold FIRE while standing on the Ring to charge destruction
      var players = game.players || (player ? [player] : []);
      var holders = 0, i, p, dist;
      for (i = 0; i < players.length; i++) {
        p = players[i];
        if (!p || !p.active || !p.active()) continue;
        dist = Math.max(Math.abs(p.x - ring.x), Math.abs(p.y - ring.y));
        if (dist <= ring.r && p.firing) {
          holders++;
          // Glow while channeling
          p.healing = Math.max(p.healing || 0, 3);
        }
      }

      if (holders > 0) {
        // Solo = 1x, two players both holding = ~2.2x speed
        ring.progress += holders * (holders > 1 ? 1.1 : 1);
        if (ring.progress % Math.floor(FPS) < holders + 1 && game.players && game.players[0] && game.players[0].say) {
          var pct = Math.min(99, Math.floor(100 * ring.progress / ring.needed));
          if (pct > 0 && pct % 20 < 5)
            game.players[0].say("Ring " + pct + "%!", 1 * FPS);
        }
      } else {
        // Slow decay if nobody is holding
        ring.progress = Math.max(0, ring.progress - 0.35);
      }

      if (ring.progress >= ring.needed)
        this.destroyTheRing(map);
    },

    destroyTheRing: function(map) {
      if (!map.theRing || map.theRing.done) return;
      map.theRing.done = true;
      this.ringPhase = false;
      this.invulnerable = false;

      // Massive explosion
      if (game.viewport && game.viewport.shake)
        game.viewport.shake(11 * FPS, 12);
      map.addMultipleFx(30, map.theRing, FX.GENERATOR_DEATH, TILE * 4, FPS/2);
      map.addMultipleFx(20, this, FX.GENERATOR_DEATH, TILE * 3, FPS/2);
      map.lavaPools = [];
      map.fallingRocks = [];
      map.hazard = null;

      if (game.players && game.players[0] && game.players[0].say)
        game.players[0].say("The Ring is destroyed!", 5 * FPS);
      if (game.sounds && game.sounds.speak)
        game.sounds.speak("The Ring is destroyed! Now reach the exit!", { rate: 0.9, pitch: 0.85 });
      try {
        if (game.help)
          game.help("<b>THE RING IS DESTROYED</b><br><br>Sauron falls.<br><b>Go through the Exit</b> to claim victory.");
      } catch (e) {}

      // Kill Sauron → celebration; credits wait until players take the Exit
      this.health = 0;
      this.die(game.players && game.players[0] ? game.players[0] : null, true);
    },

    // Enter Phase 3 — Sauron's Fury
    startSauronFury: function(map) {
      this.furyActive = true;
      this.armorCracked = false;
      this.lavaTimer = 1 * FPS;
      this.rockTimer = 2 * FPS;
      map.lavaPools = map.lavaPools || [];
      map.fallingRocks = map.fallingRocks || [];
      // Permanent fear + collapsing arena
      map.hazard = 'fear';

      if (game.viewport && game.viewport.shake)
        game.viewport.shake(3 * FPS, 10);
      map.addMultipleFx(18, this, FX.GENERATOR_DEATH, TILE * 3, FPS/2);

      if (game.players && game.players[0] && game.players[0].say)
        game.players[0].say("Sauron's Fury!", 3 * FPS);
      if (game.sounds && game.sounds.speak)
        game.sounds.speak("The arena collapses. Sauron's fury!", { rate: 0.9, pitch: 0.6 });
      try {
        if (game.help)
          game.help("<b>PHASE 3 — SAURON'S FURY</b><br><br>He is faster. The arena collapses.<br><b>Lava</b> and <b>falling rocks</b> — keep moving!<br>Gimli cracks armor. Legolas kites. Gandalf clears the Legion.");
      } catch (e) {}

      // Seed a few lava pools immediately
      this.spawnLavaPool(map);
      this.spawnLavaPool(map);
    },

    updateSauronFury: function(frame, map, player) {
      if (!map) return;
      this.lavaTimer = (this.lavaTimer == null) ? (2.5 * FPS) : this.lavaTimer - 1;
      this.rockTimer = (this.rockTimer == null) ? (1.8 * FPS) : this.rockTimer - 1;

      if (this.lavaTimer <= 0) {
        this.spawnLavaPool(map);
        this.lavaTimer = 2.2 * FPS;
      }
      if (this.rockTimer <= 0) {
        this.spawnFallingRock(map, player);
        this.rockTimer = 1.5 * FPS;
      }

      // Tick lava pools — damage standing players, expire old ones
      map.lavaPools = map.lavaPools || [];
      var i, pool, p, dist, players = game.players || (player ? [player] : []);
      for (i = map.lavaPools.length - 1; i >= 0; i--) {
        pool = map.lavaPools[i];
        pool.ttl--;
        if (pool.ttl <= 0) {
          map.lavaPools.splice(i, 1);
          continue;
        }
        // Visual pulse
        if (pool.ttl % 8 === 0)
          map.addMultipleFx(2, { x: pool.x, y: pool.y }, FX.MONSTER_DEATH, TILE, FPS/6);
        for (var j = 0; j < players.length; j++) {
          p = players[j];
          if (!p || !p.active || !p.active()) continue;
          dist = Math.max(Math.abs(p.x - pool.x), Math.abs(p.y - pool.y));
          if (dist <= pool.r && (frame % (FPS / 3) === 0))
            p.hurt(6, this, false);
        }
      }

      // Falling rocks — brief warning then impact damage
      map.fallingRocks = map.fallingRocks || [];
      for (i = map.fallingRocks.length - 1; i >= 0; i--) {
        var rock = map.fallingRocks[i];
        rock.ttl--;
        if (rock.ttl === rock.warn) {
          map.addMultipleFx(4, { x: rock.x, y: rock.y }, FX.GENERATOR_DEATH, TILE, FPS/5);
        }
        if (rock.ttl <= 0) {
          map.addMultipleFx(6, { x: rock.x, y: rock.y }, FX.GENERATOR_DEATH, TILE * 1.5, FPS/4);
          if (game.viewport && game.viewport.shake)
            game.viewport.shake(0.25 * FPS, 3);
          for (j = 0; j < players.length; j++) {
            p = players[j];
            if (!p || !p.active || !p.active()) continue;
            dist = Math.max(Math.abs(p.x - rock.x), Math.abs(p.y - rock.y));
            if (dist <= rock.r)
              p.hurt(14, this, false);
          }
          map.fallingRocks.splice(i, 1);
        }
      }
    },

    spawnLavaPool: function(map) {
      map.lavaPools = map.lavaPools || [];
      if (map.lavaPools.length >= 6) {
        map.lavaPools.shift(); // cap
      }
      var cx = this.x, cy = this.y;
      if (game.players && game.players[0] && !game.players[0].dead) {
        // Bias toward player path so you must move
        if (Math.random() < 0.55) {
          cx = game.players[0].x;
          cy = game.players[0].y;
        }
      }
      var pos = map.findOpenSpawn(cx, cy, 1, 8);
      if (!pos) return;
      map.lavaPools.push({
        x: pos.x,
        y: pos.y,
        r: 2.2 * TILE,
        ttl: 6 * FPS
      });
      map.addMultipleFx(5, pos, FX.MONSTER_DEATH, TILE, FPS/4);
    },

    spawnFallingRock: function(map, player) {
      map.fallingRocks = map.fallingRocks || [];
      if (map.fallingRocks.length >= 5) map.fallingRocks.shift();
      var cx = this.x, cy = this.y;
      var players = game.players || (player ? [player] : []);
      var target = null;
      for (var i = 0; i < players.length; i++) {
        if (players[i] && players[i].active && players[i].active()) {
          target = players[i];
          break;
        }
      }
      if (target && Math.random() < 0.7) {
        cx = target.x;
        cy = target.y;
      }
      var pos = map.findOpenSpawn(cx, cy, 0, 4);
      if (!pos) pos = { x: cx, y: cy };
      map.fallingRocks.push({
        x: pos.x,
        y: pos.y,
        r: 1.6 * TILE,
        ttl: 1.1 * FPS,
        warn: Math.floor(0.55 * FPS)
      });
    },

    // Enter Phase 2 — spawn The Nine, Sauron invulnerable
    startSauronNine: function(map) {
      this.ninePhase = true;
      this.nineCleared = false;
      this.invulnerable = true;
      this.maceTimer = 9999;
      this.shockTimer = 9999;
      this.summonTimer = 9999;

      if (game.viewport && game.viewport.shake)
        game.viewport.shake(2.5 * FPS, 9);

      var line = 'The Nine have come!';
      if (game.players && game.players[0] && game.players[0].say)
        game.players[0].say(line, 3.5 * FPS);
      if (game.sounds && game.sounds.speak)
        game.sounds.speak('The Nine have come. Defeat them!', { rate: 0.85, pitch: 0.55 });
      try {
        if (game.help)
          game.help("<b>PHASE 2 — THE NINE</b><br><br>Sauron is invulnerable.<br>Defeat all <b>nine Nazgûl</b> before you can harm him again!");
      } catch (e) {}

      // Clear small trash so the Nine read clearly
      var n, e;
      for (n = 0; n < map.entities.length; n++) {
        e = map.entities[n];
        if (e && e.active && e.monster && !e.type.boss && !e.type.isNine && e !== this) {
          // leave them — denser fight is fine; optional soft clear of ghosts only
        }
      }

      // Spawn nine Nazgûl near the players so they immediately engage (not off-screen)
      var i, mpos, minion, pattern, ax, ay;
      ax = (game.players && game.players[0] && !game.players[0].dead) ? game.players[0].x : this.x;
      ay = (game.players && game.players[0] && !game.players[0].dead) ? game.players[0].y : this.y;
      for (i = 0; i < 9; i++) {
        mpos = map.findOpenSpawn(ax, ay, 2, 9);
        if (!mpos) mpos = map.findOpenSpawn(this.x, this.y, 2, 10);
        if (!mpos) continue;
        minion = map.addMonster(mpos.x, mpos.y, MONSTER.THE_NINE);
        if (!minion) continue;
        minion.isNine = true;
        // Two patterns: fast chasers vs heavy hitters — set on instance, keep type intact
        pattern = i % 2;
        if (pattern === 0) {
          minion.health = 18;
          minion.type = Object.assign({}, minion.type, {
            speed: 200 / FPS, damage: 70 / FPS, health: 18,
            travelling: 0.2 * FPS, thinking: 0.15 * FPS
          });
        } else {
          minion.health = 26;
          minion.type = Object.assign({}, minion.type, {
            speed: 145 / FPS, damage: 100 / FPS, health: 26,
            travelling: 0.3 * FPS, thinking: 0.2 * FPS
          });
        }
        // Force them to act immediately
        minion.thinking = 0;
        minion.travelling = 0;
        minion.stunned = 0;
        map.addMultipleFx(3, minion, FX.GENERATOR_DEATH, TILE, FPS/5);
      }
      map.addMultipleFx(14, this, FX.GENERATOR_DEATH, TILE * 3, FPS/3);
    },

    // Each frame during Phase 2: wait until all Nine are dead
    updateSauronNine: function(map) {
      var n, e, alive = 0;
      for (n = 0; n < map.entities.length; n++) {
        e = map.entities[n];
        if (e && e.active && e.monster && (e.isNine || (e.type && e.type.isNine)))
          alive++;
      }
      // Occasional taunt
      if (alive > 0 && (alive !== this._nineLastCount) && alive <= 3) {
        this._nineLastCount = alive;
        if (game.players && game.players[0] && game.players[0].say)
          game.players[0].say(alive + ' Nazgûl remain!', 1.5 * FPS);
      }
      this._nineLastCount = alive;

      if (alive > 0) return;

      // All Nine fallen — break invulnerability
      this.endSauronNine(map);
    },

    endSauronNine: function(map) {
      this.ninePhase = false;
      this.nineCleared = true;
      this.invulnerable = false;
      this.bossPhase = Math.max(this.bossPhase, 2);
      // Resume attacks quickly
      this.maceTimer = 1.5 * FPS;
      this.shockTimer = 2.5 * FPS;
      this.summonTimer = 3 * FPS;

      if (game.viewport && game.viewport.shake)
        game.viewport.shake(2.5 * FPS, 10);
      map.addMultipleFx(24, this, FX.GENERATOR_DEATH, TILE * 3, FPS/2);
      map.addMultipleFx(12, this, FX.MONSTER_DEATH, TILE * 2, FPS/3);

      var line = 'ENOUGH!';
      if (game.players && game.players[0] && game.players[0].say)
        game.players[0].say(line, 3 * FPS);
      if (game.sounds && game.sounds.speak)
        game.sounds.speak('Enough!', { rate: 0.7, pitch: 0.5 });
      try {
        if (game.help)
          game.help("<b>THE NINE HAVE FALLEN</b><br><br>Sauron is vulnerable again!<br>Press the attack!");
      } catch (e) {}
    },

    // Mace of Doom — wide arc damage near Sauron (must dodge / keep distance)
    sauronMace: function(map, player) {
      var radius = this.type.maceRadius || (5 * TILE);
      var dmg = this.type.maceDamage || 18;
      map.addMultipleFx(10, this, FX.GENERATOR_DEATH, TILE * 2, FPS/4);
      if (game.viewport && game.viewport.shake)
        game.viewport.shake(0.4 * FPS, 5);

      var players = game.players || (player ? [player] : []);
      var i, p, dist;
      for (i = 0; i < players.length; i++) {
        p = players[i];
        if (!p || !p.active || !p.active()) continue;
        dist = Math.max(Math.abs(p.x - this.x), Math.abs(p.y - this.y));
        if (dist <= radius) {
          p.hurt(dmg, this, false);
          if (p.say && Math.random() < 0.4) p.say('Mace!', 1 * FPS);
        }
      }
      if (game.players && game.players[0] && game.players[0].say && Math.random() < 0.35)
        game.players[0].say("Mace of Doom!", 1.5 * FPS);
    },

    // Dark Shockwave — arena pulse; Legolas speed helps
    sauronShockwave: function(map, player) {
      var radius = this.type.shockRadius || (9 * TILE);
      var dmg = this.type.shockDamage || 12;
      map.addMultipleFx(16, this, FX.GENERATOR_DEATH, TILE * 3, FPS/3);
      if (game.viewport && game.viewport.shake)
        game.viewport.shake(0.6 * FPS, 7);

      var players = game.players || (player ? [player] : []);
      var i, p, dist, falloff;
      for (i = 0; i < players.length; i++) {
        p = players[i];
        if (!p || !p.active || !p.active()) continue;
        dist = Math.max(Math.abs(p.x - this.x), Math.abs(p.y - this.y));
        if (dist <= radius) {
          falloff = 1 - (dist / (radius || 1)) * 0.5; // outer edge still hurts
          p.hurt(Math.max(4, dmg * falloff), this, false);
        }
      }
      if (game.players && game.players[0] && game.players[0].say)
        game.players[0].say("Dark Shockwave!", 1.5 * FPS);
    },

    // Summon the Legion — full Gauntlet wave (orcs / demons / death)
    sauronSummonLegion: function(map) {
      var count = this.type.summonCount || 6;
      if (this.bossPhase >= 2) count += 2;
      if (this.bossPhase >= 3) count += 2;
      var types = [MONSTER.GRUNT, MONSTER.DEMON, MONSTER.GHOST, MONSTER.DEATH, MONSTER.WIZARD];
      var i, mpos, mtype, n;
      for (i = 0; i < count; i++) {
        mpos = map.findOpenSpawn(this.x, this.y, 2, 10);
        if (!mpos) continue;
        n = Game.Math.randomInt(0, types.length - 1);
        // Bias toward tougher types in later brackets
        if (this.bossPhase >= 3 && Math.random() < 0.35) n = types.length - 1;
        mtype = types[n];
        map.addMonster(mpos.x, mpos.y, mtype);
      }
      map.addMultipleFx(8, this, FX.GENERATOR_DEATH, TILE * 2, FPS/4);
      if (game.players && game.players[0] && game.players[0].say)
        game.players[0].say("Sauron summons the Legion!", 2 * FPS);
      if (game.sounds && game.sounds.speak && Math.random() < 0.5)
        game.sounds.speak("Summon the legion", { rate: 0.85, pitch: 0.6 });
    },

    step: function(map, player, dir, speed, travelling, allowfire) {
      var collision = map.trymove(this, dir, speed);
      if (!collision) {
        this.dir = dir;
        if (allowfire && this.type.weapon && this.fire(map, player)) {
          this.thinking   = this.type.thinking;
          this.travelling = 0;
        }
        else {
          this.thinking   = 0;
          this.travelling = travelling;
        }
        return true;
      }
      else if (collision.player) {
        publish(EVENT.MONSTER_COLLIDE, this, collision);
        return true;
      }

      // if we couldn't move in that direction at full speed, try a baby step before giving up
      if (speed > 1)
        return this.step(map, player, dir, 1, travelling, allowfire);

      this.thinking   = this.type.thinking;
      this.travelling = 0;
      return false;
    },

    fire: function(map, player) {
      var dx, dy, dd;
      if (this.type.weapon) {
        if (!this.reloading) {
          dx = Math.abs(p2t(this.x) - p2t(player.x));
          dy = Math.abs(p2t(this.y) - p2t(player.y));
          dd = Math.abs(dx-dy);
          if (((dx < 2) && isVertical(this.dir))   ||
              ((dy < 2) && isHorizontal(this.dir)) ||
              ((dd < 2) && isDiagonal(this.dir))) {
            this.reloading = this.type.weapon.reload;
            publish(EVENT.MONSTER_FIRE, this);
            return true;
          }
        }
      }
      return false;
    },

    hurt: function(damage, by, nuke) {
      // Sauron Phase 2: immune until The Nine fall
      if (this.invulnerable) return;
      if ((by.weapon && this.type.canbeshot) || (by.player && this.type.canbehit) || (by == this) || nuke) {
        this.health = Math.max(0, this.health - damage);
        if (this.health === 0)
          this.die(by.player ? by : by.weapon && by.type.player ? by.owner : null, nuke);
      }
    },

    die: function(by, nuke) {
      if (this.generator)
        this.generator.remove(this);
      publish(EVENT.MONSTER_DEATH, this, by, nuke);
    },

    directionTo: function(target, away) {

      var up    = target.y < this.y - this.type.speed,
          down  = target.y > this.y + this.type.speed,
          left  = target.x < this.x - this.type.speed,
          right = target.x > this.x + this.type.speed;

      if (up && left)
        return away ? DIR.DOWNRIGHT : DIR.UPLEFT;
      else if (up && right)
        return away ? DIR.DOWNLEFT : DIR.UPRIGHT;
      else if (down && left)
        return away ? DIR.UPRIGHT : DIR.DOWNLEFT;
      else if (down && right)
        return away ? DIR.UPLEFT : DIR.DOWNRIGHT;
      else if (up)
        return away ? DIR.DOWN : DIR.UP;
      else if (down)
        return away ? DIR.UP : DIR.DOWN;
      else if (left)
        return away ? DIR.RIGHT : DIR.LEFT;
      else if (right)
        return away ? DIR.LEFT : DIR.RIGHT;
      else
        return this.dir;
    },

    onrender: function(frame) {
      // Bosses never go invisible (flicker felt like a glitch when hit)
      if (this.type && this.type.boss) {
        this.frame = this.dir + (8 * animate(frame + this.df, this.type.fpf, this.type.frames));
        return;
      }
      if (this.type.invisibility && ((frame+this.df)%(this.type.invisibility.on + this.type.invisibility.off) < this.type.invisibility.on))
        return false;

      this.frame = this.dir + (8 * animate(frame + this.df, this.type.fpf, this.type.frames));
    }

  });

  //===========================================================================
  // GENERATORS
  //===========================================================================

  var Generator = Class.create({

    initialize: function(mtype) {
      this.mtype   = mtype;
      this.type    = mtype.generator;
      this.health  = this.type.health;
      this.pending = 0;
      this.count   = 0;
    },

    generator: true,
    cbox:      CBOX.FULL,

    update: function(frame, player, map, viewport) {
      var pos;
      // Hold waves while waiting for the boss reveal on finale stages
      if (map && map.generatorsPaused) return;
      if ((this.count < this.type.max) && (--this.pending <= 0)) {
        pos = map.canmove(this, Game.Math.randomInt(0,7), TILE);
        if (pos) {
          map.addMonster(pos.x, pos.y, this.mtype, this);
          this.count++;
          this.pending = Game.Math.randomInt(1, this.type.speed);
        }
      }
    },

    hurt: function(damage, by) {
      this.health = Math.max(0, this.health - damage);
      if (this.health === 0)
        this.die(by.player ? by : by.weapon && by.type.player ? by.owner : null);
    },

    die: function(by) {
      publish(EVENT.GENERATOR_DEATH, this, by);
    },

    remove: function(monster) {
      this.count--;
    },

    onrender: function(frame) {
      this.frame = (2 - Math.floor(3 * (this.health / (this.type.health + 1))));
    }

  });

  //===========================================================================
  // WEAPONS
  //===========================================================================

  var Weapon = Class.create({

    initialize: function(type, dir, owner) {
      this.type  = type;
      this.dir   = dir;
      this.owner = owner;
    },

    weapon:   true,
    temporal: true,
    cbox:     CBOX.WEAPON,

    update: function(frame, player, map, viewport) {
      var collision = map.trymove(this, this.dir, this.type.speed, this.owner);
      if (collision) {
        this.owner.reloading = countdown(this.owner.reloading, this.type.reload/2); // speed up reloading process if previous weapon hit something, makes player feel powerful
        publish(EVENT.WEAPON_COLLIDE, this, collision);
      }
    },

    onrender: function(frame) {
      this.frame = this.type.rotate ? animate(frame, this.type.fpf, 8) : this.dir;
    }

  });

  //===========================================================================
  // TREASURE
  //===========================================================================

  var Treasure = Class.create({

    initialize: function(type) {
      this.type = type;
    },

    treasure: true,
    cbox: CBOX.FULL,

    onrender: function(frame) {
      this.frame = animate(frame, this.type.fpf, this.type.frames);
    }

  });

  //===========================================================================
  // DOOR
  //===========================================================================

  var Door = Class.create({

    initialize: function(type) {
      this.type =  type;
      this.dx   = -type.dx;
      this.dy   = -type.dy;
      this.dw   =  type.dx*3;
      this.dh   =  type.dy;
    },

    door:  true,
    cbox:  CBOX.FULL,

    update: function(frame, player, map, viewport) {
      if (this.opening && (--this.opening === 0)) {
        publish(EVENT.DOOR_OPEN, this);
      }
    },

    open: function(speed) {
      if (!this.opening) {
        this.opening = (speed || 0) + this.type.speed;
        publish(EVENT.DOOR_OPENING, this, this.opening);
        return true;
      }
    }

  });

  //===========================================================================
  // EXIT
  //===========================================================================

  var Exit = Class.create({

    initialize: function(type) {
      this.type = type;
    },

    exit: true,
    cbox: CBOX.FULL

  });

  //===========================================================================
  // FX
  //===========================================================================

  var Fx = Class.create({

    initialize: function(type, delay) {
      this.type  = type;
      this.start = null;
      this.delay = delay || 0;
    },

    fx:       true,
    temporal: true,

    update: function(frame, player, map, viewport) {
      if (this.delay && --this.delay)
        return;
      this.start = this.start || frame; 
      this.frame = animate(frame - this.start, this.type.fpf, this.type.frames + 1);
      if (this.frame === this.type.frames)
        publish(EVENT.FX_FINISHED, this);
    },

    onrender: function(frame) {
      if (this.delay)
        return false;
    }

  });

  //===========================================================================
  // THE PLAYER
  //===========================================================================

  var Player = Class.create({

    initialize: function() {
      subscribe(EVENT.START_LEVEL, this.onStartLevel.bind(this));

      this.canvas = Game.createCanvas(STILE + 2*FX.PLAYER_GLOW.border, STILE + 2*FX.PLAYER_GLOW.border);
      this.ctx    = this.canvas.getContext('2d');
      this.cells  = []; // entities track which cells they currently occupy
    },

    player: true,
    cbox:   CBOX.PLAYER,

    active: function() { return !this.dead && !this.exiting; },

    join: function(type) {
      this.type      = type;
      this.dead      = false;
      this.exiting   = false;
      this.firing    = false;
      this.moving    = {};
      this.reloading = 0;
      this.hurting   = 0;
      this.healing   = 0;
      this.keys      = DEBUG.KEYS    || 0;
      this.potions   = DEBUG.POTIONS || 0;
      this.score     = 0;
      this.dir       = Game.Math.randomInt(0, 7);
      this.health    = type.health;
      // Special attack charge state
      this.chargeTime      = 0;
      this.specialCooldown  = 0;
      this.speedBoost      = 1;
      this.speedBoostTime  = 0;
      this.arrowStorm      = 0;
      this.chargingSpecial = false;
      // Combat feel
      this.comboCount      = 0;
      this.comboTimer      = 0;
      this.weaponDamageMul = 1;
      this.weaponDamageTime = 0;
      // Buffs
      this.mithril         = 0;  // invulnerability frames
      this.weakAnnounced   = false;
      this.bubble          = null; // { text, ttl }
      publish(EVENT.PLAYER_JOIN, this);
    },

    // Comic-style speech bubble over the hero
    say: function(text, duration) {
      if (!text) return;
      this.bubble = { text: String(text), ttl: duration || (2.5 * FPS) };
    },

    leave: function() {
      publish(EVENT.PLAYER_LEAVE, this);
    },

    onStartLevel: function(map) {
      // Offset second player so they don't stack on top of player 1
      var ox = 0, oy = 0;
      if (game.players && game.players[1] === this) {
        ox = TILE;
        if (map.start.x + ox > map.w - TILE) ox = -TILE;
      }
      map.occupy(map.start.x + ox, map.start.y + oy, this);
      // Keys persist across stages — only seed from DEBUG on a brand-new join
      if (this.keys == null)
        this.keys = DEBUG.KEYS || 0;
      this.dead    = false;
      this.exiting = false;
      // Clear stuck input from death / Continue (held FIRE blocks movement)
      this.firing = false;
      this.chargingSpecial = false;
      this.chargeTime = 0;
      this.moving = {};
      this.dir = DIR.UP;
      this.specialCooldown = 0;
    },

    update: function(frame, player, map, viewport) {

      if (this.dead) {
        // Decay revive progress if nobody is holding fire on us
        if (this.reviveProgress > 0)
          this.reviveProgress = Math.max(0, this.reviveProgress - 0.5);
        return;
      }

      if (this.exiting) {
        if (--this.exiting.count === 0)
          publish(EVENT.PLAYER_EXIT, this);
        return;
      }

      this.autohurt(frame);

      this.hurting   = countdown(this.hurting);
      this.healing   = countdown(this.healing);
      this.reloading = countdown(this.reloading);
      this.specialCooldown = countdown(this.specialCooldown);
      this.speedBoostTime = countdown(this.speedBoostTime);
      if (!this.speedBoostTime) this.speedBoost = 1;
      this.weaponDamageTime = countdown(this.weaponDamageTime);
      if (!this.weaponDamageTime) this.weaponDamageMul = 1;
      this.mithril = countdown(this.mithril);
      this.comboTimer = countdown(this.comboTimer);
      if (!this.comboTimer) this.comboCount = 0;
      if (this.bubble) {
        this.bubble.ttl = countdown(this.bubble.ttl);
        if (!this.bubble.ttl) this.bubble = null;
      }

      // Lingering Arrow Storm rain
      if (this.arrowStorm > 0) {
        this.arrowStorm = countdown(this.arrowStorm);
        if ((frame % 8) === 0 && map) {
          var n, max, entity;
          for (n = 0, max = map.entities.length; n < max; n++) {
            entity = map.entities[n];
            if (entity && entity.active && entity.monster && viewport && !viewport.outside(entity.x, entity.y, TILE, TILE))
              entity.hurt(1.5, this, true);
          }
        }
      }

      // Special charge while holding fire
      if (this.firing && this.type.special && !this.specialCooldown) {
        this.chargeTime++;
        this.chargingSpecial = this.chargeTime > FPS * 0.35; // after ~0.35s, consider it a charge (suppress normal fire)
        if (this.chargeTime >= this.type.special.charge) {
          // Fire special!
          this.chargeTime = 0;
          this.chargingSpecial = false;
          this.specialCooldown = this.type.special.cooldown;
          this.firing = false; // release charge
          publish(EVENT.PLAYER_SPECIAL, this);
          return;
        }
      } else if (!this.firing) {
        this.chargeTime = 0;
        this.chargingSpecial = false;
      }

      if (this.firing && !this.chargingSpecial) {
        // Try to revive a fallen teammate underfoot (hold fire ~2s)
        var revived = false;
        if (game.players && game.players.length > 1) {
          var ti, mate;
          for (ti = 0; ti < game.players.length; ti++) {
            mate = game.players[ti];
            if (mate && mate !== this && mate.dead) {
              var mdx = Math.abs(mate.x - this.x), mdy = Math.abs(mate.y - this.y);
              if (mdx < TILE * 1.25 && mdy < TILE * 1.25) {
                if (mate.revive(1))
                  revived = true;
                // While reviving, suppress normal fire
                if (!this.type.fireWhileMoving)
                  return;
                revived = true; // still holding revive even if not finished
                break;
              }
            }
          }
        }
        if (!revived && !this.reloading) {
          this.reloading = this.type.weapon.reload;
          // Aragorn 3-hit combo
          if (this.type.combo) {
            this.comboCount = (this.comboCount % 3) + 1;
            this.comboTimer = FPS * 0.8;
            this.weaponDamageMul = (this.comboCount === 3) ? 2.2 : 1;
            this.weaponDamageTime = this.type.weapon.reload + 2;
          }
          publish(EVENT.PLAYER_FIRE, this);
        }
        // Legolas can fire while moving; others plant feet
        if (!this.type.fireWhileMoving)
          return;
      }

      // While charging special, movement is allowed (reposition then unleash)

      if (is.invalid(this.moving.dir))
        return;

      var d, dmax, dir, collision,
          moveSpeed = this.type.speed * (this.speedBoost || 1),
          directions = SLIDE_DIRECTIONS[this.moving.dir];

      for(d = 0, dmax = directions.length ; d < dmax ; d++) {
        dir = directions[d];
        collision = map.trymove(this, dir, moveSpeed);
        if (collision)
          publish(EVENT.PLAYER_COLLIDE, this, collision); // if we collided with something, publish event and then try next available direction...
        else
          return; // ... otherwise we moved, so we're done trying
      }

    },

    collect: function(treasure) {
      this.addscore(treasure.type.score);
      if (treasure.type.potion)
        this.potions++;
      else if (treasure.type.key)
        this.keys++;
      else if (treasure.type.health) {
        this.heal(treasure.type.health);
        // Lembas / roast meat restores "weak" state tracking
        if (this.health >= 100) this.weakAnnounced = false;
      }
      else if (treasure.type.damage)
        this.hurt(treasure.type.damage);

      // LOTR power-up buffs
      if (treasure.type.leembas || treasure.type.label === 'Lembas') {
        this.heal(20); // extra nibble
        if (this.health >= 100) this.weakAnnounced = false;
      }
      // Potatoes — Gollum-adjacent classic
      if (treasure.type.potato) {
        this._pickupPhrase = "What's taters, precious?";
        this.say("What's taters, precious?", 3 * FPS);
      }
      // Rare Mithril from gold
      if (treasure.type.mithrilChance && Math.random() < treasure.type.mithrilChance) {
        this.mithril = 5 * FPS;
        this.healing = FX.PLAYER_GLOW.frames;
        this._pickupPhrase = "Mithril!";
      }
      // Character-flavored temporary power from big health pickups
      if (treasure.type.health && treasure.type.health >= 50 && Math.random() < 0.35) {
        if (this.type.name === 'aragorn') {
          this.weaponDamageMul = 2;
          this.weaponDamageTime = 6 * FPS;
          this._pickupPhrase = "Anduril!";
        } else if (this.type.name === 'legolas') {
          this.weaponDamageMul = 1.75;
          this.weaponDamageTime = 6 * FPS;
          this._pickupPhrase = "Elven arrows!";
        } else if (this.type.name === 'gandalf') {
          this.weaponDamageMul = 1.75;
          this.weaponDamageTime = 6 * FPS;
          this._pickupPhrase = "Wizard's fire!";
        } else if (this.type.name === 'gimli') {
          this.weaponDamageMul = 1.75;
          this.weaponDamageTime = 6 * FPS;
          this.mithril = Math.max(this.mithril, 2 * FPS);
          this._pickupPhrase = "Dwarven fury!";
        }
      }
      publish(EVENT.TREASURE_COLLECTED, treasure, this);
    },

    exit: function(exit) {
      // Grace period after level load / Continue — avoid spawn-on-exit runaway
      if (game && game._exitGraceUntil && Date.now() < game._exitGraceUntil)
        return;
      if (game && game._levelTransitioning)
        return;
      // Don't let a special's burst of movement/FX accidentally count as an exit
      if (this.chargingSpecial || (this.specialCooldown && this.specialCooldown > (this.type.special ? this.type.special.cooldown - 0.4 * FPS : 0)))
        return;
      // Boss stages: cannot leave until the boss is defeated
      if (game && game.map && game.map.level && game.map.level.boss && !game.map.bossDefeated) {
        if (!this._bossBlockSaid) {
          this._bossBlockSaid = true;
          this.say("Defeat the boss first!", 2 * FPS);
          var self = this;
          setTimeout(function() { self._bossBlockSaid = false; }, 2500);
        }
        return;
      }
      if (!this.exiting && !this.dead) {
        this.health  = this.health + (this.health < this.type.health ? 100 : 0);
        this.exiting = { max: exit.type.speed, count: exit.type.speed, fpf: exit.type.fpf, dx: (exit.x - this.x), dy: (exit.y - this.y) };
        publish(EVENT.PLAYER_EXITING, this, exit);
      }
    },

    fire:      function(on) { this.firing       = on;                 },
    moveUp:    function(on) { this.moving.up    = on;  this.setDir(); },
    moveDown:  function(on) { this.moving.down  = on;  this.setDir(); },
    moveLeft:  function(on) { this.moving.left  = on;  this.setDir(); },
    moveRight: function(on) { this.moving.right = on;  this.setDir(); },

    setDir: function() {
      if (this.moving.up && this.moving.left)
        this.dir = this.moving.dir = DIR.UPLEFT;
      else if (this.moving.up && this.moving.right)
        this.dir = this.moving.dir = DIR.UPRIGHT;
      else if (this.moving.down && this.moving.left)
        this.dir = this.moving.dir = DIR.DOWNLEFT;
      else if (this.moving.down && this.moving.right)
        this.dir = this.moving.dir = DIR.DOWNRIGHT;
      else if (this.moving.up)
        this.dir = this.moving.dir = DIR.UP;
      else if (this.moving.down)
        this.dir = this.moving.dir = DIR.DOWN;
      else if (this.moving.left)
        this.dir = this.moving.dir = DIR.LEFT;
      else if (this.moving.right)
        this.dir = this.moving.dir = DIR.RIGHT;
      else
        this.moving.dir = null; // no moving.dir, but still facing this.dir
    },

    addscore: function(n) { this.score = this.score + (n||0); },

    heal: function(health) {
      this.health  = this.health + health;
      this.healing = FX.PLAYER_GLOW.frames;
      if (this.health >= 100) this.weakAnnounced = false;
      publish(EVENT.PLAYER_HEAL, this, health);
    },

    hurt: function(damage, by, automatic) {
      if (this.active() && !DEBUG.NODAMAGE) {
        // Mithril = temporary invulnerability (not vs autohurt drain)
        if (!automatic && this.mithril > 0)
          return;
        // Elven Grace: chance to dodge non-automatic hits (especially projectiles)
        if (!automatic && this.type.dodgeChance && Math.random() < this.type.dodgeChance) {
          this.healing = Math.max(this.healing, 4); // brief flash as "dodge"
          return;
        }
        damage = automatic ? damage : damage / this.type.armor;
        // Dwarven Resolve: take less damage while attacking / charging
        if (!automatic && this.type.resolve && (this.firing || this.chargingSpecial))
          damage = damage * 0.55;
        this.health = Math.max(0, this.health - damage);
        if (!automatic) {
          this.hurting = FX.PLAYER_GLOW.frames;
          publish(EVENT.PLAYER_HURT, this, damage);
        }
        // Character-specific "needs food badly" when first becoming weak
        if (!this.weakAnnounced && this.weak()) {
          this.weakAnnounced = true;
          publish(EVENT.PLAYER_WEAK, this);
        }
        if (this.health === 0)
          this.die();
      }
    },

    autohurt: function(frame) {
      if (DEBUG.NOAUTOHURT || this._noAutohurt) return;
      var map = game && game.map;
      // After Sauron falls, energy no longer drains at all
      if (map && map.bossDefeated && map.level && map.level.boss === 'sauron') return;
      // Below 100 energy, time alone no longer drains you (potions matter more)
      if (this.health > 100) {
        if ((frame % (FPS/2)) === 0)
          this.hurt(1, this, true);
        // Escort missions: Frodo/Sam urgency — slightly faster drain
        if (map && map.escort && (frame % FPS) === 0)
          this.hurt(1, this, true);
      }
      // Environmental hazards still hurt regardless of energy floor
      if (map && map.hazard) {
        if (map.hazard === 'fear' && (frame % FPS) === 0)
          this.hurt(1, this, true);
        if (map.hazard === 'marsh' && is.invalid(this.moving.dir) && (frame % (FPS/2)) === 0)
          this.hurt(2, this, true); // standing still in the Dead Marshes is deadly
        if (map.hazard === 'flood' && (frame % FPS) === 0)
          this.hurt(1, this, true);
        if (map.hazard === 'bridge' && (frame % FPS) === 0)
          this.hurt(1, this, true);
      }
    },

    weak: function() {
      return this.health < 100;
    },

    die: function() {
      this.dead = true;
      this.firing = false;
      this.chargingSpecial = false;
      this.chargeTime = 0;
      this.reviveProgress = 0;
      publish(EVENT.PLAYER_DEATH, this);
    },

    // Revive a fallen player (called by teammate)
    revive: function(amount) {
      if (!this.dead) return false;
      this.reviveProgress = (this.reviveProgress || 0) + (amount || 1);
      if (this.reviveProgress >= 2 * FPS) { // ~2 seconds of hold
        this.dead = false;
        this.health = Math.max(150, Math.floor(this.type.health * 0.4));
        this.weakAnnounced = this.health < 100;
        this.hurting = 0;
        this.healing = FX.PLAYER_GLOW.frames;
        this.reviveProgress = 0;
        this.exiting = false;
        publish(EVENT.PLAYER_REVIVE, this);
        return true;
      }
      return false;
    },

    nuke: function() {
      // Potion = heal +200 energy (same button as before)
      if (this.potions && !this.dead) {
        this.potions--;
        publish(EVENT.PLAYER_NUKE, this);
      }
    },

    onrender: function(frame) {
      if (this.dead)
        this.frame = 32;
      else if (this.exiting)
        this.frame = this.type.sx + animate(this.exiting.count, this.exiting.fpf, 8);
      else if (is.valid(this.moving.dir) || this.firing || this.chargingSpecial)
        this.frame = this.type.sx + this.dir + (8 * animate(frame, this.type.fpf, this.type.frames));
      else
        this.frame = this.type.sx + this.dir;

      // Glow while charging special
      if (this.chargingSpecial && !this.healing)
        this.healing = Math.max(this.healing, 2);
    }

  });

  //===========================================================================
  // THE SCOREBOARD
  //===========================================================================

  var Scoreboard = Class.create({

    active: "active",

    initialize: function(level, score, who) {

      subscribe(EVENT.PLAYER_JOIN,  this.onPlayerJoin.bind(this));
      subscribe(EVENT.PLAYER_LEAVE, this.onPlayerLeave.bind(this));
      subscribe(EVENT.START_LEVEL,  this.onStartLevel.bind(this));

      this.dom      = $('scoreboard');
      this.level    = this.dom.down('.level');
      this.aragorn  = this.playerDom(PLAYER.WARRIOR,  $('aragorn'));
      this.gimli    = this.playerDom(PLAYER.VALKYRIE, $('gimli'));
      this.gandalf  = this.playerDom(PLAYER.WIZARD,   $('gandalf'));
      this.legolas  = this.playerDom(PLAYER.ELF,      $('legolas'));
      this.high     = { dom: this.highScoreDom() };

      var p1 = this.aragorn.down('.press b'),
          p2 = this.gimli.down('.press b'),
          p3 = this.gandalf.down('.press b'),
          p4 = this.legolas.down('.press b'),
          pressN = new Animator({ repeat: 'toggle', duration: 500 }).addSubject(function(value) {
            p1.fade(value);
            p2.fade(value);
            p3.fade(value);
            p4.fade(value);
          });
      pressN.play();

      this.refreshHighScore(score, who);
      this.refreshLevel(level);

    },

    playerDom: function(type, root) {
      type.dom = {
        root:    root,
        score:   root.down('.score .value'),
        health:  root.down('.health .value'),
        special: root.down('.special'),
        specialFill: root.down('.special .fill'),
        keys:    root.select('.treasure .key'),
        potions: root.select('.treasure .potion'),
        weak:    new Animator({ repeat: 'toggle', duration: 500, onComplete: function() { root.removeAttribute('style'); } }).addSubject(new CSSStyleSubject(root, "weak", "background-color: #000000; border-color: #000000;"))
      }
      return root;
    },

    highScoreDom: function() {
      var score = this.dom.down('.high .value'),
          who   = this.dom.down('.high'),
          flash = new Animator({ repeat: 'toggle', duration: 500, onComplete: function() { who.fade(1); } }).addSubject(function(value) { who.fade(1 - value*0.8); });
      return { score: score, who: who, flash: flash };
    },

    onStartLevel: function(map) {
      this.refreshLevel(map.level);
    },

    onPlayerJoin: function(player) {
      player.vhealth = player.vweak = player.vscore = player.vkeys = player.vpotions = null; // reset any cached 'visual' values
      player.type.dom.root.toggleClassName(this.active, true);
      player.type.dom.score.update(this.formatScore(0));
      player.type.dom.health.update(this.formatHealth(0));
      this.refreshTreasure(player.type.dom.keys, 0);
      this.refreshTreasure(player.type.dom.potions, 0);
    },

    onPlayerLeave: function(player) {
      player.type.dom.root.toggleClassName(this.active, false);
      player.type.dom.weak.stop();
      this.deactivateHighScore();
    },

    formatHealth: function(n) { return to.string(Math.floor(n)); },
    formatScore:  function(n) { return ("000000" + Math.floor(n)).slice(-6); },

    inc: function(previous, current) {
      previous = previous || 0;
      return (current > previous) ?
        Math.min(current, previous + Math.ceil((current - previous)/10)) :
        Math.max(current, previous + Math.floor((current - previous)/10));
    },

    refreshLevel: function(level) {
      this.level.update(level.name);
    },

    refreshBossPanel: function() {
      var panel = $('boss-panel');
      if (!panel) return;
      var boss = game.map && game.map.bossEntity;
      if (!boss || !boss.active || boss.health <= 0) {
        panel.hide();
        if (game.map) game.map.bossEntity = null;
        return;
      }
      var maxH = boss.maxHealth || (boss.type && boss.type.health) || 1;
      var pct = Math.max(0, Math.min(1, boss.health / maxH));
      var name = (boss.type && boss.type.displayName) || (game.map && game.map.bossName) || 'BOSS';
      panel.show();
      var nameEl = panel.down('.boss-name');
      var fill = panel.down('.boss-fill');
      var weak = panel.down('.boss-weak');
      if (nameEl) nameEl.update(name);
      if (fill) fill.style.width = Math.floor(pct * 100) + '%';
      if (weak && boss.type && boss.type.weakTo) {
        var parts = [];
        if (boss.type.weakTo.gandalf >= 1.5) parts.push('Gandalf strong');
        if (boss.type.weakTo.aragorn >= 1.4) parts.push('Aragorn strong');
        if (boss.type.weakTo.legolas >= 1.3) parts.push('Legolas strong');
        if (boss.type.weakTo.gimli >= 1.3) parts.push('Gimli strong');
        weak.update(parts.length ? parts.join(' · ') : 'Fight as one');
      }
    },

    refreshHighScore: function(score, who) {
      if (score != this.high.score)
        this.high.dom.score.update(this.formatScore(this.high.score = score));
      if (who != this.high.who)
        this.high.dom.who.setClassName("high " + (this.high.who = who));
    },

    activateHighScore:   function() { this.high.active = true;  this.high.dom.flash.play(); },
    deactivateHighScore: function() { this.high.active = false; this.high.dom.flash.stop(); },

    refreshPlayer: function(player) {
      this.refreshPlayerHealth(player);
      this.refreshPlayerWeak(player);
      this.refreshPlayerScore(player);
      this.refreshPlayerKeys(player);
      this.refreshPlayerPotions(player);
      this.refreshPlayerSpecial(player);
    },

    refreshPlayerSpecial: function(player) {
      if (!player.type.dom || !player.type.dom.specialFill) return;
      var sp = player.type.special;
      var maxCd = (sp && sp.cooldown) || (2.5 * FPS);
      var maxCharge = (sp && sp.charge) || (2 * FPS);
      var left = player.specialCooldown || 0;
      var charge = player.chargeTime || 0;
      var pct, state;

      if (left > 0) {
        // Cooling down after special — bar fills as it recovers
        pct = Math.max(0, 1 - (left / maxCd));
        state = 'cooling';
      } else if (charge > 0 && player.firing) {
        // Holding fire to charge — bar rises toward full (ready to unleash)
        pct = Math.min(1, charge / maxCharge);
        state = 'charging';
      } else {
        // Ready
        pct = 1;
        state = 'ready';
      }

      player.type.dom.specialFill.style.width = Math.floor(pct * 100) + '%';
      var root = player.type.dom.special;
      if (root) root.className = 'special ' + state;
    },

    refreshPlayerScore: function(player) {
      if (player.score != player.vscore) {
        player.type.dom.score.update(this.formatScore(player.vscore = this.inc(player.vscore, player.score)));
        if (player.vscore > this.high.score) {
          this.refreshHighScore(player.vscore, player.type.name);
          if (!this.high.active) {
            this.activateHighScore();
            publish(EVENT.HIGH_SCORE, player);
          }
        }
      }
    },

    refreshPlayerHealth: function(player) {
      if (player.health != player.vhealth)
        player.type.dom.health.update(this.formatHealth(player.vhealth = this.inc(player.vhealth, player.health)));
    },

    refreshPlayerWeak: function(player) {
      if (player.weak() != player.vweak) {
        if (player.vweak = player.weak())
          player.type.dom.weak.play();
        else
          player.type.dom.weak.stop();
      }
    },

    refreshPlayerKeys: function(player) {
      if (player.keys != player.vkeys)
        this.refreshTreasure(player.type.dom.keys, player.vkeys = player.keys);
    },

    refreshPlayerPotions: function(player) {
      if (player.potions != player.vpotions)
        this.refreshTreasure(player.type.dom.potions, player.vpotions = player.potions);
    },

    refreshTreasure: function(elements, n) {
      var k, max;
      for(k = 0, max = elements.length ; k < max ; k++)
        elements[k].showIf(k < n);
    }

  });

  //===========================================================================
  // THE VIEWPORT
  //===========================================================================

  var Viewport = Class.create({

    initialize: function() {
      subscribe(EVENT.START_LEVEL, this.onStartLevel.bind(this));
    },

    onStartLevel: function(map) {
      this.size(VIEWPORT.TW, map);
      this.center(map.start, map);
      this.zoomingout = false;
      this.shakeTime = 0;
      this.shakeMag = 0;
      this.shakeOx = 0;
      this.shakeOy = 0;
    },

    outside: function(x, y, w, h) {
      return !Game.Math.overlap(x, y, w, h, this.x, this.y, this.w, this.h);
    },

    center: function(pos, map) {
      this.move(pos.x - this.w/2, pos.y - this.h/2, map);
    },

    move: function(x, y, map) {
      this.x = Game.Math.minmax(x, 0, map.w - this.w - 1);
      this.y = Game.Math.minmax(y, 0, map.h - this.h - 1);
    },

    size: function(tw, map) {
      this.tw = Game.Math.minmax(tw, 18, map.th < map.tw ? map.tw : map.th * (VIEWPORT.TW/VIEWPORT.TH));
      this.th = this.tw * (VIEWPORT.TH / VIEWPORT.TW);
      this.w  = this.tw * TILE;
      this.h  = this.th * TILE;
      game.runner.setSize(this.w, this.h);
    },

    zoom: function(tx, pos, map) {
      this.size(this.tw + tx, map);
      this.center(pos, map);
    },

    zoomout: function(on) {
      this.zoomingout = on
    },

    // Screen rumble — duration in frames, magnitude in pixels
    shake: function(frames, magnitude) {
      frames = frames || 0;
      magnitude = magnitude || 4;
      if (frames >= (this.shakeTime || 0)) {
        this.shakeTime = frames;
        this.shakeDuration = frames;
        this.shakeMag = magnitude;
      }
    },

    update: function(frame, players, map, viewport) {
      // players can be a single Player or an array of Players
      var pos = players;
      if (is.array(players)) {
        var active = [], i, p;
        for (i = 0; i < players.length; i++) {
          p = players[i];
          if (p && p.active && p.active()) active.push(p);
        }
        if (active.length === 0) return;
        if (active.length === 1) {
          pos = active[0];
        } else {
          // Center on midpoint of all active players
          var sx = 0, sy = 0;
          for (i = 0; i < active.length; i++) {
            sx += active[i].x;
            sy += active[i].y;
          }
          pos = { x: sx / active.length, y: sy / active.length };
        }
      }
      this.center(pos, map);
      if (this.zoomingout)
        this.zoom(1/TILE, pos, map);

      // Screen shake offset (decays over the full duration)
      if (this.shakeTime > 0) {
        this.shakeTime--;
        var progress = this.shakeTime / Math.max(1, this.shakeDuration || this.shakeTime);
        var mag = this.shakeMag * (0.3 + 0.7 * progress);
        this.shakeOx = Game.Math.randomInt(-Math.ceil(mag), Math.ceil(mag));
        this.shakeOy = Game.Math.randomInt(-Math.ceil(mag), Math.ceil(mag));
        if (this.shakeTime <= 0) {
          this.shakeOx = 0;
          this.shakeOy = 0;
          this.shakeMag = 0;
          this.shakeDuration = 0;
        }
      } else {
        this.shakeOx = 0;
        this.shakeOy = 0;
      }
    }

  });

  //===========================================================================
  // RENDERING CODE
  //===========================================================================

  var Render = Class.create({

    initialize: function(sprites) {
      this.sprites = sprites;
    },

    sprite: function(ctx, sprites, viewport, sx, sy, x, y, w, h) {
      ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, x - viewport.x, y - viewport.y, w || TILE, h || TILE);
    },

    tile: function(ctx, sprites, sx, sy, tx, ty) {
      ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, tx * TILE, ty * TILE, TILE, TILE);
    },

    map: function(ctx, frame, viewport, map) {
      var w = Math.min(map.w, viewport.w),
          h = Math.min(map.h, viewport.h);
      map.background = map.background || Game.renderToCanvas(map.w, map.h, this.maptiles.bind(this, map));
      ctx.drawImage(map.background, viewport.x, viewport.y, w, h, 0, 0, w, h);
    },

    maptiles: function(map, ctx) {
      var n, cell, tx, ty, tw, th, sprites = this.sprites.backgrounds;
      for(ty = 0, th = map.th ; ty < th ; ty++) {
        for(tx = 0, tw = map.tw ; tx < tw ; tx++) {
          cell = map.cell(tx * TILE, ty * TILE);
          if (!cell) continue;
          if (is.valid(cell.wall))
            this.tile(ctx, sprites, cell.wall, DEBUG.WALL || map.level.wall, tx, ty);
          else if (cell.nothing)
            this.tile(ctx, sprites, 0, 0, tx, ty);
          else
            this.tile(ctx, sprites, DEBUG.FLOOR || map.level.floor, 0, tx, ty);
          if (cell.shadow)
            this.tile(ctx, sprites, cell.shadow, WALL.MAX+1, tx, ty);
        }
      }
      if (DEBUG.GRID)
        this.grid(ctx, map);
    },

    grid: function(ctx, map) {
      var tx, ty, tw, th;
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      for(ty = 0, th = map.th ; ty < th ; ty++) {
        ctx.moveTo( 0,     ty * TILE);
        ctx.lineTo( map.w, ty * TILE);
      }
      for(tx = 0, tw = map.tw ; tx < tw ; tx++) {
        ctx.moveTo( tx * TILE, 0     );
        ctx.lineTo( tx * TILE, map.h );
      }
      ctx.stroke();
    },

    player: function(ctx, frame, viewport, player) {

      if (player.onrender(frame) !== false) {

        var sprites = this.sprites.entities,
            sx      = player.type.sx + player.frame,
            sy      = player.type.sy,
            x       = player.x,
            y       = player.y - 2, // wiggle, wiggle, wiggle
            exiting = player.exiting ? (player.exiting.max - player.exiting.count) / player.exiting.max : 0,
            dx      = player.exiting ? (exiting * 2 * player.exiting.dx) : 0,
            dy      = player.exiting ? (exiting * 2 * player.exiting.dy) : 0,
            shrink  = player.exiting ? (exiting * 2 * TILE)              : 0,
            weak    = player.weak(),
            hurt    = player.hurting,
            heal    = player.healing,
            border  = 0,
            maxglow = FX.PLAYER_GLOW.border;

        if (exiting > 0.5) // player is 'gone' once halfway through exit
          return;

        if (hurt || heal) {
          border = Math.ceil(maxglow * ((hurt || heal) / FX.PLAYER_GLOW.frames));
          player.ctx.fillStyle = hurt ? 'red' : 'green';
          player.ctx.fillRect(0, 0, player.canvas.width, player.canvas.height);
          player.ctx.globalCompositeOperation = 'destination-in';
          player.ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, maxglow - border, maxglow - border, STILE + 2*border, STILE + 2*border);
          player.ctx.globalCompositeOperation = 'source-over';
        }
        else {
          player.ctx.clearRect(0, 0, player.canvas.width, player.canvas.height);
        }

        var weakFlash = 0;
        if (weak && player.type.dom && player.type.dom.weak && typeof player.type.dom.weak.state === 'number')
          weakFlash = player.type.dom.weak.state * 0.9;
        player.ctx.globalAlpha = 1 - weakFlash; // piggy back the DOM scoreboard animator (but dont go completely transparent)
        player.ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, maxglow, maxglow, STILE, STILE);

        ctx.drawImage(player.canvas, 0, 0, STILE + 2*maxglow, STILE + 2*maxglow, x + dx - maxglow + shrink/2 - viewport.x, y + dy - maxglow + shrink/2 - viewport.y, TILE + 2*maxglow - shrink, TILE + 2*maxglow - shrink);

        // Comic speech bubble (Simpsons-style)
        if (player.bubble && player.bubble.text) {
          this.speechBubble(ctx,
            x + dx + TILE / 2 - viewport.x,
            y + dy - viewport.y,
            player.bubble.text);
        }
      }
    },

    speechBubble: function(ctx, cx, topY, text) {
      var padX = 8, padY = 5, maxW = 160;
      ctx.save();
      ctx.font = 'bold 11px Tahoma, Geneva, sans-serif';
      // Word wrap
      var words = String(text).split(/\s+/), lines = [], line = '';
      var i, w;
      for (i = 0; i < words.length; i++) {
        var test = line ? (line + ' ' + words[i]) : words[i];
        if (ctx.measureText(test).width > maxW && line) {
          lines.push(line);
          line = words[i];
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      var lineH = 13;
      var boxW = 0;
      for (i = 0; i < lines.length; i++) {
        w = ctx.measureText(lines[i]).width;
        if (w > boxW) boxW = w;
      }
      boxW += padX * 2;
      var boxH = lines.length * lineH + padY * 2;
      var bx = Math.round(cx - boxW / 2);
      var by = Math.round(topY - boxH - 12);
      // Keep on screen a bit
      if (bx < 2) bx = 2;
      if (by < 2) by = 2;

      // Bubble body
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      var r = 6;
      ctx.moveTo(bx + r, by);
      ctx.lineTo(bx + boxW - r, by);
      ctx.quadraticCurveTo(bx + boxW, by, bx + boxW, by + r);
      ctx.lineTo(bx + boxW, by + boxH - r);
      ctx.quadraticCurveTo(bx + boxW, by + boxH, bx + boxW - r, by + boxH);
      ctx.lineTo(bx + r, by + boxH);
      ctx.quadraticCurveTo(bx, by + boxH, bx, by + boxH - r);
      ctx.lineTo(bx, by + r);
      ctx.quadraticCurveTo(bx, by, bx + r, by);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tail pointing down toward the hero
      var tx = cx;
      if (tx < bx + 10) tx = bx + 10;
      if (tx > bx + boxW - 10) tx = bx + boxW - 10;
      ctx.beginPath();
      ctx.moveTo(tx - 6, by + boxH - 1);
      ctx.lineTo(tx, by + boxH + 10);
      ctx.lineTo(tx + 6, by + boxH - 1);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tx - 6, by + boxH);
      ctx.lineTo(tx, by + boxH + 10);
      ctx.lineTo(tx + 6, by + boxH);
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // Text
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], bx + boxW / 2, by + padY + i * lineH);
      }
      ctx.restore();
    },

    entities: function(ctx, frame, viewport, entities) {
      var n, max, entity, sf, sprites = this.sprites.entities;
      for(n = 0, max = entities.length ; n < max ; n++) {
        entity = entities[n];
        if (entity.active && (!entity.onrender || entity.onrender(frame) !== false) && !viewport.outside(entity.x, entity.y, TILE, TILE)) {
          this.sprite(ctx, sprites, viewport, entity.type.sx + (entity.frame || 0), entity.type.sy, entity.x + (entity.dx || 0), entity.y + (entity.dy || 0), TILE + (entity.dw || 0), TILE + (entity.dh || 0));
        }
      }
    },

    // Floating boss energy meter above the boss sprite
    bossBar: function(ctx, viewport, boss) {
      var bw = TILE + (boss.dw || 0);
      var bh = TILE + (boss.dh || 0);
      if (!boss || viewport.outside(boss.x + (boss.dx || 0), boss.y + (boss.dy || 0), bw, bh)) return;
      var maxH = boss.maxHealth || (boss.type && boss.type.health) || 1;
      var pct = Math.max(0, Math.min(1, boss.health / maxH));
      var x = boss.x + (boss.dx || 0) - viewport.x;
      var y = boss.y + (boss.dy || 0) - viewport.y - 14;
      var w = bw + 16;
      var h = 6;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(x - 8, y, w, h + (boss.type && boss.type.displayName ? 12 : 0));
      ctx.fillStyle = '#333';
      ctx.fillRect(x - 6, y + 2, w - 4, h);
      ctx.fillStyle = pct > 0.5 ? '#e74c3c' : (pct > 0.25 ? '#f39c12' : '#c0392b');
      ctx.fillRect(x - 6, y + 2, (w - 4) * pct, h);
      if (boss.type && boss.type.displayName) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px Tahoma, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(boss.type.displayName, x + TILE / 2, y + h + 11);
      }
      ctx.restore();
    },

    // Phase 4 — glowing Ring zone + destroy progress bar
    drawTheRing: function(ctx, viewport, ring, frame) {
      if (!ring || viewport.outside(ring.x - ring.r, ring.y - ring.r, ring.r * 2, ring.r * 2)) return;
      var cx = ring.x - viewport.x + TILE / 2;
      var cy = ring.y - viewport.y + TILE / 2;
      var pulse = 0.5 + 0.5 * Math.sin((frame || 0) / 6);
      ctx.save();
      // Outer glow
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r * (0.85 + 0.1 * pulse), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 215, 0, ' + (0.15 + 0.1 * pulse) + ')';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 200, 40, ' + (0.6 + 0.3 * pulse) + ')';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, TILE * 0.55, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffe566';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 11px Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('THE RING', cx, cy - ring.r * 0.7 - 4);
      // Progress bar
      var pct = Math.max(0, Math.min(1, ring.progress / (ring.needed || 1)));
      var bw = TILE * 3, bh = 7;
      var bx = cx - bw / 2, by = cy + ring.r * 0.75;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
      ctx.fillStyle = '#333';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = pct > 0.7 ? '#2ecc71' : '#f1c40f';
      ctx.fillRect(bx, by, bw * pct, bh);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px Tahoma, sans-serif';
      ctx.fillText('HOLD FIRE ' + Math.floor(pct * 100) + '%', cx, by + bh + 11);
      ctx.restore();
    }

  });

  //===========================================================================
  // SOUND FX and MUSIC
  //===========================================================================

  var Sounds = Class.create({

    initialize: function(sounds) {
      this.sounds      = sounds;
      this.sounds.menu = this.sounds.lostcorridors;
      this.sounds.game = this.sounds.thebeginning;
      this.sounds.fire = this.sounds.firegandalf;    // re-use gandalf firing sound for monster (demon) fire
      this.sounds.nuke = this.sounds.generatordeath; // TODO: find a big bang explosion
      this.toggleMute(this.isMute());

      $('sound').on('click', this.onClickMute.bind(this)).show();

      subscribe(EVENT.START_LEVEL,        this.onStartLevel.bind(this));
      subscribe(EVENT.PLAYER_FIRE,        this.onPlayerFire.bind(this));
      subscribe(EVENT.MONSTER_FIRE,       this.onMonsterFire.bind(this));
      subscribe(EVENT.PLAYER_EXITING,     this.onPlayerExiting.bind(this));
      subscribe(EVENT.PLAYER_HURT,        this.onPlayerHurt.bind(this));
      subscribe(EVENT.PLAYER_NUKE,        this.onPlayerNuke.bind(this));
      subscribe(EVENT.PLAYER_SPECIAL,     this.onPlayerSpecial.bind(this));
      subscribe(EVENT.DOOR_OPEN,          this.onDoorOpen.bind(this));
      subscribe(EVENT.TREASURE_COLLECTED, this.onTreasureCollected.bind(this));
      subscribe(EVENT.MONSTER_DEATH,      this.onMonsterDeath.bind(this));
      subscribe(EVENT.GENERATOR_DEATH,    this.onGeneratorDeath.bind(this));
      subscribe(EVENT.HIGH_SCORE,         this.onHighScore.bind(this));
      subscribe(EVENT.PLAYER_DEATH,       this.onPlayerDeath.bind(this));
      subscribe(EVENT.PLAYER_WEAK,        this.onPlayerWeak.bind(this));
      subscribe(EVENT.PLAYER_REVIVE,      this.onPlayerRevive.bind(this));
    },

    speak: function(text, opts) {
      if (this.isMute() || !text || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.volume = 1.0;
        u.rate = (opts && opts.rate) || 1.0;
        u.pitch = (opts && opts.pitch) || 1.0;
        window.speechSynthesis.speak(u);
      } catch (e) { /* optional */ }
    },

    onStartLevel: function(map) {
      var key = DEBUG.MUSIC || (map && map.level && map.level.music);
      var track = (key && this.sounds[key]) || this.sounds.warbringer || this.sounds.game;
      this.playGameMusic(track);
      this.nlevel = map.nlevel;
    },
    onPlayerFire:        function(player)            { this.play(this.sounds["fire" + player.type.name]);                                                     },
    onMonsterFire:       function(monster)           { this.play(this.sounds.fire);                                                                           },
    onDoorOpen:          function(door)              { this.play(this.sounds.opendoor);                                                                       },
    onTreasureCollected: function(treasure, player)  {
      this.play(this.sounds["collect" + treasure.type.sound]);
      if (player && player._pickupPhrase) {
        this.speak(player._pickupPhrase, { rate: 1.1, pitch: 1.05 });
        if (player.say) player.say(player._pickupPhrase, 3 * FPS);
        player._pickupPhrase = null;
      } else if (treasure.type && treasure.type.label === 'Lembas') {
        this.speak("Lembas!", { rate: 1.1, pitch: 1.1 });
        if (player && player.say) player.say("Lembas!", 2 * FPS);
      }
    },
    onMonsterDeath:      function(monster, by, nuke) { this.play(nuke ? this.sounds.generatordeath : this.sounds["monsterdeath" + Game.Math.randomInt(1,3)]); },
    onGeneratorDeath:    function(generator, by)     { this.play(this.sounds.generatordeath);                                                                 },
    onHighScore:         function(player)            { this.play(this.sounds.highscore);                                                                      },
    onPlayerNuke:        function(player)            { this.play(this.sounds.nuke);                                                                           },
    onPlayerSpecial:     function(player) {
      // Big impact SFX
      this.play(this.sounds.generatordeath);
      this.play(this.sounds.nuke);
      if (player.type.special && player.type.special.phrase) {
        var opts = { rate: 1.0, pitch: 1.0 };
        if (player.type.name === 'gandalf') { opts.rate = 0.85; opts.pitch = 0.7; }
        else if (player.type.name === 'aragorn') { opts.rate = 1.0; opts.pitch = 0.9; }
        else if (player.type.name === 'gimli') { opts.rate = 1.05; opts.pitch = 0.75; }
        else { opts.rate = 1.15; opts.pitch = 1.1; }
        this.speak(player.type.special.phrase, opts);
        if (player.say) player.say(player.type.special.phrase, 3 * FPS);
      }
    },
    onPlayerWeak: function(player) {
      try {
        if (this.sounds && this.sounds.weak) this.play(this.sounds.weak);
        if (player && player.type && player.type.weakMsg) {
          this.speak(player.type.weakMsg, { rate: 1.0, pitch: 0.95 });
          if (player.say) player.say(player.type.weakMsg, 3 * FPS);
        }
      } catch (e) { /* never freeze the game on weak warning */ }
    },
    onPlayerRevive: function(player) {
      this.play(this.sounds.collectpotion);
      var name = (player.type.displayName || player.type.name || "Hero").toUpperCase();
      this.speak(name + " rises!", { rate: 1.05, pitch: 1.0 });
      if (player.say) player.say(name + " rises!", 2.5 * FPS);
    },
    onPlayerDeath: function(player) {
      // Only stop music when the whole party is dead (handled elsewhere for multi); still play line
      if (player.type.deathMsg) {
        this.speak(player.type.deathMsg, { rate: 0.95, pitch: 0.85 });
        if (player.say) player.say(player.type.deathMsg, 3 * FPS);
      }
      var i, anyAlive = false;
      if (game.players) {
        for (i = 0; i < game.players.length; i++) {
          if (game.players[i] && !game.players[i].dead) anyAlive = true;
        }
      }
      if (!anyAlive) {
        this.stopAllMusic();
        this.play(this.sounds.gameover);
      }
    },

    onPlayerExiting: function(player, exit) {
      this.play(this.sounds.exitlevel);
      if (this.nlevel === (cfg.levels.length-1)) {
        this.sounds.game.stop();
        this.play(this.sounds.victory);
      }
      else if (cfg.levels[this.nlevel].music != cfg.levels[this.nlevel+1].music) {
        this.sounds.game.fade(3000);
      }
    },

    onPlayerHurt: function(player, damage) {
      if (!player.hurtSound || player.hurtSound.ended) // only play 1 at a time
        player.hurtSound = this.play(this.sounds[player.type.sex + "pain" + Game.Math.randomInt(1,2)]);
    },

    onClickMute: function(event) {
      this.toggleMute(this.isNotMute());
      this.toggleMusic();
    },

    toggleMute: function(on) {
      AudioFX.mute = game.storage.mute = on;
      $('sound').setClassName(AudioFX.mute ? 'off' : 'on');
    },

    toggleMusic: function() {
      if (AudioFX.mute)
        this.stopAllMusic();
      else if (game.is('menu'))
        this.playMenuMusic();
      else if (game.is('loading') || game.is('playing') || game.is('lost'))
        this.playGameMusic();
    },

    isMute:    function()  { return to.bool(game.storage.mute);     },
    isNotMute: function()  { return !this.isMute();                 },
    play:      function(s) { if (this.isNotMute() && s && s.play) return s.play(); },

    stopAllMusic: function() {
      this.sounds.menu.stop();
      this.sounds.game.stop();
    },

    playMenuMusic: function() {
      this.stopAllMusic();
      this.play(this.sounds.menu);
    },

    playGameMusic: function(sound) {
      try {
        sound = sound || this.sounds.game || this.sounds.warbringer || this.sounds.thebeginning;
        if (!sound) return;
        // Always ensure something is playing; restart if paused/ended or track changed
        if ((sound !== this.sounds.game) || !sound.audio || sound.audio.ended || sound.audio.paused) {
          this.stopAllMusic();
          this.sounds.game = sound;
          this.play(sound);
        } else if (sound.audio && sound.audio.paused) {
          this.play(sound);
        }
      } catch (e) { /* never block the game on music */ }
    }

  });

  //===========================================================================
  // FINALLY, return the game to the Game.Runner
  //===========================================================================

  return game;

  //===========================================================================

}

