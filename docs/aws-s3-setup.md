# AWS S3 Setup Guide

This guide will help you set up AWS S3 for avatar upload functionality as an alternative to Cloudinary.

## 1. Create AWS Account and S3 Bucket

### Step 1: AWS Account Setup
1. Go to [AWS Console](https://aws.amazon.com/) and create an account
2. Navigate to the S3 service
3. Create a new bucket for your manga website

### Step 2: S3 Bucket Configuration
1. **Bucket Name**: Choose a unique name (e.g., `manga-website-storage`)
2. **Region**: Select a region close to your users (e.g., `us-east-1`)
3. **Public Access**: Configure based on your needs
4. **Versioning**: Enable if you want file versioning
5. **Encryption**: Enable server-side encryption

### Step 3: Bucket Policy (for public read access)
Add this bucket policy to allow public read access to uploaded avatars:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/manga-website/avatars/*"
    }
  ]
}
```

## 2. Create IAM User and Access Keys

### Step 1: Create IAM User
1. Go to IAM service in AWS Console
2. Create a new user (e.g., `manga-website-uploader`)
3. Select "Programmatic access"

### Step 2: Attach Permissions
Create a custom policy with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/manga-website/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:HeadBucket"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```

### Step 3: Get Access Keys
1. After creating the user, download the Access Key ID and Secret Access Key
2. Store these securely - you'll need them for environment variables

## 3. Configure Environment Variables

Update your `.env` file:

```bash
# Choose S3 as storage provider
STORAGE_PROVIDER="s3"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"

# Optional: CloudFront CDN URL for faster delivery
AWS_CLOUDFRONT_URL="https://your-cloudfront-domain.cloudfront.net"
```

## 4. Optional: CloudFront CDN Setup

For better performance, set up CloudFront CDN:

### Step 1: Create CloudFront Distribution
1. Go to CloudFront service in AWS Console
2. Create a new distribution
3. Set origin domain to your S3 bucket
4. Configure caching behaviors

### Step 2: Configure Origin Access Control (OAC)
1. Create an Origin Access Control
2. Update S3 bucket policy to allow CloudFront access
3. Block public access to S3 and serve only through CloudFront

### Step 3: Update Environment Variables
```bash
AWS_CLOUDFRONT_URL="https://d1234567890.cloudfront.net"
```

## 5. CORS Configuration

Configure CORS on your S3 bucket to allow uploads from your domain:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## 6. Testing the Setup

1. Set `STORAGE_PROVIDER="s3"` in your `.env` file
2. Start your development server: `pnpm dev`
3. Navigate to `/profile/settings`
4. Try uploading an avatar image
5. Check your S3 bucket to see the uploaded files
6. Test the health endpoint: `GET /api/storage/health`

## 7. Production Considerations

### Security
- Use IAM roles instead of access keys in production (if deploying on AWS)
- Implement signed URLs for sensitive uploads
- Enable S3 access logging
- Use least privilege principle for IAM permissions

### Performance
- Enable CloudFront CDN for global distribution
- Configure appropriate cache headers
- Use S3 Transfer Acceleration for faster uploads

### Cost Optimization
- Set up S3 lifecycle policies to move old files to cheaper storage classes
- Monitor usage with AWS Cost Explorer
- Consider S3 Intelligent Tiering

## 8. Folder Structure

The application creates this folder structure in your S3 bucket:

```
your-bucket-name/
  manga-website/
    avatars/
      user-1-timestamp-small.webp
      user-1-timestamp-medium.webp
      user-1-timestamp-large.webp
      user-1-timestamp-original.webp
      user-2-timestamp-small.webp
      ...
```

## 9. Troubleshooting

### Common Issues:

1. **Access Denied**: Check IAM permissions and bucket policy
2. **CORS Errors**: Verify CORS configuration on S3 bucket
3. **Upload Fails**: Check AWS credentials and region settings
4. **Images Not Loading**: Verify bucket policy allows public read access

### Debug Mode:
Check storage health with:
```bash
curl http://localhost:3000/api/storage/health
```

## 10. Cost Estimation

AWS S3 pricing (approximate):
- Storage: $0.023 per GB per month
- PUT requests: $0.0005 per 1,000 requests
- GET requests: $0.0004 per 10,000 requests
- Data transfer: First 1 GB free, then $0.09 per GB

For a small to medium manga website, monthly costs should be under $10-20.
