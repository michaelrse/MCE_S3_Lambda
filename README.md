# Node JS for a simple Lambda function that trigger call to Marketing Cloud Engagement

To import data from AWS S3 to Marketing Cloud Engagement we need to create a trigger that uses a Lambda function in AWS.

We are using Automation Studio Trigger for an external file location, in this case AWS S3, to initiate the data import to Marketing Cloud Engagement from a bucket as soon as a change in the filesystem occurs. 
 
You need to configure a few things on AWS and MCE. 


### Configuring the AWS Environment

Create IAM Role for Lambda:

    * Create an IAM role with permissions to write logs to CloudWatch.
    * Attach a policy to allow the Lambda function to invoke the necessary actions, including calling external APIs.

Create and Deploy Lambda Function:

    * Write a Lambda function in Node.js that handles the S3 event, obtains an SFMC access token, and triggers the automation.
    * Deploy the Lambda function and ensure it has the necessary environment variables (e.g., SFMC client ID, client secret).

Set Up S3 Bucket and Event Trigger:

    * Create an S3 bucket or use an existing one.
    * Configure the bucket to trigger an event on file uploads (e.g., s3:ObjectCreated:*) and set the destination to a Lambda function.



### Configuring the Salesforce Marketing Cloud Environment

Set Up API Integration:

    * Create an API integration in SFMC to obtain the client ID and client secret.
    * Note the SFMC Authentication Base URI and REST Base URI.

Set Up File Locations

    * Create S3 file location with AIM user access key & secret
    * Validate connection

Configure Automation in SFMC:

    * Set up the automation in SFMC that you want to trigger using the API.
    * Note the unique key or ID for the automation to include in the API request.

Test and Verify Integration:

    * Test the integration by uploading a file to the S3 bucket and verify that the Lambda function triggers the SFMC automation.
    * Monitor logs and handle any errors to ensure the process runs smoothly.

### Preliminary: 

In AWS

* S3 bucket needs to be public
* S3 bucket needs the right bucket policy
    * `{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "AWS": "arn:aws:iam::<YOUR_AES_ACCOUNT_ID>:root"
                    },
                    "Action": [
                        "s3:GetObject",
                        "s3:PutObject",
                        "s3:DeleteObject"
                    ],
                    "Resource": "arn:aws:s3:::<YOUR_BUCKET_NAME>/*"
                }
            ]
        }`

Both can be adjusted in the “permission” tab of the bucket. 

### Lambda Role

Create inline policy by copy/ paste the following JSON. You might need to switch from the editor to the code view. Add this to your permissions.

`{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Statement1",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<YOUR_BUCKET_NAME>",
                "*",
                "*"
            ]
        },
        {
            "Sid": "Statement2",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListMultipartUploadParts"
            ],
            "Resource": [
                "arn:aws:s3:::<YOUR_BUCKET_NAME>"
            ]
        }
    ]
}
`
