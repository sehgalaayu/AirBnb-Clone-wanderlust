# Deployment Guide for Render

## Environment Variables

Set these environment variables in your Render dashboard:

### Required Variables:
- `MONGO_URL`: Your MongoDB connection string
- `SESSION_SECRET`: A secure random string for session encryption
- `JWT_SECRET`: A secure random string for JWT tokens

### Optional Variables:
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

## MongoDB Setup

1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Replace `<username>`, `<password>`, and `<cluster>` with your actual values
4. Add it as `MONGO_URL` environment variable

Example connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/wanderlust?retryWrites=true&w=majority
```

## Render Deployment Steps

1. **Connect your GitHub repository**
2. **Configure the service:**
   - **Name**: wanderlust-app
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: Leave empty (if app is in root)

3. **Add Environment Variables:**
   - Go to Environment tab
   - Add all required variables listed above

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for build to complete

## Security Notes

- Use strong, unique secrets for `SESSION_SECRET` and `JWT_SECRET`
- Never commit your `.env` file to version control
- Use HTTPS in production (Render handles this automatically)

## Troubleshooting

- Check Render logs if deployment fails
- Ensure all environment variables are set correctly
- Verify MongoDB connection string is valid
- Make sure your MongoDB cluster allows connections from Render's IP addresses 