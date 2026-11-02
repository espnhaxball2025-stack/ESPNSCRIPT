// ---------- Config ----------
var ROOM_NAME = "⚽⚽JUEGAN TODOS EN ESPN HAXBALL⚽⚽";
var room = HBInit({
  roomName: ROOM_NAME,
  maxPlayers: 30,
  public: true,
  token: "thr1.AAAAAGrn6WHYr6jorGwbOA.EEX9I_v6yHU"
});

var LINKS = {
  kick: "https://kick.com/espnhaxball",
  twitch: "https://www.twitch.tv/espn_haxball",
  youtube: "https://www.youtube.com/@EspnHaxballOFICIAL",
  instagram: "https://www.instagram.com/espnhaxball/",
  discord: "https://discord.com/invite/jKq3gdhKSF"
};

var OWNER_PASS = "nnahesgay";
var ADMIN_PASS = "espn2233";

var ownerId = null;
var admins = {};
var autojoinEnabled = true;
var autoStartEnabled = true;
var hiddenHost = {};
var varInterval = null;

var EMOJI_OWNER = "👑";
var EMOJI_ADMIN = "🔷";
var EMOJI_RED = "🔴";
var EMOJI_BLUE = "🔵";
var COLOR_ADMIN = 0x00E5FF; 
var COLOR_OWNER = 0xFFD700;
var COLOR_GOAL = 0x00FF66;
var COLOR_OWN_GOAL = 0xFF3333;

var lastTouchPlayer = null;
var secondLastTouchPlayer = null;
var matchStats = {}; 

function getPlayerStats(player) {
  if (!matchStats[player.id]) {
    matchStats[player.id] = { name: player.name, goals: 0, assists: 0, ownGoals: 0 };
  }
  return matchStats[player.id];
}

function resetAllStats() {
  matchStats = {};
  lastTouchPlayer = null;
  secondLastTouchPlayer = null;
}

function fancyLine(char, len) {
  var s = "";
  for (var i = 0; i < len; i++) s += char;
  return s;
}

function formatTime(seconds) {
  var mins = Math.floor(seconds / 60);
  var secs = Math.floor(seconds % 60);
  return (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
}

function getFormattedMatchTime() {
  var scores = room.getScores();
  if (!scores) return "[00:00]";
  return "[" + formatTime(scores.time) + "]";
}

function getTeamCounts() {
  var players = room.getPlayerList();
  var red = 0, blue = 0;
  for (var i = 0; i < players.length; i++) {
    if (players[i].team === 1) red++;
    if (players[i].team === 2) blue++;
  }
  return { red: red, blue: blue };
}

function teamEmoji(team) {
  if (team === 1) return EMOJI_RED;
  if (team === 2) return EMOJI_BLUE;
  return "⚪";
}

function assignToSmallerTeam(player) {
  var counts = getTeamCounts();
  if (counts.red <= counts.blue) {
    room.setPlayerTeam(player.id, 1);
  } else {
    room.setPlayerTeam(player.id, 2);
  }
}

function shuffleArray(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

function isAdmin(player) {
  return admins[player.id] === true || (ownerId !== null && player.id === ownerId);
}

function findPlayerByName(name) {
  if (!name) return null;
  var list = room.getPlayerList();
  name = name.toLowerCase();
  for (var i = 0; i < list.length; i++) {
    if (list[i].name.toLowerCase().indexOf(name) !== -1) return list[i];
  }
  return null;
}

function welcomePlayer(player) {
  if (hiddenHost[player.id]) return;
  var circle = teamEmoji(player.team);
  var header = fancyLine("═", 40);
  var msg = header + "\n";
  msg += "🎉  BIENVENIDO A " + ROOM_NAME + "  🎉\n";
  msg += "Jugador: " + player.name + " (" + circle + ")\n";
  msg += header;
  room.sendAnnouncement(msg, player.id, 0xFFD700, "bold", 0);
}

room.onPlayerJoin = function(player) {
  if (player.name === ROOM_NAME) {
    hiddenHost[player.id] = true;
    room.setPlayerTeam(player.id, 0);
    room.setPlayerAdmin(player.id, false);
    return;
  }
  if (autojoinEnabled) {
    assignToSmallerTeam(player);
  } else {
    room.setPlayerTeam(player.id, 0);
  }
  setTimeout(function() {
    var p = room.getPlayer(player.id);
    if (p) welcomePlayer(p);
  }, 500);
  var counts = getTeamCounts();
  room.sendAnnouncement("➡️ " + player.name + " se ha unido. Equipos: " + EMOJI_RED + " " + counts.red + " - " + EMOJI_BLUE + " " + counts.blue, null, 0x00BFFF, "normal", 0);
};

room.onPlayerLeave = function(player) {
  if (hiddenHost[player.id]) {
    delete hiddenHost[player.id];
    return;
  }
  delete matchStats[player.id];
  var counts = getTeamCounts();
  room.sendAnnouncement("⬅️ " + player.name + " ha salido. Equipos: " + EMOJI_RED + " " + counts.red + " - " + EMOJI_BLUE + " " + counts.blue, null, 0xFF4500, "normal", 0);
};

room.onPlayerTeamChange = function(player) {
  if (hiddenHost[player.id]) return;
  var circle = teamEmoji(player.team);
  room.sendAnnouncement("🔁 " + player.name + " ahora está en " + (player.team === 1 ? "RED " + EMOJI_RED : player.team === 2 ? "BLUE " + EMOJI_BLUE : "ESPECTADOR"), null, 0xFFFFFF, "normal", 0);
};

room.onGameStart = function(byPlayer) {
  resetAllStats();
  room.sendAnnouncement("⚽ ¡Comienza el partido en EspnHaxball! ¡A dejar todo en la cancha!", null, 0x00FF99, "bold", 1);
};

room.onPlayerBallKick = function(player) {
  if (!lastTouchPlayer || lastTouchPlayer.id !== player.id) {
    secondLastTouchPlayer = lastTouchPlayer;
    lastTouchPlayer = player;
  }
};

room.onTeamGoal = function(team) {
  var scores = room.getScores();
  var timeStr = getFormattedMatchTime();
  var scoreText = scores ? (scores.red + " - " + scores.blue) : "0 - 0";

  var scorer = null;
  var assister = null;

  if (!lastTouchPlayer) {
    room.sendAnnouncement(timeStr + " ¡GOOOOOOOOOOOOOOOL! El partido esta " + scoreText, null, COLOR_GOAL, "bold", 2);
    return;
  }

  if (lastTouchPlayer.team === team) {
    scorer = lastTouchPlayer;
    var stScorer = getPlayerStats(scorer);
    stScorer.goals++;

    var assistText = "Sin asistencia";
    if (secondLastTouchPlayer && secondLastTouchPlayer.id !== scorer.id && secondLastTouchPlayer.team === team) {
      assister = secondLastTouchPlayer;
      var stAssister = getPlayerStats(assister);
      stAssister.assists++;
      assistText = assister.name;
    }

    room.sendAnnouncement(timeStr + " ¡GOOOOOOOOOOOOOOOL! DE " + scorer.name.toUpperCase() + " ADELANTA EL PARTIDO " + scoreText + " Asiste " + assistText, null, COLOR_GOAL, "bold", 2);
  } else {
    scorer = lastTouchPlayer;
    var stOwn = getPlayerStats(scorer);
    stOwn.ownGoals++;
    room.sendAnnouncement(timeStr + " GOOOL.. EN CONTRA.. " + scorer.name + " se hizo gol en contra y el partido esta " + scoreText, null, COLOR_OWN_GOAL, "bold", 2);
  }

  lastTouchPlayer = null;
  secondLastTouchPlayer = null;
};

room.onTeamVictory = function(scores) {
  var mvpName = "Nadie";
  var maxScore = -999;

  for (var id in matchStats) {
    var p = matchStats[id];
    var rating = (p.goals * 3) + (p.assists * 2) - (p.ownGoals * 2);
    if (rating > maxScore) {
      maxScore = rating;
      mvpName = p.name;
    }
  }

  if (maxScore > 0) {
    room.sendAnnouncement("🏆EL MVP PRESENTADO POR HAXFLASH - CREADOR DE TORNEOS DE HAXBALL: MVP DEL PARTIDO ES " + mvpName.toUpperCase() + " 🏆", null, 0xFFD700, "bold", 2);
  }
};

room.onGameStop = function(byPlayer) {
  if (autoStartEnabled) {
    room.sendAnnouncement("⏱️ Autostart: El próximo partido arranca en 2 segundos...", null, 0x00FF99, "bold", 1);
    setTimeout(function() {
      room.startGame();
    }, 2000);
  }
};

room.onPlayerChat = function(player, message) {
  var msg = message.trim();
  if (hiddenHost[player.id]) return false;
  if (msg.charAt(0) === "!") {
    handleCommand(player, msg);
    return false;
  }

  var displayName = player.name;
  var color = 0xFFFFFF;
  if (player.id === ownerId) {
    displayName = EMOJI_OWNER + " " + player.name;
    color = COLOR_OWNER;
  } else if (isAdmin(player)) {
    displayName = EMOJI_ADMIN + " ADMIN | " + player.name;
    color = COLOR_ADMIN;
  }

  var circle = teamEmoji(player.team);
  var formatted = "💬 " + displayName + " (" + circle + "): " + msg;
  room.sendAnnouncement(formatted, null, color, "normal", 1);
  return false;
};

function handleCommand(player, msg) {
  var parts = msg.split(" ");
  var cmd = parts[0].toLowerCase();
  var arg = parts.slice(1).join(" ").trim();

  if (cmd === "!admin") {
    if (arg === ADMIN_PASS) {
      admins[player.id] = true;
      room.setPlayerAdmin(player.id, true);
      room.sendAnnouncement(EMOJI_ADMIN + " ADMIN | " + player.name + " ahora es Admin.", null, COLOR_ADMIN, "bold", 0);
    } else {
      room.sendAnnouncement("🔒 Contraseña ADMIN incorrecta.", player.id, 0xFF0000, "normal", 0);
    }
    return;
  }

  if (cmd === "!owner") {
    if (arg === OWNER_PASS) {
      ownerId = player.id;
      admins[player.id] = true;
      room.setPlayerAdmin(player.id, true);
      room.sendAnnouncement(EMOJI_OWNER + " OWNER | " + player.name + " ahora es Owner.", null, COLOR_OWNER, "bold", 0);
    } else {
      room.sendAnnouncement("🔒 Contraseña OWNER incorrecta.", player.id, 0xFF0000, "normal", 0);
    }
    return;
  }

  if (cmd === "!var") {
    if (!isAdmin(player)) {
      room.sendAnnouncement("❌ Solo admins o el owner pueden usar el comando !var.", player.id, 0xFF0000, "bold", 0);
      return;
    }

    if (varInterval !== null) {
      clearInterval(varInterval);
      varInterval = null;
      room.sendAnnouncement("🖥️ EL VAR HA SIDO DESACTIVADO 🖥️", null, 0xFF4500, "bold", 2);
    } else {
      room.sendAnnouncement("🖥️ EL VAR SE HA ACTIVADO 🖥️", null, 0x00FF99, "bold", 2);
      varInterval = setInterval(function() {
        room.sendAnnouncement("🖥️EL VAR ESTA REVISANDO UNA JUGADA 🔜 EN INSTANTES SE DIRA LA DECISION🖥️", null, 0xFFFF00, "bold", 2);
      }, 5000);
    }
    return;
  }

  if (cmd === "!stats") {
    var pStats = getPlayerStats(player);
    room.sendAnnouncement("📊 Goles: " + pStats.goals + " | Asistencias: " + pStats.assists + " | Goles en contra: " + pStats.ownGoals, player.id, 0x00FF99, "bold", 0);
    return;
  }

  if (cmd === "!help") {
    var base = "✨ Comandos: !help, !stats, !discord, !ig, !youtube, !twitch, !var, !nv, !bb ✨\n";
    room.sendAnnouncement(base, player.id, 0xFFFFFF, "normal", 0);
    return;
  }

  if (cmd === "!nv" || cmd === "!bb") {
    room.sendAnnouncement("👋 " + player.name + " tiró la de humo y se fue de la sala.", null, 0xFF4500, "normal", 1);
    room.kickPlayer(player.id, "¡Nos vemos!");
    return;
  }

  if (cmd === "!discord") {
    room.sendAnnouncement("📣 DISCORD: " + LINKS.discord, player.id, 0x7289DA, "bold", 0);
    return;
  }
  if (cmd === "!ig") {
    room.sendAnnouncement("📸 INSTAGRAM: " + LINKS.instagram, player.id, 0xE1306C, "bold", 0);
    return;
  }
  if (cmd === "!youtube") {
    room.sendAnnouncement("▶️ YOUTUBE: " + LINKS.youtube, player.id, 0xFF0000, "bold", 0);
    return;
  }
  if (cmd === "!twitch") {
    room.sendAnnouncement("🎮 TWITCH: " + LINKS.twitch, player.id, 0x6441A4, "bold", 0);
    return;
  }

  if (cmd === "!kick") {
    if (!isAdmin(player)) return;
    var target = findPlayerByName(arg);
    if (target) {
      room.kickPlayer(target.id, "Expulsado");
      room.sendAnnouncement("👢 " + target.name + " expulsado.", null, 0xFF4500, "bold", 0);
    }
    return;
  }

  room.sendAnnouncement("Comando no reconocido. Escribí !help", player.id, 0xFFFF00, "normal", 0);
}

room.onRoomLink = function(url) {
  room.sendAnnouncement("🎆 " + ROOM_NAME + " — Sala Oficial 🎆", null, 0x00FF99, "bold", 0);
};
