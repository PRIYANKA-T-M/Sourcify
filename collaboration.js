class CollaborationManager {
  constructor() {
    // Initialize with current user and existing collaborations
    this.currentUser = this.getCurrentUser();
    this.collaborations = [];
    this.nearbyVendors = [];
    this.selectedVendors = [];

    // Initialize event listeners
    this.initEventListeners();
    
    // Load any existing collaborations
    this.loadActiveCollaborations();
    
    // Load nearby vendors when manager initializes
    this.loadVendors();
  }

  
    
initEventListeners() {
    // Find Collaboration button
    document.getElementById('joinCollaboration')?.addEventListener('click', () => this.initiateCollaboration());
    
    // Delegated events for active collaborations container
    document.getElementById('activeCollaborations')?.addEventListener('click', (e) => {
      // View Details button
      if (e.target.classList.contains('btn-view-collab')) {
        const collabId = e.target.closest('.collaboration-item').dataset.id;
        this.viewCollaborationDetails(collabId);
      }
      // Accept button
      else if (e.target.classList.contains('btn-accept')) {
        const collabId = e.target.closest('.collaboration-item').dataset.id;
        this.acceptCollaboration(collabId);
      }
      // Decline button
      else if (e.target.classList.contains('btn-decline')) {
        const collabId = e.target.closest('.collaboration-item').dataset.id;
        this.declineCollaboration(collabId);
      }
    });
    
    // Vendor modal interactions (if modal exists)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('viewDetailsBtn')) {
        const vendorId = e.target.closest('.vendor-card').dataset.id;
        this.showVendorDetails(vendorId);
      }
      
      if (e.target.id === 'sendInviteBtn') {
        const vendorId = document.querySelector('.vendor-card[data-id]').dataset.id;
        this.sendCollaborationInvite(vendorId);
      }
      
      if (e.target.id === 'closeModalBtn') {
        document.getElementById('vendorModal').style.display = 'none';
      }
    });
    
    // Additional modal close handler (click outside modal)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });
  }

  // Load nearby vendors (using geolocation)
  loadVendors() {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      
      // In a real app, this would be an API call to your backend
      // Using mock data for demonstration
      console.log(`Loading vendors near ${latitude},${longitude}`);
      
      // Mock response - in real app this would come from your database
      const mockVendors = [
        { 
          id: 'v2', 
          name: 'Chaat Corner', 
          distance: '0.15 km away',
          description: 'Specializing in authentic street food since 2010',
          products: ['Fresh Vegetables', 'Spices'],
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop'
        },
        { 
          id: 'v3', 
          name: 'Samosa King', 
          distance: '0.25 km away',
          description: 'Best samosas in town with secret family recipe',
          products: ['Potatoes', 'Flour'],
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop'
        }
      ];
      
      const vendorList = document.getElementById('vendorList');
      if (vendorList) {
        vendorList.innerHTML = mockVendors.map(vendor => `
          <div class="vendor-card" data-id="${vendor.id}">
            <div class="vendor-basic-info">
              <h3>${vendor.name}</h3>
              <p>${vendor.distance}</p>
              <p>Specializes in: ${vendor.products.join(', ')}</p>
            </div>
            <button class="viewDetailsBtn">View Details</button>
          </div>
        `).join('');
      }
      
      // Also store for use in other methods
      this.nearbyVendors = mockVendors;
    }, (error) => {
      console.error('Error getting location:', error);
      showNotification('Could not determine your location. Please enable location services.', 'error');
    });
  }

  // Show detailed vendor view
  showVendorDetails(vendorId) {
    const vendor = this.nearbyVendors.find(v => v.id === vendorId);
    if (!vendor) return;
    
    const modal = document.getElementById('vendorModal') || this.createVendorModal();
    
    // Populate modal with vendor details
    document.getElementById('vendorName').textContent = vendor.name;
    document.getElementById('vendorDescription').textContent = vendor.description;
    document.getElementById('vendorDistance').textContent = vendor.distance;
    document.getElementById('vendorProducts').innerHTML = vendor.products.map(p => `<li>${p}</li>`).join('');
    
    // Update invite button state
    const inviteBtn = document.getElementById('sendInviteBtn');
    inviteBtn.disabled = this.collaborations.some(c => 
      c.vendors.includes(vendorId) && c.status === 'pending'
    );
    inviteBtn.dataset.vendorId = vendorId;
    
    modal.style.display = 'block';
  }

  // Create vendor modal if it doesn't exist
  createVendorModal() {
    const modal = document.createElement('div');
    modal.id = 'vendorModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2 id="vendorName">Vendor Name</h2>
        <p><strong>Distance:</strong> <span id="vendorDistance"></span></p>
        <div class="vendor-description">
          <h3>About</h3>
          <p id="vendorDescription"></p>
        </div>
        <div class="vendor-products">
          <h3>Products</h3>
          <ul id="vendorProducts"></ul>
        </div>
        <div class="modal-actions">
          <button id="sendInviteBtn" class="btn btn-primary">Send Collaboration Invite</button>
          <button id="closeModalBtn" class="btn btn-secondary">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  // Send collaboration invite to a vendor
  sendCollaborationInvite(vendorId) {
    const vendor = this.nearbyVendors.find(v => v.id === vendorId);
    if (!vendor) return;
    
    try {
      showLoading(document.getElementById('sendInviteBtn'), 'Sending invite...');
      
      // In a real app, this would be an API call to your backend
      console.log(`Sending collaboration invite to ${vendor.name} (${vendorId})`);
      
      // Create a new collaboration
      const newCollaboration = {
        id: `collab-${Date.now()}`,
        initiator: this.currentUser.id,
        vendors: [this.currentUser.id, vendorId],
        status: 'pending',
        created: new Date().toISOString(),
        items: [],
        accepted: {
          [this.currentUser.id]: true
        },
        contactInfoShared: false
      };
      
      // Add to local state
      this.collaborations.push(newCollaboration);
      this.updateActiveCollaborations();
      
      // Close modal and show success
      document.getElementById('vendorModal').style.display = 'none';
      showNotification(`Invite sent to ${vendor.name}!`, 'success');
      
      hideLoading(document.getElementById('sendInviteBtn'));
    } catch (error) {
      console.error('Error sending invite:', error);
      showNotification('Failed to send invite. Please try again.', 'error');
      hideLoading(document.getElementById('sendInviteBtn'));
    }
  }

  /* REST OF THE ORIGINAL CollaborationManager CLASS METHODS REMAIN THE SAME */
  // (All your existing methods like initiateCollaboration, findNearbyVendors, 
  // showVendorSelectionModal, createCollaboration, loadActiveCollaborations,
  // updateActiveCollaborations, acceptCollaboration, declineCollaboration,
  // viewCollaborationDetails, placeGroupOrder, and helper methods)

  // ... (Keep all the original methods exactly as they were)
}

// *** Utility functions ***
function showLoading(button, message) {
  if (!button) return;
  button.disabled = true;
  button.dataset.originalText = button.textContent;
  button.innerHTML = message + ' <i class="fas fa-spinner fa-spin"></i>';
}

function hideLoading(button) {
  if (!button) return;
  button.disabled = false;
  if (button.dataset.originalText) {
    button.innerHTML = button.dataset.originalText;
    delete button.dataset.originalText;
  }
}

function showNotification(message, type = 'info') {
  // This should be replaced with your actual notification system
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button class="close-notification">&times;</button>
  `;
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
  
  // Manual close
  notification.querySelector('.close-notification').addEventListener('click', () => {
    notification.remove();
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CollaborationManager();
});