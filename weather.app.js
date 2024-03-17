if (settings.log) log("Running weather.app.js");
else Bangle.setLCDBrightness(0);
weatherIcons = { snow: dc("jEYgQWTl/4Aof+34ECgfQg/AAoMLoEB/9AgEfBAOr6AWBCoXwgXgAoV4gYaCgE4j+ABYd9FYWAnvwgOAjfgh/ggXAl/whYHB/ARBhYHB8kCoEPvoRBD4N9j/wgHg3/0gWgg34tQzChf8NghJDAAOQPY4"), rain: dc("jEYgQWTl/4Aof+34ECgfQg/AAoMLoEB/9AgEfBAOr6AWBCoXwgXgAoV4gYaCgE4j+ABYd9AYITBnvwAocPDgQCBhYCBnHjwELCIIFCh4dBAoV9j/+AoOP+kC1M4yeKGYU4gY4DAoskgReBAAoA=="), fog: dc("jEYgQURgfy/H830AgWh0motISH30/l+P4EAtMqjVKwAj/EZoARA="), wind: dc("jEYgQJGgWQAocf/gFDnsugP/oEA2kPg/r6EA2ELh8A+ASBh8tgF4jWq3ssgE4l//+kcBYIzE+ARBAAOr6ARBAAQvBAAgRC0AFBCIX9BwkfAgcQg+AAoU4gYFDnkLFAcf34XDg/4SSYA="), cloudy: dc("jEYgQWTl/4Aof+34ECgfQg/AAoMLoEB/9AgEfBAOr6AWBCoXwgXgAoV4gYaCgE4j+ABYd9GQc9+AFDh4cDGYIFFCIodEvsf/4AC+kC1QACGYYAUA"), storm: dc("jEYgQWTl/4Aof+34ECgfQg/AAoMLoEB/9AgEfBAOr6AWBCoXwgXgAoV4gYaCgE4j+ABYd9GQc9+ADBjVAh4cCn4zBAoW9AoIRC/kAh4dBgX0gF9j//6f/r/0gWqw2+jQzDnhsE2gFEyB7HA="), 'partly-cloudy-day': dc("jEYgUAgXABAUEAoMQAoMeAoM8AoMLz/5+gFBgX+3/DAoMB+EP44fBgfAn1B/9A1eACwOr6H/wPgCwPwgfL6AFBvEC/+AAoM4lH4IAV4vkwAoU9+BVDh4hCIwQFFCIt9Aod9j//AAX0gWqAAQ4CACoA=="), 'partly-cloudy-night': dc("jEYgUAgXQAQPAgEB+kYhfkCAP9lkP/AFB/wRE78QgOABAPLlonCg+Pj4KByFvj8D9MA//4vgDB4F/oHwgFC+Ef9Y7BgG0gX/AoU4ghPDnE+Aod82gFDjwhBAAUP8AFDhYLFC4s/1QAC/kL/4ACDggANA"), 'clear-day': dc("jEYgQEBgfABQYFJgQDCgeAgfwAoMPBIPwl/4h4IBgP//9AAoMH+kf6AUCwECDQUvAQP4AQM9AQN8gH8ngFBnk/AooRFDowpFGopBFJohZFMop9RA"), 'clear-night': dc("jEYgQMJgOAgEHoEAgXAgEvoHgh/4gH/gGQhfkgXfC4IRBg+OD4cPhwKBD4MOh8AgYoBjsLEoPwgEsg+AjfgAoMD4ARClkBB4IABjsAvopDgEf6EbgELoEC/5EBDgMAjW+LYIcCvgCBvxhBBAUf/X/F4ISB35jBACQA=="), };
var startDay = 0, plotDays = 2;
var plotOption = 0;
var plotW = 144, plotH = 50;
var x0 = 119 - plotW / 2;
var cDark = "#181820";
var unitGroups = { us: { temp: 'F', precip: '"', wind: 'MPH' }, uk: { temp: 'C', precip: 'mm', wind: 'MPH' }, metric: { temp: 'C', precip: 'mm', wind: 'KPH' } };
var plotGroups = [[["temperature", "humidity", "precipProb"],], [["temperature", "pressure", "windSpeed"],],];
function FixJSON() {
  //for only English Language
  let text = require('Storage').read('weather.json');
  if (/[^\x00-\x7F]/g.test(text)) {
    text = text.replace(/[^\x00-\x7F]/g, '');
    text = text.replace("undefined", '');
    require('Storage').write("weather.json", text);
  }
}
function exitWithError(msg) { Dickens.buttonIcons = [null, 'clock', null, null]; g.clear(1); Dickens.loadSurround(); g.setColor("#358").fillArc(-0.97, 0.97, 96).fillArc(Math.PI - 0.75, Math.PI + 0.75, 96); g.fillRect(37, 69, 201, 69).fillRect(51, 186, 187, 186); g.setColor("#FFF").setBgColor("#358").setFontAlign(0, 0).setColor(-1); g.setFontGrotesk16().drawString("Weather", 120, 55); g.setBgColor(0).drawCentredText("No weather data.\nEnable weather\nin mobile app")g.flip(); setTimeout(_ => Bangle.setLCDBrightness(1), 100); setTimeout(_ => load("clock.app.js"), 3500);[BTN1, BTN2, BTN3, BTN4].forEach(b => setWatch(_ => load("clock.app.js"), b, { edge: 1 })); }
try { if (settings.log) log("Loading weather data"); FixJSON(); var w = Dickens.loadWeather(); if (w == null || w.icon == null || w.icon.length == 0) { w = null; FixJSON(); exitWithError(); } else { var forecastDays = w.icon.length; var units = unitGroups[w.units || "us"]; var plotTypes = [{ data: "temperature", col: "#ff4", yTick: 5, unit: units.temp, scale: 0.1 }, { data: "pressure", col: "#66d", yTick: 10, unit: "mbar" }, { data: "humidity", col: "#f46", yTick: 100, unit: "%" }, { data: "precipProb", label: "Precipitation", col: "#4af", yTick: 100, unit: "%" }, { data: "windSpeed", label: "Wind speed", col: "#4a4", yTick: 20, unit: units.wind }, { data: "windGust", label: "Wind gusts", col: "#66f", yTick: 20, unit: units.wind },]; } } catch (e) { log("Error loading weather data: " + e); load('clock.app.js') }
var plots;
function preparePlots(shift) { if (shift > 0) { if (++plotOption >= plotGroups.length) plotOption = 0; } else if (shift < 0) { if (--plotOption < 0) plotOption = plotGroups.length - 1; } plots = []; for (var axis = 0; axis < plotGroups[plotOption].length; axis++) { plots[axis] = []; for (var series = 0; series < plotGroups[plotOption][axis].length; series++) { var p = plotTypes.find(d => d.data == plotGroups[plotOption][axis][series]); var min = Math.floor(Math.min.apply(Math, w[p.data]) / p.yTick) * p.yTick; var max = Math.ceil(Math.max.apply(Math, w[p.data]) / p.yTick) * p.yTick; if (max == 0) max = p.yTick; plots[axis][series] = { poly: new Float32Array(plotDays * 24 * 2), dataType: p.data, colour: p.col, label: p.label ? p.label : p.data, unit: p.unit, scale: p.scale || 1, min: min, max: max, }; for (var h = 0; h < plotDays * 24; h++) { plots[axis][series].poly[h * 2] = x0 + (h / plotDays / 24) * plotW + 1; } } } }
function plotWeather(shift) { Dickens.buttonIcons = ['chart', 'clock', 'down', 'up']; if (shift > 0 && (startDay + plotDays) < forecastDays) { startDay++; } else if (shift < 0 && startDay > 0) { startDay--; } if (startDay == 0) Dickens.buttonIcons[3] = null; if ((startDay + plotDays) == forecastDays) Dickens.buttonIcons[2] = null; Dickens.loadSurround(); var startHr = startDay * 24; var endHr = (startDay + plotDays) * 24; var loc = w.locality.toUpperCase(); if (loc.length > 12) loc = loc.slice(0, 12); var axisH = plotH / plots.length; for (var axis = 0; axis < plots.length; axis++) { var y0 = 115 + (axisH + 20) * (axis - plots.length / 2); var p = plots[axis][0]; var xC, day; var now = new Date(); g.setColor(0).fillRect(x0, y0, x0 + plotW, y0 + axisH); g.setColor(cDark).fillRect(x0, y0 - 12, x0 + plotW, y0 - 1); g.fillArc(Math.PI - 1.33, Math.PI + 1.33, 94); g.setFontArchitekt10().setFontAlign(0, 0).setBgColor(cDark); g.setColor(-1).drawString(loc, 119, 37); for (day = 0; day < plotDays; day++) { d = new Date((w.timestamp + (startDay + day) * 24 * 3600) * 1000); var dayName = "SUNDAY,MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY".split(",")[d.getDay()]; if (d.getDate() == now.getDate()) { var hr = now.getHours() + now.getMinutes() / 60; var xT = (day + hr / 24) * plotW / plotDays + x0; g.setColor("#CCC").drawLine(xT, y0, xT, y0 + axisH); } g.setColor("#555").drawLine(p.poly[day * 48], y0, p.poly[day * 48], y0 + axisH); g.setColor("#222").drawLine(p.poly[day * 48 + 24], y0, p.poly[day * 48 + 24], y0 + axisH); xC = x0 + plotW / plotDays * (day + 0.5); g.setColor("#aaa").drawString(dayName, xC, y0 - 6); if (w.icon[startDay + day] in weatherIcons) { g.drawImage(weatherIcons[w.icon[startDay + day]], xC - 12, y0 - 36); } } for (var series = 0; series < plots[axis].length; series++) { p = plots[axis][series]; var scale = plotH / plots.length / (p.max - p.min); var values = w[p.dataType].slice(startHr, endHr); values.forEach((v, i) => { p.poly[i * 2 + 1] = y0 + (p.max - v) * scale; }); g.setColor(p.colour).drawPolyAA(p.poly); g.drawString(p.label.toUpperCase() + " (" + p.unit.toUpperCase() + ")", x0 + plotW / 2, y0 + axisH + series * 20 + 8); for (day = 0; day < plotDays; day++) { var dayValues = values.slice(day * 24, (day + 1) * 24); var min = Math.round(Math.min.apply(Math, dayValues) * p.scale); var max = Math.round(Math.max.apply(Math, dayValues) * p.scale); var sep = (min < 0) ? " - " : "-"; if ((min < 0) && (max > 0)) max = "+" + max; xC = x0 + plotW / plotDays * (day + 0.5); if (day == 0) xC += 5; else if (day == plotDays - 1) xC -= 5; g.drawString(min + sep + max, xC, y0 + axisH + series * 20 + 17); } } g.setColor("#444").drawRect(x0, y0 - 1, x0 + plotW, y0 + axisH + 1); g.setColor("#555").drawLine(x0 + plotW - 1, y0, x0 + plotW - 1, y0 + axisH); } }
function runWeather() { Dickens.buttonIcons = ['chart', 'clock', 'down', 'up']; g.clear(); Dickens.showSeconds(1); g.setColor(cDark).fillCircleAA(119, 119, 95); g.flip(); setTimeout(_ => Bangle.setLCDBrightness(settings.brightness), 10); preparePlots(); plotWeather(); g.flip(); setWatch(_ => { plotWeather(-1); }, BTN4, { edge: 1, repeat: 1 }); setWatch(_ => { plotWeather(1); }, BTN3, { edge: 1, repeat: 1 }); setWatch(_ => { preparePlots(1); plotWeather(); }, BTN1, { edge: 1, repeat: 1 }); setWatch(_ => load("clock.app.js"), BTN2, { edge: 1 }); }
if (w) runWeather();