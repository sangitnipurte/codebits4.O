
// ──────────────────────────────────────────────
// RAIN ANIMATION
// ──────────────────────────────────────────────
const rc = document.getElementById('rainContainer');
for (let i = 0; i < 60; i++) {
  const d = document.createElement('div');
  d.className = 'raindrop';
  d.style.left = Math.random() * 100 + 'vw';
  d.style.height = (40 + Math.random() * 80) + 'px';
  d.style.animationDuration = (0.6 + Math.random() * 1.2) + 's';
  d.style.animationDelay = (-Math.random() * 2) + 's';
  d.style.opacity = 0.3 + Math.random() * 0.7;
  rc.appendChild(d);
}

// ──────────────────────────────────────────────
// MOCK SIMULATION (mirrors your backend logic)
// ──────────────────────────────────────────────
const DRAIN_OVERLOAD_PROB = { none:0.01, light:0.08, moderate:0.35, heavy:0.65, extreme:0.85 };
const ROAD_FLOOD_PROB = { true:0.70, false:0.02 };
const TRAFFIC_CONGESTION_PROB = { true:0.75, false:0.18 };
const EMERGENCY_DELAY_PROB = { true:0.60, false:0.08 };
const RAIN_LEVELS = ['none','light','moderate','heavy','extreme'];

const CITY_SCENARIOS = {
  Pune:      [{ main:'Rain', description:'moderate rain', rain_level:'moderate' }, { main:'Clear', description:'clear sky', rain_level:'none' }, { main:'Rain', description:'heavy intensity rain', rain_level:'heavy' }, { main:'Haze', description:'haze', rain_level:'none' }],
  Mumbai:    [{ main:'Rain', description:'heavy intensity rain', rain_level:'heavy' }, { main:'Thunderstorm', description:'thunderstorm with heavy rain', rain_level:'extreme' }, { main:'Drizzle', description:'drizzle', rain_level:'light' }, { main:'Humidity', description:'humid and muggy', rain_level:'none' }],
  Delhi:     [{ main:'Clear', description:'clear sky', rain_level:'none' }, { main:'Haze', description:'haze', rain_level:'none' }, { main:'Rain', description:'light rain', rain_level:'light' }, { main:'Humidity', description:'humid conditions', rain_level:'none' }],
  Bengaluru: [{ main:'Rain', description:'light intensity shower rain', rain_level:'light' }, { main:'Clear', description:'clear sky', rain_level:'none' }, { main:'Thunderstorm', description:'thunderstorm with rain', rain_level:'heavy' }, { main:'Humidity', description:'humid and warm', rain_level:'none' }],
  Chennai:   [{ main:'Rain', description:'heavy intensity rain', rain_level:'heavy' }, { main:'Thunderstorm', description:'thunderstorm with heavy rain', rain_level:'extreme' }, { main:'Humidity', description:'high humidity coastal', rain_level:'none' }, { main:'Clear', description:'clear sky', rain_level:'none' }],
  Hyderabad: [{ main:'Rain', description:'moderate rain', rain_level:'moderate' }, { main:'Clear', description:'clear sky', rain_level:'none' }, { main:'Haze', description:'haze', rain_level:'none' }, { main:'Thunderstorm', description:'thunderstorm with rain', rain_level:'heavy' }],
  Kolkata:   [{ main:'Rain', description:'heavy intensity rain', rain_level:'heavy' }, { main:'Thunderstorm', description:'thunderstorm with heavy rain', rain_level:'extreme' }, { main:'Humidity', description:'humid and muggy', rain_level:'none' }, { main:'Haze', description:'haze', rain_level:'none' }],
  Ahmedabad: [{ main:'Clear', description:'clear sky', rain_level:'none' }, { main:'Haze', description:'haze', rain_level:'none' }, { main:'Rain', description:'light rain', rain_level:'light' }, { main:'Humidity', description:'humid conditions', rain_level:'none' }],
  Nagpur:    [{ main:'Rain', description:'moderate rain', rain_level:'moderate' }, { main:'Thunderstorm', description:'thunderstorm with rain', rain_level:'heavy' }, { main:'Clear', description:'clear sky', rain_level:'none' }, { main:'Haze', description:'haze', rain_level:'none' }],
  Surat:     [{ main:'Rain', description:'heavy intensity rain', rain_level:'heavy' }, { main:'Humidity', description:'coastal humidity', rain_level:'none' }, { main:'Thunderstorm', description:'thunderstorm with rain', rain_level:'heavy' }, { main:'Clear', description:'clear sky', rain_level:'none' }],
};

function simulate(rain_level, runs = 10000) {
  let drain = 0, flood = 0, traffic = 0, delay = 0;
  for (let i = 0; i < runs; i++) {
    const drainOverload = Math.random() < DRAIN_OVERLOAD_PROB[rain_level];
    if (drainOverload) drain++;
    const roadFlood = Math.random() < (drainOverload ? ROAD_FLOOD_PROB.true : ROAD_FLOOD_PROB.false);
    if (roadFlood) flood++;
    const trafficJam = Math.random() < (roadFlood ? TRAFFIC_CONGESTION_PROB.true : TRAFFIC_CONGESTION_PROB.false);
    if (trafficJam) traffic++;
    const emergencyDelay = Math.random() < (trafficJam ? EMERGENCY_DELAY_PROB.true : EMERGENCY_DELAY_PROB.false);
    if (emergencyDelay) delay++;
  }
  return {
    drain_overload: drain / runs,
    road_flooding: flood / runs,
    traffic_congestion: traffic / runs,
    emergency_delay: delay / runs
  };
}

function riskLabel(p) {
  if (p < 0.2) return 'low';
  if (p < 0.5) return 'moderate';
  if (p < 0.75) return 'high';
  return 'critical';
}

function pct(v) { return (v * 100).toFixed(1) + '%'; }

// ──────────────────────────────────────────────
// CHARTS
// ──────────────────────────────────────────────
let pieChart, lineChart;

const COLORS = {
  drain: '#2563eb',
  flood: '#d97706',
  traffic: '#ea580c',
  emergency: '#dc2626',
};

function initCharts() {
  const co = { responsive: true, maintainAspectRatio: false };

  // PIE
  pieChart = new Chart(document.getElementById('pieChart'), {
    type: 'doughnut',
    data: {
      labels: ['Drain Overload', 'Road Flooding', 'Traffic Congestion', 'Emergency Delay'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: [COLORS.drain + 'cc', COLORS.flood + 'cc', COLORS.traffic + 'cc', COLORS.emergency + 'cc'],
        borderColor: [COLORS.drain, COLORS.flood, COLORS.traffic, COLORS.emergency],
        borderWidth: 2,
        hoverOffset: 12
      }]
    },
    options: {
      ...co,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#475569', font: { family: 'DM Mono', size: 11 }, padding: 14, boxWidth: 12 }
        },
        tooltip: { callbacks: { label: ctx => ` ${(ctx.parsed * 100).toFixed(1)}%` } }
      }
    }
  });

  // LINE — starts empty, updated dynamically per weather type
  lineChart = new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels: ['—','—','—','—','—'],
      datasets: []
    },
    options: {
      ...co,
      scales: {
        y: {
          beginAtZero: true, max: 100,
          ticks: { color: '#94a3b8', callback: v => v + '%', font: { family: 'DM Mono', size: 10 } },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        x: { ticks: { color: '#94a3b8', font: { family: 'DM Mono', size: 11 } }, grid: { display: false } }
      },
      plugins: {
        legend: { labels: { color: '#475569', font: { family: 'DM Mono', size: 11 }, padding: 16, boxWidth: 14 } }
      }
    }
  });
}

// ──────────────────────────────────────────────
// DYNAMIC FLOW CHAIN DEFINITIONS
// ──────────────────────────────────────────────
function getWeatherType(main) {
  if (main === 'Thunderstorm') return 'thunderstorm';
  if (main === 'Rain' || main === 'Drizzle') return 'rain';
  if (main === 'Humidity') return 'humidity';
  if (main === 'Haze' || main === 'Smoke' || main === 'Dust' || main === 'Sand') return 'haze';
  return 'clear'; // Clear, Clouds, etc.
}

const FLOW_CHAINS = {
  rain: {
    subtitle: 'Rain detected → Flooding & traffic risk propagation',
    badge: '🌧️ RAIN',
    pieTitle: 'Rain Risk Distribution',
    pieSub: 'Probability breakdown across rain chain events',
    lineTitle: 'Risk Escalation Across Rain Intensities',
    lineSub: 'Simulated probability at each rain level (none → extreme)',
    lineLabels: ['No Rain','Light','Moderate','Heavy','Extreme'],
    colors: ['#2563eb','#d97706','#ea580c','#dc2626'],
    nodes: [
      { icon:'🌧️', label:'Rain\nDetection', nodeClass:'node-rain', color:'var(--accent)' },
      { icon:'🕳️', label:'Drain\nOverload', nodeClass:'node-drain', color:'var(--moderate)', probKey:'drain_overload' },
      { icon:'🌊', label:'Road\nFlooding', nodeClass:'node-flood', color:'var(--high)', probKey:'road_flooding' },
      { icon:'🚗', label:'Traffic\nCongestion', nodeClass:'node-traffic', color:'var(--high)', probKey:'traffic_congestion' },
      { icon:'🚨', label:'Emergency\nDelay', nodeClass:'node-emergency', color:'var(--critical)', probKey:'emergency_delay' },
    ],
    arrows: ['triggers','causes','leads to','delays'],
    simulate: (rl) => {
      const runs = 10000; let drain=0,flood=0,traffic=0,delay=0;
      for(let i=0;i<runs;i++){
        const d = Math.random()<DRAIN_OVERLOAD_PROB[rl]; if(d)drain++;
        const f = Math.random()<(d?ROAD_FLOOD_PROB.true:ROAD_FLOOD_PROB.false); if(f)flood++;
        const t = Math.random()<(f?TRAFFIC_CONGESTION_PROB.true:TRAFFIC_CONGESTION_PROB.false); if(t)traffic++;
        const e = Math.random()<(t?EMERGENCY_DELAY_PROB.true:EMERGENCY_DELAY_PROB.false); if(e)delay++;
      }
      return { drain_overload:drain/runs, road_flooding:flood/runs, traffic_congestion:traffic/runs, emergency_delay:delay/runs };
    },
    simulateTrend: () => RAIN_LEVELS.map(rl => {
      const r = FLOW_CHAINS.rain.simulate(rl);
      return { 'Drain Overload': r.drain_overload*100, 'Road Flooding': r.road_flooding*100, 'Traffic Congestion': r.traffic_congestion*100, 'Emergency Delay': r.emergency_delay*100 };
    })
  },
  thunderstorm: {
    subtitle: 'Thunderstorm → Power, flooding & emergency escalation',
    badge: '⛈️ STORM',
    pieTitle: 'Storm Risk Distribution',
    pieSub: 'Probability breakdown across storm chain events',
    lineTitle: 'Storm Severity Escalation',
    lineSub: 'Risk at each storm intensity level (light → extreme)',
    lineLabels: ['Drizzle','Light','Moderate','Heavy','Extreme'],
    colors: ['#7c3aed','#dc2626','#ea580c','#d97706'],
    nodes: [
      { icon:'⛈️', label:'Thunder\nstorm', nodeClass:'node-emergency', color:'var(--critical)' },
      { icon:'⚡', label:'Power\nOutage', nodeClass:'node-drain', color:'var(--moderate)', probKey:'power_outage' },
      { icon:'🌊', label:'Flash\nFlooding', nodeClass:'node-flood', color:'var(--high)', probKey:'flash_flood' },
      { icon:'🚒', label:'Emergency\nResponse', nodeClass:'node-traffic', color:'var(--high)', probKey:'emergency_response' },
      { icon:'🏚️', label:'Property\nDamage', nodeClass:'node-emergency', color:'var(--critical)', probKey:'property_damage' },
    ],
    arrows: ['causes','triggers','overwhelms','results in'],
    simulate: () => {
      const runs=10000; let p=0,f=0,e=0,d=0;
      for(let i=0;i<runs;i++){
        const po=Math.random()<0.72; if(po)p++;
        const ff=Math.random()<0.80; if(ff)f++;
        const er=Math.random()<(ff?0.75:0.20); if(er)e++;
        const pd=Math.random()<(po&&ff?0.65:0.15); if(pd)d++;
      }
      return { power_outage:p/runs, flash_flood:f/runs, emergency_response:e/runs, property_damage:d/runs };
    },
    simulateTrend: () => [0.1,0.3,0.5,0.72,0.9].map(intensity => ({
      'Power Outage': intensity*0.85*100,
      'Flash Flooding': intensity*0.90*100,
      'Emergency Response': intensity*0.75*100,
      'Property Damage': intensity*0.65*100,
    }))
  },
  humidity: {
    subtitle: 'High humidity → Heat stress & infrastructure strain',
    badge: '💧 HUMID',
    pieTitle: 'Humidity Risk Distribution',
    pieSub: 'Probability breakdown across humidity chain events',
    lineTitle: 'Humidity Impact Escalation',
    lineSub: 'Risk at each humidity level (low → extreme)',
    lineLabels: ['Low','Mild','Moderate','High','Extreme'],
    colors: ['#0ea5e9','#d97706','#dc2626','#16a34a'],
    nodes: [
      { icon:'💧', label:'High\nHumidity', nodeClass:'node-rain', color:'var(--accent2)' },
      { icon:'🌡️', label:'Heat\nStress', nodeClass:'node-drain', color:'var(--moderate)', probKey:'heat_stress' },
      { icon:'💡', label:'Power\nDemand Surge', nodeClass:'node-flood', color:'var(--high)', probKey:'power_surge' },
      { icon:'🏥', label:'Health\nAlerts', nodeClass:'node-traffic', color:'var(--high)', probKey:'health_alerts' },
      { icon:'🐌', label:'Productivity\nSlowdown', nodeClass:'node-emergency', color:'var(--moderate)', probKey:'productivity_loss' },
    ],
    arrows: ['causes','spikes','triggers','leads to'],
    simulate: () => {
      const runs=10000; let h=0,p=0,ha=0,pl=0;
      for(let i=0;i<runs;i++){
        const hs=Math.random()<0.65; if(hs)h++;
        const ps=Math.random()<0.55; if(ps)p++;
        const hal=Math.random()<(hs?0.45:0.10); if(hal)ha++;
        const prl=Math.random()<(hs?0.60:0.20); if(prl)pl++;
      }
      return { heat_stress:h/runs, power_surge:p/runs, health_alerts:ha/runs, productivity_loss:pl/runs };
    },
    simulateTrend: () => [0.1,0.3,0.5,0.7,0.9].map(h => ({
      'Heat Stress': h*0.80*100,
      'Power Surge': h*0.65*100,
      'Health Alerts': h*0.50*100,
      'Productivity Loss': h*0.70*100,
    }))
  },
  haze: {
    subtitle: 'Haze / dry conditions → Visibility & air quality risk',
    badge: '🌫️ HAZE',
    pieTitle: 'Haze Risk Distribution',
    pieSub: 'Probability breakdown across haze chain events',
    lineTitle: 'Haze Severity Escalation',
    lineSub: 'Risk at each haze density level (clear → severe)',
    lineLabels: ['Clear','Mild','Moderate','Dense','Severe'],
    colors: ['#64748b','#d97706','#ea580c','#7c3aed'],
    nodes: [
      { icon:'🌫️', label:'Haze\nDetected', nodeClass:'node-rain', color:'var(--muted)' },
      { icon:'👁️', label:'Visibility\nReduced', nodeClass:'node-drain', color:'var(--moderate)', probKey:'visibility_loss' },
      { icon:'😷', label:'Air Quality\nAlert', nodeClass:'node-flood', color:'var(--high)', probKey:'air_quality' },
      { icon:'🚦', label:'Slow\nTraffic', nodeClass:'node-traffic', color:'var(--high)', probKey:'slow_traffic' },
      { icon:'✈️', label:'Flight\nDelays', nodeClass:'node-emergency', color:'var(--moderate)', probKey:'flight_delays' },
    ],
    arrows: ['reduces','triggers','causes','results in'],
    simulate: () => {
      const runs=10000; let v=0,a=0,t=0,f=0;
      for(let i=0;i<runs;i++){
        const vl=Math.random()<0.70; if(vl)v++;
        const aq=Math.random()<0.65; if(aq)a++;
        const st=Math.random()<(vl?0.55:0.15); if(st)t++;
        const fd=Math.random()<(vl&&aq?0.40:0.10); if(fd)f++;
      }
      return { visibility_loss:v/runs, air_quality:a/runs, slow_traffic:t/runs, flight_delays:f/runs };
    },
    simulateTrend: () => [0.05,0.25,0.50,0.72,0.90].map(hz => ({
      'Visibility Loss': hz*0.85*100,
      'Air Quality Alert': hz*0.75*100,
      'Slow Traffic': hz*0.60*100,
      'Flight Delays': hz*0.45*100,
    }))
  },
  clear: {
    subtitle: 'Clear weather → All systems normal, low risk',
    badge: '☀️ CLEAR',
    pieTitle: 'Clear Day — Risk Overview',
    pieSub: 'All event probabilities under clear conditions',
    lineTitle: 'Clear Day Stability Trend',
    lineSub: 'Risk remains consistently low across all conditions',
    lineLabels: ['Dawn','Morning','Midday','Evening','Night'],
    colors: ['#16a34a','#2563eb','#d97706','#64748b'],
    nodes: [
      { icon:'☀️', label:'Clear\nWeather', nodeClass:'node-drain', color:'var(--low)' },
      { icon:'✅', label:'No Drain\nRisk', nodeClass:'node-drain', color:'var(--low)', probKey:'no_drain_risk' },
      { icon:'🛣️', label:'Roads\nClear', nodeClass:'node-drain', color:'var(--low)', probKey:'roads_clear' },
      { icon:'🚗', label:'Normal\nTraffic', nodeClass:'node-drain', color:'var(--low)', probKey:'normal_traffic' },
      { icon:'🏥', label:'Services\nOperational', nodeClass:'node-drain', color:'var(--low)', probKey:'services_ok' },
    ],
    arrows: ['ensures','keeps','allows','supports'],
    simulate: () => ({
      no_drain_risk: 0.02 + Math.random()*0.03,
      roads_clear: 0.94 + Math.random()*0.03,
      normal_traffic: 0.88 + Math.random()*0.05,
      services_ok: 0.96 + Math.random()*0.02,
    }),
    simulateTrend: () => ['Dawn','Morning','Midday','Evening','Night'].map(() => ({
      'No Drain Risk': (2+Math.random()*3),
      'Roads Clear': (90+Math.random()*8),
      'Normal Traffic': (85+Math.random()*10),
      'Services OK': (94+Math.random()*5),
    }))
  }
};

// ──────────────────────────────────────────────
// BUILD FLOW HTML
// ──────────────────────────────────────────────
function buildFlowHTML(chain, probs, weather) {
  const nodes = chain.nodes;
  const arrows = chain.arrows;
  let html = '';
  nodes.forEach((node, i) => {
    const triggerLabel = {
      rain: weather.rain_level.toUpperCase(),
      thunderstorm: 'ACTIVE',
      humidity: 'HIGH',
      haze: 'DENSE',
      clear: 'ALL CLEAR'
    };
    const wType2 = getWeatherType(weather.main);
    const prob = node.probKey ? pct(probs[node.probKey] || 0) : (i === 0 ? (triggerLabel[wType2] || weather.rain_level.toUpperCase()) : '');
    const label = node.label.replace('\n','<br>');
    html += `
      <div class="flow-node" style="animation-delay:${i*0.1}s">
        <div class="flow-icon-wrap ${node.nodeClass}">${node.icon}</div>
        <div class="flow-node-label">${label}</div>
        ${prob ? `<div class="flow-node-prob" style="color:${node.color}">${prob}</div>` : ''}
      </div>`;
    if (i < nodes.length - 1) {
      html += `
      <div class="flow-arrow">
        <div style="display:flex;align-items:center">
          <div class="arrow-line" style="width:40px"></div>
          <div class="arrow-head"></div>
        </div>
        <div class="arrow-prob-label">${arrows[i] || '→'}</div>
      </div>`;
    }
  });
  return html;
}

// ──────────────────────────────────────────────
// RENDER
// ──────────────────────────────────────────────
function renderData(weather, probs, risks, city) {
  // Weather banner
  document.getElementById('wMain').textContent = weather.main;
  document.getElementById('wDesc').textContent = weather.description;
  const wLevel = document.getElementById('wLevel');
  wLevel.textContent = weather.rain_level;
  wLevel.className = 'rain-level rain-' + weather.rain_level;
  document.getElementById('wCity').textContent = city || 'Pune';
  document.getElementById('wTime').textContent = new Date().toLocaleTimeString();

  // Determine weather type & chain
  const wType = getWeatherType(weather.main);
  const chain = FLOW_CHAINS[wType];

  // Simulate for this chain type
  const chainProbs = chain.simulate(weather.rain_level);

  // Update flow subtitle & badge
  document.getElementById('flowSubtitle').textContent = chain.subtitle;
  document.getElementById('flowBadge').textContent = chain.badge;

  // Render dynamic flow nodes
  document.getElementById('flowDiagram').innerHTML = buildFlowHTML(chain, chainProbs, weather);

  // Update pie chart
  const vals = Object.values(chainProbs);
  const labels = chain.nodes.filter(n => n.probKey).map(n => n.label.replace('\n',' '));
  const chainColors = chain.colors;
  pieChart.data.labels = labels;
  pieChart.data.datasets[0].data = vals;
  pieChart.data.datasets[0].backgroundColor = chainColors.slice(0,vals.length).map(c => c + 'cc');
  pieChart.data.datasets[0].borderColor = chainColors.slice(0,vals.length);
  pieChart.update('active');

  // Update pie panel titles
  document.getElementById('pieTitle').textContent = chain.pieTitle;
  document.getElementById('pieSub').textContent = chain.pieSub;
  document.getElementById('pieBadge').textContent = chain.badge;

  // Update line chart with chain-specific trend data
  const trendRows = chain.simulateTrend();
  const eventKeys = Object.keys(trendRows[0]);
  lineChart.data.labels = chain.lineLabels;
  lineChart.data.datasets = eventKeys.map((key, i) => ({
    label: key,
    data: trendRows.map(row => +row[key].toFixed(1)),
    borderColor: chainColors[i] || '#888',
    backgroundColor: (chainColors[i] || '#888') + '18',
    fill: true, tension: 0.4, pointRadius: 5,
    pointBackgroundColor: chainColors[i] || '#888'
  }));
  lineChart.update('active');

  // Update line panel titles
  document.getElementById('lineTitle').textContent = chain.lineTitle;
  document.getElementById('lineSub').textContent = chain.lineSub;
  document.getElementById('lineBadge').textContent = chain.badge;

  // Log
  addLog(weather, chainProbs, chain, city);
}

function addLog(weather, probs, chain, city) {
  const log = document.getElementById('logEntries');
  const now = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const entries = [
    { cls:'ok', msg:`[${city}] Weather: ${weather.description} — chain: ${chain.badge}` },
    ...chain.nodes.filter(n => n.probKey).map((node, i) => {
      const p = probs[node.probKey] || 0;
      const risk = riskLabel(p);
      const clsMap = { low:'ok', moderate:'warn', high:'alert', critical:'critical' };
      return { cls: clsMap[risk], msg:`${node.label.replace('\n',' ')}: ${pct(p)} [${risk.toUpperCase()}]` };
    })
  ];
  const fragment = document.createDocumentFragment();
  entries.forEach((e, i) => {
    const div = document.createElement('div');
    div.className = `log-entry ${e.cls}`;
    div.style.animationDelay = (i * 0.07) + 's';
    div.innerHTML = `<span class="log-time">${now}</span><div class="log-dot"></div><span class="log-msg">${e.msg}</span>`;
    fragment.appendChild(div);
  });
  log.innerHTML = '';
  log.appendChild(fragment);
}

// ──────────────────────────────────────────────
// CITY CHANGE
// ──────────────────────────────────────────────
function onCityChange() {
  const city = document.getElementById('citySelect').value;
  loadData(city);
}

// ──────────────────────────────────────────────
// MAIN LOAD
// ──────────────────────────────────────────────
async function loadData(city) {
  city = city || document.getElementById('citySelect').value || 'Pune';
  let weather, probs, risks;
  try {
    const res = await fetch(`/risk?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    weather = data.weather;
    probs = data.probabilities;
    risks = data.risk_levels;
  } catch {
    const scenarios = CITY_SCENARIOS[city] || CITY_SCENARIOS['Pune'];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    weather = scenario;
    probs = simulate(scenario.rain_level);
    risks = {};
    Object.entries(probs).forEach(([k, v]) => risks[k] = riskLabel(v));
  }
  renderData(weather, probs, risks, city);
}

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
initCharts();
loadData('Pune');
setInterval(() => loadData(document.getElementById('citySelect').value), 30000);
