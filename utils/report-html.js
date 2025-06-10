import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// Helper function to extract the script name (using __ENV.K6_SCRIPT_NAME)
function getScriptName() {
  // This value is passed from your shell/batch/PowerShell wrapper script
  const scriptName = __ENV.K6_SCRIPT_NAME || 'k6_test_default';
  return scriptName;
}

/**
 * Custom handleSummary function to generate an HTML report with dynamic filename and path.
 * This function should be imported and re-exported by your main k6 test scripts.
 * @param {object} data - The summary data provided by k6.
 */
export function handleSummary(data) {
  const scriptName = getScriptName();

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const outputDirectory = 'reports'; // Desired output path
  const baseFilename = `${scriptName}_${year}_${month}_${day}.html`;
  const fullPath = `${outputDirectory}/${baseFilename}`;

  console.log(`Generating HTML report to: ${fullPath}`);

  return {
    [fullPath]: htmlReport(data),
  };
}