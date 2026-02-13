const axios = require('axios');

const API_URL = 'http://localhost:5001/api/events/ingest';

const SOURCES = [
    'workstation-01.dev.corp',
    'prod-server-primary.internal',
    'build-node-04.ci',
    'vpn-gateway-hq',
    'analyst-laptop-77'
];

// Realistic Attack Playbooks
const PLAYBOOKS = {
    BRUTE_FORCE: [
        { type: 'AUTH_FAILURE', details: { service: 'ssh', user: 'root', method: 'password' }, risk: 'SAFE' },
        { type: 'AUTH_FAILURE', details: { service: 'ssh', user: 'admin', method: 'password' }, risk: 'SAFE' },
        { type: 'AUTH_FAILURE', details: { service: 'ssh', user: 'test', method: 'password' }, risk: 'SAFE' },
        { type: 'AUTH_SUCCESS', details: { service: 'ssh', user: 'root', method: 'password' }, risk: 'MALICIOUS' },
        { type: 'SHELL_EXECUTION', details: { command: 'whoami' }, risk: 'SAFE' },
        { type: 'SHELL_EXECUTION', details: { command: 'cat /etc/shadow' }, risk: 'MALICIOUS' },
    ],
    EXFILTRATION: [
        { type: 'NETWORK_CONNECT', details: { dest_ip: '8.8.8.8', port: 53, bytes_sent: 512 }, risk: 'SAFE' },
        { type: 'FILE_ACCESS', details: { path: '/var/www/html/config.php', mode: 'read' }, risk: 'SAFE' },
        { type: 'NETWORK_CONNECT', details: { dest_ip: '45.33.22.11', port: 443, bytes_sent: 1048576 }, risk: 'MALICIOUS' },
        { type: 'NETWORK_CONNECT', details: { dest_ip: '45.33.22.11', port: 443, bytes_sent: 2097152 }, risk: 'MALICIOUS' },
    ],
    LATERAL_MOVEMENT: [
        { type: 'NETWORK_CONNECT', details: { dest_ip: '10.0.0.5', port: 445 }, risk: 'SAFE' },
        { type: 'PROCESS_SPAWN', details: { process: 'psexec.exe', args: ['\\\\10.0.0.5', '-s', 'cmd.exe'] }, risk: 'MALICIOUS' },
        { type: 'SHELL_EXECUTION', details: { command: 'net group "Domain Admins" /domain' }, risk: 'SAFE' },
    ],
    NORMAL_NOISE: [
        { type: 'PROCESS_SPAWN', details: { process: 'node.exe', args: ['app.js'] }, risk: 'SAFE' },
        { type: 'NETWORK_CONNECT', details: { dest_ip: '172.217.16.142', port: 443 }, risk: 'SAFE' },
        { type: 'FILE_ACCESS', details: { path: 'logs/access.log', mode: 'write' }, risk: 'SAFE' },
    ]
};

async function sendEvent(event) {
    const payload = {
        type: event.type,
        source: event.source,
        details: {
            ...event.details,
            event_id: Math.random().toString(36).substring(2, 11)
        },
        timestamp: new Date().toISOString()
    };

    try {
        const res = await axios.post(API_URL, payload, { timeout: 5000 });
        const emoji = event.risk === 'MALICIOUS' ? '🚨' : (event.risk === 'ANOMALY' ? '🧪' : '✅');
        const statusColor = res.data.analysis === 'MALICIOUS' ? '\x1b[31mMALICIOUS\x1b[0m' : '\x1b[32mSAFE\x1b[0m';
        console.log(`${emoji} [${event.source}] ${event.type} → ${statusColor}`);
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error(`❌ [ERROR] Backend not running on ${API_URL}`);
        } else {
            console.error(`❌ [ERROR] ${error.message}`);
        }
    }
}

async function runPlaybook(name, source) {
    console.log(`\n\x1b[35m🎬 STARTING PLAYBOOK: ${name} on ${source}\x1b[0m`);
    const events = PLAYBOOKS[name];
    for (const eventTemplate of events) {
        await sendEvent({ ...eventTemplate, source });
        const delay = Math.floor(Math.random() * 1500) + 500; // Realistic stagger
        await new Promise(r => setTimeout(r, delay));
    }
    console.log(`\x1b[35m🎬 COMPLETED PLAYBOOK: ${name}\x1b[0m\n`);
}

async function simulator() {
    console.log('\x1b[36m═══════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[36m🚀 Cortex Enterprise Multi-Agent Simulator [v2]\x1b[0m');
    console.log('\x1b[36m═══════════════════════════════════════════════════════════\x1b[0m\n');

    // Learning phase: Send some initial noise to set baselines
    console.log('📝 Initializing behavioral baselines with normal traffic...');
    for (const source of SOURCES) {
        for (let i = 0; i < 3; i++) {
            const noise = PLAYBOOKS.NORMAL_NOISE[i % PLAYBOOKS.NORMAL_NOISE.length];
            await sendEvent({ ...noise, source });
        }
    }
    console.log('✅ Baselines established. Starting perpetual simulation.\n');

    // Run perpetual loop
    while (true) {
        const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
        const choice = Math.random();

        if (choice < 0.8) {
            // 80% chance of normal noise
            const noiseEvent = PLAYBOOKS.NORMAL_NOISE[Math.floor(Math.random() * PLAYBOOKS.NORMAL_NOISE.length)];
            await sendEvent({ ...noiseEvent, source });
        } else {
            // 20% chance of an attack scenario
            const attackPatterns = ['BRUTE_FORCE', 'EXFILTRATION', 'LATERAL_MOVEMENT'];
            const attack = attackPatterns[Math.floor(Math.random() * attackPatterns.length)];
            await runPlaybook(attack, source);
        }

        // Variable delay between event cycles to create "velocity dips" in the graph
        const wait = Math.floor(Math.random() * 3000) + 1000;
        await new Promise(r => setTimeout(r, wait));
    }
}

simulator();
