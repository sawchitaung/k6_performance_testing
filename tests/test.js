import http from 'k6/http';
import { check, sleep } from 'k6';
export {handleSummary} from '../utils/report-html.js';

export const options = {
    vus: 10, // Number of virtual users
    duration: '30s', // Duration of the test
}

export default function () {
    const url = http.get('https://quickpizza.grafana.com');
    // const payload = JSON.stringify({ name: 'World' });

    // const params = {
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    // };

    // const res = http.post(url, payload, params);

    
    check(url, {
        'is status 200': (r) => r.status === 200
    });

    sleep(1); // Sleep for 1 second between iterations
}