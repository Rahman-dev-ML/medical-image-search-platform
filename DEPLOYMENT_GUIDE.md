# 🚀 RENDER DEPLOYMENT GUIDE

## Medical Image Search Platform - Complete Render Deployment

Since you can't push to the original repository, here's how to deploy your project to Render.

### 📋 Prerequisites
1. Render account (free): https://render.com/
2. This project code on your local machine

---

## 🔧 OPTION 1: Deploy from GitHub (Recommended)

### Step 1: Create Your Own Repository
1. Go to GitHub and create a new repository called `medical-image-search`
2. Make it public (required for free Render deployment)

### Step 2: Push Your Code
```bash
# Initialize git if not already done
git init

# Add your remote repository
git remote remove origin  # Remove old remote if exists
git remote add origin https://github.com/YOUR_USERNAME/medical-image-search.git

# Add and commit all files
git add .
git commit -m "Initial deployment setup"

# Push to your repository
git push -u origin main
```

### Step 3: Deploy on Render
1. Go to https://render.com/dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Fill in the settings:

**Basic Settings:**
- **Name**: `medical-image-search`
- **Branch**: `main`
- **Root Directory**: Leave empty (we'll deploy both services)

**Build & Deploy:**
- **Build Command**: 
```bash
cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && python manage.py seed_data --count 20 && python create_production_superuser.py
```

- **Start Command**:
```bash
cd backend && gunicorn medproject.wsgi:application
```

**Environment Variables:**
Click "Add Environment Variable" for each:

| Name | Value |
|------|-------|
| `SECRET_KEY` | Click "Generate" |
| `DEBUG` | `False` |
| `PYTHON_VERSION` | `3.11.0` |
| `ADMIN_USERNAME` | `medadmin` |
| `ADMIN_EMAIL` | `admin@medicalimagesearch.com` |
| `ADMIN_PASSWORD` | Click "Generate" ⚠️ **SAVE THIS!** |
| `ALLOWED_HOSTS` | `medical-image-search.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `*` |

---

## 🔧 OPTION 2: Manual Upload (If no GitHub access)

### Step 1: Prepare Files
1. Create a ZIP file of your entire project
2. Upload to a file sharing service (Google Drive, Dropbox, etc.)

### Step 2: Deploy Backend First
1. Go to Render Dashboard
2. Click "New" → "Web Service"
3. Choose "Deploy from Git repository"
4. Manually upload or connect

---

## 🎯 After Deployment

### Access Points:
- **Backend API**: `https://medical-image-search.onrender.com/api/`
- **Admin Panel**: `https://medical-image-search.onrender.com/admin/`
- **Frontend**: Deploy separately or use backend's static files

### Admin Credentials:
- **Username**: `medadmin`
- **Password**: [The generated password from environment variables]

### Test Endpoints:
1. **API Health**: `GET /api/xrays/`
2. **Admin Panel**: `/admin/`
3. **Sample Data**: 20 X-ray records should be pre-loaded

---

## 🔍 Deployment Features

✅ **Django Backend with API**
- REST API for X-ray management
- Admin panel for data management
- PostgreSQL database (free tier)
- 20 sample X-ray records

✅ **Security Features**
- Environment-based configuration
- Secure admin credentials
- CORS protection
- Static file serving

✅ **Data Management**
- CRUD operations for X-rays
- Search functionality
- File upload support
- Database migrations

---

## 🛠 Troubleshooting

### Common Issues:

1. **Build Fails**: Check Python version in environment variables
2. **Database Issues**: Ensure migrations run in build command
3. **Static Files**: Verify collectstatic runs successfully
4. **Admin Access**: Use generated password from environment variables

### Logs:
- Check Render dashboard logs for deployment issues
- Monitor application logs for runtime errors

---

## 📱 Frontend Deployment (Optional)

If you want a separate frontend:

1. Create another Render service
2. **Environment**: `Node`
3. **Root Directory**: `frontend`
4. **Build Command**: `npm ci && npm run build`
5. **Start Command**: `npx serve -s build -l 10000`
6. **Environment Variables**:
   - `REACT_APP_API_URL`: `https://medical-image-search.onrender.com`

---

## 🎉 Success Checklist

- [ ] Backend deployed successfully
- [ ] Admin panel accessible
- [ ] API endpoints responding
- [ ] Sample data loaded (20 X-rays)
- [ ] Admin login working
- [ ] Environment variables secured

**Your medical image search platform is now live!** 🏥✨

---

## 📞 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check admin panel access

Happy deploying! 🚀 