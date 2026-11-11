/**
 * STL Icons - curated collections
 *
 * Each icon is referenced as 'library:icon-name', where library is a file in
 * manifests/ (e.g. tabler, carbon, simple) or 'stl' for our own icons in
 * custom-icons/. Add extra search words after a pipe:
 *     'tabler:antenna|aerial, mast'
 *
 * Run `python scripts/build.py` after editing: it checks every reference exists.
 */

window.STL_COLLECTIONS = [
    {
        id: 'preferred',
        name: 'STL preferred',
        description: 'The house set: icons to reach for first in STL decks. Edit this list as thumbs-up feedback comes in',
        icons: [
            'stl:ran', 'stl:open-ran', 'stl:5g', 'stl:6g', 'stl:core-network', 'stl:network-slicing', 'stl:private-network',
            'stl:fibre', 'stl:satellite-ntn', 'stl:operator', 'stl:network-api', 'stl:naas', 'stl:telco-cloud', 'stl:mec',
            'stl:hyperscale-data-centre', 'stl:edge-data-centre', 'stl:colocation', 'stl:server-rack', 'stl:sovereign-cloud',
            'stl:telco-ai', 'stl:generative-ai', 'stl:ai-agent', 'stl:ai-chip', 'stl:ai-factory', 'stl:network-security',
            'stl:iot', 'stl:smart-factory', 'stl:b2b2x', 'stl:managed-service', 'stl:monetisation', 'stl:market-sizing',
            'stl:roadmap', 'stl:partner-ecosystem', 'stl:net-zero', 'stl:infraco', 'stl:techco'
        ]
    },
    {
        id: 'stl',
        name: 'STL originals',
        description: 'Icons drawn for STL topics that the open libraries do not cover',
        library: 'stl' // every icon in custom-icons/
    },
    {
        id: 'logos',
        name: 'Logos',
        description: 'Full-colour company logos from the STL slide templates, grouped as in the templates',
        library: 'stllogos', // every logo in app/logos/logos.json
        groupBy: 'category'
    },
    {
        id: 'telco',
        name: 'Telco & mobile',
        icons: [
            'stl:ran', 'stl:open-ran', 'stl:cell-site', 'stl:small-cell', 'stl:5g', 'stl:5g-to-6g', 'stl:core-network',
            'stl:network-slicing', 'stl:private-network', 'stl:fwa', 'stl:esim', 'stl:operator',
            'stl:spectrum', 'stl:telco-ai', 'stl:satellite-ntn', 'stl:d2d-satellite', 'stl:satellite-ground-station',
            'stl:network-api', 'stl:network-api-code', 'stl:managed-service', 'stl:iot',
            'stl:6g', 'stl:5g-advanced', 'stl:vran', 'stl:ai-ran', 'stl:massive-mimo', 'stl:beamforming', 'stl:mmwave',
            'stl:neutral-host', 'stl:towerco', 'stl:coverage', 'stl:rural-connectivity', 'stl:spectrum-sharing',
            'stl:spectrum-auction', 'stl:roaming', 'stl:volte-voice', 'stl:a2p-messaging', 'stl:cpaas', 'stl:quality-on-demand',
            'stl:fixed-mobile-convergence', 'stl:oss-bss', 'stl:mission-critical',
            'tabler:antenna|aerial, radio', 'tabler:building-broadcast-tower|cell tower, mast, ran',
            'tabler:broadcast|radio, transmit', 'tabler:antenna-bars-5|signal strength, coverage',
            'tabler:signal-5g', 'tabler:signal-6g', 'tabler:signal-4g', 'tabler:signal-lte',
            'tabler:device-mobile|smartphone, handset, consumer', 'tabler:device-sim|sim card',
            'tabler:phone-call|voice, calls', 'tabler:message|sms, messaging', 'tabler:messages|rcs, messaging',
            'tabler:wifi', 'tabler:satellite', 'tabler:router|cpe, home router', 'tabler:home-signal|home broadband',
            'tabler:device-landline-phone|fixed line, voice', 'tabler:mobiledata|mobile data',
            'carbon:cell-tower|ran, mast', 'carbon:mobile|smartphone', 'carbon:sim-card', 'carbon:satellite',
            'carbon:connection-signal', 'carbon:router-wifi', 'carbon:phone-voice', 'carbon:wifi-controller'
        ]
    },
    {
        id: 'networks',
        name: 'Networks & connectivity',
        icons: [
            'stl:wan', 'stl:lan', 'stl:fibre', 'stl:subsea-cable', 'stl:microwave-backhaul', 'stl:interconnection',
            'stl:core-network', 'stl:satellite-ground-station', 'stl:network-api', 'stl:network-api-code',
            'stl:managed-service', 'stl:transport-network', 'stl:backhaul', 'stl:ftth', 'stl:cable-docsis', 'stl:naas',
            'stl:network-automation', 'stl:autonomous-network', 'stl:intent-based-networking', 'stl:network-orchestration',
            'stl:low-latency', 'stl:network-security', 'stl:dci', 'stl:quality-on-demand',
            'tabler:network', 'tabler:topology-star-3', 'tabler:topology-ring-3', 'tabler:topology-complex',
            'tabler:topology-full-hierarchy', 'tabler:router', 'tabler:load-balancer', 'tabler:world-www|internet',
            'tabler:world|global, international', 'tabler:plug-connected|connect', 'tabler:link',
            'tabler:affiliate|ecosystem, partners', 'tabler:sitemap|architecture', 'tabler:arrows-exchange|traffic',
            'tabler:gauge|speed, performance', 'tabler:clock-bolt|latency, real-time',
            'tabler:shield-lock|security, network security', 'tabler:wave-sine|signal',
            'carbon:network-1', 'carbon:network-2', 'carbon:network-3', 'carbon:network-4',
            'carbon:network-enterprise|enterprise network, wan', 'carbon:network-public|internet',
            'carbon:hybrid-networking', 'carbon:content-delivery-network|cdn', 'carbon:firewall|security',
            'carbon:vpn', 'carbon:switch-layer-3|switch', 'carbon:load-balancer-global',
            'carbon:connection-two-way', 'carbon:direct-link'
        ]
    },
    {
        id: 'data-centres',
        name: 'Data centres',
        icons: [
            'stl:hyperscale-data-centre', 'stl:edge-data-centre', 'stl:colocation', 'stl:server-rack',
            'stl:liquid-cooling', 'stl:data-centre-power', 'stl:interconnection', 'stl:ai-factory', 'stl:ai-chip',
            'stl:dci', 'stl:gpu-cluster', 'stl:rack-density', 'stl:cooling-chiller', 'stl:ups-backup-power', 'stl:power-grid',
            'stl:renewable-energy', 'stl:heat-reuse', 'stl:water-usage', 'stl:data-sovereignty', 'stl:on-premise-edge',
            'carbon:data-center|data centre, dc', 'carbon:bare-metal-server|server', 'carbon:bare-metal-server-01|server',
            'carbon:server-dns', 'carbon:block-storage|storage', 'carbon:object-storage|storage', 'carbon:storage-pool',
            'carbon:temperature|cooling, thermal', 'carbon:snowflake|cooling', 'carbon:lightning|power, energy',
            'carbon:energy-renewable|renewables', 'carbon:plug|power',
            'tabler:server', 'tabler:server-2', 'tabler:server-bolt|power', 'tabler:server-cog',
            'tabler:database|storage, data', 'tabler:cpu|compute, processor', 'tabler:cpu-2',
            'tabler:building-warehouse|facility, shell', 'tabler:building-factory-2|facility',
            'tabler:snowflake|cooling', 'tabler:temperature|cooling, heat', 'tabler:air-conditioning|cooling, hvac',
            'tabler:droplet|water, wue', 'tabler:bolt|power, energy, electricity', 'tabler:battery-charging|ups, backup power',
            'tabler:plug|power', 'tabler:building-wind-turbine|renewables', 'tabler:solar-electricity|renewables',
            'tabler:shield-lock|security', 'tabler:fingerprint|physical security, access',
            'tabler:map-pin|location, site selection'
        ]
    },
    {
        id: 'cloud-edge',
        name: 'Cloud & edge',
        icons: [
            'stl:telco-cloud', 'stl:mec', 'stl:edge-data-centre', 'stl:sovereign-cloud', 'stl:hybrid-cloud', 'stl:multi-cloud',
            'stl:cloud-native', 'stl:containers', 'stl:edge-ai', 'stl:on-premise-edge', 'stl:naas', 'stl:as-a-service',
            'stl:platform', 'stl:data-sovereignty',
            'tabler:cloud', 'tabler:cloud-computing', 'tabler:cloud-network', 'tabler:cloud-data-connection',
            'tabler:cloud-lock|secure cloud, sovereign', 'tabler:cloud-cog|cloud management', 'tabler:cloud-upload',
            'tabler:container|containers, cnf', 'tabler:stack-2|stack, platform, layers', 'tabler:api',
            'tabler:code|software, developer', 'tabler:brackets-contain', 'tabler:apps|applications',
            'carbon:cloud', 'carbon:cloud-services', 'carbon:edge-node', 'carbon:edge-cluster', 'carbon:edge-device',
            'carbon:edge-service', 'carbon:kubernetes', 'carbon:virtual-machine|vm', 'carbon:virtual-private-cloud|vpc',
            'carbon:container-services', 'carbon:cloud-satellite|hybrid cloud', 'carbon:api',
            'carbon:iot-platform', 'carbon:iot-connect', 'carbon:application-virtual', 'carbon:devices'
        ]
    },
    {
        id: 'ai',
        name: 'AI & data',
        icons: [
            'stl:telco-ai', 'stl:ai-agent', 'stl:ai-chip', 'stl:ai-factory', 'stl:digital-twin', 'stl:generative-ai', 'stl:llm',
            'stl:multi-agent-ai', 'stl:ai-inference', 'stl:ai-training', 'stl:gpu-cluster', 'stl:edge-ai', 'stl:ai-ran',
            'stl:aiops', 'stl:voice-ai', 'stl:computer-vision', 'stl:neural-network', 'stl:ai-governance', 'stl:data-lake',
            'stl:real-time-data', 'stl:analytics-dashboard', 'stl:quantum',
            'tabler:sparkles|genai, generative ai, ai', 'tabler:brain|ai, intelligence, ml',
            'tabler:robot|ai, automation, bot', 'tabler:robot-face|ai agent, bot',
            'tabler:message-chatbot|chatbot, llm, assistant', 'tabler:binary-tree|machine learning, model',
            'tabler:hierarchy|decision tree', 'tabler:wand|ai magic, automation', 'tabler:atom|research',
            'tabler:math-function|algorithm, model', 'tabler:chart-dots-3|data, analytics', 'tabler:graph|analytics',
            'tabler:database|data', 'tabler:eye|computer vision',
            'carbon:ai', 'carbon:bot', 'carbon:chat-bot', 'carbon:machine-learning-model', 'carbon:machine-learning',
            'carbon:model', 'carbon:chart-network|knowledge graph', 'carbon:decision-tree', 'carbon:idea|insight',
            'carbon:ai-launch', 'carbon:analytics'
        ]
    },
    {
        id: 'enterprise',
        name: 'Enterprise & industries',
        icons: [
            'stl:private-network', 'stl:iot', 'stl:wan', 'stl:lan', 'stl:managed-service', 'stl:smart-factory',
            'stl:industrial-robot', 'stl:connected-car', 'stl:logistics', 'stl:smart-port', 'stl:smart-city', 'stl:connected-health',
            'stl:payments', 'stl:storefront', 'stl:smart-meter', 'stl:agritech', 'stl:mining', 'stl:mission-critical',
            'stl:defence', 'stl:stadium-venue', 'stl:smb', 'stl:b2b2x', 'stl:on-premise-edge',
            'tabler:building|enterprise, office, company', 'tabler:building-skyscraper|corporate, city',
            'tabler:building-factory|manufacturing, industry 4.0', 'tabler:building-hospital|healthcare',
            'tabler:building-bank|financial services, banking', 'tabler:building-store|retail',
            'tabler:building-warehouse|logistics, warehousing', 'tabler:building-stadium|venue, events',
            'tabler:building-community|public sector, government', 'tabler:truck-delivery|logistics, transport',
            'tabler:car|automotive, connected car', 'tabler:plane|aviation, airport', 'tabler:ship|maritime, port',
            'tabler:train|rail, transport', 'tabler:tractor|agriculture', 'tabler:bolt|energy, utilities',
            'tabler:school|education', 'tabler:shopping-cart|retail, ecommerce', 'tabler:home|residential, consumer',
            'tabler:smart-home', 'tabler:drone', 'tabler:device-cctv|video surveillance, security',
            'tabler:heartbeat|health', 'tabler:stethoscope|healthcare', 'tabler:briefcase|business, smb, sme',
            'tabler:users|customers', 'tabler:user|consumer, person',
            'carbon:industry', 'carbon:hospital', 'carbon:delivery-truck', 'carbon:vehicle-connected|connected car',
            'carbon:drone', 'carbon:finance|financial services', 'carbon:store|retail'
        ]
    },
    {
        id: 'sustainability',
        name: 'Sustainability & energy',
        icons: [
            'stl:data-centre-power', 'stl:liquid-cooling', 'stl:net-zero', 'stl:circular-economy', 'stl:sustainable-operations',
            'stl:renewable-energy', 'stl:power-grid', 'stl:heat-reuse', 'stl:water-usage', 'stl:smart-meter',
            'tabler:leaf|green, eco, esg', 'tabler:plant|growth, green', 'tabler:plant-2', 'tabler:trees|nature',
            'tabler:recycle|circular economy', 'tabler:solar-panel|solar, renewables', 'tabler:solar-electricity',
            'tabler:wind-electricity|wind', 'tabler:building-wind-turbine|wind farm', 'tabler:battery-eco',
            'tabler:battery-charging|storage', 'tabler:bolt|electricity', 'tabler:droplet|water',
            'tabler:temperature|climate', 'tabler:temperature-sun|heat, climate', 'tabler:world|planet',
            'tabler:home-eco', 'tabler:charging-pile|ev charging', 'tabler:cloud-fog|emissions, pollution',
            'carbon:energy-renewable', 'carbon:wind-power', 'carbon:solar-panel', 'carbon:carbon-accounting|co2, emissions',
            'carbon:sustainability'
        ]
    },
    {
        id: 'consumer',
        name: 'Consumer services',
        icons: [
            'stl:consumer-bundle', 'stl:video-streaming', 'stl:cloud-gaming', 'stl:home-wifi', 'stl:wearable',
            'stl:digital-identity', 'stl:customer-experience', 'stl:churn', 'stl:arpu', 'stl:ftth', 'stl:fwa', 'stl:esim',
            'stl:payments', 'stl:roaming', 'stl:fixed-mobile-convergence', 'stl:cable-docsis',
            'tabler:device-mobile|smartphone', 'tabler:device-tv|tv', 'tabler:device-gamepad-2|gaming', 'tabler:smart-home',
            'tabler:headphones|music, audio', 'tabler:movie|video, film', 'tabler:shopping-cart|ecommerce', 'tabler:users|households'
        ]
    },
    {
        id: 'business',
        name: 'Business & strategy',
        icons: [
            'stl:infraco', 'stl:techco', 'stl:servco', 'stl:wholesale', 'stl:m-and-a', 'stl:business-model', 'stl:monetisation',
            'stl:arpu', 'stl:cost-reduction', 'stl:capex', 'stl:market-sizing', 'stl:benchmarking', 'stl:go-to-market',
            'stl:roadmap', 'stl:customer-research', 'stl:expert-network', 'stl:regulation', 'stl:skills', 'stl:innovation',
            'stl:organisational-change', 'stl:partner-ecosystem', 'stl:platform', 'stl:as-a-service', 'stl:b2b2x',
            'tabler:chart-bar', 'tabler:chart-line', 'tabler:chart-pie', 'tabler:chart-arrows-vertical',
            'tabler:trending-up|growth', 'tabler:trending-down|decline', 'tabler:target|goal, objective',
            'tabler:target-arrow|focus, aim', 'tabler:bulb|idea, insight, innovation', 'tabler:rocket|launch, growth',
            'tabler:puzzle|solution, fit', 'tabler:briefcase|business', 'tabler:presentation',
            'tabler:report-analytics|report, research', 'tabler:coins|revenue, money', 'tabler:cash|money',
            'tabler:currency-pound', 'tabler:currency-dollar', 'tabler:currency-euro', 'tabler:receipt|cost, billing',
            'tabler:scale|regulation, balance', 'tabler:gavel|regulation, legal, policy', 'carbon:partnership|handshake, deal',
            'tabler:users|team, people', 'tabler:users-group|stakeholders', 'tabler:user-check', 'tabler:user-search|hiring',
            'tabler:shield-check|trust, compliance', 'tabler:checklist|plan', 'tabler:list-check',
            'tabler:calendar', 'tabler:clock|time', 'tabler:map|roadmap', 'tabler:flag|milestone',
            'tabler:route|journey, roadmap', 'tabler:compass|strategy, direction', 'tabler:adjustments|options',
            'tabler:settings|operations', 'tabler:search|research', 'tabler:lock|security', 'tabler:award|award, quality',
            'tabler:trophy|winner, success', 'tabler:message-circle|feedback, interview', 'tabler:speakerphone|marketing',
            'tabler:mail', 'tabler:file-text|document', 'tabler:file-analytics|report',
            'tabler:arrows-split|choice, options', 'tabler:arrow-merge|consolidation, m&a', 'tabler:stairs-up|maturity',
            'tabler:hierarchy-2|organisation, org chart', 'carbon:money', 'carbon:chart-marimekko', 'carbon:roadmap',
            'carbon:growth'
        ]
    },
    {
        id: 'brand-icons',
        name: 'Brand icons (one colour)',
        description: 'Single-colour brand marks (Simple Icons) that take STL colours. Trademarks belong to their owners',
        icons: [
            'simple:vodafone', 'simple:orange', 'simple:tmobile', 'simple:verizon', 'simple:bt', 'simple:airtel',
            'simple:rakuten', 'simple:ericsson', 'simple:nokia', 'simple:huawei', 'simple:cisco', 'simple:samsung',
            'simple:qualcomm', 'simple:intel', 'simple:amd', 'simple:nvidia', 'simple:arm', 'simple:broadcom',
            'simple:amazonaws|aws', 'simple:amazon', 'simple:microsoftazure|azure', 'simple:microsoft',
            'simple:googlecloud|gcp', 'simple:google', 'simple:oracle', 'simple:ibm', 'simple:alibabacloud',
            'simple:meta', 'simple:apple', 'simple:openai', 'simple:anthropic', 'simple:googlegemini|gemini',
            'simple:perplexity', 'simple:cloudflare', 'simple:akamai', 'simple:fastly', 'simple:digitalocean',
            'simple:ovh', 'simple:hetzner', 'simple:redhat', 'simple:vmware', 'simple:dell', 'simple:hp',
            'simple:lenovo', 'simple:salesforce', 'simple:sap', 'simple:accenture', 'simple:spacex|starlink'
        ]
    }
];

/**
 * Search helpers. British spellings are mapped to the US spellings most icon
 * libraries use, and STL shorthand is expanded so 'dc' finds data centres.
 */
window.STL_SPELLINGS = {
    centre: 'center', centres: 'centers', fibre: 'fiber', colour: 'color', optimise: 'optimize',
    organisation: 'organization', virtualisation: 'virtualization', licence: 'license', analyse: 'analyze'
};

window.STL_SYNONYMS = {
    dc: ['data center', 'server'],
    datacentre: ['data center'],
    datacenter: ['data center'],
    telco: ['antenna', 'tower', 'operator'],
    telecoms: ['antenna', 'tower', 'operator'],
    mno: ['operator', 'tower'],
    csp: ['operator'],
    ran: ['antenna', 'tower', 'radio'],
    oran: ['open ran'],
    mobile: ['device-mobile', 'mobile', 'antenna'],
    ai: ['ai', 'sparkles', 'brain', 'robot'],
    genai: ['sparkles', 'chatbot', 'robot'],
    llm: ['chatbot', 'brain', 'sparkles'],
    agent: ['robot', 'bot', 'agent'],
    gpu: ['cpu', 'chip', 'gpu'],
    edge: ['edge', 'mec'],
    mec: ['edge'],
    iot: ['iot', 'sensor', 'cpu'],
    fwa: ['router', 'home-signal'],
    ftth: ['fiber'],
    broadband: ['router', 'fiber', 'wifi'],
    satellite: ['satellite', 'ntn'],
    cooling: ['snowflake', 'temperature', 'droplet', 'air-conditioning'],
    power: ['bolt', 'plug', 'battery', 'lightning'],
    energy: ['bolt', 'battery', 'solar', 'wind'],
    sustainability: ['leaf', 'plant', 'recycle', 'eco'],
    esg: ['leaf', 'recycle'],
    revenue: ['coins', 'currency', 'cash', 'chart'],
    growth: ['trending-up', 'chart', 'plant'],
    security: ['shield', 'lock'],
    cyber: ['shield', 'lock', 'firewall'],
    customer: ['user', 'users'],
    enterprise: ['building', 'briefcase'],
    b2b: ['building', 'briefcase'],
    sme: ['briefcase', 'building-store'],
    government: ['building-community', 'building-bank']
};
