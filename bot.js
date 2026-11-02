const puppeteer = require('puppeteer');

async function runBot() {
    console.log("Iniciando el bot de EspnHaxball...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Ir a la página de Haxball Headless
    await page.goto('https://www.haxball.com/headless', { waitUntil: 'networkidle2' });

    // Inyectamos todo tu código directamente dentro de la página de Haxball
    await page.evaluate(() => {
        // ---------- Config ----------
// ====================================================================
// ⚽⚽ SCRIPT ESPORTS ESPN HAXBALL - PRO EDITION ⚽⚽
// ====================================================================

// ---------- CONFIGURACIÓN PRINCIPAL ----------
var ROOM_NAME = "⚽⚽JUEGAN TODOS EN ESPN HAXBALL⚽⚽";
var room = HBInit({
  roomName: ROOM_NAME,
  maxPlayers: 30,
  public: true,
  token: "thr1.AAAAAGm0mLpJjwE0XF7RJw.5Hkzo2VV-nU" // Asegúrate de actualizar el token si expira
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

// ---------- ESTADOS GLOBALES ----------
var ownerId = null;
var admins = {};
var autojoinEnabled = true;
var autoStartEnabled = true;
var hiddenHost = {};

// Estado del VAR
var varInterval = null;

// Visuales
var EMOJI_OWNER = "👑";
var EMOJI_ADMIN = "🔷";
var EMOJI_RED = "🔴";
var EMOJI_BLUE = "🔵";
var COLOR_ADMIN = 0x00E5FF; 
var COLOR_OWNER = 0xFFD700;
var COLOR_GOAL = 0x00FF66;
var COLOR_OWN_GOAL = 0xFF3333;

// ---------- RASTREO DE PELOTA Y ESTADÍSTICAS DE GOL ----------
var lastTouchPlayer = null;
var secondLastTouchPlayer = null;
var matchStats = {}; // { playerId: { goals: 0, assists: 0, ownGoals: 0, name: "" } }

// ---------- FRASES DIVERTIDAS (!memide) ----------
var MEMIDE_MESSAGES = [
  "¡Increíble, eso es casi un alfiler! 😂",
  "Pequeñito pero con actitud. 😏",
  "Tamaño de bolsillo, pero con estilo. 😅",
  "Suficiente para impresionar a una hormiga. 🐜",
  "Compacto y decidido. 💪",
  "Ni tan grande ni tan chico, equilibrio perfecto. ⚖️",
  "Se defiende, no te preocupes. 😉",
  "Buen promedio, aprobado. ✅",
  "Casi en la zona de respeto. 👀",
  "Diez centímetros de pura confianza. 🔥",
  "Once y subiendo, cuidado. 😎",
  "Doce: nivel competitivo. 🏆",
  "Trece: la suerte te acompaña. 🍀",
  "Catorce: ya se nota. 👏",
  "Quince: mitad de camino al mito. 🧭",
  "Dieciséis: elegante y firme. ✨",
  "Diecisiete: digno de mención. 📝",
  "Dieciocho: wow, aplausos. 👏👏",
  "Diecinueve: casi leyenda. 🏅",
  "Veinte: nivel pro. 🚀",
  "Veintiuno: impresionante. 💥",
  "Veintidós: ya es para contar historias. 📖",
  "Veintitrés: respeto ganado. 🙌",
  "Veinticuatro: sobresaliente. 🌟",
  "Veinticinco: mito urbano. 🐉",
  "Veintiséis: épico. ⚔️",
  "Veintisiete: leyenda en formación. 🛡️",
  "Veintiocho: historia para el chat. 🗣️",
  "Veintinueve: casi inalcanzable. 🏔️",
  "Treinta: nivel dios. 👑"
];

// ---------- FUNCIONES DE UTILIDAD ----------
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

function getPlayerStats(player) {
  if (!matchStats[player.id]) {
    matchStats[player.id] = { goals: 0, assists: 0, ownGoals: 0, name: player.name };
  }
  return matchStats[player.id];
}

function resetAllStats() {
  matchStats = {};
  lastTouchPlayer = null;
  secondLastTouchPlayer = null;
}

// ---------- MENSAJE DE BIENVENIDA ----------
function welcomePlayer(player) {
  if (hiddenHost[player.id]) return;
  var circle = teamEmoji(player.team);
  var header = fancyLine("═", 42);
  var msg = header + "\n";
  msg += "🎉 ¡BIENVENIDO A " + ROOM_NAME + "! 🎉\n";
  msg += "👤 Jugador: " + player.name + " (" + circle + ")\n";
  msg += "📌 Escribe !help para ver la lista de comandos.\n";
  msg += "📺 Transmisión oficial en vivo por ESPN Haxball\n";
  msg += header;
  room.sendAnnouncement(msg, player.id, 0xFFD700, "bold", 0);
}

// ---------- EVENTOS DE LA SALA ----------

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
  room.sendAnnouncement("🔁 " + player.name + " ahora está en " + (player.team === 1 ? "RED " + EMOJI_RED : player.team === 2 ? "BLUE " + EMOJI_BLUE : "ESPECTADOR ⚪"), null, 0xFFFFFF, "normal", 0);
};

room.onGameStart = function(byPlayer) {
  resetAllStats();
  room.sendAnnouncement("⚽ ¡ARRANCA EL PARTIDO EN ESPN HAXBALL! ¡MUCHA SUERTE A AMBOS EQUIPOS! ⚽", null, 0x00FF00, "bold", 1);
};

room.onGameStop = function(byPlayer) {
  if (autoStartEnabled) {
    room.sendAnnouncement("⏱️ Autostart: El próximo partido arranca en 3 segundos...", null, 0x00FF99, "bold", 1);
    setTimeout(function() {
      room.startGame();
    }, 3000);
  }
};

// ---------- DETECCION DE DRIBLES Y TOQUES DE PELOTA ----------
room.onPlayerBallKick = function(player) {
  if (!lastTouchPlayer || lastTouchPlayer.id !== player.id) {
    secondLastTouchPlayer = lastTouchPlayer;
    lastTouchPlayer = player;
  }
};

// ---------- DETECCION PRINCIPAL DE GOLES Y ASISTENCIAS ----------
room.onTeamGoal = function(team) {
  var scores = room.getScores();
  var scoreText = scores ? (scores.red + " - " + scores.blue) : "0 - 0";
  var timeStr = getFormattedMatchTime();

  if (!lastTouchPlayer) {
    // Si la pelota entra sin registro previo de toque directo
    room.sendAnnouncement("⚽ " + timeStr + " ¡GOOOOOOOOOOOOOOOL! El partido está [" + scoreText + "]", null, COLOR_GOAL, "bold", 2);
    return;
  }

  // Verificar si es Gol Normal o Gol en Contra
  if (lastTouchPlayer.team === team) {
    // GOL NORMAL
    var scorerStats = getPlayerStats(lastTouchPlayer);
    scorerStats.goals++;

    var assistText = "Sin asistencia";
    if (secondLastTouchPlayer && secondLastTouchPlayer.id !== lastTouchPlayer.id && secondLastTouchPlayer.team === team) {
      var assistStats = getPlayerStats(secondLastTouchPlayer);
      assistStats.assists++;
      assistText = secondLastTouchPlayer.name;
    }

    var goalMsg = timeStr + " ¡GOOOOOOOOOOOOOOOL! DE " + lastTouchPlayer.name.toUpperCase() + " ADELANTA EL PARTIDO [" + scoreText + "] Asiste " + assistText;
    room.sendAnnouncement("⚽ " + goalMsg, null, COLOR_GOAL, "bold", 2);

    // Racha especial de goles
    if (scorerStats.goals === 2) {
      room.sendAnnouncement("🔥 ¡DOBLETE DE " + lastTouchPlayer.name + "! ¡Está encendido!", null, 0xFF9900, "bold", 1);
    } else if (scorerStats.goals === 3) {
      room.sendAnnouncement("🎩 ¡HAT-TRICK DE " + lastTouchPlayer.name + "! ¡SE LLEVA LA PELOTA A CASA!", null, 0xFFFF00, "bold", 2);
    } else if (scorerStats.goals >= 4) {
      room.sendAnnouncement("👑 ¡PÓKER DE GOLES! " + lastTouchPlayer.name + " ES UNA BESTIA TOTAL.", null, 0xFF00FF, "bold", 2);
    }

  } else {
    // GOL EN CONTRA (OWN GOAL)
    var ownGoalStats = getPlayerStats(lastTouchPlayer);
    ownGoalStats.ownGoals++;

    var ownGoalMsg = timeStr + " GOOOL.. EN CONTRA.. " + lastTouchPlayer.name + " se hizo gol en contra y el partido esta [" + scoreText + "]";
    room.sendAnnouncement("🙈 " + ownGoalMsg, null, COLOR_OWN_GOAL, "bold", 2);
  }

  // Limpiar últimos toques para el saque del centro
  lastTouchPlayer = null;
  secondLastTouchPlayer = null;
};

// ---------- EVENTO VICTORIA / MVP DE ESPN ----------
room.onTeamVictory = function(scores) {
  var winnerTeamStr = scores.red > scores.blue ? "RED " + EMOJI_RED : "BLUE " + EMOJI_BLUE;
  var finalScore = scores.red + " - " + scores.blue;

  var header = fancyLine("★", 45);
  var msg = header + "\n";
  msg += "🏆 ¡FINAL DEL PARTIDO! GANADOR: EQUIPO " + winnerTeamStr + " 🏆\n";
  msg += "📊 Marcador Final: " + finalScore + "\n";

  // Encontrar Jugador Más Valioso (MVP) -> (Goles * 3) + (Asistencias * 2) - (GolesEnContra * 2)
  var bestPlayer = null;
  var maxPoints = -99;

  for (var id in matchStats) {
    var pStats = matchStats[id];
    var pts = (pStats.goals * 3) + (pStats.assists * 2) - (pStats.ownGoals * 2);
    if (pts > maxPoints && pts > 0) {
      maxPoints = pts;
      bestPlayer = pStats;
    }
  }

  if (bestPlayer) {
    msg += "🏆 EL MVP PRESENTADO POR HAXFLASH - CREADOR DE TORNEOS DE HAXBALL: MVP DEL PARTIDO ES " + bestPlayer.name.toUpperCase() + " 🏆\n";
  }

  msg += header;
  room.sendAnnouncement(msg, null, 0xFFD700, "bold", 1);
};

// ---------- CHAT Y SISTEMA DE COMANDOS ----------
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
    displayName = EMOJI_OWNER + " [OWNER] " + player.name;
    color = COLOR_OWNER;
  } else if (isAdmin(player)) {
    displayName = EMOJI_ADMIN + " [ADMIN] " + player.name;
    color = COLOR_ADMIN;
  }

  var circle = teamEmoji(player.team);
  var formatted = "💬 " + displayName + " (" + circle + "): " + msg;
  room.sendAnnouncement(formatted, null, color, "normal", 1);
  return false;
};

// Handler de Comandos
function handleCommand(player, msg) {
  var parts = msg.split(" ");
  var cmd = parts[0].toLowerCase();
  var arg = parts.slice(1).join(" ").trim();

  // ----- AUTENTICACIÓN -----
  if (cmd === "!admin") {
    if (arg === ADMIN_PASS) {
      admins[player.id] = true;
      room.setPlayerAdmin(player.id, true);
      room.sendAnnouncement(EMOJI_ADMIN + " ADMIN | " + player.name + " ahora tiene permisos de Admin.", null, COLOR_ADMIN, "bold", 0);
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
      room.sendAnnouncement(EMOJI_OWNER + " OWNER | " + player.name + " ha iniciado sesión como Owner.", null, COLOR_OWNER, "bold", 0);
    } else {
      room.sendAnnouncement("🔒 Contraseña OWNER incorrecta.", player.id, 0xFF0000, "normal", 0);
    }
    return;
  }

  // ----- AYUDA Y REDES -----
  if (cmd === "!help" || cmd === "!comandos") {
    var base = "✨ ESPN HAXBALL - COMANDOS ✨\n";
    base += "• !help / !stats / !tiempo / !afk\n";
    base += "• Redes: !discord / !ig / !yt / !twitch\n";
    base += "• Diversión: !meme / !memide <nombre> / !8ball / !slap / !hug\n";
    base += "• Salir: !nv o !bb\n";
    base += "• Admin: !admin <pass> | Owner: !owner <pass>\n";
    if (isAdmin(player)) {
      base += "\n🔐 COMANDOS DE ADMIN 🔐\n";
      base += "• !var (Activa/Desactiva el anuncio del VAR cada 5s)\n";
      base += "• !autojoin on/off | !autostart on/off\n";
      base += "• !rr (Reiniciar) | !swap (Cambiar lados) | !balanceo\n";
      base += "• !kick <nombre> | !resetstats\n";
    }
    room.sendAnnouncement(base, player.id, 0x00E5FF, "normal", 0);
    return;
  }

  // ----- SISTEMA DE VAR -----
  if (cmd === "!var") {
    if (!isAdmin(player)) {
      room.sendAnnouncement("❌ Solo admins o el owner pueden usar el !var", player.id, 0xFF0000, "bold", 0);
      return;
    }

    if (varInterval === null) {
      // Activar VAR
      room.sendAnnouncement("🖥️ EL VAR ESTA REVISANDO UNA JUGADA 🔜 EN INSTANTES SE DIRA LA DECISION🖥️", null, 0xFFFF00, "bold", 2);
      varInterval = setInterval(function() {
        room.sendAnnouncement("🖥️ EL VAR ESTA REVISANDO UNA JUGADA 🔜 EN INSTANTES SE DIRA LA DECISION🖥️", null, 0xFFFF00, "bold", 2);
      }, 5000);
      room.sendAnnouncement("✅ VAR activado por " + player.name + ". (Usa !var de nuevo para desactivar)", player.id, 0x00FF00, "normal", 0);
    } else {
      // Desactivar VAR
      clearInterval(varInterval);
      varInterval = null;
      room.sendAnnouncement("✅ El VAR ha finalizado la revisión.", null, 0x00FF00, "bold", 1);
    }
    return;
  }

  if (cmd === "!stats") {
    var pStats = getPlayerStats(player);
    var info = "📊 Tus Estadísticas: Goles: " + pStats.goals + " | Asistencias: " + pStats.assists + " | Goles en contra: " + pStats.ownGoals;
    room.sendAnnouncement(info, player.id, 0x00FF99, "bold", 0);
    return;
  }

  if (cmd === "!tiempo" || cmd === "!time") {
    var t = getFormattedMatchTime();
    room.sendAnnouncement("⏱️ Tiempo de juego transcurrido: " + t, player.id, 0xFFFF00, "normal", 0);
    return;
  }

  if (cmd === "!afk") {
    room.setPlayerTeam(player.id, 0);
    room.sendAnnouncement("💤 " + player.name + " se ha puesto en modo AFK (Espectador).", null, 0xAAAAAA, "normal", 0);
    return;
  }

  if (cmd === "!discord") {
    room.sendAnnouncement("📣 DISCORD: " + LINKS.discord, player.id, 0x7289DA, "bold", 0);
    return;
  }
  if (cmd === "!ig" || cmd === "!instagram") {
    room.sendAnnouncement("📸 INSTAGRAM: " + LINKS.instagram, player.id, 0xE1306C, "bold", 0);
    return;
  }
  if (cmd === "!youtube" || cmd === "!yt") {
    room.sendAnnouncement("▶️ YOUTUBE: " + LINKS.youtube, player.id, 0xFF0000, "bold", 0);
    return;
  }
  if (cmd === "!twitch") {
    room.sendAnnouncement("🎮 TWITCH: " + LINKS.twitch, player.id, 0x6441A4, "bold", 0);
    return;
  }

  if (cmd === "!nv" || cmd === "!bb") {
    room.sendAnnouncement("👋 " + player.name + " tiró la de humo y se fue de la sala.", null, 0xFF4500, "normal", 1);
    room.kickPlayer(player.id, "¡Nos vemos! Gracias por jugar en ESPN.");
    return;
  }

  // ----- DIVERSIÓN -----
  if (cmd === "!meme") {
    var memes = [
      "¡Ese remate terminó en la tribuna! 😂",
      "Pase al pie... pero del rival 🤦‍♂️",
      "Modo Messi activado 🔥",
      "¡Qué atajada histórica! 🧤",
      "Eso no fue falta, ¡fue un tackle de rugby! 🏈"
    ];
    var pick = memes[Math.floor(Math.random() * memes.length)];
    room.sendAnnouncement("🎭 MEME: " + pick, player.id, 0xFFFFFF, "normal", 0);
    return;
  }

  if (cmd === "!memide") {
    var target = findPlayerByName(arg) || player;
    var size = Math.floor(Math.random() * 30) + 1;
    var msgIndex = Math.max(0, Math.min(29, size - 1));
    var custom = MEMIDE_MESSAGES[msgIndex];
    var out = "📏 A @" + target.name + " le mide " + size + " Cm — " + custom;
    room.sendAnnouncement(out, null, 0xFF69B4, "bold", 0);
    return;
  }

  if (cmd === "!8ball") {
    var answers = ["Sí, totalmente", "No lo creo", "Tal vez en otra vida", "Definitivamente sí", "No cuentes con ello", "100% Seguro"];
    room.sendAnnouncement("🔮 8Ball: " + answers[Math.floor(Math.random() * answers.length)], player.id, 0x8A2BE2, "normal", 0);
    return;
  }

  if (cmd === "!slap") {
    var target = findPlayerByName(arg);
    if (!target) {
      room.sendAnnouncement("Uso: !slap <nombre>", player.id, 0xFFFF00, "normal", 0);
      return;
    }
    room.sendAnnouncement("👋 " + player.name + " le metió un cachetazo peloteril a " + target.name + "!", null, 0xFFFFFF, "normal", 0);
    return;
  }

  if (cmd === "!hug") {
    var target = findPlayerByName(arg) || player;
    room.sendAnnouncement("🤗 " + player.name + " le da un abrazo a " + target.name + " — ¡Fútbol en paz!", null, 0xFFDAB9, "normal", 0);
    return;
  }

  // ----- COMANDOS ADMINISTRATIVOS -----
  if (cmd === "!autostart") {
    if (!isAdmin(player)) return;
    if (arg === "on") {
      autoStartEnabled = true;
      room.sendAnnouncement("✅ Autostart ACTIVADO por " + player.name, null, 0x00FF00, "bold", 1);
    } else if (arg === "off") {
      autoStartEnabled = false;
      room.sendAnnouncement("⛔ Autostart DESACTIVADO por " + player.name, null, 0xFF4500, "bold", 1);
    } else {
      room.sendAnnouncement("Uso: !autostart on / !autostart off", player.id, 0xFFFF00, "normal", 0);
    }
    return;
  }

  if (cmd === "!autojoin") {
    if (!isAdmin(player)) return;
    if (arg === "on") {
      autojoinEnabled = true;
      room.sendAnnouncement("✅ Autojoin ACTIVADO por " + player.name, null, 0x00FF00, "bold", 0);
    } else if (arg === "off") {
      autojoinEnabled = false;
      room.sendAnnouncement("⛔ Autojoin DESACTIVADO por " + player.name, null, 0xFF4500, "bold", 0);
    } else {
      room.sendAnnouncement("Uso: !autojoin on / !autojoin off", player.id, 0xFFFF00, "normal", 0);
    }
    return;
  }

  if (cmd === "!kick") {
    if (!isAdmin(player)) return;
    if (!arg) {
      room.sendAnnouncement("Uso: !kick <nombre>", player.id, 0xFFFF00, "normal", 0);
      return;
    }
    var target = findPlayerByName(arg);
    if (target) {
      room.kickPlayer(target.id, "Expulsado por admin: " + player.name);
      room.sendAnnouncement("👢 " + target.name + " fue expulsado por " + player.name, null, 0xFF4500, "bold", 0);
    } else {
      room.sendAnnouncement("Jugador no encontrado: " + arg, player.id, 0xFFFF00, "normal", 0);
    }
    return;
  }

  if (cmd === "!rr") {
    if (!isAdmin(player)) return;
    room.stopGame();
    setTimeout(function() {
      room.startGame();
      room.sendAnnouncement("🔁 Partida reiniciada por " + player.name, null, 0x00FF00, "bold", 0);
    }, 500);
    return;
  }

  if (cmd === "!swap") {
    if (!isAdmin(player)) return;
    var players = room.getPlayerList();
    for (var i = 0; i < players.length; i++) {
      if (players[i].team === 1) room.setPlayerTeam(players[i].id, 2);
      else if (players[i].team === 2) room.setPlayerTeam(players[i].id, 1);
    }
    room.sendAnnouncement("🔄 Equipos intercambiados por " + player.name, null, 0x00FFFF, "bold", 0);
    return;
  }

  if (cmd === "!balanceo") {
    if (!isAdmin(player)) return;
    var players = room.getPlayerList().filter(function(p){ return p.team !== 0 && !hiddenHost[p.id]; });
    var all = players.slice();
    shuffleArray(all);
    for (var i = 0; i < all.length; i++) {
      var team = (i % 2 === 0) ? 1 : 2;
      room.setPlayerTeam(all[i].id, team);
    }
    room.sendAnnouncement("🔀 Equipos mezclados por " + player.name, null, 0x00FFFF, "bold", 0);
    return;
  }

  if (cmd === "!resetstats") {
    if (!isAdmin(player)) return;
    resetAllStats();
    room.sendAnnouncement("🧹 Estadísticas de goles reiniciadas por " + player.name, null, 0xFFFF00, "bold", 0);
    return;
  }

  room.sendAnnouncement("❓ Comando desconocido. Usa !help para ver la lista.", player.id, 0xFFFF00, "normal", 0);
}

// ----- EVENTO SALA CONECTADA -----
room.onRoomLink = function(url) {
  var header = fancyLine("═", 50);
  var welcome = header + "\n";
  welcome += "🎆 " + ROOM_NAME + " — SALA EN VIVO 🎆\n";
  welcome += "Comandos principales: !help\n";
  welcome += "Links de nuestras plataformas:\n";
  welcome += "• Kick: " + LINKS.kick + "\n";
  welcome += "• Twitch: " + LINKS.twitch + "\n";
  welcome += "• YouTube: " + LINKS.youtube + "\n";
  welcome += "• Instagram: " + LINKS.instagram + "\n";
  welcome += "• Discord: " + LINKS.discord + "\n";
  welcome += header;
  room.sendAnnouncement(welcome, null, 0x00FF99, "bold", 0);
};

    console.log("¡Sala creada y script unificado a pleno!");
}

runBot();