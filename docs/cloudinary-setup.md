# Storage Setup Guide

This guide will help you set up storage for avatar upload functionality in the manga website. You can choose between **Cloudinary** (easier setup) or **AWS S3** (more control and potentially lower costs).

## Storage Provider Options

### Option 1: Cloudinary (Recommended for beginners)

- ✅ Easy setup and configuration
- ✅ Built-in image transformations
- ✅ Free tier: 25GB storage, 25GB bandwidth
- ✅ Automatic optimization and CDN
- ❌ Limited customization
- ❌ Vendor lock-in

### Option 2: AWS S3 (Recommended for production)

- ✅ More control and flexibility
- ✅ Lower costs at scale
- ✅ Integration with other AWS services
- ✅ CloudFront CDN integration
- ❌ More complex setup
- ❌ Requires AWS knowledge

---

# Cloudinary Setup (Option 1)

## 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. After registration, you'll be taken to your dashboard
3. Note down your **Cloud Name**, **API Key**, and **API Secret**

## 2. Configure Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Choose Cloudinary as storage provider
STORAGE_PROVIDER="cloudinary"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

Replace the placeholder values with your actual Cloudinary credentials:

- `your-cloud-name`: Found in your Cloudinary dashboard
- `your-api-key`: Found in your Cloudinary dashboard
- `your-api-secret`: Found in your Cloudinary dashboard (keep this secret!)

## 3. Cloudinary Dashboard Settings

### Upload Presets (Optional)

You can create upload presets in your Cloudinary dashboard for more control:

1. Go to Settings → Upload
2. Click "Add upload preset"
3. Configure transformations and restrictions
4. Note the preset name for use in your code

### Folder Structure

The application automatically creates avatars in the folder structure:

```
manga-website/
  avatars/
    user-1-timestamp.webp
    user-2-timestamp.webp
    ...
```

## 4. Security Considerations

- Never expose your `CLOUDINARY_API_SECRET` in client-side code
- The `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is safe to expose as it's public
- Consider setting up signed uploads for production environments

## 5. Testing the Setup

1. Start your development server: `pnpm dev`
2. Navigate to `/profile/settings`
3. Try uploading an avatar image
4. Check your Cloudinary dashboard to see the uploaded image

## 6. Production Deployment

When deploying to production:

1. Add the environment variables to your hosting platform
2. Ensure your Cloudinary account has sufficient storage/bandwidth
3. Consider upgrading to a paid plan for production usage

## Troubleshooting

### Common Issues:

1. **"Invalid credentials" error**: Double-check your API key and secret
2. **Upload fails**: Verify your cloud name is correct
3. **Images not displaying**: Check the public URL format in Cloudinary

### Debug Mode:

Enable Cloudinary debug mode by adding to your environment:

```bash
CLOUDINARY_DEBUG=true
```

## Free Tier Limits

Cloudinary free tier includes:

- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 transformations per month

This should be sufficient for development and small production deployments.

---

# AWS S3 Setup (Option 2)

For detailed AWS S3 setup instructions, see [AWS S3 Setup Guide](./aws-s3-setup.md).

## Quick Setup Summary:

1. **Create AWS Account and S3 Bucket**
2. **Create IAM User with S3 permissions**
3. **Configure Environment Variables:**

   ```bash
   # Choose S3 as storage provider
   STORAGE_PROVIDER="s3"

   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID="your-access-key-id"
   AWS_SECRET_ACCESS_KEY="your-secret-access-key"
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET="your-bucket-name"
   AWS_CLOUDFRONT_URL="https://your-cloudfront-domain.cloudfront.net"
   ```

4. **Test the setup:** Navigate to `/profile/settings` and try uploading an avatar

---

# Switching Between Providers

You can easily switch between Cloudinary and S3 by changing the `STORAGE_PROVIDER` environment variable:

```bash
# Use Cloudinary
STORAGE_PROVIDER="cloudinary"

# Use AWS S3
STORAGE_PROVIDER="s3"
```

The application will automatically detect and use the appropriate provider based on your configuration.

## Health Check

You can check your storage configuration at any time:

```bash
curl http://localhost:3000/api/storage/health
```

This will show you which provider is active and whether it's properly configured.
