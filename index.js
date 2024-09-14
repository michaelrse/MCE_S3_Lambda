const AWS = require('aws-sdk');
const axios = require('axios');

// Initialize S3 client
const s3 = new AWS.S3();

const CLIENT_ID = '<YOUR_CLIENT_ID>';
const CLIENT_SECRET = '<YOUR_CLIENT_SECRET>';
const ACCOUNT_ID = 'YOUR_MID_AS_A_NUMBER';
const AUTH_URL = 'https://<YOUR_BASE_URI>.auth.marketingcloudapis.com/v2/token';
const AUTOMATION_URL = 'https://<YOUR_BASE_URI>.rest.marketingcloudapis.com/automation/v1/automations/trigger/';

async function getAccessToken() {
    const payload = {
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        account_id: ACCOUNT_ID
    };
    
    try {
        const response = await axios.post(AUTH_URL, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        return response.data.access_token;
    } catch (error) {
        console.error('Error obtaining access token:', error.response.data);
        throw new Error('Failed to obtain access token');
    }
}

async function triggerAutomation(accessToken) {
    const payload = {
    "fileTransferLocationKey": "<YOUR_EXTERNAL_KEY_OF_THE_FILE_LOCATION>",
    "filename": "<YOUR_FILE_NAME>",
    "relativepath": "/",
    "deduplicationKey": ""
    };
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };
    
    try {
        const response = await axios.post(AUTOMATION_URL, payload, { headers });
        
        if (response.status === 200) {
            console.log('Automation triggered successfully');
        } else {
            console.error(`Failed to trigger automation: ${response.data}`);
        }
    } catch (error) {
        console.error('Error triggering automation:', error.response.data);
        throw new Error('Failed to trigger automation');
    }
}

exports.handler = async (event) => {
    try {
        // Parse the S3 event
        const bucketName = event.Records[0].s3.bucket.name;
        const fileKey = event.Records[0].s3.object.key;
        
        // Optionally, get the file content (if needed)
        const params = {
            Bucket: bucketName,
            Key: fileKey
        };
        const fileObject = await s3.getObject(params).promise();
        const fileContent = fileObject.Body.toString('utf-8');

        // Obtain an access token
        const accessToken = await getAccessToken();
        
        // Trigger the SFMC automation
        await triggerAutomation(accessToken);
        
        return {
            statusCode: 200,
            body: JSON.stringify('Lambda function executed successfully')
        };
    } catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify('Lambda function failed')
        };
    }
};
