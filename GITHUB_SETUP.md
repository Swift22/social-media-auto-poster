# GitHub Repository Setup Guide

Your local Git repository is ready! Now let's push it to GitHub so you can get URLs for your Terms of Service and Privacy Policy.

---

## 📋 Step-by-Step Instructions

### 1. Create a GitHub Repository

1. **Go to GitHub**
   - Visit: https://github.com/new
   - Or go to https://github.com and click the "+" icon → "New repository"

2. **Fill in Repository Details**
   - **Repository name**: `social-media-auto-poster` (or your preferred name)
   - **Description**: `Desktop app for posting short videos to multiple social media platforms`
   - **Visibility**: 
     - ✅ **Public** (recommended - allows GitHub Pages for Terms/Privacy)
     - ⚠️ Private (you can still use it, but Pages might require paid plan)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

### 2. Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/social-media-auto-poster.git

# Push your code
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

Or run these commands in your terminal:

```powershell
cd "c:\Users\shphw\Desktop\auto short poster"
git remote add origin https://github.com/YOUR_USERNAME/social-media-auto-poster.git
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages (for Terms & Privacy URLs)

1. **Go to Repository Settings**
   - In your GitHub repository, click "Settings"
   - Scroll down to "Pages" in the left sidebar

2. **Configure GitHub Pages**
   - Source: Select "Deploy from a branch"
   - Branch: Select "main" and "/ (root)"
   - Click "Save"

3. **Wait for Deployment**
   - GitHub will deploy your site (takes 1-2 minutes)
   - You'll see a message: "Your site is live at https://YOUR_USERNAME.github.io/social-media-auto-poster/"

### 4. Get Your URLs for TikTok

Once GitHub Pages is live, you'll have these URLs:

**Terms of Service URL:**
```
https://YOUR_USERNAME.github.io/social-media-auto-poster/TERMS_OF_SERVICE
```

**Privacy Policy URL:**
```
https://YOUR_USERNAME.github.io/social-media-auto-poster/PRIVACY_POLICY
```

**Replace `YOUR_USERNAME` with your GitHub username!**

---

## 🎯 Use These URLs in TikTok App Registration

When creating your TikTok app, use:

- **Terms of Service URL**: `https://YOUR_USERNAME.github.io/social-media-auto-poster/TERMS_OF_SERVICE`
- **Privacy Policy URL**: `https://YOUR_USERNAME.github.io/social-media-auto-poster/PRIVACY_POLICY`
- **Web/Desktop URL**: `https://YOUR_USERNAME.github.io/social-media-auto-poster/`

---

## ✅ What's Protected by .gitignore

Your `.gitignore` file is configured to protect:

✅ **Environment variables** (`.env` file with your API secrets)
✅ **Node modules** (dependencies)
✅ **Build outputs** (compiled files)
✅ **Credentials** (any JSON credential files)
✅ **Personal files** (editor configs, OS files)

**Your API credentials are SAFE and will NOT be uploaded to GitHub!**

---

## 🔒 Security Checklist

Before pushing to GitHub, verify:

- [ ] `.env` file is in `.gitignore` ✅ (Already done!)
- [ ] No API credentials in any committed files ✅ (Already done!)
- [ ] `.env.example` has placeholder values only ✅ (Already done!)
- [ ] README doesn't contain real credentials ✅ (Already done!)

---

## 📝 Quick Commands Reference

```powershell
# Check what will be committed (should NOT show .env)
git status

# View your remote
git remote -v

# Push changes after making updates
git add .
git commit -m "Your commit message"
git push

# Check if .env is ignored (should show "Ignored files:")
git status --ignored
```

---

## 🎉 After Pushing to GitHub

1. **Verify your repository**: Visit `https://github.com/YOUR_USERNAME/social-media-auto-poster`
2. **Check GitHub Pages**: Visit `https://YOUR_USERNAME.github.io/social-media-auto-poster/`
3. **Test the URLs**: 
   - Open `https://YOUR_USERNAME.github.io/social-media-auto-poster/TERMS_OF_SERVICE`
   - Open `https://YOUR_USERNAME.github.io/social-media-auto-poster/PRIVACY_POLICY`
4. **Use these URLs in TikTok app registration**

---

## 💡 Tips

- **Keep your repository public** if you want free GitHub Pages
- **Don't commit the `.env` file** - it's already in `.gitignore`
- **Update the README** with your own information if you want
- **Star your own repo** to find it easily later 😊

---

## 🆘 Troubleshooting

### "Permission denied" when pushing
- Make sure you're logged into GitHub
- Use a Personal Access Token instead of password
- Or set up SSH keys

### GitHub Pages not working
- Wait 2-3 minutes after enabling
- Check that the branch is "main" not "master"
- Verify the repository is public

### URLs return 404
- Make sure GitHub Pages is enabled
- Check that the files are in the root directory
- Wait a few minutes for deployment

---

**Ready to push?** Follow the steps above and you'll have your Terms of Service and Privacy Policy URLs ready for TikTok! 🚀
