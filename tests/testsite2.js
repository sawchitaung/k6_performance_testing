// Fixed k6 script with proper variable substitution and JSON formatting

import http from 'k6/http';
import { group, check } from 'k6';
import { parse } from 'https://jslib.k6.io/papaparse/5.1.1/index.js'; 
import { SharedArray } from 'k6/data';
import { sleep } from 'k6';

// export let options = {
//   maxRedirects: 4
// };

const users = new SharedArray('users', function () {
  const userData = open('../datas/userdata.csv'); // use correct path
  const parsed= parse(userData, { header: true }).data;
  return parsed.filter(user => user.username && user.password && user.initial)
});

export const options = {
    vus: users.length, // Number of virtual users
    duration: '30s', // Duration of the test
    iterations: users.length, // Number of iterations
}

const baseUrl = "https://apitest.globalta.com.mm/v2_2api/api";
const origin = "https://apitest.globalta.com.mm";
const myOrigin = "ook";

const employeeFilterPayload = JSON.parse(open('../datas/GetAllEmpForFilter.json')); // Load from JSON file

export default function () {
  // 1. Get token
  const user=users[__VU - 1];
    const tokenRequestPayload = {
        CustomerURL: "ook",
        initial: user.initial,
        username: user.username,
        password: user.password,
        grant_type: "password"
    };
    console.log(`User information : ${user.username}, Initial: ${user.initial}, DeviceID: ${user.DeviceID}`);

  const tokenRes = http.post(`${baseUrl}/token`, JSON.stringify(tokenRequestPayload), {
    headers: {
      'Content-Type': 'application/json',
      myOrigin: myOrigin,
      DeviceID: user.DeviceID || '1bade16d987ee38c' // Use DeviceID from user data or default
    }
  });

  const token = tokenRes.json().data?.access_token;
  check(tokenRes, {
    'token acquired': (r) => token !== undefined
  });

  console.log(`Token: ${token}, ${user.username}`);

  const commonHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    myOrigin: myOrigin,
    Origin: origin,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36'
  };
  

  group("AttendanceRequest", function () {
    // 2. GetAllEmployeeForFilter
    // const employeeFilterPayload = {
    //   gridState: {
    //     page: 1,
    //     pageSize: 4000
    //   },
    //   data: {
    //     Type: "true",
    //     View_Type: 0,
    //     Include_Resign: false,
    //     Include_Active: true,
    //     Include_Inactive: false,
    //     Include_ResignMonthOnly: false,
    //     Resign_CustomPeriod: false,
    //     Fromdate: null,
    //     Todate: null,
    //     Resign_DateRange: false,
    //     StartDate: null,
    //     EndDate: null,
    //     Exclude_Resign_DateRange: false,
    //     excludeStartDate: null,
    //     excludeEndDate: null
    //   }
    // };
  

    http.post(`${baseUrl}/employeesetupweb/GetAllEmployeeForFilter`, JSON.stringify(employeeFilterPayload), {
      headers: commonHeaders
    });

    // 3. UpdateTransfer
    const updateTransferPayload = {
      IsHistory: true,
      TransferID: "000000000457",
      EmployeeID: "yapBSUsNtXtj2m5pigRm0w==",
      ChangeStatus: "1701",
      Remark: "ymtest",
      OrderDate: "2025-04-23",
      EffectiveDate: "2025-04-29",
      DivisionID: 3,
      SectionID: 1,
      CostCenterID: 19,
      LocationID: 5,
      GroupID: 3,
      DepartmentId: "MGl/jkbkobwjhZvYRCDu3g==",
      DesignationId: 997,
      CompanyId: "VYQHlMPOfYWctK9RxNT3Jw==",
      GroupPolicyId: "VYQHlMPOfYWctK9RxNT3Jw==",
      GradeId: "owh7Bv8vXaKPI+90JHzUjw==",
      OldLocationID: 5,
      OldDivisionID: 3,
      OldDesignationId: 997,
      OldCompanyId: "ZB9RUTxhEKxF+T7O4D5HQw==",
      OldDepartmentId: "iHWHAmT7b/xGgKe6EzUcug==",
      OldGroupPolicyId: "VYQHlMPOfYWctK9RxNT3Jw==",
      OldSectionID: 1,
      OldGroupID: 3,
      OldCostCenterID: 19,
      OldGradeId: "owh7Bv8vXaKPI+90JHzUjw==",
      Status: "0",
      motionStatus: 0,
      motionOther: null,
      isNeedGenerate: false
    };

    http.post(`${baseUrl}/TransferWeb/UpdateTransfer`, JSON.stringify(updateTransferPayload), {
      headers: commonHeaders
    });
    sleep(5); // Sleep for 1 second between iterations
  });
}
