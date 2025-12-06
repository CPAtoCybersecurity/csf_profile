// This script provides utility functions for artifact management
import Papa from 'papaparse';

// Extract artifacts from profile data
export const extractArtifactsFromProfile = (profileData) => {
  if (!profileData || !Array.isArray(profileData)) {
    console.log('No profile data provided');
    return [];
  }

  // Get existing main data from localStorage to preserve Owner and Stakeholder(s)
  const storedMainData = localStorage.getItem('mainData');
  let mainData = storedMainData ? JSON.parse(storedMainData) : [];
  
  // Create a map of IDs to their Owner and Stakeholder(s) for easy lookup
  const userDataMap = new Map();
  mainData.forEach(item => {
    userDataMap.set(item.ID, {
      ownerId: item.ownerId,
      stakeholderIds: item.stakeholderIds
    });
  });

  const artifactMap = new Map();
  
  // Extract artifact names from profile data
  profileData.forEach(row => {
    // Preserve Owner and Stakeholder(s) data
    if (row.ID) {
      // Check if this ID already exists in mainData
      const existingItemIndex = mainData.findIndex(item => item.ID === row.ID);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        mainData[existingItemIndex] = {
          ...mainData[existingItemIndex],
          ownerId: row.ownerId || mainData[existingItemIndex].ownerId,
          stakeholderIds: row.stakeholderIds || mainData[existingItemIndex].stakeholderIds
        };
      } else {
        // This is a new row, add it to mainData
        mainData.push({
          ...row,
          ownerId: row.ownerId || null,
          stakeholderIds: row.stakeholderIds || []
        });
      }
    }
    
    if (row["Artifact Name"]) {
      const artifactNames = row["Artifact Name"].split(/[,;]/).map(name => name.trim()).filter(Boolean);
      
      artifactNames.forEach(artifactName => {
        if (!artifactMap.has(artifactName)) {
          // Create a new artifact
          const newArtifact = {
            id: Date.now() + Math.floor(Math.random() * 1000) + artifactMap.size,
            artifactId: `A${artifactMap.size + 1}`,
            name: artifactName,
            description: `Imported from CSV on ${new Date().toLocaleDateString()}`,
            link: row["Linked Artifact URL"] || '',
            linkedSubcategoryIds: [row.ID]
          };
          
          artifactMap.set(artifactName, newArtifact);
        } else {
          // Update existing artifact
          const artifact = artifactMap.get(artifactName);
          if (!artifact.linkedSubcategoryIds.includes(row.ID)) {
            artifact.linkedSubcategoryIds.push(row.ID);
          }
        }
      });
    }
  });
  
  // Save updated mainData to localStorage
  localStorage.setItem('mainData', JSON.stringify(mainData));
  
  // Dispatch event to notify other components about the update
  window.dispatchEvent(new Event('mainDataUpdate'));
  
  return Array.from(artifactMap.values());
};

// Process imported CSV data to update artifacts
export const processImportedCSV = (csvData) => {
  if (!csvData || !Array.isArray(csvData)) {
    console.log('No CSV data provided');
    return [];
  }
  
  // Get existing artifacts from localStorage
  const storedArtifacts = localStorage.getItem('artifacts');
  let existingArtifacts = storedArtifacts ? JSON.parse(storedArtifacts) : [];
  
  // Get existing main data from localStorage to preserve Owner and Stakeholder(s)
  const storedMainData = localStorage.getItem('mainData');
  let mainData = storedMainData ? JSON.parse(storedMainData) : [];
  
  // Create a map of IDs to their Owner and Stakeholder(s) for easy lookup
  const userDataMap = new Map();
  mainData.forEach(item => {
    userDataMap.set(item.ID, {
      ownerId: item.ownerId,
      stakeholderIds: item.stakeholderIds
    });
  });
  
  // Create a map of artifact names to their objects for easy lookup
  const artifactMap = new Map();
  existingArtifacts.forEach(artifact => {
    artifactMap.set(artifact.name, artifact);
  });
  
  // Process CSV data to update artifacts
  csvData.forEach(row => {
    // Preserve Owner and Stakeholder(s) data
    if (row.ID) {
      // Check if this ID already exists in mainData
      const existingItemIndex = mainData.findIndex(item => item.ID === row.ID);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        mainData[existingItemIndex] = {
          ...mainData[existingItemIndex],
          ownerId: row.ownerId || mainData[existingItemIndex].ownerId,
          stakeholderIds: row.stakeholderIds || mainData[existingItemIndex].stakeholderIds
        };
      } else {
        // This is a new row, add it to mainData
        mainData.push({
          ...row,
          ownerId: row.ownerId || null,
          stakeholderIds: row.stakeholderIds || []
        });
      }
    }
    
    // Check for "Artifact Name" field first (primary field)
    if (row["Artifact Name"]) {
      const artifactNames = row["Artifact Name"].split(/[,;]/).map(name => name.trim()).filter(Boolean);
      
      artifactNames.forEach(artifactName => {
        if (!artifactMap.has(artifactName)) {
          // Create a new artifact
          const newArtifact = {
            id: Date.now() + Math.floor(Math.random() * 1000) + artifactMap.size,
            artifactId: `A${artifactMap.size + 1}`,
            name: artifactName,
            description: `Imported from CSV on ${new Date().toLocaleDateString()}`,
            link: row["Linked Artifact URL"] || '',
            linkedSubcategoryIds: [row.ID]
          };
          
          artifactMap.set(artifactName, newArtifact);
        } else {
          // Update existing artifact
          const artifact = artifactMap.get(artifactName);
          if (!artifact.linkedSubcategoryIds.includes(row.ID)) {
            artifact.linkedSubcategoryIds.push(row.ID);
          }
        }
      });
    }
    // Also check for "Linked Artifacts" field (alternative field)
    else if (row["Linked Artifacts"]) {
      const artifactNames = row["Linked Artifacts"].split(';').map(name => name.trim()).filter(Boolean);
      
      artifactNames.forEach(artifactName => {
        if (!artifactMap.has(artifactName)) {
          // Create a new artifact
          const newArtifact = {
            id: Date.now() + Math.floor(Math.random() * 1000) + artifactMap.size,
            artifactId: `A${artifactMap.size + 1}`,
            name: artifactName,
            description: `Imported from CSV on ${new Date().toLocaleDateString()}`,
            link: row["Linked Artifact URL"] || '',
            linkedSubcategoryIds: [row.ID]
          };
          
          artifactMap.set(artifactName, newArtifact);
        } else {
          // Update existing artifact
          const artifact = artifactMap.get(artifactName);
          if (!artifact.linkedSubcategoryIds.includes(row.ID)) {
            artifact.linkedSubcategoryIds.push(row.ID);
          }
        }
      });
    }
  });
  
  // Convert map back to array
  const updatedArtifacts = Array.from(artifactMap.values());
  
  // Save updated artifacts to localStorage
  localStorage.setItem('artifacts', JSON.stringify(updatedArtifacts));
  
  // Save updated mainData to localStorage
  localStorage.setItem('mainData', JSON.stringify(mainData));
  
  // Dispatch event to notify other components about the update
  window.dispatchEvent(new Event('mainDataUpdate'));
  
  return updatedArtifacts;
};
