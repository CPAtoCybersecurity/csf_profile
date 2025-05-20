// This script provides utility functions for artifact management
import Papa from 'papaparse';

// Extract artifacts from profile data
export const extractArtifactsFromProfile = (profileData) => {
  if (!profileData || !Array.isArray(profileData)) {
    console.log('No profile data provided');
    return [];
  }

  const artifactMap = new Map();
  
  // Extract artifact names from profile data
  profileData.forEach(row => {
    if (row["Artifact Name"]) {
      const artifactNames = row["Artifact Name"].split(',').map(name => name.trim());
      
      artifactNames.forEach(artifactName => {
        if (!artifactMap.has(artifactName)) {
          // Create a new artifact
          const newArtifact = {
            id: Date.now() + Math.floor(Math.random() * 1000) + artifactMap.size,
            artifactId: `A${artifactMap.size + 1}`,
            name: artifactName,
            description: `Imported from CSV on ${new Date().toLocaleDateString()}`,
            link: '',
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
  
  // Create a map of artifact names to their objects for easy lookup
  const artifactMap = new Map();
  existingArtifacts.forEach(artifact => {
    artifactMap.set(artifact.name, artifact);
  });
  
  // Process CSV data to update artifacts
  csvData.forEach(row => {
    if (row["Linked Artifacts"]) {
      const artifactNames = row["Linked Artifacts"].split(';').map(name => name.trim()).filter(Boolean);
      
      artifactNames.forEach(artifactName => {
        if (!artifactMap.has(artifactName)) {
          // Create a new artifact
          const newArtifact = {
            id: Date.now() + Math.floor(Math.random() * 1000) + artifactMap.size,
            artifactId: `A${artifactMap.size + 1}`,
            name: artifactName,
            description: `Imported from CSV on ${new Date().toLocaleDateString()}`,
            link: '',
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
  
  return updatedArtifacts;
};
