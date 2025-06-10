import http from 'k6/http';
import { group, check } from 'k6';
import { SharedArray } from 'k6/data';
import { sleep } from 'k6';

export {handleSummary} from '../utils/report-html.js';

export const options = {
    stages: [
  { duration: '1m', target: 100 }, 
  { duration: '1m', target: 100 },
  {duration : '30s', target:0}   
],

  thresholds: {
    http_req_duration: ['p(95)<1500'], // requests 95% response > 500ms 
    http_req_failed: ['rate<0.01'],   // error rate < 1% 
  }
};

const tokenRequestPayload = {
    // "CustomerURL": "ook",
    // "initial": "ComYM00021",
    // "username": "Saw Cho Cho",
    // "password": "cRh/r86Lci2g/EqZT5C2R4ynoSEuyPEvjosV1K84bB0=",
    // "grant_type": "password"
    "CustomerURL": "ook",
    "initial": "1",
    "username": "administrator",
    "password": "Z7GzgsvV/c6+rkXGlWtLtaeNNZYM/eIoCNalo4ZinKM=",
    "grant_type": "password"
};

const baseUrl = "https://apitest.globalta.com.mm/v2_2api/api";
const origin = "https://apitest.globalta.com.mm";
const myOrigin = "ook";

export default function () {
  const tokenRes = http.post(`${baseUrl}/token`, JSON.stringify(tokenRequestPayload), {
    headers: {
      'Content-Type': 'application/json',
      myOrigin: myOrigin,
      DeviceID: '1724ef9de266addc,'
    }
  });

  // console.log(`Token Request duration: ${tokenRes.timings.duration} ms`);

   //console.log("Token Response Body:\n" + tokenRes.body);
  // console.log("Token Response Status: " + tokenRes.status);

  const token = tokenRes.json().data?.access_token;
  check(tokenRes, {
    'token acquired': (r) => token !== undefined
  });

  const commonHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    myOrigin: myOrigin,
    Origin: origin,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36'
  };
    // 2. GetEmployeeTreeViewSetupByViewMenu
    const employeeFilterPayload = {
    "Type": true,
    "FormName": null,
    "View_Type": "0",
    "Include_Resign": false,
    "Include_Active": true,
    "Include_Inactive": false,
    "Resign_MonthOnly": false,
    "OrderbyDept": true,
    "OrderByDesign": false,
    "Dval": "",
    "Resign_CustomPeriod": false,
    "Resign_DateRange": false,
    "Fromdate": "2025-06-03",
    "Todate": "2025-06-03",
    "StartDate": null,
    "EndDate": null,
    "Exclude_Resign_DateRange": false,
    "excludeStartDate": null,
    "excludeEndDate": null,
    "OrgSortbyOption": null
    };

    const res=http.post(`${baseUrl}/employeesetupweb/GetEmployeeTreeViewSetupByViewMenu`, JSON.stringify(employeeFilterPayload), {
      headers: commonHeaders
    });
    check(res, {
      'TreeView status is 200': (r) => r.status === 200,
      'TreeView response time < 500ms': (r) => r.timings.duration < 500
    });
    sleep(1); // Sleep for 1 second between iterations
}
