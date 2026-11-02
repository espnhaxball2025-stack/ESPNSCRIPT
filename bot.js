const puppeteer = require('puppeteer');

async function runBot() {
    console.log("Iniciando el bot de EspnHaxball...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    });
    
    const page = await browser.newPage();
    
    console.log("Entrando a Haxball Headless...");
    await page.goto('https://www.haxball.com/headless', { waitUntil: 'networkidle2' });

    // Inyectamos todo tu código directamente dentro de la página de Haxball
    await page.evaluate(() => {
        // ---------- Config ----------
        var ROOM_NAME = "⚽⚽JUEGAN TODOS EN ESPN HAXBALL⚽⚽";
        var room = HBInit({
          roomName: ROOM_NAME,
          maxPlayers: 30,
          public: true,
          token: "thr1.AAAAAGm0mLpJjwE0XF7RJw.5Hkzo2VV-nU"
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

        // Estado del VAR
        var varInterval = null;

        // Emojis y colores
        var EMOJI_OWNER = "👑";
        var EMOJI_ADMIN = "🔷";
        var EMOJI_RED = "🔴";
        var EMOJI_BLUE = "🔵";
        var COLOR_ADMIN = 0x00E5FF; 
        var COLOR_OWNER = 0xFFD700;
        var COLOR_GOAL = 0x00FF66;
        var COLOR_OWN_GOAL = 0xFF3333;

        // Variables para Seguimiento de Goles, Asistencias y VAR
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

        // ---------- Utilidades ----------
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

        // ---------- Bienvenida ----------
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

        // ---------- Eventos ----------
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
