# S3-Compatible Storage Providers Setup

This guide covers setup for various S3-compatible storage providers as alternatives to AWS S3.

## Supported Providers

### 1. Wasabi Hot Cloud Storage
**Pros:** 80% cheaper than AWS S3, no egress fees, fast performance
**Cons:** Limited regions, fewer features than AWS

### 2. Backblaze B2
**Pros:** Very low cost, simple pricing, good for backups
**Cons:** Slower than AWS S3, limited regions

### 3. DigitalOcean Spaces
**Pros:** Simple pricing, good integration with DO services
**Cons:** Limited to DO regions

### 4. Cloudflare R2
**Pros:** Zero egress fees, global network, competitive pricing
**Cons:** Newer service, fewer features

---

## 1. Wasabi Setup

### Step 1: Create Wasabi Account
1. Go to [Wasabi](https://wasabi.com/) and create an account
2. Create a new bucket in your preferred region
3. Note the region endpoint (e.g., `s3.wasabisys.com` for US East 1)

### Step 2: Generate Access Keys
1. Go to Account → Access Keys
2. Create a new access key pair
3. Save the Access Key ID and Secret Access Key

### Step 3: Environment Configuration
```bash
STORAGE_PROVIDER="s3"
AWS_ACCESS_KEY_ID="your-wasabi-access-key"
AWS_SECRET_ACCESS_KEY="your-wasabi-secret-key"
AWS_REGION="us-east-1"  # Use appropriate region
AWS_S3_BUCKET="your-wasabi-bucket"
S3_ENDPOINT="https://s3.wasabisys.com"
S3_FORCE_PATH_STYLE="false"
```

### Wasabi Regions:
- US East 1: `https://s3.wasabisys.com`
- US East 2: `https://s3.us-east-2.wasabisys.com`
- US West 1: `https://s3.us-west-1.wasabisys.com`
- EU Central 1: `https://s3.eu-central-1.wasabisys.com`

---

## 2. Backblaze B2 Setup

### Step 1: Create B2 Account
1. Go to [Backblaze B2](https://www.backblaze.com/b2/) and create an account
2. Create a new bucket (make it public for avatar access)
3. Note your bucket name and region

### Step 2: Generate Application Keys
1. Go to App Keys → Create a New App Key
2. Choose "Read and Write" permissions
3. Save the keyID and applicationKey

### Step 3: Environment Configuration
```bash
STORAGE_PROVIDER="s3"
AWS_ACCESS_KEY_ID="your-b2-key-id"
AWS_SECRET_ACCESS_KEY="your-b2-application-key"
AWS_REGION="us-west-004"  # Use your B2 region
AWS_S3_BUCKET="your-b2-bucket"
S3_ENDPOINT="https://s3.us-west-004.backblazeb2.com"
S3_FORCE_PATH_STYLE="true"
```

### B2 S3-Compatible Endpoints:
- US West: `https://s3.us-west-004.backblazeb2.com`
- EU Central: `https://s3.eu-central-003.backblazeb2.com`

---

## 3. DigitalOcean Spaces Setup

### Step 1: Create DO Account
1. Go to [DigitalOcean](https://www.digitalocean.com/) and create an account
2. Navigate to Spaces and create a new Space
3. Choose your region and access settings

### Step 2: Generate Spaces Keys
1. Go to API → Spaces access keys
2. Generate a new key pair
3. Save the Access Key and Secret Key

### Step 3: Environment Configuration
```bash
STORAGE_PROVIDER="s3"
AWS_ACCESS_KEY_ID="your-do-access-key"
AWS_SECRET_ACCESS_KEY="your-do-secret-key"
AWS_REGION="nyc3"  # Use your DO region
AWS_S3_BUCKET="your-space-name"
S3_ENDPOINT="https://nyc3.digitaloceanspaces.com"
S3_FORCE_PATH_STYLE="false"

# Optional: Use DO Spaces CDN
AWS_CLOUDFRONT_URL="https://your-space-name.nyc3.cdn.digitaloceanspaces.com"
```

### DO Spaces Regions:
- New York 3: `https://nyc3.digitaloceanspaces.com`
- San Francisco 3: `https://sfo3.digitaloceanspaces.com`
- Amsterdam 3: `https://ams3.digitaloceanspaces.com`
- Singapore 1: `https://sgp1.digitaloceanspaces.com`

---

## 4. Cloudflare R2 Setup

### Step 1: Create Cloudflare Account
1. Go to [Cloudflare](https://www.cloudflare.com/) and create an account
2. Navigate to R2 Object Storage
3. Create a new R2 bucket

### Step 2: Generate R2 API Tokens
1. Go to R2 → Manage R2 API tokens
2. Create a new API token with R2 permissions
3. Save the Access Key ID and Secret Access Key

### Step 3: Environment Configuration
```bash
STORAGE_PROVIDER="s3"
AWS_ACCESS_KEY_ID="your-r2-access-key"
AWS_SECRET_ACCESS_KEY="your-r2-secret-key"
AWS_REGION="auto"
AWS_S3_BUCKET="your-r2-bucket"
S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
S3_FORCE_PATH_STYLE="true"

# Optional: Use R2 custom domain
AWS_CLOUDFRONT_URL="https://your-custom-domain.com"
```

---

## Cost Comparison (Approximate)

| Provider | Storage (per GB/month) | Egress (per GB) | Notes |
|----------|----------------------|-----------------|-------|
| AWS S3 | $0.023 | $0.09 | Industry standard |
| Wasabi | $0.0059 | Free | 80% cheaper than AWS |
| Backblaze B2 | $0.005 | $0.01 | Very low cost |
| DigitalOcean | $0.02 | $0.01 | Simple pricing |
| Cloudflare R2 | $0.015 | Free | Zero egress fees |

---

## CORS Configuration

For all providers, you'll need to configure CORS to allow uploads from your domain:

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

---

## Testing Your Setup

1. Set your environment variables
2. Start your development server: `pnpm dev`
3. Check storage health: `curl http://localhost:3000/api/storage/health`
4. Navigate to `/profile/settings` and try uploading an avatar
5. Verify the file appears in your storage provider's dashboard

---

## Troubleshooting

### Common Issues:

1. **Access Denied**: Check your access keys and bucket permissions
2. **Endpoint Not Found**: Verify the S3_ENDPOINT URL for your provider
3. **CORS Errors**: Configure CORS settings in your storage provider
4. **Path Style Issues**: Try toggling `S3_FORCE_PATH_STYLE` between true/false

### Provider-Specific Notes:

- **Wasabi**: Requires virtual hosted-style URLs (`S3_FORCE_PATH_STYLE="false"`)
- **Backblaze B2**: Requires path-style URLs (`S3_FORCE_PATH_STYLE="true"`)
- **DigitalOcean**: Works with both styles, virtual hosted preferred
- **Cloudflare R2**: Requires path-style URLs (`S3_FORCE_PATH_STYLE="true"`)

---

## Migration Between Providers

To migrate between providers:

1. Update environment variables
2. Restart your application
3. New uploads will use the new provider
4. Old files remain accessible at their original URLs
5. Optionally migrate existing files using a script
