/**
 * STL Icons - feedback, requests and anonymous usage counts
 *
 * Rows go to two Supabase tables (see supabase/setup.sql):
 *   feedback: requests, "nothing came up" reports, thumbs up/down, removal suggestions
 *   usage:    anonymous insert and search events, for counting what gets used
 * If the service isn't configured or is unreachable, rows wait in a local queue and are retried.
 */
(function () {
    const QUEUE_KEY = 'stl-icons:outbox';
    const MAX_QUEUE = 500;

    function config() {
        const c = window.STL_FEEDBACK_CONFIG || {};
        return c.url && c.anonKey ? c : null;
    }

    function readQueue() {
        try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; } catch (e) { return []; }
    }

    function writeQueue(queue) {
        try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE))); } catch (e) { /* storage unavailable */ }
    }

    async function post(table, rows) {
        const c = config();
        if (!c) return false;
        try {
            const headers = { apikey: c.anonKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
            // Legacy JWT anon keys also go in Authorization; new sb_publishable_ keys must not
            if (!c.anonKey.startsWith('sb_')) headers.Authorization = `Bearer ${c.anonKey}`;
            const res = await fetch(`${c.url.replace(/\/$/, '')}/rest/v1/${table}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(rows)
            });
            return res.ok;
        } catch (e) {
            return false;
        }
    }

    /** Send a row now, or keep it for later. Resolves true when it reached the server. */
    async function send(table, row) {
        const stamped = { ...row, client_time: new Date().toISOString() };
        if (await post(table, [stamped])) return true;
        const queue = readQueue();
        queue.push({ table, row: stamped });
        writeQueue(queue);
        return false;
    }

    /** Retry anything queued from earlier sessions. */
    async function flush() {
        const queue = readQueue();
        if (!queue.length || !config()) return;
        const byTable = {};
        queue.forEach(item => (byTable[item.table] = byTable[item.table] || []).push(item.row));
        const remaining = [];
        for (const [table, rows] of Object.entries(byTable)) {
            if (!(await post(table, rows))) rows.forEach(row => remaining.push({ table, row }));
        }
        writeQueue(remaining);
    }

    window.STLFeedback = {
        isConnected: () => !!config(),
        feedback: (row) => send('feedback', row),
        usage: (row) => send('usage', row),
        flush
    };

    setTimeout(flush, 3000);
})();
