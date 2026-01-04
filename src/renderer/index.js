// State management
let selectedFile = null;
let authStatus = {
  facebook: false,
  tiktok: false,
  youtube: false,
  instagram: false
};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthStatus();
  setupEventListeners();
  setupOAuthCallback();
});

// Check authentication status for all platforms
async function checkAuthStatus() {
  try {
    const status = await window.api.auth.getStatus();
    authStatus = status;
    
    // Update UI for each platform
    Object.keys(status).forEach(platform => {
      updatePlatformStatus(platform, status[platform]);
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
  }
}

// Update platform connection status in UI
function updatePlatformStatus(platform, isConnected) {
  const card = document.querySelector(`[data-platform="${platform}"]`);
  const statusIndicator = document.getElementById(`${platform}-status`).querySelector('.status-indicator');
  const statusText = document.getElementById(`${platform}-status`).querySelector('.status-text');
  const connectBtn = document.getElementById(`${platform}-connect`);
  const checkbox = document.getElementById(`post-${platform}`);
  
  if (isConnected) {
    card.classList.add('connected');
    statusIndicator.classList.remove('disconnected');
    statusIndicator.classList.add('connected');
    statusText.textContent = 'Connected';
    connectBtn.textContent = 'Disconnect';
    connectBtn.classList.remove('btn-connect');
    connectBtn.classList.add('btn-disconnect');
    checkbox.disabled = false;
  } else {
    card.classList.remove('connected');
    statusIndicator.classList.remove('connected');
    statusIndicator.classList.add('disconnected');
    statusText.textContent = 'Not Connected';
    connectBtn.textContent = 'Connect';
    connectBtn.classList.remove('btn-disconnect');
    connectBtn.classList.add('btn-connect');
    checkbox.disabled = true;
    checkbox.checked = false;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Platform connection buttons
  document.getElementById('facebook-connect').addEventListener('click', () => handlePlatformAuth('facebook'));
  document.getElementById('tiktok-connect').addEventListener('click', () => handlePlatformAuth('tiktok'));
  document.getElementById('youtube-connect').addEventListener('click', () => handlePlatformAuth('youtube'));
  document.getElementById('instagram-connect').addEventListener('click', () => handlePlatformAuth('instagram'));
  
  // File selection
  document.getElementById('select-file-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });
  
  document.getElementById('file-input').addEventListener('change', handleFileSelect);
  document.getElementById('change-file-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });
  
  // Drag and drop
  const dropZone = document.getElementById('drop-zone');
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('dragleave', handleDragLeave);
  dropZone.addEventListener('drop', handleDrop);
  
  // Upload button
  document.getElementById('upload-btn').addEventListener('click', handleUpload);
}

// Handle platform authentication
async function handlePlatformAuth(platform) {
  const isConnected = authStatus[platform];
  
  if (isConnected) {
    // Disconnect
    if (confirm(`Are you sure you want to disconnect from ${platform}?`)) {
      try {
        await window.api.auth.logout(platform);
        authStatus[platform] = false;
        updatePlatformStatus(platform, false);
        showNotification(`Disconnected from ${platform}`, 'success');
      } catch (error) {
        showNotification(`Failed to disconnect from ${platform}`, 'error');
      }
    }
  } else {
    // Connect
    try {
      let result;
      switch (platform) {
        case 'facebook':
          result = await window.api.auth.loginFacebook();
          break;
        case 'tiktok':
          result = await window.api.auth.loginTikTok();
          break;
        case 'youtube':
          result = await window.api.auth.loginYouTube();
          break;
        case 'instagram':
          result = await window.api.auth.loginInstagram();
          break;
      }
      
      if (result.success) {
        showNotification(result.message, 'info');
      } else {
        showNotification(result.error || 'Authentication failed', 'error');
      }
    } catch (error) {
      showNotification(`Failed to connect to ${platform}`, 'error');
    }
  }
}

// Setup OAuth callback listener
function setupOAuthCallback() {
  window.api.auth.onOAuthCallback(async (data) => {
    console.log('OAuth callback received:', data);
    
    // Extract platform from state or URL
    const platform = data.platform || data.state?.split('_')[0];
    
    if (platform && data.code) {
      // Update auth status
      await checkAuthStatus();
      showNotification(`Successfully connected to ${platform}!`, 'success');
    }
  });
}

// File selection handlers
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    validateAndSetFile(file);
  }
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove('drag-over');
}

function handleDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  
  const file = event.dataTransfer.files[0];
  if (file) {
    validateAndSetFile(file);
  }
}

// Validate and set selected file
function validateAndSetFile(file) {
  // Validate file type
  const validTypes = ['video/mp4', 'video/quicktime'];
  if (!validTypes.includes(file.type)) {
    showNotification('Please select a valid video file (MP4 or MOV)', 'error');
    return;
  }
  
  // Validate file size (100MB)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    showNotification('File size exceeds 100MB limit', 'error');
    return;
  }
  
  selectedFile = file;
  displaySelectedFile(file);
  updateUploadButton();
}

// Display selected file
function displaySelectedFile(file) {
  document.getElementById('drop-zone').style.display = 'none';
  document.getElementById('selected-file').style.display = 'block';
  
  const fileName = document.getElementById('file-name');
  fileName.textContent = file.name;
  
  const videoPreview = document.getElementById('video-preview');
  videoPreview.src = URL.createObjectURL(file);
}

// Update upload button state
function updateUploadButton() {
  const uploadBtn = document.getElementById('upload-btn');
  const hasFile = selectedFile !== null;
  const hasSelectedPlatform = 
    document.getElementById('post-facebook').checked ||
    document.getElementById('post-tiktok').checked ||
    document.getElementById('post-youtube').checked ||
    document.getElementById('post-instagram').checked;
  
  uploadBtn.disabled = !(hasFile && hasSelectedPlatform);
}

// Add listeners to checkboxes
document.querySelectorAll('.platform-checkboxes input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', updateUploadButton);
});

// Handle video upload
async function handleUpload() {
  if (!selectedFile) {
    showNotification('Please select a video file', 'error');
    return;
  }
  
  // Get selected platforms
  const platforms = [];
  if (document.getElementById('post-facebook').checked) platforms.push('facebook');
  if (document.getElementById('post-tiktok').checked) platforms.push('tiktok');
  if (document.getElementById('post-youtube').checked) platforms.push('youtube');
  if (document.getElementById('post-instagram').checked) platforms.push('instagram');
  
  if (platforms.length === 0) {
    showNotification('Please select at least one platform', 'error');
    return;
  }
  
  // Get metadata
  const metadata = {
    title: document.getElementById('video-title').value || 'Untitled Video',
    description: document.getElementById('video-description').value,
    tags: document.getElementById('video-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
  };
  
  // Show progress section
  const progressSection = document.getElementById('upload-progress');
  progressSection.style.display = 'block';
  const progressList = document.getElementById('progress-list');
  progressList.innerHTML = '';
  
  // Create progress items for each platform
  platforms.forEach(platform => {
    const item = document.createElement('div');
    item.className = 'progress-item uploading';
    item.id = `progress-${platform}`;
    item.innerHTML = `
      <span><strong>${platform.charAt(0).toUpperCase() + platform.slice(1)}</strong>: Uploading...</span>
      <span class="progress-status">⏳</span>
    `;
    progressList.appendChild(item);
  });
  
  // Disable upload button
  document.getElementById('upload-btn').disabled = true;
  
  try {
    // Upload to platforms
    const result = await window.api.upload.video(selectedFile.path, metadata, platforms);
    
    if (result.success) {
      // Update progress for each platform
      Object.keys(result.results).forEach(platform => {
        const item = document.getElementById(`progress-${platform}`);
        const platformResult = result.results[platform];
        
        if (platformResult.success) {
          item.className = 'progress-item success';
          item.querySelector('.progress-status').textContent = '✅';
          item.querySelector('span').innerHTML = `<strong>${platform.charAt(0).toUpperCase() + platform.slice(1)}</strong>: ${platformResult.message}`;
        } else {
          item.className = 'progress-item error';
          item.querySelector('.progress-status').textContent = '❌';
          item.querySelector('span').innerHTML = `<strong>${platform.charAt(0).toUpperCase() + platform.slice(1)}</strong>: ${platformResult.error}`;
        }
      });
      
      showNotification('Upload completed!', 'success');
    } else {
      showNotification('Upload failed: ' + result.error, 'error');
    }
  } catch (error) {
    showNotification('Upload error: ' + error.message, 'error');
  } finally {
    // Re-enable upload button
    document.getElementById('upload-btn').disabled = false;
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const container = document.getElementById('notifications');
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-message">${message}</div>
      <button class="notification-close">×</button>
    </div>
  `;
  
  container.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
  
  // Manual close
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  });
}
